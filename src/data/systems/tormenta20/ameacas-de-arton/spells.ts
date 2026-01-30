import { Spell, spellsCircles } from '../../../../interfaces/Spells';
import { SupplementSpells } from '../core';

/**
 * Novas magias do suplemento Ameaças de Arton - Tormenta 20
 * Apenas disponíveis quando o suplemento está ativo
 */

// MAGIAS ARCANAS (5 magias)
const AMEACAS_ARTON_ARCANE_SPELLS: Spell[] = [
  // 1º CÍRCULO (3 magias)
  {
    nome: 'Açoite Flamejante',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    duracao: 'Sustentada',
    resistencia: 'Reflexos reduz parcial',
    spellCircle: spellsCircles.c1,
    school: 'Conv',
    description:
      'Um açoite de fogo surge em uma de suas mãos com a qual possa empunhar uma arma (essa mão fica ocupada pela duração da magia). Você pode usar uma ação padrão para causar 2d6 pontos de dano de fogo com o açoite em uma criatura em alcance curto e deixá-la em chamas e enredada enquanto estiver em chamas dessa forma. Passar na resistência reduz o dano à metade e evita as chamas.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'aumenta o número de alvos em +1 (total de alvos limitado pelo círculo máximo de magia que você pode lançar).',
      },
    ],
  },
  {
    nome: 'Dardo Gélido',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 criatura',
    duracao: 'Instantânea',
    resistencia: 'Fortitude parcial',
    spellCircle: spellsCircles.c1,
    school: 'Evoc',
    description:
      'Você dispara um dardo de gelo contra o alvo, que sofre 2d6 pontos de dano de frio e fica lento por 1 rodada. Passar no teste de resistência reduz o dano à metade e evita a condição.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'aumenta o dano em +1d6.',
      },
    ],
  },
  {
    nome: 'Jato Corrosivo',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    area: 'Linha de 9m',
    duracao: 'Instantânea',
    resistencia: 'Reflexos reduz à metade',
    spellCircle: spellsCircles.c1,
    school: 'Evoc',
    description:
      'Você dispara um jato, que causa 2d6 pontos de dano de ácido às criaturas na área. Contra construtos e objetos soltos, a magia causa +1 ponto de dano por dado.',
    aprimoramentos: [],
  },

  // 2º CÍRCULO (1 magia)
  {
    nome: 'Invocar Fagulha Elemental',
    execucao: 'Completa',
    alcance: 'Curto',
    duracao: 'Sustentada',
    spellCircle: spellsCircles.c2,
    school: 'Conv',
    description:
      'Você transforma uma porção de um elemento inerte em uma criatura elemental Pequena do tipo do elemento alvo. Por exemplo, lançar esta magia em um copo de água cria um elemental da água. Você pode criar elementais do ar, da água, do fogo e da terra com esta magia. O elemental obedece a todos os seus comandos e funciona como um familiar comum (veja Familiares, em Tormenta20, p. 38) ou elemental (veja Elementais). O elemental auxilia apenas você e não conta em seu limite de parceiros.',
    aprimoramentos: [
      {
        addPm: 1,
        text: 'além do normal, o elemental fornece redução 10 contra o dano correspondente a seu tipo.',
      },
      {
        addPm: 2,
        text: 'em vez do normal, o elemental recebe a habilidade de dois familiares, um comum e um elemental.',
      },
    ],
  },

  // 4º CÍRCULO (1 magia)
  {
    nome: 'Transformação em Dragão',
    execucao: 'Completa',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Sustentada',
    spellCircle: spellsCircles.c4,
    school: 'Trans',
    description:
      'Esta magia invoca o poder de um dragão, causando mutações no conjurador que o tornam semelhante a uma criatura dracônica. Você recebe +2 em Força, Constituição, Inteligência e Carisma (esse aumento não oferece PV, PM ou perícias adicionais), +5 na Defesa e redução 30 contra o elemento do sopro do dragão cujo componente material você usou. Uma vez por rodada, você pode gastar uma ação padrão para exalar um sopro que causa 8d6+8 pontos de dano do elemento correspondente em um cone de 9m (Reflexos reduz à metade).\n\nComponente Material: uma peça de couro de dragão ou uma escama de dragão no valor de T$ 1.000.',
    aprimoramentos: [
      {
        addPm: 2,
        text: 'aumenta o dano do sopro em +1d6+1.',
      },
      {
        addPm: 2,
        text: 'aumenta o bônus na Defesa em +1.',
      },
      {
        addPm: 6,
        text: 'além do normal, asas de couro brotam de suas costas. Você recebe deslocamento de voo 18m.',
      },
      {
        addPm: 3,
        text: 'você recebe uma arma natural de mordida (1d6, crítico x2, corte). Uma vez por rodada, quando usa a ação agredir para atacar com outra arma, você pode gastar 1 PM para fazer um ataque corpo a corpo extra com a mordida. Se já possuir uma mordida, em vez disso seu dano aumenta em dois passos.',
      },
      {
        addPm: 3,
        text: 'o bônus em atributos se torna +4.',
      },
    ],
  },
];

