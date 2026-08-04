import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import atlasOriginPowers from '../powers/originPowers';
import { ARMAS_SIMPLES_E_MARCIAIS } from '../../equipamentos';
import { itemChoice } from '../../originItemHelpers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [],
    powers: {
      origin: [atlasOriginPowers.APRENDIZ_DE_DRAGOEIRO],
      general: [],
    },
  };
}

const APRENDIZ_DE_DRAGOEIRO: Origin = {
  name: 'Aprendiz de Dragoeiro (Sckharshantallas)',
  pericias: [],
  poderes: [atlasOriginPowers.APRENDIZ_DE_DRAGOEIRO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    itemChoice('arma', 'Arma simples ou marcial', ARMAS_SIMPLES_E_MARCIAIS),
    {
      equipment: 'Troféu de caça',
    },
    {
      equipment: 'Treckod',
    },
  ],
};

export default APRENDIZ_DE_DRAGOEIRO;
