import { v4 as uuid } from 'uuid';
import ATRIBUTOS from '../data/atributos';
import RACAS, { getRaceByName } from '../data/racas';
import CLASSES from '../data/classes';
import PERICIAS from '../data/pericias';
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
  CharacterReligion,
} from '../interfaces/CharacterSheet';
import Race, { RaceHability } from '../interfaces/Race';
import { BasicExpertise, ClassDescription } from '../interfaces/Class';
import SelectedOptions from '../interfaces/SelectedOptions';
import {
  getRandomItemFromArray,
  mergeFaithProbabilities,
  pickFaith,
  pickFromArray,
  removeDup,
} from './randomUtils';
import todasProficiencias from '../data/proficiencias';
import origins from '../data/origins';
import { GeneralPower, OriginPower } from '../interfaces/Poderes';
import originPowers from '../data/powers/originPowers';
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

export function getModValues(attr: number): number {
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
  const atributosPermitidos = ATRIBUTOS.filter(
    (atributo) => !atributosModificados.includes(atributo)
  );
  return getRandomItemFromArray<string>(atributosPermitidos);
}

function selectAttributeToChange(
  atributosModificados: string[],
  atributo: RaceHability
) {
  if (atributo.attr === 'any') {
    return getNotRepeatedAttribute(atributosModificados);
  }

  return atributo.attr;
}

function getModifiedAttribute(
  selectedAttrIndex: number,
  atributosModificados: CharacterAttribute[],
  attrDaRaca: RaceHability
) {
  const atributoParaAlterar = atributosModificados[selectedAttrIndex];
  const newValue = atributoParaAlterar.value + attrDaRaca.mod;

  return {
    [selectedAttrIndex]: {
      ...atributoParaAlterar,
      value: newValue,
      mod: getModValues(newValue),
    },
  };
}

interface ReduceAttributesParams {
  atributosModificados: CharacterAttribute[];
  nomesDosAtributosModificados: string[];
}

export function modifyAttributesBasedOnRace(
  raca: Race,
  atributos: CharacterAttribute[]
): CharacterAttribute[] {
  const reducedAttrs = raca.habilites.attrs.reduce<ReduceAttributesParams>(
    (
      {
        atributosModificados: atributosAcumulados,
        nomesDosAtributosModificados,
      },
      attrDaRaca
    ) => {
      // Definir que atributo muda (se for any é um random)
      const selectedAttrName = selectAttributeToChange(
        nomesDosAtributosModificados,
        attrDaRaca
      );

      const selectedAttrIndex = atributosAcumulados.findIndex(
        (attr) => attr.name === selectedAttrName
      );

      return {
        atributosModificados: Object.assign(
          [],
          atributosAcumulados,
          getModifiedAttribute(
            selectedAttrIndex,
            atributosAcumulados,
            attrDaRaca
          )
        ),
        nomesDosAtributosModificados: [
          ...nomesDosAtributosModificados,
          selectedAttrName,
        ],
      };
    },
    {
      atributosModificados: atributos,
      nomesDosAtributosModificados: [],
    }
  );

  return reducedAttrs.atributosModificados;
}

function getNotRepeatedRandomPer(periciasUsadas: string[]) {
  const keys = Object.keys(PERICIAS);
  const periciasPermitidas = keys.filter((pericia) => {
    const stringPericia = PERICIAS[pericia] as string;
    return !periciasUsadas.includes(stringPericia);
  });
  return getRandomItemFromArray(periciasPermitidas);
}

interface ClassDetails {
  pv: number;
  pm: number;
  defesa: number;
  pericias: string[];
}

