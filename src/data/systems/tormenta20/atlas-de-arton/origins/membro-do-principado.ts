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
    skills: [Skill.DIPLOMACIA, Skill.INTUICAO],
    powers: {
      origin: [atlasOriginPowers.MEMBRO_DO_PRINCIPADO],
      general: [],
    },
  };
}

const MEMBRO_DO_PRINCIPADO: Origin = {
  name: 'Membro do Principado (Sambúrdia)',
  pericias: [Skill.DIPLOMACIA, Skill.INTUICAO],
  poderes: [atlasOriginPowers.MEMBRO_DO_PRINCIPADO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Carroça',
      qtd: 1,
    },
    {
      equipment: 'Mercadorias sortidas',
      qtd: 1,
      description: '8 espaços, T$ 400',
    },
  ],
};

export default MEMBRO_DO_PRINCIPADO;
