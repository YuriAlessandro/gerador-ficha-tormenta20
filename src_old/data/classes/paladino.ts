import { cloneDeep, merge } from 'lodash';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { ClassDescription } from '../../interfaces/Class';
import { RequirementType } from '../../interfaces/Poderes';
import Skill from '../../interfaces/Skills';
import { Atributo } from '../atributos';
import PROFICIENCIAS from '../proficiencias';

const PALADINO: ClassDescription = {
  name: 'Paladino',
  pv: 20,
  addpv: 5,
  pm: 3,
  addpm: 3,
  periciasbasicas: [
    {
      type: 'and',
      list: [Skill.LUTA, Skill.VONTADE],
    },
  ],
  periciasrestantes: {
    qtd: 2,
    list: [
      Skill.ADESTRAMENTO,
      Skill.ATLETISMO,
      Skill.CAVALGAR,
      Skill.CURA,
      Skill.DIPLOMACIA,
      Skill.FORTITUDE,
      Skill.GUERRA,
      Skill.INICIATIVA,
      Skill.INTUICAO,
      Skill.NOBREZA,
      Skill.PERCEPCAO,
      Skill.RELIGIAO,
    ],
  },
  proficiencias: [
    PROFICIENCIAS.LEVES,
    PROFICIENCIAS.MARCIAIS,
    PROFICIENCIAS.PESADAS,
    PROFICIENCIAS.ESCUDOS,
    PROFICIENCIAS.SIMPLES,
  ],
  abilities: [
    {
      name: 'Abençoado',
      text: 'Você soma seu bônus de Carisma no seu total de pontos de mana no 1º nível. Além disso, torna-se devoto de uma divindade disponível para paladinos (Azgher, Khalmyr, Lena, Lin-Wu, Marah, Tanna-Toh, Thyatis, Valkaria). Você deve obedecer às Obrigações & Restrições de seu deus, mas, em troca, ganha os Poderes Concedidos dele. Como alternativa, você pode ser um paladino do bem, lutando em prol da bondade e da justiça como um todo. Não recebe nenhum Poder Concedido, mas não precisa seguir nenhuma Obrigação & Restrição (além do Código do Herói, abaixo).',
      nivel: 1,
      action(
        sheet: CharacterSheet,
        subSteps: {
          name: string;
          value: string;
        }[]
      ): CharacterSheet {
        const sheetClone = cloneDeep(sheet);

        const initialPm = sheetClone.pm;
        const carMod = sheetClone.atributos.Carisma.mod;

        subSteps.push({
          name: 'Abençoado',
          value: `Adicionar Mod. de Carisma (${carMod}) na PM do 1º nível: ${initialPm} + ${carMod} = ${
            initialPm + carMod
          }`,
        });

        return merge<CharacterSheet, Partial<CharacterSheet>>(sheetClone, {
          pm: sheetClone.pm + carMod,
        });
      },
    },
    {
      name: 'Código de Héroi',
      text: 'Você deve sempre manter sua palavra e nunca pode recusar um pedido de ajuda de alguém inocente. Além disso, nunca pode mentir, trapacear ou roubar. Se violar o código, você perde todos os seus PM e só pode recuperá-los a partir do próximo dia.',
      nivel: 1,
    },
    {
      name: 'Golpe Divino',
      text: 'Quando faz um ataque corpo a corpo, você pode gastar 2 PM para desferir um golpe destruidor. Você soma seu bônus de Carisma no teste de ataque e +1d8 na rolagem de dano. A cada quatro níveis, pode gastar +1 PM para aumentar o dano em +1d8.',
      nivel: 1,
    },
    {
      name: 'Cura pelas Mãos',
      text: 'partir do 2º nível, você pode gastar uma ação de movimento e 1 PM para curar 1d8+1 pontos de vida de um alvo em alcance corpo a corpo (incluindo você). A cada quatro níveis, você pode gastar +1 PM para aumentar os PV curados em +1d8+1.\nA partir do 6º nível, você pode gastar +1 PM quando usa Cura pelas Mãos para anular uma condição afetando o alvo, entre abalado, apavorado, atordoado, cego, doente, exausto, fatigado ou surdo.\nEsta habilidade também pode causar dano de luz a mortos-vivos, exigindo um ataque desarmado.',
      nivel: 2,
    },
    {
      name: 'Aura Sagrada',
      text: 'No 3º nível, você pode gastar 1 PM para gerar uma aura com alcance curto a partir de você. A aura emite uma luz dourada e agradável, que ilumina como uma tocha. Além disso, você e os aliados dentro da aura recebem um bônus igual ao seu bônus de Carisma nos testes de resistência. Manter a aura custa 1 PM por turno.',
      nivel: 3,
    },
    {
      name: 'Bênção da Justiça',
      text: 'No 5º nível, escolha entre égide sagrada e montaria sagrada (Tormenta 20 pág 84). Uma vez feita, esta escolha não pode ser mudada.',
      nivel: 5,
    },
    {
      name: 'Vingador Sagrado',
      text: 'No 20º nível, você pode gastar uma ação completa e 10 PM para se cobrir de energia divina, assumindo a forma de um vingador sagrado até o fim da cena. Nesta forma, você recebe deslocamento de voo 18m, resistência a dano 20 e soma seu modificador de Carisma em seus testes de ataque e rolagens de dano corpo a corpo.',
      nivel: 20,
    },
  ],
  powers: [
    {
      name: 'Arma Sagrada',
      text: 'Se estiver empunhando a arma preferida de seu deus, o dado de dano que você rola por Golpe Divino aumenta para d12.',
      requirements: [
        [
          { type: RequirementType.DEVOTO, name: 'Lena', not: true },
          { type: RequirementType.DEVOTO, name: 'Marah', not: true },
        ],
      ],
    },
    {
      name: 'Aumento de Atributo',
      text: 'Você recebe +2 em um atributo a sua escolha (NÃO CONTABILIZADO). Você pode escolher este poder várias vezes. A partir da segunda vez que escolhê-lo para o mesmo atributo, o aumento diminui para +1.',
      requirements: [],
      canRepeat: true,
    },
    {
      name: 'Aura Antimagia',
      text: 'Enquanto sua aura estiver ativa, você e os aliados dentro da aura podem rolar novamente qualquer teste de resistência contra magia recém realizado.',
      requirements: [[{ type: RequirementType.NIVEL, value: 14 }]],
    },
    {
      name: 'Aura Ardente',
      text: 'Enquanto sua aura estiver ativa, no início de cada um de seus turnos, espíritos e mortos-vivos a sua escolha dentro dela sofrem dano de luz igual a 5 + seu bônus de Carisma.',
      requirements: [[{ type: RequirementType.NIVEL, value: 10 }]],
    },
    {
      name: 'Aura de Cura',
      text: 'Enquanto sua aura estiver ativa, no início de seus turnos, você e os aliados a sua escolha dentro dela curam um número de PV igual a 5 + seu bônus de Carisma.',
      requirements: [[{ type: RequirementType.NIVEL, value: 6 }]],
    },
    {
      name: 'Aura de Invencibilidade',
      text: 'Enquanto sua aura estiver ativa, você ignora o primeiro dano que sofrer na cena. O mesmo se aplica a seus aliados dentro da aura.',
      requirements: [[{ type: RequirementType.NIVEL, value: 18 }]],
    },
    {
      name: 'Aura Poderosa',
      text: 'O alcance da sua aura aumenta para médio.',
      requirements: [[{ type: RequirementType.NIVEL, value: 6 }]],
    },
    {
      name: 'Fulgor Divino',
      text: 'Quando usa Golpe Divino, todos os inimigos em alcance curto ficam ofuscados até o início do seu próximo turno.',
      requirements: [],
    },
    {
      name: 'Julgamento Divino: Arrependimento',
      text: 'Você pode gastar 2 PM para marcar um inimigo em alcance curto. Na próxima vez que esse inimigo acertar um ataque em você ou em um de seus aliados, deve fazer um teste de Vontade (CD Car). Se falhar, fica atordoado no próximo turno dele. Você só pode proferir este julgamento uma vez por cena contra cada criatura.',
      requirements: [],
    },
    {
      name: 'Julgamento Divino: Autoridade',
      text: 'Você pode gastar 1 PM para comandar uma criatura em alcance curto. Faça um teste de Diplomacia oposto pelo teste de Vontade da criatura. Se você passar, ela obedece a um comando simples como “pare” ou “largue a arma”. Se a criatura passar, fica imune a esse efeito por um dia.',
      requirements: [],
    },
    {
      name: 'Julgamento Divino: Coragem',
      text: 'Você pode gastar 2 PM para inspirar coragem em uma criatura em alcance curto, incluindo você mesmo. A criatura fica imune a efeitos de medo e recebe +2 em testes de ataque contra alvos de ND maior que o nível dela.',
      requirements: [],
    },
    {
      name: 'Julgamento Divino: Iluminação',
      text: 'Você pode marcar um inimigo em alcance curto. Quando acerta um ataque corpo a corpo nesse inimigo, você recebe 2 PM temporários. Você só pode proferir este julgamento uma vez por cena.',
      requirements: [],
    },
    {
      name: 'Julgamento Divino: Justiça',
      text: 'Você pode gastar 2 PM para marcar um inimigo em alcance curto. A próxima vez que esse inimigo causar dano em você ou em um de seus aliados, deve fazer um teste de Vontade (CD Car). Se falhar, sofre dano de luz igual à metade do dano que causou.',
      requirements: [],
    },
    {
      name: 'Julgamento Divino: Libertação',
      text: 'Você pode gastar 5 PM para cancelar uma condição negativa qualquer (como abalado, paralisado etc.) que esteja afetando uma criatura em alcance curto.',
      requirements: [],
    },
    {
      name: 'Julgamento Divino: Salvação',
      text: 'Você pode gastar 2 PM para marcar um inimigo em alcance curto. Até o fim da cena, quando você acerta um ataque corpo a corpo nesse inimigo, recupera 5 pontos de vida.',
      requirements: [],
    },
    {
      name: 'Julgamento Divino: Vindicação',
      text: 'Você pode gastar 2 PM para marcar um inimigo que tenha causado dano a você ou a seus aliados na cena. Você recebe +1 em testes de ataque e +1d8 em rolagens de dano contra o inimigo escolhido, mas sofre –5 em testes de ataque contra quaisquer outros alvos. No 5º nível, e a cada cinco níveis seguintes, você pode pagar +1 PM para aumentar o bônus de ataque em +1 e o bônus de dano em +1d8. O efeito termina caso o alvo fique inconsciente.',
      requirements: [],
    },
    {
      name: 'Julgamento Divino: Zelo',
      text: 'Você pode gastar 1 PM para marcar um alvo em alcance longo. Pelo restante da cena, sempre que se mover na direção desse alvo, você se move com o dobro de seu deslocamento.',
      requirements: [],
    },
    {
      name: 'Orar',
      text: 'Você aprende e pode lançar uma magia divina de 1º círculo a sua escolha (NÃO CONTABILIZADO). Seu atributo-chave para esta magia é Sabedoria. Você pode escolher este poder quantas vezes quiser.',
      requirements: [],
      canRepeat: true,
    },
    {
      name: 'Virtude Paladinesca: Caridade',
      text: 'O custo de suas habilidades de paladino que tenham um aliado como alvo é reduzido em 1 PM.',
      requirements: [],
    },
    {
      name: 'Virtude Paladinesca: Castidade',
      text: 'Você se torna imune a efeitos de encantamento e recebe +5 em testes de Intuição para perceber blefes.',
      requirements: [],
    },
    {
      name: 'Virtude Paladinesca: Compaixão',
      text: 'Você pode usar Cura pelas Mãos em alcance curto e, para cada PM que gastar, cura 2d6+1 (em vez de 1d8+1).',
      requirements: [],
    },
    {
      name: 'Virtude Paladinesca: Humildade',
      text: 'Na primeira rodada de um combate, você pode gastar uma ação completa para rezar e pedir orientação. Você recebe uma quantidade de PM temporários igual ao seu bônus de Carisma.',
      requirements: [],
    },
    {
      name: 'Virtude Paladinesca: Temperança',
      text: 'Quando ingere um alimento, item alquímico ou poção, você consome apenas metade do item. Na prática, cada item desses rende duas “doses” para você.',
      requirements: [],
    },
  ],
  probDevoto: 0.8,
  qtdPoderesConcedidos: 'all',
  faithProbability: {
    AZGHER: 1,
    KHALMYR: 1,
    LENA: 1,
    LINWU: 1,
    MARAH: 1,
    TANNATOH: 1,
    THYATIS: 1,
    VALKARIA: 1,
    AHARADAK: 0,
    ALLIHANNA: 0,
    ARSENAL: 0,
    HYNINN: 0,
    KALLYADRANOCH: 0,
    MEGALOKK: 0,
    NIMB: 0,
    OCEANO: 0,
    SSZZAAS: 0,
    TENEBRA: 0,
    THWOR: 0,
    WYNNA: 0,
  },
  attrPriority: [Atributo.FORCA, Atributo.CONSTITUICAO, Atributo.CARISMA],
};

export default PALADINO;
