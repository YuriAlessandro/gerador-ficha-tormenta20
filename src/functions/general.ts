import { v4 as uuid } from 'uuid';
import _, { cloneDeep, isNumber } from 'lodash';
import { Atributo } from '../data/atributos';
import RACAS, { getRaceByName } from '../data/racas';
import CLASSES from '../data/classes';
import {
  getClassBaseSkills,
  getNotRepeatedSkillsByQtd,
  getRemainingSkills,
} from '../data/pericias';
import EQUIPAMENTOS, {
  calcDefense,
  Armaduras,
  Escudos,
  bardInstruments,
} from '../data/equipamentos';
import { standardFaithProbability, DivindadeEnum } from '../data/divindades';
import { generateRandomName } from '../data/nomes';
import {
  CharacterAttribute,
  CharacterAttributes,
  CharacterReligion,
} from '../interfaces/Character';
import Race, { RaceAttributeAbility } from '../interfaces/Race';
import { ClassDescription } from '../interfaces/Class';
import SelectedOptions from '../interfaces/SelectedOptions';
import {
  countTormentaPowers,
  getRandomItemFromArray,
  mergeFaithProbabilities,
  pickFaith,
  pickFromArray,
  rollDice,
} from './randomUtils';
import todasProficiencias from '../data/proficiencias';
import { getOriginBenefits, ORIGINS, origins } from '../data/origins';
import Equipment, { BagEquipments } from '../interfaces/Equipment';
import Divindade, { DivindadeNames } from '../interfaces/Divindade';
import GRANTED_POWERS from '../data/powers/grantedPowers';
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
} from '../data/magias/arcane';
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
} from '../data/magias/divine';
import { Spell } from '../interfaces/Spells';
import {
  getRaceDisplacement,
  getRaceSize,
} from '../data/races/functions/functions';
import Origin from '../interfaces/Origin';
import {
  GeneralPower,
  OriginPower,
  PowerGetter,
  PowersGetters,
} from '../interfaces/Poderes';
import CharacterSheet, {
  SheetAction,
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
import roles from '../data/roles';
import { RoleNames } from '../interfaces/Role';
import {
  getAllowedClassPowers,
  getPowersAllowedByRequirements,
} from './powers';

export function getModValue(attr: number): number {
  return Math.floor(attr / 2) - 5;
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
  steps: Step[]
): CharacterAttributes {
  const values: { name: string; value: string | number }[] = [];
  const reducedAttrs = raca.attributes.attrs.reduce<ReduceAttributesParams>(
    ({ atributos, nomesDosAtributosModificados }, attrDaRaca) => {
      // Definir que atributo muda (se for any é um random)
      const selectedAttrName = selectAttributeToChange(
        nomesDosAtributosModificados,
        attrDaRaca,
        priorityAttrs
      );

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
  steps: Step[]
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
    steps
  );
}

export function selectRace(selectedOptions: SelectedOptions): Race {
  if (selectedOptions.raca) {
    return getRaceByName(selectedOptions.raca);
  }

  return getRaceByName(getRandomItemFromArray(RACAS).name);
}

function getRaceAndName(
  selectedOptions: SelectedOptions,
  sex: 'Homem' | 'Mulher'
) {
  // Passo 2.2: Escolher raça
  const race = selectRace(selectedOptions);
  // Passo 2.3: Definir nome
  const nome = generateRandomName(race, sex);

  return { nome, race };
}

function classByName(classe: ClassDescription, classeName: string) {
  return classe.name === classeName;
}

function getClassByFilter(selectedOptions: SelectedOptions) {
  const foundClass = CLASSES.find((classe) =>
    classByName(classe, selectedOptions.classe)
  );

  if (foundClass) return foundClass;

  const foundRole = Object.keys(roles).find(
    (role) => role === selectedOptions.classe
  ) as RoleNames | undefined;

  if (foundRole) {
    const choosenClassName = getRandomItemFromArray(roles[foundRole]);

    return CLASSES.find((classe) => classByName(classe, choosenClassName));
  }

  return null;
}

export function selectClass(
  selectedOptions: SelectedOptions
): ClassDescription {
  let selectedClass: ClassDescription | undefined | null;
  let allClasses = CLASSES;
  if (selectedOptions.classe) {
    selectedClass = getClassByFilter(selectedOptions);
  }

  const dv = selectedOptions.devocao.value;
  if (dv) {
    allClasses = CLASSES.filter(
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
    const { skills: originSkills, powers: originPowers } = getOriginBenefits(
      usedSkills,
      origin
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

  const remainingSkills = getRemainingSkills(usedSkills, classe);
  usedSkills.push(...remainingSkills);

  const classSkills = [...classBaseSkills, ...remainingSkills];
  steps.push({
    label: 'Perícias da classe',
    type: 'Perícias',
    value: classSkills.map((skill) => ({ value: `${skill}` })),
  });

  const attributesSkills = getAttributesSkills(attributes, usedSkills);

  if (attributesSkills.length) {
    steps.push({
      label: 'Perícias (+INT)',
      type: 'Perícias',
      value: attributesSkills.map((skill) => ({ value: `${skill}` })),
    });
  }

  usedSkills.push(...attributesSkills);
  return {
    skills: usedSkills,
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

function getArmors(classe: ClassDescription) {
  const armors = [];
  if (classe.proficiencias.includes(todasProficiencias.PESADAS)) {
    armors.push(Armaduras.BRUNEA);
  } else if (classe.name !== 'Arcanista') {
    armors.push(getRandomItemFromArray(EQUIPAMENTOS.armadurasLeves));
  }

  return armors;
}

function getClassEquipments(
  classe: ClassDescription
): Pick<BagEquipments, 'Arma' | 'Escudo' | 'Armadura' | 'Item Geral'> {
  const weapons = getWeapons(classe);
  const shields = getShields(classe);
  const armors = getArmors(classe);

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
  const initialMoney = rollDice(4, 6, 0);
  const equipments: Partial<BagEquipments> = {
    'Item Geral': [
      {
        nome: `T$ ${initialMoney}`,
        group: 'Item Geral',
      },
    ],
  };

  const originItems = origin?.getItems();

  originItems?.forEach((equip) => {
    if (typeof equip.equipment === 'string') {
      const newEquip: Equipment = {
        nome: `${equip.qtd ? `${equip.qtd}x ` : ''}${equip.equipment}`,
        group: 'Item Geral',
      };
      equipments['Item Geral']?.push(newEquip);
    } else {
      // É uma arma
      equipments.Arma?.push(equip.equipment);
    }
  });

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

const applyPower = (
  _sheet: CharacterSheet,
  powerOrAbility: Pick<GeneralPower, 'sheetActions' | 'sheetBonuses'>
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
          changes: [{ type: 'Attribute', attribute, value: newValue }],
        });
      } else if (sheetAction.action.type === 'addProficiency') {
        // Ver Proficiência em combat powers e depois remove comment
        subSteps.push({
          name: sheetAction.action.type,
          value: `Não implementado`,
        });
      } else if (sheetAction.action.type === 'learnSkill') {
        // const sheetClone = cloneDeep(sheet);

        // const newSkill = getNotRepeatedRandomSkill(sheetClone.skills);

        // subSteps.push({
        //   name: 'Treinamento em Perícia',
        //   value: newSkill,
        // });

        // return merge<CharacterSheet, Partial<CharacterSheet>>(sheetClone, {
        //   skills: [...sheetClone.skills, newSkill],
        // });

        subSteps.push({
          name: sheetAction.action.type,
          value: `Não implementado`,
        });
      } else if (sheetAction.action.type === 'addSense') {
        if (!sheet.sentidos) sheet.sentidos = [];
        if (!sheet.sentidos.includes(sheetAction.action.sense)) {
          sheet.sentidos.push(sheetAction.action.sense);
          subSteps.push({
            name: getSourceName(sheetAction.source),
            value: `Recebe o sentido ${sheetAction.action.sense}`,
          });
        }
      } else {
        subSteps.push({
          name: sheetAction.action.type,
          value: `Não implementado`,
        });
      }
    });
  }

  // sheet bonuses
  if (powerOrAbility.sheetBonuses) {
    sheet.sheetBonuses.push(...powerOrAbility.sheetBonuses);
  }

  return [sheet, subSteps];
};

export function applyRaceAbilities(sheet: CharacterSheet): CharacterSheet {
  let sheetClone = _.cloneDeep(sheet);
  const subSteps: SubStep[] = [];

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

  let addPv =
    updatedSheet.classe.addpv + updatedSheet.atributos.Constituição.mod;

  if (addPv < 1) addPv = 1;

  const newPvTotal = updatedSheet.pv + addPv;
  const newPmTotal = updatedSheet.pm + updatedSheet.classe.addpm;

  const subSteps = [];

  // Aumentar PV e PM
  subSteps.push(
    {
      name: `PV (${updatedSheet.pv} + ${addPv} por nível)`,
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

  updatedSheet.steps.push({
    type: 'Poderes',
    label: `Nível ${updatedSheet.nivel}`,
    value: subSteps,
  });

  // Escolher novo poder aleatório (geral ou poder da classe)
  const randomNumber = Math.random();
  const allowedPowers = getAllowedClassPowers(updatedSheet);
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
    // TODO
    return 0;
  }
  if (bonus.type === 'SpecialAttribute') {
    if (bonus.attribute === 'spellKeyAttr') {
      const attr = sheet.classe.spellPath?.keyAttribute || Atributo.CARISMA;
      return sheet.atributos[attr].mod;
    }
  }
  return 0;
};

const applyStatModifiers = (_sheet: CharacterSheet) => {
  let sheet = _.cloneDeep(_sheet);

  const pvSubSteps: SubStep[] = [];
  const pmSubSteps: SubStep[] = [];
  const defSubSteps: SubStep[] = [];
  const skillSubSteps: SubStep[] = [];
  const displacementSubSteps: SubStep[] = [];
  const armorPenaltySubSteps: SubStep[] = [];

  sheet.sheetBonuses.forEach((bonus) => {
    const subStepName: string =
      bonus.source.type === 'power'
        ? `${bonus.source.name}:`
        : `Nível ${bonus.source.level}:`;

    if (bonus.target.type === 'PV') {
      const bonusValue = calculateBonusValue(sheet, bonus.modifier);
      sheet.pv += bonusValue;
      pvSubSteps.push({
        name: subStepName,
        value: `${bonusValue}`,
      });
    } else if (bonus.target.type === 'PM') {
      const bonusValue = calculateBonusValue(sheet, bonus.modifier);
      sheet.pm += bonusValue;
      pmSubSteps.push({
        name: subStepName,
        value: `${bonusValue}`,
      });
    } else if (bonus.target.type === 'Defense') {
      const bonusValue = calculateBonusValue(sheet, bonus.modifier);
      sheet.defesa += bonusValue;
      defSubSteps.push({
        name: subStepName,
        value: `${bonusValue}`,
      });
    } else if (bonus.target.type === 'Skill') {
      const skillName = bonus.target.name;
      const bonusValue = calculateBonusValue(sheet, bonus.modifier);

      skillSubSteps.push({
        name: subStepName,
        value: `${bonusValue} em ${skillName}`,
      });

      const newCompleteSkills = sheet.completeSkills?.map((sk) => {
        let value = sk.others ?? 0;

        if (sk.name === skillName) {
          value += bonusValue;
        }

        return { ...sk, others: value };
      });

      sheet = _.merge(sheet, {
        completeSkills: newCompleteSkills,
      });
    } else if (bonus.target.type === 'Displacement') {
      const bonusValue = calculateBonusValue(sheet, bonus.modifier);
      sheet.displacement += bonusValue;

      displacementSubSteps.push({
        name: subStepName,
        value: `${bonusValue}`,
      });
    } else if (bonus.target.type === 'MaxSpaces') {
      const bonusValue = calculateBonusValue(sheet, bonus.modifier);
      sheet.maxSpaces += bonusValue;

      displacementSubSteps.push({
        name: subStepName,
        value: `${bonusValue}`,
      });
    } else if (bonus.target.type === 'ArmorPenalty') {
      const bonusValue = calculateBonusValue(sheet, bonus.modifier);
      sheet.extraArmorPenalty += bonusValue;

      armorPenaltySubSteps.push({
        name: subStepName,
        value: `${bonusValue}`,
      });
    } else {
      console.warn('bonus não implementado', bonus);
    }
  });

  if (pvSubSteps.length) {
    sheet.steps.push({
      label: 'Atributos Extras',
      type: 'Bonus de PV',
      value: pvSubSteps,
    });
  }

  if (pmSubSteps.length) {
    sheet.steps.push({
      label: 'Atributos Extras',
      type: 'Bonus de PM',
      value: pmSubSteps,
    });
  }

  if (defSubSteps.length) {
    sheet.steps.push({
      label: 'Atributos Extras',
      type: 'Bonus de Defesa',
      value: defSubSteps,
    });
  }

  if (skillSubSteps.length) {
    sheet.steps.push({
      label: 'Atributos Extras',
      type: 'Bonus de Perícias',
      value: skillSubSteps,
    });
  }

  if (displacementSubSteps.length) {
    sheet.steps.push({
      label: 'Atributos Extras',
      type: 'Bonus de Deslocamento',
      value: displacementSubSteps,
    });
  }

  return sheet;
};

export default function generateRandomSheet(
  selectedOptions: SelectedOptions
): CharacterSheet {
  const targetLevel = selectedOptions.nivel;
  let powersGetters: PowersGetters = {
    Origem: [],
  };

  // Lista do passo-a-passo que deve ser populada
  const steps: Step[] = [];

  // Passo 1: Definir gênero
  const sexos = ['Homem', 'Mulher'] as ('Homem' | 'Mulher')[];
  const sexo = getRandomItemFromArray<'Homem' | 'Mulher'>(sexos);

  // Passo 2: Definir raça
  const { race, nome } = getRaceAndName(selectedOptions, sexo);

  if (race.name !== 'Golem') {
    steps.push({
      label: 'Gênero',
      value: [{ value: `${sexo === 'Homem' ? 'Masculino' : 'Feminino'}` }],
    });
  }

  steps.push(
    {
      label: 'Raça',
      value: [{ value: race.name }],
    },
    {
      label: 'Nome',
      value: [{ value: nome }],
    }
  );

  // Passo 3: Definir a classe
  const classe = selectClass(selectedOptions);

  steps.push({
    label: 'Classe',
    value: [{ value: classe.name }],
  });

  // Passo 4: Definir origem (se houver)
  let origin: Origin | undefined;

  if (race.name !== 'Golem') {
    if (selectedOptions.origin) {
      origin = ORIGINS[selectedOptions.origin as origins];
    } else {
      origin = getRandomItemFromArray(Object.values(ORIGINS));
    }
  }

  if (origin) {
    steps.push({
      label: 'Origem',
      value: [{ value: origin?.name }],
    });
  }

  // Passo 5: itens, feitiços, e valores iniciais
  const initialBag = getInitialBag(origin);
  const initialSpells: Spell[] = [];
  const initialPV = classe.pv;
  const initialPM = classe.pm;
  const initialDefense = 10;

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
      label: 'Equipamentos Iniciais e de Origem',
      value: [],
    }
  );

  // Passo 6: Gerar atributos finais
  const atributos = generateFinalAttributes(classe, race, steps);

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
    sexo,
    nivel: 1,
    atributos,
    maxSpaces,
    raca: race,
    classe,
    pv: summedPV,
    pm: initialPM,
    sheetBonuses: [], // TODO: I think this needs to be initialized already
    sheetActionHistory: [], // TODO: THINK this one can be empty and get filled later on apply powers. Remove comment if true
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
  };

  // Passo 9:
  // Gerar equipamento
  const classEquipments = getClassEquipments(classe);
  charSheet.bag.addEquipment(classEquipments);

  charSheet.steps.push({
    type: 'Equipamentos',
    label: 'Equipamentos da classe',
    value: [...Object.values(classEquipments).flat()].map((equip) => ({
      value: equip.nome,
    })),
  });

  // Passo 10:
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
        modAttr: attr.mod,
        others: armorPenalty > 0 ? armorPenalty * -1 : 0,
      };
    })
    .filter(
      (skill) =>
        !skill.name.startsWith('Of') ||
        (skill.name.startsWith('Of') && skill.training > 0)
    );

  // Passo 11:
  // Recalcular defesa
  charSheet = calcDefense(charSheet);

  // Passo 12: Gerar magias se possível
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

  // Passo 13: Aplicar modificadores de atributos
  charSheet = applyStatModifiers(charSheet);

  return charSheet;
}
