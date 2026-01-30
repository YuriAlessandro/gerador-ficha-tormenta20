import Origin, {
  Items,
  OriginBenefits,
  AttributeModifier,
} from '../../../../../interfaces/Origin';
import { Atributo } from '../../atributos';
import atlasOriginPowers from '../powers/originPowers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [],
    powers: {
      origin: [atlasOriginPowers.ASPIRANTE_A_HEROI],
      general: [],
    },
  };
}

const ASPIRANTE_A_HEROI: Origin = {
  name: 'Aspirante a Herói (Deheon)',
  pericias: [],
  poderes: [atlasOriginPowers.ASPIRANTE_A_HEROI],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Essência de mana',
    },
    {
      equipment: 'Mochila de aventureiro',
    },
  ],
  getAttributeModifier: (classPriority: Atributo[]): AttributeModifier => {
    // Escolhe o atributo de maior prioridade da classe
    const attribute = classPriority[0];
    return {
      attribute,
      modifier: 1,
    };
  },
};

export default ASPIRANTE_A_HEROI;
