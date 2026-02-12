import { v4 as uuid } from 'uuid';
import _, { cloneDeep, isNumber } from 'lodash';
import {
  SelectionOptions,
  ManualPowerSelections,
} from '@/interfaces/PowerSelections';
import { Atributo } from '../data/systems/tormenta20/atributos';
import { dataRegistry } from '../data/registry';
import { SupplementId } from '../types/supplement.types';
import { recalculateSheet } from './recalculateSheet';
import {
  getClassBaseSkills,
  getClassBaseSkillsWithChoices,
  getNotRepeatedSkillsByQtd,
  getRemainingSkills,
} from '../data/systems/tormenta20/pericias';
import EQUIPAMENTOS, {
  calcDefense,
  Armaduras,
  Escudos,
  bardInstruments,
  Armas,
  isHeavyArmor,
} from '../data/systems/tormenta20/equipamentos';
import {
  FAMILIARS,
  FAMILIAR_NAMES,
} from '../data/systems/tormenta20/familiars';
import {
  ANIMAL_TOTEMS,
  ANIMAL_TOTEM_NAMES,
} from '../data/systems/tormenta20/animalTotems';
import {
  standardFaithProbability,
  DivindadeEnum,
  DIVINDADES,
} from '../data/systems/tormenta20/divindades';
import { generateRandomName } from '../data/systems/tormenta20/nomes';
import {
  CharacterAttribute,
  CharacterAttributes,
  CharacterReligion,
} from '../interfaces/Character';
import Race, { RaceAttributeAbility } from '../interfaces/Race';
import { ClassDescription, ClassPower } from '../interfaces/Class';
import SelectedOptions from '../interfaces/SelectedOptions';
import {
  countTormentaPowers,
  getRandomItemFromArray,
  mergeFaithProbabilities,
  pickFaith,
  pickFromAllowed,
  pickFromArray,
  rollDice,
} from './randomUtils';
import todasProficiencias from '../data/systems/tormenta20/proficiencias';
import { generateEquipmentRewards } from './equipmentRewardGenerator';
import {
  getOriginBenefits,
  ORIGINS,
  raceHasOrigin,
} from '../data/systems/tormenta20/origins';
import Equipment, {
  BagEquipments,
  DefenseEquipment,
} from '../interfaces/Equipment';
import { alchemyItems } from '../data/systems/tormenta20/equipamentos-gerais';
import Divindade, { DivindadeNames } from '../interfaces/Divindade';
import GRANTED_POWERS from '../data/systems/tormenta20/powers/grantedPowers';
import { generateRandomGolpePessoal } from './powers/golpePessoal';
import { GOLPE_PESSOAL_EFFECTS } from '../data/systems/tormenta20/golpePessoal';
import {
  allArcaneSpellsCircle1,
  allArcaneSpellsCircle2,
  allArcaneSpellsCircle3,
  allArcaneSpellsCircle4,
  allArcaneSpellsCircle5,
  arcaneSpellsCircle1,
  arcaneSpellsCircle2,
  arcaneSpellsCircle3,
  arcaneSpellsCircle4,
  arcaneSpellsCircle5,
  getArcaneSpellsOfCircle,
} from '../data/systems/tormenta20/magias/arcane';
import {
  allDivineSpellsCircle1,
  allDivineSpellsCircle2,
  allDivineSpellsCircle3,
  allDivineSpellsCircle4,
  allDivineSpellsCircle5,
  divineSpellsCircle1,
  divineSpellsCircle2,
  divineSpellsCircle3,
  divineSpellsCircle4,
  divineSpellsCircle5,
} from '../data/systems/tormenta20/magias/divine';
import { Spell } from '../interfaces/Spells';
import {
  getRaceDisplacement,
  getRaceSize,
} from '../data/systems/tormenta20/races/functions/functions';
import Origin from '../interfaces/Origin';
import {
  GeneralPower,
  OriginPower,
  PowerGetter,
  PowersGetters,
  Requirement,
  RequirementType,
} from '../interfaces/Poderes';
import CharacterSheet, {
  SheetChangeSource,
  StatModifier,
  Step,
  SubStep,
} from '../interfaces/CharacterSheet';
import Skill, {
  SkillsAttrs,
  SkillsWithArmorPenalty,
} from '../interfaces/Skills';
import Bag from '../interfaces/Bag';
import roles from '../data/systems/tormenta20/roles';
import { RoleNames } from '../interfaces/Role';
import {
  getAllowedClassPowers,
  getPowersAllowedByRequirements,
  getWeightedInventorClassPowers,
} from './powers';
import {
  addOrCheapenRandomSpells,
  getSpellsOfCircle,
  spellsCircle1,
} from '../data/systems/tormenta20/magias/generalSpells';
import {
  applyHumanoVersatil,
  applyLefouDeformidade,
  applyOsteonMemoriaPostuma,
  applyYidishanNaturezaOrganica,
  applyMeioElfoAmbicaoHerdada,
  applyQareenResistenciaElemental,
} from './powers/special';
import {
  applyMoreauSapiencia,
  applyMoreauEspertezaVulpina,
} from './powers/moreau-special';
import {
  MOREAU_HERITAGES,
  MoreauHeritageName,
} from '../data/systems/tormenta20/ameacas-de-arton/races/moreau-heritages';
import { applyGolemDespertoSagrada } from './powers/golem-desperto-special';
import { applyFradeAutoridadeEclesiastica } from './powers/frade-special';
import { SURAGEL_ALTERNATIVE_ABILITIES } from '../data/systems/tormenta20/deuses-de-arton/races/suragelAbilities';
import { addOtherBonusToSkill } from './skills/general';
import { applyGolemDespertoCustomization } from '../data/systems/tormenta20/ameacas-de-arton/races/golem-desperto';
import { applyDuendeCustomization } from '../data/systems/tormenta20/herois-de-arton/races/duende';
import { applyMoreauCustomization } from '../data/systems/tormenta20/ameacas-de-arton/races/moreau';
import {
  getAttributeIncreasesInSamePlateau,
  getCurrentPlateau,
} from './powers/general';
import { feiticeiroPaths } from '../data/systems/tormenta20/classes/arcanista';

// Race customization interface for races with customization options
export interface RaceCustomization {
  // Golem Desperto
  golemChassis?: string;
  golemEnergySource?: string;
  golemSize?: string;
  // Duende
  duendeNature?: string;
  duendeSize?: string;
  duendeBonusAttributes?: Atributo[];
  duendePresentes?: string[];
  duendeTabuSkill?: Skill;
  // Moreau
  moreauHeritage?: string;
  moreauBonusAttributes?: Atributo[];
}

// Helper function to normalize deity names for comparison (removes hyphens and spaces)
const normalizeDeityName = (name: string): string =>
  name.toLowerCase().replace(/[-\s]/g, '');

// Inventor Specializations System
export enum InventorSpecialization {
  ALQUIMISTA = 'ALQUIMISTA',
  ARMEIRO = 'ARMEIRO',
  ENGENHOQUEIRO = 'ENGENHOQUEIRO',
}

export interface InventorSpecializationData {
  skill: Skill;
  relatedPowers: string[];
}

export const INVENTOR_SPECIALIZATIONS: Record<
  InventorSpecialization,
  InventorSpecializationData
> = {
  [InventorSpecialization.ALQUIMISTA]: {
    skill: Skill.OFICIO_ALQUIMIA,
    relatedPowers: [
      'Agite Antes de Usar',
      'Alquimista Iniciado',
      'Alquimista de Batalha',
      'Catalisador Instável',
      'Farmacêutico',
      'Homúnculo',
      'Conhecimento de Fórmulas',
      'Mistura Fervilhante',
      'Síntese Rápida',
      'Granadeiro',
      'Mestre Alquimista',
    ],
  },
  [InventorSpecialization.ARMEIRO]: {
    skill: Skill.OFICIO_ARMEIRO,
    relatedPowers: [
      'Armeiro',
      'Balística',
      'Couraceiro',
      'Ferreiro',
      'Oficina de Campo',
      'Pedra de Amolar',
      'Ajuste de Mira.',
      'Blindagem',
      'Cano Raiado',
    ],
  },
  [InventorSpecialization.ENGENHOQUEIRO]: {
    skill: Skill.OFICIO_EGENHOQUEIRO,
    relatedPowers: [
      'Engenhoqueiro',
      'Ativação Rápida',
      'Autômato',
      'Autômato Prototipado',
      'Chutes e Palavrões',
      'Manutenção Eficiente',
    ],
  },
};

function getInventorSpecialization(
  skills: Skill[]
): InventorSpecialization | null {
  const specializationEntries = Object.entries(
    INVENTOR_SPECIALIZATIONS
  ) as Array<[InventorSpecialization, InventorSpecializationData]>;

  const foundSpecialization = specializationEntries.find(([, data]) =>
    skills.includes(data.skill)
  );

  return foundSpecialization ? foundSpecialization[0] : null;
}

function ensureInventorSpecialization(skills: Skill[]): Skill[] {
  const hasSpecialization = getInventorSpecialization(skills);

  if (hasSpecialization) {
    return skills;
  }

  // Choose a random specialization skill if none exists
  const specializations = Object.values(INVENTOR_SPECIALIZATIONS);
  const randomSpecialization = getRandomItemFromArray(specializations);

  return [...skills, randomSpecialization.skill];
}

// Specific Oficio System - Replace generic "Ofício (Qualquer)" with contextual crafts
export const CONTEXTUAL_OFICIOS_BY_CLASS: Record<string, Skill[]> = {
  Inventor: [
    Skill.OFICIO_ALQUIMIA,
    Skill.OFICIO_ARMEIRO,
    Skill.OFICIO_EGENHOQUEIRO,
  ], // Already handled by specialization system
  Guerreiro: [
    Skill.OFICIO_ARMEIRO,
    Skill.OFICIO_ARTESANATO,
    Skill.OFICIO_CARPINTEIRO,
    Skill.OFICIO_MINERADOR,
  ],
  Lutador: [
    Skill.OFICIO_ARMEIRO,
    Skill.OFICIO_ARTESANATO,
    Skill.OFICIO_ALFAIATE,
    Skill.OFICIO_CULINARIA,
  ],
  Bárbaro: [
    Skill.OFICIO_FAZENDEIRO,
    Skill.OFICIO_MINERADOR,
    Skill.OFICIO_CARPINTEIRO,
    Skill.OFICIO_PESCADOR,
  ],
  Bucaneiro: [
    Skill.OFICIO_PESCADOR,
    Skill.OFICIO_CARPINTEIRO,
    Skill.OFICIO_JOALHEIRO,
    Skill.OFICIO_ARTESANATO,
  ],
  Arcanista: [
    Skill.OFICIO_ESCRIBA,
    Skill.OFICIO_JOALHEIRO,
    Skill.OFICIO_ALQUIMIA,
    Skill.OFICIO_ARTESANATO,
  ],
  Nobre: [
    Skill.OFICIO_JOALHEIRO,
    Skill.OFICIO_ALFAIATE,
    Skill.OFICIO_ESCRIBA,
    Skill.OFICIO_ARTESANATO,
  ],
  Clérigo: [
    Skill.OFICIO_ESCRIBA,
    Skill.OFICIO_CULINARIA,
    Skill.OFICIO_ARTESANATO,
    Skill.OFICIO_ALFAIATE,
  ],
  Ladino: [
    Skill.OFICIO_ALFAIATE,
    Skill.OFICIO_JOALHEIRO,
    Skill.OFICIO_ESCRIBA,
    Skill.OFICIO_ARTESANATO,
  ],
  Caçador: [
    Skill.OFICIO_CARPINTEIRO,
    Skill.OFICIO_ARTESANATO,
    Skill.OFICIO_ARMEIRO,
    Skill.OFICIO_FAZENDEIRO,
  ],
  Druida: [
    Skill.OFICIO_FAZENDEIRO,
    Skill.OFICIO_CULINARIA,
    Skill.OFICIO_ARTESANATO,
    Skill.OFICIO_CARPINTEIRO,
  ],
};

export const DEFAULT_CONTEXTUAL_OFICIOS: Skill[] = [
  Skill.OFICIO_ARTESANATO,
  Skill.OFICIO_CULINARIA,
  Skill.OFICIO_CARPINTEIRO,
  Skill.OFICIO_ALFAIATE,
  Skill.OFICIO_JOALHEIRO,
  Skill.OFICIO_ESCRIBA,
];

function replaceGenericOficioWithSpecific(
  skills: Skill[],
  className?: string
): Skill[] {
  return skills.map((skill) => {
    if (skill !== Skill.OFICIO) {
      return skill;
    }

    // Get contextual oficios for the class
    const contextualOficios =
      (className && CONTEXTUAL_OFICIOS_BY_CLASS[className]) ||
      DEFAULT_CONTEXTUAL_OFICIOS;

    // Find oficios not already in the skill list
    const availableOficios = contextualOficios.filter(
      (oficio) => !skills.includes(oficio)
    );

    // If no contextual oficios available, use default ones
    const finalOficios =
      availableOficios.length > 0
        ? availableOficios
        : DEFAULT_CONTEXTUAL_OFICIOS.filter(
            (oficio) => !skills.includes(oficio)
          );

    // Return a random specific oficio
    return finalOficios.length > 0
      ? getRandomItemFromArray(finalOficios)
      : Skill.OFICIO_ARTESANATO; // Final fallback
  });
}

export function createTruqueSpell(originalSpell: Spell): Spell {
  const truqueSpell = cloneDeep(originalSpell);
  truqueSpell.nome = `${originalSpell.nome} (Apenas Truque)`;

  // Manter apenas o primeiro aprimoramento (addPm: 0)
  if (truqueSpell.aprimoramentos && truqueSpell.aprimoramentos.length > 0) {
    truqueSpell.aprimoramentos = [truqueSpell.aprimoramentos[0]];
  }

  return truqueSpell;
}

export function createAlwaysActiveSpell(originalSpell: Spell): Spell {
  const alwaysActiveSpell = cloneDeep(originalSpell);
  alwaysActiveSpell.nome = `${originalSpell.nome} (Sempre Ativo)`;

  // Remove TODOS os aprimoramentos
  alwaysActiveSpell.aprimoramentos = [];

  return alwaysActiveSpell;
}

export function getModValue(attr: number): number {
  return Math.floor(attr / 2) - 5;
}

export function getInitialMoney(level: number): number {
  const moneyByLevel: Record<number, number> = {
    1: rollDice(4, 6, 0), // 4d6 para nível 1
    2: 300,
    3: 600,
    4: 1000,
    5: 2000,
    6: 3000,
    7: 5000,
    8: 7000,
    9: 10000,
    10: 13000,
    11: 19000,
    12: 27000,
    13: 36000,
    14: 49000,
    15: 66000,
    16: 88000,
    17: 110000,
    18: 150000,
    19: 200000,
    20: 260000,
  };

  return moneyByLevel[level] || rollDice(4, 6, 0);
}

export function getInitialMoneyWithDetails(level: number): {
  amount: number;
  details?: string;
} {
  if (level === 1) {
    // Roll 4 individual dice to show the breakdown
    const dice: number[] = [];
    for (let i = 0; i < 4; i += 1) {
      dice.push(Math.floor(Math.random() * 6) + 1);
    }
    const total = dice.reduce((sum, die) => sum + die, 0);
    return {
      amount: total,
      details: `(${dice.join(', ')})`,
    };
  }

  const fixedAmounts: Record<number, number> = {
    2: 300,
    3: 600,
    4: 1000,
    5: 2000,
    6: 3000,
    7: 5000,
    8: 7000,
    9: 10000,
    10: 13000,
    11: 19000,
    12: 27000,
    13: 36000,
    14: 49000,
    15: 66000,
    16: 88000,
    17: 110000,
    18: 150000,
    19: 200000,
    20: 260000,
  };

  return {
    amount: fixedAmounts[level] || rollDice(4, 6, 0),
  };
}

// function getRandomPer() {
//   const keys = Object.keys(PERICIAS);
//   return getRandomItemFromArray(keys);
// }

// Valor mínimo de atributo para geração aleatória (modificador -1)
const MIN_ATTRIBUTE_VALUE = 8;

function rollAttributeWithMinimum(): number {
  let value = rollDice(4, 6, 1);
  while (value < MIN_ATTRIBUTE_VALUE) {
    value = rollDice(4, 6, 1);
  }
  return value;
}

function rollAttributeValues(): number[] {
  const rolledValues = Object.values(Atributo).map(() =>
    rollAttributeWithMinimum()
  );

  // eslint-disable-next-line
  while (true) {
    const modifiers = rolledValues.map((value) => getModValue(value));
    const modSum = modifiers.reduce((acc, curr) => acc + curr);
    if (modSum >= 6) break;
    rolledValues.sort((a, b) => a - b);
    rolledValues.shift();
    rolledValues.push(rollAttributeWithMinimum());
  }

  return rolledValues;
}

function selectAttributeToChange(
  atributosModificados: string[],
  atributo: RaceAttributeAbility,
  priorityAttrs: Atributo[],
  excludeFromAny: Atributo[] = []
) {
  if (atributo.attr === 'any') {
    const atributosPermitidos = Object.values(Atributo).filter(
      (attr) =>
        !atributosModificados.includes(attr) && !excludeFromAny.includes(attr)
    );

    const atributosPreferidos = priorityAttrs.filter((attr) =>
      atributosPermitidos.includes(attr)
    );

    return getRandomItemFromArray<Atributo>(
      atributosPreferidos.length > 0 ? atributosPreferidos : atributosPermitidos
    );
  }

  return atributo.attr;
}

function getModifiedAttribute(
  selectedAttrName: Atributo,
  atributosModificados: CharacterAttributes,
  attrDaRaca: RaceAttributeAbility
): CharacterAttribute {
  const newValue =
    atributosModificados[selectedAttrName].value + attrDaRaca.mod;

  return {
    ...atributosModificados[selectedAttrName],
    value: newValue,
  };
}

interface ReduceAttributesParams {
  atributos: CharacterAttributes;
  nomesDosAtributosModificados: string[];
}

