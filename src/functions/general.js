import ATRIBUTOS from '../utils/atributos';
import RACAS from '../utils/racas';
import CLASSES from '../utils/classes';
import PERICIAS from '../utils/pericias';
import nomes from '../utils/nomes';

export function getModValues(attr) {
  return Math.floor(attr / 2) - 5;
}

function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function getRandomItemFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// function getRandomPer() {
//   const keys = Object.keys(PERICIAS);
//   return getRandomItemFromArray(keys);
// }

function getNotRepeatedAttribute(atributosModificados) {
  const atributosPermitidos = ATRIBUTOS.filter(
    (atributo) => !atributosModificados.includes(atributo)
  );
  return getRandomItemFromArray(atributosPermitidos);
}

function selectAttributeToChange(atributosModificados, atributo) {
  if (atributo.attr === 'any') {
    return getNotRepeatedAttribute(atributosModificados);
  }

  return atributo.attr;
}

function getModifiedAttribute(
  selectedAttrIndex,
  atributosModificados,
  attrDaRaca
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

export function modifyAttributesBasedOnRace(raca, atributos) {
  const reducedAttrs = raca.habilites.attrs.reduce(
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

export function generateRandomName(raca, sexo) {
  if (raca.name === 'Osteon') {
    return getRandomItemFromArray(nomes[raca.oldRace.name][sexo]);
  }

  if (raca.name === 'Lefou') {
    const firstName = getRandomItemFromArray(nomes[raca.name].primeiroNome);
    const lastName = getRandomItemFromArray(nomes[raca.name].segundoNome[sexo]);

    return `${firstName} ${lastName}`;
  }

  return getRandomItemFromArray(nomes[raca.name][sexo]);
}

function getNotRepeatedRandomPer(periciasUsadas) {
  const keys = Object.keys(PERICIAS);
  const periciasPermitidas = keys.filter(
    (pericia) => !periciasUsadas.includes(PERICIAS[pericia])
  );
  return getRandomItemFromArray(periciasPermitidas);
}

export function getClassDetailsModifiedByRace(
  { pv, pm, defesa, pericias },
  raca
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

      if (item.type === 'pv') {
        return {
          ...caracteristicas,
          pv: pv + item.mod,
        };
      }

      if (item.type === 'pm') {
        return {
          ...caracteristicas,
          pm: pm + item.mod,
        };
      }
      if (item.type === 'defesa') {
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

function addBasicPer(classBasicPer, racePers) {
  return classBasicPer.reduce((pericias, item) => {
    if (item.type === 'or') {
      return [...new Set([...pericias, getRandomItemFromArray(item.list)])];
    }
    if (item.type === 'and') {
      return [...new Set([...pericias, ...item.list])];
    }

    return pericias;
  }, racePers);
}

function addRemainingPer(qtdPericiasRestantes, pericias) {
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

export function addClassPer(classe, racePers) {
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

export default function generateRandomSheet() {
  const sexos = ['Homem', 'Mulher'];
  const nivel = 1;

  // Passo 1: Gerar os atributos base desse personagem
  const atributosRolados = ATRIBUTOS.map((atributo) => {
    const randomAttr = getRandomArbitrary(8, 18);
    const mod = getModValues(randomAttr);
    return { name: atributo, value: randomAttr, mod };
  });

  // Passo 2: Definir raça
  const raca = getRandomItemFromArray(RACAS);

  if (raca.name === 'Osteon') {
    raca.oldRace = raca.sortOldRace(RACAS);
  }
  // Passo 2.1: Cada raça pode modificar atributos, isso será feito aqui
  const atributos = modifyAttributesBasedOnRace(raca, atributosRolados);
  // Passo 2.2: Definir sexo
  const sexo = getRandomItemFromArray(sexos);
  // Passo 2.3: Definir nome
  const nome = generateRandomName(raca, sexo);
  // Passo 3: Definir a classe
  const classe = getRandomItemFromArray(CLASSES);

  // Passo 3.1: Determinando o PV baseado na classe
  const constAttr = atributos.find((attr) => attr.name === 'Constituição');
  const pvInicial = classe.pv + constAttr.mod;

  // Passo 3.2: Determinando o PM baseado na classe
  const { pm: pmInicial } = classe;

  // Passo 3.3: Determinando a Defesa inicial
  const destAttr = atributos.find((attr) => attr.name === 'Destreza');
  const defesaInicial = 10 + destAttr.mod;

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
  };
}
