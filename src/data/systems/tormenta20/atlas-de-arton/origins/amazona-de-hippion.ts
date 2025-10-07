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
    skills: [Skill.CAVALGAR],
    powers: {
      origin: [atlasOriginPowers.AMAZONA_DE_HIPPION],
      general: [],
    },
  };
}

const AMAZONA_DE_HIPPION: Origin = {
  name: 'Amazona de Hippion (Deheon, Namalkah)',
  pericias: [Skill.CAVALGAR],
  poderes: [atlasOriginPowers.AMAZONA_DE_HIPPION],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  getItems: (): Items[] => {
    // Escolhe arma simples ou marcial aleatória
    const armasSimples = [
      Armas.ADAGA,
      Armas.AZAGAIA,
      Armas.BORDAO,
      Armas.CLAVA,
      Armas.FACA,
      Armas.FOICE,
      Armas.LANCA,
      Armas.LANCA_MONTARIA,
      Armas.MANGUAL,
      Armas.MACHADINHA,
    ];

    const armasMarciais = [
      Armas.ALABARDA,
      Armas.ESPADA_BASTARDA,
      Armas.ESPADA_CURTA,
      Armas.ESPADA_LONGA,
      Armas.FLORETE,
      Armas.GLAIVE,
      Armas.LANCA_DE_CAVALARIA,
      Armas.MACHADO_DE_BATALHA,
      Armas.MANGUAL_PESADO,
      Armas.MARTELO_DE_GUERRA,
      Armas.PICARETA_DE_GUERRA,
    ];

    const todasArmas = [...armasSimples, ...armasMarciais];
    const armaSorteada = getRandomItemFromArray(todasArmas);

    return [
      {
        equipment: armaSorteada,
        description: 'Arma simples ou marcial',
      },
      {
        equipment: 'Cavalo de guerra',
        description: 'Montaria treinada para combate',
      },
    ];
  },
};

export default AMAZONA_DE_HIPPION;
