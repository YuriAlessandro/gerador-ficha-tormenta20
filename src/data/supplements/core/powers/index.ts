/**
 * Poderes do Livro Básico Tormenta 20
 */
import combatPowers from '../../../powers/combatPowers';
import grantedPowers from '../../../powers/grantedPowers';
import destinyPowers from '../../../powers/destinyPowers';
import spellPowers from '../../../powers/spellPowers';
import tormentaPowers from '../../../powers/tormentaPowers';
import { GeneralPowers } from '../../../../interfaces/Poderes';

const CORE_POWERS: GeneralPowers = {
  COMBATE: Object.values(combatPowers),
  CONCEDIDOS: Object.values(grantedPowers),
  DESTINO: Object.values(destinyPowers),
  MAGIA: Object.values(spellPowers),
  TORMENTA: Object.values(tormentaPowers),
};

export default CORE_POWERS;
