import CharacterSheet from '../interfaces/CharacterSheet';
import { CharacterAttributes } from '../interfaces/Character';
import { Atributo } from '../data/systems/tormenta20/atributos';
import Skill, { SkillsAttrs } from '../interfaces/Skills';
import Bag from '../interfaces/Bag';
import GUERREIRO from '../data/systems/tormenta20/classes/guerreiro';
import { ClassDescription } from '../interfaces/Class';
import { RACE_SIZES } from '../data/systems/tormenta20/races/raceSizes/raceSizes';

const createMockAttributes = (): CharacterAttributes => ({
  [Atributo.FORCA]: { name: Atributo.FORCA, value: 14, mod: 2 },
  [Atributo.DESTREZA]: { name: Atributo.DESTREZA, value: 12, mod: 1 },
  [Atributo.CONSTITUICAO]: { name: Atributo.CONSTITUICAO, value: 13, mod: 1 },
  [Atributo.INTELIGENCIA]: { name: Atributo.INTELIGENCIA, value: 10, mod: 0 },
  [Atributo.SABEDORIA]: { name: Atributo.SABEDORIA, value: 11, mod: 0 },
  [Atributo.CARISMA]: { name: Atributo.CARISMA, value: 8, mod: -1 },
});

const createMockCompleteSkills = () =>
  Object.entries(SkillsAttrs).map(([skillName, attr]) => ({
    name: skillName as Skill,
    halfLevel: 1, // Level 2 character
    training: 0,
    modAttr: attr as unknown as Atributo,
    others: 0,
  }));

// Use a simple class configuration for testing
const SIMPLE_CLASS: ClassDescription = {
  name: 'Simple Test Class',
  pv: 20,
  addpv: 5,
  pm: 3,
  addpm: 3,
  periciasbasicas: [],
  periciasrestantes: { qtd: 0, list: [] },
  proficiencias: [...GUERREIRO.proficiencias],
  abilities: [],
  powers: [],
  probDevoto: 0.5,
  attrPriority: [Atributo.FORCA],
};

export const createMockCharacterSheet = (): CharacterSheet => ({
  id: 'test-character-id',
  nome: 'Test Character',
  sexo: 'M',
  nivel: 2,
  raca: {
    name: 'Humano',
    attributes: {
      attrs: [],
    },
    faithProbability: {},
    abilities: [],
  },
  classe: SIMPLE_CLASS,
  origin: undefined,
  devoto: undefined,
  atributos: createMockAttributes(),
  skills: [Skill.ATLETISMO, Skill.INTIMIDACAO], // Basic trained skills
  completeSkills: createMockCompleteSkills(),
  generalPowers: [],
  classPowers: [],
  sheetBonuses: [],
  sheetActionHistory: [],
  spells: [],
  displacement: 9,
  size: RACE_SIZES.MEDIO,
  maxSpaces: 10,
  pv: 24, // Base HP for level 2 fighter
  pm: 2, // Base MP
  defesa: 15, // Base defense (10 + 1 Dex + 4 armor)
  bag: new Bag(),
  steps: [],
});

export const createMockCharacterSheetWithPowers = (_powerNames: string[]) => {
  const sheet = createMockCharacterSheet();
  // This would need to be expanded based on actual power objects
  return sheet;
};
