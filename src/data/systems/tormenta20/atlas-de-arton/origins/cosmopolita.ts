import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import atlasOriginPowers from '../powers/originPowers';

/**
 * Função customizada para origens regionais - retorna TODOS os benefícios
 * (diferente das origens básicas que permitem escolher 2)
 */
function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [],
    powers: {
      origin: [atlasOriginPowers.COSMOPOLITA],
      general: [],
    },
  };
}

const COSMOPOLITA: Origin = {
  name: 'Cosmopolita (Valkaria)',
  pericias: [],
  poderes: [atlasOriginPowers.COSMOPOLITA],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Equipamento de viagem',
    },
    {
      equipment: 'Traje de viajante',
    },
    {
      equipment: 'Item artístico de origem cultural indefinida',
      description: '½ espaço, T$ 100',
    },
  ],
};

export default COSMOPOLITA;
