import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import atlasOriginPowers from '../powers/originPowers';
import EQUIPAMENTOS from '../../equipamentos';
import { itemChoice } from '../../originItemHelpers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.OFICIO_ARMEIRO],
    powers: {
      origin: [atlasOriginPowers.ARMEIRO_ARMADO],
      general: [],
    },
  };
}

const ARMEIRO_ARMADO: Origin = {
  name: 'Armeiro Armado (Zakharov)',
  pericias: [Skill.OFICIO_ARMEIRO],
  poderes: [atlasOriginPowers.ARMEIRO_ARMADO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    itemChoice('arma', 'Arma marcial', EQUIPAMENTOS.armasMarciais),
    {
      equipment: 'Instrumentos de Ofício (armeiro)',
    },
  ],
};

export default ARMEIRO_ARMADO;