// MAGIAS DIVINAS (1 magia)
const AMEACAS_ARTON_DIVINE_SPELLS: Spell[] = [
  // 5º CÍRCULO (1 magia)
  {
    nome: 'Katana Celestial',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    area: 'Linha de 60m ou duas linhas de 30m',
    duracao: 'Instantânea',
    resistencia: 'Reflexos parcial',
    spellCircle: spellsCircles.c5,
    school: 'Evoc',
    description:
      'Um golpe vindo dos céus risca o campo de batalha. Se escolher duas linhas, cada uma deve seguir em uma direção diferente. Criaturas na área sofrem 12d8 pontos de dano de luz (ou 12d12, se forem mortos-vivos) e ficam cegas e surdas até o fim da cena (Reflexos reduz à metade e evita as condições).',
    aprimoramentos: [
      {
        addPm: 3,
        text: 'aumenta o dano em +2d8 (ou +2d12 contra mortos-vivos).',
      },
      {
        addPm: 6,
        text: 'muda a área para uma linha de 120m ou quatro linhas de 30m em direções opostas, formando um "X".',
      },
    ],
  },
];

// MAGIAS UNIVERSAIS (1 magia)
const AMEACAS_ARTON_UNIVERSAL_SPELLS: Spell[] = [
  // 2º CÍRCULO (1 magia)
  {
    nome: 'Momento de Tormenta',
    execucao: 'Completa',
    alcance: 'Pessoal',
    area: 'Cubo de 30m',
    duracao: 'Sustentada',
    resistencia: 'Veja texto',
    spellCircle: spellsCircles.c2,
    school: 'Conv',
    description:
      'Uma nuvem rubra surge acima do conjurador. Uma vez por turno, você pode gastar uma ação padrão para fazer a nuvem manifestar um dos fenômenos a seguir.\n\nChuva ácida. Gotas corrosivas causam 6d4 pontos de dano de ácido em todas as criaturas na área.\n\nNeblina venenosa. Uma neblina faz com que todas as criaturas na área percam 2d12 PV por veneno (Fortitude evita).\n\nRaios escarlates. Até 6 inimigos aleatórios na área sofrem 6d8 pontos de dano de eletricidade (Reflexos reduz à metade).\n\nPesadelos reais. Cada criatura na área sofre 4d6 pontos de dano psíquico e perde 1d4 PM (Vontade reduz o dano à metade e evita a perda de PM).\n\nComponente Material: uma peça de couro de dragão ou uma escama de dragão no valor de T$ 1.000.\n\nEsta magia só pode ser aprendida e lançada por conjuradores que tenham observado uma área de Tormenta pelo menos uma vez. Sua divulgação é proibida e seu uso é permitido apenas em áreas controladas na Academia Arcana e outros lugares restritos, para estudar o fenômeno da Tormenta. Usar esta magia em qualquer outro ponto do Reinado é um crime enquadrado na décima-primeira infração do Vigintílogo.',
    aprimoramentos: [
      {
        addPm: 3,
        text: 'aumenta o dano em +1 dado do mesmo tipo.',
      },
      {
        addPm: 5,
        text: 'além do normal, criaturas na área ficam alquebradas enquanto permanecerem na área.',
      },
      {
        addPm: 5,
        text: '(Apenas Devotos de Aharadak): muda a área para círculo de 1km de raio.',
      },
    ],
  },
];

export const AMEACAS_ARTON_SPELLS: SupplementSpells = {
  arcane: AMEACAS_ARTON_ARCANE_SPELLS,
  divine: AMEACAS_ARTON_DIVINE_SPELLS,
  universal: AMEACAS_ARTON_UNIVERSAL_SPELLS,
};

export default AMEACAS_ARTON_SPELLS;
