import Race, { RaceAbility } from '../../../../../interfaces/Race';
import { Atributo } from '../../atributos';
import Skill from '../../../../../interfaces/Skills';

const velocisAbilities: RaceAbility[] = [
  {
    name: 'Através de Espinheiros',
    description:
      'Você recebe redução de corte e perfuração 2 e não sofre redução em seu deslocamento por terreno difícil natural.',
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
  {
    name: 'Velocista da Planície',
    description:
      'Seu deslocamento é 12m. Você pode usar Destreza como atributo-chave de Atletismo (em vez de Força) e, quando faz testes de Atletismo para correr ou saltar, pode rolar dois dados e usar o melhor resultado.',
  },
];

const VELOCIS: Race = {
  name: 'Velocis',
  attributes: {
    attrs: [
      { attr: Atributo.DESTREZA, mod: 2 },
      { attr: Atributo.SABEDORIA, mod: 1 },
      { attr: Atributo.INTELIGENCIA, mod: -1 },
    ],
  },
  faithProbability: {
    ALLIHANNA: 1,
    LENA: 1,
    MARAH: 1,
  },
  getDisplacement: () => 12,
  abilities: velocisAbilities,
};

export default VELOCIS;
