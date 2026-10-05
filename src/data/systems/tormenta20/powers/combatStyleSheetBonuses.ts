import { SheetBonus } from '@/interfaces/CharacterSheet';

/**
 * Bônus passivos dos estilos de combate que dependem da empunhadura.
 *
 * Num arquivo à parte (como `classPowerSheetBonuses.ts`) porque, além do dado
 * do poder, o `sheetNormalizer` refresca as cópias embutidas em fichas salvas:
 * estes poderes ganharam automação depois de já existirem fichas com eles.
 */

/**
 * Estilo Clássico (Heróis de Arton, humano): empunhando uma espada e um
 * escudo, +2 nas rolagens de dano com a arma e +2 na Defesa.
 */
const ESTILO_CLASSICO_CONDITION: SheetBonus['condition'] = {
  combinator: 'AND',
  clauses: [{ kind: 'wieldingSword' }, { kind: 'wieldingShield' }],
};

export const ESTILO_CLASSICO_SHEET_BONUSES: SheetBonus[] = [
  {
    source: { type: 'power', name: 'Estilo Clássico' },
    target: { type: 'Defense' },
    modifier: { type: 'Fixed', value: 2 },
    condition: ESTILO_CLASSICO_CONDITION,
  },
  {
    source: { type: 'power', name: 'Estilo Clássico' },
    target: { type: 'WeaponDamage', swordOnly: true },
    modifier: { type: 'Fixed', value: 2 },
    condition: ESTILO_CLASSICO_CONDITION,
  },
];

/**
 * Estilo de Duas Mãos: usando uma arma corpo a corpo com as duas mãos, +5 nas
 * rolagens de dano (nunca com armas leves — `twoHandedOnly` já as exclui).
 */
export const ESTILO_DE_DUAS_MAOS_SHEET_BONUSES: SheetBonus[] = [
  {
    source: { type: 'power', name: 'Estilo de Duas Mãos' },
    target: { type: 'WeaponDamage', meleeOnly: true, twoHandedOnly: true },
    modifier: { type: 'Fixed', value: 5 },
    condition: {
      combinator: 'AND',
      clauses: [
        { kind: 'wieldingTwoHandedWeapon' },
        { kind: 'wieldingMeleeWeapon' },
      ],
    },
  },
];

/**
 * Estilo de Arremesso: +2 nas rolagens de dano com armas de arremesso e, se
 * também possuir Saque Rápido, +2 nos testes de ataque com elas.
 */
export const ESTILO_DE_ARREMESSO_SHEET_BONUSES: SheetBonus[] = [
  {
    source: { type: 'power', name: 'Estilo de Arremesso' },
    target: { type: 'WeaponDamage', thrownOnly: true },
    modifier: { type: 'Fixed', value: 2 },
  },
  {
    source: { type: 'power', name: 'Estilo de Arremesso' },
    target: { type: 'WeaponAttack', thrownOnly: true },
    modifier: { type: 'Fixed', value: 2 },
    condition: {
      combinator: 'AND',
      clauses: [{ kind: 'hasPower', value: 'Saque Rápido' }],
    },
  },
];
