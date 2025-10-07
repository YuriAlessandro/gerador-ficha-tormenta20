import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import atlasOriginPowers from '../powers/originPowers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.NOBREZA],
    powers: {
      origin: [atlasOriginPowers.BARAO_ARRUINADO],
      general: [],
    },
  };
}

const BARAO_ARRUINADO: Origin = {
  name: 'Barão Arruinado (Trebuck)',
  pericias: [Skill.NOBREZA],
  poderes: [atlasOriginPowers.BARAO_ARRUINADO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  getItems: (): Items[] => [
    {
      equipment: 'Anel com símbolo da família',
      description: 'Vale T$ 200',
    },
    {
      equipment: 'Títulos de terras expirados',
      description: '+2 em Diplomacia com nobres e burocratas',
    },
    {
      equipment: 'Traje da corte',
    },
  ],
  getMoney: () => 200,
};

export default BARAO_ARRUINADO;
