import { v4 as uuid } from 'uuid';
import _ from 'lodash';
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
  DEFAULT_BAG,
  Armaduras,
  Escudos,
  updateEquipments,
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
import Equipment, { Bag, BagEquipments } from '../interfaces/Equipment';
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
import { GeneralPower, OriginPower } from '../interfaces/Poderes';
import CharacterSheet, { Step } from '../interfaces/CharacterSheet';
import Skill from '../interfaces/Skills';
import { setupSpell } from '../data/magias/generalSpells';

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
  const values: { nome: string; valor: string | number }[] = [];
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
        nome: selectedAttrName,
        valor: `${attrDaRaca.mod > 0 ? `+` : ''}${attrDaRaca.mod}`,
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

  const finalAttrs = modifyAttributesBasedOnRace(
    race,
    charAttributes,
    classe.attrPriority,
    steps
  );

  steps.push({
    label: 'Atributos iniciais',
    type: 'Atributos',
    value: Object.values(charAttributes).map((attr) => ({
      nome: attr.name,
      valor: attr.value,
    })),
  });
  // sort and return
  return Object.values(Atributo).reduce(
    (acc, attr) => ({
      ...acc,
      [attr]: finalAttrs[attr],
    }),
    {} as CharacterAttributes
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

export function selectClass(
  selectedOptions: SelectedOptions
): ClassDescription {
  let selectedClass: ClassDescription | undefined;
  if (selectedOptions.classe) {
    selectedClass = CLASSES.find(
      (currentClasse) => currentClasse.name === selectedOptions.classe
    );
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
  powers: { origin: OriginPower[]; general: GeneralPower[] };
} {
  let powers: { origin: OriginPower[]; general: GeneralPower[] } = {
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

    if (originSkills.length) {
      steps.push({
        label: 'Perícias da origem',
        type: 'Perícias',
        value: originSkills.map((skill) => ({ valor: `${skill}` })),
      });
    }

    steps.push({
      label: 'Poderes da origem',
      value: [],
    });

    powers = originPowers;
    usedSkills.push(...originSkills);
  }

  const remainingSkills = getRemainingSkills(usedSkills, classe);
  usedSkills.push(...remainingSkills);

  const classSkills = [...classBaseSkills, ...remainingSkills];
  steps.push({
    label: 'Perícias da classe',
    type: 'Perícias',
    value: classSkills.map((skill) => ({ valor: `${skill}` })),
  });

  const attributesSkills = getAttributesSkills(attributes, usedSkills);

  if (attributesSkills.length) {
    steps.push({
      label: 'Perícias (+INT)',
      type: 'Perícias',
      value: attributesSkills.map((skill) => ({ valor: `${skill}` })),
    });
  }

  usedSkills.push(...attributesSkills);

  return {
    skills: usedSkills,
    powers,
  };
}
function getWeapons(classe: ClassDescription) {
  const weapons = [];

  weapons.push(getRandomItemFromArray(EQUIPAMENTOS.armasSimples));

  if (classe.proeficiencias.includes(todasProficiencias.MARCIAIS)) {
    weapons.push(getRandomItemFromArray(EQUIPAMENTOS.armasMarciais));
  }

  return weapons;
}

function getShields(classe: ClassDescription) {
  const shields = [];
  if (classe.proeficiencias.includes(todasProficiencias.ESCUDOS)) {
    shields.push(Escudos.ESCUDOLEVE);
  }

  return shields;
}

function getArmors(classe: ClassDescription) {
  const armors = [];
  if (classe.proeficiencias.includes(todasProficiencias.PESADAS)) {
    armors.push(Armaduras.BRUNEA);
  } else if (classe.name !== 'Arcanista') {
    armors.push(getRandomItemFromArray(EQUIPAMENTOS.armadurasLeves));
  }

  return armors;
}

function getInitialEquipments(
  bagEquipments: BagEquipments,
  classe: ClassDescription
): BagEquipments {
  const newBagEquipments: BagEquipments = { ...bagEquipments };

  const weapons = getWeapons(classe);
  const shields = getShields(classe);
  const armors = getArmors(classe);

  return {
    ...newBagEquipments,
    Arma: weapons,
    Escudo: shields,
    Armadura: armors,
  };
}

function getInitialBag(origin: Origin | undefined): Bag {
  // 6.1 A depender da classe os itens podem variar
  const bag: Bag = _.cloneDeep(DEFAULT_BAG);

  const initialMoney = rollDice(4, 6, 0);
  bag.equipments['Item Geral'].push({
    nome: `T$ ${initialMoney}`,
    group: 'Item Geral',
  });

  origin?.itens.forEach((equip) => {
    if (typeof equip.equipment === 'string') {
      const newEquip: Equipment = {
        nome: `${equip.qtd ? `${equip.qtd}x ` : ''}${equip.equipment}`,
        group: 'Item Geral',
      };
      bag.equipments['Item Geral'].push(newEquip);
    } else {
      // É uma arma
      bag.equipments.Arma.push(equip.equipment);
    }
  });

  return bag;
}

function getThyatisPowers() {
  const unrestrictedPowers = DivindadeEnum.THYATIS.poderes.filter(
    (poder) =>
      poder.name !== GRANTED_POWERS.DOM_DA_IMORTALIDADE.name &&
      poder.name !== GRANTED_POWERS.DOM_DA_RESSUREICAO.name
  );

  const randomRestricted = getRandomItemFromArray([
    GRANTED_POWERS.DOM_DA_IMORTALIDADE,
    GRANTED_POWERS.DOM_DA_RESSUREICAO,
  ]);

  return [...unrestrictedPowers, randomRestricted];
}

// Retorna a lista de poderes concedidos de uma divindade
function getPoderesConcedidos(divindade: Divindade, todosPoderes: boolean) {
  if (todosPoderes) {
    if (divindade.name === DivindadeEnum.THYATIS.name) {
      return getThyatisPowers();
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
  const poderes = getPoderesConcedidos(divindade, todosPoderes);

  return { divindade, poderes };
}

function getSpells(classe: ClassDescription, usedSpells: Spell[]): Spell[] {
  const { spellPath } = classe;
  if (!spellPath) return usedSpells;

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

  return selectedSpells.map((spell) => setupSpell(spell));
}

function calcDisplacement(
  bag: Bag,
  raceDisplacement: number,
  atributos: CharacterAttributes
): number {
  const maxWeight = atributos.Força.value * 3;

  if (bag.weight > maxWeight) {
    return raceDisplacement - 3;
  }

  return raceDisplacement;
}

export function applyRaceHabilities(sheet: CharacterSheet): CharacterSheet {
  const sheetClone = _.cloneDeep(sheet);

  return (sheetClone.raca.abilities || []).reduce(
    (acc, ability) => (ability.action ? ability.action(acc) : acc),
    sheetClone
  );
}

function applyDivinePowers(sheet: CharacterSheet): CharacterSheet {
  const sheetClone = _.cloneDeep(sheet);

  return (sheetClone.devoto?.poderes || []).reduce(
    (acc, power) => (power.action ? power.action(acc) : acc),
    sheetClone
  );
}

function applyClassHabilities(sheet: CharacterSheet): CharacterSheet {
  const sheetClone = _.cloneDeep(sheet);

  return (sheetClone.classe.abilities || []).reduce(
    (acc, ability) => (ability.action ? ability.action(acc) : acc),
    sheetClone
  );
}

function applyGeneralPowers(sheet: CharacterSheet): CharacterSheet {
  const sheetClone = _.cloneDeep(sheet);

  return (sheetClone.generalPowers || []).reduce(
    (acc, power) => (power.action ? power.action(acc) : acc),
    sheetClone
  );
}

function getAndApplyPowers(sheet: CharacterSheet): CharacterSheet {
  // Aplicar poderes de divindade
  let updatedSheet = applyDivinePowers(sheet);

  // Aplicar habilidades da raça
  updatedSheet = applyRaceHabilities(sheet);

  // Aplicar habilidades da classe
  updatedSheet = applyClassHabilities(sheet);

  // Aplicar poderes gerais da origem
  updatedSheet = applyGeneralPowers(sheet);

  return updatedSheet;
}

export default function generateRandomSheet(
  selectedOptions: SelectedOptions
): CharacterSheet {
  const level = 1;

  // Lista do passo-a-passo que deve ser populada
  const steps = [];

  // Passo 1: Definir sexo
  const sexos = ['Homem', 'Mulher'] as ('Homem' | 'Mulher')[];
  const sexo = getRandomItemFromArray<'Homem' | 'Mulher'>(sexos);

  // Passo 2: Definir raça
  const { race, nome } = getRaceAndName(selectedOptions, sexo);

  if (race.name !== 'Golem') {
    steps.push({
      label: 'Sexo',
      value: [{ valor: sexo }],
    });
  }

  steps.push(
    {
      label: 'Raça',
      value: [{ valor: race.name }],
    },
    {
      label: 'Nome',
      value: [{ valor: nome }],
    }
  );

  // Passo 3: Definir a classe
  const classe = selectClass(selectedOptions);

  steps.push({
    label: 'Classe',
    value: [{ valor: classe.name }],
  });

  // Passo 4: Definir origem (se houver)
  let origin: Origin | undefined;
  if (race.name !== 'Golem') {
    origin = getRandomItemFromArray(Object.values(ORIGINS));
  }

  if (origin) {
    steps.push({
      label: 'Origem',
      value: [{ valor: origin?.name }],
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
      value: [{ valor: initialPV }],
    },
    {
      label: 'PM Inicial',
      value: [{ valor: initialPM }],
    },
    {
      label: 'Defesa Inicial',
      value: [{ valor: initialDefense }],
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
    value: [{ valor: summedPV }],
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
  const { powers, skills } = getSkillsAndPowersByClassAndOrigin(
    classe,
    origin,
    atributos,
    steps
  );

  let sheetOrigin;
  if (origin) {
    sheetOrigin = {
      name: origin.name,
      powers: powers.origin,
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
    generalPowers: [...powers.general],
    steps,
    skills,
    spells: initialSpells,
  };

  // Passo 9:
  // Gerar poderes restantes, e aplicar habilidades, e poderes
  charSheet = getAndApplyPowers(charSheet);

  steps.push({
    label: 'Gera habilidades de classe e raça',
    value: [],
  });

  // Passo 10:
  // Gerar equipamento
  const bagEquipments = getInitialEquipments(charSheet.bag.equipments, classe);
  const updatedBag = updateEquipments(charSheet.bag, bagEquipments);
  charSheet.bag = updatedBag;

  steps.push({
    label: 'Equipamentos da classe',
    value: [],
  });

  // Passo 11:
  // Recalcular defesa
  charSheet = calcDefense(charSheet);

  steps.push({
    label: 'Nova defesa',
    value: [{ valor: charSheet.defesa }],
  });

  // Passo 12: Gerar magias se possível
  const spells = getSpells(charSheet.classe, charSheet.spells);
  charSheet.spells = spells;

  if (spells.length) {
    steps.push({
      label: 'Magias (1º círculo)',
      value: [],
    });
  }

  const displacement = calcDisplacement(
    charSheet.bag,
    getRaceDisplacement(charSheet.raca),
    charSheet.atributos
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
