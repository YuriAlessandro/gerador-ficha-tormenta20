import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import atlasOriginPowers from '../powers/originPowers';
import EQUIPAMENTOS from '../../equipamentos';
import { DestinyPowers } from '../../powers/destinyPowers';
import { itemChoice } from '../../originItemHelpers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [],
    powers: {
      origin: [atlasOriginPowers.COMPETIDOR_DO_CIRCUITO],
      general: [() => DestinyPowers.TORCIDA],
    },
  };
}

const COMPETIDOR_DO_CIRCUITO: Origin = {
  name: 'Competidor do Circuito (Trebuck)',
  pericias: [],
  poderes: [atlasOriginPowers.COMPETIDOR_DO_CIRCUITO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    itemChoice('arma', 'Arma marcial', EQUIPAMENTOS.armasMarciais),
  ],
  getMoney: () => 100,
};

export default COMPETIDOR_DO_CIRCUITO;
