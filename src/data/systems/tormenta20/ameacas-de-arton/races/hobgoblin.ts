import Race from '../../../../../interfaces/Race';
import { Atributo } from '../../atributos';
import Skill from '../../../../../interfaces/Skills';

const METALURGIA_HOBGOBLIN_DESCRIPTION =
  'Você recebe +2 em Ofício (armeiro) e, se for treinado nesta perícia, pode fabricar armas e armaduras superiores com uma melhoria. Se aprender a fabricar itens superiores desses tipos por outra habilidade, gasta apenas ¼ do preço das melhorias que aplica nesses itens (em vez de ⅓).';

/**
 * Habilidades do Hobgoblin cujo texto divergia da fonte oficial (Ameaças de
 * Arton, cap. 1). Fichas salvas embutem a cópia errada e abrir uma ficha não
 * dispara recálculo, então a correção do dado sozinha só alcançaria fichas
 * novas — ver `REFRESHED_DESCRIPTIONS_BY_NAME` no `sheetNormalizer`.
 */
export const HOBGOBLIN_REFRESHED_DESCRIPTIONS: Record<string, string> = {
  'Metalurgia Hobgoblin': METALURGIA_HOBGOBLIN_DESCRIPTION,
};

const HOBGOBLIN: Race = {
  name: 'Hobgoblin',
  attributes: {
    attrs: [
      { attr: Atributo.CONSTITUICAO, mod: 2 },
      { attr: Atributo.DESTREZA, mod: 1 },
      { attr: Atributo.CARISMA, mod: -1 },
    ],
  },
  faithProbability: {
    ARSENAL: 1,
    MEGALOKK: 1,
    TENEBRA: 1,
  },
  abilities: [
    {
      name: 'Arte da Guerra',
      description:
        'Você é treinado em Guerra e recebe proficiência em armas marciais. Se receber essa proficiência novamente, recebe +2 em rolagens de dano com essas armas.',
      sheetActions: [
        // "Você é TREINADO em Guerra" — treinamento, não bônus numérico. Era um
        // `sheetBonuses` de +2 na perícia, que além de errado deixava a perícia
        // destreinada na ficha.
        {
          source: { type: 'power', name: 'Arte da Guerra' },
          action: {
            type: 'learnSkill',
            availableSkills: [Skill.GUERRA],
            pick: 1,
          },
        },
        {
          source: { type: 'power', name: 'Arte da Guerra' },
          action: {
            type: 'addProficiency',
            availableProficiencies: ['Armas Marciais'],
            pick: 1,
          },
        },
      ],
    },
    {
      name: 'Metalurgia Hobgoblin',
      description: METALURGIA_HOBGOBLIN_DESCRIPTION,
      sheetBonuses: [
        {
          source: { type: 'power', name: 'Metalurgia Hobgoblin' },
          target: { type: 'Skill', name: Skill.OFICIO_ARMEIRO },
          modifier: { type: 'Fixed', value: 2 },
        },
      ],
    },
    {
      name: 'Táticas de Guerrilha',
      description: 'Você recebe visão no escuro e +2 em Furtividade.',
      sheetBonuses: [
        {
          source: { type: 'power', name: 'Táticas de Guerrilha' },
          target: { type: 'Skill', name: Skill.FURTIVIDADE },
          modifier: { type: 'Fixed', value: 2 },
        },
      ],
    },
  ],
};

export default HOBGOBLIN;
