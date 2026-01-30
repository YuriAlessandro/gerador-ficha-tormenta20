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
      origin: [atlasOriginPowers.FUTURA_LENDA],
      general: [],
    },
  };
}

const FUTURA_LENDA: Origin = {
  name: 'Futura Lenda (Nova Malpetrim)',
  pericias: [],
  poderes: [atlasOriginPowers.FUTURA_LENDA],
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

    // Nomes pomposos para armas
    const nomesPomposos = [
      'Lâmina do Destino',
      'Fúria dos Deuses',
      'Vingadora Imortal',
      'Guardião das Estrelas',
      'Destruidora de Mundos',
      'Porta da Eternidade',
      'Cortadora de Almas',
      'Martelo do Juízo',
      'Lança do Crepúsculo',
    ];

    const nomePomposo = getRandomItemFromArray(nomesPomposos);

    return [
      {
        equipment: armaSorteada,
        description: `"${nomePomposo}" (arma comum sem melhorias, apenas nome pomposo)`,
      },
      {
        equipment: 'Essência de mana',
        qtd: 2,
      },
    ];
  },
};

export default FUTURA_LENDA;
