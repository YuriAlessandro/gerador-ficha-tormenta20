import { v4 as uuid } from 'uuid';
import _, { cloneDeep } from 'lodash';
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
  getRandomItemFromArray,
  mergeFaithProbabilities,
  pickFaith,
  pickFromArray,
  rollDice,
} from './randomUtils';
import todasProficiencias from '../data/proficiencias';
import { getOriginBenefits, ORIGINS } from '../data/origins';
import Equipment, { BagEquipments } from '../interfaces/Equipment';
import Divindade from '../interfaces/Divindade';
import GRANTED_POWERS from '../data/powers/grantedPowers';
import {
  allArcaneSpellsCircle1,
  arcaneSpellsCircle1,
} from '../data/magias/arcane';
import {
  allDivineSpellsCircle1,
  divineSpellsCircle1,
} from '../data/magias/divine';
import { Spell } from '../interfaces/Spells';
import {
  getRaceDisplacement,
  getRaceSize,
} from '../data/races/functions/functions';
import Origin from '../interfaces/Origin';
import {
  GeneralPowerType,
  OriginPower,
  PowerGetter,
  PowersGetters,
} from '../interfaces/Poderes';
import CharacterSheet, { Step, SubStep } from '../interfaces/CharacterSheet';
import Skill from '../interfaces/Skills';
import Bag from '../interfaces/Bag';
import roles from '../data/roles';
import { RoleNames } from '../interfaces/Role';

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
  const newValue =
    atributosModificados[selectedAttrName].value + attrDaRaca.mod;

  return {
    ...atributosModificados[selectedAttrName],
    value: newValue,
    mod: getModValue(newValue),
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
        value: `${attrDaRaca.mod > 0 ? `+` : ''}${attrDaRaca.mod}`,
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
      value: attr.value,
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
  if (selectedOptions.classe) {
    selectedClass = getClassByFilter(selectedOptions);
  }

  if (!selectedClass) selectedClass = getRandomItemFromArray(CLASSES);
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
        label: `Benefícios da orígem (${origin.name})`,
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
  classe: ClassDescription
) {
  if (todosPoderes) {
    if (divindade.name === DivindadeEnum.THYATIS.name) {
      return getThyatisPowers(classe);
    }

    return [...divindade.poderes];
  }

  return [getRandomItemFromArray(divindade.poderes)];
}

// Retorna se é devoto e qual a divindade
function getReligiosidade(
  classe: ClassDescription,
  race: Race
): CharacterReligion | undefined {
  const isDevoto = Math.random() <= classe.probDevoto;
  if (!isDevoto) {
    return undefined;
  }

  const classFaithProbability =
    classe.faithProbability || standardFaithProbability;
  const raceFaithProbability =
    race.faithProbability || standardFaithProbability;

  const faithProbability = mergeFaithProbabilities(
    classFaithProbability,
    raceFaithProbability
  );

  const divindadeName = pickFaith(faithProbability);
  const divindade = DivindadeEnum[divindadeName];

  const todosPoderes = classe.qtdPoderesConcedidos === 'all';
  const poderes = getPoderesConcedidos(divindade, todosPoderes, classe);

  return { divindade, poderes };
}

function getNewSpells(classe: ClassDescription, usedSpells: Spell[]): Spell[] {
  const { spellPath } = classe;
  if (!spellPath) return [];

  // TODO: enable picking spells from other circles besides c1 for higher levels
  const { initialSpells, schools, spellType } = spellPath;
  let spellList =
    spellType === 'Arcane' ? allArcaneSpellsCircle1 : allDivineSpellsCircle1;

  if (schools) {
    if (spellType === 'Arcane') {
      spellList = schools.flatMap((school) => arcaneSpellsCircle1[school]);
    } else {
      spellList = schools.flatMap((school) => divineSpellsCircle1[school]);
    }
  }

  const filteredSpellList = spellList.filter(
    (spell) => !usedSpells.find((usedSpell) => usedSpell.nome === spell.nome)
  );

  const selectedSpells = pickFromArray(filteredSpellList, initialSpells);
  return selectedSpells;
}

function calcDisplacement(
  bag: Bag,
  raceDisplacement: number,
  atributos: CharacterAttributes,
  baseDisplacement: number
): number {
  const maxWeight = atributos.Força.value * 3;

  if (bag.getWeight() > maxWeight) {
    return raceDisplacement - 3;
  }

  return raceDisplacement + baseDisplacement;
}

