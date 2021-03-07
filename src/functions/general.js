import ATRIBUTOS from '../utils/atributos';
import RACAS from '../utils/racas';
import CLASSES from '../utils/classes';
import PERICIAS from '../utils/pericias';
import nomes from '../utils/nomes';

function getModValues(attr) {
  return Math.floor(attr / 2) - 5;
}

function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function getRandomItemFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomPer() {
  const keys = Object.keys(PERICIAS);
  return getRandomItemFromArray(keys);
}

function getNotRepeatedAttribute(atributosModificados) {
  const atributo = getRandomItemFromArray(ATRIBUTOS);

  return atributosModificados.includes(atributo)
    ? getRandomItemFromArray(ATRIBUTOS)
    : atributo;
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

function modifyAttributesBasedOnRace(raca, atributos) {
  const reducedAttrs = raca.habilites.attrs.reduce(
    (
      {
        atributosModificados: atributosAcumulados,
        nomesDosAtributosModificados,
      },
      attrDaRaca
    ) => {
      // Definir o que que attr muda (se for any é um random)
      const selectedAttrName = selectAttributeToChange(
        nomesDosAtributosModificados,
        attrDaRaca
      );

      // Index do atributo selecionado
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

function generateRandomName(raca, sexo) {
  return getRandomItemFromArray(nomes[raca][sexo]);
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

  // Passo 2.1: Cada raça pode modificar atributos, isso será feito aqui
  const atributos = modifyAttributesBasedOnRace(raca, atributosRolados);
  // Passo 2.2: Definir sexo
  const sexo = getRandomItemFromArray(sexos);
  // Passo 2.3: Definir nome
  const nome = generateRandomName(raca.name, sexo);
  // Passo 3: Definir a classe
  const classe = getRandomItemFromArray(CLASSES);

  // Passo 3.1: Determinando o PV baseado na classe
  const constAttr = atributos.find((attr) => attr.name === 'Constituição');
  let pv = classe.pv + constAttr.mod;

  // Passo 3.2: Determinando o PM baseado na classe
  let { pm } = classe;

  // Passo 3.3: Determinando a Defesa inicial
  const destAttr = atributos.find((attr) => attr.name === 'Destreza');
  let defesa = 10 + destAttr.mod;

  // Passo 4: Marcar as perícias treinadas
  // 4.1: Primeiramente vamos treinar as pericias que vem da raça
  const pericias = [];
  raca.habilites.other.forEach((item) => {
    if (item.type === 'pericias') {
      // Se tiver que selecionar uma perícia qualquer
      if (item.allowed === 'any') {
        let actualPer = getRandomPer();
        while (pericias.includes(actualPer)) {
          actualPer = getRandomPer();
        }

        pericias.push(PERICIAS[actualPer]);
      }
    } else if (item.type === 'pv') {
      pv += item.mod;
    } else if (item.type === 'pm') {
      pm += item.mod;
    } else if (item.type === 'defesa') {
      defesa += item.mod;
    }
  });

  // 4.2: Definir perícias da classe
  // 4.2.1: Cada classe tem algumas perícias básicas (que devem ser escolhidas entre uma ou outra)
  classe.periciasbasicas.forEach((item) => {
    if (item.type === 'or') {
      pericias.push(getRandomItemFromArray(item.list));
    } else if (item.type === 'and') {
      item.list.forEach((pericia) => {
        pericias.push(pericia);
      });
    }
  });

  // 4.2.2: As perícias padrões que cada classe recebe
  for (let index = 0; index < classe.periciasrestantes.qtd; index += 1) {
    let newPer = getRandomItemFromArray(classe.periciasrestantes.list);
    while (pericias.includes(newPer)) {
      newPer = getRandomItemFromArray(classe.periciasrestantes.list);
    }

    pericias.push(newPer);
  }

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
