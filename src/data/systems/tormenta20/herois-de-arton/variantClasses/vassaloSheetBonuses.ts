import Skill from '../../../../../interfaces/Skills';
import {
  SheetAction,
  SheetBonus,
} from '../../../../../interfaces/CharacterSheet';
import { Atributo } from '../../atributos';

/** Opções do Caminho do Vassalo, escolhidas no Lorde (9º nível). */
export const CAMINHO_SOLDADO = 'Caminho do Soldado';
export const CAMINHO_GOVERNANTE = 'Caminho do Governante';

const source: SheetBonus['source'] = { type: 'power', name: 'Marquês' };
const soldado: SheetBonus['condition'] = {
  combinator: 'AND',
  clauses: [{ kind: 'optionChosen', value: CAMINHO_SOLDADO }],
};
const governante: SheetBonus['condition'] = {
  combinator: 'AND',
  clauses: [{ kind: 'optionChosen', value: CAMINHO_GOVERNANTE }],
};

/**
 * Marquês (13º nível). Mora fora de `vassalo.ts` para o `normalizeSheet`
 * atualizar a cópia embutida em fichas salvas sem importar a classe inteira:
 * antes só existia o +2 na Defesa.
 */
export const MARQUES_SHEET_BONUSES: SheetBonus[] = [
  {
    source,
    target: { type: 'Defense' },
    modifier: { type: 'Fixed', value: 2 },
    condition: soldado,
  },
  {
    source,
    target: { type: 'DamageReduction', damageType: 'Geral' },
    modifier: { type: 'Fixed', value: 5 },
    condition: soldado,
  },
  // "somar seu Carisma em seus testes de resistência"
  ...[Skill.FORTITUDE, Skill.REFLEXOS, Skill.VONTADE].map(
    (name): SheetBonus => ({
      source,
      target: { type: 'Skill', name },
      modifier: { type: 'Attribute', attribute: Atributo.CARISMA },
      condition: governante,
    })
  ),
];

/** Escudeiro Aprendiz (3º nível), para quem já usa armadura pesada. */
export const ESCUDEIRO_APRENDIZ_BONUSES: SheetBonus[] = [
  {
    source: { type: 'power', name: 'Escudeiro Aprendiz' },
    target: { type: 'Defense' },
    modifier: { type: 'Fixed', value: 2 },
    condition: { combinator: 'AND', clauses: [{ kind: 'wearingHeavyArmor' }] },
  },
];

/** Cavaleiro do Reino (6º nível): item superior com duas melhorias. */
export const CAVALEIRO_DO_REINO_ACTIONS: SheetAction[] = [
  {
    source: { type: 'power', name: 'Cavaleiro do Reino' },
    action: {
      type: 'grantSuperiorItem',
      groups: ['Arma', 'Armadura', 'Escudo'],
      pick: 2,
    },
  },
];
