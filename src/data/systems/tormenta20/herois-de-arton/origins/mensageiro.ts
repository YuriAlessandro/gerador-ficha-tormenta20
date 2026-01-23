import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import heroisArtonOriginPowers from './originPowers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [],
    powers: {
      origin: [heroisArtonOriginPowers.MENSAGEIRO],
      general: [],
    },
  };
}

const MENSAGEIRO: Origin = {
  name: 'Mensageiro',
  pericias: [],
  poderes: [heroisArtonOriginPowers.MENSAGEIRO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Cavalo com sela',
    },
    {
      equipment: 'Mochila de aventureiro',
    },
    {
      equipment: 'Traje de viajante',
    },
  ],
};

export default MENSAGEIRO;
