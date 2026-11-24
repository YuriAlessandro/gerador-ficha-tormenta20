import type { DiceRoll } from '../../interfaces/DiceRoll';
import type { Spell } from '../../interfaces/Spells';
import { normalizeLabel } from '../spellRollAugmentation';

/**
 * Tipos de dano (JdA, cap. 5), na grafia minúscula usada por `DiceRoll`.
 * "Elétrico" é como a Linhagem Dracônica grava; vira "eletricidade".
 */
export const SPELL_DAMAGE_TYPES = [
  'ácido',
  'corte',
  'eletricidade',
  'essência',
  'fogo',
  'frio',
  'impacto',
  'luz',
  'perfuração',
  'psíquico',
  'trevas',
  'veneno',
] as const;

export type SpellDamageType = (typeof SPELL_DAMAGE_TYPES)[number];

const strip = normalizeLabel;

const BY_STRIPPED = new Map<string, SpellDamageType>(
  SPELL_DAMAGE_TYPES.map((type) => [strip(type), type])
);
BY_STRIPPED.set('eletrico', 'eletricidade');

/** "Fogo", "fogo", "Elétrico" → tipo canônico; desconhecido → undefined. */
export function normalizeDamageType(
  text: string | undefined
): SpellDamageType | undefined {
  return text ? BY_STRIPPED.get(strip(text)) : undefined;
}

/**
 * Tipo de dano da rolagem: o campo `damageType` ou, sem ele, o rótulo
 * ("Dano de Fogo", "Dano Psíquico", "Dano de Ácido por rodada"). O rótulo é o
 * que existe nas magias do catálogo, nas cópias de fichas antigas e em
 * homebrew. Rótulo com dois tipos ("Dano Misto (fogo/eletricidade)") fica sem
 * tipo — melhor não aplicar do que aplicar errado.
 */
export function getRollDamageType(
  roll: Pick<DiceRoll, 'label' | 'damageType'>
): SpellDamageType | undefined {
  const declared = normalizeDamageType(roll.damageType);
  if (declared) return declared;
  const label = strip(roll.label);
  if (!label.startsWith('dano')) return undefined;
  const found = SPELL_DAMAGE_TYPES.filter((type) =>
    new RegExp(`\\b${strip(type)}\\b`).test(label)
  );
  return found.length === 1 ? found[0] : undefined;
}

/** Tipos de dano que as rolagens da magia causam. */
export function getSpellDamageTypes(spell: Spell): SpellDamageType[] {
  const types = new Set<SpellDamageType>();
  (spell.rolls ?? []).forEach((roll) => {
    const type = getRollDamageType(roll);
    if (type) types.add(type);
  });
  return Array.from(types);
}
