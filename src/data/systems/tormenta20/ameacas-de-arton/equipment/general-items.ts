import Equipment from '../../../../../interfaces/Equipment';

/**
 * Novos itens gerais do suplemento Ameaças de Arton - Tormenta 20
 * Apenas disponíveis quando o suplemento está ativo
 */

// ALIMENTAÇÃO (7 itens)
export const AMEACAS_ARTON_FOOD: Equipment[] = [
  {
    nome: 'Algravia',
    group: 'Alimentação',
    preco: 3,
    spaces: 0,
    descricao:
      'Bebida alcoólica adocicada de seiva de feras-cactos. +1 em perícias baseadas em Carisma, cumulativo com outros itens. Doses extras no mesmo dia exigem Fortitude (CD 15, +5 por dose anterior) ou você fica enjoado e perde todos os bônus de alimentação até o fim do dia.',
  },
  {
    nome: 'Banquete de canceronte',
    group: 'Alimentação',
    preco: 36,
    spaces: 0,
    descricao:
      'Você recebe 1d4+1 dados de auxílio: ao fazer um teste de perícia, gaste um para somar 1d4 ao resultado. Preparado por alguém com o poder Mestre Cuca, os dados viram d6.',
  },
  {
    nome: 'Coc-au-triz',
    group: 'Alimentação',
    preco: 54,
    spaces: 0,
    descricao:
      'Ninho de fios de ovos de cocatriz assados. Ao consumir, escolha uma habilidade com custo em PM: o custo dela diminui em –1 PM.',
  },
  {
    nome: 'Cozido de serpe',
    group: 'Alimentação',
    preco: 12,
    spaces: 0,
    descricao:
      'Preparar exige um teste estendido de Ofício (cozinheiro) CD 20, com 3 sucessos antes de 3 falhas. Com sucesso, fornece +1 em todos os testes de perícia, cumulativo com outros itens.',
  },
  {
    nome: 'Gorlegg ensopado',
    group: 'Alimentação',
    preco: 6,
    spaces: 0,
  },
  {
    nome: 'Omelete monstruosa',
    group: 'Alimentação',
    preco: 3,
    spaces: 0,
    descricao:
      'Feita com ovos de qualquer praga monstruosa. Você recebe +2 em rolagens de dano e –2 em testes de perícias baseadas em Sabedoria.',
  },
  {
    nome: 'Sashimi de kraken',
    group: 'Alimentação',
    preco: 60,
    spaces: 0,
    descricao:
      'Iguaria dos maiores chefs de Tamu-ra. Você recebe +2 em Diplomacia, cumulativo com outros itens, e 5 PM temporários.',
  },
];

// ANIMAIS (9 itens) - Categoria: Item Geral
export const AMEACAS_ARTON_ANIMALS: Equipment[] = [
  {
    nome: 'Bulette',
    group: 'Animal',
    preco: 500,
    spaces: 0,
    descricao:
      'Fera temperamental e feroz, vendida na Grande Savana, no Deserto da Perdição e em Doherimm (dobro do preço em outros lugares). Parceiro montaria iniciante.',
  },
  {
    nome: 'Capivara',
    group: 'Animal',
    preco: 60,
    spaces: 0,
    descricao:
      'Apreciada por ginetes Pequenos como hynne e goblins. Parceiro montaria iniciante para personagens Pequenos e Minúsculos.',
  },
  {
    nome: 'Corcel do deserto',
    group: 'Animal',
    preco: 150,
    spaces: 0,
    descricao:
      'Cavalo insetoide da Grande Savana e do Deserto da Perdição. Parceiro montaria iniciante.',
  },
  {
    nome: 'Dromedário',
    group: 'Animal',
    preco: 75,
    spaces: 0,
    descricao:
      'Encontrado em regiões áridas ou montanhosas. Parceiro montaria iniciante.',
  },
  {
    nome: 'Elefante',
    group: 'Animal',
    preco: 1500,
    spaces: 0,
    descricao:
      'Grande demais para ambientes urbanos; usado como animal de trabalho em áreas abertas. Parceiro montaria iniciante.',
  },
  {
    nome: 'Hiena',
    group: 'Animal',
    preco: 220,
    spaces: 0,
    descricao:
      'Comum entre gnolls. Parceiro especial iniciante para personagens treinados em Adestramento, ou montaria para personagens Pequenos e Minúsculos.',
  },
  {
    nome: 'Leão',
    group: 'Animal',
    preco: 800,
    spaces: 0,
    descricao:
      'Símbolo de nobreza e força; pode ser treinado para aceitar um cavaleiro. Parceiro montaria iniciante.',
  },
  {
    nome: 'Rinoceronte',
    group: 'Animal',
    preco: 600,
    spaces: 0,
    descricao:
      'Antigo gado dos anões de superfície, hoje selvagem e de difícil domesticação. Parceiro montaria iniciante, raramente à venda.',
  },
  {
    nome: 'Urso pardo',
    group: 'Animal',
    preco: 300,
    spaces: 0,
    descricao:
      'Predador robusto de várias regiões de Arton. Incomum, mas pode ser parceiro montaria iniciante.',
  },
];

