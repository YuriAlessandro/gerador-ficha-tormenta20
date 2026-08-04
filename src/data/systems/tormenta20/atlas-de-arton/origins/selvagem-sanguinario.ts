import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import atlasOriginPowers from '../powers/originPowers';
import Skill from '../../../../../interfaces/Skills';
import EQUIPAMENTOS, { Armaduras } from '../../equipamentos';
import { itemChoice } from '../../originItemHelpers';

/**
 * Função customizada para origens regionais - retorna TODOS os benefícios
 * (diferente das origens básicas que permitem escolher 2)
 */
function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.SOBREVIVENCIA],
    powers: {
      origin: [atlasOriginPowers.SELVAGEM_SANGUINARIO],
      general: [],
    },
  };
}

const SELVAGEM_SANGUINARIO: Origin = {
  name: 'Selvagem Sanguinário (Sanguinárias)',
  pericias: [Skill.SOBREVIVENCIA],
  poderes: [atlasOriginPowers.SELVAGEM_SANGUINARIO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    itemChoice('arma', 'Arma marcial', EQUIPAMENTOS.armasMarciais, 1),
    {
      equipment: Armaduras.GIBAODEPELES,
      qtd: 1,
    },
  ],
};

export default SELVAGEM_SANGUINARIO;
