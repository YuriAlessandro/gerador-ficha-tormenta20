import combatPowers from './combate';
import destinyPowers from './destino';
import { GeneralPowers } from './types';

const generalPowers: GeneralPowers = {
  COMBATE: combatPowers,
  CONCEDIDOS: [],
  DESTINO: destinyPowers,
  MAGIA: [],
  TORMENTA: [],
};

export default generalPowers;
