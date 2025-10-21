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
    skills: [Skill.ATUACAO],
    powers: {
      origin: [atlasOriginPowers.LIRICISTA_DE_LENORIENN],
      general: [],
    },
  };
}

const LIRICISTA_DE_LENORIENN: Origin = {
  name: 'Liricista de Lenórienn (Lamnor)',
  pericias: [Skill.ATUACAO],
  poderes: [atlasOriginPowers.LIRICISTA_DE_LENORIENN],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Alaúde élfico',
      qtd: 1,
    },
    {
      equipment: 'Réplica de peça artística élfica',
      qtd: 1,
      description: '1 espaço, T$ 50',
    },
  ],
};

export default LIRICISTA_DE_LENORIENN;
