import CharacterSheet from '../interfaces/CharacterSheet';

interface FoundryJSON {
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
      },
    },
  };
}
