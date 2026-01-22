import {
  GeneralPower,
  GeneralPowerType,
} from '../../../../../interfaces/Poderes';

const DEUSES_ARTON_POWERS: { [key in GeneralPowerType]: GeneralPower[] } = {
  [GeneralPowerType.COMBATE]: [],
  [GeneralPowerType.DESTINO]: [],
  [GeneralPowerType.MAGIA]: [],
  [GeneralPowerType.CONCEDIDOS]: [],
  [GeneralPowerType.TORMENTA]: [],
};

export default DEUSES_ARTON_POWERS;