export function modifyAttributesBasedOnRace(
  raca: Race,
  atributosRolados: CharacterAttributes,
  priorityAttrs: Atributo[],
  steps: Step[],
  manualAttributeChoices?: Atributo[],
  sex?: 'Masculino' | 'Feminino'
): CharacterAttributes {
  const values: { name: string; value: string | number }[] = [];
  let manualChoiceIndex = 0; // Track which manual choice to use next

  // Use getAttributes if available (for sex-dependent attributes like Nagah)
  const raceAttributes =
    raca.getAttributes && sex ? raca.getAttributes(sex) : raca.attributes.attrs;
  const excludeFromAny = raca.attributes.excludeFromAny || [];

  const reducedAttrs = raceAttributes.reduce<ReduceAttributesParams>(
    ({ atributos, nomesDosAtributosModificados }, attrDaRaca) => {
      // Definir que atributo muda (se for any é um random ou escolha manual)
      let selectedAttrName: Atributo;

      if (attrDaRaca.attr === 'any' && manualAttributeChoices) {
        // Use manual choice if available
        selectedAttrName =
          manualAttributeChoices[manualChoiceIndex] ||
          selectAttributeToChange(
            nomesDosAtributosModificados,
            attrDaRaca,
            priorityAttrs,
            excludeFromAny
          );
        manualChoiceIndex += 1;
      } else {
        // Use automatic selection (random or fixed)
        selectedAttrName = selectAttributeToChange(
          nomesDosAtributosModificados,
          attrDaRaca,
          priorityAttrs,
          excludeFromAny
        );
      }

      const atributoModificado = getModifiedAttribute(
        selectedAttrName,
        atributos,
        attrDaRaca
      );

      values.push({
        name: selectedAttrName,
        value: attrDaRaca.mod,
      });

      return {
        atributos: {
          ...atributos,
          [selectedAttrName]: atributoModificado,
        },
        nomesDosAtributosModificados: [
          ...nomesDosAtributosModificados,
          selectedAttrName,
        ],
      };
    },
    {
      atributos: atributosRolados,
      nomesDosAtributosModificados: [],
    }
  );

  steps.push({
    type: 'Atributos',
    label: 'Atributos Modificados (raça)',
    value: values,
  });

  return reducedAttrs.atributos;
}

function generateFinalAttributes(
  classe: ClassDescription,
  race: Race,
  steps: Step[],
  sex?: 'Masculino' | 'Feminino'
) {
  const atributosNumericos = rollAttributeValues();
  let freeAttrs = Object.values(Atributo);

  const priorityAttrs = _.shuffle(classe.attrPriority);
  const priorityGeneratedAttrs = {} as CharacterAttributes;

  priorityAttrs.forEach((attr) => {
    const maxAttr = Math.max(...atributosNumericos);
    priorityGeneratedAttrs[attr] = {
      name: attr,
      value: getModValue(maxAttr), // Armazena diretamente o modificador
    };

    atributosNumericos.splice(atributosNumericos.indexOf(maxAttr), 1);

    freeAttrs = freeAttrs.filter((freeAttr) => freeAttr !== attr);
  });

  const charAttributes = freeAttrs.reduce((acc, attr, index) => {
    const modValue = getModValue(atributosNumericos[index]);
    return {
      ...acc,
      [attr]: { name: attr, value: modValue }, // Armazena diretamente o modificador
    };
  }, priorityGeneratedAttrs) as CharacterAttributes;

  const sortedAttributes = Object.values(Atributo).reduce(
    (acc, attr) => ({
      ...acc,
      [attr]: charAttributes[attr],
    }),
    {} as CharacterAttributes
  );

  steps.push({
    label: 'Atributos iniciais',
    type: 'Atributos',
    value: Object.values(sortedAttributes).map((attr) => ({
      name: attr.name,
      value: attr.value,
    })),
  });

  return modifyAttributesBasedOnRace(
    race,
    sortedAttributes,
    classe.attrPriority,
    steps,
    undefined,
    sex
  );
}

export function selectRace(selectedOptions: SelectedOptions): Race {
  const supplements = selectedOptions.supplements || [
    SupplementId.TORMENTA20_CORE,
  ];
  const races = dataRegistry.getRacesBySupplements(supplements);

  if (selectedOptions.raca) {
    const race = dataRegistry.getRaceByName(selectedOptions.raca, supplements);
    if (race) return race;
  }

  const randomRace = getRandomItemFromArray(races);
  // Use randomRace directly to support race variants with same name
  return randomRace;
}

function getRaceAndName(
  selectedOptions: SelectedOptions,
  sex: 'Homem' | 'Mulher'
) {
  // Passo 2.2: Escolher raça
  const race = selectRace(selectedOptions);

  // Forçar sexo feminino para raças exclusivamente femininas
  let finalSex = sex;
  if (race.name === 'Voracis') {
    finalSex = 'Mulher';
  }

  // Passo 2.3: Definir nome
  const nome = generateRandomName(race, finalSex);

  return { nome, race, sex: finalSex };
}

function classByName(classe: ClassDescription, classeName: string) {
  return classe.name === classeName;
}

export function isClassOrVariantOf(
  classe: ClassDescription,
  className: string
): boolean {
  return (
    classe.name === className ||
    (classe.isVariant === true && classe.baseClassName === className)
  );
}

function getClassByFilter(selectedOptions: SelectedOptions) {
  const supplements = selectedOptions.supplements || [
    SupplementId.TORMENTA20_CORE,
  ];
  const classes = dataRegistry.getClassesBySupplements(supplements);

  const foundClass = classes.find((classe) =>
    classByName(classe, selectedOptions.classe)
  );

  if (foundClass) return foundClass;

  const foundRole = Object.keys(roles).find(
    (role) => role === selectedOptions.classe
  ) as RoleNames | undefined;

  if (foundRole) {
    const choosenClassName = getRandomItemFromArray(roles[foundRole]);

    return classes.find((classe) => classByName(classe, choosenClassName));
  }

  return null;
}

export function selectClass(
  selectedOptions: SelectedOptions
): ClassDescription {
  const supplements = selectedOptions.supplements || [
    SupplementId.TORMENTA20_CORE,
  ];
  let allClasses = dataRegistry.getClassesBySupplements(supplements);

  let selectedClass: ClassDescription | undefined | null;
  if (selectedOptions.classe) {
    selectedClass = getClassByFilter(selectedOptions);
  }

  const dv = selectedOptions.devocao.value;
  if (dv) {
    allClasses = allClasses.filter(
      (cl) => cl.faithProbability?.[dv as DivindadeNames] !== 0
    );
  }

  if (!selectedClass) selectedClass = getRandomItemFromArray(allClasses);
  selectedClass = _.cloneDeep(selectedClass);
  if (selectedClass.setup) return selectedClass.setup(selectedClass);
  return selectedClass;
}

export function getAttributesSkills(
  attributes: CharacterAttributes,
  usedSkills: Skill[]
): Skill[] {
  if (attributes.Inteligência.value > 0) {
    return getNotRepeatedSkillsByQtd(usedSkills, attributes.Inteligência.value);
  }

  return [];
}

export function getSkillsAndPowersByClassAndOrigin(
  classe: ClassDescription,
  origin: Origin | undefined,
  attributes: CharacterAttributes,
  steps: Step[]
): {
  skills: Skill[];
  powers: { origin: OriginPower[]; general: PowersGetters };
} {
  let powers: {
    origin: OriginPower[];
    general: PowerGetter[];
  } = {
    origin: [],
    general: [],
  };

  const usedSkills: Skill[] = [];
  const classBaseSkills = getClassBaseSkills(classe);
  usedSkills.push(...classBaseSkills);

  if (origin) {
    const { skills: rawOriginSkills, powers: originPowers } = getOriginBenefits(
      usedSkills,
      origin
    );

    // Replace generic oficio in origin skills
    const originSkills = replaceGenericOficioWithSpecific(
      rawOriginSkills,
      classe.name
    );

    const originSubSteps: SubStep[] = [];

    if (originSkills.length) {
      originSubSteps.push(
        ...originSkills.map((skill) => ({
          name: 'Perícia',
          value: `${skill}`,
        }))
      );
    }

    if (originPowers.origin.length) {
      originSubSteps.push(
        ...originPowers.origin.map((power) => ({
          name: 'Poder Geral',
          value: ` ${power.name}`,
        }))
      );
    }

    if (originSubSteps.length) {
      steps.push({
        label: `Benefícios da origem (${origin.name})`,
        type: 'Poderes',
        value: originSubSteps.map((substep) => ({
          name: substep.name,
          value: `${substep.value}`,
        })),
      });
    }

    powers = originPowers;
    usedSkills.push(...originSkills);
  }

  let remainingSkills = getRemainingSkills(usedSkills, classe);

  // Special handling for Inventor class to ensure synergy
  if (isClassOrVariantOf(classe, 'Inventor')) {
    const skillsWithSpecialization = ensureInventorSpecialization([
      ...usedSkills,
      ...remainingSkills,
    ]);

    // If we added a specialization skill, we need to adjust remaining skills
    const addedSkills = skillsWithSpecialization.filter(
      (skill) => !usedSkills.includes(skill) && !remainingSkills.includes(skill)
    );

    if (addedSkills.length > 0) {
      // Remove one random skill to make room for the specialization
      remainingSkills = remainingSkills.slice(0, -addedSkills.length);
      remainingSkills.push(...addedSkills);
    }
  }

  usedSkills.push(...remainingSkills);

  let classSkills = [...classBaseSkills, ...remainingSkills];

  // Replace generic "Ofício (Qualquer)" with specific crafts
  classSkills = replaceGenericOficioWithSpecific(classSkills, classe.name);

  // Update usedSkills to reflect the replaced skills
  const updatedUsedSkills = replaceGenericOficioWithSpecific(
    usedSkills,
    classe.name
  );

  steps.push({
    label: 'Perícias da classe',
    type: 'Perícias',
    value: classSkills.map((skill) => ({ value: `${skill}` })),
  });

  let attributesSkills = getAttributesSkills(attributes, updatedUsedSkills);

  // Also replace generic oficio in attributes skills
  attributesSkills = replaceGenericOficioWithSpecific(
    attributesSkills,
    classe.name
  );

  if (attributesSkills.length) {
    steps.push({
      label: 'Perícias (+INT)',
      type: 'Perícias',
      value: attributesSkills.map((skill) => ({ value: `${skill}` })),
    });
  }

  const finalSkills = [
    ...replaceGenericOficioWithSpecific(
      [...updatedUsedSkills, ...attributesSkills],
      classe.name
    ),
  ];

  return {
    skills: finalSkills,
    powers: {
      ...powers,
      general: {
        Origem: powers.general,
      },
    },
  };
}
function getWeapons(classe: ClassDescription) {
  const weapons = [];

  weapons.push(getRandomItemFromArray(EQUIPAMENTOS.armasSimples));

  if (classe.proficiencias.includes(todasProficiencias.MARCIAIS)) {
    weapons.push(getRandomItemFromArray(EQUIPAMENTOS.armasMarciais));
  }

  return weapons;
}

function getShields(classe: ClassDescription) {
  const shields = [];
  if (classe.proficiencias.includes(todasProficiencias.ESCUDOS)) {
    shields.push(Escudos.ESCUDOLEVE);
  }

  return shields;
}

function getArmors(classe: ClassDescription, currentBag?: Bag) {
  // Se já tem armadura no bag, não gerar nova
  if (
    currentBag?.equipments?.Armadura &&
    currentBag.equipments.Armadura.length > 0
  ) {
    return [];
  }

  const armors = [];
  if (classe.proficiencias.includes(todasProficiencias.PESADAS)) {
    armors.push(Armaduras.BRUNEA);
  } else if (classe.name !== 'Arcanista') {
    armors.push(getRandomItemFromArray(EQUIPAMENTOS.armadurasLeves));
  }

  return armors;
}

function getClassEquipments(
  classe: ClassDescription,
  currentBag?: Bag
): Pick<BagEquipments, 'Arma' | 'Escudo' | 'Armadura' | 'Item Geral'> {
  const weapons = getWeapons(classe);
  const shields = getShields(classe);
  const armors = getArmors(classe, currentBag);

  const instruments: Equipment[] = [];
  if (isClassOrVariantOf(classe, 'Bardo')) {
    const instrumentName = getRandomItemFromArray(bardInstruments);
    instruments.push({
      nome: instrumentName,
      group: 'Item Geral',
    });
  }

  return {
    Arma: weapons,
    Escudo: shields,
    Armadura: armors,
    'Item Geral': instruments,
  };
}

function getInitialBag(origin: Origin | undefined): Bag {
  // 6.1 A depender da classe os itens podem variar
  const equipments: Partial<BagEquipments> = {
    'Item Geral': [],
  };

  // Apenas origens regionais (isRegional = true) adicionam itens automaticamente
  // Origens do core não adicionam itens aqui (apenas se escolhidos nos 2 benefícios)
  if (origin?.isRegional) {
    const originItems = origin.getItems();

    originItems?.forEach((equip) => {
      if (typeof equip.equipment === 'string') {
        const newEquip: Equipment = {
          nome: `${equip.qtd ? `${equip.qtd}x ` : ''}${equip.equipment}`,
          group: 'Item Geral',
        };
        if (equipments['Item Geral']) {
          equipments['Item Geral'].push(newEquip);
        }
      } else if (equip.equipment) {
        // Verificar se é Armadura, Escudo ou Arma
        const equipValue = equip.equipment;

        // Verifica se é uma armadura
        if (
          Object.values(Armaduras).includes(
            equipValue as unknown as DefenseEquipment
          )
        ) {
          if (!equipments.Armadura) {
            equipments.Armadura = [];
          }
          equipments.Armadura.push(equipValue as DefenseEquipment);
        }
        // Verifica se é um escudo
        else if (
          Object.values(Escudos).includes(
            equipValue as unknown as DefenseEquipment
          )
        ) {
          if (!equipments.Escudo) {
            equipments.Escudo = [];
          }
          equipments.Escudo.push(equipValue as DefenseEquipment);
        }
        // Se não for armadura nem escudo, é uma arma
        else {
          if (!equipments.Arma) {
            equipments.Arma = [];
          }
          equipments.Arma.push(equipValue);
        }
      }
    });
  }

  return new Bag(equipments);
}

function getThyatisPowers(
  classe: ClassDescription,
  thyatisPoderes: GeneralPower[]
) {
  const unrestrictedPowers = thyatisPoderes.filter(
    (poder) =>
      poder.name !== GRANTED_POWERS.DOM_DA_IMORTALIDADE.name &&
      poder.name !== GRANTED_POWERS.DOM_DA_RESSUREICAO.name
  );

  if (isClassOrVariantOf(classe, 'Paladino'))
    return [...unrestrictedPowers, GRANTED_POWERS.DOM_DA_IMORTALIDADE];

  if (isClassOrVariantOf(classe, 'Clérigo'))
    return [...unrestrictedPowers, GRANTED_POWERS.DOM_DA_RESSUREICAO];

  return [...unrestrictedPowers];
}

// Retorna a lista de poderes concedidos de uma divindade
function getPoderesConcedidos(
  divindade: Divindade,
  todosPoderes: boolean,
  classe: ClassDescription,
  qtd?: number
) {
  if (todosPoderes) {
    if (divindade.name === DivindadeEnum.THYATIS.name) {
      return getThyatisPowers(classe, divindade.poderes);
    }

    return [...divindade.poderes];
  }

  if (qtd && qtd > 1) {
    const poderesConcedidos = pickFromArray(divindade.poderes, qtd);
    return [...poderesConcedidos];
  }

  return [getRandomItemFromArray(divindade.poderes)];
}

// Retorna se é devoto e qual a divindade
function getReligiosidade(
  classe: ClassDescription,
  race: Race,
  selectedOption: string,
  supplements: SupplementId[]
): CharacterReligion | undefined {
  if (selectedOption === '--') return undefined;

  let isDevoto = Math.random() <= classe.probDevoto;
  if (selectedOption) isDevoto = true;

  if (!isDevoto) {
    return undefined;
  }

  let divindade;
  if (!selectedOption || selectedOption === '**') {
    const classFaithProbability =
      classe.faithProbability || standardFaithProbability;
    const raceFaithProbability =
      race.faithProbability || standardFaithProbability;

    const faithProbability = mergeFaithProbabilities(
      classFaithProbability,
      raceFaithProbability
    );

    const divindadeName = pickFaith(faithProbability);
    divindade =
      dataRegistry.getDeityByName(
        DivindadeEnum[divindadeName].name,
        supplements
      ) || DivindadeEnum[divindadeName];
  } else {
    const staticDeity = DivindadeEnum[selectedOption as DivindadeNames];
    divindade =
      dataRegistry.getDeityByName(staticDeity.name, supplements) || staticDeity;
  }

  // Provavelmente uma merda de solução mas preguiça
  const todosPoderes = classe.qtdPoderesConcedidos === 'all';
  const qtdPoderesConcedidos = isNumber(classe.qtdPoderesConcedidos)
    ? classe.qtdPoderesConcedidos
    : 0;
  const poderes = getPoderesConcedidos(
    divindade,
    todosPoderes,
    classe,
    qtdPoderesConcedidos
  );

  return { divindade, poderes };
}

function getNewSpells(
  nivel: number,
  classe: ClassDescription,
  usedSpells: Spell[]
): Spell[] {
  const { spellPath } = classe;
  if (!spellPath) return [];

  const {
    initialSpells,
    schools,
    spellType,
    spellCircleAvailableAtLevel,
    qtySpellsLearnAtLevel,
  } = spellPath;

  const circle = spellCircleAvailableAtLevel(nivel);
  const qtySpellsLearn = qtySpellsLearnAtLevel(nivel);

  let spellList: Spell[] = [];
  if (spellType === 'Arcane') {
    for (let index = 1; index < circle + 1; index += 1) {
      if (index === 1) spellList = allArcaneSpellsCircle1;
      if (index === 2) spellList = spellList.concat(allArcaneSpellsCircle2);
      if (index === 3) spellList = spellList.concat(allArcaneSpellsCircle3);
      if (index === 4) spellList = spellList.concat(allArcaneSpellsCircle4);
      if (index === 5) spellList = spellList.concat(allArcaneSpellsCircle5);
    }
  } else {
    for (let index = 1; index < circle + 1; index += 1) {
      if (index === 1) spellList = allDivineSpellsCircle1;
      if (index === 2) spellList = spellList.concat(allDivineSpellsCircle2);
      if (index === 3) spellList = spellList.concat(allDivineSpellsCircle3);
      if (index === 4) spellList = spellList.concat(allDivineSpellsCircle4);
      if (index === 5) spellList = spellList.concat(allDivineSpellsCircle5);
    }
  }

  if (schools) {
    if (spellType === 'Arcane') {
      for (let index = 1; index < circle + 1; index += 1) {
        if (index === 1)
          spellList = schools.flatMap((school) => arcaneSpellsCircle1[school]);
        if (index === 2)
          spellList = spellList.concat(
            schools.flatMap((school) => arcaneSpellsCircle2[school])
          );
        if (index === 3)
          spellList = spellList.concat(
            schools.flatMap((school) => arcaneSpellsCircle3[school])
          );
        if (index === 4)
          spellList = spellList.concat(
            schools.flatMap((school) => arcaneSpellsCircle4[school])
          );
        if (index === 5)
          spellList = spellList.concat(
            schools.flatMap((school) => arcaneSpellsCircle5[school])
          );
      }
    } else {
      for (let index = 1; index < circle + 1; index += 1) {
        if (index === 1)
          spellList = schools.flatMap((school) => divineSpellsCircle1[school]);
        if (index === 2)
          spellList = spellList.concat(
            schools.flatMap((school) => divineSpellsCircle2[school])
          );
        if (index === 3)
          spellList = spellList.concat(
            schools.flatMap((school) => divineSpellsCircle3[school])
          );
        if (index === 4)
          spellList = spellList.concat(
            schools.flatMap((school) => divineSpellsCircle4[school])
          );
        if (index === 5)
          spellList = spellList.concat(
            schools.flatMap((school) => divineSpellsCircle5[school])
          );
      }
    }
  }

  const filteredSpellList = spellList.filter(
    (spell) => !usedSpells.find((usedSpell) => usedSpell.nome === spell.nome)
  );

  const selectedSpells = pickFromArray(
    filteredSpellList,
    nivel === 1 ? initialSpells : qtySpellsLearn
  );

  return selectedSpells;
}