// EQUIPAMENTO DE AVENTURA (3 itens) - Categoria: Item Geral
export const AMEACAS_ARTON_ADVENTURER_EQUIPMENT: Equipment[] = [
  {
    nome: 'Caixa de voz',
    group: 'Item Geral',
    preco: 50,
    spaces: 1,
    descricao:
      'Mecanismo com 1d4 cargas: ao usar uma habilidade de bardo ou nobre de alcance curto ou médio, gaste uma carga para aumentar o alcance em um passo. Não pode ser fabricado.',
  },
  {
    nome: 'Corda de teia',
    group: 'Item Geral',
    preco: 100,
    spaces: 1,
    descricao:
      'Corda de 10m feita de teia de aranha gigante. Arrebentá-la exige 5 pontos de dano de corte ou um teste de Força CD 28.',
  },
  {
    nome: 'Dente de wisphago',
    group: 'Item Geral',
    preco: 100,
    spaces: 1,
    descricao:
      'Vestido como amuleto. Ao fazer um teste de resistência contra magia arcana, gaste o amuleto para rolar de novo com +2. Uma vez ativado, ele se desfaz. Não pode ser fabricado.',
  },
];

// ESOTÉRICOS (3 itens) - Categoria: Item Geral
export const AMEACAS_ARTON_ESOTERIC: Equipment[] = [
  {
    nome: 'Ankh solar',
    group: 'Esotérico',
    preco: 450,
    spaces: 1,
    descricao:
      'Também serve de arma leve simples corpo a corpo (1d6, crítico 19, corte). Suas magias com teste de resistência ganham o aprimoramento: +2 PM — criaturas que falham não podem recuperar PV por 1 rodada.',
  },
  {
    nome: 'Tomo de guerra',
    group: 'Esotérico',
    preco: 300,
    spaces: 1,
    descricao:
      'Ao lançar uma magia de evocação, você recebe +1 PM para gastar em aprimoramentos dela.',
  },
  {
    nome: 'Tomo do rancor',
    group: 'Esotérico',
    preco: 750,
    spaces: 1,
    descricao:
      'Suas magias de dano ganham o aprimoramento: +2 PM — a magia causa +2d8+2 pontos de dano de corte, impacto ou perfuração, a sua escolha.',
  },
];

