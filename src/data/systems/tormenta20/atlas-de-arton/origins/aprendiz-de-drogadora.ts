import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import atlasOriginPowers from '../powers/originPowers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.CURA, Skill.OFICIO_ALQUIMIA],
    powers: {
      origin: [atlasOriginPowers.APRENDIZ_DE_DROGADORA],
      general: [],
    },
  };
}

const APRENDIZ_DE_DROGADORA: Origin = {
  name: 'Aprendiz de Drogadora (Galrasia)',
  pericias: [Skill.CURA, Skill.OFICIO_ALQUIMIA],
  poderes: [atlasOriginPowers.APRENDIZ_DE_DROGADORA],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  getItems: (): Items[] => [
    {
      equipment: 'Bálsamo restaurador',
      qtd: 2,
    },
    {
      equipment: 'Poção de curar ferimentos',
      qtd: 2,
    },
    {
      equipment: 'Maleta de medicamentos',
    },
  ],
};

export default APRENDIZ_DE_DROGADORA;
