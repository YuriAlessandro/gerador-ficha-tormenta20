import { cloneDeep, merge } from 'lodash';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Race from '../../interfaces/Race';
import { Spell } from '../../interfaces/Spells';
import { Atributo } from '../atributos';
import { spellsCircle1 } from '../magias/generalSpells';

export const PLANTS_FRIEND_MANA_REDUCTION = 1;
function cheapenControlPlants(spells: Spell[], index: number) {
  let { manaReduction = 0 } = spells[index];
  if (manaReduction < PLANTS_FRIEND_MANA_REDUCTION)
    manaReduction = PLANTS_FRIEND_MANA_REDUCTION;
  return spells.map((spell) => {
    if (spellsCircle1.controlarPlantas.nome === spell.nome) {
      return merge<Spell, Partial<Spell>>(spell, {
        manaReduction,
      });
    }

    return spell;
  });
}
function addOrCheapenControlPlants(
  sheet: CharacterSheet,
  spells: Spell[]
): Spell[] {
  const index = sheet.spells.findIndex(
    (spell) => spellsCircle1.controlarPlantas.nome === spell.nome
  );

  if (index < 0) {
    return [
      ...spells,
      { ...spellsCircle1.controlarPlantas, customKeyAttr: Atributo.SABEDORIA },
    ];
  }

  return cheapenControlPlants(spells, index);
}

const DAHLLAN: Race = {
  name: 'Dahllan',
  attributes: {
    attrs: [
      { attr: Atributo.SABEDORIA, mod: 4 },
      { attr: Atributo.DESTREZA, mod: 2 },
      { attr: Atributo.INTELIGENCIA, mod: -2 },
    ],
    texts: [
      'Você pode lançar a magia Controlar Plantas (atributo-chave Sabedoria). Caso aprenda novamente essa magia, seu custo diminui em –1 PM.',
      'Você pode gastar uma ação de movimento e 1 PM para transformar sua pele em casca de árvore, recebendo +2 na Defesa até o fim da cena.',
      'Você pode se comunicar com animais por meio de linguagem corporal e vocalizações. Você pode usar Adestramento para mudar atitude e pedir favores de animais (veja Diplomacia, na página 117). Caso receba esta habilidade novamente, recebe +2 em Adestramento.',
    ],
  },
  faithProbability: {
    AHARADAK: 1,
    ALLIHANNA: 1,
    LENA: 1,
    OCEANO: 1,
    THWOR: 1,
  },
  abilities: [
    {
      name: 'Amiga das Plantas',
      description:
        'Você pode lançar a magia Controlar Plantas (atributo-chave Sabedoria). Caso aprenda novamente essa magia, seu custo diminui em –1 PM.',
      action(sheet: CharacterSheet): CharacterSheet {
        const sheetClone = cloneDeep(sheet);
        const spells = addOrCheapenControlPlants(sheet, sheetClone.spells);

        return merge<CharacterSheet, Partial<CharacterSheet>>(sheetClone, {
          spells,
        });
      },
    },
  ],
};

export default DAHLLAN;
