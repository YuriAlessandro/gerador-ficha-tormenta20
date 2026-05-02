import _ from 'lodash';
import CharacterSheet from '../../../interfaces/CharacterSheet';
import Equipment, {
  DefenseEquipment,
  CombatItems,
} from '../../../interfaces/Equipment';

export const Armas: Record<string, Equipment> = {
  BALAS: {
    nome: 'Balas (20)',
    dano: '-',
    critico: '-',
    spaces: 1,
    tipo: '-',
    alcance: '-',
    group: 'Arma',
    preco: 20,
    isAmmo: true,
    ammoType: 'Balas',
    ammoPackSize: 20,
  },
  FLECHAS: {
    nome: 'Flechas (20)',
    dano: '-',
    critico: '-',
    spaces: 1,
    tipo: '-',
    alcance: '-',
    group: 'Arma',
    preco: 1,
    isAmmo: true,
    ammoType: 'Flechas',
    ammoPackSize: 20,
  },
  MUNICAO: {
    nome: 'Munição (20)',
    dano: '-',
    critico: '-',
    spaces: 1,
    tipo: '-',
    alcance: '-',
    group: 'Arma',
    preco: 10,
  },
  VIROTES: {
    nome: 'Virotes (20)',
    dano: '-',
    critico: '-',
    spaces: 1,
    tipo: '-',
    alcance: '-',
    group: 'Arma',
    preco: 2,
    isAmmo: true,
    ammoType: 'Virotes',
    ammoPackSize: 20,
  },
  PEDRAS: {
    nome: 'Pedras (20)',
    dano: '-',
    critico: '-',
    spaces: 1,
    tipo: '-',
    alcance: '-',
    group: 'Arma',
    preco: 0,
    isAmmo: true,
    ammoType: 'Pedras',
    ammoPackSize: 20,
  },
  ADAGA: {
    nome: 'Adaga',
    dano: '1d4',
    critico: '19',
    spaces: 1,
    tipo: 'Perf.',
    alcance: 'Curto',
    group: 'Arma',
    preco: 2,
    arremesso: true,
    specialActions: [
      { id: 'corpo-a-corpo', label: 'Corpo a corpo', skill: 'Luta' },
      {
        id: 'arremessar',
        label: 'Arremessar',
        skill: 'Pontaria',
        damageAttribute: 'Nenhum',
      },
    ],
  },
  ESPADACURTA: {
    nome: 'Espada Curta',
    dano: '1d6',
    critico: '19',
    spaces: 1,
    tipo: 'Perf.',
    alcance: '-',
    group: 'Arma',
    preco: 10,
  },
  FOICE: {
    nome: 'Foice',
    dano: '1d6',
    critico: 'x3',
    spaces: 1,
    tipo: 'Corte',
    alcance: '-',
    group: 'Arma',
    preco: 4,
  },
  MANOPLA: {
    nome: 'Manopla',
    dano: '-',
    critico: '-',
    spaces: 1,
    tipo: 'Impac.',
    alcance: '-',
    group: 'Arma',
    preco: 10,
  },
  CLAVA: {
    nome: 'Clava',
    dano: '1d6',
    critico: 'x2',
    spaces: 1,
    tipo: 'Impac.',
    alcance: '-',
    group: 'Arma',
    preco: 0,
  },
  LANCA: {
    nome: 'Lança',
    dano: '1d6',
    critico: 'x2',
    spaces: 1,
    tipo: 'Perf.',
    alcance: 'Curto',
    arremesso: true,
    group: 'Arma',
    preco: 2,
    weaponTags: ['armaDeMar'],
    specialActions: [
      { id: 'corpo-a-corpo', label: 'Corpo a corpo', skill: 'Luta' },
      {
        id: 'arremessar',
        label: 'Arremessar',
        skill: 'Pontaria',
        damageAttribute: 'Nenhum',
      },
    ],
  },
  MACA: {
    nome: 'Maça',
    dano: '1d8',
    critico: 'x2',
    spaces: 1,
    tipo: 'Impac.',
    alcance: '-',
    group: 'Arma',
    preco: 12,
  },
  BORDAO: {
    nome: 'Bordão',
    dano: '1d6/1d6',
    critico: 'x2',
    spaces: 2,
    tipo: 'Impac.',
    alcance: '-',
    group: 'Arma',
    preco: 0,
    twoHanded: true,
  },
  PIQUE: {
    nome: 'Pique',
    dano: '1d8',
    critico: 'x2',
    spaces: 2,
    tipo: 'Perf.',
    alcance: '-',
    group: 'Arma',
    preco: 2,
    weaponTags: ['alongada'],
    twoHanded: true,
  },
  TACAPE: {
    nome: 'Tacape',
    dano: '1d10',
    critico: 'x2',
    spaces: 2,
    tipo: 'Impacto',
    alcance: '-',
    group: 'Arma',
    preco: 0,
    twoHanded: true,
  },
  AZAGAIA: {
    nome: 'Azagaia',
    dano: '1d6',
    critico: 'x2',
    spaces: 1,
    tipo: 'Perf.',
    alcance: 'Médio',
    arremesso: true,
    group: 'Arma',
    preco: 1,
    weaponTags: ['armaDeMar'],
    specialActions: [
      {
        id: 'arremessar',
        label: 'Arremessar',
        skill: 'Pontaria',
        damageAttribute: 'Nenhum',
      },
      {
        id: 'corpo-a-corpo',
        label: 'Corpo a corpo (-5 ataque)',
        skill: 'Luta',
        atkBonusDelta: -5,
        damageAttribute: 'Força',
      },
    ],
  },
  BESTALEVE: {
    nome: 'Besta Leve',
    dano: '1d8',
    critico: '19',
    spaces: 1,
    tipo: 'Perf.',
    alcance: 'Médio',
    group: 'Arma',
    preco: 35,
    ammoType: 'Virotes',
  },
  FUNDA: {
    nome: 'Funda',
    dano: '1d4',
    critico: 'x2',
    spaces: 1,
    tipo: 'Impac.',
    alcance: 'Médio',
    group: 'Arma',
    preco: 0,
    ammoType: 'Pedras',
    damageAttribute: 'Força',
    specialActions: [
      {
        id: 'pedras',
        label: 'Disparar Pedras (consome munição)',
        skill: 'Pontaria',
      },
      {
        id: 'pedra-improvisada',
        label: 'Pedra improvisada (-1 passo de dano)',
        description:
          'Sem munição adequada — usa uma pedra comum, dano reduzido em 1 passo.',
        skill: 'Pontaria',
        damageStepDelta: -1,
        skipAmmo: true,
      },
    ],
  },
  ARCOCURTO: {
    nome: 'Arco Curto',
    dano: '1d6',
    critico: 'x3',
    spaces: 2,
    tipo: 'Perf.',
    alcance: 'Médio',
    group: 'Arma',
    preco: 30,
    twoHanded: true,
    ammoType: 'Flechas',
  },
  MACHADINHA: {
    nome: 'Machadinha',
    dano: '1d6',
    critico: 'x3',
    spaces: 1,
    tipo: 'Corte',
    group: 'Arma',
    preco: 6,
    weaponTags: ['heredrimm'],
    arremesso: true,
    alcance: 'Curto',
    specialActions: [
      { id: 'corpo-a-corpo', label: 'Corpo a corpo', skill: 'Luta' },
      {
        id: 'arremessar',
        label: 'Arremessar',
        skill: 'Pontaria',
        damageAttribute: 'Nenhum',
      },
    ],
  },
  CIMITARRA: {
    nome: 'Cimitarra',
    dano: '1d6',
    critico: '18',
    spaces: 1,
    tipo: 'Corte',
    group: 'Arma',
    preco: 15,
  },
  ESPADA_LONGA: {
    nome: 'Espada Longa',
    dano: '1d8',
    critico: '19',
    spaces: 1,
    tipo: 'Corte',
    alcance: '-',
    group: 'Arma',
    preco: 15,
  },
  FLORETE: {
    nome: 'Florete',
    dano: '1d6',
    critico: '18',
    spaces: 1,
    tipo: 'Perfuração',
    group: 'Arma',
    preco: 20,
  },
  MACHADO_DE_BATALHA: {
    nome: 'Machado de Batalha',
    dano: '1d8',
    critico: 'x3',
    spaces: 1,
    tipo: 'Corte',
    group: 'Arma',
    preco: 10,
    weaponTags: ['heredrimm'],
  },
  MANGUAL: {
    nome: 'Mangual',
    dano: '1d8',
    critico: 'x2',
    spaces: 1,
    tipo: 'Impacto',
    group: 'Arma',
    preco: 8,
  },
  MARTELO_DE_GUERRA: {
    nome: 'Martelo de Guerra',
    dano: '1d8',
    critico: 'x3',
    spaces: 1,
    tipo: 'Impacto',
    group: 'Arma',
    preco: 12,
    weaponTags: ['heredrimm'],
  },
  PICARETA: {
    nome: 'Picareta',
    dano: '1d6',
    critico: 'x4',
    spaces: 1,
    tipo: 'Perfuração',
    group: 'Arma',
    preco: 8,
    weaponTags: ['heredrimm'],
  },
  TRIDENTE: {
    nome: 'Tridente',
    dano: '1d8',
    critico: 'x2',
    spaces: 1,
    tipo: 'Perfuração',
    group: 'Arma',
    preco: 15,
    weaponTags: ['armaDeMar'],
    arremesso: true,
    alcance: 'Curto',
    specialActions: [
      { id: 'corpo-a-corpo', label: 'Corpo a corpo', skill: 'Luta' },
      {
        id: 'arremessar',
        label: 'Arremessar',
        skill: 'Pontaria',
        damageAttribute: 'Nenhum',
      },
    ],
  },
  ALABARDA: {
    nome: 'Alabarda',
    dano: '1d10',
    critico: 'x3',
    spaces: 2,
    tipo: 'Corte/Perfuração',
    group: 'Arma',
    preco: 10,
    weaponTags: ['alongada'],
    twoHanded: true,
  },
  ALFANGE: {
    nome: 'Alfange',
    dano: '2d4',
    critico: '18',
    spaces: 2,
    tipo: 'Corte',
    group: 'Arma',
    preco: 75,
    twoHanded: true,
  },
  GADANHO: {
    nome: 'Gadanho',
    dano: '2d4',
    critico: 'x4',
    spaces: 2,
    tipo: 'Corte',
    group: 'Arma',
    preco: 18,
    twoHanded: true,
  },
  LANCA_MONTADA: {
    nome: 'Lança Montada',
    dano: '1d8',
    critico: 'x3',
    spaces: 2,
    tipo: 'Perfuração',
    group: 'Arma',
    preco: 10,
    weaponTags: ['alongada'],
    twoHanded: true,
  },
  MACHADO_DE_GUERRA: {
    nome: 'Machado de Guerra',
    dano: '1d12',
    critico: 'x3',
    spaces: 2,
    tipo: 'Corte',
    group: 'Arma',
    preco: 20,
    weaponTags: ['heredrimm'],
    twoHanded: true,
  },
  MARRETA: {
    nome: 'Marreta',
    dano: '3d4',
    critico: 'x2',
    spaces: 2,
    tipo: 'Impacto',
    group: 'Arma',
    preco: 20,
    twoHanded: true,
  },
  MONTANTE: {
    nome: 'Montante',
    dano: '2d6',
    critico: '19',
    spaces: 2,
    tipo: 'Corte',
    group: 'Arma',
    preco: 50,
    twoHanded: true,
  },
  ARCO_LONGO: {
    nome: 'Arco Longo',
    dano: '1d8',
    critico: 'x3',
    alcance: 'Médio',
    spaces: 2,
    tipo: 'Perfuração',
    group: 'Arma',
    preco: 100,
    ammoType: 'Flechas',
    damageAttribute: 'Força',
  },
  BESTA_PESADA: {
    nome: 'Besta Pesada',
    dano: '1d12',
    critico: '19',
    alcance: 'Médio',
    spaces: 2,
    tipo: 'Perfuração',
    group: 'Arma',
    preco: 50,
    ammoType: 'Virotes',
  },
  CHICOTE: {
    nome: 'Chicote',
    dano: '1d3',
    critico: 'x2',
    spaces: 1,
    tipo: 'Corte',
    group: 'Arma',
    preco: 2,
  },
  ESPADA_BASTARDA: {
    nome: 'Espada Bastarda',
    dano: '1d10/1d12',
    critico: '19',
    spaces: 1,
    tipo: 'Corte',
    group: 'Arma',
    preco: 35,
  },
  KATANA: {
    nome: 'Katana',
    dano: '1d8/1d10',
    critico: '19',
    spaces: 1,
    tipo: 'Corte',
    group: 'Arma',
    preco: 100,
  },
  MACHADO_ANAO: {
    nome: 'Machado Anão',
    dano: '1d10',
    critico: 'x3',
    spaces: 1,
    tipo: 'Corte',
    group: 'Arma',
    preco: 30,
    weaponTags: ['heredrimm'],
  },
  CORRENTE_DE_ESPINHOS: {
    nome: 'Corrente de Espinhos',
    dano: '2d4/2d4',
    critico: '19',
    spaces: 2,
    tipo: 'Corte',
    group: 'Arma',
    preco: 25,
    twoHanded: true,
  },
  MACHADO_TAURICO: {
    nome: 'Machado Táurico',
    dano: '2d8',
    critico: 'x3',
    spaces: 2,
    tipo: 'Corte',
    group: 'Arma',
    preco: 50,
    weaponTags: ['heredrimm'],
    twoHanded: true,
  },
  REDE: {
    nome: 'Rede',
    alcance: 'Curto',
    spaces: 1,
    group: 'Arma',
    preco: 20,
  },
  MOSQUETE: {
    nome: 'Mosquete',
    dano: '2d8',
    critico: '19/x3',
    alcance: 'Médio',
    spaces: 2,
    tipo: 'Perfuração',
    group: 'Arma',
    preco: 500,
    weaponTags: ['armaDeFogo'],
    twoHanded: true,
    ammoType: 'Balas',
  },
  PISTOLA: {
    nome: 'Pistola',
    dano: '2d6',
    critico: '19/x3',
    alcance: 'Curto',
    spaces: 1,
    tipo: 'Perfuração',
    group: 'Arma',
    preco: 250,
    weaponTags: ['armaDeFogo'],
    ammoType: 'Balas',
  },
};

