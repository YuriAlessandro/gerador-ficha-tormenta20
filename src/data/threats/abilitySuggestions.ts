export interface AbilitySuggestion {
  name: string;
  description: string;
  category?: string;
}

export const ABILITY_SUGGESTIONS: AbilitySuggestion[] = [
  {
    name: 'Agarrar Aprimorado',
    description:
      'Se a criatura acertar um ataque com uma arma natural, pode usar o ataque para agarrar como uma ação livre. Se a criatura tiver outra arma natural, pode usar o ataque para agarrar ou causar dano.',
    category: 'Combate',
  },
  {
    name: 'Ataque Furtivo',
    description:
      'Uma vez por rodada, quando atinge uma criatura desprevenida com um ataque corpo a corpo ou em alcance curto, ou uma criatura que esteja flanqueando, você causa 1d6 pontos de dano extra. A cada dois níveis, esse dano extra aumenta em +1d6.',
    category: 'Combate',
  },
  // {
  //   name: 'Bando',
  //   description:
  //     'A criatura é eficaz em grupo com outros de seu tipo. Se estiver a até 3 m de outra criatura com a mesma habilidade, recebe bônus de +2 em ataques corpo a corpo. Algumas habilidades de Bando concedem outros bônus, como em testes de resistência ou dano. Criaturas com esta habilidade devem ter o mesmo tipo listado.',
  //   category: 'Tático',
  // },
  {
    name: 'Cura Acelerada',
    description:
      'Todo turno, a criatura recupera 1d8 pontos de vida. Isso ocorre mesmo que esteja abaixo de 0 PV, desde que não esteja morta.',
    category: 'Defesa',
  },
  {
    name: 'Deslocamento Especial',
    description:
      'A criatura possui um ou mais modos de deslocamento especiais, listados após seu deslocamento básico. Se houver um deslocamento básico, a criatura só pode usar os modos especiais listados. Inclui escalada, escavação, natação e voo, cada um com regras específicas.',
    category: 'Movimento',
  },
  {
    name: 'Doença',
    description:
      'A criatura causa ou é afetada por doenças, que são descritas em Tormenta20, p. 318.',
    category: 'Especial',
  },
  {
    name: 'Enlaçar',
    description:
      'Se a criatura acertar um ataque com uma arma natural, pode tentar agarrar como uma ação livre. Se tiver outra arma natural, pode escolher entre agarrar ou causar dano.',
    category: 'Combate',
  },
  {
    name: 'Enxame',
    description:
      'Enxames ocupam o mesmo espaço que uma criatura Média, mas não podem ser agarrados, flanqueados ou sofrer ataques precisos. Sofrem metade do dano de armas e efeitos que afetam uma área.',
    category: 'Especial',
  },
  {
    name: 'Evasão',
    description:
      'Se a criatura passar em um teste de Reflexos contra um efeito que causaria dano, ela evita completamente o dano.',
    category: 'Defesa',
  },
  {
    name: 'Evasão Aprimorada',
    description:
      'Se a criatura falhar no teste de Reflexos contra um efeito que causaria dano, ela sofre apenas metade do dano.',
    category: 'Defesa',
  },
  {
    name: 'Familiar',
    description:
      'A criatura pode ser invocada como um familiar. Veja o poder Familiar (Tormenta20, p. 38) e o Apêndice A.',
    category: 'Especial',
  },
  {
    name: 'Foco',
    description:
      'A criatura tem o foco apurado. Em condições normais, ela acerta apenas se tirar 20 no dado. Se estiver em alcance curto, ela acerta com 20% de chance de falha em alcance normal.',
    category: 'Combate',
  },
  {
    name: 'Fortificação',
    description:
      'A criatura tem uma chance de 20% de ignorar acertos críticos e ataques furtivos. Se for bem-sucedida, o ataque é considerado normal.',
    category: 'Defesa',
  },
  {
    name: 'Imunidade',
    description:
      'A criatura é imune a um tipo de efeito ou outro tipo de condição (como imunidade a ácido, magia, etc.).',
    category: 'Defesa',
  },
  {
    name: 'Incorpóreo',
    description:
      'A criatura é feita de energia ou sombra. Só pode ser ferida por armas mágicas, outras criaturas incorpóreas ou magias. Pode atravessar objetos sólidos, não manipula-los, e tem Força nula.',
    category: 'Especial',
  },
  {
    name: 'Magias',
    description: 'A criatura lança magias.',
    category: 'Magia',
  },
];

// Categorias para filtro
export const ABILITY_CATEGORIES = [
  'Todas',
  'Combate',
  'Defesa',
  'Movimento',
  'Tático',
  'Magia',
  'Especial',
];