export function calculateMaxSpaces(forca: number): number {
  if (forca < 0) return 10 + forca;
  return 10 + 2 * forca;
}

function calcDisplacement(
  bag: Bag,
  raceDisplacement: number,
  atributos: CharacterAttributes,
  baseDisplacement: number
): number {
  const maxSpaces = calculateMaxSpaces(atributos.Força.value);

  if (bag.getSpaces() > maxSpaces) {
    return raceDisplacement - 3;
  }

  return raceDisplacement + baseDisplacement;
}

export const applyPower = (
  _sheet: CharacterSheet,
  powerOrAbility: Pick<GeneralPower, 'sheetActions' | 'sheetBonuses' | 'name'>,
  manualSelections?: SelectionOptions
): [CharacterSheet, SubStep[]] => {
  const sheet = _.cloneDeep(_sheet);
  const subSteps: SubStep[] = [];

  const getSourceName = (source: SheetChangeSource) => {
    if (source.type === 'power') {
      return source.name;
    }
    if (source.type === 'levelUp') {
      return `Nível ${source.level}`;
    }
    if (source.type === 'origin') {
      return source.originName;
    }
    return '';
  };

  // Helper to check if this specific sheetAction was already applied
  // This prevents duplicating effects when recalculateSheet is called multiple times
  // Map action types to their corresponding history change types
  const actionToChangeTypeMap: Record<string, string[]> = {
    ModifyAttribute: ['Attribute'],
    increaseAttribute: ['AttributeIncreasedByAumentoDeAtributo'],
    addProficiency: ['ProficiencyAdded'],
    learnSkill: ['SkillsAdded'],
    addSense: ['SenseAdded'],
    addEquipment: ['EquipmentAdded'],
    getGeneralPower: ['PowerAdded'],
    learnSpell: ['SpellsLearned'],
    learnAnySpellFromHighestCircle: ['SpellsLearned'],
    learnClassAbility: ['ClassAbilityLearned'],
    getClassPower: ['ClassPowerAdded'],
    grantSpecificClassPower: ['ClassPowerAdded'],
    addAlchemyItems: ['EquipmentAdded'],
    chooseFromOptions: ['OptionChosen'],
    trainSkillOrBonus: ['SkillTrainedOrBonused'],
  };

  const isActionAlreadyApplied = (
    actionType: string,
    powerName: string
  ): boolean =>
    sheet.sheetActionHistory.some(
      (historyEntry) =>
        historyEntry.powerName === powerName &&
        historyEntry.changes.some((change) => {
          const expectedChangeTypes = actionToChangeTypeMap[actionType] || [];
          return expectedChangeTypes.includes(change.type);
        })
    );

  // sheet action
  if (powerOrAbility.sheetActions) {
    powerOrAbility.sheetActions.forEach((sheetAction) => {
      // Skip if this action was already applied (prevents duplication during recalculation)
      if (
        isActionAlreadyApplied(sheetAction.action.type, powerOrAbility.name)
      ) {
        // For chooseFromOptions, re-apply sheetBonuses from the chosen option
        // (sheetBonuses are cleared during recalculation, so they need to be re-added)
        if (sheetAction.action.type === 'chooseFromOptions') {
          const { optionKey, options } = sheetAction.action;
          const previousChoice = sheet.sheetActionHistory
            .flatMap((entry) => entry.changes)
            .find(
              (change) =>
                change.type === 'OptionChosen' && change.optionKey === optionKey
            );
          if (previousChoice && previousChoice.type === 'OptionChosen') {
            const chosenOption = options.find(
              (o) => o.name === previousChoice.chosenName
            );
            if (chosenOption?.sheetBonuses) {
              sheet.sheetBonuses.push(...chosenOption.sheetBonuses);
            }
          }
        }
        // For trainSkillOrBonus, re-apply the +2 bonus if the skill was already trained
        if (sheetAction.action.type === 'trainSkillOrBonus') {
          const previousResult = sheet.sheetActionHistory
            .filter((entry) => entry.powerName === powerOrAbility.name)
            .flatMap((entry) => entry.changes)
            .find((change) => change.type === 'SkillTrainedOrBonused');
          if (
            previousResult &&
            previousResult.type === 'SkillTrainedOrBonused' &&
            previousResult.alreadyTrained
          ) {
            sheet.sheetBonuses.push({
              source: sheetAction.source,
              target: { type: 'Skill', name: previousResult.skill },
              modifier: { type: 'Fixed', value: 2 },
            });
          }
        }
        return;
      }

      if (sheetAction.action.type === 'ModifyAttribute') {
        const { attribute, value } = sheetAction.action;
        const newValue = sheet.atributos[attribute].value + value;
        sheet.atributos[attribute].value = newValue;

        subSteps.push({
          name: getSourceName(sheetAction.source),
          value: `+${value} em ${sheetAction.action.attribute}`,
        });
        sheet.sheetActionHistory.push({
          source: sheetAction.source,
          powerName: powerOrAbility.name,
          changes: [{ type: 'Attribute', attribute, value: newValue }],
        });
      } else if (sheetAction.action.type === 'addProficiency') {
        // Ver Proficiência em combat powers e depois remove comment
        let { availableProficiencies } = sheetAction.action;
        if (!sheet.classe.proficiencias.includes(todasProficiencias.MARCIAIS)) {
          availableProficiencies = availableProficiencies.filter(
            (prof) => prof !== todasProficiencias.EXOTICAS
          );
        }

        // Use manual selections if provided, otherwise random
        const pickedProficiencies =
          manualSelections?.proficiencies ||
          pickFromAllowed(
            availableProficiencies,
            sheetAction.action.pick,
            sheet.classe.proficiencias
          );

        sheet.classe.proficiencias.push(...pickedProficiencies);

        sheet.sheetActionHistory.push({
          source: sheetAction.source,
          powerName: powerOrAbility.name,
          changes: pickedProficiencies.map((prof) => ({
            type: 'ProficiencyAdded',
            proficiency: prof,
          })),
        });

        pickedProficiencies.forEach((prof) => {
          subSteps.push({
            name: getSourceName(sheetAction.source),
            value: `Proficiência em ${prof}`,
          });
        });
      } else if (sheetAction.action.type === 'learnSkill') {
        // Use manual selections if provided, otherwise random
        const pickedSkills =
          (manualSelections?.skills as Skill[]) ||
          pickFromAllowed(
            sheetAction.action.availableSkills,
            sheetAction.action.pick,
            sheet.skills
          );

        sheet.skills.push(...pickedSkills);

        sheet.sheetActionHistory.push({
          source: sheetAction.source,
          powerName: powerOrAbility.name,
          changes: [
            {
              type: 'SkillsAdded',
              skills: pickedSkills,
            },
          ],
        });

        pickedSkills.forEach((skill) => {
          subSteps.push({
            name: getSourceName(sheetAction.source),
            value: `Aprende a perícia ${skill}`,
          });
        });
      } else if (sheetAction.action.type === 'addSense') {
        if (!sheet.sentidos) sheet.sentidos = [];
        if (!sheet.sentidos.includes(sheetAction.action.sense)) {
          sheet.sentidos.push(sheetAction.action.sense);
          sheet.sheetActionHistory.push({
            source: sheetAction.source,
            powerName: powerOrAbility.name,
            changes: [{ type: 'SenseAdded', sense: sheetAction.action.sense }],
          });
          subSteps.push({
            name: getSourceName(sheetAction.source),
            value: `Recebe o sentido ${sheetAction.action.sense}`,
          });
        }
      } else if (sheetAction.action.type === 'addEquipment') {
        const { equipment } = sheetAction.action;
        sheet.bag.addEquipment(equipment);

        sheet.sheetActionHistory.push({
          source: sheetAction.source,
          powerName: powerOrAbility.name,
          changes: [{ type: 'EquipmentAdded', equipment }],
        });

        subSteps.push({
          name: getSourceName(sheetAction.source),
          value: sheetAction.action.description,
        });
      } else if (sheetAction.action.type === 'getGeneralPower') {
        // Use manual selections if provided, otherwise random
        const pickedPowers =
          manualSelections?.powers ||
          pickFromAllowed(
            sheetAction.action.availablePowers,
            sheetAction.action.pick,
            sheet.generalPowers
          );

        sheet.generalPowers.push(...pickedPowers);

        sheet.sheetActionHistory.push({
          source: sheetAction.source,
          powerName: powerOrAbility.name,
          changes: pickedPowers.map((power) => ({
            type: 'PowerAdded',
            powerName: power.name,
          })),
        });

        pickedPowers.forEach((power) => {
          subSteps.push({
            name: getSourceName(sheetAction.source),
            value: `Recebe o poder geral ${power.name}`,
          });

          // Apply the picked power's sheetActions (e.g., learnSpell in Prática Arcana)
          // Pass the same manual selections so nested requirements (spells) are honored
          if (power.sheetActions && power.sheetActions.length > 0) {
            const [updatedSheet, nestedSubSteps] = applyPower(
              sheet,
              power,
              manualSelections
            );
            Object.assign(sheet, updatedSheet);
            subSteps.push(...nestedSubSteps);
          }
        });
      } else if (sheetAction.action.type === 'learnSpell') {
        let learnedSpells: Spell[];

        if (manualSelections?.spells && manualSelections.spells.length > 0) {
          // Use manual selections
          learnedSpells = manualSelections.spells;

          // Add to sheet.spells if not already present
          learnedSpells.forEach((spell) => {
            if (
              !sheet.spells.some((existing) => existing.nome === spell.nome)
            ) {
              sheet.spells.push(spell);
            }
          });
        } else {
          // Fall back to random selection
          learnedSpells = addOrCheapenRandomSpells(
            sheet,
            subSteps,
            sheetAction.action.availableSpells,
            getSourceName(sheetAction.source),
            sheetAction.action.customAttribute ||
              sheet.classe.spellPath?.keyAttribute ||
              Atributo.INTELIGENCIA,
            sheetAction.action.pick
          );
        }

        sheet.sheetActionHistory.push({
          source: sheetAction.source,
          powerName: powerOrAbility.name,
          changes: [
            {
              type: 'SpellsLearned',
              spellNames: learnedSpells.map((spell) => spell.nome),
            },
          ],
        });
      } else if (sheetAction.action.type === 'learnAnySpellFromHighestCircle') {
        const highestCircle =
          sheet.classe.spellPath?.spellCircleAvailableAtLevel(sheet.nivel) || 1;

        let allSpellsOfCircle: Spell[] = [];
        for (let circle = 1; circle <= highestCircle; circle += 1) {
          if (sheetAction.action.allowedType === 'Arcane') {
            allSpellsOfCircle.push(...getArcaneSpellsOfCircle(circle));
          } else if (sheetAction.action.allowedType === 'Divine') {
            allSpellsOfCircle.push(...getSpellsOfCircle(circle));
          } else {
            // Both - combina arcanas e divinas
            allSpellsOfCircle.push(...getArcaneSpellsOfCircle(circle));
            allSpellsOfCircle.push(...getSpellsOfCircle(circle));
          }
        }

        // Remove duplicatas
        allSpellsOfCircle = allSpellsOfCircle.filter(
          (spell, index, array) =>
            array.findIndex((s) => s.nome === spell.nome) === index
        );

        const allowedSchools = sheetAction.action.schools || [];
        const availableSpells = allSpellsOfCircle.filter((spell) => {
          if (allowedSchools.length === 0) return true;
          return allowedSchools.includes(spell.school);
        });

        let learnedSpells: Spell[];

        if (manualSelections?.spells && manualSelections.spells.length > 0) {
          // Use manual selections
          learnedSpells = manualSelections.spells;

          // Add to sheet.spells if not already present
          learnedSpells.forEach((spell) => {
            if (
              !sheet.spells.some((existing) => existing.nome === spell.nome)
            ) {
              sheet.spells.push(spell);
            }
          });
        } else {
          // Fall back to random selection
          learnedSpells = addOrCheapenRandomSpells(
            sheet,
            subSteps,
            availableSpells,
            getSourceName(sheetAction.source),
            sheet.classe.spellPath?.keyAttribute || Atributo.INTELIGENCIA,
            sheetAction.action.pick
          );
        }

        sheet.sheetActionHistory.push({
          source: sheetAction.source,
          powerName: powerOrAbility.name,
          changes: [
            {
              type: 'SpellsLearned',
              spellNames: learnedSpells.map((spell) => spell.nome),
            },
          ],
        });
      } else if (sheetAction.action.type === 'increaseAttribute') {
        const usedAttributes = getAttributeIncreasesInSamePlateau(sheet);
        const availableAttributes = Object.values(Atributo).filter(
          (attr) => !usedAttributes.includes(attr)
        );

        // Pick first attributes higher on the priority list
        const [firstPriorityAttribute] = sheet.classe.attrPriority.filter(
          (attr) => availableAttributes.includes(attr)
        );

        let targetAttribute: Atributo | undefined;

        // Use manual selection if provided
        if (
          manualSelections?.attributes &&
          manualSelections.attributes.length > 0
        ) {
          targetAttribute = manualSelections.attributes[0] as Atributo;
        } else if (firstPriorityAttribute) {
          targetAttribute = firstPriorityAttribute;
        } else if (availableAttributes.length > 0) {
          // If no priority attributes available, pick any from available
          targetAttribute = getRandomItemFromArray(availableAttributes);
        }

        // Only apply if we found a valid target attribute
        if (targetAttribute && sheet.atributos[targetAttribute]) {
          sheet.atributos[targetAttribute].value += 1;

          sheet.sheetActionHistory.push({
            source: sheetAction.source,
            powerName: powerOrAbility.name,
            changes: [
              {
                type: 'AttributeIncreasedByAumentoDeAtributo',
                attribute: targetAttribute,
                plateau: getCurrentPlateau(sheet),
              },
            ],
          });
          subSteps.push({
            name: getSourceName(sheetAction.source),
            value: `Aumenta o atributo ${targetAttribute} por +1`,
          });
        } else {
          // Skip this attribute increase if no valid target found
          // eslint-disable-next-line no-console
          console.warn(
            `No valid attribute found for increase in plateau ${getCurrentPlateau(
              sheet
            )}`
          );
          // Skip adding to history or substeps when no valid attribute found
        }
      } else if (sheetAction.action.type === 'selectWeaponSpecialization') {
        // Get all available weapons
        const allWeaponNames = Object.values(Armas).map(
          (weapon) => weapon.nome
        );

        let selectedWeapon: string;

        // Use manual selection if provided, otherwise random
        if (manualSelections?.weapons && manualSelections.weapons.length > 0) {
          [selectedWeapon] = manualSelections.weapons;
        } else {
          selectedWeapon = getRandomItemFromArray(allWeaponNames);
        }

        // Add weapon specialization bonus (+2 damage to the selected weapon)
        sheet.sheetBonuses.push({
          source: sheetAction.source,
          target: {
            type: 'WeaponDamage' as const,
            weaponName: selectedWeapon,
          },
          modifier: {
            type: 'Fixed' as const,
            value: 2,
          },
        });

        subSteps.push({
          name: getSourceName(sheetAction.source),
          value: `Especialização em ${selectedWeapon} (+2 dano)`,
        });
      } else if (sheetAction.action.type === 'selectFamiliar') {
        // Get all available familiars
        const availableFamiliars = FAMILIAR_NAMES;

        let selectedFamiliar: string;

        // Use manual selection if provided, otherwise random
        if (
          manualSelections?.familiars &&
          manualSelections.familiars.length > 0
        ) {
          [selectedFamiliar] = manualSelections.familiars;
        } else {
          selectedFamiliar = getRandomItemFromArray(availableFamiliars);
        }

        // Get familiar data
        const familiar = FAMILIARS[selectedFamiliar];

        // Apply Cat bonus (+2 Stealth) if Gato is selected
        if (selectedFamiliar === 'GATO') {
          sheet.sheetBonuses.push({
            source: sheetAction.source,
            target: {
              type: 'Skill',
              name: Skill.FURTIVIDADE,
            },
            modifier: {
              type: 'Fixed',
              value: 2,
            },
          });
        }

        // Update power text to show selected familiar
        if (sheet.classPowers) {
          const powerIndex = sheet.classPowers.findIndex(
            (power) => power.name === 'Familiar'
          );
          if (powerIndex !== -1) {
            sheet.classPowers[
              powerIndex
            ].text = `Você possui um familiar ${familiar.name}. ${familiar.description}`;
          }
        }

        subSteps.push({
          name: getSourceName(sheetAction.source),
          value: `Familiar selecionado: ${familiar.name}`,
        });
      } else if (sheetAction.action.type === 'selectAnimalTotem') {
        // Get all available totems
        const availableTotems = ANIMAL_TOTEM_NAMES;
        let selectedTotem: string;

        // Use manual selection if provided, otherwise random
        if (
          manualSelections?.animalTotems &&
          manualSelections.animalTotems.length > 0
        ) {
          [selectedTotem] = manualSelections.animalTotems;
        } else {
          selectedTotem = getRandomItemFromArray(availableTotems);
        }

        // Get totem data
        const totem = ANIMAL_TOTEMS[selectedTotem];

        // Learn the spell associated with the totem (all totem spells are 1st circle)
        const spellToLearn = Object.values(spellsCircle1).find(
          (spell) => spell.nome === totem.spellName
        );
        if (spellToLearn) {
          // Set spell attribute to Sabedoria as per Totem Espiritual power
          const spellWithAttribute = { ...spellToLearn };
          spellWithAttribute.customKeyAttr = Atributo.SABEDORIA;
          sheet.spells.push(spellWithAttribute);

          subSteps.push({
            name: getSourceName(sheetAction.source),
            value: `Aprendeu a magia: ${spellToLearn.nome}`,
          });
        }

        // Update power text to show selected totem
        if (sheet.classPowers) {
          const powerIndex = sheet.classPowers.findIndex(
            (power) => power.name === 'Totem Espiritual'
          );
          if (powerIndex !== -1) {
            sheet.classPowers[
              powerIndex
            ].text = `Você soma seu bônus de Sabedoria no seu total de pontos de mana. Animal totêmico escolhido: ${totem.name}. ${totem.description}`;
          }
        }

        subSteps.push({
          name: getSourceName(sheetAction.source),
          value: `Animal totêmico selecionado: ${totem.name}`,
        });
      } else if (sheetAction.action.type === 'addTruqueMagicSpells') {
        // Add the three truque magic spells
        const originalSpells = [
          spellsCircle1.explosaoDeChamas,
          spellsCircle1.hipnotismo,
          spellsCircle1.quedaSuave,
        ];

        originalSpells.forEach((spell) => {
          const truqueSpell = createTruqueSpell(spell);
          sheet.spells.push(truqueSpell);
          subSteps.push({
            name: getSourceName(sheetAction.source),
            value: `Adicionando ${truqueSpell.nome} à sua lista de magias.`,
          });
        });
      } else if (sheetAction.action.type === 'addVozCivilizacaoSpell') {
        // Add the Compreensão spell with always active effect
        const compreensaoSpell = spellsCircle1.compreensao;
        const alwaysActiveSpell = createAlwaysActiveSpell(compreensaoSpell);
        sheet.spells.push(alwaysActiveSpell);
        subSteps.push({
          name: getSourceName(sheetAction.source),
          value: `Adicionando ${alwaysActiveSpell.nome} à sua lista de magias.`,
        });
      } else if (sheetAction.action.type === 'learnClassAbility') {
        const { availableClasses: classNames, level } = sheetAction.action;

        // Get all available classes
        const allClasses = dataRegistry.getClassesBySupplements([
          SupplementId.TORMENTA20_CORE,
        ]);

        // Filter classes by the available list and exclude current class
        const availableClasses = allClasses.filter(
          (cls) =>
            classNames.includes(cls.name) && cls.name !== sheet.classe.name
        );

        let selectedClass: ClassDescription;
        let selectedAbility: ClassDescription['abilities'][number];

        // Use manual selection if provided, otherwise random
        if (
          manualSelections?.classAbilities &&
          manualSelections.classAbilities.length > 0
        ) {
          // Manual selection provides { className, abilityName }
          const selection = manualSelections.classAbilities[0];
          selectedClass =
            availableClasses.find((cls) => cls.name === selection.className) ||
            getRandomItemFromArray(availableClasses);
        } else {
          // Random selection
          selectedClass = getRandomItemFromArray(availableClasses);
        }

        // Get abilities of the specified level
        const levelAbilities = selectedClass.abilities.filter(
          (ability) => ability.nivel === level
        );

        if (levelAbilities.length > 0) {
          if (
            manualSelections?.classAbilities &&
            manualSelections.classAbilities.length > 0
          ) {
            const selection = manualSelections.classAbilities[0];
            selectedAbility =
              levelAbilities.find(
                (ability) => ability.name === selection.abilityName
              ) || getRandomItemFromArray(levelAbilities);
          } else {
            selectedAbility = getRandomItemFromArray(levelAbilities);
          }

          // Add the ability to classPowers array
          if (!sheet.classPowers) {
            sheet.classPowers = [];
          }

          // Convert ClassAbility to ClassPower format and add to classPowers
          sheet.classPowers.push({
            name: `${selectedAbility.name} (${selectedClass.name})`,
            text: selectedAbility.text,
            sheetActions: selectedAbility.sheetActions,
            sheetBonuses: selectedAbility.sheetBonuses,
          });

          // Apply sheetBonuses from the learned ability
          if (selectedAbility.sheetBonuses) {
            sheet.sheetBonuses.push(...selectedAbility.sheetBonuses);
          }

          // Note: sheetActions from learned abilities are NOT automatically applied
          // The user will need to manually trigger them or they will be shown in the power description

          sheet.sheetActionHistory.push({
            source: sheetAction.source,
            powerName: powerOrAbility.name,
            changes: [
              {
                type: 'ClassAbilityLearned',
                className: selectedClass.name,
                abilityName: selectedAbility.name,
              },
            ],
          });

          subSteps.push({
            name: getSourceName(sheetAction.source),
            value: `Aprendeu ${selectedAbility.name} de ${selectedClass.name}`,
          });
        }
      } else if (sheetAction.action.type === 'buildGolpePessoal') {
        // For automatic generation, create a random Golpe Pessoal
        const golpePessoalBuild = generateRandomGolpePessoal(sheet);

        // Store the build in the power's description
        const golpePessoalPower = sheet.classPowers?.find(
          (p) => p.name === 'Golpe Pessoal'
        );
        if (golpePessoalPower) {
          // Update name to include weapon
          golpePessoalPower.name = `Golpe Pessoal (${golpePessoalBuild.weapon})`;

          // Create detailed description with effect descriptions
          const effectDescriptions = golpePessoalBuild.effects
            .map((effectData) => {
              const effect = GOLPE_PESSOAL_EFFECTS[effectData.effectName];
              if (!effect) return '';

              let desc = `• ${effect.name}: ${effect.description}`;
              if (effectData.repeats > 1) {
                desc += ` (${effectData.repeats}x)`;
              }
              if (effectData.choices && effectData.choices.length > 0) {
                desc += ` [${effectData.choices.join(', ')}]`;
              }
              return desc;
            })
            .join('\n');

          golpePessoalPower.text = `${effectDescriptions}\n\n💠 Custo Total: ${golpePessoalBuild.totalCost} PM`;
        }

        subSteps.push({
          name: getSourceName(sheetAction.source),
          value: `Golpe Pessoal criado com ${golpePessoalBuild.weapon}`,
        });
      } else if (sheetAction.action.type === 'special') {
        let currentSteps: SubStep[];
        if (sheetAction.action.specialAction === 'humanoVersatil') {
          currentSteps = applyHumanoVersatil(sheet, manualSelections);
        } else if (sheetAction.action.specialAction === 'lefouDeformidade') {
          currentSteps = applyLefouDeformidade(sheet, manualSelections);
        } else if (
          sheetAction.action.specialAction === 'osteonMemoriaPostuma'
        ) {
          currentSteps = applyOsteonMemoriaPostuma(sheet);
        } else if (
          sheetAction.action.specialAction === 'yidishanNaturezaOrganica'
        ) {
          currentSteps = applyYidishanNaturezaOrganica(sheet);
        } else if (sheetAction.action.specialAction === 'moreauSapiencia') {
          currentSteps = applyMoreauSapiencia(sheet);
        } else if (
          sheetAction.action.specialAction === 'moreauEspertezaVulpina'
        ) {
          currentSteps = applyMoreauEspertezaVulpina(sheet);
        } else if (
          sheetAction.action.specialAction === 'golemDespertoSagrada'
        ) {
          currentSteps = applyGolemDespertoSagrada(sheet);
        } else if (
          sheetAction.action.specialAction === 'fradeAutoridadeEclesiastica'
        ) {
          currentSteps = applyFradeAutoridadeEclesiastica(sheet);
        } else if (
          sheetAction.action.specialAction === 'meioElfoAmbicaoHerdada'
        ) {
          currentSteps = applyMeioElfoAmbicaoHerdada(sheet);
        } else if (
          sheetAction.action.specialAction === 'qareenResistenciaElemental'
        ) {
          currentSteps = applyQareenResistenciaElemental(sheet);
        } else {
          throw new Error(
            `Ação especial não implementada: ${JSON.stringify(sheetAction)}`
          );
        }

        subSteps.push(...currentSteps);
      } else if (sheetAction.action.type === 'getClassPower') {
        const { minLevel = 2, ignoreOnlyLevelRequirement = true } =
          sheetAction.action;

        // Helper function to check if power meets requirements (ignoring level if specified)
        const checkPowerRequirements = (power: ClassPower): boolean => {
          if (!power.requirements || power.requirements.length === 0) {
            return true;
          }

          return power.requirements.some((req: Requirement[]) =>
            req.every((rule: Requirement) => {
              // Skip level requirement check if ignoreOnlyLevelRequirement is true
              if (ignoreOnlyLevelRequirement && rule.type === 'NIVEL') {
                return true;
              }

              // Check all other requirements using the same logic as isPowerAvailable
              switch (rule.type) {
                case 'PODER': {
                  const allPowers = [
                    ...sheet.generalPowers,
                    ...(sheet.origin?.powers || []),
                    ...(sheet.classPowers || []),
                  ];
                  return allPowers.some(
                    (currPower) => currPower.name === rule.name
                  );
                }
                case 'ATRIBUTO': {
                  const attr = rule.name as Atributo;
                  return (
                    rule.name &&
                    sheet.atributos[attr].value >= (rule?.value || 0)
                  );
                }
                case 'PERICIA': {
                  const pericia = rule.name as Skill;
                  return rule.name && sheet.skills.includes(pericia);
                }
                case 'HABILIDADE': {
                  const result = sheet.classe.abilities.some(
                    (ability) => ability.name === rule.name
                  );
                  if (rule.not) return !result;
                  return result;
                }
                case 'PODER_TORMENTA': {
                  const qtdPowers = rule.value as number;
                  return (
                    sheet.generalPowers.filter(
                      (actualPower) => actualPower.type === 'TORMENTA'
                    ).length >=
                    qtdPowers + 1
                  );
                }
                case 'PROFICIENCIA': {
                  const proficiencia = rule.value as unknown as string;
                  return (
                    rule.name &&
                    sheet.classe.proficiencias.includes(proficiencia)
                  );
                }
                case 'NIVEL': {
                  const nivel = rule.value as number;
                  return sheet.nivel >= nivel;
                }
                case 'CLASSE': {
                  const className = rule.value as unknown as string;
                  return rule.name && sheet.classe.name === className;
                }
                case 'TIPO_ARCANISTA': {
                  const classSubName = rule.name;
                  return sheet.classe.subname === classSubName;
                }
                case 'MAGIA': {
                  const spellName = rule.name;
                  return (
                    sheet.spells.filter((spell) => spell.nome === spellName)
                      .length >= 1
                  );
                }
                case 'DEVOTO': {
                  const godName = rule.name;
                  const result = sheet.devoto?.divindade.name === godName;
                  if (rule.not) return !result;
                  return result;
                }
                case 'RACA': {
                  const raceName = rule.name;
                  return sheet.raca.name === raceName;
                }
                case 'TIER_LIMIT': {
                  const category = rule.name as string;
                  // Count powers in the category
                  const count = sheet.generalPowers.filter((p) =>
                    p.name.includes(category)
                  ).length;
                  return count < 1;
                }
                case 'TEXT':
                  // TEXT requirements are always considered met - the user reads
                  // the text description and judges if they meet the requirement
                  return true;
                default:
                  return true;
              }
            })
          );
        };

        // Filter class powers by minimum level and requirements
        const availablePowers = sheet.classe.powers.filter((power) => {
          // Check if power already exists and if it can be repeated
          const existingClassPowers = sheet.classPowers || [];
          const isRepeatedPower = existingClassPowers.find(
            (existingPower) => existingPower.name === power.name
          );

          if (isRepeatedPower && !power.canRepeat) {
            return false;
          }

          // Check minimum level requirement in power requirements
          let meetsMinLevel = true;
          if (power.requirements && power.requirements.length > 0) {
            // Check if any requirement path has a level requirement >= minLevel
            meetsMinLevel = power.requirements.some((req: Requirement[]) =>
              req.some(
                (rule: Requirement) =>
                  rule.type === 'NIVEL' && (rule.value as number) >= minLevel
              )
            );

            // If no level requirement found, check if it's a basic power (usually level 1)
            if (
              !meetsMinLevel &&
              !power.requirements.some((req: Requirement[]) =>
                req.some((rule: Requirement) => rule.type === 'NIVEL')
              )
            ) {
              // Power has no level requirement, assume it's available from level 1
              meetsMinLevel = minLevel <= 1;
            }
          } else {
            // No requirements, assume level 1 power
            meetsMinLevel = minLevel <= 1;
          }

          return meetsMinLevel && checkPowerRequirements(power);
        });

        if (availablePowers.length === 0) {
          throw new Error(
            `Nenhum poder de classe disponível com nível mínimo ${minLevel}`
          );
        }

        // Select power (manual or random)
        let selectedPower: ClassPower;
        if (manualSelections?.powers && manualSelections.powers.length > 0) {
          const manualPower = manualSelections.powers[0];
          selectedPower =
            availablePowers.find((p) => p.name === manualPower.name) ||
            getRandomItemFromArray(availablePowers);
        } else {
          selectedPower = getRandomItemFromArray(availablePowers);
        }

        // Add power to classPowers array
        if (!sheet.classPowers) {
          sheet.classPowers = [];
        }
        sheet.classPowers.push(selectedPower);

        subSteps.push({
          name: getSourceName(sheetAction.source),
          value: `Poder de classe adquirido: ${selectedPower.name}`,
        });

        // Apply the selected power's sheetActions and sheetBonuses
        if (selectedPower.sheetActions || selectedPower.sheetBonuses) {
          const [updatedSheet, powerSubSteps] = applyPower(
            sheet,
            selectedPower,
            manualSelections
          );
          // Update sheet reference with changes from applying the power
          Object.assign(sheet, updatedSheet);
          // Add substeps from the power application with proper context
          powerSubSteps.forEach((subStep) => {
            subSteps.push({
              name: subStep.name || selectedPower.name,
              value: subStep.value,
            });
          });
        }

        sheet.sheetActionHistory.push({
          source: sheetAction.source,
          powerName: powerOrAbility.name,
          changes: [
            {
              type: 'PowerAdded',
              powerName: selectedPower.name,
            },
          ],
        });
      } else if (sheetAction.action.type === 'grantSpecificClassPower') {
        const { powerName: targetPowerName } = sheetAction.action;

        const targetPower = sheet.classe.powers.find(
          (p) => p.name === targetPowerName
        );

        if (!targetPower) {
          throw new Error(
            `Poder de classe "${targetPowerName}" não encontrado na classe ${sheet.classe.name}`
          );
        }

        // Only add if not already present
        if (!sheet.classPowers) {
          sheet.classPowers = [];
        }
        const alreadyHas = sheet.classPowers.some(
          (p) => p.name === targetPowerName
        );
        if (!alreadyHas) {
          sheet.classPowers.push(targetPower);

          subSteps.push({
            name: getSourceName(sheetAction.source),
            value: `Poder de classe concedido: ${targetPower.name}`,
          });

          // Apply the power's sheetActions and sheetBonuses
          if (targetPower.sheetActions || targetPower.sheetBonuses) {
            const [updatedSheet, powerSubSteps] = applyPower(
              sheet,
              targetPower,
              manualSelections
            );
            Object.assign(sheet, updatedSheet);
            powerSubSteps.forEach((subStep) => {
              subSteps.push({
                name: subStep.name || targetPower.name,
                value: subStep.value,
              });
            });
          }

          sheet.sheetActionHistory.push({
            source: sheetAction.source,
            powerName: powerOrAbility.name,
            changes: [
              {
                type: 'PowerAdded',
                powerName: targetPower.name,
              },
            ],
          });
        }
      } else if (sheetAction.action.type === 'addAlchemyItems') {
        const { budget, count } = sheetAction.action;

        // Select random alchemy items within budget
        const affordableItems = alchemyItems.filter(
          (item) => item.preco !== undefined && item.preco <= budget
        );

        const selectedItems: Equipment[] = [];
        let remainingBudget = budget;
        let itemsLeft = count;

        while (itemsLeft > 0 && affordableItems.length > 0) {
          const maxPrice = remainingBudget;
          const withinBudget = affordableItems.filter(
            (item) => (item.preco || 0) <= maxPrice
          );
          if (withinBudget.length === 0) break;

          const item = getRandomItemFromArray(withinBudget);
          selectedItems.push(item);
          remainingBudget -= item.preco || 0;
          itemsLeft -= 1;
        }

        if (selectedItems.length > 0) {
          const equipment: Partial<BagEquipments> = {
            Alquimía: selectedItems,
          };
          sheet.bag.addEquipment(equipment);

          sheet.sheetActionHistory.push({
            source: sheetAction.source,
            powerName: powerOrAbility.name,
            changes: [{ type: 'EquipmentAdded', equipment }],
          });

          subSteps.push({
            name: getSourceName(sheetAction.source),
            value: `${selectedItems.length} itens alquímicos adicionados (T$ ${
              budget - remainingBudget
            })`,
          });
        }
      } else if (sheetAction.action.type === 'chooseFromOptions') {
        const { optionKey, options, linkedTo } = sheetAction.action;
        let chosen;

        // Use manual selection if provided
        if (
          manualSelections?.chosenOption &&
          manualSelections.chosenOption.length > 0
        ) {
          const chosenName = manualSelections.chosenOption[0];
          chosen = options.find((o) => o.name === chosenName);
        }

        if (!chosen && linkedTo) {
          // Auto-select based on a previous choice
          const previousChoice = sheet.sheetActionHistory
            .flatMap((entry) => entry.changes)
            .find(
              (change) =>
                change.type === 'OptionChosen' && change.optionKey === linkedTo
            );
          if (previousChoice && previousChoice.type === 'OptionChosen') {
            chosen = options.find((o) => o.name === previousChoice.chosenName);
          }
        }

        if (!chosen) {
          chosen = getRandomItemFromArray(options);
        }

        // Update the ability text on the sheet to show only the chosen option
        const abilityIndex = sheet.classe.abilities.findIndex(
          (a) => a.name === powerOrAbility.name
        );
        if (abilityIndex >= 0) {
          sheet.classe.abilities[abilityIndex] = {
            ...sheet.classe.abilities[abilityIndex],
            text: `${chosen.name}. ${chosen.text}`,
          };
        }

        const formattedText = `${chosen.name}. ${chosen.text}`;

        subSteps.push({
          name: getSourceName(sheetAction.source),
          value: chosen.name,
        });
        sheet.sheetActionHistory.push({
          source: sheetAction.source,
          powerName: powerOrAbility.name,
          changes: [
            {
              type: 'OptionChosen',
              optionKey,
              chosenName: chosen.name,
              formattedText,
            },
          ],
        });

        // Apply sheetBonuses from the chosen option
        if (chosen.sheetBonuses) {
          sheet.sheetBonuses.push(...chosen.sheetBonuses);
        }
      } else if (sheetAction.action.type === 'trainSkillOrBonus') {
        const { skills } = sheetAction.action;
        const selectedSkill = getRandomItemFromArray(skills);
        const alreadyTrained = sheet.skills.includes(selectedSkill);

        if (alreadyTrained) {
          // Already trained: add +2 bonus
          sheet.sheetBonuses.push({
            source: sheetAction.source,
            target: { type: 'Skill', name: selectedSkill },
            modifier: { type: 'Fixed', value: 2 },
          });
          subSteps.push({
            name: getSourceName(sheetAction.source),
            value: `Já treinado em ${selectedSkill}: +2 na perícia`,
          });
        } else {
          // Not trained: add the skill
          sheet.skills.push(selectedSkill);
          subSteps.push({
            name: getSourceName(sheetAction.source),
            value: `Treinado em ${selectedSkill}`,
          });
        }

        sheet.sheetActionHistory.push({
          source: sheetAction.source,
          powerName: powerOrAbility.name,
          changes: [
            {
              type: 'SkillTrainedOrBonused',
              skill: selectedSkill,
              alreadyTrained,
            },
          ],
        });
      } else {
        throw new Error(
          `Ação de ficha desconhecida: ${JSON.stringify(sheetAction)}`
        );
      }
    });
  }

  // sheet bonuses
  if (powerOrAbility.sheetBonuses) {
    sheet.sheetBonuses.push(...powerOrAbility.sheetBonuses);

    // Generate substeps for important bonuses so they appear in the step-by-step
    powerOrAbility.sheetBonuses.forEach((bonus) => {
      const sourceName = getSourceName(bonus.source);

      if (bonus.target.type === 'PM') {
        // Generate description based on modifier type
        let bonusDescription = '';
        if (bonus.modifier.type === 'LevelCalc') {
          bonusDescription = '+1 PM por nível';
        } else if (
          bonus.modifier.type === 'Fixed' &&
          'value' in bonus.modifier
        ) {
          bonusDescription = `+${bonus.modifier.value} PM`;
        } else {
          bonusDescription = '+PM';
        }
        subSteps.push({
          name: sourceName,
          value: bonusDescription,
        });
      } else if (bonus.target.type === 'PV') {
        let bonusDescription = '';
        if (bonus.modifier.type === 'LevelCalc') {
          bonusDescription = '+1 PV por nível';
        } else if (
          bonus.modifier.type === 'Fixed' &&
          'value' in bonus.modifier
        ) {
          bonusDescription = `+${bonus.modifier.value} PV`;
        } else {
          bonusDescription = '+PV';
        }
        subSteps.push({
          name: sourceName,
          value: bonusDescription,
        });
      } else if (bonus.target.type === 'HPAttributeReplacement') {
        // Special handling for HP attribute replacement
        const { newAttribute } = bonus.target;
        const baseHp = sheet.classe.pv;
        const attributeBonus =
          sheet.atributos[newAttribute].value * sheet.nivel;

        const oldPv = sheet.pv;
        sheet.pv = baseHp + attributeBonus;

        subSteps.push({
          name: sourceName,
          value: `Troca cálculo de PV de Constituição para ${newAttribute}: ${baseHp} + ${sheet.atributos[newAttribute].value} × ${sheet.nivel} = ${sheet.pv} (era ${oldPv})`,
        });
      } else if (bonus.target.type === 'DamageReduction') {
        const { damageType } = bonus.target;
        if (bonus.modifier.type === 'Fixed' && 'value' in bonus.modifier) {
          subSteps.push({
            name: sourceName,
            value: `RD de ${damageType} ${bonus.modifier.value}`,
          });
        }
      }
    });
  }

  return [sheet, subSteps];
};

