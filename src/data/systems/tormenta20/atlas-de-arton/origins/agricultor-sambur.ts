import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import atlasOriginPowers from '../powers/originPowers';
import { Armas } from '../../equipamentos';

/**
 * Função customizada para origens regionais - retorna TODOS os benefícios
 * (diferente das origens básicas que permitem escolher 2)
 */
function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.ADESTRAMENTO, Skill.SOBREVIVENCIA],
    powers: {
      origin: [atlasOriginPowers.AGRICULTOR_SAMBUR],
      general: [],
    },
  };
}

const AGRICULTOR_SAMBUR: Origin = {
  name: 'Agricultor Sambur (Sambúrdia)',
  pericias: [Skill.ADESTRAMENTO, Skill.SOBREVIVENCIA],
  poderes: [atlasOriginPowers.AGRICULTOR_SAMBUR],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  getItems: (): Items[] => [
    {
      equipment: Armas.LANCA,
      description: 'Ferramenta agrícola (mesmas estatísticas de uma lança)',
    },
  ],
  getMoney: () => 100,
};

export default AGRICULTOR_SAMBUR;
