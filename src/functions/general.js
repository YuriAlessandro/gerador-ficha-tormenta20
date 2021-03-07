import ATRIBUTOS from '../utils/atributos'
import RACAS from '../utils/racas';
import CLASSES from '../utils/classes';
import PERICIAS from '../utils/pericias';

function getModValues(attr){
    return Math.floor(attr / 2) - 5
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
    let atributos = [];
    let pericias = [];

    // Passo 1: Gerar os atributos base desse personagem
    ATRIBUTOS.forEach(atributo => {
        const randomAttr = getRandomArbitrary(8, 18);
        const mod = getModValues(randomAttr);
        atributos.push({name: atributo, value: randomAttr, mod});
    });

    // Passo 2: Definir raça
    const raca = getRandomItemFromArray(RACAS);

    // Passo 3: Definir a classe
    const classe = getRandomItemFromArray(CLASSES);

    // Passo 4: Marcar as perícias treinadas
    // 4.1: Primeiramente vamos treinar as pericias que vem da raça
    raca.habilites.other.forEach(item => {
        if(item.type === 'pericias'){
            if(item.allowed === "any"){
                let actualPer = getRandomPer();
                while(pericias.includes(actualPer)){
                    actualPer = getRandomPer();
                }
                pericias.push(PERICIAS[actualPer]);
            }
        }
    });

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

    for (let index = 0; index < classe.periciasrestantes.qtd; index++) {
        let newPer = getRandomItemFromArray(classe.periciasrestantes.list);
        while(pericias.includes(newPer)){
            newPer = getRandomItemFromArray(classe.periciasrestantes.list);
        }

        pericias.push(newPer);
    }

    return {
        name,
        nivel,
        atributos,
        raca,
        classe,
        pericias,
    }
}