export function applyRaceAbilities(
  sheet: CharacterSheet,
  manualSelections?: ManualPowerSelections
): CharacterSheet {
  let sheetClone = _.cloneDeep(sheet);
  const subSteps: SubStep[] = [];

  // Adicionar habilidades da raça
  sheetClone.sheetActionHistory.push({
    source: {
      type: 'race',
      raceName: sheetClone.raca.name,
    },
    changes:
      sheetClone.raca.abilities.map((ability) => ({
        type: 'PowerAdded',
        powerName: ability.name,
      })) || [],
  });

  sheetClone = (sheetClone.raca.abilities || []).reduce((acc, ability) => {
    // Extract selections for this specific ability
    const abilitySelections = manualSelections?.[ability.name];
    const [newAcc, newSubSteps] = applyPower(acc, ability, abilitySelections);
    subSteps.push(...newSubSteps);
    return newAcc;
  }, sheetClone);

  if (subSteps.length) {
    sheetClone.steps.push({
      type: 'Poderes',
      label: 'Habilidades de Raça',
      value: subSteps,
    });
  }

  return sheetClone;
}

function applyDivinePowers(
  sheet: CharacterSheet,
  manualSelections?: ManualPowerSelections
): CharacterSheet {
  let sheetClone = _.cloneDeep(sheet);
  const subSteps: SubStep[] = [];

  // Adicionar poderes concedidos da divindade
  sheetClone.sheetActionHistory.push({
    source: {
      type: 'divinity',
      divinityName: sheetClone.devoto?.divindade.name || 'Divindade',
    },
    changes:
      sheetClone.devoto?.poderes.map((power) => ({
        type: 'PowerAdded',
        powerName: power.name,
      })) || [],
  });

  sheetClone = (sheetClone.devoto?.poderes || []).reduce((acc, power) => {
    // Extract selections for this specific power
    const powerSelections = manualSelections?.[power.name];
    const [newAcc, newSubSteps] = applyPower(acc, power, powerSelections);
    subSteps.push(...newSubSteps);
    return newAcc;
  }, sheetClone);

  if (subSteps.length) {
    sheetClone.steps.push({
      type: 'Poderes',
      label: 'Poderes Concedidos',
      value: subSteps,
    });
  }

  return sheetClone;
}

