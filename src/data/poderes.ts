import combatPowers from './powers/combatPowers';
import grantedPowers from './powers/grantedPowers';
import destinyPowers from './powers/destinyPowers';
import magicPowers from './powers/spellPowers';
import tormentaPowers from './powers/tormentPowers';
import { GeneralPowers } from '../interfaces/Poderes';

const generalPowers: GeneralPowers = {
  COMBATE: Object.values(combatPowers),
  CONCEDIDOS: grantedPowers,
  DESTINO: destinyPowers,
  MAGIA: magicPowers,
  TORMENTA: tormentaPowers,
};

export default generalPowers;
