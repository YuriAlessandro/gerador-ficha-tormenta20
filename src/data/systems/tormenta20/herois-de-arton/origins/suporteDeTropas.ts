import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import heroisArtonOriginPowers from './originPowers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [],
    powers: {
      origin: [heroisArtonOriginPowers.SUPORTE_DE_TROPAS],
      general: [],
    },
  };
}

const SUPORTE_DE_TROPAS: Origin = {
  name: 'Suporte de Tropas',
  pericias: [],
  poderes: [heroisArtonOriginPowers.SUPORTE_DE_TROPAS],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Equipamento de viagem',
    },
    {
      equipment: 'Instrumentos de ofício',
    },
    {
      equipment: 'Maleta de medicamentos',
    },
  ],
};

export default SUPORTE_DE_TROPAS;