/**
 * Aplica as modificações de texto de OptionChosen (chooseFromOptions) do histórico
 * nos abilities e originalAbilities da classe. Deve ser chamado sempre que
 * classe.abilities é sobrescrito a partir de originalAbilities.
 */
export function applyOptionChosenTexts(sheet: CharacterSheet): void {
  sheet.sheetActionHistory.forEach((entry) => {
    entry.changes.forEach((change) => {
      if (change.type === 'OptionChosen' && entry.powerName) {
        const abilityIdx = sheet.classe.abilities.findIndex(
          (a) => a.name === entry.powerName
        );
        if (abilityIdx >= 0) {
          sheet.classe.abilities[abilityIdx] = {
            ...sheet.classe.abilities[abilityIdx],
            text: change.formattedText,
          };
        }
        if (sheet.classe.originalAbilities) {
          const origIdx = sheet.classe.originalAbilities.findIndex(
            (a) => a.name === entry.powerName
          );
          if (origIdx >= 0) {
            sheet.classe.originalAbilities[origIdx] = {
              ...sheet.classe.originalAbilities[origIdx],
              text: change.formattedText,
            };
          }
        }
      }
    });
  });
}

function applyClassAbilities(
  sheet: CharacterSheet,
  manualSelections?: ManualPowerSelections
): CharacterSheet {
  let sheetClone = _.cloneDeep(sheet);
  const subSteps: SubStep[] = [];

  const availableAbilities = sheetClone.classe.abilities.filter(
    (abilitie) => abilitie.nivel <= sheet.nivel
  );

  // Adicionar habilidades da classe
  sheetClone.sheetActionHistory.push({
    source: {
      type: 'class',
      className: sheetClone.classe.name,
    },
    changes:
      availableAbilities.map((ability) => ({
        type: 'PowerAdded',
        powerName: ability.name,
      })) || [],
  });

  sheetClone = (availableAbilities || []).reduce((acc, ability) => {
    // Extract selections for this specific ability
    const abilitySelections = manualSelections?.[ability.name];
    const [newAcc, newSubSteps] = applyPower(acc, ability, abilitySelections);
    subSteps.push(...newSubSteps);

    // Cavaleiro: random path selection for Caminho do Cavaleiro
    if (ability.name === 'Caminho do Cavaleiro' && !newAcc.cavaleiroCaminho) {
      const caminho = getRandomItemFromArray(['Bastião', 'Montaria'] as const);
      newAcc.cavaleiroCaminho = caminho;
      subSteps.push({
        name: 'Caminho do Cavaleiro',
        value: caminho,
      });
    }

    return newAcc;
  }, sheetClone);

  if (subSteps.length) {
    sheetClone.steps.push({
      type: 'Poderes',
      label: 'Habilidades de Classe',
      value: subSteps,
    });
  }

  // Store available abilities for display, but keep original abilities list intact
  // for future level-ups to reference
  if (!sheetClone.classe.originalAbilities) {
    sheetClone.classe.originalAbilities = [...sheetClone.classe.abilities];
  }
  sheetClone.classe.abilities = sheetClone.classe.abilities.filter(
    (ability) => ability.nivel <= sheet.nivel
  );

  // Apply text modifications from chooseFromOptions history
  applyOptionChosenTexts(sheetClone);

  return sheetClone;
}

function applyGeneralPowers(sheet: CharacterSheet): CharacterSheet {
  let sheetClone = _.cloneDeep(sheet);
  const subSteps: SubStep[] = [];

  sheetClone = (sheetClone.generalPowers || []).reduce((acc, ability) => {
    const [newAcc, newSubSteps] = applyPower(acc, ability);
    subSteps.push(...newSubSteps);
    return newAcc;
  }, sheetClone);

  // Quando escolhe um poder da Tormenta, perde 1 de Carisma. Para cada dois outros poderes da Tormenta, perde 1 de carisma.
  const tormentaPowersQtd = countTormentaPowers(sheetClone);

  const totalPenalty = Math.floor((tormentaPowersQtd + 1) / 2);
  if (totalPenalty > 0) {
    // Caso especial pra feiticeiros da linhagem rubra, eles nunca querem perder carisma
    if (
      sheetClone.classe.abilities.find(
        (ability) => ability.name === 'Linhagem Rubra'
      )
    ) {
      let remainingPenalty = totalPenalty;
      while (remainingPenalty > 0) {
        // Ache o atributo com maior value que não seja carisma
        const highestAttribute = Object.values(sheetClone.atributos).reduce(
          (prev, curr) => {
            if (curr.name === 'Carisma') return prev;
            if (prev.value > curr.value) return prev;
            return curr;
          }
        );

        sheetClone.atributos[highestAttribute.name].value -= 1;
        remainingPenalty -= 1;

        subSteps.push({
          name: highestAttribute.name,
          value: `-1 por ${tormentaPowersQtd} poderes da Tormenta`,
        });
      }
    } else {
      sheetClone.atributos.Carisma.value -= totalPenalty;
      subSteps.push({
        name: 'Carisma',
        value: `-${totalPenalty} por ${tormentaPowersQtd} poderes da Tormenta`,
      });
    }
  }

  if (subSteps.length) {
    sheetClone.steps.push({
      type: 'Poderes',
      label: 'Poderes Gerais',
      value: subSteps,
    });
  }

  return sheetClone;
}
function applyPowerGetters(
  sheet: CharacterSheet,
  powersGetters: PowersGetters
): CharacterSheet {
  let sheetClone = cloneDeep(sheet);
  const subSteps: SubStep[] = [];

  powersGetters.Origem.forEach((addPower) => {
    addPower(sheetClone, subSteps);
  });

  // Poderes de origem adicionados, adicionar no histórico de ações
  sheetClone.sheetActionHistory.push({
    source: {
      type: 'origin',
      originName: sheetClone.origin?.name || 'Origem',
    },
    changes:
      sheetClone.origin?.powers.map((power) => ({
        type: 'PowerAdded',
        powerName: power.name,
      })) || [],
  });

  sheetClone = (sheetClone.origin?.powers || []).reduce((acc, ability) => {
    const [newAcc, newSubSteps] = applyPower(acc, ability);
    subSteps.push(...newSubSteps);
    return newAcc;
  }, sheetClone);

  if (subSteps.length && sheet.origin) {
    sheetClone.steps.push({
      type: 'Poderes',
      label: `Benefícios da Origem (${sheet.origin.name})`,
      value: subSteps,
    });
  }
  return sheetClone;
}
function getAndApplyPowers(
  sheet: CharacterSheet,
  powersGetters: PowersGetters
): CharacterSheet {
  let updatedSheet = sheet;

  updatedSheet = applyPowerGetters(updatedSheet, powersGetters);
  // Aplicar poderes de divindade
  updatedSheet = applyDivinePowers(updatedSheet);

  // Aplicar habilidades da raça
  updatedSheet = applyRaceAbilities(updatedSheet);

  // Aplicar habilidades da classe
  updatedSheet = applyClassAbilities(updatedSheet);

  // Aplicar poderes gerais da origem
  updatedSheet = applyGeneralPowers(updatedSheet);

  return updatedSheet;
}

function levelUp(sheet: CharacterSheet): CharacterSheet {
  let updatedSheet = cloneDeep(sheet);
  updatedSheet.nivel += 1;

  // Check if there's an HP attribute replacement (Dom da Esperança)
  const hpReplacement = updatedSheet.sheetBonuses.find(
    (bonus) => bonus.target.type === 'HPAttributeReplacement'
  );

  let hpAttribute = Atributo.CONSTITUICAO;
  if (hpReplacement && hpReplacement.target.type === 'HPAttributeReplacement') {
    hpAttribute = hpReplacement.target.newAttribute;
  }

  let addPv =
    updatedSheet.classe.addpv + updatedSheet.atributos[hpAttribute].value;

  if (addPv < 1) addPv = 1;

  const newPvTotal = updatedSheet.pv + addPv;

  // Calculate PM bonus from sheetBonuses that scale with level
  // We need to add the incremental bonus for the new level
  let levelCalcPMBonus = 0;
  updatedSheet.sheetBonuses.forEach((bonus) => {
    if (bonus.target.type === 'PM' && bonus.modifier.type === 'LevelCalc') {
      // For LevelCalc, calculate the bonus at new level vs old level
      // Since we already incremented nivel, old level is nivel - 1
      const oldLevel = updatedSheet.nivel - 1;
      const newLevel = updatedSheet.nivel;
      const { formula } = bonus.modifier as {
        type: 'LevelCalc';
        formula: string;
      };

      const calcBonus = (level: number) => {
        const filledFormula = formula.replace('{level}', level.toString());
        try {
          // eslint-disable-next-line no-eval
          return eval(filledFormula);
        } catch {
          return 0;
        }
      };

      const oldBonus = calcBonus(oldLevel);
      const newBonus = calcBonus(newLevel);
      levelCalcPMBonus += newBonus - oldBonus;
    }
  });

  const newPmTotal =
    updatedSheet.pm + updatedSheet.classe.addpm + levelCalcPMBonus;

  const subSteps = [];

  // Aumentar PV e PM
  subSteps.push(
    {
      name: `PV (${updatedSheet.pv} + ${addPv} por nível - ${hpAttribute})`,
      value: newPvTotal,
    },
    {
      name: `PM (${updatedSheet.pm} + ${updatedSheet.classe.addpm}${
        levelCalcPMBonus > 0 ? ` + ${levelCalcPMBonus} bônus racial` : ''
      } por nível)`,
      value: newPmTotal,
    }
  );

  updatedSheet.pv = newPvTotal;
  updatedSheet.pm = newPmTotal;

  // Recalcular valor das perícias
  const skillTrainingMod = (trained: boolean, level: number) => {
    if (!trained) return 0;

    if (level >= 7 && level < 15) return 4;
    if (level >= 15) return 6;

    return 2;
  };

  const newCompleteSkills = updatedSheet.completeSkills?.map((sk) => ({
    ...sk,
    halfLevel: Math.floor(updatedSheet.nivel / 2),
    training: skillTrainingMod(
      Object.values(updatedSheet.skills).includes(sk.name),
      updatedSheet.nivel
    ),
  }));

  updatedSheet.completeSkills = newCompleteSkills;

  // Selecionar novas magias para esse nível (de acordo com o Spell Path)
  const newSpells = getNewSpells(
    updatedSheet.nivel,
    sheet.classe,
    sheet.spells
  );
  // Filter out duplicates before adding
  const uniqueNewSpells = newSpells.filter(
    (newSpell) =>
      !updatedSheet.spells.some((existing) => existing.nome === newSpell.nome)
  );
  updatedSheet.spells.push(...uniqueNewSpells);

  newSpells.forEach((spell) => {
    subSteps.push({
      name: `Nova magia (${spell.spellCircle})`,
      value: spell.nome,
    });
  });

  updatedSheet.sheetActionHistory.push({
    source: {
      type: 'levelUp',
      level: updatedSheet.nivel,
    },
    changes: [
      {
        type: 'SpellsLearned',
        spellNames: newSpells.map((spell) => spell.nome),
      },
    ],
  });

  updatedSheet.steps.push({
    type: 'Poderes',
    label: `Nível ${updatedSheet.nivel}`,
    value: subSteps,
  });

  // Escolher novo poder aleatório (geral ou poder da classe)
  const randomNumber = Math.random();
  const allowedPowers = isClassOrVariantOf(updatedSheet.classe, 'Inventor')
    ? getWeightedInventorClassPowers(updatedSheet)
    : getAllowedClassPowers(updatedSheet);
  const allowedGeneralPowers = getPowersAllowedByRequirements(updatedSheet);
  if (randomNumber <= 0.7 && allowedPowers.length > 0) {
    // Escolha poder da classe
    const newPower = getRandomItemFromArray(allowedPowers);
    if (updatedSheet.classPowers) {
      const nSubSteps: SubStep[] = [];

      updatedSheet.classPowers.push(newPower);

      const [newSheet, newSubSteps] = applyPower(updatedSheet, newPower);
      nSubSteps.push(...newSubSteps);
      if (newSheet) updatedSheet = newSheet;

      if (nSubSteps.length) {
        updatedSheet.steps.push({
          type: 'Poderes',
          label: `Novo poder de ${updatedSheet.classe.name}`,
          value: nSubSteps,
        });
      } else {
        subSteps.push({
          name: `Novo poder de ${updatedSheet.classe.name}`,
          value: newPower.name,
        });
      }

      updatedSheet.sheetActionHistory.push({
        source: {
          type: 'levelUp',
          level: updatedSheet.nivel,
        },
        changes: [
          {
            type: 'PowerAdded',
            powerName: newPower.name,
          },
        ],
      });
      // subSteps.push(nSubSteps);
    }
  } else {
    // Escolha poder geral
    const nSubSteps: SubStep[] = [];
    const newPower = getRandomItemFromArray(allowedGeneralPowers);
    updatedSheet.generalPowers.push(newPower);

    const [newSheet, newSubSteps] = applyPower(updatedSheet, newPower);
    nSubSteps.push(...newSubSteps);
    if (newSheet) updatedSheet = newSheet;

    if (nSubSteps.length) {
      updatedSheet.steps.push({
        type: 'Poderes',
        label: `Novo poder Geral`,
        value: nSubSteps,
      });
    } else {
      subSteps.push({
        name: `Novo poder Geral`,
        value: newPower.name,
      });
    }

    updatedSheet.sheetActionHistory.push({
      source: {
        type: 'levelUp',
        level: updatedSheet.nivel,
      },
      changes: [
        {
          type: 'PowerAdded',
          powerName: newPower.name,
        },
      ],
    });
  }

  // Apply newly available class abilities for this level
  const originalAbilities =
    updatedSheet.classe.originalAbilities || updatedSheet.classe.abilities;
  const newlyAvailableAbilities = originalAbilities.filter(
    (ability) => ability.nivel === updatedSheet.nivel
  );

  if (newlyAvailableAbilities.length > 0) {
    const abilitySubSteps: SubStep[] = [];

    newlyAvailableAbilities.forEach((ability) => {
      const [newSheet, newSubSteps] = applyPower(updatedSheet, ability);
      updatedSheet = newSheet;
      abilitySubSteps.push(...newSubSteps);
    });

    if (abilitySubSteps.length) {
      updatedSheet.steps.push({
        type: 'Poderes',
        label: `Novas habilidades de classe (Nível ${updatedSheet.nivel})`,
        value: abilitySubSteps,
      });
    }

    updatedSheet.sheetActionHistory.push({
      source: {
        type: 'levelUp',
        level: updatedSheet.nivel,
      },
      changes: newlyAvailableAbilities.map((ability) => ({
        type: 'PowerAdded',
        powerName: ability.name,
      })),
    });

    // Update displayed abilities to include newly available ones
    const allAvailableAbilities = originalAbilities.filter(
      (ability) => ability.nivel <= updatedSheet.nivel
    );
    updatedSheet.classe.abilities = allAvailableAbilities;

    // Apply text modifications from chooseFromOptions history
    applyOptionChosenTexts(updatedSheet);
  }

  return updatedSheet;
}

