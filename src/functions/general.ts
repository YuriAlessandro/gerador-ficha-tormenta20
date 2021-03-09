import { v4 as uuid } from 'uuid';
import ATRIBUTOS from '../data/atributos';
import RACAS, { getRaceByName } from '../data/racas';
import CLASSES from '../data/classes';
import PERICIAS from '../data/pericias';
import EQUIPAMENTOS, { addEquipsDefenseBonuses } from '../data/equipamentos';
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
import Equipment from '../interfaces/Equipment';

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

function selectRace(selectedOptions: SelectedOptions) {
  if (selectedOptions.raca) {
    const selectedRace = RACAS.find(
      (currentRaca) => currentRaca.name === selectedOptions.raca
    );

    const raceName = selectedRace?.name || '';

    return getRaceByName(raceName);
  }
  return getRandomItemFromArray(RACAS);
}

function getAndSetupRace(selectedOptions: SelectedOptions) {
  const race = selectRace(selectedOptions);

  if (race.setup) {
    const races = (RACAS as unknown) as Race[];
    race.setup(races);
  }

  return race;
}

function getRaceAndRaceStats(
  selectedOptions: SelectedOptions,
  atributosRolados: CharacterAttribute[],
  sex: 'Homem' | 'Mulher'
) {
  // Passo 2.2: Escolher raça
  const race = getAndSetupRace(selectedOptions);
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
  if (selectedOptions.classe) {
    const selectedClass = CLASSES.find(
      (currentClasse) => currentClasse.name === selectedOptions.classe
    );

    return selectedClass || getRandomItemFromArray(CLASSES);
  }
  return getRandomItemFromArray(CLASSES);
}

export function addEquipClass(classe: ClassDescription): Equipment[] {
  // 6.1 A depender da classe os itens podem variar
  const equipamentosIniciais = [...EQUIPAMENTOS.inicial];

  // Arma leve
  equipamentosIniciais.push(getRandomItemFromArray(EQUIPAMENTOS.armasSimples));

  // Arma marcial
  if (classe.proeficiencias.includes(todasProficiencias.MARCIAIS)) {
    equipamentosIniciais.push(
      getRandomItemFromArray(EQUIPAMENTOS.armasMarciais)
    );
  }

  // Escudo
  if (classe.proeficiencias.includes(todasProficiencias.ESCUDOS)) {
    const escudo = EQUIPAMENTOS.escudos[0];
    equipamentosIniciais.push(escudo);
  }

  // Armadura
  if (classe.proeficiencias.includes(todasProficiencias.PESADAS)) {
    const brunea = EQUIPAMENTOS.armaduraPesada[0];
    equipamentosIniciais.push(brunea);
  } else if (classe.name !== 'Arcanista') {
    equipamentosIniciais.push(
      getRandomItemFromArray(EQUIPAMENTOS.armadurasLeves)
    );
  }

  // TODO: Initial cash

  return equipamentosIniciais;
}

// Retorna a lista de poderes concedidos de uma divindade
function getPoderesConcedidos(poderes: GeneralPower[], todosPoderes: boolean) {
  if (todosPoderes) {
    return [...poderes];
  }

  return [getRandomItemFromArray(poderes)];
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
  const poderes = getPoderesConcedidos(divindade.poderes, todosPoderes);

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
  const equipamentos = addEquipClass(classe);
  // 6.1: Incrementar defesa com base nos Equipamentos
  const defesa = addEquipsDefenseBonuses(classDetails.defesa, equipamentos);

  // Passo 7: Escolher se vai ser devoto, e se for o caso puxar uma divindade
  const devoto = getReligiosidade(classe, race);

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
    defesa,
    equipamentos,
    devoto,
    origin,
  };
}
