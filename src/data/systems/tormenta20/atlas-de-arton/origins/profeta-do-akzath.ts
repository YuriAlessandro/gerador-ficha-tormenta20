import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import atlasOriginPowers from '../powers/originPowers';
import Skill from '../../../../../interfaces/Skills';
import { Armas } from '../../equipamentos';
import { getRandomItemFromArray } from '../../../../../functions/randomUtils';

/**
 * Função customizada para origens regionais - retorna TODOS os benefícios
 * (diferente das origens básicas que permitem escolher 2)
 */
function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.RELIGIAO],
    powers: {
      origin: [atlasOriginPowers.PROFETA_DO_AKZATH],
      general: [],
    },
  };
}

const PROFETA_DO_AKZATH: Origin = {
  name: 'Profeta do Akzath (Lamnor)',
  pericias: [Skill.RELIGIAO],
  poderes: [atlasOriginPowers.PROFETA_DO_AKZATH],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => {
    // Armas simples
    const armasSimples = [
      Armas.ADAGA,
      Armas.AZAGAIA,
      Armas.BORDAO,
      Armas.CAJADO_FERRADO,
      Armas.CLAVA,
      Armas.LANCA_MONTARIA,
      Armas.MACHADINHA,
      Armas.MACA,
      Armas.FOICE,
    ];

    // Armas marciais
    const armasMarciais = [
      Armas.ESPADA_LONGA,
      Armas.MACHADO_DE_BATALHA,
      Armas.MANGUAL,
      Armas.MARTELO_DE_GUERRA,
      Armas.TRIDENTE,
      Armas.GLADIO,
      Armas.KATANA,
      Armas.CIMITARRA,
      Armas.ALFANJE,
      Armas.PICARETA_DE_GUERRA,
      Armas.MACHADO_ANAO,
      Armas.LANCA,
      Armas.MONTANTE,
      Armas.ALABARDA,
    ];

    const todasArmas = [...armasSimples, ...armasMarciais];
    const armaSelecionada = getRandomItemFromArray(todasArmas);

    return [
      {
        equipment: armaSelecionada,
        qtd: 1,
      },
      {
        equipment: Armas.BORDAO,
        qtd: 1,
      },
      {
        equipment: 'Pergaminho com diagrama do Akzath',
        qtd: 1,
      },
    ];
  },
};

export default PROFETA_DO_AKZATH;
