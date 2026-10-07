import Divindade, {
  PREFERRED_WEAPON_ANY,
} from '../../../../interfaces/Divindade';
import GRANTED_POWERS from '../powers/grantedPowers';

const NIMB: Divindade = {
  name: 'Nimb',
  preferredWeapon: PREFERRED_WEAPON_ANY,
  poderes: [
    GRANTED_POWERS.EXTASE_DA_LOUCURA,
    GRANTED_POWERS.PODER_OCULTO,
    GRANTED_POWERS.SORTE_DOS_LOUCOS,
    GRANTED_POWERS.TRANSMISSAO_DA_LOUCURA,
  ],
};

export default NIMB;