export function getClassDetailsModifiedByRace(
  { pv, pm, defesa, pericias }: ClassDetails,
  raca: Race
): ClassDetails {
  return raca.habilites.other.reduce(
    (caracteristicas, item) => {
      if (item.type === 'pericias') {
        if (item.allowed === 'any') {
          return {
            ...caracteristicas,
            pericias: [
              ...caracteristicas.pericias,
              PERICIAS[getNotRepeatedRandomPer(caracteristicas.pericias)],
            ],
          };
        }
      }

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
    { pv, pm, defesa, pericias }
  );
}

function addBasicPer(
  classBasicPer: BasicExpertise[],
  racePers: string[]
): string[] {
  return classBasicPer.reduce((pericias, item) => {
    if (item.type === 'or') {
      const selectedPer = getRandomItemFromArray(item.list);
      const perWithPossiblyRepeated = [...pericias, selectedPer];
      return perWithPossiblyRepeated.filter(
        (currentItem, index) =>
          perWithPossiblyRepeated.indexOf(currentItem) === index
      );
    }

    if (item.type === 'and') {
      const perWithPossiblyRepeated = [...pericias, ...item.list];
      return perWithPossiblyRepeated.filter(
        (currentItem, index) =>
          perWithPossiblyRepeated.indexOf(currentItem) === index
      );
    }

    return pericias;
  }, racePers);
}

function addRemainingPer(qtdPericiasRestantes: number, pericias: string[]) {
  return Array(qtdPericiasRestantes)
    .fill(0)
    .reduce(
      (periciasAtuais) => [
        ...periciasAtuais,
        PERICIAS[getNotRepeatedRandomPer(periciasAtuais)],
      ],
      pericias
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
  atributosRolados: CharacterAttribute[],
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

export function addClassPer(
  classe: ClassDescription,
  racePers: string[]
): string[] {
  // 5.1.1: Cada classe tem algumas perícias básicas (que devem ser escolhidas entre uma ou outra)
  const periciasDeClasseEBasicas = addBasicPer(
    classe.periciasbasicas,
    racePers
  );

  // 5.1.2: As perícias padrões que cada classe recebe
  return addRemainingPer(
    classe.periciasrestantes.qtd,
    periciasDeClasseEBasicas
  );
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

// Retorna a origem e as perícias selecionadas
function getOrigin() {
  const selectedOrigin = getRandomItemFromArray(origins);
  const skills: string[] = [];
  const powers: (OriginPower | GeneralPower)[] = [];

  if (selectedOrigin.name === 'Amnésico') {
    skills.push(getRandomItemFromArray(Object.values(PERICIAS)));
    // TODO: Jogar mais um poder aleatório
    powers.push(originPowers.LEMBRANCAS_GRADUAIS);

    return {
      name: selectedOrigin.name,
      skills,
      powers,
    };
  }

  const benefits = pickFromArray(
    [...selectedOrigin.pericias, ...selectedOrigin.poderes],
    2
  );

  benefits.forEach((benefit) => {
    if (typeof benefit === 'string') {
      skills.push(benefit);
    } else {
      powers.push(benefit as OriginPower);
    }
  });

  return {
    name: selectedOrigin.name,
    skills,
    powers,
  };
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

function calcDisplacement(bag: Bag, race: Race): number {
  const displacement = getRaceDisplacement(race);

  return displacement;
}

export default function generateRandomSheet(
  selectedOptions: SelectedOptions
): CharacterSheet {
  const nivel = 1;

  // Passo 1: Gerar os atributos base desse personagem
  const atributosRolados: CharacterAttribute[] = ATRIBUTOS.map((atributo) => {
    const randomAttr = getRandomArbitrary(8, 18);
    const mod = getModValues(randomAttr);
    return { name: atributo, value: randomAttr, mod };
  });
  // Passo 1.1: Definir sexo
  const sexos = ['Homem', 'Mulher'] as ('Homem' | 'Mulher')[];
  const sexo = getRandomItemFromArray<'Homem' | 'Mulher'>(sexos);

  // Passo 2: Definir raça
  const { race, atributos, nome } = getRaceAndRaceStats(
    selectedOptions,
    atributosRolados,
    sexo
  );

  // Passo 3: Definir a classe
  const classe = selectClass(selectedOptions);
  // Passo 3.1: Determinando o PV baseado na classe
  const constAttr = atributos.find((attr) => attr.name === 'Constituição');
  const pvInicial = getInitialPV(classe.pv, constAttr);

  // Passo 3.2: Determinando o PM baseado na classe
  const { pm: pmInicial } = classe;

  // Passo 3.3: Determinando a Defesa inicial
  const destAttr = atributos.find((attr) => attr.name === 'Destreza');
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
  const origin = getOrigin();
  const skillsRaceAndOrigin = removeDup([
    ...classDetailsModifiedByRace.pericias,
    ...origin.skills,
  ]);

  // Passo 5: Marcar as perícias treinadas
  // 5.1: Definir perícias da classe
  const pericias = addClassPer(classe, skillsRaceAndOrigin);

  // Passo 6: Definição de itens iniciais
  const bag = getInitialBag(classe);
  // 6.1: Incrementar defesa com base nos Equipamentos
  const defense = calcDefense(classDetails.defesa, bag);

  // Passo 7: Escolher se vai ser devoto, e se for o caso puxar uma divindade
  const devoto = getReligiosidade(classe, race);

  // Passo 8: Gerar magias se possível
  const spells = getSpells(classe);

  // Passo 9: Recuperar deslocamento e tamanho
  const displacement = calcDisplacement(bag, race);
  const size = getRaceSize(race);

  return {
    id: uuid(),
    nome,
    sexo,
    nivel,
    atributos,
    raca: race,
    classe,
    pericias,
    pv: classDetailsModifiedByRace.pv,
    pm: classDetailsModifiedByRace.pm,
    defesa: defense,
    bag,
    devoto,
    origin,
    spells,
    displacement,
    size,
  };
}
