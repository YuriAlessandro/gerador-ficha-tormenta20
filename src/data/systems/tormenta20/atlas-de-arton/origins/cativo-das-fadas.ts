import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import atlasOriginPowers from '../powers/originPowers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [],
    powers: {
      origin: [atlasOriginPowers.CATIVO_DAS_FADAS],
      general: [],
    },
  };
}

const CATIVO_DAS_FADAS: Origin = {
  name: 'Cativo das Fadas (Pondsmânia)',
  pericias: [],
  poderes: [atlasOriginPowers.CATIVO_DAS_FADAS],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Corda',
    },
    {
      equipment: 'Ração de viagem',
      qtd: 10,
    },
    {
      equipment: 'Essência de mana',
    },
  ],
};

export default CATIVO_DAS_FADAS;
