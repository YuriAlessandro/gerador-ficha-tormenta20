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
    // Escolhe uma arma marcial aleatória para ser a arma superior
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

    const armaSelecionada = getRandomItemFromArray(armasMarciais);

    // Lista de melhorias possíveis
    const melhorias = [
      'Acurada',
      'Ágil',
      'Equilibrada',
      'Letal',
      'Poderósa',
      'Precisa',
    ];

    const melhoria = getRandomItemFromArray(melhorias);

    return [
      {
        equipment: armaSelecionada,
        description: `Arma superior com melhoria: ${melhoria}`,
      },
      {
        equipment: 'Traje da corte',
        qtd: 1,
      },
    ];
  },
};

export default NOBRE_ZAKHAROVIANO;
