import { Spell } from '@/interfaces/Spells';
import { DiceRoll } from '@/interfaces/DiceRoll';
import {
  AbilityRoll,
  ThreatActionType,
  ThreatSpell,
} from '@/interfaces/ThreatSheet';
import {
  allArcaneSpellsCircle1,
  allArcaneSpellsCircle2,
  allArcaneSpellsCircle3,
  allArcaneSpellsCircle4,
  allArcaneSpellsCircle5,
} from '@/data/systems/tormenta20/magias/arcane';
import {
  allDivineSpellsCircle1,
  allDivineSpellsCircle2,
  allDivineSpellsCircle3,
  allDivineSpellsCircle4,
  allDivineSpellsCircle5,
} from '@/data/systems/tormenta20/magias/divine';
import { manaExpenseByCircle } from '@/data/systems/tormenta20/magias/generalSpells';
import { TORMENTA20_SYSTEM } from '@/data/systems/tormenta20';
import { SupplementId } from '@/types/supplement.types';
import { getSchoolLabel } from '@/components/SpellPicker/schoolLabels';
import { getCircleNumber } from '@/components/SpellPicker/spellFilters';
import { parseDamage } from '@/functions/diceRoller';
import {
  AprimoramentoSelection,
  AugmentedRoll,
  augmentSpellRolls,
  isTruqueAprimoramento,
} from '@/functions/spellRollAugmentation';

/** Magia do compêndio com a(s) tradição(ões) e o livro de origem. */
export interface CompendiumSpell extends Spell {
  traditions: ('arcane' | 'divine')[];
  supplementId: SupplementId;
}

const TRADITION_LABEL: Record<'arcane' | 'divine', string> = {
  arcane: 'Arcana',
  divine: 'Divina',
};

const THREAT_ACTION_TYPES: ThreatActionType[] = [
  'Padrão',
  'Movimento',
  'Completa',
  'Livre',
  'Reação',
];

/**
 * Junta as magias oficiais (básico + suplementos pedidos) numa lista única,
 * mesclando as que aparecem nas duas tradições. Ordenada por nome.
 */
export const getCompendiumSpells = (
  supplementIds: SupplementId[]
): CompendiumSpell[] => {
  const byKey = new Map<string, CompendiumSpell>();

  const add = (
    spell: Spell,
    tradition: 'arcane' | 'divine',
    supplementId: SupplementId
  ) => {
    const key = `${spell.nome}-${spell.spellCircle}`;
    const existing = byKey.get(key);
    if (existing) {
      if (!existing.traditions.includes(tradition)) {
        existing.traditions.push(tradition);
      }
      return;
    }
    byKey.set(key, { ...spell, traditions: [tradition], supplementId });
  };

  if (supplementIds.includes(SupplementId.TORMENTA20_CORE)) {
    [
      ...allArcaneSpellsCircle1,
      ...allArcaneSpellsCircle2,
      ...allArcaneSpellsCircle3,
      ...allArcaneSpellsCircle4,
      ...allArcaneSpellsCircle5,
    ].forEach((spell) => add(spell, 'arcane', SupplementId.TORMENTA20_CORE));
    [
      ...allDivineSpellsCircle1,
      ...allDivineSpellsCircle2,
      ...allDivineSpellsCircle3,
      ...allDivineSpellsCircle4,
      ...allDivineSpellsCircle5,
    ].forEach((spell) => add(spell, 'divine', SupplementId.TORMENTA20_CORE));
  }

  supplementIds.forEach((supplementId) => {
    const spells = TORMENTA20_SYSTEM.supplements[supplementId]?.spells;
    if (!spells) return;
    spells.arcane?.forEach((spell) => add(spell, 'arcane', supplementId));
    spells.divine?.forEach((spell) => add(spell, 'divine', supplementId));
    spells.universal?.forEach((spell) => {
      add(spell, 'arcane', supplementId);
      add(spell, 'divine', supplementId);
    });
  });

  return Array.from(byKey.values()).sort((a, b) =>
    a.nome.localeCompare(b.nome, 'pt-BR')
  );
};

/** Escolha de aprimoramentos da versão importada: índice → vezes aplicado. */
export type AprimoramentoCounts = Map<number, number>;

/** Aprimoramentos escolhidos, no formato do motor de aumento de rolagens. */
export const toAprimoramentoSelections = (
  spell: Spell,
  counts: AprimoramentoCounts
): AprimoramentoSelection[] => {
  const result: AprimoramentoSelection[] = [];
  counts.forEach((count, index) => {
    const aprimoramento = spell.aprimoramentos?.[index];
    if (aprimoramento && count > 0) result.push({ aprimoramento, count });
  });
  return result;
};

/** Custo base da magia (manaExpense ou a tabela por círculo). */
export const getCompendiumBasePm = (spell: Spell): number =>
  spell.manaExpense ?? manaExpenseByCircle[spell.spellCircle] ?? 0;

/**
 * Custo final com os aprimoramentos, com a regra do lançamento da ficha
 * (`SpellCastDialog`): truque zera o custo; os demais somam PM × vezes.
 */
export const getAprimoradoPmCost = (
  spell: Spell,
  selections: AprimoramentoSelection[]
): number => {
  if (
    selections.some(({ aprimoramento }) => isTruqueAprimoramento(aprimoramento))
  )
    return 0;
  return selections.reduce(
    (total, { aprimoramento, count }) => total + aprimoramento.addPm * count,
    getCompendiumBasePm(spell)
  );
};

