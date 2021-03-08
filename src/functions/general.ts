import { v4 as uuid } from 'uuid';
import ATRIBUTOS from '../utils/atributos';
import RACAS from '../utils/racas';
import CLASSES from '../utils/classes';
import PERICIAS from '../utils/pericias';
import EQUIPAMENTOS from '../utils/equipamentos';
import DIVINDADES from '../utils/divindades';
import CharacterSheet, {
  CharacterAttribute,
  RaceHability,
  Race,
} from '../interfaces/CharacterSheet';
import { BasicExpertise, ClassDescription } from '../interfaces/Class';
import SelectedOptions from '../interfaces/SelectedOptions';
import Divindade from '../interfaces/Divindade';
import grantedPowers from '../utils/poderes/concedidos';
import { generateRandomName, getRandomItemFromArray } from './utils';

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
  return getRandomItemFromArray<string>(periciasPermitidas);
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
              PERICIAS[getNotRepeatedRandomPer(pericias)],
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
      const selectedPer = getRandomItemFromArray(item.list) as string;
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
    return pv + constAttr.mod;
  }
  return pv;
}

function getInitialDef(destAttr: CharacterAttribute | undefined) {
  const baseDef = 10;

  if (destAttr) {
    return baseDef + destAttr.mod;
  }

  return baseDef;
}

function selectRace(selectedOptions: SelectedOptions) {
  if (selectedOptions.raca) {
    const selectedRace = RACAS.find(
      (currentRaca) => currentRaca.name === selectedOptions.raca
    );

    if (selectedRace) {
      return selectedRace as Race;
    }

    return RACAS[0] as Race;
  }
  return getRandomItemFromArray(RACAS) as Race;
}

function getRace(selectedOptions: SelectedOptions) {
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
  sex: string
) {
  // Passo 2.2: Escolher raça
  const race = getRace(selectedOptions);
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
  // 4.1.1: Cada classe tem algumas perícias básicas (que devem ser escolhidas entre uma ou outra)
  const periciasDeClasseEBasicas = addBasicPer(
    classe.periciasbasicas,
    racePers
  );

  // 4.1.2: As perícias padrões que cada classe recebe
  return addRemainingPer(
    classe.periciasrestantes.qtd,
    periciasDeClasseEBasicas
  );
}

function selectClass(selectedOptions: SelectedOptions): ClassDescription {
  if (selectedOptions.classe) {
    const selectedClass = (CLASSES.find(
      (currentClasse) => currentClasse.name === selectedOptions.classe
    ) as unknown) as ClassDescription;

    return selectedClass || getRandomItemFromArray<ClassDescription>(CLASSES);
  }
  return getRandomItemFromArray(CLASSES);
}

export function addEquipClass(classe: ClassDescription): { nome: string }[] {
  // 6.1 A depender da classe os itens podem variar
  const equipamentosIniciais = [...EQUIPAMENTOS.inicial];

  const armaduras = EQUIPAMENTOS.armadurasLeves;
  const armas = EQUIPAMENTOS.armasSimples;
  const escudo = EQUIPAMENTOS.escudos[0];

  if (classe.proeficiencias.length === 5) {
    // Paladino, Guerreiro, Cavaleiro e Nobre
    Array.prototype.push.apply(armaduras, EQUIPAMENTOS.armaduraPesada);
    Array.prototype.push.apply(armas, EQUIPAMENTOS.armasMarciais);

    const armadura = getRandomItemFromArray(armaduras);
    const arma = getRandomItemFromArray(armas);

    equipamentosIniciais.push(armadura);
    equipamentosIniciais.push(arma);
    equipamentosIniciais.push(escudo);
  } else if (classe.proeficiencias.length === 2) {
    if (classe.name === 'Arcanista') {
      // Arcanista
      const arma = getRandomItemFromArray(armas);

      equipamentosIniciais.push(arma);
    } else {
      // Lutador, Ladino e Inventor
      const armadura = getRandomItemFromArray(armaduras);
      const arma = getRandomItemFromArray(armas);

      equipamentosIniciais.push(armadura);
      equipamentosIniciais.push(arma);
    }
  } else if (classe.proeficiencias.length === 4) {
    if (classe.name === 'Bardo' || classe.name === 'Bucaneiro') {
      // Bardo e Bucaneiro
      Array.prototype.push.apply(armas, EQUIPAMENTOS.armasMarciais);

      const armadura = getRandomItemFromArray(armaduras);
      const arma = getRandomItemFromArray(armas);

      equipamentosIniciais.push(armadura);
      equipamentosIniciais.push(arma);
    } else {
      // Bárbaro e Caçador
      Array.prototype.push.apply(armas, EQUIPAMENTOS.armasMarciais);

      const armadura = getRandomItemFromArray(armaduras);
      const arma = getRandomItemFromArray(armas);

      equipamentosIniciais.push(armadura);
      equipamentosIniciais.push(arma);
      equipamentosIniciais.push(escudo);
    }
  } else if (classe.name === 'Clérigo') {
    // Clérigo
    Array.prototype.push.apply(armaduras, EQUIPAMENTOS.armaduraPesada);

    const armadura = getRandomItemFromArray(armaduras);
    const arma = getRandomItemFromArray(armas);

    equipamentosIniciais.push(armadura);
    equipamentosIniciais.push(arma);
    equipamentosIniciais.push(escudo);
  } else {
    // Druída
    const armadura = getRandomItemFromArray(armaduras);
    const arma = getRandomItemFromArray(armas);

    equipamentosIniciais.push(armadura);
    equipamentosIniciais.push(arma);
    equipamentosIniciais.push(escudo);
  }

  return equipamentosIniciais;
}

