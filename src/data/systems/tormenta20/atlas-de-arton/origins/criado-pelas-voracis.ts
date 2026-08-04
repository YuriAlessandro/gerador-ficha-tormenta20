import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import atlasOriginPowers from '../powers/originPowers';
import EQUIPAMENTOS, { Armas } from '../../equipamentos';
import { itemChoice } from '../../originItemHelpers';

/**
 * Função customizada para origens regionais - retorna TODOS os benefícios
 * (diferente das origens básicas que permitem escolher 2)
 */
function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.SOBREVIVENCIA],
    powers: {
      origin: [atlasOriginPowers.CRIADO_PELAS_VORACIS],
      general: [],
    },
  };
}

const CRIADO_PELAS_VORACIS: Origin = {
  name: 'Criado pelas Voracis (Galrasia)',
  pericias: [Skill.SOBREVIVENCIA],
  poderes: [atlasOriginPowers.CRIADO_PELAS_VORACIS],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    itemChoice('arma', 'Arma simples', EQUIPAMENTOS.armasSimples),
    itemChoice('armadura', 'Armadura leve', EQUIPAMENTOS.armadurasLeves),
    {
      equipment: Armas.LANCA,
    },
  ],
};

export default CRIADO_PELAS_VORACIS;