export function applyRaceAbilities(sheet: CharacterSheet): CharacterSheet {
  let sheetClone = _.cloneDeep(sheet);
  const subSteps: { name: string; value: string }[] = [];

  sheetClone = (sheetClone.raca.abilities || []).reduce(
    (acc, ability) => (ability.action ? ability.action(acc, subSteps) : acc),
    sheetClone
  );

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
  const subSteps: { name: string; value: string }[] = [];

  sheetClone = (sheetClone.devoto?.poderes || []).reduce(
    (acc, power) => (power.action ? power.action(acc, subSteps) : acc),
    sheetClone
  );
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
  const subSteps: { name: string; value: string }[] = [];

  sheetClone = (sheetClone.classe.abilities || []).reduce(
    (acc, ability) => (ability.action ? ability.action(acc, subSteps) : acc),
    sheetClone
  );
  if (subSteps.length) {
    sheetClone.steps.push({
      type: 'Poderes',
      label: 'Habilidades de Classe',
      value: subSteps,
    });
  }

  return sheetClone;
}

function applyGeneralPowers(sheet: CharacterSheet): CharacterSheet {
  let sheetClone = _.cloneDeep(sheet);
  const subSteps: { name: string; value: string }[] = [];

  sheetClone = (sheetClone.generalPowers || []).reduce((acc, power) => {
    // Se for Poder da Tormenta, remover 2 de Carisma
    if (power.type === GeneralPowerType.TORMENTA) {
      sheetClone.atributos.Carisma.value -= 1;
      subSteps.push({
        name: power.name,
        value: 'Perdeu 1 de Carisma',
      });
    }
    return power.action ? power.action(acc, subSteps) : acc;
  }, sheetClone);

  // Recalcular mod de carisma
  sheetClone.atributos.Carisma.mod = getModValue(
    sheetClone.atributos.Carisma.value
  );

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
  const sheetClone = cloneDeep(sheet);

  const subSteps: SubStep[] = [];

  powersGetters.Origem.forEach((addPower) => {
    addPower(sheetClone, subSteps);
  });

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

export default function generateRandomSheet(
  selectedOptions: SelectedOptions
): CharacterSheet {
  const level = 1;
  let powersGetters: PowersGetters = {
    Origem: [],
  };

  // Lista do passo-a-passo que deve ser populada
  const steps: Step[] = [];

  // Passo 1: Definir sexo
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
    origin = getRandomItemFromArray(Object.values(ORIGINS));
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
      label: 'Equipamentos Inciais e de Origem',
      value: [],
    }
  );

  // Passo 6: Gerar atributos finais
  const atributos = generateFinalAttributes(classe, race, steps);

  // Passo 6.1: Gerar valores dependentes de atributos
  const maxWeight = atributos.Força.value * 3;
  const summedPV = initialPV + atributos.Constituição.mod;

  steps.push({
    label: 'Vida máxima (+CON)',
    value: [{ value: summedPV }],
  });

  // Passo 7: Escolher se vai ser devoto, e se for o caso puxar uma divindade
  const devote = getReligiosidade(classe, race);

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
    nivel: level,
    atributos,
    maxWeight,
    raca: race,
    classe,
    pv: summedPV,
    pm: initialPM,
    defesa: initialDefense,
    bag: initialBag,
    devoto: devote,
    origin: sheetOrigin,
    displacement: 0,
    size: getRaceSize(race),
    generalPowers: [],
    steps,
    skills,
    spells: initialSpells,
  };

  // Passo 9:
  // Gerar poderes restantes, e aplicar habilidades, e poderes
  charSheet = getAndApplyPowers(charSheet, powersGetters);

  // Passo 10:
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

  // Passo 11:
  // Recalcular defesa
  charSheet = calcDefense(charSheet);

  // Passo 12: Gerar magias se possível
  const newSpells = getNewSpells(charSheet.classe, charSheet.spells);
  charSheet.spells.push(...newSpells);

  if (newSpells.length) {
    charSheet.steps.push({
      label: 'Magias (1º círculo)',
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

  // (enquanto nível atual < nivel desejado) {
  //   Aumentar PV e PM
  //   Seguir spell path
  //   Pra cada poder em poderes:
  //       sheet, poder -> sheet // atualiza a ficha pra o nível atual pelos poderes que modificam ao upar
  //   nivel, classe, poderesgerais -> escolher poder novo aleatorio
  //   sheet, poder novo -> sheet
  // }

  return charSheet;
}
