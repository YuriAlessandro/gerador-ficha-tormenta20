import { cloneDeep } from 'lodash';
import CharacterSheet, { SubStep } from '../../interfaces/CharacterSheet';
import Race from '../../interfaces/Race';
import { Atributo } from '../atributos';
import { addOrCheapenSpell, spellsCircle1 } from '../magias/generalSpells';
import { RACE_SIZES } from './raceSizes/raceSizes';

class SULFURE implements Race {
  name = 'Suraggel (Sulfure)';

  attributes = {
    attrs: [
      { attr: Atributo.DESTREZA, mod: 4 },
      { attr: Atributo.INTELIGENCIA, mod: 2 },
    ],
  };

  displacement = 9;

  size = RACE_SIZES.MEDIO;

  faithProbability = {
    AHARADAK: 1,
    KALLYADRANOCH: 1,
    TENEBRA: 1,
  };

  abilities = [
    {
      name: 'Herança Divina',
      description:
        'Você é uma criatura do tipo espírito e recebe visão no escuro.',
    },
    {
      name: 'Sombras Profanas',
      description:
        'Você recebe +2 em Enganação e Furtividade. Além disso, pode lançar Escuridão (como uma magia divina; atributo-chave Inteligência). Caso aprenda novamente essa magia, o custo para lançá-la diminui em –1 PM.',
      action(sheet: CharacterSheet, substeps: SubStep[]): CharacterSheet {
        const sheetClone = cloneDeep(sheet);

        const { stepValue, spells } = addOrCheapenSpell(
          sheetClone,
          spellsCircle1.escuridao,
          Atributo.INTELIGENCIA
        );
        sheetClone.spells = spells;

        if (stepValue) {
          substeps.push({
            name: 'Sombras Profanas',
            value: stepValue,
          });
        }

        return sheetClone;
      },
    },
  ];
}

export default SULFURE;
