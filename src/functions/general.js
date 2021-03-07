import ATRIBUTOS from '../utils/atributos'
import RACAS from '../utils/racas';
import CLASSES from '../utils/classes';
import PERICIAS from '../utils/pericias';

function getModValues(attr){
    if(attr === 1){
        return -5;
    }else if(attr >= 2 && attr <= 3){
        return -4;
    }else if(attr >= 4 && attr <= 5){
        return -3;
    }else if(attr >= 6 && attr <= 7){
        return -2
    }else if(attr >= 8 && attr <= 9){
        return -1
    }else if(attr >= 10 && attr <= 11){
        return 0
    }else if(attr >= 12 && attr <= 13){
        return 1
    }else if(attr >= 14 && attr <= 15){
        return 2
    }else if(attr >= 16 && attr <= 17){
        return 3
    }else if(attr >= 18 && attr <= 19){
        return 4
    }else if(attr >= 20 && attr <= 21){
        return 5
    }else if(attr >= 22 && attr <= 23){
        return 6
    }else if(attr >= 24 && attr <= 25){
        return 7
    }
}

function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function getRandomItemFromArray(array){
    return array[Math.floor(Math.random()*array.length)];
}

function getRandomPer(){
    var keys = Object.keys(PERICIAS);
    return getRandomItemFromArray(keys);
}

export function generateRandomSheet(){
    const name = "NomeDoJogador"; // TODO: Gerar nomes aleatórios
    const nivel = 1;

    // Passo 1: Gerar os atributos base desse personagem
    const atributos = ATRIBUTOS.map((atributo) => {
        const randomAttr = getRandomArbitrary(8, 18)
        const mod = getModValues(randomAttr);
        return {name: atributo, value: randomAttr, mod}
    });

    // Passo 2: Definir raça
    const raca = getRandomItemFromArray(RACAS);

    const modifiedAttrs = [];
    // Passo 2.1: Cada raça pode modificar atributos, isso será feito aqui
    raca.habilites.attrs.forEach(item => {
        // Definir o que que attr muda (se for any é um random)
        let selectedAttr;
        if (item.attr === 'any'){
            selectedAttr = getRandomItemFromArray(ATRIBUTOS);
            while(modifiedAttrs.includes(selectedAttr)){
                selectedAttr = getRandomItemFromArray(ATRIBUTOS);
            }
        }else{
            // TODO: Dar um find nesse atributo pelo nome
        }

        modifiedAttrs.push(selectedAttr);
        
        // Dar um find no attr na lista de atributos
        const attrToChange = atributos.find((attr) => attr.name === selectedAttr);

        console.log(attrToChange);
        
        // Aumentar esse atributo + modificador
        const actualValue = attrToChange.value;
        attrToChange.value = item.mod + actualValue;
        attrToChange.mod = getModValues(attrToChange.value);
    });

    // Passo 3: Definir a classe
    const classe = getRandomItemFromArray(CLASSES);

    // Passo 4: Marcar as perícias treinadas
    // 4.1: Primeiramente vamos treinar as pericias que vem da raça
    const pericias = [];
    raca.habilites.other.forEach(item => {
        if(item.type === 'pericias'){
            // Se tiver que selecionar uma perícia qualquer
            if(item.allowed === 'any'){
                let actualPer = getRandomPer();
                while(pericias.includes(actualPer)){
                    actualPer = getRandomPer();
                }

                pericias.push(PERICIAS[actualPer]);
            }
        }
    })

    // 4.2: Definir perícias da classe
    // 4.2.1: Cada classe tem algumas perícias básicas (que devem ser escolhidas entre uma ou outra)
    classe.periciasbasicas.forEach(item => {
        if(item.type === 'or'){
            pericias.push(getRandomItemFromArray(item.list));
        }else if(item.type === 'and'){
            item.list.forEach(pericia => {
                pericias.push(pericia)
            });
        }
    });

    // 4.2.2: As perícias padrões que cada classe recebe
    for (let index = 0; index < classe.periciasrestantes.qtd; index++) {
        let newPer = getRandomItemFromArray(classe.periciasrestantes.list);
        while(pericias.includes(newPer)){
            newPer = getRandomItemFromArray(classe.periciasrestantes.list);
        }

        pericias.push(newPer);
    };

    return {
        name,
        nivel,
        atributos,
        raca,
        classe,
        pericias,
    }
}