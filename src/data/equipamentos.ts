import _ from 'lodash';
import Equipment, {
  Bag,
  DefenseEquipment,
  CombatItems,
  BagEquipments,
} from '../interfaces/Equipment';

export const Armas: Record<string, Equipment> = {
  ADAGA: {
    nome: 'Adaga',
    dano: '1d4',
    critico: '19',
    peso: 0.5,
    tipo: 'Perf.',
    alcance: 'Curto',
    group: 'Arma',
  },
  ESPADACURTA: {
    nome: 'Espada Curta',
    dano: '1d6',
    critico: '19',
    peso: 1,
    tipo: 'Perf.',
    alcance: '-',
    group: 'Arma',
  },
  FOICE: {
    nome: 'Foice',
    dano: '1d6',
    critico: '3x',
    peso: 1,
    tipo: 'Corte',
    alcance: '-',
    group: 'Arma',
  },
  MANOPLA: {
    nome: 'Manopla',
    dano: '-',
    critico: '-',
    peso: 1,
    tipo: 'Impac.',
    alcance: '-',
    group: 'Arma',
  },
  CLAVA: {
    nome: 'Clava',
    dano: '1d6',
    critico: '2x',
    peso: 1.5,
    tipo: 'Impac.',
    alcance: '-',
    group: 'Arma',
  },
  LANCA: {
    nome: 'Lança',
    dano: '1d6',
    critico: '2x',
    peso: 1.5,
    tipo: 'Perf.',
    alcance: 'Curto',
    group: 'Arma',
  },
  MACA: {
    nome: 'Maça',
    dano: '1d8',
    critico: '2x',
    peso: 6,
    tipo: 'Impac.',
    alcance: '-',
    group: 'Arma',
  },
  BORDAO: {
    nome: 'Bordão',
    dano: '1d6/1d6',
    critico: '2x',
    peso: 2,
    tipo: 'Impac.',
    alcance: '-',
    group: 'Arma',
  },
  PIQUE: {
    nome: 'Pique',
    dano: '1d8',
    critico: '2x',
    peso: 5,
    tipo: 'Perf.',
    alcance: '-',
    group: 'Arma',
  },
  TACAPE: {
    nome: 'Tacape',
    dano: '1d10',
    critico: '2x',
    peso: 4,
    tipo: 'Impacto',
    alcance: '-',
    group: 'Arma',
  },
  ARCOCURTO: {
    nome: 'Arco Curto',
    dano: '1d6',
    critico: '3x',
    peso: 1,
    tipo: 'Perf.',
    alcance: 'Médio',
    group: 'Arma',
  },
  BESTALEVE: {
    nome: 'Besta Leve',
    dano: '1d8',
    critico: '19',
    peso: 3,
    tipo: 'Perf.',
    alcance: 'Médio',
    group: 'Arma',
  },
  AZAGAIA: {
    nome: 'Azagaia',
    dano: '1d6',
    critico: '2x',
    peso: 1,
    tipo: 'Perf.',
    alcance: 'Médio',
    group: 'Arma',
  },
  FUNDA: {
    nome: 'Funda',
    dano: '1d4',
    critico: '2x',
    peso: 0.25,
    tipo: 'Impac.',
    alcance: 'Médio',
    group: 'Arma',
  },
  MACHADINHA: {
    nome: 'Machadinha',
    dano: '1d6',
    critico: '3x',
    peso: 2,
    tipo: 'Corte',
    group: 'Arma',
  },
  CIMITARRA: {
    nome: 'Cimitarra',
    dano: '1d6',
    critico: '18',
    peso: 2,
    tipo: 'Corte',
    group: 'Arma',
  },
  FLORETE: {
    nome: 'Florete',
    dano: '1d6',
    critico: '18',
    peso: 1,
    tipo: 'Perfuração',
    group: 'Arma',
  },
  MACHADO_DE_BATALHA: {
    nome: 'Machado de Batalha',
    dano: '1d8',
    critico: 'x3',
    peso: 3,
    tipo: 'Corte',
    group: 'Arma',
  },
  MANGUAL: {
    nome: 'Mangual',
    dano: '1d8',
    critico: 'x2',
    peso: 2.5,
    tipo: 'Impacto',
    group: 'Arma',
  },
  MARTELO_DE_GUERRA: {
    nome: 'Martelo de Guerra',
    dano: '1d8',
    critico: 'x3',
    peso: 2.5,
    tipo: 'Impacto',
    group: 'Arma',
  },
  PICARETA: {
    nome: 'Picareta',
    dano: '1d6',
    critico: 'x4',
    peso: 3,
    tipo: 'Perfuração',
    group: 'Arma',
  },
  TRIDENTE: {
    nome: 'Tridente',
    dano: '1d8',
    critico: 'x2',
    peso: 2,
    tipo: 'Perfuração',
    group: 'Arma',
  },
};

