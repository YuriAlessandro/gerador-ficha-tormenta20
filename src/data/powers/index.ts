import combatPowers from './combatPowers';
import grantedPowers from './grantedPowers';
import destinyPowers from './destinyPowers';
import magicPowers from './spellPowers';
import tormentaPowers from './tormentPowers';
import { GeneralPowers } from '../../interfaces/Poderes';

const generalPowers: GeneralPowers = {
  COMBATE: combatPowers,
  CONCEDIDOS: grantedPowers,
  DESTINO: destinyPowers,
  MAGIA: magicPowers,
  TORMENTA: tormentaPowers,
};

export default generalPowers;
