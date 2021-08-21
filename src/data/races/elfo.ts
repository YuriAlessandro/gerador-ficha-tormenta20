import { cloneDeep, merge } from 'lodash';
import CharacterSheet, { SubStep } from '../../interfaces/CharacterSheet';
import Race from '../../interfaces/Race';
import { Atributo } from '../atributos';

const ELFO: Race = {
  name: 'Elfo',
  attributes: {
    attrs: [
      { attr: Atributo.INTELIGENCIA, mod: 4 },
      { attr: Atributo.DESTREZA, mod: 2 },
      { attr: Atributo.CONSTITUICAO, mod: -2 },
    ],
  },
  faithProbability: {
    AHARADAK: 1,
    ALLIHANNA: 1,
    THWOR: 1,
    KALLYADRANOCH: 1,
    MARAH: 1,
    WYNNA: 1,
  },
  getDisplacement: () => 12,
  abilities: [
    {
      name: 'Graça de Glórienn',
      description: 'Seu deslocamento é 12m (em vez de 9m).',
    },
    {
      name: 'Herança Feérica',
      description: 'Você recebe +1 ponto de mana por nível.',
      action(sheet: CharacterSheet, substeps: SubStep[]): CharacterSheet {
        const sheetClone = cloneDeep(sheet);

        const finalAddPM = sheet.classe.addpm + 1;
        substeps.push({
          name: 'Herança Feérica',
          value: `+1 PM por nível (${sheet.classe.addpm} + 1 = ${finalAddPM})`,
        });

        return merge<CharacterSheet, Partial<CharacterSheet>>(sheetClone, {
          classe: {
            ...sheetClone.classe,
            addpm: finalAddPM,
          },
          pm: sheetClone.pm + 1,
        });
      },
    },
    {
      name: 'Sentidos Élficos',
      description:
        'Você recebe visão na penumbra e +2 em Misticismo e Percepção.',
    },
  ],
};

export default ELFO;
