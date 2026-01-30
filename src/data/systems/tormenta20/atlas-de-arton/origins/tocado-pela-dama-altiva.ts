import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import atlasOriginPowers from '../powers/originPowers';
import Skill from '../../../../../interfaces/Skills';
import { Armas } from '../../equipamentos';

/**
 * Função customizada para origens regionais - retorna TODOS os benefícios
 * (diferente das origens básicas que permitem escolher 2)
 */
function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.ADESTRAMENTO],
    powers: {
      origin: [atlasOriginPowers.TOCADO_PELA_DAMA_ALTIVA],
      general: [],
    },
  };
}

const TOCADO_PELA_DAMA_ALTIVA: Origin = {
  name: 'Tocado pela Dama Altiva (Moreania)',
  pericias: [Skill.ADESTRAMENTO],
  poderes: [atlasOriginPowers.TOCADO_PELA_DAMA_ALTIVA],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: Armas.BORDAO,
      qtd: 1,
    },
    {
      equipment: 'Ração de viagem',
      qtd: 5,
    },
  ],
};

export default TOCADO_PELA_DAMA_ALTIVA;
