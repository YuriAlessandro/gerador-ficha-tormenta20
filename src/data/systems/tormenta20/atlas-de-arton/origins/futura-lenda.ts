import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import atlasOriginPowers from '../powers/originPowers';
import { ARMAS_SIMPLES_E_MARCIAIS } from '../../equipamentos';
import { getRandomItemFromArray } from '../../../../../functions/randomUtils';
import { itemChoice } from '../../originItemHelpers';

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
      itemChoice(
        'arma',
        `Arma simples ou marcial — "${nomePomposo}" (arma comum sem melhorias, apenas nome pomposo)`,
        ARMAS_SIMPLES_E_MARCIAIS
      ),
      {
        equipment: 'Essência de mana',
        qtd: 2,
      },
    ];
  },
};

export default FUTURA_LENDA;
