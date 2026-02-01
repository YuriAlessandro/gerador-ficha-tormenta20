import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import atlasOriginPowers from '../powers/originPowers';

/**
 * Função customizada para origens regionais - retorna TODOS os benefícios
 * (diferente das origens básicas que permitem escolher 2)
 */
function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [],
    powers: {
      origin: [atlasOriginPowers.DUPLO_FEERICO],
      general: [],
    },
  };
}

const DUPLO_FEERICO: Origin = {
  name: 'Duplo Feérico (Pondsmânia)',
  pericias: [],
  poderes: [atlasOriginPowers.DUPLO_FEERICO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Essência de mana',
      description: 'Pequeno frasco com essência mágica',
    },
    {
      equipment:
        'Marca no corpo ou característica física não possuída pela sua versão original',
      description:
        'Uma marca ou traço feérico que diferencia você de sua versão original',
    },
  ],
};

export default DUPLO_FEERICO;