// Retorna os detalhes (nome, descrição, etc) dos poderes concedidos
function getPoderesConcedidosDetalhes(poderes: string[]) {
  return poderes
    .map((poder) =>
      grantedPowers.find((outroPoder) => outroPoder.name === poder)
    )
    .filter((item) => item);
}

// Retorna a lista de poderes concedidos de uma divindade
function getPoderesConcedidos(poderes: string[], todosPoderes: boolean) {
  if (todosPoderes) {
    return getPoderesConcedidosDetalhes([...poderes]);
  }

  const poderesConcedidos = [getRandomItemFromArray(poderes)];
  return getPoderesConcedidosDetalhes(poderesConcedidos);
}

// Retorna se é devoto e qual a divindade
function getReligiosidade(classe: ClassDescription) {
  const isDevoto = getRandomArbitrary(1, 100) <= classe.probDevoto * 100;
  const divindade: Divindade = getRandomItemFromArray(DIVINDADES);

  const todosPoderes = classe.qtdPoderesConcedidos === 'all';
  const poderes = getPoderesConcedidos(divindade.poderes, todosPoderes);

  return { isDevoto, divindade, poderes };
}

export default function generateRandomSheet(
  selectedOptions: SelectedOptions
): CharacterSheet {
  const nivel = 1;

  // Passo 1: Gerar os atributos base desse personagem
  const atributosRolados = ATRIBUTOS.map((atributo) => {
    const randomAttr = getRandomArbitrary(8, 18);
    const mod = getModValues(randomAttr);
    return { name: atributo, value: randomAttr, mod };
  });
  // Passo 1.1: Definir sexo
  const sexos = ['Homem', 'Mulher'];
  const sexo = getRandomItemFromArray(sexos);

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
  const defesaInicial = getInitialDef(destAttr);

  // Passo 3.4: Alterar características da classe com base na raça
  const caracteristicasDaClasse = {
    pv: pvInicial,
    pm: pmInicial,
    defesa: defesaInicial,
    pericias: [],
  };

  const {
    pv,
    pm,
    defesa,
    pericias: periciasDaRaca,
  } = getClassDetailsModifiedByRace(caracteristicasDaClasse, race);

  // Passo 4: Marcar as perícias treinadas
  // 4.1: Definir perícias da classe
  const pericias = addClassPer(classe, periciasDaRaca);

  // Passo 5: Definição de origem
  // TODO

  // Passo 6: Definição de itens iniciais
  const equipamentos = addEquipClass(classe);

  // Passo 7: Escolher se vai ser devoto, e se for o caso puxar uma dinvindade
  const devoto = getReligiosidade(classe);

  return {
    id: uuid(),
    nome,
    sexo,
    nivel,
    atributos,
    raca: race,
    classe,
    pericias,
    pv,
    pm,
    defesa,
    equipamentos,
    devoto,
  };
}
