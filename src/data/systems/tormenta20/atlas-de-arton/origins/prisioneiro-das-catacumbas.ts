import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import atlasOriginPowers from '../powers/originPowers';
import { Armas } from '../../equipamentos';
import Skill from '../../../../../interfaces/Skills';
import { itemChoice } from '../../originItemHelpers';

/**
 * Função customizada para origens regionais - retorna TODOS os benefícios
 * (diferente das origens básicas que permitem escolher 2)
 */
function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.PERCEPCAO, Skill.REFLEXOS],
    powers: {
      origin: [atlasOriginPowers.PRISIONEIRO_DAS_CATACUMBAS],
      general: [],
    },
  };
}

const PRISIONEIRO_DAS_CATACUMBAS: Origin = {
  name: 'Prisioneiro das Catacumbas (Leverick)',
  pericias: [Skill.PERCEPCAO, Skill.REFLEXOS],
  poderes: [atlasOriginPowers.PRISIONEIRO_DAS_CATACUMBAS],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => {
    // Armas marciais (exceto Montante e Alabarda que são muito grandes para Catacumbas)
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
    ];

    return [itemChoice('arma', 'Arma marcial', armasMarciais, 1)];
  },
};

export default PRISIONEIRO_DAS_CATACUMBAS;
