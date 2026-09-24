import Equipment from '../../../interfaces/Equipment';
import Skill from '../../../interfaces/Skills';

// Função helper para processar preços (remove "T$ " e converte para número)
function parsePrice(priceStr: string): number {
  return parseFloat(priceStr.replace('T$ ', '').replace(',', '.')) || 0;
}

// Função helper para processar espaços (converte "—" para 0, strings para números)
function parseSpaces(spacesStr: string | number): number {
  if (spacesStr === '—' || spacesStr === '') return 0;
  if (typeof spacesStr === 'string') {
    return parseFloat(spacesStr.replace(',', '.')) || 0;
  }
  return spacesStr || 0;
}

// Equipamentos de Aventureiro (categoria: Item Geral)
export const equipamentoAventureiro: Equipment[] = [
  {
    nome: 'Água benta',
    group: 'Item Geral',
    preco: parsePrice('T$ 10'),
    spaces: parseSpaces(0.5),
    rolls: [
      {
        label: 'Dano de Luz',
        dice: '2d10',
        description:
          'O alvo sofre 2d10 pontos de dano de luz (Reflexos CD Sab reduz à metade).',
      },
    ],
  },
  {
    nome: 'Algemas',
    group: 'Item Geral',
    preco: parsePrice('T$ 15'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Arpéu',
    group: 'Item Geral',
    preco: parsePrice('T$ 5'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Bandoleira de poções',
    group: 'Item Geral',
    preco: parsePrice('T$ 20'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Barraca',
    group: 'Item Geral',
    preco: parsePrice('T$ 10'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Corda',
    group: 'Item Geral',
    preco: parsePrice('T$ 1'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Espelho',
    group: 'Item Geral',
    preco: parsePrice('T$ 10'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Lampião',
    group: 'Item Geral',
    preco: parsePrice('T$ 7'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Mochila',
    group: 'Item Geral',
    preco: parsePrice('T$ 2'),
    spaces: parseSpaces('—'),
  },
  {
    nome: 'Mochila de aventureiro',
    group: 'Item Geral',
    preco: parsePrice('T$ 50'),
    spaces: parseSpaces('—'),
    sheetBonuses: [
      {
        source: { type: 'equipment', equipmentName: 'Mochila de aventureiro' },
        target: { type: 'MaxSpaces' },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
  {
    nome: 'Óleo',
    group: 'Item Geral',
    preco: parsePrice('T$ 0,1'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Organizador de pergaminhos',
    group: 'Item Geral',
    preco: parsePrice('T$ 25'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Pé de cabra',
    group: 'Item Geral',
    preco: parsePrice('T$ 2'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Saco de dormir',
    group: 'Item Geral',
    preco: parsePrice('T$ 1'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Símbolo sagrado',
    group: 'Item Geral',
    preco: parsePrice('T$ 5'),
    spaces: parseSpaces(1),
    sheetBonuses: [
      {
        source: { type: 'equipment', equipmentName: 'Símbolo sagrado' },
        target: { type: 'Skill', name: Skill.FORTITUDE },
        modifier: { type: 'Fixed', value: 1 },
      },
      {
        source: { type: 'equipment', equipmentName: 'Símbolo sagrado' },
        target: { type: 'Skill', name: Skill.REFLEXOS },
        modifier: { type: 'Fixed', value: 1 },
      },
      {
        source: { type: 'equipment', equipmentName: 'Símbolo sagrado' },
        target: { type: 'Skill', name: Skill.VONTADE },
        modifier: { type: 'Fixed', value: 1 },
      },
    ],
  },
  {
    nome: 'Tocha',
    group: 'Item Geral',
    preco: parsePrice('T$ 0,1'),
    spaces: parseSpaces(1),
    canBeUsedAsWeapon: true,
    weaponStats: {
      dano: '1d4+1',
      critico: 'x2',
      tipo: 'Impacto/Fogo',
    },
  },
  {
    nome: 'Vara de madeira (3m)',
    group: 'Item Geral',
    preco: parsePrice('T$ 0,2'),
    spaces: parseSpaces(1),
  },
];

// Ferramentas (categoria: Item Geral)
export const ferramentas: Equipment[] = [
  {
    nome: 'Alaúde élfico',
    group: 'Item Geral',
    preco: parsePrice('T$ 300'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Coleção de livros',
    group: 'Item Geral',
    preco: parsePrice('T$ 75'),
    spaces: parseSpaces(1),
    selectableBonus: {
      availableSkills: [
        Skill.CONHECIMENTO,
        Skill.GUERRA,
        Skill.MISTICISMO,
        Skill.NOBREZA,
        Skill.RELIGIAO,
      ],
      bonusValue: 1,
      pick: 1,
    },
  },
  {
    nome: 'Equipamento de viagem',
    group: 'Item Geral',
    preco: parsePrice('T$ 10'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Estojo de disfarces',
    group: 'Item Geral',
    preco: parsePrice('T$ 50'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Flauta mística',
    group: 'Item Geral',
    preco: parsePrice('T$ 150'),
    spaces: parseSpaces(1),
    conditionalBonuses: [
      {
        condition: { type: 'isClass', value: 'Bardo' },
        bonuses: [
          {
            source: { type: 'equipment', equipmentName: 'Flauta mística' },
            target: { type: 'SpellDC' },
            modifier: { type: 'Fixed', value: 1 },
          },
        ],
      },
    ],
  },
  {
    nome: 'Gazua',
    group: 'Item Geral',
    preco: parsePrice('T$ 5'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Instrumentos de «ofício»',
    group: 'Item Geral',
    preco: parsePrice('T$ 30'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Instrumento musical',
    group: 'Item Geral',
    preco: parsePrice('T$ 35'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Luneta',
    group: 'Item Geral',
    preco: parsePrice('T$ 100'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Maleta de medicamentos',
    group: 'Item Geral',
    preco: parsePrice('T$ 50'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Sela',
    group: 'Item Geral',
    preco: parsePrice('T$ 20'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Tambor das profundezas',
    group: 'Item Geral',
    preco: parsePrice('T$ 80'),
    spaces: parseSpaces(1),
  },
];

// Vestuário (categoria: Vestuário)
export const vestuario: Equipment[] = [
  {
    nome: 'Andrajos de aldeão',
    group: 'Vestuário',
    preco: parsePrice('T$ 1'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Bandana',
    group: 'Vestuário',
    preco: parsePrice('T$ 5'),
    spaces: parseSpaces(1),
    sheetBonuses: [
      {
        source: { type: 'equipment', equipmentName: 'Bandana' },
        target: { type: 'Skill', name: Skill.INTIMIDACAO },
        modifier: { type: 'Fixed', value: 1 },
      },
    ],
  },
  {
    nome: 'Botas reforçadas',
    group: 'Vestuário',
    preco: parsePrice('T$ 20'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Camisa bufante',
    group: 'Vestuário',
    preco: parsePrice('T$ 25'),
    spaces: parseSpaces(1),
    sheetBonuses: [
      {
        source: { type: 'equipment', equipmentName: 'Camisa bufante' },
        target: { type: 'Skill', name: Skill.ATUACAO },
        modifier: { type: 'Fixed', value: 1 },
      },
    ],
  },
  {
    nome: 'Capa esvoaçante',
    group: 'Vestuário',
    preco: parsePrice('T$ 25'),
    spaces: parseSpaces(1),
    sheetBonuses: [
      {
        source: { type: 'equipment', equipmentName: 'Capa esvoaçante' },
        target: { type: 'Skill', name: Skill.ENGANACAO },
        modifier: { type: 'Fixed', value: 1 },
      },
    ],
  },
  {
    nome: 'Capa pesada',
    group: 'Vestuário',
    preco: parsePrice('T$ 15'),
    spaces: parseSpaces(1),
    sheetBonuses: [
      {
        source: { type: 'equipment', equipmentName: 'Capa pesada' },
        target: { type: 'Skill', name: Skill.FORTITUDE },
        modifier: { type: 'Fixed', value: 1 },
      },
    ],
  },
  {
    nome: 'Casaco longo',
    group: 'Vestuário',
    preco: parsePrice('T$ 20'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Chapéu arcano',
    group: 'Vestuário',
    preco: parsePrice('T$ 50'),
    spaces: parseSpaces(1),
    conditionalBonuses: [
      {
        condition: { type: 'hasClassAbility', value: 'Caminho do Arcanista' },
        bonuses: [
          {
            source: { type: 'equipment', equipmentName: 'Chapéu arcano' },
            target: { type: 'PM' },
            modifier: { type: 'Fixed', value: 1 },
          },
        ],
      },
    ],
  },
  {
    nome: 'Enfeite de elmo',
    group: 'Vestuário',
    preco: parsePrice('T$ 15'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Fardamento de guarnição',
    group: 'Vestuário',
    preco: parsePrice('T$ 1'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Farrapos de ermitão',
    group: 'Vestuário',
    preco: parsePrice('T$ 5'),
    spaces: parseSpaces(1),
    sheetBonuses: [
      {
        source: { type: 'equipment', equipmentName: 'Farrapos de ermitão' },
        target: { type: 'Skill', name: Skill.DIPLOMACIA },
        modifier: { type: 'Fixed', value: -2 },
      },
      {
        source: { type: 'equipment', equipmentName: 'Farrapos de ermitão' },
        target: { type: 'Skill', name: Skill.ADESTRAMENTO },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
  {
    nome: 'Gorro de ervas',
    group: 'Vestuário',
    preco: parsePrice('T$ 75'),
    spaces: parseSpaces(1),
    sheetBonuses: [
      {
        source: { type: 'equipment', equipmentName: 'Gorro de ervas' },
        target: { type: 'Skill', name: Skill.VONTADE },
        modifier: { type: 'Fixed', value: 1 },
      },
    ],
  },
  {
    nome: 'Luva de pelica',
    group: 'Vestuário',
    preco: parsePrice('T$ 5'),
    spaces: parseSpaces(1),
    sheetBonuses: [
      {
        source: { type: 'equipment', equipmentName: 'Luva de pelica' },
        target: { type: 'Skill', name: Skill.LADINAGEM },
        modifier: { type: 'Fixed', value: 1 },
      },
    ],
  },
  {
    nome: 'Manopla',
    group: 'Vestuário',
    preco: parsePrice('T$ 10'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Manto camuflado',
    group: 'Vestuário',
    preco: parsePrice('T$ 12'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Manto eclesiástico',
    group: 'Vestuário',
    preco: parsePrice('T$ 20'),
    spaces: parseSpaces(1),
    sheetBonuses: [
      {
        source: { type: 'equipment', equipmentName: 'Manto eclesiástico' },
        target: { type: 'Skill', name: Skill.RELIGIAO },
        modifier: { type: 'Fixed', value: 1 },
      },
    ],
  },
  {
    nome: 'Robe místico',
    group: 'Vestuário',
    preco: parsePrice('T$ 50'),
    spaces: parseSpaces(1),
    sheetBonuses: [
      {
        source: { type: 'equipment', equipmentName: 'Robe místico' },
        target: { type: 'Skill', name: Skill.MISTICISMO },
        modifier: { type: 'Fixed', value: 1 },
      },
    ],
  },
  {
    nome: 'Sapatos de andruança',
    group: 'Vestuário',
    preco: parsePrice('T$ 8'),
    spaces: parseSpaces(1),
    sheetBonuses: [
      {
        source: { type: 'equipment', equipmentName: 'Sapatos de andruança' },
        target: { type: 'Skill', name: Skill.ACROBACIA },
        modifier: { type: 'Fixed', value: 1 },
      },
    ],
  },
  {
    nome: 'Tabardo',
    group: 'Vestuário',
    preco: parsePrice('T$ 10'),
    spaces: parseSpaces(1),
    sheetBonuses: [
      {
        source: { type: 'equipment', equipmentName: 'Tabardo' },
        target: { type: 'Skill', name: Skill.DIPLOMACIA },
        modifier: { type: 'Fixed', value: 1 },
      },
    ],
  },
  {
    nome: 'Traje da corte',
    group: 'Vestuário',
    preco: parsePrice('T$ 100'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Traje de viajante',
    group: 'Vestuário',
    preco: parsePrice('T$ 10'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Veste de seda',
    group: 'Vestuário',
    preco: parsePrice('T$ 25'),
    spaces: parseSpaces(1),
    sheetBonuses: [
      {
        source: { type: 'equipment', equipmentName: 'Veste de seda' },
        target: { type: 'Skill', name: Skill.REFLEXOS },
        modifier: { type: 'Fixed', value: 1 },
      },
    ],
  },
];

// Esotéricos (categoria: Esotérico)
export const esotericos: Equipment[] = [
  {
    nome: 'Bolsa de pó',
    group: 'Esotérico',
    preco: parsePrice('T$ 300'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Cajado arcano',
    group: 'Esotérico',
    preco: parsePrice('T$ 1000'),
    spaces: parseSpaces(2),
  },
  {
    nome: 'Cetro elemental',
    group: 'Esotérico',
    preco: parsePrice('T$ 750'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Costela de lich',
    group: 'Esotérico',
    preco: parsePrice('T$ 300'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Dedo de ente',
    group: 'Esotérico',
    preco: parsePrice('T$ 200'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Luva de ferro',
    group: 'Esotérico',
    preco: parsePrice('T$ 150'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Medalhão de prata',
    group: 'Esotérico',
    preco: parsePrice('T$ 750'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Orbe cristalina',
    group: 'Esotérico',
    preco: parsePrice('T$ 750'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Tomo hermético',
    group: 'Esotérico',
    preco: parsePrice('T$ 1500'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Varinha arcana',
    group: 'Esotérico',
    preco: parsePrice('T$ 100'),
    spaces: parseSpaces(1),
  },
];

// Alquímicos - Preparados (categoria: Alquimía)
export const alquimicosPreparados: Equipment[] = [
  {
    nome: 'Ácido',
    group: 'Alquimía',
    preco: parsePrice('T$ 10'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Bálsamo restaurador',
    group: 'Alquimía',
    preco: parsePrice('T$ 10'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Bomba',
    group: 'Alquimía',
    preco: parsePrice('T$ 50'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Cosmético',
    group: 'Alquimía',
    preco: parsePrice('T$ 30'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Elixir amor',
    group: 'Alquimía',
    preco: parsePrice('T$ 100'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Essência de mana',
    group: 'Alquimía',
    preco: parsePrice('T$ 50'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Fogo alquímico',
    group: 'Alquimía',
    preco: parsePrice('T$ 10'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Pó do desaparecimento',
    group: 'Alquimía',
    preco: parsePrice('T$ 100'),
    spaces: parseSpaces(0.5),
  },
];

// Alquímicos - Catalisadores (categoria: Alquimía)
export const alquimicosCatalisadores: Equipment[] = [
  {
    nome: 'Baga-de-fogo',
    group: 'Alquimía',
    preco: parsePrice('T$ 30'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Sangue de dragão',
    group: 'Alquimía',
    preco: parsePrice('T$ 45'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Essência abissal',
    group: 'Alquimía',
    preco: parsePrice('T$ 150'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Líquen lilás',
    group: 'Alquimía',
    preco: parsePrice('T$ 30'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Musgo púrpura',
    group: 'Alquimía',
    preco: parsePrice('T$ 45'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Ossos de monstro',
    group: 'Alquimía',
    preco: parsePrice('T$ 45'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Pó de cristal',
    group: 'Alquimía',
    preco: parsePrice('T$ 30'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Pó de giz',
    group: 'Alquimía',
    preco: parsePrice('T$ 30'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Ramo verdejante',
    group: 'Alquimía',
    preco: parsePrice('T$ 45'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Saco de sal',
    group: 'Alquimía',
    preco: parsePrice('T$ 45'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Seiva de âmbar',
    group: 'Alquimía',
    preco: parsePrice('T$ 30'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Terra de cemitério',
    group: 'Alquimía',
    preco: parsePrice('T$ 30'),
    spaces: parseSpaces(0.5),
  },
];

// Alquímicos - Venenos (categoria: Alquimía)
export const alquimicosVenenos: Equipment[] = [
  {
    nome: 'Beladona',
    group: 'Alquimía',
    preco: parsePrice('T$ 1500'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Bruma sonolenta',
    group: 'Alquimía',
    preco: parsePrice('T$ 150'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Cicuta',
    group: 'Alquimía',
    preco: parsePrice('T$ 60'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Essência de sombra',
    group: 'Alquimía',
    preco: parsePrice('T$ 100'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Névoa tóxica',
    group: 'Alquimía',
    preco: parsePrice('T$ 30'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Peçonha comum',
    group: 'Alquimía',
    preco: parsePrice('T$ 15'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Peçonha concentrada',
    group: 'Alquimía',
    preco: parsePrice('T$ 90'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Peçonha potente',
    group: 'Alquimía',
    preco: parsePrice('T$ 600'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Pó de lich',
    group: 'Alquimía',
    preco: parsePrice('T$ 3000'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Riso de Nimb',
    group: 'Alquimía',
    preco: parsePrice('T$ 150'),
    spaces: parseSpaces(0.5),
  },
];

// Alimentação (categoria: Alimentação)
export const alimentacao: Equipment[] = [
  {
    nome: 'Batata valkariana',
    group: 'Alimentação',
    preco: parsePrice('T$ 2'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Gorad quente',
    group: 'Alimentação',
    preco: parsePrice('T$ 18'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Macarrão de vivakin',
    group: 'Alimentação',
    preco: parsePrice('T$ 6'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Prato do aventureiro',
    group: 'Alimentação',
    preco: parsePrice('T$ 1'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Ração de viagem (por dia)',
    group: 'Alimentação',
    preco: parsePrice('T$ 0,5'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Refeição comum',
    group: 'Alimentação',
    preco: parsePrice('T$ 0,3'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Sopa de peixe',
    group: 'Alimentação',
    preco: parsePrice('T$ 1'),
    spaces: parseSpaces(0.5),
  },
];

// Animais (categoria: Animal)
export const animais: Equipment[] = [
  {
    nome: 'Alforje',
    group: 'Animal',
    preco: parsePrice('T$ 30'),
    spaces: parseSpaces('—'),
  },
  {
    nome: 'Cão de caça',
    group: 'Animal',
    preco: parsePrice('T$ 150'),
    spaces: parseSpaces('—'),
  },
  {
    nome: 'Cavalo',
    group: 'Animal',
    preco: parsePrice('T$ 75'),
    spaces: parseSpaces('—'),
  },
  {
    nome: 'Cavalo de guerra',
    group: 'Animal',
    preco: parsePrice('T$ 400'),
    spaces: parseSpaces('—'),
  },
  {
    nome: 'Estábulo (por dia)',
    group: 'Animal',
    preco: parsePrice('T$ 0,1'),
    spaces: parseSpaces('—'),
  },
  {
    nome: 'Pônei',
    group: 'Animal',
    preco: parsePrice('T$ 5'),
    spaces: parseSpaces('—'),
  },
  {
    nome: 'Pônei de guerra',
    group: 'Animal',
    preco: parsePrice('T$ 30'),
    spaces: parseSpaces('—'),
  },
  {
    nome: 'Trobo',
    group: 'Animal',
    preco: parsePrice('T$ 60'),
    spaces: parseSpaces('—'),
  },
];

// Arrays unificados por categoria para uso no componente
export const generalItems: Equipment[] = [
  ...equipamentoAventureiro,
  ...ferramentas,
];

export const esotericItems: Equipment[] = [...esotericos];

export const clothingItems: Equipment[] = [...vestuario];

export const alchemyItems: Equipment[] = [
  ...alquimicosPreparados,
  ...alquimicosCatalisadores,
  ...alquimicosVenenos,
];

export const foodItems: Equipment[] = [...alimentacao];

export const animalItems: Equipment[] = [...animais];

// Objeto para facilitar o acesso organizado no componente
export const GENERAL_EQUIPMENT = {
  // Subcategorias para Item Geral
  adventurerEquipment: equipamentoAventureiro,
  tools: ferramentas,

  // Esotéricos (categoria própria)
  esoteric: esotericos,

  // Categorias diretas
  clothing: vestuario,

  // Subcategorias para Alquimia
  alchemyPrepared: alquimicosPreparados,
  alchemyCatalysts: alquimicosCatalisadores,
  alchemyPoisons: alquimicosVenenos,

  // Categoria direta
  food: alimentacao,

  // Animais
  animals: animais,

  // Arrays unificados
  generalItems,
  esotericItems,
  clothingItems,
  alchemyItems,
  foodItems,
  animalItems,
};