// VESTUÁRIO (5 itens)
export const AMEACAS_ARTON_CLOTHING: Equipment[] = [
  {
    nome: 'Garra feroz',
    group: 'Vestuário',
    preco: 60,
    spaces: 1,
    descricao:
      'Pinças de insetos gigantes presas com tiras de couro. Funcionam como uma manopla, e os benefícios valem também para uma garra ou arma natural sob efeito de habilidades como Forma Selvagem.',
  },
  {
    nome: 'Manto do mantor',
    group: 'Vestuário',
    preco: 450,
    spaces: 1,
    descricao:
      'Feito do couro de um mantor. Na escuridão completa, fornece camuflagem total — mesmo contra criaturas que enxergam no escuro.',
  },
  {
    nome: 'Manto pesado',
    group: 'Vestuário',
    preco: 10,
    spaces: 1,
    descricao:
      'Vestes pesadas com capuz largo. Você recebe imunidade à condição ofuscado e, mesmo durante o dia, não é considerado sob luz solar ou semelhante.',
  },
  {
    nome: 'Sombreiro',
    group: 'Vestuário',
    preco: 10,
    spaces: 1,
    descricao:
      'Chapéu de abas muito largas, comum perto de Smokestone. Fornece resistência a efeitos de sentidos +2.',
  },
  {
    nome: 'Traje selako',
    group: 'Vestuário',
    preco: 90,
    spaces: 1,
    descricao:
      'Feito com couro de selako. Você recebe +2 em testes de Atletismo para nadar e +3m em seu deslocamento de natação.',
    // O +2 em Atletismo fica só no texto: vale apenas "para nadar", e o motor
    // não sabe para que o teste está sendo feito. O deslocamento de natação,
    // esse, é um número permanente enquanto o traje está vestido.
    sheetBonuses: [
      {
        source: { type: 'equipment', equipmentName: 'Traje selako' },
        target: { type: 'MovementType', movement: 'natacao', mode: 'add' },
        modifier: { type: 'Fixed', value: 3 },
      },
    ],
  },
];

// ALQUÍMICOS - PREPARADOS (9 itens)
export const AMEACAS_ARTON_ALCHEMY_PREPARED: Equipment[] = [
  {
    nome: 'Bálsamo de drogadora',
    group: 'Alquimía',
    preco: 60,
    spaces: 0.5,
    descricao:
      'Pote de cerâmica com pasta gosmenta. Aplicá-la é uma ação completa e cura 4d6+4 PV.',
  },
  {
    nome: 'Bomba de fumaça',
    group: 'Alquimía',
    preco: 15,
    spaces: 0.5,
    descricao:
      'Segue as regras da bomba, mas em vez de dano emite fumaça espessa com 6m de raio até o fim da cena. Criaturas a até 1,5m têm camuflagem leve; a partir de 3m, camuflagem total.',
  },
  {
    nome: 'Elixir quimérico',
    group: 'Alquimía',
    preco: 120,
    spaces: 0.5,
    descricao:
      'Beber é ação padrão; até o fim da cena você ganha uma mordida (1d6, crítico x2, perfuração). Uma vez por rodada, ao agredir com outra arma, gaste 1 PM para um ataque extra com a mordida. Se já tem mordida, o dano dela aumenta um passo.',
  },
  {
    nome: 'Éter elemental',
    group: 'Alquimía',
    preco: 60,
    spaces: 0.5,
    descricao:
      'Cobre uma arma corpo a corpo ou 20 munições; aplicar é ação padrão e faz causar +1d4 de dano do tipo elemental até o fim da cena. Doses múltiplas não são cumulativas.',
  },
  {
    nome: 'Isca putrefata',
    group: 'Alquimía',
    preco: 60,
    spaces: 0.5,
    descricao:
      'Ação padrão para arremessar em alcance médio; gruda no alvo (Ref CD Des evita) por 1d6 rodadas. Cada morto-vivo não inteligente em alcance curto é atraído (Von CD Des evita) e gasta todas as ações para se aproximar.',
  },
  {
    nome: 'Lágrima pétrea',
    group: 'Alquimía',
    preco: 30,
    spaces: 0.5,
    descricao:
      'Ação padrão para aplicar em criatura adjacente ou arremessar em alcance curto. Uma dose remove todos os efeitos de metamorfose (Ref CD Des evita).',
  },
  {
    nome: 'Óleo de baleia',
    group: 'Alquimía',
    preco: 30,
    spaces: 0.5,
    descricao:
      'Ação padrão para aplicar em uma arma ou pacote de munições: ignora penalidades de combate submerso com esse item até o fim da cena.',
  },
  {
    nome: 'Óleo de besouro',
    group: 'Alquimía',
    preco: 50,
    spaces: 0.5,
    descricao:
      'Serve para lampiões (dobra duração e área de iluminação) ou como explosivo: ação de movimento para acender e ação padrão para arremessar em alcance curto. Criaturas a até 3m sofrem 4d6 de dano de fogo e ficam em chamas.',
  },
  {
    nome: 'Pó azul',
    group: 'Alquimía',
    preco: 150,
    spaces: 0.5,
    descricao:
      'Pó de planta exótica de Galrasia que absorve energia mágica. Inalar é ação completa e recupera 2d4 PM.',
  },
];

