import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import atlasOriginPowers from '../powers/originPowers';
import { itemChoice } from '../../originItemHelpers';
import { Armas, Escudos } from '../../equipamentos';
import { esotericItems } from '../../equipamentos-gerais';

// Regra exata (Atlas de Arton): "Apenas armas de madeira — arcos, bordões,
// clavas, lanças, piques e tacapes —, escudos leves e esotéricos podem ser
// feitos com madeira Tollon." Nem toda arma serve (só as de madeira listadas),
// nem qualquer escudo (só o leve), e Armadura fica de fora inteiramente.
const MADEIRA_TOLLON_WEAPONS = [
  Armas.ARCOCURTO,
  Armas.ARCO_LONGO,
  Armas.BORDAO,
  Armas.CLAVA,
  Armas.LANCA,
  Armas.LANCA_MONTADA,
  Armas.PIQUE,
  Armas.TACAPE,
];

const MADEIRA_TOLLON_POOL = [
  ...MADEIRA_TOLLON_WEAPONS,
  Escudos.ESCUDOLEVE,
  ...esotericItems,
];

/**
 * Função customizada para origens regionais - retorna TODOS os benefícios
 * (diferente das origens básicas que permitem escolher 2)
 */
function getAllRegionalBenefits(): OriginBenefits {
  return {
    // Fixo, não "à escolha": o poder de origem já dá +5 especificamente em
    // Ofício (Artesão) (`originPowers.ts`), então o treinamento tem que ser
    // nessa mesma perícia — senão o bônus do poder cairia numa perícia que o
    // personagem nem é treinado.
    skills: [Skill.OFICIO_ARTESANATO],
    powers: {
      origin: [atlasOriginPowers.LENHADOR_DE_TOLLON],
      general: [],
    },
  };
}

const LENHADOR_DE_TOLLON: Origin = {
  name: 'Lenhador de Tollon (Tollon)',
  pericias: [Skill.OFICIO_ARTESANATO],
  poderes: [atlasOriginPowers.LENHADOR_DE_TOLLON],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    itemChoice(
      'item-madeira-tollon',
      'Item superior de madeira Tollon (arco, bordão, clava, lança, pique, tacape, escudo leve ou item esotérico)',
      MADEIRA_TOLLON_POOL,
      { qtd: 1, specialMaterial: 'madeira Tollon' }
    ),
  ],
};

export default LENHADOR_DE_TOLLON;
