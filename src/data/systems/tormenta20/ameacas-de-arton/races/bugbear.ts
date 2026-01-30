import Race from '../../../../../interfaces/Race';
import { Atributo } from '../../atributos';

const BUGBEAR: Race = {
  name: 'Bugbear',
  attributes: {
    attrs: [
      { attr: Atributo.FORCA, mod: 2 },
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
      name: 'Empunhadura Poderosa',
      description:
        'Ao usar uma arma feita para uma categoria de tamanho maior que a sua (por exemplo, uma arma aumentada para uma criatura Pequena ou Média), a penalidade que você sofre nos testes de ataque diminui para –2. Caso receba esta habilidade novamente, a penalidade diminui para 0 e você pode também usar armas de até duas categorias de tamanho maiores que a sua com uma penalidade de –5 nos testes de ataque.',
    },
    {
      name: 'Saborear Pavor',
      description:
        'Você pode usar Força como atributo-chave de Intimidação (em vez de Carisma). Além disso, se estiver em alcance curto de outra criatura abalada ou apavorada, você recebe um bônus em testes de ataque igual à penalidade causada pela condição.',
    },
    {
      name: 'Sentidos de Predador',
      description: 'Você recebe faro e visão no escuro.',
    },
  ],
};

export default BUGBEAR;
