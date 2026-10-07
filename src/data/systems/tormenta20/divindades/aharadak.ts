import Divindade from '../../../../interfaces/Divindade';
import grantedPowers from '../powers/grantedPowers';

const AHARADAK: Divindade = {
  name: 'Aharadak',
  preferredWeapon: 'Corrente de Espinhos',
  poderes: [
    grantedPowers.AFINIDADE_COM_A_TORMENTA,
    grantedPowers.EXTASE_DA_LOUCURA,
    grantedPowers.PERCEPCAO_TEMPORAL,
    grantedPowers.REJEICAO_DIVINA,
  ],
};

export default AHARADAK;
