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
    skills: [Skill.GUERRA],
    powers: {
      origin: [atlasOriginPowers.LEGIONARIO],
      general: [],
    },
  };
}

const LEGIONARIO: Origin = {
  name: 'Legionário (Império de Tauron)',
  pericias: [Skill.GUERRA],
  poderes: [atlasOriginPowers.LEGIONARIO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: Armaduras.BRUNEA,
      description: 'Com símbolo da legião',
    },
    {
      equipment: Escudos.ESCUDO_PESADO,
    },
    {
      equipment: 'Gládio',
      qtd: 1,
      description: 'Arma exótica do Império de Tauron',
    },
    {
      equipment: 'Ração de viagem',
      qtd: 10,
    },
  ],
};

export default LEGIONARIO;
