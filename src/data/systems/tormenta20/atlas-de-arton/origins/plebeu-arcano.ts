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
      origin: [atlasOriginPowers.PLEBEU_ARCANO],
      general: [],
    },
  };
}

const PLEBEU_ARCANO: Origin = {
  name: 'Plebeu Arcano (Wynlla)',
  pericias: [],
  poderes: [atlasOriginPowers.PLEBEU_ARCANO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Bandoleira de poções',
      qtd: 1,
    },
    {
      equipment: 'Gorro de ervas',
      qtd: 1,
    },
    {
      equipment: 'Poção arcana de 1º círculo',
      qtd: 1,
    },
  ],
};

export default PLEBEU_ARCANO;
