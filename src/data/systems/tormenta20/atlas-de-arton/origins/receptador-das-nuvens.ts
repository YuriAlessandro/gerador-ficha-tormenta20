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
      origin: [atlasOriginPowers.RECEPTADOR_DAS_NUVENS],
      general: [],
    },
  };
}

const RECEPTADOR_DAS_NUVENS: Origin = {
  name: 'Receptador das Nuvens (Vectora)',
  pericias: [],
  poderes: [atlasOriginPowers.RECEPTADOR_DAS_NUVENS],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Mercadorias raras e variadas',
      qtd: 1,
      description: '2 espaços, T$ 300',
    },
  ],
};

export default RECEPTADOR_DAS_NUVENS;
