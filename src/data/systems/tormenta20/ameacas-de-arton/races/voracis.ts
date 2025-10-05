import Race, { RaceAbility } from '../../../../../interfaces/Race';
import { Atributo } from '../../atributos';
import Skill from '../../../../../interfaces/Skills';

const voracisAbilities: RaceAbility[] = [
  {
    name: 'Garras',
    description:
      'Suas mãos são duas armas naturais de garras (dano 1d6 cada, crítico x2, corte). Uma vez por rodada, quando usa a ação agredir para atacar com uma arma, você pode gastar 1 PM para fazer um ataque corpo a corpo extra com uma das garras, desde que ela esteja livre e não tenha sido usada para atacar neste turno. Como alternativa, se tiver habilidades que exijam uma arma secundária (como Estilo de Duas Armas), você pode usá-las com suas garras.',
  },
  {
    name: 'Rainha da Selva',
    description:
      'Você recebe deslocamento de escalada 9m, +2 em Atletismo e recupera +1 PV por nível quando descansa.',
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Rainha da Selva' },
        target: { type: 'Skill', name: Skill.ATLETISMO },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
  {
    name: 'Sentidos Selvagens',
    description:
      'Você recebe +2 em Sobrevivência, visão na penumbra e faro (contra inimigos em alcance curto que não possa ver, você não fica desprevenido e camuflagem total lhe causa apenas 20% de chance de falha).',
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Sentidos Selvagens' },
        target: { type: 'Skill', name: Skill.SOBREVIVENCIA },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
];

const VORACIS: Race = {
  name: 'Voracis',
  attributes: {
    attrs: [
      { attr: Atributo.DESTREZA, mod: 2 },
      { attr: Atributo.CONSTITUICAO, mod: 1 },
      { attr: Atributo.INTELIGENCIA, mod: -1 },
    ],
  },
  faithProbability: {
    ALLIHANNA: 1,
    ARSENAL: 1,
    MEGALOKK: 1,
  },
  abilities: voracisAbilities,
};

export default VORACIS;
