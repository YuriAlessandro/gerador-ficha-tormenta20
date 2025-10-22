import { v4 as uuid } from 'uuid';
import _, { cloneDeep, isNumber } from 'lodash';
import { SelectionOptions } from '@/interfaces/PowerSelections';
import { Atributo } from '../data/systems/tormenta20/atributos';
import { dataRegistry } from '../data/registry';
import { SupplementId } from '../types/supplement.types';
import { recalculateSheet } from './recalculateSheet';
import {
  getClassBaseSkills,
  getNotRepeatedSkillsByQtd,
  getRemainingSkills,
} from '../data/systems/tormenta20/pericias';
import EQUIPAMENTOS, {
  calcDefense,
  Armaduras,
  Escudos,
  bardInstruments,
  Armas,
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
} from './powers/special';
import {
  applyMoreauSapiencia,
  applyMoreauEspertezaVulpina,
} from './powers/moreau-special';
import { MOREAU_HERITAGES } from '../data/systems/tormenta20/ameacas-de-arton/races/moreau-heritages';
import { applyGolemDespertoSagrada } from './powers/golem-desperto-special';
import { addOtherBonusToSkill } from './skills/general';
import {
  getAttributeIncreasesInSamePlateau,
  getCurrentPlateau,
} from './powers/general';

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
    Skill.OFICIO_ESCRITA,
    Skill.OFICIO_JOALHEIRO,
    Skill.OFICIO_ALQUIMIA,
    Skill.OFICIO_ARTESANATO,
  ],
  Nobre: [
    Skill.OFICIO_JOALHEIRO,
    Skill.OFICIO_ALFAIATE,
    Skill.OFICIO_ESCRITA,
    Skill.OFICIO_ARTESANATO,
  ],
  Clérigo: [
    Skill.OFICIO_ESCRITA,
    Skill.OFICIO_CULINARIA,
    Skill.OFICIO_ARTESANATO,
    Skill.OFICIO_ALFAIATE,
  ],
  Ladino: [
    Skill.OFICIO_ALFAIATE,
    Skill.OFICIO_JOALHEIRO,
    Skill.OFICIO_ESCRITA,
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
  Skill.OFICIO_ESCRITA,
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

function rollAttributeValues(): number[] {
  const rolledValues = Object.values(Atributo).map(() => rollDice(4, 6, 1));

  // eslint-disable-next-line
  while (true) {
    const modifiers = rolledValues.map((value) => getModValue(value));
    const modSum = modifiers.reduce((acc, curr) => acc + curr);
    if (modSum >= 6) break;
    rolledValues.sort((a, b) => a - b);
    rolledValues.shift();
    rolledValues.push(rollDice(4, 6, 1));
  }

  return rolledValues;
}

function selectAttributeToChange(
  atributosModificados: string[],
  atributo: RaceAttributeAbility,
  priorityAttrs: Atributo[]
) {
  if (atributo.attr === 'any') {
    const atributosPermitidos = Object.values(Atributo).filter(
      (attr) => !atributosModificados.includes(attr)
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
  const newMod = atributosModificados[selectedAttrName].mod + attrDaRaca.mod;

  return {
    ...atributosModificados[selectedAttrName],
    mod: newMod,
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
            priorityAttrs
          );
        manualChoiceIndex += 1;
      } else {
        // Use automatic selection (random or fixed)
        selectedAttrName = selectAttributeToChange(
          nomesDosAtributosModificados,
          attrDaRaca,
          priorityAttrs
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
      value: maxAttr,
      mod: getModValue(maxAttr),
    };

    atributosNumericos.splice(atributosNumericos.indexOf(maxAttr), 1);

    freeAttrs = freeAttrs.filter((freeAttr) => freeAttr !== attr);
  });

  const charAttributes = freeAttrs.reduce((acc, attr, index) => {
    const mod = getModValue(atributosNumericos[index]);
    return {
      ...acc,
      [attr]: { name: attr, value: atributosNumericos[index], mod },
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
      value: attr.mod,
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
  if (attributes.Inteligência.mod > 0) {
    return getNotRepeatedSkillsByQtd(usedSkills, attributes.Inteligência.mod);
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
  if (classe.name === 'Inventor') {
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
  if (classe.name === 'Bardo') {
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

function getThyatisPowers(classe: ClassDescription) {
  const unrestrictedPowers = DivindadeEnum.THYATIS.poderes.filter(
    (poder) =>
      poder.name !== GRANTED_POWERS.DOM_DA_IMORTALIDADE.name &&
      poder.name !== GRANTED_POWERS.DOM_DA_RESSUREICAO.name
  );

  if (classe.name === 'Paladino')
    return [...unrestrictedPowers, GRANTED_POWERS.DOM_DA_IMORTALIDADE];

  if (classe.name === 'Clérigo')
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
      return getThyatisPowers(classe);
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
  selectedOption: string
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
    divindade = DivindadeEnum[divindadeName];
  } else {
    divindade = DivindadeEnum[selectedOption as DivindadeNames];
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

function calcDisplacement(
  bag: Bag,
  raceDisplacement: number,
  atributos: CharacterAttributes,
  baseDisplacement: number
): number {
  const maxSpaces =
    atributos.Força.mod > 0
      ? 10 + 2 * atributos.Força.mod
      : 10 - atributos.Força.mod;

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

  // sheet action
  if (powerOrAbility.sheetActions) {
    powerOrAbility.sheetActions.forEach((sheetAction) => {
      if (sheetAction.action.type === 'ModifyAttribute') {
        const { attribute, value } = sheetAction.action;
        const newValue = sheet.atributos[attribute].mod + value;
        sheet.atributos[attribute].mod = newValue;

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
        if (sheetAction.action.allowedType === 'Arcane') {
          allSpellsOfCircle = getArcaneSpellsOfCircle(highestCircle);
        } else if (sheetAction.action.allowedType === 'Divine') {
          allSpellsOfCircle = getSpellsOfCircle(highestCircle);
        } else {
          allSpellsOfCircle = getSpellsOfCircle(highestCircle);
        }

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

        let targetAttribute: Atributo;

        // Use manual selection if provided
        if (
          manualSelections?.attributes &&
          manualSelections.attributes.length > 0
        ) {
          targetAttribute = manualSelections.attributes[0] as Atributo;
        } else if (firstPriorityAttribute) {
          targetAttribute = firstPriorityAttribute;
        } else {
          // If no priority attributes available, pick any
          targetAttribute = getRandomItemFromArray(availableAttributes);
        }

        sheet.atributos[targetAttribute].mod += 1;
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
          currentSteps = applyHumanoVersatil(sheet);
        } else if (sheetAction.action.specialAction === 'lefouDeformidade') {
          currentSteps = applyLefouDeformidade(sheet);
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
                    rule.name && sheet.atributos[attr].mod >= (rule?.value || 0)
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

    // Check if there's an HP attribute replacement and apply it immediately
    const hpReplacement = powerOrAbility.sheetBonuses.find(
      (bonus) => bonus.target.type === 'HPAttributeReplacement'
    );

    if (
      hpReplacement &&
      hpReplacement.target.type === 'HPAttributeReplacement'
    ) {
      const { newAttribute } = hpReplacement.target;
      const baseHp = sheet.classe.pv;
      const attributeBonus = sheet.atributos[newAttribute].mod * sheet.nivel;

      const oldPv = sheet.pv;
      sheet.pv = baseHp + attributeBonus;

      subSteps.push({
        name: getSourceName(hpReplacement.source),
        value: `Troca cálculo de PV de Constituição para ${newAttribute}: ${baseHp} + ${sheet.atributos[newAttribute].mod} × ${sheet.nivel} = ${sheet.pv} (era ${oldPv})`,
      });
    }
  }

  return [sheet, subSteps];
};

export function applyRaceAbilities(sheet: CharacterSheet): CharacterSheet {
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
    const [newAcc, newSubSteps] = applyPower(acc, ability);
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

function applyDivinePowers(sheet: CharacterSheet): CharacterSheet {
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
    const [newAcc, newSubSteps] = applyPower(acc, power);
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

function applyClassAbilities(sheet: CharacterSheet): CharacterSheet {
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
    const [newAcc, newSubSteps] = applyPower(acc, ability);
    subSteps.push(...newSubSteps);
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
  sheetClone.classe.abilities = availableAbilities;

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
        // Ache o atributo com maior mod que não seja carisma
        const highestAttribute = Object.values(sheetClone.atributos).reduce(
          (prev, curr) => {
            if (curr.name === 'Carisma') return prev;
            if (prev.mod > curr.mod) return prev;
            return curr;
          }
        );

        sheetClone.atributos[highestAttribute.name].mod -= 1;
        remainingPenalty -= 1;

        subSteps.push({
          name: highestAttribute.name,
          value: `-1 por ${tormentaPowersQtd} poderes da Tormenta`,
        });
      }
    } else {
      sheetClone.atributos.Carisma.mod -= totalPenalty;
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
    updatedSheet.classe.addpv + updatedSheet.atributos[hpAttribute].mod;

  if (addPv < 1) addPv = 1;

  const newPvTotal = updatedSheet.pv + addPv;
  const newPmTotal = updatedSheet.pm + updatedSheet.classe.addpm;

  const subSteps = [];

  // Aumentar PV e PM
  subSteps.push(
    {
      name: `PV (${updatedSheet.pv} + ${addPv} por nível - ${hpAttribute})`,
      value: newPvTotal,
    },
    {
      name: `PM (${updatedSheet.pm} + ${updatedSheet.classe.addpm} por nível)`,
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
  updatedSheet.spells.push(...newSpells);

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
  const allowedPowers =
    updatedSheet.classe.name === 'Inventor'
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
  }

  return updatedSheet;
}

const calculateBonusValue = (sheet: CharacterSheet, bonus: StatModifier) => {
  if (bonus.type === 'Attribute') {
    return sheet.atributos[bonus.attribute].mod;
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
      return sheet.atributos[attr].mod;
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
      mod: getModValue(newValue),
    };

    attributeModifierText = `+${attributeModifier.modifier} ${attributeModifier.attribute} (${currentAttr.value} → ${newValue})`;
  }

  // Os substeps da origem serão adicionados depois que getSkillsAndPowersByClassAndOrigin for chamado

  // Passo 6.1: Gerar valores dependentes de atributos
  const maxSpaces =
    atributos.Força.mod > 0
      ? 10 + 2 * atributos.Força.mod
      : 10 - atributos.Força.mod;
  const summedPV = initialPV + atributos.Constituição.mod;

  steps.push({
    label: 'Vida máxima (+CON)',
    value: [{ value: summedPV }],
  });

  // Passo 7: Escolher se vai ser devoto, e se for o caso puxar uma divindade

  const devote = getReligiosidade(classe, race, selectedOptions.devocao.value);

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
  charSheet.spells.push(...newSpells);

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
  selectedOptions: SelectedOptions
): CharacterSheet {
  // console.log(selectedOptions);
  const supplements = selectedOptions.supplements || [
    SupplementId.TORMENTA20_CORE,
  ];
  const race = selectRace(selectedOptions);
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
    nivel: selectedOptions.nivel,
    atributos: {
      Força: { name: Atributo.FORCA, mod: 0, value: 10 },
      Destreza: { name: Atributo.DESTREZA, mod: 0, value: 10 },
      Constituição: { name: Atributo.CONSTITUICAO, mod: 0, value: 10 },
      Inteligência: { name: Atributo.INTELIGENCIA, mod: 0, value: 10 },
      Sabedoria: { name: Atributo.SABEDORIA, mod: 0, value: 10 },
      Carisma: { name: Atributo.CARISMA, mod: 0, value: 10 },
    },
    maxSpaces: 10,
    raca: race,
    classe: generatedClass,
    pv: 10,
    pm: 0,
    sheetBonuses: [],
    sheetActionHistory: [],
    defesa: 10,
    bag: new Bag(),
    devoto: undefined,
    origin: undefined,
    displacement: 0,
    size,
    generalPowers: [],
    classPowers: [],
    steps: [],
    skills: getClassBaseSkills(generatedClass), // Add class base skills
    spells: [],
    dinheiro: getInitialMoney(selectedOptions.nivel),
  };

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
  emptySheet = applyRaceAbilities(emptySheet);

  // Apply race attribute modifiers
  const tempSteps: Step[] = [];
  emptySheet.atributos = modifyAttributesBasedOnRace(
    emptySheet.raca,
    emptySheet.atributos,
    emptySheet.classe.attrPriority || [],
    tempSteps,
    undefined, // No manual choices for empty sheet
    undefined // Sex not defined in empty sheet yet
  );
  emptySheet.steps.push(...tempSteps);

  // Apply class abilities filtering by level
  emptySheet = applyClassAbilities(emptySheet);

  // Process origin if selected
  if (selectedOptions.origin) {
    // Busca origem em todos os suplementos ativos
    const allOrigins = dataRegistry.getOriginsBySupplements(supplements);
    const selectedOrigin = allOrigins.find(
      (origin) => origin.name === selectedOptions.origin
    );
    if (selectedOrigin) {
      emptySheet.origin = {
        name: selectedOrigin.name,
        powers: selectedOrigin.poderes || [],
      };
    }
  }

  // Process deity if selected
  if (selectedOptions.devocao && selectedOptions.devocao.value) {
    const selectedDeity = Object.values(DivindadeEnum).find(
      (deity) =>
        deity.name.toLowerCase() === selectedOptions.devocao.value.toLowerCase()
    );
    if (selectedDeity) {
      emptySheet.devoto = {
        divindade: selectedDeity,
        poderes: [],
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
  emptySheet = recalculateSheet(emptySheet);

  return emptySheet;
}
