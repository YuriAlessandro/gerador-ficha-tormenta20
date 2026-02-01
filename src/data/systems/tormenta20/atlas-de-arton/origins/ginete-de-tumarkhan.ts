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
    skills: [Skill.CAVALGAR],
    powers: {
      origin: [atlasOriginPowers.GINETE_DE_TUMARKHAN],
      general: [],
    },
  };
}

const GINETE_DE_TUMARKHAN: Origin = {
  name: 'Ginete de Tumarkhân (Khubar)',
  pericias: [Skill.CAVALGAR],
  poderes: [atlasOriginPowers.GINETE_DE_TUMARKHAN],
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

export default GINETE_DE_TUMARKHAN;
