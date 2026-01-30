import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import atlasOriginPowers from '../powers/originPowers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [],
    powers: {
      origin: [atlasOriginPowers.TURISTA_DA_ACADEMIA],
      general: [],
    },
  };
}

const TURISTA_DA_ACADEMIA: Origin = {
  name: 'Turista da Academia (Academia Arcana)',
  pericias: [],
  poderes: [atlasOriginPowers.TURISTA_DA_ACADEMIA],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Pergaminho de magia arcana de 1º círculo',
      qtd: 3,
    },
  ],
};

export default TURISTA_DA_ACADEMIA;