// ALQUÍMICOS - CATALISADORES (4 itens)
export const AMEACAS_ARTON_ALCHEMY_CATALYSTS: Equipment[] = [
  {
    nome: 'Corrosivo mineral',
    group: 'Alquimía',
    preco: 150,
    spaces: 0.5,
    descricao:
      'Catalisador: aumenta os dados de dano de magias de ácido em uma categoria (d4→d6, d6→d8, d8→d10, d10→d12, máximo).',
  },
  {
    nome: 'Gelo extremo',
    group: 'Alquimía',
    preco: 150,
    spaces: 0.5,
    descricao:
      'Catalisador: aumenta os dados de dano de magias de frio em uma categoria (d4→d6, d6→d8, d8→d10, d10→d12, máximo).',
  },
  {
    nome: 'Pedaço de língua',
    group: 'Alquimía',
    preco: 30,
    spaces: 0.5,
    descricao:
      'Catalisador: fornece +1 na CD dos testes de Fortitude para resistir às suas magias.',
  },
  {
    nome: 'Raio cristalizado',
    group: 'Alquimía',
    preco: 150,
    spaces: 0.5,
    descricao:
      'Catalisador: aumenta os dados de dano de magias de eletricidade em uma categoria (d4→d6, d6→d8, d8→d10, d10→d12, máximo).',
  },
];

// ALQUÍMICOS - VENENOS (4 itens)
export const AMEACAS_ARTON_ALCHEMY_POISONS: Equipment[] = [
  {
    nome: 'Esporos de cogumelo',
    group: 'Alquimía',
    preco: 75,
    spaces: 0.5,
    descricao:
      'Veneno de inalação. A vítima fica paralisada (lenta) por 1 rodada e depois fica imune a paralisia por este veneno pelo resto da cena.',
  },
  {
    nome: 'Peçonha anciã',
    group: 'Alquimía',
    preco: 1800,
    spaces: 0.5,
    descricao:
      'Veneno de contato extraído de serpes anciãs. Perde 3d12 PV por rodada durante 3 rodadas e ignora imunidade a venenos (perde 3d12 PV).',
  },
  {
    nome: 'Peçonha irritante',
    group: 'Alquimía',
    preco: 10,
    spaces: 0.5,
    descricao:
      'Veneno leve de contato, que não pode ser resistido. Perde 1d6 PV.',
  },
  {
    nome: 'Veneno batraquio',
    group: 'Alquimía',
    preco: 30,
    spaces: 0.5,
    descricao:
      'Veneno de contato feito com saliva de sapos gigantes. Perde 1d12 PV e fica enjoado por 1 rodada (perde 1d6 PV).',
  },
];

export default {
  AMEACAS_ARTON_FOOD,
  AMEACAS_ARTON_ANIMALS,
  AMEACAS_ARTON_ADVENTURER_EQUIPMENT,
  AMEACAS_ARTON_ESOTERIC,
  AMEACAS_ARTON_CLOTHING,
  AMEACAS_ARTON_ALCHEMY_PREPARED,
  AMEACAS_ARTON_ALCHEMY_CATALYSTS,
  AMEACAS_ARTON_ALCHEMY_POISONS,
};
