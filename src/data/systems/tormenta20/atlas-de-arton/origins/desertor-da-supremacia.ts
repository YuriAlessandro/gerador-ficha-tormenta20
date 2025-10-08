import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import atlasOriginPowers from '../powers/originPowers';
import { Armas, Escudos, Armaduras } from '../../equipamentos';

/**
 * Função customizada para origens regionais - retorna TODOS os benefícios
 * (diferente das origens básicas que permitem escolher 2)
 */
function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.GUERRA],
    powers: {
      origin: [atlasOriginPowers.DESERTOR_DA_SUPREMACIA],
      general: [],
    },
  };
}

const DESERTOR_DA_SUPREMACIA: Origin = {
  name: 'Desertor da Supremacia (Supremacia)',
  pericias: [Skill.GUERRA],
  poderes: [atlasOriginPowers.DESERTOR_DA_SUPREMACIA],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: Armaduras.BRUNEA,
      description: 'Brunea com símbolo purista raspado',
    },
    {
      equipment: Escudos.ESCUDO_PESADO,
    },
    {
      equipment: Armas.ESPADA_BASTARDA,
    },
    {
      equipment: 'Ração de viagem',
      qtd: 10,
    },
  ],
};

export default DESERTOR_DA_SUPREMACIA;
