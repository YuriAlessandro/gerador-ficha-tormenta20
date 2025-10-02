import { cloneDeep } from 'lodash';

import { ThreatSheet, ThreatSize, ThreatType } from '../interfaces/ThreatSheet';
import { Atributo } from '../data/systems/tormenta20/atributos';
import { DEFAULT_SKILLS } from './skills';

// Size mapping for threats
const threatSizes: Record<ThreatSize, string> = {
  [ThreatSize.MINUSCULO]: 'min',
  [ThreatSize.PEQUENO]: 'peq',
  [ThreatSize.MEDIO]: 'med',
  [ThreatSize.GRANDE]: 'gra',
  [ThreatSize.ENORME]: 'eno',
  [ThreatSize.COLOSSAL]: 'col',
};

// Type mapping for threats
const threatTypes: Record<ThreatType, string> = {
  [ThreatType.ANIMAL]: 'ani',
  [ThreatType.CONSTRUTO]: 'con',
  [ThreatType.ESPIRITO]: 'esp',
  [ThreatType.HUMANOIDE]: 'hum',
  [ThreatType.MONSTRO]: 'mon',
  [ThreatType.MORTO_VIVO]: 'mor',
};

interface FoundryResistance {
  value: number;
  base: number;
  bonus: unknown[];
  imunidade: boolean;
  vulnerabilidade: boolean;
  excecao: number;
}

interface FoundryEnemyJSON {
  name: string;
  type: string;
  system: {
    atributos: {
      for: { value: number; bonus: number; base: number; racial: number };
      des: { value: number; bonus: number; base: number; racial: number };
      con: { value: number; bonus: number; base: number; racial: number };
      int: { value: number; bonus: number; base: number; racial: number };
      sab: { value: number; bonus: number; base: number; racial: number };
      car: { value: number; bonus: number; base: number; racial: number };
    };
    attributes: {
      cd: number;
      pv: { value: number; min: number; max: number; temp: number };
      pm: { value: number; min: number; max: number; temp: number };
      movement: {
        burrow: number;
        climb: number;
        fly: number;
        swim: number;
        walk: number;
        unit: string;
        hover: boolean;
      };
      defesa: {
        base: number;
        value: number;
        outros: number;
        atributo: string;
        pda: number;
        bonus: unknown[];
        condi: number;
      };
      sentidos: { value: string[]; custom: string };
      conjuracao: string;
      nivel: {
        value: number;
        xp: { value: number; pct: number; proximo: number };
      };
      carga: {
        value: number;
        atributo: string;
        base: number;
        bonus: unknown[];
        max: number;
        pct: number;
        encumbered: boolean;
      };
      treino: number;
      nd: string;
    };
    detalhes: {
      biography: { value: string; public: string };
      raca: string;
      tipo: string;
      divindade: string;
      equipamento: string;
      resistencias: string;
      tesouro: string;
      role: string;
      origem: string;
      movimento: string;
      ataquescac: string;
      ataquesad: string;
    };
    tracos: {
      tamanho: string;
      resistencias: {
        perda: FoundryResistance;
        acido: FoundryResistance;
        corte: FoundryResistance;
        eletricidade: FoundryResistance;
        essencia: FoundryResistance;
        fogo: FoundryResistance;
        frio: FoundryResistance;
        impacto: FoundryResistance;
        luz: FoundryResistance;
        psiquico: FoundryResistance;
        perfuracao: FoundryResistance;
        trevas: FoundryResistance;
      };
    };
    pericias: Record<string, unknown>;
  };
  items: unknown[];
}

function getAttributeModifier(value: number | '-'): number {
  if (value === '-') return 0;
  return Math.floor((value - 10) / 2);
}

function createDefaultResistance(): FoundryResistance {
  return {
    value: 0,
    base: 0,
    bonus: [],
    imunidade: false,
    vulnerabilidade: false,
    excecao: 0,
  };
}

