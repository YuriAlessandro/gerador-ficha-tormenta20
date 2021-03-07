import ATRIBUTOS from '../utils/atributos';
import RACAS from '../utils/racas';
import CLASSES from '../utils/classes';
import PERICIAS from '../utils/pericias';
import EQUIPAMENTOS from '../utils/equipamentos';
import nomes from '../utils/nomes';
import {
  CharacterAttribute,
  RaceHability,
  Race,
} from '../interfaces/CharacterSheet';
import { BasicExpertise, ClassDescription } from '../interfaces/Class';
import SelectedOptions from '../interfaces/SelectedOptions';

export function getModValues(attr: number): number {
  return Math.floor(attr / 2) - 5;
}

function getRandomArbitrary(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min);
}

function getRandomItemFromArray(array: any[]) {
  return array[Math.floor(Math.random() * array.length)];
}

// function getRandomPer() {
//   const keys = Object.keys(PERICIAS);
//   return getRandomItemFromArray(keys);
// }

function getNotRepeatedAttribute(atributosModificados: string[]) {
  const atributosPermitidos = ATRIBUTOS.filter(
    (atributo) => !atributosModificados.includes(atributo)
  );
  return getRandomItemFromArray(atributosPermitidos);
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

export function generateRandomName(raca: Race, sexo: string): string {
  if (raca.name === 'Osteon' && raca.oldRace) {
    const possibleNames = nomes[raca.oldRace.name][sexo] as string[];

    return getRandomItemFromArray(possibleNames);
  }

  if (raca.name === 'Lefou') {
    const possibleFirstNames = nomes[raca.name].primeiroNome as string[];
    const possibleSecondNames = nomes[raca.name].segundoNome[sexo] as string[];
    const firstName = getRandomItemFromArray(possibleFirstNames);
    const lastName = getRandomItemFromArray(possibleSecondNames);

    return `${firstName} ${lastName}`;
  }

  return getRandomItemFromArray(nomes[raca.name][sexo]);
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
  pericias: any[];
}

export function getClassDetailsModifiedByRace(
  { pv, pm, defesa, pericias }: ClassDetails,
  raca: Race
) {
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
): any[] {
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
    return RACAS.find(
      (currentRaca) => currentRaca.name === selectedOptions.raca
    );
  }
  return getRandomItemFromArray(RACAS);
}

function getRace(selectedOptions: SelectedOptions) {
  const race = selectRace(selectedOptions);

  if (race.name === 'Osteon') {
    race.oldRace = race.sortOldRace(RACAS);
  }

  return race;
}

export function addClassPer(classe: ClassDescription, racePers: any[]) {
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
    const selectedClass = CLASSES.find(
      (currentClasse) => currentClasse.name === selectedOptions.classe
    );

    return selectedClass || getRandomItemFromArray(CLASSES);
  }
  return getRandomItemFromArray(CLASSES);
}

export function addEquipClass(classe: ClassDescription) {
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

export default function generateRandomSheet(selectedOptions: SelectedOptions) {
  const sexos = ['Homem', 'Mulher'];
  const nivel = 1;

  // Passo 1: Gerar os atributos base desse personagem
  const atributosRolados = ATRIBUTOS.map((atributo) => {
    const randomAttr = getRandomArbitrary(8, 18);
    const mod = getModValues(randomAttr);
    return { name: atributo, value: randomAttr, mod };
  });

  // Passo 2: Definir raça
  const raca = getRace(selectedOptions);

  // Passo 2.1: Cada raça pode modificar atributos, isso será feito aqui
  const atributos = modifyAttributesBasedOnRace(raca, atributosRolados);
  // Passo 2.2: Definir sexo
  const sexo = getRandomItemFromArray(sexos);
  // Passo 2.3: Definir nome
  const nome = generateRandomName(raca, sexo);
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
  } = getClassDetailsModifiedByRace(caracteristicasDaClasse, raca);

  // Passo 4: Marcar as perícias treinadas
  // 4.1: Definir perícias da classe
  const pericias = addClassPer(classe, periciasDaRaca);

  // Passe 6: Difinição de itens iniciais
  const equipamentos = addEquipClass(classe);

  return {
    nome,
    sexo,
    nivel,
    atributos,
    raca,
    classe,
    pericias,
    pv,
    pm,
    defesa,
    equipamentos,
  };
}
