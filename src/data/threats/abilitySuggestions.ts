export interface AbilitySuggestion {
  name: string;
  description: string;
  category?: string;
}

export const ABILITY_SUGGESTIONS: AbilitySuggestion[] = [
  {
    name: 'Agarrar Aprimorado',
    description:
      'Se a criatura acertar um ataque com uma arma natural (especificada na habilidade), pode usar o ataque para agarrar como uma ação livre. Se a criatura tiver outra arma natural, pode usar o ataque para agarrar ou causar dano. A descrição da habilidade pode limitar o tipo ou tamanho de criatura que pode ser agarrado.',
    category: 'Combate',
  },
  {
    name: 'Ataque Furtivo',
    description:
      'A criatura é capaz de desferir ataques furtivos, causando dano adicional contra criaturas desprevenidas ou que estejam flanqueadas. O dano adicional é indicado na descrição. Se a criatura tiver múltiplos ataques, o dano furtivo é aplicado apenas uma vez por rodada. Criaturas imunes a dano de precisão ou sem partes vitais são imunes.',
    category: 'Combate',
  },
  {
    name: 'Bando',
    description:
      'A criatura é eficaz em grupo com outros de seu tipo. Se estiver a até 3 m de outra criatura com a mesma habilidade, recebe bônus de +2 em ataques corpo a corpo. Algumas habilidades de Bando concedem outros bônus, como em testes de resistência ou dano. Criaturas com esta habilidade devem ter o mesmo tipo listado.',
    category: 'Tático',
  },
  {
    name: 'Cura Acelerada',
    description:
      'Todo turno, a criatura recupera pontos de vida igual ao valor listado. Isso ocorre mesmo que esteja abaixo de 0 PV, desde que não esteja morta. Se o dano for causado por um tipo listado (como ácido ou fogo), a cura não ocorre. A criatura com cura acelerada 10/ácido recupera 10 PV por turno, a menos que o dano tenha sido causado por ácido.',
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
      'Se a criatura acertar um ataque com uma arma natural, pode tentar agarrar como uma ação livre. Se tiver outra arma natural, pode escolher entre agarrar ou causar dano. A descrição pode limitar o tipo ou tamanho de criatura que pode ser agarrado.',
    category: 'Combate',
  },
  {
    name: 'Enxame',
    description:
      'A criatura é composta por um grupo de indivíduos muito pequenos, como insetos ou ratos. Enxames ocupam o mesmo espaço que uma criatura Média, mas não podem ser agarrados, flanqueados ou sofrer ataques precisos. Sofrem metade do dano de armas e efeitos que afetam uma área.',
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
      'A criatura tem uma chance (indicada por uma porcentagem) de ignorar acertos críticos e ataques furtivos. Se for bem-sucedida, o ataque é considerado normal.',
    category: 'Defesa',
  },
  {
    name: 'Imunidade',
    description:
      'A criatura é imune a um tipo de efeito ou outro tipo de condição. A imunidade será descrita na ficha da criatura (como imunidade a ácido, magia, etc.).',
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
    description:
      'A criatura lança magias. A descrição da habilidade indica quais magias ela pode lançar, a CD de resistência para suas magias e o limite de PM que possui. Algumas criaturas lançam magias como se fossem conjuradores (veja o ND da criatura).',
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