export const Armaduras: Record<string, DefenseEquipment> = {
  ARMADURADECOURO: {
    nome: 'Armadura de couro',
    defenseBonus: 2,
    armorPenalty: 0,
    peso: 7,
    group: 'Armadura',
  },
  COUROBATIDO: {
    nome: 'Couro batido',
    defenseBonus: 3,
    armorPenalty: 1,
    peso: 10,
    group: 'Armadura',
  },
  GIBAODEPELES: {
    nome: 'Gibão de peles',
    defenseBonus: 4,
    armorPenalty: 3,
    peso: 12,
    group: 'Armadura',
  },
  BRUNEA: {
    nome: 'Brunea',
    defenseBonus: 5,
    armorPenalty: 2,
    peso: 15,
    group: 'Armadura',
  },
  COTA_DE_MALHA: {
    nome: 'Cota de Malha',
    defenseBonus: 6,
    armorPenalty: 2,
    peso: 20,
    group: 'Armadura',
  },
  LORIGA_SEGMENTADA: {
    nome: 'Loriga Segmentada',
    defenseBonus: 7,
    armorPenalty: 3,
    peso: 17,
    group: 'Armadura',
  },
  MEIA_ARMADURA: {
    nome: 'Meia Armadura',
    defenseBonus: 8,
    armorPenalty: 4,
    peso: 22,
    group: 'Armadura',
  },
  ARMADURA_COMPLETA: {
    nome: 'Armadura Completa',
    defenseBonus: 10,
    armorPenalty: 5,
    peso: 25,
    group: 'Armadura',
  },
};

export const Escudos: Record<string, DefenseEquipment> = {
  ESCUDOLEVE: {
    nome: 'Escudo Leve',
    defenseBonus: 1,
    armorPenalty: 1,
    peso: 3,
    group: 'Escudo',
  },
  ESCUDO_PESADO: {
    nome: 'Escudo Pesado',
    defenseBonus: 2,
    armorPenalty: 2,
    peso: 7,
    group: 'Escudo',
  },
};

export function calcArmorPenalty(equipments: BagEquipments): number {
  const armorPenalty = equipments.Armadura.reduce(
    (acc, armor) => acc + armor.armorPenalty,
    0
  );

  const shieldPenalty = equipments.Escudo.reduce(
    (acc, armor) => acc + armor.armorPenalty,
    0
  );

  return armorPenalty + shieldPenalty;
}

export function calcBagWeight(equipments: BagEquipments): number {
  const equipmentGroups = Object.values(equipments) as Equipment[][];
  let weight = 0;

  equipmentGroups.forEach((group) => {
    group.forEach((equipment) => {
      const equipmentWeight = equipment.peso || 0;
      weight += equipmentWeight;
    });
  });

  return weight;
}

const defaultEquipments: BagEquipments = {
  'Item Geral': [
    {
      nome: 'Mochila',
      group: 'Item Geral',
      peso: 1,
    },
    {
      nome: 'Saco de dormir',
      group: 'Item Geral',
      peso: 2.5,
    },
    {
      nome: 'Traje de viajante',
      group: 'Item Geral',
      peso: 2,
    },
  ],
  Alimentação: [],
  Alquimía: [],
  Animal: [],
  Arma: [],
  Armadura: [],
  Escudo: [],
  Hospedagem: [],
  Serviço: [],
  Vestuário: [],
  Veículo: [],
};

export function updateEquipments(
  bag: Bag,
  updatedBagEquipments: BagEquipments
): Bag {
  const bagClone = _.cloneDeep(bag);

  bagClone.equipments = updatedBagEquipments;
  bagClone.weight = calcBagWeight(bag.equipments);
  bagClone.armorPenalty = calcArmorPenalty(bag.equipments);
  return bagClone;
}

export const DEFAULT_BAG: Bag = {
  equipments: defaultEquipments,
  weight: calcBagWeight(defaultEquipments),
  armorPenalty: calcArmorPenalty(defaultEquipments),
};

const EQUIPAMENTOS: CombatItems = {
  armasSimples: [
    Armas.ADAGA,
    Armas.ARCOCURTO,
    Armas.AZAGAIA,
    Armas.BESTALEVE,
    Armas.BORDAO,
    Armas.CLAVA,
    Armas.ESPADACURTA,
    Armas.FOICE,
    Armas.FUNDA,
    Armas.LANCA,
    Armas.MACA,
    Armas.MANOPLA,
    Armas.PIQUE,
    Armas.TACAPE,
  ],
  armasMarciais: [
    Armas.MACHADINHA,
    Armas.CIMITARRA,
    Armas.FLORETE,
    Armas.MACHADO_DE_BATALHA,
    Armas.MANGUAL,
    Armas.MARTELO_DE_GUERRA,
    Armas.PICARETA,
    Armas.TRIDENTE,
  ],
  armadurasLeves: [
    Armaduras.ARMADURADECOURO,
    Armaduras.COUROBATIDO,
    Armaduras.GIBAODEPELES,
  ],
  armaduraPesada: [
    Armaduras.BRUNEA,
    Armaduras.COTA_DE_MALHA,
    Armaduras.LORIGA_SEGMENTADA,
    Armaduras.MEIA_ARMADURA,
    Armaduras.ARMADURA_COMPLETA,
  ],
  escudos: [Escudos.ESCUDOLEVE, Escudos.ESCUDO_PESADO],
};

export default EQUIPAMENTOS;

function isDefenseEquip(
  equip: Equipment | DefenseEquipment
): equip is DefenseEquipment {
  return (equip as DefenseEquipment).defenseBonus !== undefined;
}

export function calcDefense(defense: number, equips: Bag): number {
  return Object.values(equips.equipments)
    .flat()
    .reduce((acc, equip) => {
      if (isDefenseEquip(equip)) {
        return acc + equip.defenseBonus;
      }

      return acc;
    }, defense);
}
