import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import atlasOriginPowers from '../powers/originPowers';
import { Armas } from '../../equipamentos';
import { itemChoice } from '../../originItemHelpers';

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
  getItems: (): Items[] => [
    itemChoice('arma', 'Arco longo ou katana', [Armas.ARCO_LONGO, 'Katana']),
    itemChoice(
      'roupa',
      'Camisa bufante ou traje de seda',
      ['Camisa bufante', 'Traje de seda'],
      1
    ),
  ],
};

export default NITAMURANIANO;
