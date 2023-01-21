import Race from '../../interfaces/Race';
import { Atributo } from '../atributos';
import { RACE_SIZES } from './raceSizes/raceSizes';

class LEFOU implements Race {
  name = 'Lefou';

  attributes = {
    attrs: [
      { attr: Atributo.CARISMA, mod: -2 },
      { attr: 'any' as 'any' | Atributo, mod: 2 },
      { attr: 'any' as 'any' | Atributo, mod: 2 },
      { attr: 'any' as 'any' | Atributo, mod: 2 },
    ],
  };

  faithProbability = {
    AHARADAK: 2,
    THWOR: 1,
  };

  displacement = 9;

  size = RACE_SIZES.MEDIO;

  abilities = [
    {
      name: 'Cria da Tormenta',
      description:
        'Você é uma criatura do tipo monstro e recebe +5 em testes de resistência contra efeitos causados por lefeu e pela Tormenta.',
    },
    {
      name: 'Deformidade',
      description:
        'Todo lefou possui defeitos físicos que, embora desagradáveis, conferem certas vantagens. Você recebe +2 em duas perícias a sua escolha. Cada um desses bônus conta como um poder da Tormenta. Você pode trocar um desses bônus por um poder da Tormenta a sua escolha. Esta habilidade não causa perda de Carisma. (NÃO INCLUSO)',
    },
  ];
}

export default LEFOU;
