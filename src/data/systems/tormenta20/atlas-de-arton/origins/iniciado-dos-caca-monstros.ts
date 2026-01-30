import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import atlasOriginPowers from '../powers/originPowers';
import { Armas } from '../../equipamentos';
import { getRandomItemFromArray } from '../../../../../functions/randomUtils';

/**
 * Função customizada para origens regionais - retorna TODOS os benefícios
 * (diferente das origens básicas que permitem escolher 2)
 */
function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [],
    powers: {
      origin: [atlasOriginPowers.INICIADO_DOS_CACA_MONSTROS],
      general: [],
    },
  };
}

const INICIADO_DOS_CACA_MONSTROS: Origin = {
  name: 'Iniciado dos Caça-Monstros (Sanguinárias)',
  pericias: [],
  poderes: [atlasOriginPowers.INICIADO_DOS_CACA_MONSTROS],
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
      Armas.CIMITARRA,
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
      },
      {
        equipment: 'Gibão de peles',
        qtd: 1,
      },
    ];
  },
};

export default INICIADO_DOS_CACA_MONSTROS;
