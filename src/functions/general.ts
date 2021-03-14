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
import Race, { CharacterStats, RaceAttributeAbility } from '../interfaces/Race';
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

const STEPS: Step[] = [
  {
    label: 'Atributos Iniciais',
    type: 'Atributos',
    value: [
      { nome: 'Força', valor: 17 },
      { nome: 'Destreza', valor: 17 },
      { nome: 'Constituição', valor: 17 },
      { nome: 'Inteligência', valor: 17 },
      { nome: 'Sabedoria', valor: 17 },
      { nome: 'Carisma', valor: 17 },
    ],
  },
  {
    label: 'Gênero',
    value: [{ valor: 'Mulher' }],
  },
  {
    label: 'Raça',
    value: [{ valor: 'Elfo' }],
  },
  {
    label: 'Nome',
    value: [{ valor: 'Rapunzel' }],
  },
  {
    label: 'Classe',
    value: [{ valor: 'Ladino' }],
  },
  {
    label: 'Origem',
    value: [{ valor: 'Mercador' }],
  },
  {
    label: 'PV Inicial',
    value: [{ valor: 10 }],
  },
  {
    label: 'PM Inicial',
    value: [{ valor: 10 }],
  },
  {
    label: 'Atributos modificados',
    type: 'Atributos',
    value: [
      { nome: 'Força', valor: '+2' },
      { nome: 'Constituição', valor: '+2' },
      { nome: 'Sabedoria', valor: '+2' },
    ],
  },
  {
    label: 'Defesa Inicial',
    value: [{ valor: 10 }],
  },
  {
    label: 'Perícias Treinadas',
    value: [{ valor: 'Igual a da ficha' }],
  },
  {
    type: 'Equipamentos',
    label: 'Equipamentos iniciais',
    value: [{ nome: 'Armadura', valor: '+2 Defesa' }],
  },
  {
    label: 'Poderes de Raça',
    type: 'Poderes',
    value: [
      { nome: 'Poder de Elfo', valor: '+2 em carisma' },
      { nome: 'Poder de Elfo', valor: '' },
      { nome: 'Poder de Elfo', valor: '' },
    ],
  },
  {
    label: 'Poderes de Classe',
    type: 'Poderes',
    value: [
      { nome: 'Poder de Ladino', valor: '' },
      { nome: 'Poder de Ladino', valor: '+2 em Ladinagem' },
    ],
  },
  {
    label: 'Poderes de Origem',
    type: 'Poderes',
    value: [
      { nome: 'Poder de Mercador', valor: '' },
      { nome: 'Poder de Mercador', valor: '' },
    ],
  },
  {
    label: 'Magias Iniciais',
    value: [],
  },
];

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

function getNotRepeatedAttribute(atributosModificados: string[]) {
  const atributosPermitidos = Object.values(Atributo).filter(
    (atributo) => !atributosModificados.includes(atributo)
  );

  return getRandomItemFromArray<Atributo>(atributosPermitidos);
}

