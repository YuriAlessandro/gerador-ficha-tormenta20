import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import atlasOriginPowers from '../powers/originPowers';
import Skill from '../../../../../interfaces/Skills';
import { Armas, Escudos } from '../../equipamentos';
import { getRandomItemFromArray } from '../../../../../functions/randomUtils';

/**
 * Função customizada para origens regionais - retorna TODOS os benefícios
 * (diferente das origens básicas que permitem escolher 2)
 */
function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.GUERRA, Skill.INVESTIGACAO],
    powers: {
      origin: [atlasOriginPowers.SUCATEIRO_DE_BATALHAS],
      general: [],
    },
  };
}

const SUCATEIRO_DE_BATALHAS: Origin = {
  name: 'Sucateiro de Batalhas (Conflagração do Aço)',
  pericias: [Skill.GUERRA, Skill.INVESTIGACAO],
  poderes: [atlasOriginPowers.SUCATEIRO_DE_BATALHAS],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => {
    // Armas simples
    const armasSimples = [
      Armas.ADAGA,
      Armas.AZAGAIA,
      Armas.BORDAO,
      Armas.CAJADO_FERRADO,
      Armas.CLAVA,
      Armas.LANCA_MONTARIA,
      Armas.MACHADINHA,
      Armas.MACA,
      Armas.FOICE,
    ];

    // Armas marciais
    const armasMarciais = [
      Armas.ESPADA_LONGA,
      Armas.MACHADO_DE_BATALHA,
      Armas.MANGUAL,
      Armas.MARTELO_DE_GUERRA,
      Armas.TRIDENTE,
      Armas.GLADIO,
      Armas.KATANA,
      Armas.CIMITARRA,
      Armas.ALFANJE,
      Armas.PICARETA_DE_GUERRA,
      Armas.MACHADO_ANAO,
      Armas.LANCA,
      Armas.MONTANTE,
      Armas.ALABARDA,
    ];

    const todasArmas = [...armasSimples, ...armasMarciais];
    const armaSelecionada = getRandomItemFromArray(todasArmas);

    // Escolhe entre escudo leve ou pesado
    const escudos = [Escudos.ESCUDO_LEVE, Escudos.ESCUDO_PESADO];
    const escudoSelecionado = getRandomItemFromArray(escudos);

    // Rola 4d6 para o dinheiro
    let dinheiro = 0;
    for (let i = 0; i < 4; i += 1) {
      dinheiro += Math.floor(Math.random() * 6) + 1;
    }

    return [
      {
        equipment: armaSelecionada,
        qtd: 1,
      },
      {
        equipment: 'Bálsamo restaurador',
        qtd: 1,
      },
      {
        equipment: escudoSelecionado,
        qtd: 1,
      },
      {
        equipment: 'Essência de mana',
        qtd: 1,
      },
      {
        equipment: 'Ração de viagem',
        qtd: 5,
      },
      {
        equipment: `T$ ${dinheiro}`,
        qtd: 1,
      },
    ];
  },
};

export default SUCATEIRO_DE_BATALHAS;
