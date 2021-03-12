import { v4 as uuid } from 'uuid';
import { Atributo } from '../data/atributos';
import RACAS, { getRaceByName } from '../data/racas';
import CLASSES from '../data/classes';
import PERICIAS, {
  getClassBaseSkills,
  getNotRepeatedRandomSkill,
  getRemainingSkills,
} from '../data/pericias';
import EQUIPAMENTOS, {
  calcDefense,
  DEFAULT_BAG,
  Armaduras,
  Escudos,
} from '../data/equipamentos';
import { standardFaithProbability, DivindadeEnum } from '../data/divindades';
import { generateRandomName } from '../data/nomes';
import CharacterSheet, {
  CharacterAttribute,
  CharacterAttributes,
  CharacterReligion,
} from '../interfaces/CharacterSheet';
import Race, { RaceAttributeHability } from '../interfaces/Race';
import { ClassDescription } from '../interfaces/Class';
import SelectedOptions from '../interfaces/SelectedOptions';
import {
  getRandomItemFromArray,
  mergeFaithProbabilities,
  pickFaith,
  pickFromArray,
} from './randomUtils';
import todasProficiencias from '../data/proficiencias';
import { getOriginBenefits, ORIGINS } from '../data/origins';
import { Bag, BagEquipments } from '../interfaces/Equipment';
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

export function getModValue(attr: number): number {
  return Math.floor(attr / 2) - 5;
}

function getRandomArbitrary(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min);
}
// function getRandomPer() {
//   const keys = Object.keys(PERICIAS);
//   return getRandomItemFromArray(keys);
// }

function getNotRepeatedAttribute(atributosModificados: string[]) {
  const atributosPermitidos = Object.values(Atributo).filter(
    (atributo) => !atributosModificados.includes(atributo)
  );

  return getRandomItemFromArray<Atributo>(atributosPermitidos);
}

function selectAttributeToChange(
  atributosModificados: string[],
  atributo: RaceAttributeHability
) {
  if (atributo.attr === 'any') {
    return getNotRepeatedAttribute(atributosModificados);
  }

  return atributo.attr;
}

