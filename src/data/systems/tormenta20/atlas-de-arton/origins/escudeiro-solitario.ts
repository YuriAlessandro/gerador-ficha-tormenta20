import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import atlasOriginPowers from '../powers/originPowers';
import { Armaduras, Escudos } from '../../equipamentos';

/**
 * Função customizada para origens regionais - retorna TODOS os benefícios
 * (diferente das origens básicas que permitem escolher 2)
 */
function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.ENGANACAO, Skill.LADINAGEM],
    powers: {
      origin: [atlasOriginPowers.ESCUDEIRO_SOLITARIO],
      general: [],
    },
  };
}

const ESCUDEIRO_SOLITARIO: Origin = {
  name: 'Escudeiro Solitário (Bielefeld)',
  pericias: [Skill.ENGANACAO, Skill.LADINAGEM],
  poderes: [atlasOriginPowers.ESCUDEIRO_SOLITARIO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: Armaduras.COTA_DE_MALHA,
    },
    {
      equipment: Escudos.ESCUDO_PESADO,
    },
    {
      equipment: 'Enfeite de elmo',
      description: 'Enfeite decorativo para disfarce',
    },
  ],
};

export default ESCUDEIRO_SOLITARIO;