function selectAttributeToChange(
  atributosModificados: string[],
  atributo: RaceAttributeAbility
) {
  if (atributo.attr === 'any') {
    return getNotRepeatedAttribute(atributosModificados);
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
  atributosRolados: CharacterAttributes
): CharacterAttributes {
  const reducedAttrs = raca.attributes.attrs.reduce<ReduceAttributesParams>(
    ({ atributos, nomesDosAtributosModificados }, attrDaRaca) => {
      // Definir que atributo muda (se for any é um random)
      const selectedAttrName = selectAttributeToChange(
        nomesDosAtributosModificados,
        attrDaRaca
      );

      const atributoModificado = getModifiedAttribute(
        selectedAttrName,
        atributos,
        attrDaRaca
      );

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

  return reducedAttrs.atributos;
}

function generateFinalAttributes(
  atributosNumericos: number[],
  classe: ClassDescription,
  race: Race
) {
  // TODO: Invés de mapear cada valor para cada atributo na ordem, utilizar ordem de preferência da classe

  const charAttributes = Object.values(Atributo).reduce((acc, attr, index) => {
    const mod = getModValue(atributosNumericos[index]);
    return {
      ...acc,
      [attr]: { name: attr, value: atributosNumericos[index], mod },
    };
  }, {}) as CharacterAttributes;

  return modifyAttributesBasedOnRace(race, charAttributes);
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
  attributes: CharacterAttributes
): {
  skills: Skill[];
  powers: { origin: OriginPower[]; general: GeneralPower[] };
} {
  let powers: { origin: OriginPower[]; general: GeneralPower[] } = {
    origin: [],
    general: [],
  };

  const usedSkills: Skill[] = [];
  usedSkills.push(...getClassBaseSkills(classe));
  if (origin) {
    const { skills: originSkills, powers: originPowers } = getOriginBenefits(
      usedSkills,
      origin
    );
    powers = originPowers;
    usedSkills.push(...originSkills);
  }

  usedSkills.push(...getRemainingSkills(usedSkills, classe));
  usedSkills.push(...getAttributesSkills(attributes, usedSkills));

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

export function applyRaceHabilities(
  race: Race,
  stats: CharacterStats
): CharacterStats {
  const statsClone = _.cloneDeep(stats);

  return (race.abilities || []).reduce(
    (acc, ability) => (ability.action ? ability.action(acc) : acc),
    statsClone
  );
}

// TODO: Implement this
function getAndApplyPowers(sheet: CharacterSheet): CharacterSheet {
  return sheet;
}

export default function generateRandomSheet(
  selectedOptions: SelectedOptions
): CharacterSheet {
  const level = 1;

  // Lista do passo-a-passo que deve ser populada
  const steps = STEPS;

  // Passo 1: Gerar os atributos base desse personagem
  const atributosNumericos = rollAttributeValues();

  // Passo 1.1: Definir sexo
  const sexos = ['Homem', 'Mulher'] as ('Homem' | 'Mulher')[];
  const sexo = getRandomItemFromArray<'Homem' | 'Mulher'>(sexos);

  // Passo 2: Definir raça
  const { race, nome } = getRaceAndName(selectedOptions, sexo);

  // Passo 3: Definir a classe
  const classe = selectClass(selectedOptions);

  // Passo 4: Definir origem (se houver)
  let origin: Origin | undefined;
  if (race.name !== 'Golem') {
    origin = getRandomItemFromArray(Object.values(ORIGINS));
  }

  // Passo 5: itens, feitiços, e valores iniciais
  const initialBag = getInitialBag(origin);
  const initialSpells: Spell[] = [];
  const initialPV = classe.pv;
  const initialPM = classe.pm;
  const initialDefense = 10;

  // Passo 6: Gerar atributos finais
  const atributos = generateFinalAttributes(atributosNumericos, classe, race);

  // Passo 6.1: Gerar valores dependentes de atributos
  const maxWeight = atributos.Força.value * 3;
  const summedPV = initialPV + atributos.Constituição.mod;

  // Passo 7: Escolher se vai ser devoto, e se for o caso puxar uma divindade
  const devote = getReligiosidade(classe, race);

  // Passo 8: Gerar pericias treinadas
  const { powers, skills } = getSkillsAndPowersByClassAndOrigin(
    classe,
    origin,
    atributos
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

  // Passo 10:
  // Gerar equipamento
  const bagEquipments = getInitialEquipments(charSheet.bag.equipments, classe);
  const updatedBag = updateEquipments(charSheet.bag, bagEquipments);
  charSheet.bag = updatedBag;

  // Passo 11:
  // Recalcular defesa
  charSheet = calcDefense(charSheet);

  // Passo 12: Gerar magias se possível
  const spells = getSpells(charSheet.classe, charSheet.spells);
  charSheet.spells = spells;

  const displacement = calcDisplacement(
    charSheet.bag,
    getRaceDisplacement(charSheet.raca),
    charSheet.atributos
  );
  charSheet.displacement = displacement;

  return charSheet;
}
