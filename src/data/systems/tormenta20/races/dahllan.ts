import Race from '../../../../interfaces/Race';
import { Atributo } from '../atributos';
import { spellsCircle1 } from '../magias/generalSpells';

export const PLANTS_FRIEND_MANA_REDUCTION = 1;

const DAHLLAN: Race = {
  name: 'Dahllan',
  attributes: {
    attrs: [
      { attr: Atributo.SABEDORIA, mod: 2 },
      { attr: Atributo.DESTREZA, mod: 1 },
      { attr: Atributo.INTELIGENCIA, mod: -1 },
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
      sheetActions: [
        {
          source: {
            type: 'power',
            name: 'Amiga das Plantas',
          },
          action: {
            type: 'learnSpell',
            availableSpells: [spellsCircle1.controlarPlantas],
            pick: 1,
            customAttribute: Atributo.SABEDORIA,
          },
        },
      ],
    },
    {
      name: 'Armadura de Allihanna',
      description:
        'Você pode gastar uma ação de movimento e 1 PM para transformar sua pele em casca de árvore, recebendo +2 na Defesa até o fim da cena.',
    },
    {
      name: 'Empatia Selvagem',
      description:
        'Você pode se comunicar com animais por meio de linguagem corporal e vocalizações. Você pode usar Adestramento para mudar atitude e pedir favores de animais (veja Diplomacia, na página 118). Caso receba esta habilidade novamente, recebe +2 em Adestramento.',
    },
  ],
};

export default DAHLLAN;
