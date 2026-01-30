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
      origin: [atlasOriginPowers.GUARDIAO_GLACIAL],
      general: [],
    },
  };
}

const GUARDIAO_GLACIAL: Origin = {
  name: 'Guardião Glacial (Uivantes)',
  pericias: [],
  poderes: [atlasOriginPowers.GUARDIAO_GLACIAL],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Casaco longo',
      qtd: 1,
    },
    {
      equipment: 'Cavalo glacial',
      qtd: 1,
      description: 'Montaria especial da região',
    },
  ],
};

export default GUARDIAO_GLACIAL;
