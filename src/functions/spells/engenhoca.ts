import CharacterSheet from '../../interfaces/CharacterSheet';
import { EngenhocaData, Spell, spellsCircles } from '../../interfaces/Spells';
import Skill, { getSkillAttr } from '../../interfaces/Skills';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import { manaExpenseByCircle } from '../../data/systems/tormenta20/magias/generalSpells';
import {
  APARATOS_BY_ID,
  APARATO_ACTIVATION_DC_ONE,
  APARATO_ACTIVATION_DC_TWO,
  Aparato,
} from '../../data/systems/tormenta20/herois-de-arton/aparatos';
import { getEffectiveAttributeModifier } from '../effectiveAttributes';
import { getActiveArmorPenalty } from '../proficiencies';
import { getClassLevel } from '../multiclass';
import { sheetHasPowerNamed } from '../powers/hasPowerNamed';
import type { SpellCastCheck } from '../../components/SpellCastDialog';

export { sanitizeEngenhoca } from './sanitizeEngenhoca';

/**
 * Engenhocas — Inventor com o poder Engenhoqueiro (Tormenta20 JdA, p. 70) e
 * aparatos de Heróis de Arton (pp. 235–236).
 *
 * Uma engenhoca é uma MAGIA da ficha marcada com `spell.engenhoca`. Regras:
 * - Fabrica magias de 1º círculo; 2º a partir do 6º nível e um círculo maior
 *   a cada quatro níveis (10º, 14º, 18º).
 * - Máximo de engenhocas = Inteligência (+3 com Manutenção Eficiente).
 * - Ativação: teste de Ofício (engenhoqueiro) contra CD 15 + custo em PM da
 *   magia, +1 por PM de aprimoramento (até Int PM), +5 por ativação anterior
 *   no mesmo dia, com penalidade de armadura. Não paga o custo base — só os
 *   aprimoramentos. Se falhar, enguiça (1 hora de conserto).
 * - O efeito usa Inteligência como atributo-chave.
 * - Aparatos: até 2 diferentes; +2 na CD de ativação com um, +5 com dois.
 */

export const ENGENHOQUEIRO_POWER = 'Engenhoqueiro';
export const ENGENHOCA_BASE_ACTIVATION_DC = 15;
export const ENGENHOCA_DAILY_REPEAT_DC = 5;

const INVENTOR_CLASS = 'Inventor';
const MANUTENCAO_EFICIENTE = 'Manutenção Eficiente';
const MANUTENCAO_EFICIENTE_BONUS = 3;
const APARATO_PERSONALIZADO = 'Aparato Personalizado';
const FORCAR_A_CALIBRAGEM = 'Forçar a Calibragem';
const CHUTES_E_PALAVROES = 'Chutes e Palavrões';
const GOBLIN_ARMOR = 'Armadura de engenhoqueiro goblin';

const CIRCLES_IN_ORDER: spellsCircles[] = [
  spellsCircles.c1,
  spellsCircles.c2,
  spellsCircles.c3,
  spellsCircles.c4,
  spellsCircles.c5,
];

export function isEngenhoca(spell: Spell): boolean {
  return !!spell.engenhoca;
}

/** A ficha fabrica engenhocas (tem o poder Engenhoqueiro). */
export function hasEngenhoqueiro(sheet: CharacterSheet): boolean {
  return sheetHasPowerNamed(sheet, ENGENHOQUEIRO_POWER);
}

/**
 * Nível de inventor. Em ficha mono-classe `getClassLevel` devolve o nível
 * total — correto aqui, porque só o Inventor tem Engenhoqueiro.
 */
export function getInventorLevel(sheet: CharacterSheet): number {
  return getClassLevel(sheet, INVENTOR_CLASS);
}

/** Maior círculo de magia que o inventor consegue transformar em engenhoca. */
export function getMaxEngenhocaCircle(inventorLevel: number): number {
  if (inventorLevel >= 18) return 5;
  if (inventorLevel >= 14) return 4;
  if (inventorLevel >= 10) return 3;
  if (inventorLevel >= 6) return 2;
  return 1;
}

export function getSpellCircleNumber(spell: Spell): number {
  return CIRCLES_IN_ORDER.indexOf(spell.spellCircle) + 1;
}

/** O círculo da magia passa do que o inventor consegue fabricar. */
export function isEngenhocaCircleAboveLimit(
  sheet: CharacterSheet,
  spell: Spell
): boolean {
  return (
    getSpellCircleNumber(spell) > getMaxEngenhocaCircle(getInventorLevel(sheet))
  );
}

