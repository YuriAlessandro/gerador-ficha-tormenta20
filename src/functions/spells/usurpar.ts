import CharacterSheet from '../../interfaces/CharacterSheet';
import Skill, { getSkillAttr } from '../../interfaces/Skills';
import { getActiveArmorPenalty } from '../proficiencies';
import type {
  SpellCastCheck,
  SpellCastCheckAdjustment,
} from '../../components/SpellCastDialog';

/**
 * Usurpar e Roubo Divino — habilidades do Usurpador (variante de Clérigo,
 * Heróis de Arton).
 *
 * "Usurpar. Você pode lançar qualquer magia divina de um círculo a que tenha
 * acesso. Para lançar uma magia dessa forma, deve passar em um teste de
 * Enganação (CD 15 + custo em PM da magia). Se falhar, a magia é perdida, mas
 * os PM são gastos mesmo assim. Você não pode escolher 10 nesse teste (...) e
 * sofre penalidade de armadura nele. Além disso, sofre uma penalidade de –5 se
 * estiver em um local contendo um símbolo sagrado visível."
 *
 * "Roubo Divino. No 20º nível (...) para cada 10 pontos no resultado do teste
 * de Enganação, o total de PM que você gasta nessa magia é reduzido em –1
 * (cumulativo com outras reduções) e a CD para resistir a ela aumenta em +1."
 */

export const USURPAR_BASE_DC = 15;

/** Penalidade situacional por símbolo sagrado visível no local. */
export const USURPAR_HOLY_SYMBOL_PENALTY = -5;

const ADJUSTMENT_NONE: SpellCastCheckAdjustment = { pmDelta: 0, dcBonus: 0 };

/** CD do teste de Enganação: 15 + custo em PM da magia (já com aprimoramentos). */
export function getUsurparDC(pmCost: number): number {
  return USURPAR_BASE_DC + Math.max(0, pmCost);
}

/**
 * A ficha tem a habilidade AGORA (nível já alcançado)?
 *
 * `classe.abilities` é reconstruído a cada recálculo por `applyClassAbilities`
 * já filtrado por nível de classe — é a checagem mais barata e correta, e evita
 * a armadilha do `getClassLevel`, que devolve o nível TOTAL do personagem em
 * fichas mono-classe.
 */
function hasClassAbility(sheet: CharacterSheet, name: string): boolean {
  return !!sheet?.classe?.abilities?.some((ability) => ability.name === name);
}

/** A ficha lança magias por Usurpar. */
export function hasUsurpar(sheet: CharacterSheet): boolean {
  return hasClassAbility(sheet, 'Usurpar');
}

/**
 * Bônus total do teste de Enganação para Usurpar.
 *
 * Enganação é baseada em Carisma e NÃO está em `SkillsWithArmorPenalty`, então
 * a penalidade de armadura ainda não foi somada em `skill.others` — subtrair
 * aqui é o que a regra pede e não duplica nada.
 */
export function getUsurparCheckModifier(sheet: CharacterSheet): number {
  const skill = sheet?.completeSkills?.find((s) => s.name === Skill.ENGANACAO);
  const modAttr = skill?.modAttr ?? getSkillAttr(Skill.ENGANACAO);
  const attrValue = modAttr ? sheet.atributos?.[modAttr]?.value ?? 0 : 0;

  const halfLevel = skill?.halfLevel ?? Math.floor((sheet?.nivel ?? 1) / 2);
  const training = skill?.training ?? 0;
  const others = skill?.others ?? 0;

  return (
    halfLevel + attrValue + training + others - getActiveArmorPenalty(sheet)
  );
}

/**
 * Roubo Divino (20º): −1 PM e +1 na CD a cada 10 pontos cheios no resultado do
 * teste de Enganação. Zero para quem não tem a habilidade.
 */
export function getRouboDivinoAdjustment(
  sheet: CharacterSheet,
  checkTotal: number
): SpellCastCheckAdjustment {
  if (!hasClassAbility(sheet, 'Roubo Divino')) return ADJUSTMENT_NONE;

  const steps = Math.floor(Math.max(0, checkTotal) / 10);
  if (steps === 0) return ADJUSTMENT_NONE;

  return {
    pmDelta: -steps,
    dcBonus: steps,
    note: `Roubo Divino: −${steps} PM no lançamento e +${steps} na CD para resistir à magia.`,
  };
}

/**
 * Contrato do teste que o `SpellCastDialog` executa junto do lançamento, ou
 * `undefined` quando a ficha não usa Usurpar (aí o diálogo se comporta como
 * sempre).
 *
 * O teste roda DENTRO do diálogo de propósito: a CD depende do custo final em
 * PM, que só existe lá (base − manaReduction + aprimoramentos, ou 0 se truque).
 * Um botão de rolagem por fora erraria a CD sempre que houvesse aprimoramento.
 */
export function buildUsurparCastCheck(
  sheet: CharacterSheet
): SpellCastCheck | undefined {
  if (!hasUsurpar(sheet)) return undefined;

  return {
    label: 'Enganação (Usurpar)',
    modifier: getUsurparCheckModifier(sheet),
    getDC: getUsurparDC,
    toggles: [
      {
        id: 'simbolo-sagrado',
        label: 'Símbolo sagrado visível no local',
        value: USURPAR_HOLY_SYMBOL_PENALTY,
      },
    ],
    note: 'Você não pode escolher 10 neste teste. A penalidade de armadura já está aplicada no modificador. Se falhar, a magia é perdida mas os PM são gastos mesmo assim.',
    resolve: (result) => getRouboDivinoAdjustment(sheet, result.total),
  };
}