function getThreatSkills(threat: ThreatSheet) {
  const skills = cloneDeep(DEFAULT_SKILLS);

  // Set the save values based on resistance assignments and combat stats
  if (skills.fort) {
    skills.fort.outros = threat.combatStats.strongSave;
    if (threat.resistanceAssignments.Fortitude === 'medium') {
      skills.fort.outros = threat.combatStats.mediumSave;
    } else if (threat.resistanceAssignments.Fortitude === 'weak') {
      skills.fort.outros = threat.combatStats.weakSave;
    }
  }

  if (skills.refl) {
    skills.refl.outros = threat.combatStats.strongSave;
    if (threat.resistanceAssignments.Reflexos === 'medium') {
      skills.refl.outros = threat.combatStats.mediumSave;
    } else if (threat.resistanceAssignments.Reflexos === 'weak') {
      skills.refl.outros = threat.combatStats.weakSave;
    }
  }

  if (skills.vont) {
    skills.vont.outros = threat.combatStats.strongSave;
    if (threat.resistanceAssignments.Vontade === 'medium') {
      skills.vont.outros = threat.combatStats.mediumSave;
    } else if (threat.resistanceAssignments.Vontade === 'weak') {
      skills.vont.outros = threat.combatStats.weakSave;
    }
  }

  // Set initiative and perception from threat skills if available
  if (skills.inic) {
    const initiative = threat.skills.find((s) => s.name === 'Iniciativa');
    if (initiative) {
      skills.inic.outros = initiative.total;
    }
  }

  if (skills.perc) {
    const perception = threat.skills.find((s) => s.name === 'Percepção');
    if (perception) {
      skills.perc.outros = perception.total;
    }
  }

  return skills;
}

