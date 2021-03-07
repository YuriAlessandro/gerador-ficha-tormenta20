import { GeneralPower, GeneralPowerType, RequirementType } from './types';

const tormentaPowers: GeneralPower[] = [
  {
    name: 'Anatomia Insana',
    description:
      'Você tem 25% de chance (resultado “1” em 1d4) de ignorar o dano adicional de um acerto crítico ou ataque furtivo. A chance aumenta em +25% para cada dois outros poderes da Tormenta que você possui',
    type: GeneralPowerType.TORMENTA,
    requirements: [],
  },
  {
    name: 'Antenas',
    description:
      'Você recebe +1 em Iniciativa, Percepção e Vontade. Este bônus aumenta em +1 para cada dois outros poderes da Tormenta que você possui.',
    type: GeneralPowerType.TORMENTA,
    requirements: [],
  },
  {
    name: 'Armamento Aberrante',
    description:
      'Você pode gastar uma ação de movimento e 1 PM para produzir uma arma orgânica macabra — ela brota do seu braço, ombro ou costas como uma planta grotesca e então se desprende. Você pode produzir qualquer arma corpo a corpo ou de arremesso com a qual seja proficiente. O dano da arma aumenta em um passo para cada dois outros poderes da Tormenta que você possui. A arma dura pela cena, então se desfaz numa poça de gosma. Pré-requisito: outro poder da Tormenta.',
    type: GeneralPowerType.TORMENTA,
    requirements: [
      {
        type: RequirementType.PODER_TORMENTA,
        value: 1,
      },
    ],
  },
];

export default tormentaPowers;
