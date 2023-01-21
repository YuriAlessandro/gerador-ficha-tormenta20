import Race from '../../interfaces/Race';
import { Atributo } from '../atributos';
import { RACE_SIZES } from './raceSizes/raceSizes';

class MEDUSA implements Race {
  name = 'Medusa';

  attributes = {
    attrs: [
      { attr: Atributo.DESTREZA, mod: 4 },
      { attr: Atributo.CARISMA, mod: 2 },
    ],
  };

  faithProbability = {
    AHARADAK: 1,
    KALLYADRANOCH: 1,
    MEGALOKK: 1,
    SSZZAAS: 1,
    TENEBRA: 1,
    THWOR: 1,
  };

  displacement = 9;

  size = RACE_SIZES.MEDIO;

  abilities = [
    {
      name: 'Cria de Megalokk',
      description:
        'Você é uma criatura do tipo monstro e recebe visão no escuro.',
    },
    {
      name: 'Natureza Venenosa',
      description:
        'Você recebe resistência a veneno 5 e pode gastar uma ação de movimento e 1 PM para envenenar uma arma que esteja empunhando. A arma causa +1d12 pontos de dano de veneno. O veneno dura até você acertar um ataque ou até o fim da cena (o que acontecer primeiro).',
    },
    {
      name: 'Olhar Atordoante',
      description:
        'Você pode gastar uma ação de movimento e 1 PM para forçar uma criatura em alcance curto a fazer um teste de Fortitude (CD Car). Se a criatura falhar, fica atordoada por 1 rodada. Se passar, fica imune a esta habilidade por um dia.',
    },
  ];
}

export default MEDUSA;
