import CharacterSheet from '../interfaces/CharacterSheet';

interface FoundryCharAttribute {
  value: number;
  raca: number;
  bonus: number;
  temp: number;
  mod: number;
  penalidade: number;
}
export interface FoundryJSON {
  name: string;
  type: string;
  data: {
    attributes: {
      raca: string;
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
      info: string;
      cd: number;
      hp: number;
      classe: string;
      divindade: string;
      origem: string;
      senses: {
        darkvision: number;
        blindsight: number;
        tremorsense: number;
        truesight: number;
        units: string;
        special: string;
      };
    };
    rd: {
      value: number;
      base: number;
      temp: number;
      bonus: number;
      penalidade: number;
    };
    defesa: {
      value: number;
      outro: number;
      bonus: string;
      penalidade: number;
      final: number;
      des: boolean;
      pda: number;
      temp: number | null;
    };
    atributos: {
      for: FoundryCharAttribute;
      des: FoundryCharAttribute;
      con: FoundryCharAttribute;
      int: FoundryCharAttribute;
      sab: FoundryCharAttribute;
      car: FoundryCharAttribute;
    };
  };
}

function getOriginAndDevotionString(sheet: CharacterSheet) {
  if (sheet.origin && sheet.devoto) {
    return `${sheet.origin.name} devoto de ${sheet.devoto.divindade.name}`;
  }

  if (sheet.origin) {
    return sheet.origin.name;
  }

  if (sheet.devoto) {
    return `Devoto de ${sheet.devoto.divindade.name}`;
  }

  return '';
}

export function convertToFoundry(sheet: CharacterSheet): FoundryJSON {
  return {
    name: sheet.nome,
    type: 'character',
    data: {
      attributes: {
        raca: sheet.raca.name,
        pv: {
          value: sheet.classe.pv,
          min: -500,
          max: sheet.classe.pv,
          temp: 0,
        },
        pm: {
          value: sheet.classe.pm,
          min: 0,
          max: sheet.classe.pm,
          temp: 0,
        },
        nivel: {
          value: 1,
          xp: {
            value: 0,
            min: 0,
            proximo: 1000,
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
        info: getOriginAndDevotionString(sheet),
        cd: 0,
        hp: 0,
        classe: sheet.classe.name,
        divindade: sheet.devoto?.divindade?.name || '',
        origem: sheet.origin?.name || '',
        senses: {
          darkvision: 0,
          blindsight: 0,
          tremorsense: 0,
          truesight: 0,
          units: 'm',
          special: '',
        },
      },
      rd: {
        value: 0,
        base: 0,
        temp: 0,
        bonus: 0,
        penalidade: 0,
      },
      defesa: {
        value: 10,
        outro: 0,
        bonus: '',
        penalidade: 0,
        final: 0,
        des: true,
        pda: 0,
        temp: null,
      },
      atributos: {
        for: {
          value: sheet.atributos.Força.value,
          raca: 0,
          bonus: 0,
          temp: 0,
          mod: 0,
          penalidade: 0,
        },
        des: {
          value: sheet.atributos.Destreza.value,
          raca: 0,
          bonus: 0,
          temp: 0,
          mod: 0,
          penalidade: 0,
        },
        con: {
          value: sheet.atributos.Constituição.value,
          raca: 0,
          bonus: 0,
          temp: 0,
          mod: 0,
          penalidade: 0,
        },
        int: {
          value: sheet.atributos.Inteligência.value,
          raca: 0,
          bonus: 0,
          temp: 0,
          mod: 0,
          penalidade: 0,
        },
        sab: {
          value: sheet.atributos.Sabedoria.value,
          raca: 0,
          bonus: 0,
          temp: 0,
          mod: 0,
          penalidade: 0,
        },
        car: {
          value: sheet.atributos.Carisma.value,
          raca: 0,
          bonus: 0,
          temp: 0,
          mod: 0,
          penalidade: 0,
        },
      },
    },
  };
}
