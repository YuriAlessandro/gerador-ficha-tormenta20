import Divindade, {
  PREFERRED_WEAPON_NONE,
} from '../../../../interfaces/Divindade';
import GRANTED_POWERS from '../powers/grantedPowers';

const MARAH: Divindade = {
  name: 'Marah',
  preferredWeapon: PREFERRED_WEAPON_NONE,
  poderes: [
    GRANTED_POWERS.AURA_DA_PAZ,
    GRANTED_POWERS.DOM_DA_ESPERANCA,
    GRANTED_POWERS.PALAVRAS_DE_BONDADE,
    GRANTED_POWERS.TALENTO_ARTISTICO,
  ],
};

export default MARAH;