function getIntelligence(sheet: CharacterSheet): number {
  return getEffectiveAttributeModifier(sheet, Atributo.INTELIGENCIA);
}

/** Máximo de engenhocas mantidas ao mesmo tempo. */
export function getEngenhocaLimit(sheet: CharacterSheet): number {
  const bonus = sheetHasPowerNamed(sheet, MANUTENCAO_EFICIENTE)
    ? MANUTENCAO_EFICIENTE_BONUS
    : 0;
  return Math.max(0, getIntelligence(sheet)) + bonus;
}

export function countEngenhocas(spells: Spell[]): number {
  return spells.filter(isEngenhoca).length;
}

/** Aparatos conhecidos acoplados à engenhoca (ids desconhecidos são ignorados). */
export function getEngenhocaAparatos(engenhoca?: EngenhocaData): Aparato[] {
  return (engenhoca?.aparatos ?? [])
    .map((id) => APARATOS_BY_ID[id])
    .filter((aparato): aparato is Aparato => !!aparato);
}

/**
 * Aumento da CD de ativação pelos aparatos: +2 com um, +5 com dois.
 * Aparato Personalizado: "o primeiro aparato de cada uma de suas engenhocas
 * não aumenta a CD" — um aparato fica +0 e dois ficam +3 (5 − 2).
 */
export function getAparatoActivationDcIncrease(
  aparatoCount: number,
  hasAparatoPersonalizado: boolean
): number {
  if (aparatoCount <= 0) return 0;
  const raw =
    aparatoCount === 1 ? APARATO_ACTIVATION_DC_ONE : APARATO_ACTIVATION_DC_TWO;
  return hasAparatoPersonalizado ? raw - APARATO_ACTIVATION_DC_ONE : raw;
}

/** Custo em PM da magia simulada (sem reduções — a regra usa o custo da magia). */
export function getSpellBasePm(spell: Spell): number {
  return spell.manaExpense ?? manaExpenseByCircle[spell.spellCircle] ?? 0;
}

/** CD de ativação sem aprimoramentos: 15 + custo da magia + aparatos. */
export function getEngenhocaActivationBaseDC(
  sheet: CharacterSheet,
  spell: Spell
): number {
  const aparatos = getEngenhocaAparatos(spell.engenhoca);
  return (
    ENGENHOCA_BASE_ACTIVATION_DC +
    getSpellBasePm(spell) +
    getAparatoActivationDcIncrease(
      aparatos.length,
      sheetHasPowerNamed(sheet, APARATO_PERSONALIZADO)
    )
  );
}

/**
 * Penalidade da armadura VESTIDA (sem escudos). Lê `equipments` como dado puro
 * — o Bag pode ter perdido os métodos de classe após serialização.
 */
function getWornArmor(
  sheet: CharacterSheet
): { nome: string; armorPenalty: number } | undefined {
  const armors = sheet.bag?.equipments?.Armadura ?? [];
  if (sheet.wornArmorId !== undefined) {
    return armors.find((armor) => armor.id === sheet.wornArmorId);
  }
  return armors.length === 1 ? armors[0] : undefined;
}

/**
 * A armadura vestida não pesa no teste de ativação: Giroscópio ("não aplica
 * sua penalidade de armadura por armadura") ou Armadura de engenhoqueiro
 * goblin ("não aplica sua penalidade em testes para ativar engenhocas").
 */
function ignoresWornArmorPenalty(sheet: CharacterSheet, spell: Spell): boolean {
  const aparatos = getEngenhocaAparatos(spell.engenhoca);
  if (aparatos.some((aparato) => aparato.ignoresArmorPenalty)) return true;
  return getWornArmor(sheet)?.nome === GOBLIN_ARMOR;
}

/** Penalidade de armadura aplicada ao teste de ativação desta engenhoca. */
export function getEngenhocaArmorPenalty(
  sheet: CharacterSheet,
  spell: Spell
): number {
  const total = getActiveArmorPenalty(sheet);
  if (!ignoresWornArmorPenalty(sheet, spell)) return total;
  const worn = Math.max(0, getWornArmor(sheet)?.armorPenalty ?? 0);
  return Math.max(0, total - worn);
}

/**
 * Bônus do teste de Ofício (engenhoqueiro) para ativar a engenhoca. Ofício
 * não está em `SkillsWithArmorPenalty`, então a penalidade ainda não está em
 * `skill.others` — subtrair aqui não duplica nada (mesmo raciocínio do Usurpar).
 */