export function applyManualLevelUp(
  sheet: CharacterSheet,
  selections: import('../interfaces/WizardSelections').LevelUpSelections
): CharacterSheet {
  let updatedSheet = cloneDeep(sheet);
  updatedSheet.nivel += 1;

  // Check if there's an HP attribute replacement (Dom da Esperança)
  const hpReplacement = updatedSheet.sheetBonuses.find(
    (bonus) => bonus.target.type === 'HPAttributeReplacement'
  );

  let hpAttribute = Atributo.CONSTITUICAO;
  if (hpReplacement && hpReplacement.target.type === 'HPAttributeReplacement') {
    hpAttribute = hpReplacement.target.newAttribute;
  }

  let addPv =
    updatedSheet.classe.addpv + updatedSheet.atributos[hpAttribute].value;

  if (addPv < 1) addPv = 1;

  const newPvTotal = updatedSheet.pv + addPv;

  // Calculate PM bonus from sheetBonuses that scale with level
  // We need to add the incremental bonus for the new level
  let levelCalcPMBonus = 0;
  updatedSheet.sheetBonuses.forEach((bonus) => {
    if (bonus.target.type === 'PM' && bonus.modifier.type === 'LevelCalc') {
      // For LevelCalc, calculate the bonus at new level vs old level
      // Since we already incremented nivel, old level is nivel - 1
      const oldLevel = updatedSheet.nivel - 1;
      const newLevel = updatedSheet.nivel;
      const { formula } = bonus.modifier as {
        type: 'LevelCalc';
        formula: string;
      };

      const calcBonus = (level: number) => {
        const filledFormula = formula.replace('{level}', level.toString());
        try {
          // eslint-disable-next-line no-eval
          return eval(filledFormula);
        } catch {
          return 0;
        }
      };

      const oldBonus = calcBonus(oldLevel);
      const newBonus = calcBonus(newLevel);
      levelCalcPMBonus += newBonus - oldBonus;
    }
  });

  const newPmTotal =
    updatedSheet.pm + updatedSheet.classe.addpm + levelCalcPMBonus;

  const subSteps = [];

  // Aumentar PV e PM
  subSteps.push(
    {
      name: `PV (${updatedSheet.pv} + ${addPv} por nível - ${hpAttribute})`,
      value: newPvTotal,
    },
    {
      name: `PM (${updatedSheet.pm} + ${updatedSheet.classe.addpm}${
        levelCalcPMBonus > 0 ? ` + ${levelCalcPMBonus} bônus racial` : ''
      } por nível)`,
      value: newPmTotal,
    }
  );

  updatedSheet.pv = newPvTotal;
  updatedSheet.pm = newPmTotal;

  // Recalcular valor das perícias
  const skillTrainingMod = (trained: boolean, level: number) => {
    if (!trained) return 0;

    if (level >= 7 && level < 15) return 4;
    if (level >= 15) return 6;

    return 2;
  };

  const newCompleteSkills = updatedSheet.completeSkills?.map((sk) => ({
    ...sk,
    halfLevel: Math.floor(updatedSheet.nivel / 2),
    training: skillTrainingMod(
      Object.values(updatedSheet.skills).includes(sk.name),
      updatedSheet.nivel
    ),
  }));

  updatedSheet.completeSkills = newCompleteSkills;

  // Aplicar magias selecionadas manualmente
  if (selections.spellsLearned && selections.spellsLearned.length > 0) {
    // Filter out duplicates before adding
    const uniqueSelectedSpells = selections.spellsLearned.filter(
      (newSpell) =>
        !updatedSheet.spells.some((existing) => existing.nome === newSpell.nome)
    );
    updatedSheet.spells.push(...uniqueSelectedSpells);

    selections.spellsLearned.forEach((spell) => {
      subSteps.push({
        name: `Nova magia (${spell.spellCircle})`,
        value: spell.nome,
      });
    });

    updatedSheet.sheetActionHistory.push({
      source: {
        type: 'levelUp',
        level: updatedSheet.nivel,
      },
      changes: [
        {
          type: 'SpellsLearned',
          spellNames: selections.spellsLearned.map((spell) => spell.nome),
        },
      ],
    });
  }

  updatedSheet.steps.push({
    type: 'Poderes',
    label: `Nível ${updatedSheet.nivel}`,
    value: subSteps,
  });

  // Aplicar poder escolhido (classe ou geral)
  if (selections.powerChoice === 'class' && selections.selectedClassPower) {
    const nSubSteps: SubStep[] = [];
    const newPower = selections.selectedClassPower;

    if (updatedSheet.classPowers) {
      updatedSheet.classPowers.push(newPower);

      const [newSheet, newSubSteps] = applyPower(
        updatedSheet,
        newPower,
        selections.powerEffectSelections?.[newPower.name]
      );
      nSubSteps.push(...newSubSteps);
      if (newSheet) updatedSheet = newSheet;

      if (nSubSteps.length) {
        updatedSheet.steps.push({
          type: 'Poderes',
          label: `Novo poder de ${updatedSheet.classe.name}`,
          value: nSubSteps,
        });
      } else {
        subSteps.push({
          name: `Novo poder de ${updatedSheet.classe.name}`,
          value: newPower.name,
        });
      }

      updatedSheet.sheetActionHistory.push({
        source: {
          type: 'levelUp',
          level: updatedSheet.nivel,
        },
        changes: [
          {
            type: 'PowerAdded',
            powerName: newPower.name,
          },
        ],
      });
    }
  } else if (
    selections.powerChoice === 'general' &&
    selections.selectedGeneralPower
  ) {
    const nSubSteps: SubStep[] = [];
    const newPower = selections.selectedGeneralPower;
    updatedSheet.generalPowers.push(newPower);

    const [newSheet, newSubSteps] = applyPower(
      updatedSheet,
      newPower,
      selections.powerEffectSelections?.[newPower.name]
    );
    nSubSteps.push(...newSubSteps);
    if (newSheet) updatedSheet = newSheet;

    if (nSubSteps.length) {
      updatedSheet.steps.push({
        type: 'Poderes',
        label: `Novo poder Geral`,
        value: nSubSteps,
      });
    } else {
      subSteps.push({
        name: `Novo poder Geral`,
        value: newPower.name,
      });
    }

    updatedSheet.sheetActionHistory.push({
      source: {
        type: 'levelUp',
        level: updatedSheet.nivel,
      },
      changes: [
        {
          type: 'PowerAdded',
          powerName: newPower.name,
        },
      ],
    });
  }

  // Apply newly available class abilities for this level
  const originalAbilities =
    updatedSheet.classe.originalAbilities || updatedSheet.classe.abilities;
  const newlyAvailableAbilities = originalAbilities.filter(
    (ability) => ability.nivel === updatedSheet.nivel
  );

  if (newlyAvailableAbilities.length > 0) {
    const abilitySubSteps: SubStep[] = [];

    newlyAvailableAbilities.forEach((ability) => {
      const [newSheet, newSubSteps] = applyPower(
        updatedSheet,
        ability,
        selections.abilityEffectSelections?.[ability.name]
      );
      updatedSheet = newSheet;
      abilitySubSteps.push(...newSubSteps);
    });

    if (abilitySubSteps.length) {
      updatedSheet.steps.push({
        type: 'Poderes',
        label: `Novas habilidades de classe (Nível ${updatedSheet.nivel})`,
        value: abilitySubSteps,
      });
    }

    updatedSheet.sheetActionHistory.push({
      source: {
        type: 'levelUp',
        level: updatedSheet.nivel,
      },
      changes: newlyAvailableAbilities.map((ability) => ({
        type: 'PowerAdded',
        powerName: ability.name,
      })),
    });

    // Update displayed abilities to include newly available ones
    const allAvailableAbilities = originalAbilities.filter(
      (ability) => ability.nivel <= updatedSheet.nivel
    );
    updatedSheet.classe.abilities = allAvailableAbilities;

    // Apply text modifications from chooseFromOptions history
    applyOptionChosenTexts(updatedSheet);
  }

  return updatedSheet;
}

const calculateBonusValue = (sheet: CharacterSheet, bonus: StatModifier) => {
  if (bonus.type === 'Attribute') {
    return sheet.atributos[bonus.attribute].value;
  }
  if (bonus.type === 'LevelCalc') {
    const filledFormula = bonus.formula.replace(
      '{level}',
      sheet.nivel.toString()
    );
    // eslint-disable-next-line no-eval
    return eval(filledFormula);
  }
  if (bonus.type === 'TormentaPowersCalc') {
    const filledFormula = bonus.formula.replace(
      '{tPowQtd}',
      countTormentaPowers(sheet).toString()
    );
    // eslint-disable-next-line no-eval
    return eval(filledFormula);
  }
  if (bonus.type === 'SpecialAttribute') {
    if (bonus.attribute === 'spellKeyAttr') {
      const attr = sheet.classe.spellPath?.keyAttribute || Atributo.CARISMA;
      return sheet.atributos[attr].value;
    }
  }
  if (bonus.type === 'Fixed') {
    return bonus.value;
  }
  return 0;
};

const applyStatModifiers = (
  _sheet: CharacterSheet,
  manualSelections?: SelectionOptions
) => {
  const sheet = _.cloneDeep(_sheet);

  const pvSubSteps: SubStep[] = [];
  const pmSubSteps: SubStep[] = [];
  const defSubSteps: SubStep[] = [];
  const skillSubSteps: SubStep[] = [];
  const displacementSubSteps: SubStep[] = [];
  const armorPenaltySubSteps: SubStep[] = [];
  const modifySkillAttributeSubSteps: SubStep[] = [];

  sheet.sheetBonuses.forEach((bonus) => {
    const bonusValue = calculateBonusValue(sheet, bonus.modifier);
    const getSubStepName = (source: SheetChangeSource) => {
      if (source.type === 'power') {
        return `${source.name}:`;
      }
      if (source.type === 'levelUp') {
        return `Nível ${source.level}:`;
      }
      // Assumindo que as únicas fontes de bonus são poderes e levelUp
      return '';
    };
    const subStepName: string = getSubStepName(bonus.source);

    if (bonus.target.type === 'PV') {
      sheet.pv += bonusValue;
      pvSubSteps.push({
        name: subStepName,
        value: `${bonusValue}`,
      });
    } else if (bonus.target.type === 'PM') {
      sheet.pm += bonusValue;
      pmSubSteps.push({
        name: subStepName,
        value: `${bonusValue}`,
      });
    } else if (bonus.target.type === 'Defense') {
      sheet.defesa += bonusValue;
      defSubSteps.push({
        name: subStepName,
        value: `${bonusValue}`,
      });
    } else if (bonus.target.type === 'Skill') {
      const skillName = bonus.target.name;

      // TODO: Adicionar bonus bom pra oficios
      if (skillName === Skill.OFICIO) {
        // console.warn('need good bonus for OFICIO skill');
      }

      addOtherBonusToSkill(sheet, skillName, bonusValue);

      skillSubSteps.push({
        name: subStepName,
        value: `${bonusValue} em ${skillName}`,
      });
    } else if (bonus.target.type === 'Displacement') {
      sheet.displacement += bonusValue;

      displacementSubSteps.push({
        name: subStepName,
        value: `${bonusValue}m`,
      });
    } else if (bonus.target.type === 'MaxSpaces') {
      sheet.maxSpaces += bonusValue;

      displacementSubSteps.push({
        name: subStepName,
        value: `${bonusValue} espaços de carga`,
      });
    } else if (bonus.target.type === 'ArmorPenalty') {
      sheet.extraArmorPenalty += bonusValue;

      armorPenaltySubSteps.push({
        name: subStepName,
        value: `${bonusValue}`,
      });
    } else if (bonus.target.type === 'PickSkill') {
      let pickedSkills: Skill[];

      // Use manual selections if provided
      if (manualSelections?.skills && manualSelections.skills.length > 0) {
        pickedSkills = manualSelections.skills.slice(
          0,
          bonus.target.pick
        ) as Skill[];
      } else {
        // Fall back to random selection
        pickedSkills = pickFromArray(bonus.target.skills, bonus.target.pick);
      }

      pickedSkills.forEach((skill) => {
        // TODO: Adicionar bonus bom pra oficios
        if (skill === Skill.OFICIO) {
          // console.warn('need good bonus for OFICIO skill');
        }

        addOtherBonusToSkill(sheet, skill, bonusValue);
      });
    } else if (bonus.target.type === 'DamageReduction') {
      const { damageType } = bonus.target;
      if (!sheet.reducaoDeDano) {
        sheet.reducaoDeDano = {};
      }
      sheet.reducaoDeDano[damageType] =
        (sheet.reducaoDeDano[damageType] ?? 0) + bonusValue;
    } else if (bonus.target.type === 'ModifySkillAttribute') {
      const { attribute } = bonus.target;
      const skillName = bonus.target.skill;

      const newCompleteSkills = sheet.completeSkills?.map((skill) => {
        if (skill.name === skillName) {
          return {
            ...skill,
            modAttr: attribute,
          };
        }
        return skill;
      });

      _.merge(sheet, { completeSkills: newCompleteSkills });

      modifySkillAttributeSubSteps.push({
        name: subStepName,
        value: `Modifica atributo de ${skillName} para ${attribute}`,
      });
    } else {
      // console.warn('bonus não implementado', bonus);
    }
  });

  // Class-conditional Damage Reduction
  const equippedArmors = sheet.bag.equipments.Armadura || [];
  const hasHeavyArmor = equippedArmors.some((armor) => isHeavyArmor(armor));

  // Bárbaro: Resistência a Dano (RD Geral escalável)
  if (sheet.classe.name === 'Bárbaro' && sheet.nivel >= 5) {
    const rdValue = 2 * Math.min(5, 1 + Math.floor((sheet.nivel - 5) / 3));
    if (!sheet.reducaoDeDano) {
      sheet.reducaoDeDano = {};
    }
    sheet.reducaoDeDano.Geral = (sheet.reducaoDeDano.Geral ?? 0) + rdValue;
  }

  // Cavaleiro: Bastião (RD Geral 5, armadura pesada)
  if (sheet.cavaleiroCaminho === 'Bastião' && hasHeavyArmor) {
    if (!sheet.reducaoDeDano) {
      sheet.reducaoDeDano = {};
    }
    sheet.reducaoDeDano.Geral = (sheet.reducaoDeDano.Geral ?? 0) + 5;
  }

  // Cavaleiro/Guerreiro: Especialização em Armadura (RD Geral 5, armadura pesada)
  const hasEspecArmadura = (sheet.classPowers || []).some(
    (p) => p.name === 'Especialização em Armadura'
  );
  if (hasEspecArmadura && hasHeavyArmor) {
    if (!sheet.reducaoDeDano) {
      sheet.reducaoDeDano = {};
    }
    sheet.reducaoDeDano.Geral = (sheet.reducaoDeDano.Geral ?? 0) + 5;
  }

  // Encastelado (RD Geral 2 + escala, armadura pesada)
  const hasEncastelado = (sheet.generalPowers || []).some(
    (p) => p.name === 'Encastelado'
  );
  if (hasEncastelado && hasHeavyArmor) {
    const encouracadoDependents = (sheet.generalPowers || []).filter(
      (p) =>
        p.name !== 'Encastelado' &&
        p.requirements?.some((reqGroup) =>
          reqGroup.some(
            (req) =>
              req.type === RequirementType.PODER && req.name === 'Encouraçado'
          )
        )
    ).length;
    if (!sheet.reducaoDeDano) {
      sheet.reducaoDeDano = {};
    }
    sheet.reducaoDeDano.Geral =
      (sheet.reducaoDeDano.Geral ?? 0) + 2 + encouracadoDependents;
  }

  // Selvagem Sanguinário (RD Geral 1, sem armadura pesada)
  const hasSelvagem = [
    ...(sheet.generalPowers || []),
    ...(sheet.origin?.powers || []),
  ].some((p) => p.name === 'Selvagem Sanguinário');
  if (hasSelvagem && !hasHeavyArmor) {
    if (!sheet.reducaoDeDano) {
      sheet.reducaoDeDano = {};
    }
    sheet.reducaoDeDano.Geral = (sheet.reducaoDeDano.Geral ?? 0) + 1;
  }

  // Carapaça Corrompida (RD Geral 1 + escala com poderes da Tormenta)
  const hasCarapaca = (sheet.generalPowers || []).some(
    (p) => p.name === 'Carapaça Corrompida'
  );
  if (hasCarapaca) {
    const otherTormentaPowers = countTormentaPowers(sheet) - 1;
    const rdValue = 1 + Math.floor(Math.max(0, otherTormentaPowers) / 2);
    if (!sheet.reducaoDeDano) {
      sheet.reducaoDeDano = {};
    }
    sheet.reducaoDeDano.Geral = (sheet.reducaoDeDano.Geral ?? 0) + rdValue;
  }

  // Pele Corrompida (RD 6 tipos, escala com poderes da Tormenta)
  const hasPeleCorr = (sheet.generalPowers || []).some(
    (p) => p.name === 'Pele Corrompida'
  );
  if (hasPeleCorr) {
    const otherTormentaPowers = countTormentaPowers(sheet) - 1;
    const rdValue = 2 + 2 * Math.floor(Math.max(0, otherTormentaPowers) / 2);
    const rdTypes = ['Ácido', 'Eletricidade', 'Fogo', 'Frio', 'Luz', 'Trevas'];
    if (!sheet.reducaoDeDano) {
      sheet.reducaoDeDano = {};
    }
    rdTypes.forEach((dt) => {
      (sheet.reducaoDeDano as Record<string, number>)[dt] =
        ((sheet.reducaoDeDano as Record<string, number>)[dt] ?? 0) + rdValue;
    });
  }

  if (pvSubSteps.length) {
    sheet.steps.push({
      label: 'Bonus de PV',
      type: 'Atributos Extras',
      value: pvSubSteps,
    });
  }

  if (pmSubSteps.length) {
    sheet.steps.push({
      label: 'Bonus de PM',
      type: 'Atributos Extras',
      value: pmSubSteps,
    });
  }

  if (defSubSteps.length) {
    sheet.steps.push({
      label: 'Bonus de Defesa',
      type: 'Atributos Extras',
      value: defSubSteps,
    });
  }

  if (skillSubSteps.length) {
    sheet.steps.push({
      label: 'Bonus de Perícias',
      type: 'Atributos Extras',
      value: skillSubSteps,
    });
  }

  if (displacementSubSteps.length) {
    sheet.steps.push({
      label: 'Bonus de Deslocamento',
      type: 'Atributos Extras',
      value: displacementSubSteps,
    });
  }

  if (armorPenaltySubSteps.length) {
    sheet.steps.push({
      label: 'Bonus de Penalidade de Armadura',
      type: 'Atributos Extras',
      value: armorPenaltySubSteps,
    });
  }

  if (modifySkillAttributeSubSteps.length) {
    sheet.steps.push({
      label: 'Bonus de Modificação de Atributo de Perícia',
      type: 'Modificação de Atributo de Perícia',
      value: modifySkillAttributeSubSteps,
    });
  }

  return sheet;
};

