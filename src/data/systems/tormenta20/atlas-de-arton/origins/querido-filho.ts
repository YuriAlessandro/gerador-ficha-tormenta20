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
      origin: [atlasOriginPowers.QUERIDO_FILHO],
      general: [],
    },
  };
}

const QUERIDO_FILHO: Origin = {
  name: 'Querido Filho (Aslothia)',
  pericias: [],
  poderes: [atlasOriginPowers.QUERIDO_FILHO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Essência de sombra',
      qtd: 1,
    },
    {
      equipment: 'Manto camuflado (urbano)',
      qtd: 1,
    },
  ],
};

export default QUERIDO_FILHO;
