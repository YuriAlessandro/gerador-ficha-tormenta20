import Equipment from '../../../../../interfaces/Equipment';
import Race from '../../../../../interfaces/Race';
import Skill from '../../../../../interfaces/Skills';
import {
  BonusCondition,
  SheetBonus,
} from '../../../../../interfaces/CharacterSheet';
import { Atributo } from '../../atributos';
import { spellsCircle1 } from '../../magias/generalSpells';

// Heróis de Arton p. 15: "você pode usar Destreza como atributo-chave de
// Atletismo (em vez de Força)". "Pode" = fica com o maior. Os dois sentidos são
// emitidos porque `modAttr` é persistido em `completeSkills`: sem o retorno para
// Força, uma ficha cuja Força passasse a Destreza ficaria presa em Destreza.
const DESTREZA_GTE_FORCA: BonusCondition = {
  combinator: 'AND',
  clauses: [
    {
      kind: 'attributeCompare',
      attribute: Atributo.DESTREZA,
      op: 'gte',
      otherAttribute: Atributo.FORCA,
    },
  ],
};

const FORCA_GT_DESTREZA: BonusCondition = {
  combinator: 'AND',
  clauses: [{ ...DESTREZA_GTE_FORCA.clauses[0], negate: true }],
};

const PERNAS_CAPRINAS_SHEET_BONUSES: SheetBonus[] = [
  {
    source: { type: 'power', name: 'Pernas Caprinas' },
    target: { type: 'Displacement' },
    modifier: { type: 'Fixed', value: 3 },
  },
  {
    source: { type: 'power', name: 'Pernas Caprinas' },
    target: {
      type: 'ModifySkillAttribute',
      skill: Skill.ATLETISMO,
      attribute: Atributo.DESTREZA,
    },
    modifier: { type: 'Fixed', value: 0 },
    condition: DESTREZA_GTE_FORCA,
  },
  {
    source: { type: 'power', name: 'Pernas Caprinas' },
    target: {
      type: 'ModifySkillAttribute',
      skill: Skill.ATLETISMO,
      attribute: Atributo.FORCA,
    },
    modifier: { type: 'Fixed', value: 0 },
    condition: FORCA_GT_DESTREZA,
  },
];

// Heróis de Arton p. 15. Arma natural = arma leve corpo a corpo (Jogo do Ano
// p. 143), por isso a tag `natural` — é ela que a Acuidade com Arma reconhece.
const marrada: Equipment = {
  group: 'Arma',
  nome: 'Marrada',
  dano: '1d6',
  critico: 'x2',
  tipo: 'Impac.',
  preco: 0,
  weaponTags: ['natural'],
  descricao: 'Ataque extra: 1 PM, 1x/rodada, ao usar agredir com outra arma.',
};

const SATIRO: Race = {
  name: 'Sátiro',
  attributes: {
    attrs: [
      { attr: Atributo.CARISMA, mod: 2 },
      { attr: Atributo.DESTREZA, mod: 1 },
      { attr: Atributo.SABEDORIA, mod: -1 },
    ],
  },
  faithProbability: {
    ALLIHANNA: 1,
    HYNINN: 1,
    MARAH: 1,
    NIMB: 1,
    WYNNA: 1,
  },
  abilities: [
    {
      name: 'Festeiro Feérico',
      description:
        'Você é uma criatura do tipo espírito, recebe visão na penumbra e +2 em Atuação e Fortitude.',
      sheetActions: [
        {
          source: {
            type: 'power',
            name: 'Festeiro Feérico',
          },
          action: {
            type: 'addSense',
            sense: 'Visão na penumbra',
          },
        },
      ],
      sheetBonuses: [
        {
          source: { type: 'power', name: 'Festeiro Feérico' },
          target: { type: 'Skill', name: Skill.ATUACAO },
          modifier: { type: 'Fixed', value: 2 },
        },
        {
          source: { type: 'power', name: 'Festeiro Feérico' },
          target: { type: 'Skill', name: Skill.FORTITUDE },
          modifier: { type: 'Fixed', value: 2 },
        },
      ],
    },
    {
      name: 'Instrumentista Mágico',
      description:
        'Se estiver empunhando um instrumento musical, você pode lançar as magias Amedrontar, Enfeitiçar, Hipnotismo e Sono (atributo-chave Carisma). Caso aprenda novamente uma dessas magias, seu custo diminui em –1 PM.',
      sheetActions: [
        {
          source: {
            type: 'power',
            name: 'Instrumentista Mágico',
          },
          action: {
            type: 'learnSpell',
            availableSpells: [
              spellsCircle1.amedrontar,
              spellsCircle1.enfeiticar,
              spellsCircle1.hipnotismo,
              spellsCircle1.sono,
            ],
            pick: 4,
            customAttribute: Atributo.CARISMA,
          },
        },
      ],
    },
    {
      name: 'Marrada',
      description:
        'Você possui uma arma natural de marrada (dano 1d6, crítico x2, impacto). Uma vez por rodada, quando usa a ação agredir para atacar com outra arma, pode gastar 1 PM para fazer um ataque corpo a corpo extra com a marrada.',
      sheetActions: [
        {
          source: { type: 'power', name: 'Marrada' },
          action: {
            type: 'addEquipment',
            equipment: { Arma: [marrada] },
            description: 'Marrada pode ser usada como arma.',
          },
        },
      ],
    },
    {
      name: 'Pernas Caprinas',
      description:
        'Seu deslocamento é 12m e você pode usar Destreza como atributo-chave de Atletismo (em vez de Força).',
      sheetBonuses: PERNAS_CAPRINAS_SHEET_BONUSES,
    },
  ],
};

/**
 * Habilidades cujo efeito mecânico foi cadastrado depois: fichas salvas embutem a
 * cópia antiga e abrir a ficha não recalcula, então `normalizeSheet` refresca
 * `sheetBonuses`/`sheetActions` destas (só em ficha de Sátiro).
 */
export const SATIRO_REFRESHED_ABILITIES = ['Pernas Caprinas', 'Marrada'];

export default SATIRO;