export default function generateRandomSheet(
  selectedOptions: SelectedOptions
): CharacterSheet {
  const supplements = selectedOptions.supplements || [
    SupplementId.TORMENTA20_CORE,
  ];
  const targetLevel = selectedOptions.nivel;
  let powersGetters: PowersGetters = {
    Origem: [],
  };

  // Lista do passo-a-passo que deve ser populada
  const steps: Step[] = [];

  // Passo 1: Definir gênero
  const sexos = ['Homem', 'Mulher'] as ('Homem' | 'Mulher')[];
  const sexo = getRandomItemFromArray<'Homem' | 'Mulher'>(sexos);

  // Passo 2: Definir raça (pode sobrescrever o sexo para raças exclusivas)
  const { race, nome, sex: finalSex } = getRaceAndName(selectedOptions, sexo);

  if (raceHasOrigin(race.name)) {
    steps.push({
      label: 'Gênero',
      value: [{ value: `${finalSex === 'Homem' ? 'Masculino' : 'Feminino'}` }],
    });
  }

  steps.push({
    label: 'Raça',
    value: [{ value: race.name }],
  });

  // Add heritage step if race has heritage (e.g., Moreau)
  if (race.heritage) {
    const heritage = MOREAU_HERITAGES[race.heritage];
    if (heritage) {
      steps.push({
        label: 'Herança',
        value: [{ value: heritage.name }],
      });
    }
  }

  steps.push({
    label: 'Nome',
    value: [{ value: nome }],
  });

  // Passo 3: Definir a classe
  const classe = selectClass(selectedOptions);

  steps.push({
    label: 'Classe',
    value: [{ value: classe.name }],
  });

  // Passo 4: Definir origem (se houver)
  let origin: Origin | undefined;

  if (raceHasOrigin(race.name)) {
    if (selectedOptions.origin) {
      // Busca origem em todos os suplementos ativos
      const allOrigins = dataRegistry.getOriginsBySupplements(supplements);
      origin = allOrigins.find((o) => o.name === selectedOptions.origin);
    } else {
      origin = getRandomItemFromArray(Object.values(ORIGINS));
    }
  }

  // Nada aqui - o step de origem será criado em getSkillsAndPowersByClassAndOrigin

  // Passo 5: itens, feitiços, e valores iniciais
  const initialBag = getInitialBag(origin);
  let initialMoney = getInitialMoney(targetLevel);

  // Adicionar dinheiro da origem, apenas se for origem regional
  if (origin?.isRegional && origin?.getMoney) {
    initialMoney += origin.getMoney();
  }

  const initialMoneyWithDetails = getInitialMoneyWithDetails(targetLevel);
  const initialSpells: Spell[] = [];
  const initialPV = classe.pv;
  const initialPM = classe.pm;
  const initialDefense = 10;

  // Gerar equipamentos de recompensa se solicitado
  const generatedEquipments: Equipment[] = [];
  let equipmentGenerationCost = 0;
  const equipmentGenerationStep: SubStep[] = [];

  if (
    selectedOptions.gerarItens &&
    selectedOptions.gerarItens !== 'nao-gerar'
  ) {
    const equipmentResult = generateEquipmentRewards(targetLevel, initialBag);

    if (equipmentResult.totalCost > 0) {
      // Extrair equipamentos gerados para adicionar ao bag
      Object.values(equipmentResult.equipments).forEach((equipmentArray) => {
        if (equipmentArray) {
          generatedEquipments.push(...equipmentArray);
        }
      });

      equipmentGenerationCost = equipmentResult.totalCost;

      // Se deve consumir dinheiro, reduzir do initial money
      if (selectedOptions.gerarItens === 'consumir-dinheiro') {
        initialMoney = Math.max(0, initialMoney - equipmentGenerationCost);
      }

      // Adicionar resumo e itens individuais aos steps
      equipmentGenerationStep.push({
        name: 'Resumo da Geração',
        value: `${equipmentResult.generationDetails} (Custo total: ${equipmentGenerationCost} T$)`,
      });

      // Adicionar cada gerado como substep
      equipmentGenerationStep.push(...equipmentResult.itemsForSteps);
    }
  }

  steps.push(
    {
      label: 'PV Inicial',
      value: [{ value: initialPV }],
    },
    {
      label: 'PM Inicial',
      value: [{ value: initialPM }],
    },
    {
      label: 'Defesa Inicial',
      value: [{ value: initialDefense }],
    },
    {
      label: 'Dinheiro Inicial',
      value: [
        {
          value: `T$ ${initialMoneyWithDetails.amount}${
            initialMoneyWithDetails.details
              ? ` ${initialMoneyWithDetails.details}`
              : ''
          }`,
        },
      ],
    },
    {
      label: 'Equipamentos Iniciais e de Origem',
      value: [],
    }
  );

  // Adicionar step dos equipamentos gerados se houver
  if (equipmentGenerationStep.length > 0) {
    steps.push({
      label: 'Equipamentos por Nível',
      type: 'Equipamentos',
      value: equipmentGenerationStep,
    });
  }

  // Passo 6: Gerar atributos finais
  const sexForAttributes: 'Masculino' | 'Feminino' =
    finalSex === 'Homem' ? 'Masculino' : 'Feminino';
  const atributos = generateFinalAttributes(
    classe,
    race,
    steps,
    sexForAttributes
  );

  // Aplicar modificador de atributo da origem, apenas se for origem regional
  let attributeModifierText: string | undefined;
  if (origin?.isRegional && origin?.getAttributeModifier) {
    const attributeModifier = origin.getAttributeModifier(classe.attrPriority);
    const currentAttr = atributos[attributeModifier.attribute];
    const newValue = currentAttr.value + attributeModifier.modifier;
    atributos[attributeModifier.attribute] = {
      ...currentAttr,
      value: newValue,
    };

    attributeModifierText = `+${attributeModifier.modifier} ${attributeModifier.attribute} (${currentAttr.value} → ${newValue})`;
  }

  // Os substeps da origem serão adicionados depois que getSkillsAndPowersByClassAndOrigin for chamado

  // Passo 6.1: Gerar valores dependentes de atributos
  const maxSpaces = calculateMaxSpaces(atributos.Força.value);
  const summedPV = initialPV + atributos.Constituição.value;

  steps.push({
    label: 'Vida máxima (+CON)',
    value: [{ value: summedPV }],
  });

  // Passo 7: Escolher se vai ser devoto, e se for o caso puxar uma divindade

  const devote = getReligiosidade(
    classe,
    race,
    selectedOptions.devocao.value,
    supplements
  );

  if (devote) {
    steps.push({
      label: `Devoto de ${devote.divindade.name}`,
      value: [],
    });
  } else {
    steps.push({
      label: 'Não será devoto',
      value: [],
    });
  }

  // Passo 8: Gerar pericias treinadas
  const {
    powers: { general: generalGetters, origin: originPowers },
    skills,
  } = getSkillsAndPowersByClassAndOrigin(classe, origin, atributos, steps);

  powersGetters = generalGetters;

  // Adicionar substeps faltantes ao step "Benefícios da origem"
  if (origin) {
    // Encontrar o step "Benefícios da origem"
    const originStepIndex = steps.findIndex((step) =>
      step.label.startsWith('Benefícios da origem')
    );

    if (originStepIndex >= 0) {
      const additionalSubsteps: SubStep[] = [];

      // Adicionar bônus de atributo
      if (attributeModifierText) {
        additionalSubsteps.push({
          name: 'Bônus de Atributo',
          value: attributeModifierText,
        });
      }

      // Adicionar itens (apenas para origens regionais)
      if (origin.isRegional) {
        const originItems = origin.getItems();
        if (originItems && originItems.length > 0) {
          const itemsList = originItems.map((item) => {
            if (typeof item.equipment === 'string') {
              const qtd = item.qtd ? `${item.qtd}x ` : '';
              return `${qtd}${item.equipment}`;
            }
            return item.equipment.nome;
          });
          additionalSubsteps.push({
            name: 'Itens',
            value: itemsList.join(', '),
          });
        }

        // Adicionar dinheiro (apenas para origens regionais)
        if (origin.getMoney) {
          const money = origin.getMoney();
          additionalSubsteps.push({
            name: 'Dinheiro adicional',
            value: `T$ ${money}`,
          });
        }
      }

      // Adicionar os novos substeps aos existentes
      if (additionalSubsteps.length > 0) {
        steps[originStepIndex].value.push(...additionalSubsteps);
      }
    }
  }

  let sheetOrigin;
  if (origin) {
    sheetOrigin = {
      name: origin.name,
      powers: originPowers,
    };
  }

  let charSheet: CharacterSheet = {
    id: uuid(),
    nome,
    sexo: finalSex === 'Homem' ? 'Masculino' : 'Feminino',
    nivel: 1,
    atributos,
    maxSpaces,
    raca: race,
    raceHeritage: race.heritage,
    classe,
    pv: summedPV,
    pm: initialPM,
    sheetBonuses: [],
    sheetActionHistory: [],
    defesa: initialDefense,
    bag: initialBag,
    devoto: devote,
    origin: sheetOrigin,
    displacement: 0,
    size: getRaceSize(race),
    generalPowers: [],
    classPowers: [],
    steps,
    skills,
    spells: initialSpells,
    sentidos: [],
    dinheiro: initialMoney,
  };

  // Passo 9:
  // Adicionar equipamentos gerados ao bag ANTES dos equipamentos de classe
  if (generatedEquipments.length > 0) {
    const generatedEquipmentsByGroup: Partial<BagEquipments> = {};

    generatedEquipments.forEach((equipment) => {
      const group = equipment.group as keyof BagEquipments;
      if (!generatedEquipmentsByGroup[group]) {
        if (group === 'Armadura' || group === 'Escudo') {
          generatedEquipmentsByGroup[group] = [] as DefenseEquipment[];
        } else {
          generatedEquipmentsByGroup[group] = [] as Equipment[];
        }
      }
      if (group === 'Armadura' || group === 'Escudo') {
        (generatedEquipmentsByGroup[group] as DefenseEquipment[]).push(
          equipment as DefenseEquipment
        );
      } else {
        (generatedEquipmentsByGroup[group] as Equipment[]).push(equipment);
      }
    });

    charSheet.bag.addEquipment(generatedEquipmentsByGroup);
  }

  // Passo 10:
  // Gerar equipamento de classe (verificando armaduras existentes)
  const classEquipments = getClassEquipments(classe, charSheet.bag);
  charSheet.bag.addEquipment(classEquipments);

  charSheet.steps.push({
    type: 'Equipamentos',
    label: 'Equipamentos da classe',
    value: [...Object.values(classEquipments).flat()].map((equip) => ({
      value: equip.nome,
    })),
  });

  // Passo 11:
  // Gerar poderes restantes, e aplicar habilidades, e poderes
  charSheet = getAndApplyPowers(charSheet, powersGetters);

  // Calcular valor das perícias após poderes (pois vários poderes adicionam perícias e bonificadores)
  charSheet.completeSkills = Object.values(Skill)
    .map((skill) => {
      const skillAttr = SkillsAttrs[skill];
      const attr = atributos[skillAttr as unknown as Atributo];

      const armorPenalty = SkillsWithArmorPenalty.includes(skill)
        ? charSheet.bag.getArmorPenalty?.()
        : 0;

      return {
        name: skill,
        halfLevel: Math.floor(charSheet.nivel / 2),
        training: Object.values(charSheet.skills).includes(skill) ? 2 : 0,
        modAttr: attr.name,
        others: armorPenalty > 0 ? armorPenalty * -1 : 0,
      };
    })
    .filter(
      (skill) =>
        !skill.name.startsWith('Of') ||
        (skill.name.startsWith('Of') && skill.training > 0)
    );

  // Passo 12:
  // Recalcular defesa
  charSheet = calcDefense(charSheet);

  // Passo 13: Gerar magias se possível
  const newSpells = getNewSpells(1, charSheet.classe, charSheet.spells);
  // Filter out duplicates before adding
  const uniqueNewSpells = newSpells.filter(
    (newSpell) =>
      !charSheet.spells.some((existing) => existing.nome === newSpell.nome)
  );
  charSheet.spells.push(...uniqueNewSpells);

  if (newSpells.length) {
    charSheet.steps.push({
      label: `Magias Iniciais`,
      type: 'Magias',
      value: newSpells.map((spell) => ({ value: spell.nome })),
    });
  }

  const displacement = calcDisplacement(
    charSheet.bag,
    getRaceDisplacement(charSheet.raca),
    charSheet.atributos,
    charSheet.displacement
  );
  charSheet.displacement = displacement;

  for (let index = 2; index <= targetLevel; index += 1) {
    charSheet = levelUp(charSheet);
  }

  // Passo 14: Aplicar modificadores de atributos
  charSheet = applyStatModifiers(charSheet);

  return charSheet;
}

