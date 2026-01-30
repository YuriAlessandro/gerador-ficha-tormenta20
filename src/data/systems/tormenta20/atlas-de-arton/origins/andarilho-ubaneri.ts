import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import atlasOriginPowers from '../powers/originPowers';
import { Armas, Escudos } from '../../equipamentos';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [],
    powers: {
      origin: [atlasOriginPowers.ANDARILHO_UBANERI],
      general: [],
    },
  };
}

const ANDARILHO_UBANERI: Origin = {
  name: 'Andarilho Ubaneri (Ubani)',
  pericias: [],
  poderes: [atlasOriginPowers.ANDARILHO_UBANERI],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: Escudos.ESCUDO_PESADO,
    },
    {
      equipment: Armas.LANCA,
    },
    {
      equipment: 'Alikunhá (parceiro iniciante)',
      description: 'Não conta no limite de parceiros',
    },
  ],
};

export default ANDARILHO_UBANERI;