export const Armaduras: Record<string, DefenseEquipment> = {
  ARMADURA_ACOLCHOADA: {
    nome: 'Armadura Acolchoada',
    defenseBonus: 1,
    armorPenalty: 0,
    spaces: 2,
    group: 'Armadura',
    preco: 5,
  },
  ARMADURADECOURO: {
    nome: 'Armadura de couro',
    defenseBonus: 2,
    armorPenalty: 0,
    spaces: 2,
    group: 'Armadura',
    preco: 20,
  },
  COUROBATIDO: {
    nome: 'Couro batido',
    defenseBonus: 3,
    armorPenalty: 1,
    spaces: 2,
    group: 'Armadura',
    preco: 35,
  },
  GIBAODEPELES: {
    nome: 'Gibão de peles',
    defenseBonus: 4,
    armorPenalty: 3,
    spaces: 2,
    group: 'Armadura',
    preco: 25,
  },
  COURACA: {
    nome: 'Couraça',
    defenseBonus: 5,
    armorPenalty: 4,
    spaces: 2,
    group: 'Armadura',
    preco: 500,
  },
  BRUNEA: {
    nome: 'Brunea',
    defenseBonus: 5,
    armorPenalty: 2,
    spaces: 5,
    group: 'Armadura',
    preco: 50,
  },
  COTA_DE_MALHA: {
    nome: 'Cota de Malha',
    defenseBonus: 6,
    armorPenalty: 2,
    spaces: 5,
    group: 'Armadura',
    preco: 150,
  },
  LORIGA_SEGMENTADA: {
    nome: 'Loriga Segmentada',
    defenseBonus: 7,
    armorPenalty: 3,
    spaces: 5,
    group: 'Armadura',
    preco: 250,
  },
  MEIA_ARMADURA: {
    nome: 'Meia Armadura',
    defenseBonus: 8,
    armorPenalty: 4,
    spaces: 5,
    group: 'Armadura',
    preco: 600,
  },
  ARMADURA_COMPLETA: {
    nome: 'Armadura Completa',
    defenseBonus: 10,
    armorPenalty: 5,
    spaces: 5,
    group: 'Armadura',
    preco: 3000,
  },
};

