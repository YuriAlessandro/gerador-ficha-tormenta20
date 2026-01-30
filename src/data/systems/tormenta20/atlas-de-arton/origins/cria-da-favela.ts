import Origin, {
  Items,
  OriginBenefits,
  AttributeModifier,
} from '../../../../../interfaces/Origin';
import atlasOriginPowers from '../powers/originPowers';
import { Armas } from '../../equipamentos';
import { Atributo } from '../../atributos';

/**
 * Função customizada para origens regionais - retorna TODOS os benefícios
 * (diferente das origens básicas que permitem escolher 2)
 */
function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [],
    powers: {
      origin: [atlasOriginPowers.CRIA_DA_FAVELA],
      general: [],
    },
  };
}

const CRIA_DA_FAVELA: Origin = {
  name: 'Cria da Favela (Valkaria)',
  pericias: [],
  poderes: [atlasOriginPowers.CRIA_DA_FAVELA],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Andrajos de aldeão',
    },
    {
      equipment: 'Corda',
    },
    {
      equipment: Armas.BORDAO,
      description: 'Vara de madeira',
    },
  ],
  getAttributeModifier: (): AttributeModifier => ({
    attribute: Atributo.CONSTITUICAO,
    modifier: 1,
  }),
};

export default CRIA_DA_FAVELA;
