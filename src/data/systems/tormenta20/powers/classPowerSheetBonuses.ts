import { SheetBonus } from '@/interfaces/CharacterSheet';
import Skill from '@/interfaces/Skills';
import { Atributo } from '../atributos';

/**
 * Bônus passivos dos poderes Arqueiro, Esgrimista e Estilo de Disparo.
 *
 * Definidos aqui, num único lugar, porque cada poder aparece em mais de uma
 * fonte de dados (Arqueiro no Guerreiro e no Caçador; Esgrimista no Guerreiro e
 * no Bucaneiro) e também é refrescado em fichas salvas pelo `sheetNormalizer`.
 * Manter uma fonte única evita divergência entre as cópias.
 *
 * Os três somam um atributo nas rolagens de DANO da arma correspondente:
 * - Arqueiro: Sabedoria com armas de ataque à distância (limitado pelo nível).
 * - Esgrimista: Inteligência com armas corpo a corpo leves ou ágeis (limitado
 *   pelo nível).
 * - Estilo de Disparo: Destreza com armas de disparo (sem limite).
 *
 * "limitado pelo seu nível" = nível total do personagem → `capBy: 'level'`.
 */
export const ARQUEIRO_SHEET_BONUSES: SheetBonus[] = [
  {
    source: { type: 'power', name: 'Arqueiro' },
    target: { type: 'WeaponDamage', rangedOnly: true },
    modifier: {
      type: 'CappedAttribute',
      attribute: Atributo.SABEDORIA,
      capBy: 'level',
    },
  },
];

export const ESGRIMISTA_SHEET_BONUSES: SheetBonus[] = [
  {
    source: { type: 'power', name: 'Esgrimista' },
    target: { type: 'WeaponDamage', meleeOnly: true, lightOrAgileOnly: true },
    modifier: {
      type: 'CappedAttribute',
      attribute: Atributo.INTELIGENCIA,
      capBy: 'level',
    },
  },
];

export const ESTILO_DE_DISPARO_SHEET_BONUSES: SheetBonus[] = [
  {
    source: { type: 'power', name: 'Estilo de Disparo' },
    target: { type: 'WeaponDamage', firingOnly: true },
    modifier: { type: 'Attribute', attribute: Atributo.DESTREZA },
  },
];

/**
 * Inexpugnável: +2 em todos os testes de resistência USANDO armadura pesada.
 * Em T20 os testes de resistência são as três perícias abaixo. Mora aqui pelo
 * mesmo motivo dos de cima: precisa ser refrescado em fichas salvas, que
 * guardam a cópia embutida do poder de quando ele não tinha automação.
 */
export const INEXPUGNAVEL_SHEET_BONUSES: SheetBonus[] = [
  Skill.FORTITUDE,
  Skill.REFLEXOS,
  Skill.VONTADE,
].map((skill) => ({
  source: { type: 'power', name: 'Inexpugnável' },
  target: { type: 'Skill', name: skill },
  modifier: { type: 'Fixed', value: 2 },
  condition: { combinator: 'AND', clauses: [{ kind: 'wearingHeavyArmor' }] },
}));
