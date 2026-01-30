import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import atlasOriginPowers from '../powers/originPowers';

/**
 * Função customizada para origens regionais - retorna TODOS os benefícios
 * (diferente das origens básicas que permitem escolher 2)
 */
function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.OFICIO],
    powers: {
      origin: [atlasOriginPowers.LENHADOR_DE_TOLLON],
      general: [],
    },
  };
}

const LENHADOR_DE_TOLLON: Origin = {
  name: 'Lenhador de Tollon (Tollon)',
  pericias: [Skill.OFICIO],
  poderes: [atlasOriginPowers.LENHADOR_DE_TOLLON],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Item superior de madeira Tollon',
      qtd: 1,
      description:
        'Pode ser um arco, uma lança, um escudo ou outro item de madeira de qualidade superior',
    },
  ],
};

export default LENHADOR_DE_TOLLON;
