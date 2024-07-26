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
  data: {
    tamanho: string;
    attributes: {
      treino: number;
      conjuracao: string;
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
      nivel: {
        value: number;
        xp: {
          value: number;
          min: number;
          proximo: number;
        };
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
        bonus: [];
        penalidade: number;
        condi: number;
      };
      sentidos: {
        value: [];
        custom: string;
      };
    };
    detalhes: {
      biography: {
        value: string;
        public: string;
      };
      raca: string;
      divindade: string;
      origem: string;
    };
    rd: {
      value: number;
      base: number;
      temp: number;
      bonus: number;
      penalidade: number;
    };
    atributos: {
      for: FoundryCharAttribute;
      des: FoundryCharAttribute;
      con: FoundryCharAttribute;
      int: FoundryCharAttribute;
      sab: FoundryCharAttribute;
      car: FoundryCharAttribute;
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
      acc[skillKey].treinado = 1;
    }

    return acc;
  }, cloneDeep(DEFAULT_SKILLS));
}

export function convertToFoundry(sheet: CharacterSheet): FoundryJSON {
  return {
    name: sheet.nome,
    type: 'character',
    data: {
      tamanho: foundrySizes[sheet.size.name],
      pericias: getSkills(sheet),
      attributes: {
        treino: 0,
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
        nivel: {
          value: 0,
          xp: {
            value: 0,
            min: 0,
            proximo: 0,
          },
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
          penalidade: 0,
          condi: 0,
        },
        sentidos: {
          value: [],
          custom: '',
        },
        conjuracao: sheet.classe.spellPath
          ? `${sheet.atributos[sheet.classe.spellPath.keyAttribute].name
              .substring(0, 3)
              .toLocaleLowerCase()}`
          : '',
      },
      detalhes: {
        biography: {
          value: '',
          public: '',
        },
        raca: sheet.raca.name,
        divindade: sheet.devoto?.divindade?.name || '',
        origem: sheet.origin?.name || '',
      },
      rd: {
        value: 0,
        base: 0,
        temp: 0,
        bonus: 0,
        penalidade: 0,
      },
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
