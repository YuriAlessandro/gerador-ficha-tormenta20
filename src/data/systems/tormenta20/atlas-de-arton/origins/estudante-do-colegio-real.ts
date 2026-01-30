import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import atlasOriginPowers from '../powers/originPowers';

/**
 * Função customizada para origens regionais - retorna TODOS os benefícios
 * (diferente das origens básicas que permitem escolher 2)
 */
function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.CURA],
    powers: {
      origin: [atlasOriginPowers.ESTUDANTE_DO_COLEGIO_REAL],
      general: [],
    },
  };
}

const ESTUDANTE_DO_COLEGIO_REAL: Origin = {
  name: 'Estudante do Colégio Real (Salistick)',
  pericias: [Skill.CURA],
  poderes: [atlasOriginPowers.ESTUDANTE_DO_COLEGIO_REAL],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Bálsamo restaurador',
      qtd: 3,
      description: 'Restaura 2d8+2 PV (ação completa)',
    },
    {
      equipment: 'Maleta de medicamentos',
      description: 'Kit médico completo para tratamento',
    },
  ],
};

export default ESTUDANTE_DO_COLEGIO_REAL;
