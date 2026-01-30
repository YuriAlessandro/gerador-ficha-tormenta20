import Equipment from '@/interfaces/Equipment';
import Skill from '@/interfaces/Skills';
import { SupplementEquipment } from '../../core';

// Helper function to parse prices
function parsePrice(priceStr: string): number {
  return parseFloat(priceStr.replace('T$ ', '').replace(',', '.')) || 0;
}

// Helper function to parse spaces
function parseSpaces(spacesStr: string | number): number {
  if (spacesStr === '—' || spacesStr === '') return 0;
  if (typeof spacesStr === 'string') {
    return parseFloat(spacesStr.replace(',', '.')) || 0;
  }
  return spacesStr || 0;
}

// Religious equipment from Deuses de Arton supplement
export const religiousEquipment: Equipment[] = [
  {
    nome: 'Água benta concentrada',
    group: 'Item Geral',
    preco: parsePrice('T$ 60'),
    spaces: parseSpaces(0.5),
    rolls: [
      {
        label: 'Dano de Luz',
        dice: '4d10',
        description:
          'O alvo sofre 4d10 pontos de dano de luz (Reflexos CD Sab reduz à metade).',
      },
    ],
  },
  {
    nome: 'Amuleto de Khalmyr',
    group: 'Item Geral',
    preco: parsePrice('T$ 30'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Amuleto de Nimb',
    group: 'Item Geral',
    preco: parsePrice('T$ 30'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Apanhador de sonhos',
    group: 'Item Geral',
    preco: parsePrice('T$ 40'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Aspersório',
    group: 'Item Geral',
    preco: parsePrice('T$ 50'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Cajado de pastor',
    group: 'Item Geral',
    preco: parsePrice('T$ 12'),
    spaces: parseSpaces(2),
  },
  {
    nome: 'Cálice consagrado',
    group: 'Item Geral',
    preco: parsePrice('T$ 300'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Colar do suplicante',
    group: 'Item Geral',
    preco: parsePrice('T$ 100'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Emblema religioso',
    group: 'Item Geral',
    preco: parsePrice('T$ 30'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Férula',
    group: 'Item Geral',
    preco: parsePrice('T$ 100'),
    spaces: parseSpaces(1),
    // Note: +1d6 to Canalizar Energia effect - tracked for reference
    // The actual bonus is applied during gameplay when using the ability
    conditionalBonuses: [
      {
        condition: { type: 'hasClassAbility', value: 'Canalizar Energia' },
        bonuses: [], // No sheet bonus - effect is descriptive for gameplay
      },
    ],
  },
  {
    nome: 'Panfleto de aforismos',
    group: 'Item Geral',
    preco: parsePrice('T$ 60'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Patuá',
    group: 'Item Geral',
    preco: parsePrice('T$ 50'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Texto sagrado',
    group: 'Item Geral',
    preco: parsePrice('T$ 60'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Trombeta do cruzado',
    group: 'Item Geral',
    preco: parsePrice('T$ 100'),
    spaces: parseSpaces(1),
  },
];

// Religious clothing from Deuses de Arton supplement
export const religiousClothing: Equipment[] = [
  {
    nome: 'Anel eclesiástico',
    group: 'Vestuário',
    preco: parsePrice('T$ 50'),
    spaces: parseSpaces(1),
    conditionalBonuses: [
      {
        condition: { type: 'isClass', value: 'Clérigo' },
        bonuses: [
          {
            source: { type: 'equipment', equipmentName: 'Anel eclesiástico' },
            target: { type: 'Skill', name: Skill.DIPLOMACIA },
            modifier: { type: 'Fixed', value: 1 },
          },
          {
            source: { type: 'equipment', equipmentName: 'Anel eclesiástico' },
            target: { type: 'Skill', name: Skill.INTIMIDACAO },
            modifier: { type: 'Fixed', value: 1 },
          },
        ],
      },
      {
        condition: { type: 'isClass', value: 'Frade' },
        bonuses: [
          {
            source: { type: 'equipment', equipmentName: 'Anel eclesiástico' },
            target: { type: 'Skill', name: Skill.DIPLOMACIA },
            modifier: { type: 'Fixed', value: 1 },
          },
          {
            source: { type: 'equipment', equipmentName: 'Anel eclesiástico' },
            target: { type: 'Skill', name: Skill.INTIMIDACAO },
            modifier: { type: 'Fixed', value: 1 },
          },
        ],
      },
    ],
  },
  {
    nome: 'Carcaça do predador primal',
    group: 'Vestuário',
    preco: parsePrice('T$ 150'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Garras do predador primal',
    group: 'Vestuário',
    preco: parsePrice('T$ 300'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Hábito monástico',
    group: 'Vestuário',
    preco: parsePrice('T$ 30'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Hábito sacerdotal',
    group: 'Vestuário',
    preco: parsePrice('T$ 30'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Manto de alto sacerdote',
    group: 'Vestuário',
    preco: parsePrice('T$ 100'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Penas do predador primal',
    group: 'Vestuário',
    preco: parsePrice('T$ 100'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Piercing de umbigo',
    group: 'Vestuário',
    preco: parsePrice('T$ 50'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Sandálias',
    group: 'Vestuário',
    preco: parsePrice('T$ 9'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Tonsura',
    group: 'Vestuário',
    preco: parsePrice('T$ 3'),
    spaces: parseSpaces(0),
  },
  {
    nome: 'Túnica do Virtuoso',
    group: 'Vestuário',
    preco: parsePrice('T$ 25'),
    spaces: parseSpaces(1),
  },
];

// Religious alchemy items from Deuses de Arton supplement
export const religiousAlchemy: Equipment[] = [
  // Alquímicos — Preparados
  {
    nome: 'Granada redentora',
    group: 'Alquimía',
    preco: parsePrice('T$ 60'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Santa granada de mão',
    group: 'Alquimía',
    preco: parsePrice('T$ 150'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Incenso',
    group: 'Alquimía',
    preco: parsePrice('T$ 12'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Lucidílico',
    group: 'Alquimía',
    preco: parsePrice('T$ 30'),
    spaces: parseSpaces(0.5),
  },
  // Alquímicos — Catalisadores
  {
    nome: 'Água benta',
    group: 'Alquimía',
    preco: parsePrice('T$ 10'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Favo de mel',
    group: 'Alquimía',
    preco: parsePrice('T$ 30'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Fitilho consagrado',
    group: 'Alquimía',
    preco: parsePrice('T$ 30'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Flor de orlyn',
    group: 'Alquimía',
    preco: parsePrice('T$ 30'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Lantejoula',
    group: 'Alquimía',
    preco: parsePrice('T$ 30'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Frasco de luz',
    group: 'Alquimía',
    preco: parsePrice('T$ 30'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Pena de anjo',
    group: 'Alquimía',
    preco: parsePrice('T$ 30'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Pedra de sombras',
    group: 'Alquimía',
    preco: parsePrice('T$ 30'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Vela eclesiástica',
    group: 'Alquimía',
    preco: parsePrice('T$ 60'),
    spaces: parseSpaces(0.5),
  },
];

// Religious food items from Deuses de Arton supplement
export const religiousFood: Equipment[] = [
  {
    nome: 'Abraço da noite',
    group: 'Alimentação',
    preco: parsePrice('T$ 3'),
    spaces: parseSpaces(0),
  },
  {
    nome: 'Assado de entranhas',
    group: 'Alimentação',
    preco: parsePrice('T$ 2'),
    spaces: parseSpaces(0),
  },
  {
    nome: 'Bênção dos mares',
    group: 'Alimentação',
    preco: parsePrice('T$ 4'),
    spaces: parseSpaces(0),
  },
  {
    nome: 'Bolinho de jade',
    group: 'Alimentação',
    preco: parsePrice('T$ 4'),
    spaces: parseSpaces(0),
  },
  {
    nome: 'Bombas de saber',
    group: 'Alimentação',
    preco: parsePrice('T$ 4'),
    spaces: parseSpaces(0),
  },
  {
    nome: 'Caldo de Lena',
    group: 'Alimentação',
    preco: parsePrice('T$ 3'),
    spaces: parseSpaces(0),
  },
  {
    nome: 'Coragem de sangue',
    group: 'Alimentação',
    preco: parsePrice('T$ 4'),
    spaces: parseSpaces(0),
  },
  {
    nome: 'Deleite mágico',
    group: 'Alimentação',
    preco: parsePrice('T$ 18'),
    spaces: parseSpaces(0),
  },
  {
    nome: 'Frescor de Nimb',
    group: 'Alimentação',
    preco: parsePrice('T$ 1'),
    spaces: parseSpaces(0),
  },
  {
    nome: 'Joia do deserto',
    group: 'Alimentação',
    preco: parsePrice('T$ 5'),
    spaces: parseSpaces(0),
  },
  {
    nome: 'Justos de Khalmyr',
    group: 'Alimentação',
    preco: parsePrice('T$ 2'),
    spaces: parseSpaces(0),
  },
  {
    nome: 'Justos virtuosos',
    group: 'Alimentação',
    preco: parsePrice('T$ 6'),
    spaces: parseSpaces(0),
  },
  {
    nome: 'Manjar da paz',
    group: 'Alimentação',
    preco: parsePrice('T$ 7'),
    spaces: parseSpaces(0),
  },
  {
    nome: 'Ouro de dragão',
    group: 'Alimentação',
    preco: parsePrice('T$ 6'),
    spaces: parseSpaces(0),
  },
  {
    nome: 'Ovos de raposa',
    group: 'Alimentação',
    preco: parsePrice('T$ 3'),
    spaces: parseSpaces(0),
  },
  {
    nome: 'Pão de Thwor',
    group: 'Alimentação',
    preco: parsePrice('T$ 1'),
    spaces: parseSpaces(0),
  },
  {
    nome: 'Presente da terra',
    group: 'Alimentação',
    preco: parsePrice('T$ 3'),
    spaces: parseSpaces(0),
  },
  {
    nome: 'Renascer gentil',
    group: 'Alimentação',
    preco: parsePrice('T$ 30'),
    spaces: parseSpaces(0),
  },
  {
    nome: 'Suflê rubro',
    group: 'Alimentação',
    preco: parsePrice('T$ 3'),
    spaces: parseSpaces(0),
  },
  {
    nome: 'Tesouro de Valkaria',
    group: 'Alimentação',
    preco: parsePrice('T$ 2'),
    spaces: parseSpaces(0),
  },
];

const DEUSES_ARTON_EQUIPMENT: SupplementEquipment = {
  weapons: {},
  armors: {},
  generalItems: religiousEquipment,
  clothing: religiousClothing,
  alchemy: religiousAlchemy,
  food: religiousFood,
};

export default DEUSES_ARTON_EQUIPMENT;
