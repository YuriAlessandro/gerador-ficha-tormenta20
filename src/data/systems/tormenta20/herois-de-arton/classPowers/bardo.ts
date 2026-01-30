import { ClassPower } from '../../../../../interfaces/Class';
import { RequirementType } from '../../../../../interfaces/Poderes';
import Skill from '../../../../../interfaces/Skills';
import { Atributo } from '../../atributos';

/**
 * Poderes de Bardo do suplemento Heróis de Arton
 */
const BARDO_POWERS: ClassPower[] = [
  {
    name: 'Acorde Místico',
    text: 'Se estiver empunhando um instrumento musical, você pode gastar uma ação padrão para fazer um teste de Atuação oposto ao teste de Vontade de uma criatura em alcance curto. Se você vencer, a criatura sofre 1d6 pontos de dano de essência e fica vulnerável por 1 rodada. Esse dano aumenta em +1d6 para cada círculo de magia acima do 1º que você puder lançar. Quando faz um ataque como parte da execução de uma magia (como pelo aprimoramento de Toque Chocante), você pode usar este poder no lugar do ataque.',
    requirements: [],
  },
  {
    name: 'Acorde Poderoso',
    text: 'Os dados de dano do seu Acorde Místico aumentam para d10, o alcance dele aumenta para médio e, se você vencer o teste oposto, a vítima fica desprevenida, em vez de vulnerável.',
    requirements: [[{ type: RequirementType.PODER, name: 'Acorde Místico' }]],
  },
  {
    name: 'Adereço Musical',
    text: 'Você pode gastar 10 minutos para acoplar (ou desacoplar) um item esotérico a um instrumento musical. Isso permite empunhar o esotérico com a mesma mão que empunha o instrumento e usar seu efeito em Acorde Místico, como se esse poder fosse uma magia. Cada instrumento musical só pode ter um esotérico acoplado.',
    requirements: [],
  },
  {
    name: 'Apresentação Impactante',
    text: 'Quando usa Inspiração, você impacta também os inimigos dentro do alcance. Na próxima vez que um inimigo fizer um teste de ataque ou de resistência nessa cena, ele rola dois dados e usa o pior resultado (apenas uma vez por cena).',
    requirements: [],
  },
  {
    name: 'Balada do Atirador',
    text: 'Você pode usar Esgrima Mágica, e qualquer poder de bardo que o tenha como pré-requisito, com armas de ataque à distância leves ou de uma mão. Quando faz isso, você pode substituir testes de Pontaria por Atuação.',
    requirements: [[{ type: RequirementType.PODER, name: 'Esgrima Mágica' }]],
  },
  {
    name: 'Celebridade Artoniana',
    text: 'No início de cada cena, você pode gastar 3 PM para fazer um teste de Atuação oposto pelo teste de Vontade de uma criatura inteligente (Int –3 ou maior) que possa ver. Se você vencer, a criatura se revela sua fã. Você recebe +5 em todos os testes de perícia contra ela e ela sofre –5 em todos os testes dela contra você até o fim da aventura. Quem vai querer agredir seu ídolo?',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Estrelato' },
        { type: RequirementType.NIVEL, value: 17 },
      ],
    ],
  },
  {
    name: 'Dança Acrobática',
    text: 'Você pode substituir testes de Acrobacia por Atuação. Quando você faz isso para passar por um inimigo, ele só pode usar Acrobacia ou Iniciativa no teste oposto.',
    requirements: [],
  },
  {
    name: 'Espada Encantada',
    text: 'Quando você causa dano com seu Golpe Elemental, o alvo sofre uma condição conforme o tipo de dano escolhido. Ácido: vulnerável por 1 rodada. Eletricidade: ofuscado por 1 rodada. Fogo: em chamas. Frio: lento por 1 rodada.',
    requirements: [[{ type: RequirementType.PODER, name: 'Golpe Elemental' }]],
  },
  {
    name: 'História de Acampamento',
    text: 'Você pode gastar 1 hora para entreter um número de pessoas igual ao seu nível com histórias e canções. A recuperação de PM por descanso dessas pessoas aumenta em +1 por nível nesse dia.',
    requirements: [],
  },
  {
    name: 'Inspiração Espirituosa',
    text: 'Na primeira vez que você usa Inspiração em cada combate, você e seus aliados recebem uma quantidade de PM temporários igual ao bônus fornecido por essa habilidade.',
    requirements: [[{ type: RequirementType.NIVEL, value: 11 }]],
  },
  {
    name: 'Inspiração Resoluta',
    text: 'Quando você usa Inspiração, você e seus aliados aplicam o bônus recebido na Defesa (além de testes de perícia).',
    requirements: [],
  },
  {
    name: 'Inspiração Revigorante',
    text: 'Quando você usa Inspiração, você e seus aliados recebem uma quantidade de PV temporários igual a 5 vezes o bônus fornecido.',
    requirements: [],
  },
  {
    name: 'Magia Performática',
    text: 'Quando lança uma magia diante de uma ou mais criaturas inteligentes (Int –3 ou mais), você pode fazer um teste de Atuação (CD 20 + custo em PM da magia) para lançá-la de forma impressionante. Se você passar, a CD da magia aumenta em +1. Esse bônus aumenta em +1 para cada 10 pontos pelos quais o teste passar da CD. Se falhar, a magia não funciona.',
    requirements: [
      [
        { type: RequirementType.ATRIBUTO, name: Atributo.CARISMA, value: 1 },
        { type: RequirementType.PERICIA, name: Skill.ATUACAO },
      ],
    ],
  },
  {
    name: 'Mago Vermelho',
    text: 'Se estiver empunhando uma arma leve ou ágil, você soma o círculo máximo de magias que pode lançar nos testes de ataque e nas rolagens de dano com ela. Além disso, a mão da arma é considerada livre para lançar magias.',
    requirements: [[{ type: RequirementType.PERICIA, name: Skill.MISTICISMO }]],
  },
  {
    name: 'Música: Marcha Vitoriosa',
    text: 'Faça um teste de Atuação. Para cada 10 pontos no resultado desse teste, seus aliados dentro do alcance recebem +1 em rolagens de dano por 1 rodada.',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Inspiração Marcial' },
        { type: RequirementType.NIVEL, value: 5 },
      ],
    ],
  },
  {
    name: 'Música: Réquiem Sombrio',
    text: 'Um cadáver de uma criatura Média ou menor dentro do alcance se ergue como um morto-vivo sob seu comando. Ele é um parceiro iniciante de um tipo a sua escolha aprovado pelo mestre que não conta em seu limite de parceiros. Você pode animar um máximo de cadáveres simultâneos igual ao seu Carisma. Os cadáveres se decompõem no fim da cena.',
    requirements: [
      [
        {
          type: RequirementType.TEXT,
          text: 'Necromancia como uma de suas escolas de magia',
        },
      ],
    ],
  },
  {
    name: 'Música: Sonata da Distração',
    text: 'Faça um teste de Atuação oposto pela Vontade de cada criatura a sua escolha dentro do alcance (você faz um único teste). Alvos que falharem ficam desprevenidos por 1 rodada. Alvos que passarem ficam imunes a este efeito por 1 dia. Mental.',
    requirements: [],
  },
  {
    name: 'Portas da Fama',
    text: 'Você recebe +10 em testes de Diplomacia, Enganação e Furtividade para entrar em lugares proibidos — as pessoas simplesmente presumem que você tem acesso a tudo!',
    requirements: [[{ type: RequirementType.PODER, name: 'Estrelato' }]],
  },
  {
    name: 'Ressoar',
    text: 'Quando lança uma magia que tenha apenas você como alvo, você pode gastar 2 PM e fazer um teste de Atuação (CD 15 + custo em PM da magia). Se você passar, um aliado em alcance curto que esteja sob efeito de sua Inspiração é afetado pelo efeito básico da magia como se você a tivesse lançado nele.',
    requirements: [[{ type: RequirementType.NIVEL, value: 17 }]],
  },
  {
    name: 'Triunfo do Amor',
    text: 'Se você "conquistar" romanticamente um NPC, seus PM aumentam em +1 por nível até o fim da aventura. O mestre define exatamente o que você precisa fazer, de acordo com o NPC. Por padrão, isso envolve aumentar a atitude dele em relação a você para prestativo e então passar em um teste de Atuação, Diplomacia ou Enganação oposto pela Vontade do NPC +10. Você pode receber esse benefício até duas vezes por aventura (ou seja, pode conquistar até duas pessoas por aventura para ganhar +2 PM por nível).',
    requirements: [],
  },
];

export default BARDO_POWERS;
