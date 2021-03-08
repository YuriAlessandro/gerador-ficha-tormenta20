import combatPowers from './combate';
import grantedPowers from './concedidos';
import destinyPowers from './destino';
import magicPowers from './magia';
import tormentaPowers from './tormenta';
import { GeneralPowers } from '../../interfaces/Poderes';

const generalPowers: GeneralPowers = {
  COMBATE: combatPowers,
  CONCEDIDOS: grantedPowers,
  DESTINO: destinyPowers,
  MAGIA: magicPowers,
  TORMENTA: tormentaPowers,
};

export default generalPowers;
