import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import atlasOriginPowers from '../powers/originPowers';
import EQUIPAMENTOS, { Armas } from '../../equipamentos';
import { itemChoice } from '../../originItemHelpers';

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
    // Recorte marcial da tradição anã: machados, martelos, marretas e picaretas.
    // Derivado da tabela do JDA para não divergir do catálogo.
    const armasTradicionaisAnas = EQUIPAMENTOS.armasMarciais.filter((arma) =>
      [
        Armas.MACHADO_DE_BATALHA,
        Armas.MACHADO_DE_GUERRA,
        Armas.MARTELO_DE_GUERRA,
        Armas.MARRETA,
        Armas.PICARETA,
      ].includes(arma)
    );

    return [
      itemChoice('arma', 'Arma marcial tradicional anã', armasTradicionaisAnas),
      {
        equipment: 'Instrumentos de Ofício (armeiro)',
      },
    ];
  },
};

export default ANAO_DE_ARMAS;