export function convertThreatToFoundry(threat: ThreatSheet): FoundryEnemyJSON {
  // Calculate attribute modifiers
  const forMod = getAttributeModifier(threat.attributes[Atributo.FORCA]);
  const desMod = getAttributeModifier(threat.attributes[Atributo.DESTREZA]);
  const conMod = getAttributeModifier(threat.attributes[Atributo.CONSTITUICAO]);
  const intMod = getAttributeModifier(threat.attributes[Atributo.INTELIGENCIA]);
  const sabMod = getAttributeModifier(threat.attributes[Atributo.SABEDORIA]);
  const carMod = getAttributeModifier(threat.attributes[Atributo.CARISMA]);

  const foundryJSON: FoundryEnemyJSON = {
    name: threat.name,
    type: 'npc',
    system: {
      atributos: {
        for: { value: 0, bonus: 0, base: forMod, racial: 0 },
        des: { value: 0, bonus: 0, base: desMod, racial: 0 },
        con: { value: 0, bonus: 0, base: conMod, racial: 0 },
        int: { value: 0, bonus: 0, base: intMod, racial: 0 },
        sab: { value: 0, bonus: 0, base: sabMod, racial: 0 },
        car: { value: 0, bonus: 0, base: carMod, racial: 0 },
      },
      attributes: {
        cd: threat.combatStats.standardEffectDC || 10,
        pv: {
          value: threat.combatStats.hitPoints,
          min: 0,
          max: threat.combatStats.hitPoints,
          temp: 0,
        },
        pm: {
          value: threat.combatStats.manaPoints || 0,
          min: 0,
          max: threat.combatStats.manaPoints || 0,
          temp: 0,
        },
        movement: {
          burrow: 0,
          climb: 0,
          fly: 0,
          swim: 0,
          walk: parseInt(threat.displacement, 10) || 9,
          unit: 'm',
          hover: false,
        },
        defesa: {
          base: threat.combatStats.defense,
          value: 10,
          outros: 0,
          atributo: 'des',
          pda: 0,
          bonus: [],
          condi: 0,
        },
        sentidos: { value: [], custom: '' },
        conjuracao: 'int',
        nivel: {
          value: 0,
          xp: { value: 0, pct: 0, proximo: 0 },
        },
        carga: {
          value: 0,
          atributo: 'for',
          base: 10,
          bonus: [],
          max: 0,
          pct: 0,
          encumbered: false,
        },
        treino: 0,
        nd: threat.challengeLevel,
      },
      detalhes: {
        biography: { value: '', public: '' },
        raca: '',
        tipo: threatTypes[threat.type] || 'mon',
        divindade: '',
        equipamento: threat.equipment || '',
        resistencias: '',
        tesouro: threat.treasureLevel,
        role: threat.role.toLowerCase(),
        origem: '',
        movimento: '',
        ataquescac: '',
        ataquesad: '',
      },
      tracos: {
        tamanho: threatSizes[threat.size] || 'med',
        resistencias: {
          perda: createDefaultResistance(),
          acido: createDefaultResistance(),
          corte: createDefaultResistance(),
          eletricidade: createDefaultResistance(),
          essencia: createDefaultResistance(),
          fogo: createDefaultResistance(),
          frio: createDefaultResistance(),
          impacto: createDefaultResistance(),
          luz: createDefaultResistance(),
          psiquico: createDefaultResistance(),
          perfuracao: createDefaultResistance(),
          trevas: createDefaultResistance(),
        },
      },
      pericias: getThreatSkills(threat),
    },
    items: [],
  };

  // Add attacks as weapons
  threat.attacks.forEach((attack) => {
    foundryJSON.items.push({
      name: attack.name,
      type: 'arma',
      system: {
        description: { value: '', unidentified: '' },
        source: '',
        equipado: 0,
        equipado2: { slot: 0, type: '' },
        carregado: true,
        peso: 0,
        espacos: 0,
        qtd: 0,
        preco: 0,
        pv: { value: 0, min: 0, max: 3 },
        rd: 0,
        rolls: [
          {
            name: 'Ataque',
            key: 'ataque0',
            type: 'ataque',
            parts: [
              ['1d20', '', ''],
              ['luta', '', ''],
              [attack.attackBonus.toString(), '', ''],
            ],
            versatil: '',
          },
          {
            name: 'Dano',
            key: 'dano1',
            type: 'dano',
            parts: [
              [
                attack.bonusDamage > 0
                  ? `${attack.damageDice}+${attack.bonusDamage}`
                  : attack.damageDice,
                'impacto',
                '',
              ],
              ['', '', ''],
            ],
            versatil: '',
          },
        ],
        criticoM: 20,
        criticoX: 2,
        alcance: '',
        tipoUso: 'sim',
        propriedades: {
          ada: false,
          agi: false,
          alo: false,
          des: false,
          dup: false,
          ver: false,
          hib: false,
        },
        origin: '',
        tags: [],
        rolltags: [],
        chatFlavor: '',
        chatGif: '',
        ativacao: {
          custo: 0,
          condicao: '',
          execucao: '',
          qtd: '',
          special: '',
        },
        consume: {
          amount: 0,
          mpMultiplier: false,
          target: '',
          type: '',
        },
        upgrades: {},
        melhorias: {},
        encantos: {},
        ataques: 0,
        proficiencia: 'natural',
        proposito: 'corpo-a-corpo',
        empunhadura: '',
        size: 'normal',
        enableAutoUpgrades: false,
      },
    });
  });

  // Add abilities as powers
  threat.abilities.forEach((ability) => {
    foundryJSON.items.push({
      name: ability.name,
      type: 'poder',
      system: {
        description: { value: ability.description, unidentified: '' },
        source: '',
        ativacao: {
          execucao: '',
          custo: 0,
          qtd: '',
          condicao: '',
          special: '',
        },
        duracao: { value: 0, units: '', special: '' },
        target: { value: null, width: null, type: '' },
        range: { value: null, units: '' },
        consume: {
          type: '',
          target: '',
          amount: null,
          mpMultiplier: false,
        },
        efeito: '',
        alcance: 'none',
        alvo: '',
        area: '',
        resistencia: {
          pericia: '',
          atributo: '',
          bonus: 0,
          txt: '',
        },
        rolls: [],
        tipo: 'ability',
        subtipo: '',
        origin: '',
        tags: [],
        chatFlavor: '',
        upgrades: {},
      },
    });
  });

  return foundryJSON;
}