function getModifiedAttribute(
  selectedAttrName: Atributo,
  atributosModificados: CharacterAttributes,
  attrDaRaca: RaceAttributeHability
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
  const reducedAttrs = raca.habilites.attrs.reduce<ReduceAttributesParams>(
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

export function getClassDetailsModifiedByRace(
  { pv, pm, defesa }: { pv: number; pm: number; defesa: number },
  raca: Race
): { pv: number; pm: number; defesa: number } {
  return raca.habilites.other.reduce(
    (caracteristicas, item) => {
      if (item.type === 'pv' && item.mod) {
        return {
          ...caracteristicas,
          pv: pv + item.mod,
        };
      }

      if (item.type === 'pm' && item.mod) {
        return {
          ...caracteristicas,
          pm: pm + item.mod,
        };
      }
      if (item.type === 'defesa' && item.mod) {
        return {
          ...caracteristicas,
          defesa: defesa + item.mod,
        };
      }

      return caracteristicas;
    },
    { pv, pm, defesa }
  );
}

function getInitialPV(pv: number, constAttr: CharacterAttribute | undefined) {
  if (constAttr) {
    return pv + constAttr?.mod ?? 0;
  }
  return pv;
}

function getInitialDef(destAttr: CharacterAttribute | undefined) {
  const baseDef = 10;

  if (destAttr) {
    return baseDef + destAttr?.mod ?? 0;
  }

  return baseDef;
}

function selectRace(selectedOptions: SelectedOptions): Race {
  if (selectedOptions.raca) {
    return getRaceByName(selectedOptions.raca);
  }

  return getRaceByName(getRandomItemFromArray(RACAS).name);
}

function getRaceAndRaceStats(
  selectedOptions: SelectedOptions,
  atributosRolados: CharacterAttributes,
  sex: 'Homem' | 'Mulher'
) {
  // Passo 2.2: Escolher raça
  const race = selectRace(selectedOptions);
  // Passo 2.2: Cada raça pode modificar atributos, isso será feito aqui
  const atributos = modifyAttributesBasedOnRace(race, atributosRolados);
  // Passo 2.3: Definir nome
  const nome = generateRandomName(race, sex);

  return { atributos, nome, race };
}

function selectClass(selectedOptions: SelectedOptions): ClassDescription {
  let selectedClass;
  if (selectedOptions.classe) {
    selectedClass = CLASSES.find(
      (currentClasse) => currentClasse.name === selectedOptions.classe
    );
  }

  if (!selectedClass) selectedClass = getRandomItemFromArray(CLASSES);
  if (selectedClass.setup) return selectedClass.setup(selectedClass);
  return selectedClass;
}

function getSkillsAndPowers(
  classe: ClassDescription,
  origin: Origin,
  race: Race,
  atributos: CharacterAttributes
): { skills: string[]; powers: { origin: (GeneralPower | OriginPower)[] } } {
  const skills: string[] = [];

  skills.push(...getClassBaseSkills(classe));

  const { skills: originSkills, powers: originPowers } = getOriginBenefits(
    origin,
    skills
  );

  skills.push(...originSkills);

  skills.push(...getRemainingSkills(skills, classe));

  return {
    skills,
    powers: {
      origin: originPowers,
    },
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

function getInitialBag(classe: ClassDescription): Bag {
  // 6.1 A depender da classe os itens podem variar
  const bag: Bag = DEFAULT_BAG;

  // TODO: Initial cash

  const bagEquipments = getInitialEquipments(bag.equipments, classe);
  bag.updateEquipments(bag, bagEquipments);

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

function getSpells(classe: ClassDescription): Spell[] {
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

  return pickFromArray(spellList, initialSpells);
}

function calcDisplacement(
  bag: Bag,
  race: Race,
  atributos: CharacterAttributes
): number {
  const raceDisplacement = getRaceDisplacement(race);
  const maxWeight = atributos.Força.value * 3;

  if (bag.weight > maxWeight) {
    return raceDisplacement - 3;
  }

  return raceDisplacement;
}

export default function generateRandomSheet(
  selectedOptions: SelectedOptions
): CharacterSheet {
  const nivel = 1;

  // Passo 1: Gerar os atributos base desse personagem
  const atributosRolados = Object.values(Atributo).reduce((acc, atributo) => {
    const randomAttr = getRandomArbitrary(8, 18);
    const mod = getModValue(randomAttr);
    return { ...acc, [atributo]: { name: atributo, value: randomAttr, mod } };
  }, {});
  // Passo 1.1: Definir sexo
  const sexos = ['Homem', 'Mulher'] as ('Homem' | 'Mulher')[];
  const sexo = getRandomItemFromArray<'Homem' | 'Mulher'>(sexos);

  // Passo 2: Definir raça
  const { race, atributos, nome } = getRaceAndRaceStats(
    selectedOptions,
    atributosRolados as CharacterAttributes,
    sexo
  );

  // Passo 3: Definir a classe
  const classe = selectClass(selectedOptions);
  // Passo 3.1: Determinando o PV baseado na classe
  const constAttr = atributos.Constituição;
  const pvInicial = getInitialPV(classe.pv, constAttr);

  // Passo 3.2: Determinando o PM baseado na classe
  const { pm: pmInicial } = classe;

  // Passo 3.3: Determinando a Defesa inicial
  const destAttr = atributos.Destreza;
  const initialDefense = getInitialDef(destAttr);

  // Passo 3.4: Alterar características da classe com base na raça
  const classDetails = {
    pv: pvInicial,
    pm: pmInicial,
    defesa: initialDefense,
    pericias: [],
  };

  const classDetailsModifiedByRace = getClassDetailsModifiedByRace(
    classDetails,
    race
  );

  // Passo 4: Definição de origem
  const origin = getRandomItemFromArray(Object.values(ORIGINS));

  // Passo 5: Marcar as perícias treinadas
  // 5.1: Definir perícias da classe
  const {
    powers: { origin: originPowers },
    skills,
  } = getSkillsAndPowers(classe, origin, race, atributos);

  // Passo 6: Definição de itens iniciais
  const bag = getInitialBag(classe);
  // 6.1: Incrementar defesa com base nos Equipamentos
  const defense = calcDefense(classDetails.defesa, bag);

  // Passo 7: Escolher se vai ser devoto, e se for o caso puxar uma divindade
  const devoto = getReligiosidade(classe, race);

  // Passo 8: Gerar magias se possível
  const spells = getSpells(classe);

  // Passo 9: Recuperar deslocamento e tamanho com base na Raça, Atributos e Equipamentos
  const displacement = calcDisplacement(bag, race, atributos);
  const size = getRaceSize(race);

  // Passo 10: Calcular o peso máximo com base na força
  const maxWeight = atributos.Força.value * 3;

  return {
    id: uuid(),
    nome,
    sexo,
    nivel,
    atributos,
    maxWeight,
    raca: race,
    classe,
    pericias: skills,
    pv: classDetailsModifiedByRace.pv,
    pm: classDetailsModifiedByRace.pm,
    defesa: defense,
    bag,
    devoto,
    origin: {
      name: origin.name,
      powers: originPowers,
    },
    spells,
    displacement,
    size,
  };
}