/** Rolagens da magia já aumentadas pelos aprimoramentos escolhidos. */
export const getAprimoradoRolls = (
  spell: Spell,
  selections: AprimoramentoSelection[]
): AugmentedRoll[] => augmentSpellRolls(spell.rolls ?? [], selections);

/**
 * Quais rolagens entram no clique da mesa: rolagemKey → incluída. Ausente =
 * padrão (`isRollIncludedByDefault`). A ficha escolhe as rolagens na hora de
 * lançar; na ameaça o clique rola todas, então a escolha é feita aqui.
 */
export type RollInclusion = Map<string, boolean>;

export const getRollKey = (roll: DiceRoll, index: number): string =>
  roll.id ?? `${index}-${roll.label}`;

const TRUQUE_ROLL = /truque/i;

/**
 * Rolagem de truque (ex.: "Dano de Luz vs Mortos-vivos (truque)") só entra
 * com o truque escolhido — e aí as rolagens normais saem. Magias sem rolagem
 * de truque incluem tudo.
 */
export const isRollIncludedByDefault = (
  roll: DiceRoll,
  rolls: DiceRoll[],
  selections: AprimoramentoSelection[]
): boolean => {
  if (!rolls.some((r) => TRUQUE_ROLL.test(r.label))) return true;
  const truque = selections.some(({ aprimoramento }) =>
    isTruqueAprimoramento(aprimoramento)
  );
  return TRUQUE_ROLL.test(roll.label) === truque;
};

export const isRollIncluded = (
  roll: DiceRoll,
  index: number,
  rolls: DiceRoll[],
  selections: AprimoramentoSelection[],
  inclusion: RollInclusion
): boolean =>
  inclusion.get(getRollKey(roll, index)) ??
  isRollIncludedByDefault(roll, rolls, selections);

/** "2d6+1d8+6" → dado "2d6+1d8" e bônus 6; fora do padrão fica no dado. */
export const diceRollToAbilityRoll = (
  roll: DiceRoll,
  id: string
): AbilityRoll => {
  const name = roll.damageType
    ? `${roll.label} (${roll.damageType})`
    : roll.label;
  const parsed = parseDamage(roll.dice);
  if (!parsed) return { id, name, dice: roll.dice, bonus: 0 };
  return { id, name, dice: parsed.diceString, bonus: parsed.modifier };
};

const toThreatActionType = (execucao: string): ThreatActionType | undefined => {
  const match = THREAT_ACTION_TYPES.find((type) =>
    execucao.toLowerCase().startsWith(type.toLowerCase())
  );
  return match && match !== 'Padrão' ? match : undefined;
};

/**
 * Texto da magia no formato do statblock: linha de regras (tradição, círculo,
 * escola, execução, alcance...), o efeito e os aprimoramentos APLICADOS. A
 * lista completa de aprimoramentos fica de fora: na mesa a magia é usada
 * exatamente na versão gravada, sem escolher aprimoramento na hora.
 */
export const buildCompendiumSpellDescription = (
  spell: CompendiumSpell,
  selections: AprimoramentoSelection[] = []
): string => {
  const traditions = spell.traditions.map((t) => TRADITION_LABEL[t]).join('/');
  const header = [
    `${traditions} ${getCircleNumber(spell.spellCircle)} (${getSchoolLabel(
      spell.school
    )})`,
    `Execução: ${spell.execucao}`,
    `Alcance: ${spell.alcance}`,
    spell.alvo ? `Alvo: ${spell.alvo}` : null,
    spell.area ? `Área: ${spell.area}` : null,
    `Duração: ${spell.duracao}`,
    spell.resistencia ? `Resistência: ${spell.resistencia}` : null,
  ]
    .filter(Boolean)
    .join('; ');

  const parts = [`${header}.`, spell.description.trim()];
  if (selections.length > 0) {
    const lines = selections.map(({ aprimoramento, count }) => {
      const cost = isTruqueAprimoramento(aprimoramento)
        ? 'Truque'
        : `+${aprimoramento.addPm} PM`;
      const times = count > 1 ? `${count}× ` : '';
      return `• ${times}${cost}: ${aprimoramento.text}`;
    });
    parts.push(['Aprimoramentos aplicados:', ...lines].join('\n'));
  }
  return parts.join('\n');
};

/**
 * Converte uma magia do compêndio numa magia de ameaça (editável depois),
 * já com os aprimoramentos escolhidos embutidos no custo e nas rolagens —
 * um clique no nome, na mesa, gasta esse PM e rola esses dados.
 */
export const compendiumSpellToThreatSpell = (
  spell: CompendiumSpell,
  generateId: () => string,
  counts: AprimoramentoCounts = new Map(),
  inclusion: RollInclusion = new Map()
): ThreatSpell => {
  const selections = toAprimoramentoSelections(spell, counts);
  const pmCost = getAprimoradoPmCost(spell, selections);
  const augmented = getAprimoradoRolls(spell, selections);
  const rolls = augmented
    .filter((roll, index) =>
      isRollIncluded(roll, index, augmented, selections, inclusion)
    )
    .map((roll) => diceRollToAbilityRoll(roll, generateId()));
  return {
    id: generateId(),
    name: spell.nome,
    description: buildCompendiumSpellDescription(spell, selections),
    rolls: rolls.length > 0 ? rolls : undefined,
    pmCost: pmCost > 0 ? pmCost : undefined,
    actionType: toThreatActionType(spell.execucao),
  };
};
