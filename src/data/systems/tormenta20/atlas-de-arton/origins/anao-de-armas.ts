import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import atlasOriginPowers from '../powers/originPowers';
import { Armas } from '../../equipamentos';
import { getRandomItemFromArray } from '../../../../../functions/randomUtils';

/**
 * Função customizada para origens regionais - retorna TODOS os benefícios
 * (diferente das origens básicas que permitem escolher 2)
 */
function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.OFICIO_ARMEIRO],
    powers: {
      origin: [atlasOriginPowers.ANAO_DE_ARMAS],
      general: [],
    },
  };
}

const ANAO_DE_ARMAS: Origin = {
  name: 'Anão de Armas (Doherimm)',
  pericias: [Skill.OFICIO_ARMEIRO],
  poderes: [atlasOriginPowers.ANAO_DE_ARMAS],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => {
    // Armas marciais tradicionais anãs (machados, martelos, marretas e picaretas)
    const armasTradicoinaisAnas = [
      Armas.MACHADO_DE_BATALHA,
      Armas.MACHADO_DE_ARREMESSO,
      Armas.MARTELO_DE_ARREMESSO,
      Armas.MARTELO_DE_GUERRA,
      Armas.MARRETA,
      Armas.PICARETA_DE_GUERRA,
    ];

    const armaSorteada = getRandomItemFromArray(armasTradicoinaisAnas);

    return [
      {
        equipment: armaSorteada,
        description: 'Arma marcial tradicional anã',
      },
      {
        equipment: 'Instrumentos de Ofício (armeiro)',
      },
    ];
  },
};

export default ANAO_DE_ARMAS;
