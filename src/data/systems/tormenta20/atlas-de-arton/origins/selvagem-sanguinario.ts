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
        equipment: Armaduras.GIBAO_DE_PELES,
        qtd: 1,
      },
    ];
  },
};

export default SELVAGEM_SANGUINARIO;
