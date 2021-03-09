import Equipment, { Bag, DefenseEquipment } from '../interfaces/Equipment';

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
};

export const Escudos: Record<string, DefenseEquipment> = {
  ESCUDOLEVE: {
    nome: 'Escudo leve',
    defenseBonus: 1,
    armorPenalty: 1,
    peso: 3,
    group: 'Escudo',
  },
};

export function getBagDefault(): Bag {
  return {
    'Item Geral': [
      {
        nome: 'Mochila',
        group: 'Item Geral',
      },
      {
        nome: 'Saco de dormir',
        group: 'Item Geral',
      },
      {
        nome: 'Traje de viajante',
        group: 'Item Geral',
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
}
const EQUIPAMENTOS: Record<string, Equipment[]> = {
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
  armasMarciais: [Armas.MACHADINHA, Armas.CIMITARRA],
  armadurasLeves: [
    Armaduras.ARMADURADECOURO,
    Armaduras.COUROBATIDO,
    Armaduras.GIBAODEPELES,
  ],
  armaduraPesada: [Armaduras.BRUNEA],
  escudos: [Escudos.ESCUDOLEVE],
};

export default EQUIPAMENTOS;

function isDefenseEquip(
  equip: Equipment | DefenseEquipment
): equip is DefenseEquipment {
  return (equip as DefenseEquipment).defenseBonus !== undefined;
}

export function applyEquipsModifiers(
  defense: number,
  equips: Bag
): { defense: number; armorPenalty: number } {
  return Object.values(equips)
    .flat()
    .reduce(
      (acc, equip) => {
        if (isDefenseEquip(equip)) {
          return {
            defense: equip.defenseBonus + acc.defense,
            armorPenalty: equip.armorPenalty + acc.armorPenalty,
          };
        }

        return acc;
      },
      { defense, armorPenalty: 0 }
    );
}
