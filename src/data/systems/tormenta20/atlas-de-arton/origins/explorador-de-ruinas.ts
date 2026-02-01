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
      origin: [atlasOriginPowers.EXPLORADOR_DE_RUINAS],
      general: [],
    },
  };
}

const EXPLORADOR_DE_RUINAS: Origin = {
  name: 'Explorador de Ruínas (Tyrondir)',
  pericias: [],
  poderes: [atlasOriginPowers.EXPLORADOR_DE_RUINAS],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Mochila de aventureiro',
    },
    {
      equipment: 'Tocha',
    },
    {
      equipment: 'Vara de madeira (3m)',
      description: 'Vara longa para exploração',
    },
  ],
};

export default EXPLORADOR_DE_RUINAS;
