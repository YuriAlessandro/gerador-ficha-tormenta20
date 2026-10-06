import Divindade from '../../../../interfaces/Divindade';
import GRANTED_POWERS from '../powers/grantedPowers';

const KHALMYR: Divindade = {
  name: 'Khalmyr',
  preferredWeapon: 'Espada Longa',
  poderes: [
    GRANTED_POWERS.CORAGEM_TOTAL,
    GRANTED_POWERS.DOM_DA_VERDADE,
    GRANTED_POWERS.ESPADA_JUSTICEIRA,
    GRANTED_POWERS.REPARAR_INJUSTICA,
  ],
};

export default KHALMYR;
