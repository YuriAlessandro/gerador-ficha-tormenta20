import { cloneDeep } from 'lodash';
import CharacterSheet from '../interfaces/CharacterSheet';
import Skill from '../interfaces/Skills';
import { DEFAULT_SKILLS, FoundryCharSkill, FOUNDRY_SKILLS } from './skills';

interface FoundryCharAttribute {
  value: number;
  bonus: number;
  base: number;
  racial: number;
}

const foundrySizes: Record<string, string> = {
  Minúsculo: 'Minusculo',
  Pequeno: 'Pequeno',
  Médio: 'Medio',
  Gigante: 'Gigante',
  Enorme: 'Enorme',
  Colossal: 'Colossal',
};
export interface FoundryJSON {
  name: string;
  type: string;
  system: {
    atributos: {
      for: FoundryCharAttribute;
      des: FoundryCharAttribute;
      con: FoundryCharAttribute;
      int: FoundryCharAttribute;
      sab: FoundryCharAttribute;
      car: FoundryCharAttribute;
    };
    attributes: {
      cd: number;
      pv: {
        value: number;
        min: number;
        max: number;
        temp: number;
      };
      pm: {
        value: number;
        min: number;
        max: number;
        temp: number;
      };
      movement: {
        burrow: number;
        climb: number;
        fly: number;
        swim: number;
        walk: number;
        hover: boolean;
      };
      defesa: {
        base: number;
        value: number;
        outros: number;
        atributo: string;
        pda: number;
        bonus: [];
        condi: number;
      };
      sentidos: {
        value: string[];
        custom: string;
      };
      conjuracao: string;
      nivel: {
        value: number;
        xp: {
          value: number;
          min: number;
          proximo: number;
        };
      };
      carga: {
        value: number;
        max: number;
        atributo: string;
        base: number;
        bonus: [];
        pct: number;
        encumbered: false;
      };
      treino: number;
    };
    detalhes: {
      biography: {
        value: string;
        public: string;
      };
      raca: string;
      divindade: string;
      origem: string;
      info: string;
    };
    tracos: {
      tamanho: string;
      profArmas: {
        value: string[];
      };
      profArmaduras: {
        value: string[];
      };
    };
    pericias: Record<string, FoundryCharSkill>;
  };
  items: [
    {
      name: string;
      type: string;
      system: {
        inicial: boolean;
        niveis: number;
        pvPorNivel: number;
        pmPorNivel: number;
      };
    }
  ];
}

function setOficio(acc: Record<string, FoundryCharSkill>, skill: Skill) {
  const nextIndex = Object.keys(acc.ofi.mais || {}).length;
  acc.ofi = {
    ...acc.ofi,
    mais: {
      ...acc.ofi.mais,
      [nextIndex]: {
        atributo: 'int',
        label: skill,
        treino: 0,
        treinado: 1,
        outros: 0,
      },
    },
  };
}

function getSkills(sheet: CharacterSheet): Record<string, FoundryCharSkill> {
  return sheet.skills.reduce((acc, skill) => {
    if (FOUNDRY_SKILLS[skill]) {
      if (skill.startsWith('Of')) {
        setOficio(acc, skill);
        return acc;
      }

      const skillKey = FOUNDRY_SKILLS[skill];
      acc[skillKey].treino = 1;
    }

    return acc;
  }, cloneDeep(DEFAULT_SKILLS));
}

export function convertToFoundry(sheet: CharacterSheet): FoundryJSON {
  return {
    name: sheet.nome,
    type: 'character',
    system: {
      atributos: {
        for: {
          value: 0,
          bonus: 0,
          base: sheet.atributos.Força.mod,
          racial: 0,
        },
        des: {
          value: 0,
          bonus: 0,
          base: sheet.atributos.Destreza.mod,
          racial: 0,
        },
        con: {
          value: 0,
          bonus: 0,
          base: sheet.atributos.Constituição.mod,
          racial: 0,
        },
        int: {
          value: 0,
          bonus: 0,
          base: sheet.atributos.Inteligência.mod,
          racial: 0,
        },
        sab: {
          value: 0,
          bonus: 0,
          base: sheet.atributos.Sabedoria.mod,
          racial: 0,
        },
        car: {
          value: 0,
          bonus: 0,
          base: sheet.atributos.Carisma.mod,
          racial: 0,
        },
      },
      attributes: {
        cd: 10,
        pv: {
          value: sheet.pv,
          min: -500,
          max: sheet.classe.pv,
          temp: 0,
        },
        pm: {
          value: sheet.pm,
          min: 0,
          max: sheet.classe.pm,
          temp: 0,
        },
        movement: {
          burrow: 0,
          climb: 0,
          fly: 0,
          swim: 0,
          walk: sheet.displacement,
          hover: false,
        },
        defesa: {
          base: 10,
          value: sheet.defesa,
          outros: 0,
          atributo: 'des',
          bonus: [],
          condi: 0,
          pda: 0,
        },
        sentidos: {
          value: sheet.sentidos || [],
          custom: '',
        },
        conjuracao: sheet.classe.spellPath
          ? `${sheet.atributos[sheet.classe.spellPath.keyAttribute].name
              .substring(0, 3)
              .toLocaleLowerCase()}`
          : '',
        nivel: {
          value: 0,
          xp: {
            value: 0,
            min: 0,
            proximo: 0,
          },
        },
        carga: {
          value: 10 + sheet.atributos.Força.mod * 2,
          max: (10 + sheet.atributos.Força.mod * 2) * 2,
          atributo: 'for',
          base: 10 + sheet.atributos.Força.mod * 2,
          bonus: [],
          pct: 0,
          encumbered: false,
        },
        treino: 0,
      },
      detalhes: {
        biography: {
          value: '',
          public: '',
        },
        raca: sheet.raca.name,
        divindade: sheet.devoto?.divindade?.name || '',
        origem: sheet.origin?.name || '',
        info: 'Ficha criada no Fichas de Nimb',
      },
      tracos: {
        tamanho: foundrySizes[sheet.size.name],
        profArmas: {
          value: [],
        },
        profArmaduras: {
          value: [],
        },
      },
      pericias: getSkills(sheet),
    },
    items: [
      {
        name: sheet.classe.name,
        type: 'classe',
        system: {
          inicial: true,
          niveis: sheet.nivel,
          pvPorNivel: sheet.classe.addpv,
          pmPorNivel: sheet.classe.addpm,
        },
      },
    ],
  };
}
