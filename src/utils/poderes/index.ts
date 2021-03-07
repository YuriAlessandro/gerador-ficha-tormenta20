import combatPowers from './combate';
import grantedPowers from './concedidos';
import destinyPowers from './destino';
import tormentaPowers from './magia';
import { GeneralPowers } from './types';

const generalPowers: GeneralPowers = {
  COMBATE: combatPowers,
  CONCEDIDOS: grantedPowers,
  DESTINO: destinyPowers,
  MAGIA: tormentaPowers,
  TORMENTA: tormentaPowers,
};

export default generalPowers;
