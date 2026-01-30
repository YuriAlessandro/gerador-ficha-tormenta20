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
      origin: [atlasOriginPowers.RECRUTA_ARCANO],
      general: [],
    },
  };
}

const RECRUTA_ARCANO: Origin = {
  name: 'Recruta Arcano (Wynlla)',
  pericias: [],
  poderes: [atlasOriginPowers.RECRUTA_ARCANO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Essência de mana',
      qtd: 2,
    },
    {
      equipment: 'Varinha arcana',
      qtd: 1,
    },
  ],
};

export default RECRUTA_ARCANO;
