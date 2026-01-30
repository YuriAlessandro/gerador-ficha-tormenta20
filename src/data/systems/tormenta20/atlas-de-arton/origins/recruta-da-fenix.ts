import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import atlasOriginPowers from '../powers/originPowers';
import Skill from '../../../../../interfaces/Skills';
import { Armas, Armaduras } from '../../equipamentos';
import { getRandomItemFromArray } from '../../../../../functions/randomUtils';

/**
 * Função customizada para origens regionais - retorna TODOS os benefícios
 * (diferente das origens básicas que permitem escolher 2)
 */
function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.CAVALGAR],
    powers: {
      origin: [atlasOriginPowers.RECRUTA_DA_FENIX],
      general: [],
    },
  };
}

const RECRUTA_DA_FENIX: Origin = {
  name: 'Recruta da Fênix (Triunphus)',
  pericias: [Skill.CAVALGAR],
  poderes: [atlasOriginPowers.RECRUTA_DA_FENIX],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => {
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

    const armaSelecionada = getRandomItemFromArray(armasMarciais);

    return [
      {
        equipment: armaSelecionada,
        qtd: 1,
      },
      {
        equipment: Armaduras.BRUNEA,
        qtd: 1,
      },
      {
        equipment: 'Grifo iniciante',
        qtd: 1,
        description: 'Parceiro montaria',
      },
    ];
  },
};

export default RECRUTA_DA_FENIX;
