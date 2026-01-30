import { ClassPower } from '../../../../../interfaces/Class';
import { RequirementType } from '../../../../../interfaces/Poderes';
import Skill from '../../../../../interfaces/Skills';

/**
 * Poderes de Clérigo do suplemento Heróis de Arton
 */
const CLERIGO_POWERS: ClassPower[] = [
  {
    name: 'Acólito Escudeiro',
    text: 'Você recebe os serviços de um acólito escudeiro, um parceiro especial que não conta em seu limite de parceiros. Você recebe +2 em Religião e o custo de uma de suas magias de 1º círculo, escolhida ao você receber este poder, diminui em –1 PM. Além disso, você pode gastar 1 PM para receber os efeitos de um esotérico ou catalisador em seu inventário, mesmo que não o esteja empunhando. Caso perca seu acólito, você pode treinar outro com uma semana de trabalho.',
    requirements: [
      [{ type: RequirementType.PODER, name: 'Autoridade Eclesiástica' }],
    ],
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Acólito Escudeiro' },
        target: { type: 'Skill', name: Skill.RELIGIAO },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
  {
    name: 'Arma Divina',
    text: 'Quando você usa Abençoar Arma, além dos efeitos normais, a sua arma adquire os efeitos do encanto sagrado (se você canalizar energia positiva) ou do encanto profano (se você canalizar energia negativa).',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Abençoar Arma' },
        { type: RequirementType.NIVEL, value: 7 },
      ],
    ],
  },
  {
    name: 'Bênção de Batalha',
    text: 'Bênção passa a afetar também você (em vez de apenas seus aliados). Além disso, na primeira rodada de combate, você pode lançar essa magia como ação de movimento (em vez de padrão).',
    requirements: [[{ type: RequirementType.MAGIA, name: 'Bênção' }]],
  },
  {
    name: 'Canalizar Abençoado',
    text: 'Quando você usa Canalizar Energia Positiva, pode gastar 1 PM. Se fizer isso, além do normal, as criaturas afetadas recebem 10 PV temporários.',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Canalizar Energia Positiva' },
        { type: RequirementType.NIVEL, value: 11 },
      ],
    ],
  },
  {
    name: 'Canalizar Concentrado',
    text: 'Quando usa Canalizar Energia, você pode afetar apenas uma criatura no alcance (em vez de todas). Se fizer isso, a cura ou o dano da habilidade aumenta em +1 por dado e a CD aumenta em +2.',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Canalizar Energia' },
        { type: RequirementType.NIVEL, value: 11 },
      ],
    ],
  },
  {
    name: 'Canalizar Profanado',
    text: 'Quando você usa Canalizar Energia Negativa, pode gastar 1 PM. Se fizer isso, além do normal, criaturas que falhem na resistência não podem recuperar PV por 1 rodada.',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Canalizar Energia Negativa' },
        { type: RequirementType.NIVEL, value: 11 },
      ],
    ],
  },
  {
    name: 'Canalizar Poderoso',
    text: 'Os dados de seu Canalizar Energia mudam para d10.',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Canalizar Amplo' },
        { type: RequirementType.NIVEL, value: 9 },
      ],
    ],
  },
  {
    name: 'Conversão de Fé',
    text: 'Uma vez por cena, você pode gastar uma ação completa e 3 PM para pregar sua fé a uma criatura inteligente (Int –3 ou maior) do tipo lacaio em alcance curto. Faça um teste de Religião oposto ao teste de Vontade da criatura (você recebe +5 no teste com devotos de seu deus, mas sofre –5 com devotos de outros deuses). Se você vencer, até o fim da cena a atitude da criatura se torna prestativa com relação a você e ela passa a atuar como um parceiro iniciante de um tipo à escolha do mestre, que não conta no seu limite de parceiros.',
    requirements: [
      [{ type: RequirementType.PODER, name: 'Autoridade Eclesiástica' }],
    ],
  },
  {
    name: 'Dizimar Infiéis',
    text: 'Se estiver usando uma arma afetada por Abençoar Arma, você pode gastar uma ação padrão e 2 PM para canalizar a punição divina! Faça um ataque corpo a corpo e compare o resultado com a Defesa de cada criatura em alcance curto. Então faça uma rolagem de dano e aplique-a em cada criatura atingida. Cada inimigo atingido fica ofuscado (se você canaliza energia positiva) ou vulnerável (se canaliza energia negativa) por 1 rodada.',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Abençoar Arma' },
        { type: RequirementType.NIVEL, value: 5 },
      ],
    ],
  },
  {
    name: 'Égide da Fé',
    text: 'Quando você lança Escudo da Fé, a magia também fornece 5 PV temporários para cada +1 na Defesa. Esses PV temporários duram até o fim da cena.',
    requirements: [[{ type: RequirementType.MAGIA, name: 'Escudo da Fé' }]],
  },
  {
    name: 'Força da Devoção',
    text: 'Quando você lança uma magia de clérigo, sua CD aumenta em +1 para cada dois poderes concedidos de sua divindade que você possui.',
    requirements: [[{ type: RequirementType.NIVEL, value: 6 }]],
  },
  {
    name: 'Liturgia Marcial',
    text: 'Você pode gastar uma ação de movimento para executar uma breve liturgia de sua fé. Se fizer isso, você recebe +2 no teste de ataque e na rolagem de dano de seu próximo ataque corpo a corpo nesse turno.',
    requirements: [],
  },
  {
    name: 'Missa: Compartilhar Milagre',
    text: 'Escolha um dos seus poderes concedidos. Até o fim do dia, cada participante desta Missa pode usar esse poder durante 1 rodada, como se fosse devoto da sua divindade (os demais pré-requisitos do poder ainda devem ser cumpridos).',
    requirements: [[{ type: RequirementType.NIVEL, value: 17 }]],
  },
  {
    name: 'Missa: Imposição da Vontade',
    text: 'A CD para resistir às habilidades dos participantes aumenta em +1.',
    requirements: [],
  },
  {
    name: 'Missa: Mente Abençoada',
    text: 'Os participantes recebem +2 em testes de perícias baseadas em Sabedoria.',
    requirements: [],
  },
  {
    name: 'Presente dos Deuses',
    text: 'Você recebe uma arma superior e mágica, com duas melhorias e um encanto a sua escolha. Normalmente, será a arma preferida de seu deus, mas pode ser outra, de acordo com o mestre. A cada quatro níveis, a arma ganha mais uma melhoria e um encanto a sua escolha. Nas mãos de uma pessoa que não seja devota de sua divindade, a arma se comporta como um item mundano. Se a arma for perdida ou destruída, você pode receber outra fazendo uma penitência (como se tivesse descumprido as Obrigações & Restrições de sua divindade).',
    requirements: [[{ type: RequirementType.NIVEL, value: 9 }]],
  },
  {
    name: 'Punição Divina',
    text: 'Uma vez por rodada, quando lança uma magia divina com tempo de execução de ação de movimento em si mesmo, você pode gastar +2 PM fazer um ataque como ação livre.',
    requirements: [[{ type: RequirementType.PODER, name: 'Prece de Combate' }]],
  },
  {
    name: 'Representante Divino',
    text: 'Você fala com a autoridade de seu deus. Escolha uma magia divina que possa lançar com tempo de execução de ação padrão ou completa. Você pode lançar essa magia como uma ação de movimento, sem precisar gesticular ou se concentrar (mas ainda precisa falar).',
    requirements: [[{ type: RequirementType.NIVEL, value: 17 }]],
  },
  {
    name: 'Solo Profanado',
    text: 'Quando você lança uma magia de dano de trevas dentro de uma área de Profanar, criaturas que falhem no teste de resistência da magia não podem curar PV por um número de rodadas igual ao círculo da magia.',
    requirements: [[{ type: RequirementType.MAGIA, name: 'Profanar' }]],
  },
  {
    name: 'Solo Sagrado',
    text: 'Quando você lança uma magia de luz dentro de uma área de Consagrar, criaturas a sua escolha nessa área recebem RD igual ao dobro do círculo da magia contra o próximo dano que sofrerem até o início do seu próximo turno.',
    requirements: [[{ type: RequirementType.MAGIA, name: 'Consagrar' }]],
  },
];

export default CLERIGO_POWERS;