export function getEngenhocaCheckModifier(
  sheet: CharacterSheet,
  spell: Spell
): number {
  const skill = sheet?.completeSkills?.find(
    (s) => s.name === Skill.OFICIO_EGENHOQUEIRO
  );
  const modAttr = skill?.modAttr ?? getSkillAttr(Skill.OFICIO_EGENHOQUEIRO);
  const attrValue = modAttr ? getEffectiveAttributeModifier(sheet, modAttr) : 0;
  const halfLevel = skill?.halfLevel ?? Math.floor((sheet?.nivel ?? 1) / 2);
  const training = skill?.training ?? 0;
  const others = skill?.others ?? 0;

  return (
    halfLevel +
    attrValue +
    training +
    others -
    getEngenhocaArmorPenalty(sheet, spell)
  );
}

/**
 * CD para resistir ao efeito: 10 + ½ nível + Inteligência + bônus de CD de
 * magia da ficha + aparatos (Estabilizador).
 */
export function getEngenhocaResistDC(
  sheet: CharacterSheet,
  spell: Spell,
  bonusSpellDC = 0
): number {
  const aparatoBonus = getEngenhocaAparatos(spell.engenhoca).reduce(
    (sum, aparato) => sum + (aparato.resistDcBonus ?? 0),
    0
  );
  return (
    10 +
    Math.floor((sheet.nivel ?? 1) / 2) +
    getIntelligence(sheet) +
    bonusSpellDC +
    aparatoBonus
  );
}

/**
 * Teste de ativação que o `SpellCastDialog` roda no lugar do lançamento
 * normal. `onBreak` é chamado quando o teste falha (a ficha marca a engenhoca
 * como enguiçada).
 */
export function buildEngenhocaCastCheck(
  sheet: CharacterSheet,
  spell: Spell,
  onBreak?: () => void
): SpellCastCheck {
  const aparatos = getEngenhocaAparatos(spell.engenhoca);
  const baseDC = getEngenhocaActivationBaseDC(sheet, spell);

  const toggles: NonNullable<SpellCastCheck['toggles']> = [
    {
      id: 'ativada-hoje',
      label: 'Já foi ativada hoje',
      value: ENGENHOCA_DAILY_REPEAT_DC,
      target: 'dc',
    },
    {
      id: 'ativada-hoje-2',
      label: 'Ativada 2+ vezes hoje (soma com a anterior)',
      value: ENGENHOCA_DAILY_REPEAT_DC,
      target: 'dc',
    },
  ];
  aparatos.forEach((aparato) => {
    if (aparato.activationDcToggle) {
      toggles.push({
        id: `aparato-${aparato.id}`,
        label: aparato.activationDcToggle.label,
        value: aparato.activationDcToggle.value,
        target: 'dc',
      });
    }
  });
  if (sheetHasPowerNamed(sheet, FORCAR_A_CALIBRAGEM)) {
    toggles.push({
      id: 'forcar-calibragem',
      label: 'Forçar a Calibragem (+2 na CD para resistir)',
      value: -5,
    });
  }

  const aprimoramentoPmDelta = aparatos.reduce(
    (sum, aparato) => sum + (aparato.aprimoramentoPmDelta ?? 0),
    0
  );

  const notes = [
    'Ativar não custa o PM base da magia: você paga só os aprimoramentos (até Int PM), cada PM deles soma +1 na CD. A penalidade de armadura já está no modificador. Se falhar, os PM são gastos mesmo assim e a engenhoca enguiça (1 hora de trabalho para consertar).',
  ];
  if (sheetHasPowerNamed(sheet, CHUTES_E_PALAVROES)) {
    notes.push(
      'Chutes e Palavrões: 1x/rodada, pague 1 PM para repetir o teste.'
    );
  }
  if (aparatos.some((aparato) => aparato.id === 'supressor-de-seguranca')) {
    notes.push(
      'Supressor de segurança: 1x/cena a falha não enguiça — use "Consertar" na engenhoca.'
    );
  }

  return {
    label: 'Ofício (engenhoqueiro)',
    modifier: getEngenhocaCheckModifier(sheet, spell),
    getDC: (aprimoramentoPm) => baseDC + Math.max(0, aprimoramentoPm),
    toggles,
    note: notes.join(' '),
    basePmOverride: 0,
    aprimoramentoPmDelta: aprimoramentoPmDelta || undefined,
    maxAprimoramentoPm: Math.max(0, getIntelligence(sheet)),
    failureNote:
      'A engenhoca enguiçou: não gera efeito, os PM são gastos e ela precisa de 1 hora de trabalho para ser consertada.',
    actionLabel: 'Ativar engenhoca',
    onResult: (result) => {
      if (!result.success) onBreak?.();
    },
  };
}
