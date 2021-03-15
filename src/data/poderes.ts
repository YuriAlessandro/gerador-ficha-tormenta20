import combatPowers from './powers/combatPowers';
import grantedPowers from './powers/grantedPowers';
import destinyPowers from './powers/destinyPowers';
import spellPowers from './powers/spellPowers';
import tormentaPowers from './powers/tormentaPowers';
import { GeneralPower, GeneralPowers } from '../interfaces/Poderes';

const generalPowers: GeneralPowers = {
  COMBATE: Object.values(combatPowers),
  CONCEDIDOS: Object.values(grantedPowers),
  DESTINO: Object.values(destinyPowers),
  MAGIA: Object.values(spellPowers),
  TORMENTA: Object.values(tormentaPowers),
};

export default generalPowers;

export function getUnrestricedTormentaPowers(): GeneralPower[] {
  return Object.values(tormentaPowers).filter(
    (power) => power.requirements.flat().length === 0
  );
}
