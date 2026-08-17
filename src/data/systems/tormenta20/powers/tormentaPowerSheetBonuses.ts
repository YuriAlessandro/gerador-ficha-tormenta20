import { DamageType, SheetBonus } from '@/interfaces/CharacterSheet';

/**
 * Bônus passivos dos poderes da Tormenta que escalam com o total de poderes da
 * Tormenta e vivem em arquivos de dados diferentes (Pele Corrompida no livro
 * básico; Carapaça Corrompida e Bolsões Insanos em Heróis de Arton).
 *
 * Ficam aqui, num único lugar, porque também são refrescados em fichas salvas
 * pelo `sheetNormalizer` — mesmo motivo de `classPowerSheetBonuses.ts`. Fichas
 * antigas embutem a cópia do poder da época: as duas RDs tinham a automação
 * HARDCODED por nome nos dois motores de derivação, e Bolsões Insanos era um
 * `Fixed: 2` que ignorava o "+1 para cada outro poder". Sem o refresh, migrar
 * para `sheetBonuses` TIRARIA a RD de quem já tem o poder.
 *
 * `{tPowQtd}` já inclui o próprio poder, então `{tPowQtd} - 1` são "os outros".
 */

/** "RD 1. Essa RD aumenta em +1 para cada dois outros poderes da Tormenta." */
export const CARAPACA_CORROMPIDA_SHEET_BONUSES: SheetBonus[] = [
  {
    source: { type: 'power', name: 'Carapaça Corrompida' },
    target: { type: 'DamageReduction', damageType: 'Geral' },
    modifier: {
      type: 'TormentaPowersCalc',
      formula: '1 + Math.floor(({tPowQtd} - 1) / 2)',
    },
  },
];

const PELE_CORROMPIDA_TYPES: DamageType[] = [
  'Ácido',
  'Eletricidade',
  'Fogo',
  'Frio',
  'Luz',
  'Trevas',
];

/**
 * "Redução de ácido, eletricidade, fogo, frio, luz e trevas 2. Esta RD aumenta
 * em +2 para cada dois outros poderes da Tormenta."
 */
export const PELE_CORROMPIDA_SHEET_BONUSES: SheetBonus[] =
  PELE_CORROMPIDA_TYPES.map((damageType) => ({
    source: { type: 'power', name: 'Pele Corrompida' },
    target: { type: 'DamageReduction', damageType },
    modifier: {
      type: 'TormentaPowersCalc',
      formula: '2 + 2 * Math.floor(({tPowQtd} - 1) / 2)',
    },
  }));

/**
 * "Seu limite de carga aumenta em 2 espaços, mais 1 espaço para cada outro
 * poder da Tormenta que você possui."
 */
export const BOLSOES_INSANOS_SHEET_BONUSES: SheetBonus[] = [
  {
    source: { type: 'power', name: 'Bolsões Insanos' },
    target: { type: 'MaxSpaces' },
    modifier: {
      type: 'TormentaPowersCalc',
      formula: '2 + ({tPowQtd} - 1)',
    },
  },
];
