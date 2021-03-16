import { cloneDeep, merge } from 'lodash';
import { getRandomItemFromArray } from '../../functions/randomUtils';
import CharacterSheet, { SubStep } from '../../interfaces/CharacterSheet';
import Race from '../../interfaces/Race';
import { Atributo } from '../atributos';
import { addOrCheapenSpell, spellsCircle1 } from '../magias/generalSpells';

const QAREEN: Race = {
  name: 'Qareen',
  attributes: {
    attrs: [
      { attr: Atributo.CARISMA, mod: 4 },
      { attr: Atributo.INTELIGENCIA, mod: 2 },
      { attr: Atributo.SABEDORIA, mod: -2 },
    ],
  },
  faithProbability: {
    AHARADAK: 1,
    AZGHER: 1,
    LENA: 1,
    MARAH: 1,
    NIMB: 1,
    TENEBRA: 1,
    THWOR: 1,
    WYNNA: 1,
  },
  abilities: [
    {
      name: 'Desejos',
      description:
        'Se lançar uma magia que alguém tenha pedido desde seu último turno, o custo da magia diminui em –1 PM. Fazer um desejo ao qareen é uma ação livre.',
    },
    {
      name: 'Resistência Elemental',
      description:
        'Conforme sua ascendência, você recebe resistência 10 a um tipo de dano. Escolha uma: frio (qareen da água), eletricidade (do ar), fogo (do fogo), ácido (da terra), luz (da luz) ou trevas (qareen das trevas).',
    },
    {
      name: 'Tatuagem mística',
      description:
        'Você pode lançar uma magia de 1º círculo a sua escolha (atributo-chave Carisma). Caso aprenda novamente essa magia, seu custo diminui em –1 PM.',
      action(sheet: CharacterSheet, substeps: SubStep[]): CharacterSheet {
        const sheetClone = cloneDeep(sheet);
        const randomSpell = getRandomItemFromArray(
          Object.values(spellsCircle1)
        );

        const { stepValue, spells } = addOrCheapenSpell(
          sheetClone,
          randomSpell,
          Atributo.CARISMA
        );

        if (stepValue) {
          substeps.push({
            name: 'Tatuagem Mística',
            value: stepValue,
          });
        }

        return merge<CharacterSheet, Partial<CharacterSheet>>(sheetClone, {
          spells,
        });
      },
    },
  ],
};

export default QAREEN;