export function generateEmptySheet(
  selectedOptions: SelectedOptions,
  wizardSelections?: import('../interfaces/WizardSelections').WizardSelections,
  raceCustomization?: RaceCustomization
): CharacterSheet {
  const supplements = selectedOptions.supplements || [
    SupplementId.TORMENTA20_CORE,
  ];
  let race = selectRace(selectedOptions);

  // Apply race customization if provided (from pre-wizard modal)
  if (raceCustomization) {
    // Golem Desperto customization
    if (
      race.name === 'Golem Desperto' &&
      raceCustomization.golemChassis &&
      raceCustomization.golemEnergySource &&
      raceCustomization.golemSize
    ) {
      race = applyGolemDespertoCustomization(
        race,
        raceCustomization.golemChassis,
        raceCustomization.golemEnergySource,
        raceCustomization.golemSize
      );
    }

    // Duende customization
    if (
      race.name === 'Duende' &&
      raceCustomization.duendeNature &&
      raceCustomization.duendeSize &&
      raceCustomization.duendeBonusAttributes &&
      raceCustomization.duendePresentes &&
      raceCustomization.duendeTabuSkill
    ) {
      race = applyDuendeCustomization(
        race,
        raceCustomization.duendeNature,
        raceCustomization.duendeSize,
        raceCustomization.duendeBonusAttributes,
        raceCustomization.duendePresentes,
        raceCustomization.duendeTabuSkill
      );
    }

    // Moreau customization
    if (
      race.name === 'Moreau' &&
      raceCustomization.moreauHeritage &&
      raceCustomization.moreauBonusAttributes
    ) {
      race = applyMoreauCustomization(
        race,
        raceCustomization.moreauHeritage as MoreauHeritageName,
        raceCustomization.moreauBonusAttributes
      );
    }
  }

  const size = getRaceSize(race);
  const classes = dataRegistry.getClassesBySupplements(supplements);
  const generatedClass = classes.find((classe) =>
    classByName(classe, selectedOptions.classe)
  );

  if (!generatedClass) {
    throw new Error(`Classe ${selectedOptions.classe} não encontrada`);
  }

  let emptySheet: CharacterSheet = {
    id: uuid(),
    nome: '',
    sexo: '',
    nivel: 1,
    atributos: {
      Força: { name: Atributo.FORCA, value: 0 },
      Destreza: { name: Atributo.DESTREZA, value: 0 },
      Constituição: { name: Atributo.CONSTITUICAO, value: 0 },
      Inteligência: { name: Atributo.INTELIGENCIA, value: 0 },
      Sabedoria: { name: Atributo.SABEDORIA, value: 0 },
      Carisma: { name: Atributo.CARISMA, value: 0 },
    },
    maxSpaces: 10,
    raca: race,
    classe: generatedClass,
    pv: 10,
    pm: 0,
    sheetBonuses: [],
    sheetActionHistory: [],
    defesa: 10,
    bag: wizardSelections?.marketSelections
      ? new Bag(wizardSelections.marketSelections.bagEquipments)
      : new Bag(),
    devoto: undefined,
    origin: undefined,
    displacement: 0,
    size,
    generalPowers: [],
    classPowers: [],
    steps: [],
    skills: [
      ...(wizardSelections?.baseSkillChoices
        ? getClassBaseSkillsWithChoices(
            generatedClass,
            wizardSelections.baseSkillChoices
          )
        : getClassBaseSkills(generatedClass)),
      ...(wizardSelections?.classSkills || []),
      ...(wizardSelections?.intelligenceSkills || []),
    ],
    spells: [],
    dinheiro: wizardSelections?.marketSelections
      ? wizardSelections.marketSelections.remainingMoney
      : getInitialMoney(selectedOptions.nivel),
  };

  // Apply wizard character name and gender if provided
  if (wizardSelections?.characterName) {
    emptySheet.nome = wizardSelections.characterName;
  }
  if (wizardSelections?.characterGender) {
    emptySheet.sexo = wizardSelections.characterGender;
  }

  // Apply wizard base attribute values if provided
  // Note: baseAttributes now contains modifiers directly (not D&D-style base values)
  if (wizardSelections?.baseAttributes) {
    Object.keys(wizardSelections.baseAttributes).forEach((attrKey) => {
      const attr = attrKey as Atributo;
      const modValue = wizardSelections.baseAttributes![attr];
      emptySheet.atributos[attr].value = modValue;
    });
  }

  // Apply wizard race attribute choices if provided
  if (wizardSelections?.raceAttributes) {
    emptySheet.raceAttributeChoices = wizardSelections.raceAttributes;
  }

  // Save Duende customization fields
  if (raceCustomization && emptySheet.raca.name === 'Duende') {
    if (raceCustomization.duendeSize) {
      emptySheet.raceSizeCategory = raceCustomization.duendeSize;
    }
    if (raceCustomization.duendeNature) {
      emptySheet.duendeNature = raceCustomization.duendeNature;
    }
    if (raceCustomization.duendePresentes) {
      emptySheet.duendePresentes = raceCustomization.duendePresentes;
    }
    if (raceCustomization.duendeTabuSkill) {
      emptySheet.duendeTabuSkill = raceCustomization.duendeTabuSkill;
    }
  }

  // Save Golem Desperto customization fields
  if (raceCustomization && emptySheet.raca.name === 'Golem Desperto') {
    if (raceCustomization.golemChassis) {
      emptySheet.raceChassis = raceCustomization.golemChassis;
    }
    if (raceCustomization.golemEnergySource) {
      emptySheet.raceEnergySource = raceCustomization.golemEnergySource;
    }
    if (raceCustomization.golemSize) {
      emptySheet.raceSizeCategory = raceCustomization.golemSize;
    }
  }

  // Apply Suraggel alternative ability if selected
  if (
    wizardSelections?.suragelAbility &&
    emptySheet.raca.name.startsWith('Suraggel')
  ) {
    const alternativeAbility = SURAGEL_ALTERNATIVE_ABILITIES.find(
      (a) => a.name === wizardSelections.suragelAbility
    );
    if (alternativeAbility) {
      // Clone the race to avoid mutating the original
      const modifiedRace = _.cloneDeep(emptySheet.raca);

      // Find the default ability to replace (Luz Sagrada for Aggelus, Sombras Profanas for Sulfure)
      const defaultAbilityName = modifiedRace.name.includes('Aggelus')
        ? 'Luz Sagrada'
        : 'Sombras Profanas';

      const abilityIndex = modifiedRace.abilities.findIndex(
        (a) => a.name === defaultAbilityName
      );

      if (abilityIndex !== -1) {
        // Replace the default ability with the alternative
        modifiedRace.abilities[abilityIndex] = {
          name: alternativeAbility.name,
          description: alternativeAbility.description,
          sheetBonuses: alternativeAbility.sheetBonuses,
          sheetActions: alternativeAbility.sheetActions,
        };
      }

      emptySheet.raca = modifiedRace;
      emptySheet.suragelAbility = wizardSelections.suragelAbility;
    }
  }

  // Apply Qareen element selection from wizard
  if (wizardSelections?.qareenElement && emptySheet.raca.name === 'Qareen') {
    emptySheet.qareenElement = wizardSelections.qareenElement;
  }

  // Handle Arcanista subtype selection specially
  if (
    generatedClass.name === 'Arcanista' &&
    wizardSelections?.arcanistaSubtype
  ) {
    // Manually apply Arcanista subtype based on wizard selection
    // instead of calling the random setup() function
    const modifiedClasse = _.cloneDeep(generatedClass);
    const subtype = wizardSelections.arcanistaSubtype;
    modifiedClasse.subname = subtype;

    // Set spellPath based on subtype
    if (subtype === 'Bruxo') {
      modifiedClasse.spellPath = {
        initialSpells: 3,
        spellType: 'Arcane' as const,
        qtySpellsLearnAtLevel: (level: number) => (level === 1 ? 0 : 1),
        spellCircleAvailableAtLevel: (level: number) => {
          if (level < 5) return 1;
          if (level < 9) return 2;
          if (level < 13) return 3;
          if (level < 17) return 4;
          return 5;
        },
        keyAttribute: Atributo.INTELIGENCIA,
      };
      modifiedClasse.abilities.push({
        name: 'Caminho do Arcanista',
        text: 'Você é um bruxo, capaz de lançar magias através de um foco como uma varinha, cajado, chapéu, etc.',
        nivel: 1,
      });
    } else if (subtype === 'Mago') {
      modifiedClasse.spellPath = {
        initialSpells: 4,
        spellType: 'Arcane' as const,
        qtySpellsLearnAtLevel: (level) =>
          [5, 9, 13, 17].includes(level) ? 2 : 1,
        spellCircleAvailableAtLevel: (level) => {
          if (level < 5) return 1;
          if (level < 9) return 2;
          if (level < 13) return 3;
          if (level < 17) return 4;
          return 5;
        },
        keyAttribute: Atributo.INTELIGENCIA,
      };
      modifiedClasse.abilities.push({
        name: 'Caminho do Arcanista',
        text: 'Você é um mago, capaz de lançar magia através de todo o seu estudo mágico.',
        nivel: 1,
      });
    } else if (subtype === 'Feiticeiro') {
      modifiedClasse.attrPriority = [Atributo.CARISMA];
      modifiedClasse.spellPath = {
        initialSpells: 3,
        spellType: 'Arcane' as const,
        qtySpellsLearnAtLevel: (level) => (level % 2 === 1 ? 1 : 0),
        spellCircleAvailableAtLevel: (level) => {
          if (level < 5) return 1;
          if (level < 9) return 2;
          if (level < 13) return 3;
          if (level < 17) return 4;
          return 5;
        },
        keyAttribute: Atributo.CARISMA,
      };
      modifiedClasse.abilities.push({
        name: 'Caminho do Arcanista',
        text: 'Você é um feiticeiro, capaz de lançar magias através de um poder inato que corre no seu sangue.',
        nivel: 1,
      });

      // Handle Feiticeiro linhagem
      if (wizardSelections.feiticeiroLinhagem === 'Linhagem Dracônica') {
        const damageType = getRandomItemFromArray([
          'Ácido',
          'Elétrico',
          'Fogo',
          'Frio',
        ]);
        modifiedClasse.abilities.push({
          name: 'Linhagem Dracônica',
          text: `Um de seus antepassados foi um majestoso dragão. Tipo escolhido: ${damageType}. Você soma seu modificador de Carisma em seus pontos de vida iniciais e recebe resistência ao tipo de dano escolhido 5.`,
          nivel: 1,
          sheetBonuses: [
            {
              source: { type: 'power', name: 'Linhagem Dracônica' },
              target: { type: 'PV' },
              modifier: { type: 'Attribute', attribute: Atributo.CARISMA },
            },
          ],
        });
      } else if (wizardSelections.feiticeiroLinhagem === 'Linhagem Feérica') {
        modifiedClasse.periciasbasicas.push({
          type: 'and',
          list: [Skill.ENGANACAO],
        });
        const linhagemFeerica = feiticeiroPaths.find(
          (p) => p.name === 'Linhagem Feérica'
        );
        if (linhagemFeerica) {
          modifiedClasse.abilities.push(linhagemFeerica);
        }
      } else if (wizardSelections.feiticeiroLinhagem === 'Linhagem Rubra') {
        const linhagemRubra = feiticeiroPaths.find(
          (p) => p.name === 'Linhagem Rubra'
        );
        if (linhagemRubra) {
          modifiedClasse.abilities.push(linhagemRubra);
        }
      } else if (wizardSelections.feiticeiroLinhagem === 'Linhagem Abençoada') {
        const deusEscolhido =
          wizardSelections.linhagemAbencoada?.deus || 'um deus maior';
        modifiedClasse.abilities.push({
          name: 'Linhagem Abençoada',
          text: `Seu poder vem de ${deusEscolhido}. Você aprende uma magia divina de 1º círculo e pode aprender magias divinas de 1º círculo como magias de feiticeiro.`,
          nivel: 1,
        });

        // Buscar poderes concedidos da divindade escolhida
        const divindade = DIVINDADES.find((d) => d.name === deusEscolhido);
        const poderesDisponiveis = divindade?.poderes || [];

        // Habilidade de nível 2: poder concedido com escolha
        modifiedClasse.abilities.push({
          name: 'Linhagem Abençoada (Poder Concedido)',
          text: `Você recebe um poder concedido de ${deusEscolhido}, aprovado pelo mestre, sem precisar ser devoto.`,
          nivel: 2,
          sheetActions:
            poderesDisponiveis.length > 0
              ? [
                  {
                    source: {
                      type: 'power',
                      name: 'Linhagem Abençoada (Poder Concedido)',
                    },
                    action: {
                      type: 'getGeneralPower',
                      availablePowers: poderesDisponiveis,
                      pick: 1,
                    },
                  },
                ]
              : undefined,
        });
      }
    }

    emptySheet.classe = modifiedClasse;
  } else if (wizardSelections?.spellSchools && generatedClass.setup) {
    // Apply wizard spell school selections if provided (for Bardo/Druida)
    // Execute setup first to initialize spellPath
    const setupClass = generatedClass.setup(generatedClass);
    // Override schools with wizard selections
    if (setupClass.spellPath) {
      setupClass.spellPath.schools = wizardSelections.spellSchools;
      // Update emptySheet with the modified class
      emptySheet.classe = setupClass;
    }
  } else if (generatedClass.setup) {
    // No wizard selection, use random setup
    emptySheet.classe = generatedClass.setup(generatedClass);
  } else {
    emptySheet.classe = generatedClass;
  }

  // Apply wizard initial spell selections if provided
  if (
    wizardSelections?.initialSpells &&
    wizardSelections.initialSpells.length > 0
  ) {
    emptySheet.spells = [...wizardSelections.initialSpells];
  }

  // === STEP RECORDING FOR WIZARD-CREATED SHEETS ===
  // Record character creation steps similar to generateRandomSheet

  // Step: Gender
  if (wizardSelections?.characterGender) {
    emptySheet.steps.push({
      label: 'Gênero',
      value: [
        {
          value: wizardSelections.characterGender,
        },
      ],
    });
  }

  // Step: Race
  emptySheet.steps.push({
    label: 'Raça',
    value: [{ value: race.name }],
  });

  // Step: Heritage (for Moreau)
  if (race.heritage) {
    const heritage = MOREAU_HERITAGES[race.heritage];
    if (heritage) {
      emptySheet.steps.push({
        label: 'Herança',
        value: [{ value: heritage.name }],
      });
    }
  }

  // Step: Name
  if (wizardSelections?.characterName) {
    emptySheet.steps.push({
      label: 'Nome',
      value: [{ value: wizardSelections.characterName }],
    });
  }

  // Step: Class (with subtype for Arcanista)
  const classValue = wizardSelections?.arcanistaSubtype
    ? `${generatedClass.name} (${wizardSelections.arcanistaSubtype})`
    : generatedClass.name;
  emptySheet.steps.push({
    label: 'Classe',
    value: [{ value: classValue }],
  });

  // Step: Initial values
  const initialPV = generatedClass.pv + generatedClass.addpv;
  const initialPM = generatedClass.pm;
  const initialDefense = 10;
  const initialMoney = getInitialMoney(selectedOptions.nivel);

  emptySheet.steps.push(
    {
      label: 'PV Inicial',
      value: [{ value: initialPV }],
    },
    {
      label: 'PM Inicial',
      value: [{ value: initialPM }],
    },
    {
      label: 'Defesa Inicial',
      value: [{ value: initialDefense }],
    },
    {
      label: 'Dinheiro Inicial',
      value: [{ value: `T$ ${initialMoney}` }],
    }
  );

  // Step: Base Attributes
  if (wizardSelections?.baseAttributes) {
    const attrSubsteps: SubStep[] = Object.entries(
      wizardSelections.baseAttributes
    ).map(([attr, value]) => ({
      name: attr,
      value: value >= 0 ? `+${value}` : `${value}`,
    }));

    emptySheet.steps.push({
      label: 'Atributos Base',
      type: 'Atributos',
      value: attrSubsteps,
    });
  }

  // Step: Origin benefits
  if (selectedOptions.origin && wizardSelections?.originBenefits) {
    const benefitSubsteps: SubStep[] = wizardSelections.originBenefits.map(
      (benefit) => ({
        name: benefit.type === 'skill' ? 'Perícia' : 'Poder',
        value: benefit.name,
      })
    );

    if (benefitSubsteps.length > 0) {
      emptySheet.steps.push({
        label: `Benefícios da origem: ${selectedOptions.origin}`,
        type: 'Origem',
        value: benefitSubsteps,
      });
    }
  }

  // Step: Trained Skills (from class and wizard selection)
  if (emptySheet.skills.length > 0) {
    const skillSubsteps: SubStep[] = emptySheet.skills.map((skill) => ({
      name: skill,
      value: 'Treinada',
    }));

    emptySheet.steps.push({
      label: 'Perícias Treinadas',
      type: 'Perícias',
      value: skillSubsteps,
    });
  }

  // Step: Deity
  if (selectedOptions.devocao && selectedOptions.devocao.value !== '--') {
    const deityPowerNames =
      wizardSelections?.deityPowers ||
      emptySheet.devoto?.poderes?.map((p) => p.name) ||
      [];

    const deitySubsteps: SubStep[] =
      deityPowerNames.length > 0
        ? deityPowerNames.map((powerName) => ({
            name: 'Poder Concedido',
            value: powerName,
          }))
        : [];

    emptySheet.steps.push({
      label: `Devoto de ${
        selectedOptions.devocao.label || selectedOptions.devocao.value
      }`,
      type: 'Devoção',
      value: deitySubsteps,
    });
  }

  // Step: Initial Spells
  if (emptySheet.spells.length > 0) {
    const spellSubsteps: SubStep[] = emptySheet.spells.map((spell) => ({
      name: spell.nome,
      value: spell.spellCircle,
    }));

    emptySheet.steps.push({
      label: 'Magias Iniciais',
      type: 'Magias',
      value: spellSubsteps,
    });
  }

  // === END STEP RECORDING ===

  // Gerar equipamentos de recompensa para ficha vazia se solicitado
  if (
    selectedOptions.gerarItens &&
    selectedOptions.gerarItens !== 'nao-gerar'
  ) {
    const equipmentResult = generateEquipmentRewards(
      selectedOptions.nivel,
      emptySheet.bag
    );

    if (equipmentResult.totalCost > 0) {
      // Adicionar equipamentos ao bag
      Object.values(equipmentResult.equipments).forEach((equipmentArray) => {
        if (equipmentArray) {
          equipmentArray.forEach((equipment) => {
            const group = equipment.group as keyof BagEquipments;
            if (!emptySheet.bag.equipments[group]) {
              if (group === 'Armadura' || group === 'Escudo') {
                emptySheet.bag.equipments[group] = [] as DefenseEquipment[];
              } else {
                emptySheet.bag.equipments[group] = [] as Equipment[];
              }
            }
            if (group === 'Armadura' || group === 'Escudo') {
              (emptySheet.bag.equipments[group] as DefenseEquipment[]).push(
                equipment as DefenseEquipment
              );
            } else {
              (emptySheet.bag.equipments[group] as Equipment[]).push(equipment);
            }
          });
        }
      });

      // Se deve consumir dinheiro, reduzir
      if (selectedOptions.gerarItens === 'consumir-dinheiro') {
        emptySheet.dinheiro = Math.max(
          0,
          (emptySheet.dinheiro || 0) - equipmentResult.totalCost
        );
      }

      // Criar steps dos equipamentos gerados
      const equipmentSteps: SubStep[] = [];

      equipmentSteps.push({
        name: 'Resumo da Geração',
        value: `${equipmentResult.generationDetails} (Custo total: ${equipmentResult.totalCost} T$)`,
      });

      // Adicionar cada gerado como substep
      equipmentSteps.push(...equipmentResult.itemsForSteps);

      // Adicionar step ao histórico
      emptySheet.steps.push({
        label: 'Equipamentos por Nível',
        type: 'Equipamentos',
        value: equipmentSteps,
      });
    }
  }

  // Apply race abilities (this adds sheetBonuses and abilities from race)
  emptySheet = applyRaceAbilities(
    emptySheet,
    wizardSelections?.powerEffectSelections
  );

  // Apply race attribute modifiers
  const tempSteps: Step[] = [];
  emptySheet.atributos = modifyAttributesBasedOnRace(
    emptySheet.raca,
    emptySheet.atributos,
    emptySheet.classe.attrPriority || [],
    tempSteps,
    wizardSelections?.raceAttributes,
    undefined // Sex not defined in empty sheet yet
  );
  emptySheet.steps.push(...tempSteps);

  // Apply class abilities filtering by level
  emptySheet = applyClassAbilities(
    emptySheet,
    wizardSelections?.powerEffectSelections
  );

  // Process origin if selected
  if (selectedOptions.origin) {
    // Busca origem em todos os suplementos ativos
    const allOrigins = dataRegistry.getOriginsBySupplements(supplements);
    const selectedOrigin = allOrigins.find(
      (origin) => origin.name === selectedOptions.origin
    );
    if (selectedOrigin) {
      let originPowers = selectedOrigin.poderes || [];

      // Apply wizard origin benefit selections for non-regional origins
      // Note: isRegional is undefined for base book origins, so use !isRegional instead of === false
      if (
        wizardSelections?.originBenefits &&
        wizardSelections.originBenefits.length > 0 &&
        !selectedOrigin.isRegional
      ) {
        // Apply selected benefits
        wizardSelections.originBenefits.forEach((benefit) => {
          if (benefit.type === 'skill') {
            // Add skill if not already added
            if (!emptySheet.skills.includes(benefit.name as Skill)) {
              emptySheet.skills.push(benefit.name as Skill);
            }
          } else if (benefit.type === 'power') {
            // Power is already in the origin powers list, no need to add
          } else if (benefit.type === 'item') {
            // TODO: Add item to bag (requires equipment lookup)
          }
        });

        // Filter origin powers to only include selected ones
        const selectedPowerNames = wizardSelections.originBenefits
          .filter((b) => b.type === 'power')
          .map((b) => b.name);

        // Always filter origin powers based on selected powers
        // If user selected only skills (no powers), this results in empty powers array
        originPowers = originPowers.filter((p) =>
          selectedPowerNames.includes(p.name)
        );
      }

      emptySheet.origin = {
        name: selectedOrigin.name,
        powers: originPowers,
      };
    }
  }

  // Process deity if selected
  if (selectedOptions.devocao && selectedOptions.devocao.value) {
    const normalizedSearch = normalizeDeityName(selectedOptions.devocao.value);
    const deities = dataRegistry.getDeitiesWithSupplementPowers(supplements);
    const selectedDeity = deities.find(
      (deity) => normalizeDeityName(deity.name) === normalizedSearch
    );
    if (selectedDeity) {
      // Determine which deity powers to add based on wizard selections
      let deityPowers: import('../interfaces/Poderes').GeneralPower[] = [];

      if (
        wizardSelections?.deityPowers &&
        wizardSelections.deityPowers.length > 0
      ) {
        // Use wizard selections
        deityPowers = selectedDeity.poderes.filter((p) =>
          wizardSelections.deityPowers?.includes(p.name)
        );
      } else {
        // Use automatic selection (random or all)
        const todosPoderes = generatedClass.qtdPoderesConcedidos === 'all';
        const qtdPoderesConcedidos = isNumber(
          generatedClass.qtdPoderesConcedidos
        )
          ? (generatedClass.qtdPoderesConcedidos as number)
          : 1; // Default to 1 if undefined

        deityPowers = getPoderesConcedidos(
          selectedDeity,
          todosPoderes,
          generatedClass,
          qtdPoderesConcedidos
        );
      }

      emptySheet.devoto = {
        divindade: selectedDeity,
        poderes: deityPowers,
      };
    }
  }

  // Generate complete skills table with base values of 0
  emptySheet.completeSkills = Object.values(Skill)
    .map((skill) => {
      const skillAttr = SkillsAttrs[skill];

      return {
        name: skill,
        halfLevel: Math.floor(emptySheet.nivel / 2),
        training: emptySheet.skills.includes(skill) ? 2 : 0,
        modAttr: skillAttr as unknown as Atributo,
        others: 0, // Base value of 0 for empty sheet
      };
    })
    .filter(
      (skill) =>
        !skill.name.startsWith('Of') ||
        (skill.name.startsWith('Of') && skill.training > 0)
    );

  // Recalculate sheet to apply all bonuses (attributes, PV/PM, defense, skills)
  // Pass powerEffectSelections so deity/origin powers with learnSpell work correctly
  emptySheet = recalculateSheet(
    emptySheet,
    undefined,
    wizardSelections?.powerEffectSelections
  );

  return emptySheet;
}
