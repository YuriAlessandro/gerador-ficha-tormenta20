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
      origin: [atlasOriginPowers.PESCADOR_PARRUDO],
      general: [],
    },
  };
}

const PESCADOR_PARRUDO: Origin = {
  name: 'Pescador Parrudo (Khubar)',
  pericias: [],
  poderes: [atlasOriginPowers.PESCADOR_PARRUDO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => {
    return [
      {
        equipment: 'Vara de pesca',
        qtd: 1,
      },
      {
        equipment: 'Peixes raros salgados para revenda',
        qtd: 1,
      },
    ];
  },
};

export default PESCADOR_PARRUDO;
