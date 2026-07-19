import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import { Armas } from '../../equipamentos';
import atlasOriginPowers from '../powers/originPowers';

/**
 * Função customizada para origens regionais - retorna TODOS os benefícios
 * (diferente das origens básicas que permitem escolher 2)
 */
function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [],
    powers: {
      origin: [atlasOriginPowers.PROCURADO_VIVO_OU_MORTO],
      general: [],
    },
  };
}

const PROCURADO_VIVO_OU_MORTO: Origin = {
  name: 'Procurado: Vivo ou Morto (Smokestone)',
  pericias: [],
  poderes: [atlasOriginPowers.PROCURADO_VIVO_OU_MORTO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  // Livro: "Itens. Pistola, balas cruéis (20)." Usamos os objetos do catálogo
  // (e não strings) para que a Pistola entre na mochila como Arma — string
  // vira item de texto em "Item Geral" e some da lista de Ataques. As "balas
  // cruéis" não têm entrada própria; `Armas.BALAS` dá munição rastreável.
  getItems: (): Items[] => [
    {
      equipment: Armas.PISTOLA,
    },
    {
      equipment: Armas.BALAS,
    },
  ],
};

export default PROCURADO_VIVO_OU_MORTO;
