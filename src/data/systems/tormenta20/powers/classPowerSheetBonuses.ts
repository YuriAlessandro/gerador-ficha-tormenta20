import { SheetBonus } from '@/interfaces/CharacterSheet';
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
