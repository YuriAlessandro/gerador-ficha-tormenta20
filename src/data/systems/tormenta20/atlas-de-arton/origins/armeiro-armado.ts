import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import atlasOriginPowers from '../powers/originPowers';
import { Armas } from '../../equipamentos';
import { itemChoice } from '../../originItemHelpers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.OFICIO_ARMEIRO],
    powers: {
      origin: [atlasOriginPowers.ARMEIRO_ARMADO],
      general: [],
    },
  };
}

const ARMEIRO_ARMADO: Origin = {
  name: 'Armeiro Armado (Zakharov)',
  pericias: [Skill.OFICIO_ARMEIRO],
  poderes: [atlasOriginPowers.ARMEIRO_ARMADO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => {
    const armasMarciais = [
      Armas.ALABARDA,
      Armas.ARCO_CURTO,
      Armas.ARCO_LONGO,
      Armas.BESTA_LEVE,
      Armas.BESTA_PESADA,
      Armas.CHICOTE,
      Armas.CIMITARRA,
      Armas.ESPADA_BASTARDA,
      Armas.ESPADA_CURTA,
      Armas.ESPADA_LONGA,
      Armas.ESPADAO,
      Armas.FOICE_DE_GUERRA,
      Armas.GLAIVE,
      Armas.LANCA_DE_CAVALARIA,
      Armas.LANCA_MONTANTE,
      Armas.MACHADO_DE_ARREMESSO,
      Armas.MACHADO_DE_BATALHA,
      Armas.MANGUAL,
      Armas.MARTELO_DE_ARREMESSO,
      Armas.MARTELO_DE_GUERRA,
      Armas.MARRETA,
      Armas.PICARETA_DE_GUERRA,
      Armas.TRIDENTE,
    ];

    return [
      itemChoice('arma', 'Arma marcial', armasMarciais),
      {
        equipment: 'Instrumentos de Ofício (armeiro)',
      },
    ];
  },
};

export default ARMEIRO_ARMADO;
