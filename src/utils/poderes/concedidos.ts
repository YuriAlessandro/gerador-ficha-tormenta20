import { DivindadeEnum } from '../divindades/Divindade';
import { GeneralPowerType, GrantedPower } from './types';

const grantedPowers: GrantedPower[] = [
  {
    name: 'Afinidade com a Tormenta',
    description:
      'Você recebe +10 em testes de resistência contra efeitos da Tormenta e de suas criaturas',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
    god: [DivindadeEnum.AHARADAK],
  },
  {
    name: 'Anfíbio',
    description:
      'Você pode respirar embaixo d’água e adquire deslocamento de natação igual a seu deslocamento terrestre.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
    god: [DivindadeEnum.OCEANO],
  },
  {
    name: 'Armas da Ambição',
    description:
      'Você recebe +1 em testes de ataque com armas nas quais é proficiente.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
    god: [DivindadeEnum.VALKARIA],
  },
];

export default grantedPowers;
