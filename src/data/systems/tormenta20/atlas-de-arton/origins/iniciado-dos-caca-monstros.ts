import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import atlasOriginPowers from '../powers/originPowers';
import { Armaduras, ARMAS_SIMPLES_E_MARCIAIS } from '../../equipamentos';
import { itemChoice } from '../../originItemHelpers';

/**
 * Função customizada para origens regionais - retorna TODOS os benefícios
 * (diferente das origens básicas que permitem escolher 2)
 */
function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [],
    powers: {
      origin: [atlasOriginPowers.INICIADO_DOS_CACA_MONSTROS],
      general: [],
    },
  };
}

const INICIADO_DOS_CACA_MONSTROS: Origin = {
  name: 'Iniciado dos Caça-Monstros (Sanguinárias)',
  pericias: [],
  poderes: [atlasOriginPowers.INICIADO_DOS_CACA_MONSTROS],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    itemChoice('arma', 'Arma simples ou marcial', ARMAS_SIMPLES_E_MARCIAIS),
    {
      equipment: Armaduras.GIBAODEPELES,
    },
  ],
};

export default INICIADO_DOS_CACA_MONSTROS;
