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
      origin: [atlasOriginPowers.EMISSARIO_UBANERI],
      general: [],
    },
  };
}

const EMISSARIO_UBANERI: Origin = {
  name: 'Emissário Ubaneri (Ubani)',
  pericias: [],
  poderes: [atlasOriginPowers.EMISSARIO_UBANERI],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Essência de mana',
    },
    {
      equipment: 'Mochila de aventureiro',
    },
    {
      equipment: 'Alikunhá (parceiro iniciante)',
      description:
        'Um parceiro iniciante que o acompanha em suas jornadas. Trate como um aliado NPC de nível 1.',
    },
  ],
};

export default EMISSARIO_UBANERI;
