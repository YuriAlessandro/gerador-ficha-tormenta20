import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import atlasOriginPowers from '../powers/originPowers';
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
      Armas.ALFANJE,
      Armas.ARCO_CURTO,
      Armas.ARCO_LONGO,
      Armas.BESTA_LEVE,
      Armas.BESTA_PESADA,
      Armas.ESPADA_BASTARDA,
      Armas.ESPADA_CURTA,
      Armas.ESPADA_LONGA,
      Armas.MACHADO_DE_BATALHA,
      Armas.MACHADO_DE_GUERRA,
      Armas.MARTELO_DE_GUERRA,
      Armas.MONTANTE,
    ];

    const todasArmas = [...armasSimples, ...armasMarciais];
    const armaSorteada = getRandomItemFromArray(todasArmas);

    return [
      {
        equipment: armaSorteada,
        description: 'Arma simples ou marcial',
      },
      {
        equipment: Armaduras.GIBAO_DE_PELES,
      },
      {
        equipment: 'Fragmento do estandarte do seu povo',
        description:
          'Se vestido, fornece +1 em testes de Vontade. Este item representa a honra e história do seu povo.',
      },
    ];
  },
};

export default ESTANDARTE_VIVO;
