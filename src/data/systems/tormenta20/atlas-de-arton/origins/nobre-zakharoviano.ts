import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import atlasOriginPowers from '../powers/originPowers';
import { TODAS_AS_ARMAS } from '../../equipamentos';
import { getRandomItemFromArray } from '../../../../../functions/randomUtils';
import { itemChoice } from '../../originItemHelpers';

/**
 * Função customizada para origens regionais - retorna TODOS os benefícios
 * (diferente das origens básicas que permitem escolher 2)
 */
function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.OFICIO],
    powers: {
      origin: [atlasOriginPowers.NOBRE_ZAKHAROVIANO],
      general: [],
    },
  };
}

const NOBRE_ZAKHAROVIANO: Origin = {
  name: 'Nobre Zakharoviano (Zakharov)',
  pericias: [Skill.OFICIO],
  poderes: [atlasOriginPowers.NOBRE_ZAKHAROVIANO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => {
    // O Atlas lista só "Traje da corte" em Itens; a arma vem do Benefício
    // ("recebe uma arma superior com uma melhoria, exceto material especial"),
    // que não restringe a categoria — daí o pool completo.
    const melhorias = [
      'Acurada',
      'Ágil',
      'Equilibrada',
      'Letal',
      'Poderosa',
      'Precisa',
    ];

    const melhoria = getRandomItemFromArray(melhorias);

    return [
      itemChoice(
        'arma',
        `Arma superior com melhoria: ${melhoria}`,
        TODAS_AS_ARMAS
      ),
      {
        equipment: 'Traje da corte',
        qtd: 1,
      },
    ];
  },
};

export default NOBRE_ZAKHAROVIANO;
