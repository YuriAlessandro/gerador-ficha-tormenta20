import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import atlasOriginPowers from '../powers/originPowers';
import { TODAS_AS_ARMAS } from '../../equipamentos';
import { getRandomItemFromArray } from '../../../../../functions/randomUtils';
import { itemChoice } from '../../originItemHelpers';
import { weaponsModifications } from '../../../../rewards/items';

// Melhorias de arma elegíveis pro sorteio: exclui "Material especial" (o
// poder do livro concede uma melhoria "exceto material especial") e qualquer
// melhoria com pré-requisito — a origem concede só UMA melhoria, então uma
// que dependa de outra já aplicada (ex.: Atroz exige Cruel, Pungente exige
// Certeira) nunca seria válida sozinha.
const ELIGIBLE_MELHORIAS = weaponsModifications
  .filter((mod) => mod.mod !== 'Material especial' && !mod.prerequisite)
  .map((mod) => mod.mod);

/**
 * Função customizada para origens regionais - retorna TODOS os benefícios
 * (diferente das origens básicas que permitem escolher 2)
 */
function getAllRegionalBenefits(): OriginBenefits {
  return {
    // Fixo, não "à escolha": o poder de origem já diz "treinado em Ofício
    // (armeiro)" (`originPowers.ts`) — não é um ofício qualquer.
    skills: [Skill.OFICIO_ARMEIRO],
    powers: {
      origin: [atlasOriginPowers.NOBRE_ZAKHAROVIANO],
      general: [],
    },
  };
}

const NOBRE_ZAKHAROVIANO: Origin = {
  name: 'Nobre Zakharoviano (Zakharov)',
  pericias: [Skill.OFICIO_ARMEIRO],
  poderes: [atlasOriginPowers.NOBRE_ZAKHAROVIANO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => {
    // O Atlas lista só "Traje da corte" em Itens; a arma vem do Benefício
    // ("recebe uma arma superior com uma melhoria, exceto material especial"),
    // que não restringe a categoria — daí o pool completo.
    const melhoria = getRandomItemFromArray(ELIGIBLE_MELHORIAS);

    return [
      itemChoice(
        'arma',
        `Arma superior com melhoria: ${melhoria}`,
        TODAS_AS_ARMAS,
        {
          modification: melhoria,
        }
      ),
      {
        equipment: 'Traje da corte',
        qtd: 1,
      },
    ];
  },
};

export default NOBRE_ZAKHAROVIANO;
