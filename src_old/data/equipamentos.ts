import _ from 'lodash';
import CharacterSheet from '../interfaces/CharacterSheet';
import Equipment, {
  DefenseEquipment,
  CombatItems,
} from '../interfaces/Equipment';

export const Armas: Record<string, Equipment> = {
  BALAS: {
    nome: 'Balas (20)',
    dano: '-',
    critico: '-',
    peso: 0.5,
    tipo: '-',
    alcance: '-',
    group: 'Arma',
  },
  FLECHAS: {
    nome: 'Flechas (20)',
    dano: '-',
    critico: '-',
    peso: 0.5,
    tipo: '-',
    alcance: '-',
    group: 'Arma',
  },
  MUNICAO: {
    nome: 'Munição (20)',
    dano: '-',
    critico: '-',
    peso: 0.5,
    tipo: '-',
    alcance: '-',
    group: 'Arma',
  },
  VIROTES: {
    nome: 'Virotes (20)',
    dano: '-',
    critico: '-',
    peso: 0.5,
    tipo: '-',
    alcance: '-',
    group: 'Arma',
  },
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
  ESPADA_LONGA: {
    nome: 'Espada Longa',
    dano: '1d8',
    critico: '19',
    peso: 2,
    tipo: 'Corte',
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
  ARCO_LONGO: {
    nome: 'Arco Longo',
    dano: '1d8',
    critico: 'x3',
    alcance: 'Médio',
    peso: 1.5,
    tipo: 'Perfuração',
    group: 'Arma',
  },
  BESTA_PESADA: {
    nome: 'Besta Pesada',
    dano: '1d12',
    critico: '19',
    alcance: 'Médio',
    peso: 4,
    tipo: 'Perfuração',
    group: 'Arma',
  },
  ALABARDA: {
    nome: 'Alabarda',
    dano: '1d10',
    critico: 'x3',
    peso: 6,
    tipo: 'Corte/Perfuração',
    group: 'Arma',
  },
  ALFANGE: {
    nome: 'Alfange',
    dano: '2d4',
    critico: '18',
    peso: 4,
    tipo: 'Corte',
    group: 'Arma',
  },
  GADANHO: {
    nome: 'Gadanho',
    dano: '2d4',
    critico: 'x4',
    peso: 5,
    tipo: 'Corte',
    group: 'Arma',
  },
  LANCA_MONTADA: {
    nome: 'Lança Montada',
    dano: '1d8',
    critico: 'x3',
    peso: 4,
    tipo: 'Perfuração',
    group: 'Arma',
  },
  MACHADO_DE_GUERRA: {
    nome: 'Machado de Guerra',
    dano: '1d12',
    critico: 'x3',
    peso: 6,
    tipo: 'Corte',
    group: 'Arma',
  },
  MONTANTE: {
    nome: 'Montante',
    dano: '2d6',
    critico: '19',
    peso: 6,
    tipo: 'Corte',
    group: 'Arma',
  },
  CHICOTE: {
    nome: 'Chicote',
    dano: '1d3',
    critico: 'x2',
    peso: 1,
    tipo: 'Corte',
    group: 'Arma',
  },
  ESPADA_BASTARDA: {
    nome: 'Espada Bastarda',
    dano: '1d10/1d12',
    critico: '19',
    peso: 3,
    tipo: 'Cirte',
    group: 'Arma',
  },
  KATANA: {
    nome: 'Katana',
    dano: '1d8/1d10',
    critico: '19',
    peso: 2.5,
    tipo: 'Corte',
    group: 'Arma',
  },
  MACHADO_ANAO: {
    nome: 'Machado Anão',
    dano: '1d10',
    critico: 'x3',
    peso: 4,
    tipo: 'Corte',
    group: 'Arma',
  },
  CORRENTE_DE_ESPINHOS: {
    nome: 'Corrente de Espinhos',
    dano: '2d4/2d4',
    critico: '19',
    peso: 5,
    tipo: 'Corte',
    group: 'Arma',
  },
  MACHADO_TAURICO: {
    nome: 'Machado Táurico',
    dano: '2d8',
    critico: 'x3',
    peso: 4,
    tipo: 'Corte',
    group: 'Arma',
  },
  REDE: {
    nome: 'Rede',
    alcance: 'Curto',
    peso: 3,
    group: 'Arma',
  },
  MOSQUETE: {
    nome: 'Mosquete',
    dano: '2d8',
    critico: '19/x3',
    alcance: 'Médio',
    peso: 4,
    tipo: 'Perfuração',
    group: 'Arma',
  },
  PISTOLA: {
    nome: 'Pistola',
    dano: '2d6',
    critico: '19/x3',
    alcance: 'Curto',
    peso: 1,
    tipo: 'Perguração',
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
  ARMADURA_ACOLCHOADA: {
    nome: 'Armadura Acolchoada',
    defenseBonus: 1,
    armorPenalty: 0,
    peso: 5,
    group: 'Armadura',
  },
  COURACA: {
    nome: 'Couraça',
    defenseBonus: 5,
    armorPenalty: 4,
    peso: 15,
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
    Armas.ALABARDA,
    Armas.ALFANGE,
    Armas.GADANHO,
    Armas.LANCA_MONTADA,
    Armas.MACHADO_DE_GUERRA,
    Armas.MONTANTE,
    Armas.ESPADA_LONGA,
  ],
  armasExoticas: [
    Armas.CHICOTE,
    Armas.ESPADA_BASTARDA,
    Armas.KATANA,
    Armas.MACHADO_ANAO,
    Armas.CORRENTE_DE_ESPINHOS,
    Armas.MACHADO_TAURICO,
    Armas.REDE,
  ],
  armasDeFogo: [Armas.MOSQUETE, Armas.PISTOLA],
  armadurasLeves: [
    Armaduras.ARMADURA_ACOLCHOADA,
    Armaduras.ARMADURADECOURO,
    Armaduras.COUROBATIDO,
    Armaduras.GIBAODEPELES,
    Armaduras.COURACA,
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

export const bardInstruments: string[] = [
  'Violão',
  'Violino',
  'Harpa',
  'Bandolim',
  'Alaúde',
  'Cítara',
  'Flauta Doce',
  'Tambor',
  'Charamela',
  'Ukulele',
  'Harmônica',
  'Oboé',
  'Ocarina',
];

function isDefenseEquip(
  equip: Equipment | DefenseEquipment
): equip is DefenseEquipment {
  return (equip as DefenseEquipment).defenseBonus !== undefined;
}

export function calcDefense(charSheet: CharacterSheet): CharacterSheet {
  const equipped: Equipment[] = [];

  const cloneSheet = _.cloneDeep(charSheet);

  let updatedDefense = Object.values(cloneSheet.bag.getEquipments())
    .flat()
    .reduce((acc, equip) => {
      if (isDefenseEquip(equip)) {
        equipped.push(equip);

        cloneSheet.steps.push({
          label: 'Incrementou Defesa',
          value: [
            {
              value: `Bonus de ${equip.nome} (${acc} + ${
                equip.defenseBonus
              } = ${acc + equip.defenseBonus})`,
            },
          ],
        });

        return acc + equip.defenseBonus;
      }

      return acc;
    }, cloneSheet.defesa);

  const heavyArmor = equipped.some((equip) =>
    EQUIPAMENTOS.armaduraPesada.find((armadura) => armadura.nome === equip.nome)
  );

  // Se não tem armadura pesada
  if (!heavyArmor) {
    // Se for nobre
    if (cloneSheet.classe.name === 'Nobre') {
      cloneSheet.steps.push({
        label: 'Incrementou Defesa (+CAR)',
        value: [
          {
            value: `${updatedDefense} + ${cloneSheet.atributos.Carisma.mod} = ${
              updatedDefense + cloneSheet.atributos.Carisma.mod
            }`,
          },
        ],
      });
      updatedDefense += cloneSheet.atributos.Carisma.mod;
    }
    // Se não for Nobre
    else {
      cloneSheet.steps.push({
        label: 'Incrementou Defesa (+DES)',
        value: [
          {
            value: `${updatedDefense} + ${
              cloneSheet.atributos.Destreza.mod
            } = ${updatedDefense + cloneSheet.atributos.Destreza.mod}`,
          },
        ],
      });
      updatedDefense += cloneSheet.atributos.Destreza.mod;
    }
  }

  return { ...cloneSheet, defesa: updatedDefense };
}
