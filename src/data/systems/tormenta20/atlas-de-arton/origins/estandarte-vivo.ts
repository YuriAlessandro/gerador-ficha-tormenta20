import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import atlasOriginPowers from '../powers/originPowers';
import { Armaduras, ARMAS_SIMPLES_E_MARCIAIS } from '../../equipamentos';
import { itemChoice } from '../../originItemHelpers';

/**
 * Função customizada para origens regionais - retorna TODOS os benefícios
 * (diferente das origens básicas que permitem escolher 2)
 */
function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.SOBREVIVENCIA],
    powers: {
      origin: [atlasOriginPowers.ESTANDARTE_VIVO],
      general: [],
    },
  };
}

const ESTANDARTE_VIVO: Origin = {
  name: 'Estandarte Vivo (Ermos Púrpuras)',
  pericias: [Skill.SOBREVIVENCIA],
  poderes: [atlasOriginPowers.ESTANDARTE_VIVO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    itemChoice('arma', 'Arma simples ou marcial', ARMAS_SIMPLES_E_MARCIAIS),
    {
      equipment: Armaduras.GIBAODEPELES,
    },
    {
      equipment: 'Fragmento do estandarte do seu povo',
      description:
        'Se vestido, fornece +1 em testes de Vontade. Este item representa a honra e história do seu povo.',
    },
  ],
};

export default ESTANDARTE_VIVO;
