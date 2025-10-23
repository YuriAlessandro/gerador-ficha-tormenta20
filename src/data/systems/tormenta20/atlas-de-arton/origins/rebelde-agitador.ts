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
    skills: [Skill.INICIATIVA],
    powers: {
      origin: [atlasOriginPowers.REBELDE_AGITADOR],
      general: [],
    },
  };
}

const REBELDE_AGITADOR: Origin = {
  name: 'Rebelde Agitador (Sckharshantallas)',
  pericias: [Skill.INICIATIVA],
  poderes: [atlasOriginPowers.REBELDE_AGITADOR],
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

    // Rola 6d12 para os impostos não pagos
    let impostos = 0;
    for (let i = 0; i < 6; i += 1) {
      impostos += Math.floor(Math.random() * 12) + 1;
    }

    return [
      {
        equipment: armaSelecionada,
        qtd: 1,
      },
      {
        equipment: 'Panfleto revolucionário',
        qtd: 1,
      },
      {
        equipment: `T$ ${impostos} (impostos não pagos)`,
        qtd: 1,
      },
    ];
  },
};

export default REBELDE_AGITADOR;
