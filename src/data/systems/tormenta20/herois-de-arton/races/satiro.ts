import Race from '../../../../../interfaces/Race';
import Skill from '../../../../../interfaces/Skills';
import { Atributo } from '../../atributos';
import { spellsCircle1 } from '../../magias/generalSpells';

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
    },
    {
      name: 'Pernas Caprinas',
      description:
        'Seu deslocamento é 12m e você pode usar Destreza como atributo-chave de Atletismo (em vez de Força).',
      sheetBonuses: [
        {
          source: { type: 'power', name: 'Pernas Caprinas' },
          target: { type: 'Displacement' },
          modifier: { type: 'Fixed', value: 3 },
        },
      ],
    },
  ],
};

export default SATIRO;
