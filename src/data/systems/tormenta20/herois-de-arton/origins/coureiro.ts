import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import heroisArtonOriginPowers from './originPowers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.FORTITUDE, Skill.OFICIO],
    powers: {
      origin: [heroisArtonOriginPowers.COUREIRO],
      general: [],
    },
  };
}

const COUREIRO: Origin = {
  name: 'Coureiro',
  pericias: [Skill.FORTITUDE, Skill.OFICIO],
  poderes: [heroisArtonOriginPowers.COUREIRO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Faca de corte',
      description: 'Como uma adaga, mas com dano de corte',
    },
    {
      equipment: 'Instrumentos de coureiro',
    },
    {
      equipment: 'T$ 100 em itens alquímicos',
    },
  ],
};

export default COUREIRO;
