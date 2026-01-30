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
      origin: [atlasOriginPowers.IRMAO_SEM_ESPORAS],
      general: [],
    },
  };
}

const IRMAO_SEM_ESPORAS: Origin = {
  name: 'Irmão sem Esporas (Namalkah)',
  pericias: [],
  poderes: [atlasOriginPowers.IRMAO_SEM_ESPORAS],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Bálsamo restaurador',
      qtd: 1,
    },
    {
      equipment: 'Sela',
      qtd: 1,
    },
  ],
};

export default IRMAO_SEM_ESPORAS;
