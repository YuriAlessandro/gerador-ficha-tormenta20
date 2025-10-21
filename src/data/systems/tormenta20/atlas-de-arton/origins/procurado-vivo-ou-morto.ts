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
      origin: [atlasOriginPowers.PROCURADO_VIVO_OU_MORTO],
      general: [],
    },
  };
}

const PROCURADO_VIVO_OU_MORTO: Origin = {
  name: 'Procurado: Vivo ou Morto (Smokestone)',
  pericias: [],
  poderes: [atlasOriginPowers.PROCURADO_VIVO_OU_MORTO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => {
    return [
      {
        equipment: 'Pistola',
        qtd: 1,
      },
      {
        equipment: 'Balas cruéis',
        qtd: 20,
      },
    ];
  },
};

export default PROCURADO_VIVO_OU_MORTO;
