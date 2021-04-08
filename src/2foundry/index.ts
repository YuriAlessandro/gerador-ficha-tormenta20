import CharacterSheet from '../interfaces/CharacterSheet';

interface foundryJSON {
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
    };
  };
}

export function convertToFoundry(sheet: CharacterSheet): foundryJSON {
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
      },
    },
  };
}
