import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import atlasOriginPowers from '../powers/originPowers';
import { Armas } from '../../equipamentos';
import { getRandomItemFromArray } from '../../../../../functions/randomUtils';
import { DestinyPowers } from '../../powers/destinyPowers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [],
    powers: {
      origin: [atlasOriginPowers.COMPETIDOR_DO_CIRCUITO],
      general: [() => DestinyPowers.TORCIDA],
    },
  };
}

const COMPETIDOR_DO_CIRCUITO: Origin = {
  name: 'Competidor do Circuito (Trebuck)',
  pericias: [],
  poderes: [atlasOriginPowers.COMPETIDOR_DO_CIRCUITO],
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

    const armaSorteada = getRandomItemFromArray(armasMarciais);

    return [
      {
        equipment: armaSorteada,
        description: 'Arma marcial',
      },
    ];
  },
  getMoney: () => 100,
};

export default COMPETIDOR_DO_CIRCUITO;