export const Escudos: Record<string, DefenseEquipment> = {
  ESCUDOLEVE: {
    nome: 'Escudo Leve',
    defenseBonus: 1,
    armorPenalty: 1,
    spaces: 1,
    group: 'Escudo',
    preco: 5,
  },
  ESCUDO_PESADO: {
    nome: 'Escudo Pesado',
    defenseBonus: 2,
    armorPenalty: 2,
    spaces: 2,
    group: 'Escudo',
    preco: 15,
  },
};

const EQUIPAMENTOS: CombatItems = {
  armasSimples: [
    Armas.ADAGA,
    Armas.ESPADACURTA,
    Armas.FOICE,
    Armas.CLAVA,
    Armas.LANCA,
    Armas.MACA,
    Armas.BORDAO,
    Armas.PIQUE,
    Armas.TACAPE,
    Armas.AZAGAIA,
    Armas.BESTALEVE,
    Armas.FUNDA,
    Armas.ARCOCURTO,
    Armas.MANOPLA,
  ],
  armasMarciais: [
    Armas.MACHADINHA,
    Armas.CIMITARRA,
    Armas.ESPADA_LONGA,
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
    Armas.MARRETA,
    Armas.MONTANTE,
    Armas.ARCO_LONGO,
    Armas.BESTA_PESADA,
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
  municao: [Armas.BALAS, Armas.FLECHAS, Armas.PEDRAS, Armas.VIROTES],
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

/**
 * Verifica se uma armadura é pesada.
 * Primeiro verifica a propriedade isHeavyArmor (para armaduras editadas pelo usuário),
 * depois faz fallback para verificação por nome (compatibilidade com dados antigos).
 */
export function isHeavyArmor(armor: DefenseEquipment): boolean {
  // Se a propriedade estiver definida, usar ela
  if (armor.isHeavyArmor !== undefined) {
    return armor.isHeavyArmor;
  }
  // Fallback: verificar por nome (compatibilidade com dados antigos)
  return EQUIPAMENTOS.armaduraPesada.some((heavy) => heavy.nome === armor.nome);
}

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

  // Resolve which armor (if any) is "worn" for this sheet. Armors only apply
  // when worn; with a fallback for legacy sheets that have exactly 1 armor.
  const allArmors = (cloneSheet.bag.getEquipments().Armadura ??
    []) as DefenseEquipment[];
  let wornArmor: DefenseEquipment | undefined;
  if (cloneSheet.wornArmorId) {
    wornArmor = allArmors.find((a) => a.id === cloneSheet.wornArmorId);
  }
  if (!wornArmor && !cloneSheet.wornArmorId && allArmors.length === 1) {
    // Legacy compat: single armor with no explicit selection still applies.
    [wornArmor] = allArmors;
  }
  // ≥2 armors with no wornArmorId → ambiguous, no armor applies.

  let updatedDefense = Object.values(cloneSheet.bag.getEquipments())
    .flat()
    .reduce((acc, equip) => {
      if (isDefenseEquip(equip)) {
        // Armor: only the worn one applies.
        if (equip.group === 'Armadura') {
          if (!wornArmor || equip.id !== wornArmor.id) return acc;
        }
        // Shield: only counts when explicitly wielded in a hand slot. There
        // is no legacy fallback — a shield in the bag with no hand assigned
        // does NOT contribute to defense.
        if (equip.group === 'Escudo') {
          const inHand =
            equip.id !== undefined &&
            (equip.id === cloneSheet.mainHandItemId ||
              equip.id === cloneSheet.offHandItemId);
          if (!inHand) return acc;
        }

        equipped.push(equip);

        // Only add step if defense actually changed (equipment bonus > 0)
        if (equip.defenseBonus > 0) {
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
        }

        return acc + equip.defenseBonus;
      }

      return acc;
    }, cloneSheet.defesa);

  const heavyArmor = equipped.some(
    (equip) => isDefenseEquip(equip) && isHeavyArmor(equip)
  );

  // Se não tem armadura pesada
  if (!heavyArmor) {
    // Se for nobre
    if (cloneSheet.classe.name === 'Nobre') {
      const carismaMod = cloneSheet.atributos.Carisma.value;
      // Only add step if Carisma modifier is not 0
      if (carismaMod !== 0) {
        cloneSheet.steps.push({
          label: 'Incrementou Defesa (+CAR)',
          value: [
            {
              value: `${updatedDefense} + ${carismaMod} = ${
                updatedDefense + carismaMod
              }`,
            },
          ],
        });
      }
      updatedDefense += carismaMod;
    }
    // Se não for Nobre
    else {
      const destreza = cloneSheet.atributos.Destreza.value;
      // Only add step if Destreza modifier is not 0
      if (destreza !== 0) {
        cloneSheet.steps.push({
          label: 'Incrementou Defesa (+DES)',
          value: [
            {
              value: `${updatedDefense} + ${destreza} = ${
                updatedDefense + destreza
              }`,
            },
          ],
        });
      }
      updatedDefense += destreza;
    }
  }

  return { ...cloneSheet, defesa: updatedDefense };
}
