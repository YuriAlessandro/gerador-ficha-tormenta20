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
      origin: [atlasOriginPowers.DE_OUTRO_MUNDO],
      general: [],
    },
  };
}

const DE_OUTRO_MUNDO: Origin = {
  name: 'De Outro Mundo (Éter Divino)',
  pericias: [],
  poderes: [atlasOriginPowers.DE_OUTRO_MUNDO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Trajes exóticos',
    },
    {
      equipment: 'Item qualquer de até T$ 100 do seu mundo natal',
    },
  ],
};

export default DE_OUTRO_MUNDO;
