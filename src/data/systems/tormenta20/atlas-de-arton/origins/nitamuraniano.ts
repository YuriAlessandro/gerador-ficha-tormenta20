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
      origin: [atlasOriginPowers.NITAMURANIANO],
      general: [],
    },
  };
}

const NITAMURANIANO: Origin = {
  name: 'Nitamuraniano (Valkaria)',
  pericias: [],
  poderes: [atlasOriginPowers.NITAMURANIANO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => {
    // Escolhe entre arco longo e katana
    const armas = [Armas.ARCO_LONGO, 'Katana'];
    const armaSelecionada = getRandomItemFromArray(armas);

    // Escolhe entre camisa bufante e traje de seda
    const roupas = ['Camisa bufante', 'Traje de seda'];
    const roupaSelecionada = getRandomItemFromArray(roupas);

    return [
      {
        equipment:
          armaSelecionada === Armas.ARCO_LONGO ? Armas.ARCO_LONGO : 'Katana',
      },
      {
        equipment: roupaSelecionada,
        qtd: 1,
      },
    ];
  },
};

export default NITAMURANIANO;
