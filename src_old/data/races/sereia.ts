import { cloneDeep } from 'lodash';
import CharacterSheet, { SubStep } from '../../interfaces/CharacterSheet';
import Race from '../../interfaces/Race';
import { Atributo } from '../atributos';
import {
  addOrCheapenRandomSpells,
  spellsCircle1,
} from '../magias/generalSpells';

const seaSongSpells = [
  spellsCircle1.amedrontar,
  spellsCircle1.comando,
  spellsCircle1.despedacar,
  spellsCircle1.enfeiticar,
  spellsCircle1.hipnotismo,
  spellsCircle1.sono,
];

const SEREIA: Race = {
  name: 'Sereia',
  attributes: {
    attrs: [
      { attr: 'any', mod: 2 },
      { attr: 'any', mod: 2 },
      { attr: 'any', mod: 2 },
    ],
  },
  faithProbability: {
    AHARADAK: 1,
    OCEANO: 1,
    THWOR: 1,
  },
  abilities: [
    {
      name: 'Canção dos Mares',
      description:
        'Você pode lançar duas das magias a seguir: Amedrontar, Comando, Despedaçar, Enfeitiçar, Hipnotismo ou Sono (atributo-chave Carisma). Caso aprenda novamente uma dessas magias, seu custo diminui em –1 PM.',
      action(sheet: CharacterSheet, substeps: SubStep[]): CharacterSheet {
        const sheetClone = cloneDeep(sheet);

        addOrCheapenRandomSpells(
          sheetClone,
          substeps,
          seaSongSpells,
          'Canção dos Mares',
          Atributo.CARISMA
        );

        return sheetClone;
      },
    },
    {
      name: 'Mestre do Tridente',
      description:
        'Para você, o tridente é uma arma simples. Além disso, você recebe +2 em rolagens de dano com azagaias, lanças e tridentes',
    },
    {
      name: 'Transformação Anfíbia',
      description:
        'Você pode respirar debaixo d’água e possui uma cauda que fornece deslocamento de natação 12m. Quando fora d’água, sua cauda desaparece e dá lugar a pernas (deslocamento 9m). Se permanecer mais de um dia sem contato com água, você não recupera PM com descanso até voltar para a água (ou, pelo menos, tomar um bom banho!).',
    },
  ],
};

export default SEREIA;
