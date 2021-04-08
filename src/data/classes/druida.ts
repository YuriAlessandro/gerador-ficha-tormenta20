import _ from 'lodash';
import { pickFromArray } from '../../functions/randomUtils';
import CharacterSheet, { SubStep } from '../../interfaces/CharacterSheet';
import { ClassDescription } from '../../interfaces/Class';
import Skills from '../../interfaces/Skills';
import { allSpellSchools } from '../../interfaces/Spells';
import { Atributo } from '../atributos';
import PROFICIENCIAS from '../proficiencias';

const DRUIDA: ClassDescription = {
  name: 'Druida',
  pv: 16,
  addpv: 4,
  pm: 4,
  addpm: 4,
  periciasbasicas: [
    {
      type: 'and',
      list: [Skills.SOBREVIVENCIA, Skills.VONTADE],
    },
  ],
  periciasrestantes: {
    qtd: 4,
    list: [
      Skills.ADESTRAMENTO,
      Skills.ATLETISMO,
      Skills.CAVALGAR,
      Skills.CONHECIMENTO,
      Skills.CURA,
      Skills.FORTITUDE,
      Skills.INICIATIVA,
      Skills.INTUICAO,
      Skills.LUTA,
      Skills.MISTICISMO,
      Skills.OFICIO,
      Skills.PERCEPCAO,
      Skills.RELIGIAO,
    ],
  },
  proficiencias: [
    PROFICIENCIAS.SIMPLES,
    PROFICIENCIAS.LEVES,
    PROFICIENCIAS.ESCUDOS,
  ],
  abilities: [
    {
      name: 'Devoto',
      text:
        'Você se torna devoto de uma divindade disponível para druidas (Allihanna, Megalokk ou Oceano). Você deve obedecer às Obrigações & Restrições de seu deus, mas, em troca, ganha os Poderes Concedidos dele. O nome desta habilidade muda de acordo com a divindade escolhida: Devoto de Allihanna, Devoto de Megalokk ou Devoto de Oceano.',
      nivel: 1,
    },
    {
      name: 'Empatia Selvagem',
      text:
        'Você pode se comunicar com animais por meio de linguagem corporal e vocalizações. Você pode usar Adestramento com animais para mudar atitude e pedir favores (veja Diplomacia, na página 117).',
      nivel: 1,
    },
    {
      name: 'Magias',
      text:
        'Escolha três escolas de magia. Uma vez feita, essa escolha não pode ser mudada. Você pode lançar magias divinas de 1º círculo que pertençam a essas escolas. À medida que sobe de nível, pode lançar magias de círculos maiores (2º círculo no 6º nível, 3º círculo no 10º nível e 4º círculo no 14º nível). Você começa com duas magias de 1º círculo. A cada nível par (2º, 4º etc.), aprende uma magia de qualquer círculo e escola que possa lançar. Seu atributo-chave para lançar magias é Sabedoria e você soma seu bônus de Sabedoria no seu total de PM. Veja o Capítulo 4 para as regras de magia.',
      nivel: 1,
      action(sheet: CharacterSheet, substeps: SubStep[]): CharacterSheet {
        const sheetClone = _.cloneDeep(sheet);

        const finalPM = sheet.pm + sheet.atributos.Sabedoria.mod;
        substeps.push({
          name: 'Magias',
          value: `+(Mod SAB) PMs inicias (${sheet.pm} + ${sheet.atributos.Sabedoria.mod} = ${finalPM})`,
        });

        return _.merge<CharacterSheet, Partial<CharacterSheet>>(sheetClone, {
          pm: finalPM,
        });
      },
    },
  ],
  powers: [],
  probDevoto: 1,
  qtdPoderesConcedidos: 'all',
  faithProbability: {
    AHARADAK: 0,
    OCEANO: 1,
    TENEBRA: 0,
    VALKARIA: 0,
    WYNNA: 0,
    LENA: 0,
    SSZZAAS: 0,
    THYATIS: 0,
    ARSENAL: 0,
    TANNATOH: 0,
    ALLIHANNA: 1,
    MARAH: 0,
    KALLYADRANOCH: 0,
    KHALMYR: 0,
    THWOR: 0,
    HYNINN: 0,
    AZGHER: 0,
    LINWU: 0,
    MEGALOKK: 1,
    NIMB: 0,
  },
  attrPriority: [Atributo.SABEDORIA],
  setup: (classe) => {
    const modifiedClasse = _.cloneDeep(classe);
    modifiedClasse.spellPath = {
      initialSpells: 2,
      spellType: 'Divine',
      qtySpellsLearnAtLevel: (level) => (level % 2 === 0 ? 1 : 0),
      schools: pickFromArray(allSpellSchools, 3),
      spellCircleAvailableAtLevel: (level) => {
        if (level < 6) return 1;
        if (level < 10) return 2;
        if (level < 14) return 3;
        return 4;
      },
      keyAttribute: Atributo.SABEDORIA,
    };

    return modifiedClasse;
  },
};

export default DRUIDA;
