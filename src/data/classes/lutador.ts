import { ClassDescription } from '../../interfaces/Class';
import { RequirementType } from '../../interfaces/Poderes';
import Skill from '../../interfaces/Skills';
import { Atributo } from '../atributos';
import PROFICIENCIAS from '../proficiencias';

const LUTADOR: ClassDescription = {
  name: 'Lutador',
  pv: 20,
  addpv: 5,
  pm: 3,
  addpm: 3,
  periciasbasicas: [
    {
      type: 'and',
      list: [Skill.LUTA, Skill.FORTITUDE],
    },
  ],
  periciasrestantes: {
    qtd: 4,
    list: [
      Skill.ACROBACIA,
      Skill.ADESTRAMENTO,
      Skill.ATLETISMO,
      Skill.ENGANACAO,
      Skill.FURTIVIDADE,
      Skill.INICIATIVA,
      Skill.INTIMIDACAO,
      Skill.OFICIO,
      Skill.PERCEPCAO,
      Skill.PONTARIA,
      Skill.REFLEXOS,
    ],
  },
  proficiencias: [PROFICIENCIAS.LEVES, PROFICIENCIAS.SIMPLES],
  abilities: [
    {
      name: 'Briga',
      text: 'Seus ataques desarmados causam 1d6 pontos de dano e podem causar dano letal ou não letal (sem penalidades). A cada quatro níveis, seu dano desarmado aumenta, conforme a tabela. O dano na tabela é para criaturas Pequenas e Médias. Criaturas Minúsculas diminuem esse dano em um passo, Grandes e Enormes aumentam em um passo e Colossais aumentam em dois passos.',
      nivel: 1,
    },
    {
      name: 'Golpe Relâmpago',
      text: 'Quando usa a ação agredir para fazer um ataque desarmado, você pode gastar 1 PM para realizar um ataque desarmado adicional.',
      nivel: 1,
    },
    {
      name: 'Casca Grossa',
      text: 'No 3º nível, você soma sua Constituição na Defesa, limitado pelo seu nível e apenas se não estiver usando armadura pesada. Além disso, no 7º nível, e a cada quatro níveis, você recebe +1 na Defesa.',
      nivel: 3,
    },
    {
      name: 'Golpe Cruel',
      text: 'No 5º nível, você acerta onde dói. Sua margem de ameaça com ataques desarmados aumenta em +1.',
      nivel: 5,
    },
    {
      name: 'Golpe Violento',
      text: ' No 9º nível, você bate com muita força. Seu multiplicador de crítico com ataques desarmados aumenta em +1.',
      nivel: 9,
    },
    {
      name: 'Dono da Rua',
      text: 'No 20º nível, seu dano desarmado aumenta para 2d10 (para criaturas Médias). Além disso, quando usa a ação agredir para fazer um ataque desarmado, você pode fazer dois ataques, em vez de um (podendo usar Golpe Relâmpago para fazer um terceiro).',
      nivel: 20,
    },
  ],
  powers: [
    {
      name: 'Arma Improvisada',
      text: 'Para você, atacar com armas improvisadas conta como fazer um ataque desarmado, mas seu dano aumenta em um passo. Você pode gastar uma ação de movimento para procurar uma pedra, cadeira, garrafa ou qualquer coisa que possa usar como arma. Faça um teste de Percepção (CD 20). Se você passar, encontra uma arma improvisada. Armas improvisadas são frágeis; se você errar um ataque e o resultado do d20 for um número ímpar, a arma quebra.',
      requirements: [],
    },
    {
      name: 'Até Acertar',
      text: 'Se você errar um ataque desarmado, recebe um bônus cumulativo de +2 em testes de ataque e rolagens de dano desarmado contra o mesmo oponente. Os bônus terminam quando você acertar um ataque ou no fim da cena, o que acontecer primeiro.',
      requirements: [],
    },
    {
      name: 'Aumento de Atributo',
      text: 'Você recebe +1 em um atributo. Você pode escolher este poder várias vezes, mas apenas uma vez por patamar para um mesmo atributo.',
      requirements: [],
      canRepeat: true,
      sheetActions: [
        {
          source: { type: 'power', name: 'Aumento de Atributo' },
          action: { type: 'increaseAttribute' },
        },
      ],
    },
    {
      name: 'Braços Calejados',
      text: 'Se você não estiver usando armadura, soma sua Força na Defesa, limitado pelo seu nível.',
      requirements: [],
    },
    {
      name: 'Cabeçada',
      text: 'Quando faz um ataque desarmado, você pode gastar 2 PM. Se fizer isso, o oponente fica desprevenido contra este ataque. Você só pode usar este poder uma vez por cena contra um mesmo alvo.',
      requirements: [],
    },
    {
      name: 'Chave',
      text: 'Se estiver agarrando uma criatura e fizer um teste de manobra contra ela para causar dano, o dano desarmado aumenta em um passo.',
      requirements: [
        [
          { type: RequirementType.ATRIBUTO, name: 'Inteligência', value: 1 },
          { type: RequirementType.PODER, name: 'Lutador de Chão' },
          { type: RequirementType.NIVEL, value: 4 },
        ],
      ],
    },
    {
      name: 'Confiança dos Ringues',
      text: 'Quando um inimigo erra um ataque corpo a corpo contra você, você recebe 2 PM temporários (cumulativos). Você pode ganhar um máximo de PM temporários por cena igual ao seu nível. Esses pontos temporários desaparecem no final da cena.',
      requirements: [[{ type: RequirementType.NIVEL, value: 8 }]],
    },
    {
      name: 'Convencido',
      text: 'Acostumado a contar apenas com seus músculos, você adquiriu certo desdém por artes mais sofisticadas. Você recebe resistência a medo e mental +5.',
      requirements: [],
    },
    {
      name: 'Golpe Baixo',
      text: 'Quando faz um ataque desarmado, você pode gastar 2 PM. Se fizer isso e acertar o ataque, o oponente deve fazer um teste de Fortitude (CD For). Se ele falhar, fica atordoado por uma rodada (apenas uma vez por cena).',
      requirements: [],
    },
    {
      name: 'Golpe Imprudente',
      text: 'Quando usa Golpe Relâmpago, você pode atacar de forma impulsiva. Se fizer isso, seus ataques desarmados recebem um dado de dano extra do mesmo tipo (por exemplo, se o seu dano é 2d6, você causa 3d6), mas você sofre –5 na Defesa até o início de seu próximo turno.',
      requirements: [],
    },
    {
      name: 'Imobilização',
      text: 'Se estiver agarrando uma criatura, você pode gastar uma ação completa para imobilizá-la. Faça um teste de manobra contra ela. Se você passar, imobiliza a criatura — ela fica indefesa e não pode realizar nenhuma ação, exceto tentar se soltar (o que exige um teste de manobra). Se a criatura se soltar da imobilização, ainda fica agarrada. Enquanto estiver imobilizando uma criatura, você sofre as penalidades de agarrar.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Chave' },
          { type: RequirementType.NIVEL, value: 8 },
        ],
      ],
    },
    {
      name: 'Língua dos Becos',
      text: 'Você pode pagar 1 PM para usar sua Força no lugar de Carisma em um teste de perícia baseada em Carisma.',
      requirements: [
        [
          { type: RequirementType.ATRIBUTO, name: 'Força', value: 1 },
          { type: RequirementType.PERICIA, name: Skill.INTIMIDACAO },
        ],
      ],
    },
    {
      name: 'Lutador de Chão',
      text: 'Você recebe +2 em testes de ataque para agarrar e derrubar. Quando agarra uma criatura, pode gastar 1 PM para fazer uma manobra derrubar contra ela como uma ação livre.',
      requirements: [],
    },
    {
      name: 'Nome na Arena',
      text: 'Você construiu uma reputação no circuito de lutas de Arton. Uma vez por cena, pode gastar uma ação completa para fazer um teste de Luta (CD 10) e impressionar os presentes. Se passar, você recebe +2 em todos os seus testes de perícias originalmente baseadas em Carisma até o fim da cena e a atitude de qualquer pessoa que seja fã de lutas aumenta em uma categoria em relação a você (veja a página 259). Esse bônus aumenta em +2 para cada 10 pontos pelos quais o resultado do teste exceder a CD (+4 para um resultado 20, +6 para 30 e assim por diante).',
      requirements: [[{ type: RequirementType.NIVEL, value: 11 }]],
    },
    {
      name: 'Punhos de Adamante',
      text: 'Seus ataques desarmados ignoram 10 pontos de redução de dano do alvo, se houver.',
      requirements: [[{ type: RequirementType.NIVEL, value: 8 }]],
    },
    {
      name: 'Rasteira',
      text: 'Quando faz um ataque desarmado contra uma criatura até uma categoria de tamanho maior que a sua, você pode gastar 2 PM. Se fizer isso e acertar o ataque, a criatura fica caída.',
      requirements: [],
    },
    {
      name: 'Sarado',
      text: 'Você soma sua Força no seu total de pontos de vida e em Fortitude. Você pode usar Força em vez de Carisma em testes de Diplomacia com pessoas que se atraiam por físicos bem definidos.',
      requirements: [
        [{ type: RequirementType.ATRIBUTO, name: 'Força', value: 3 }],
      ],
      sheetBonuses: [
        {
          source: {
            type: 'power',
            name: 'Sarado',
          },
          target: {
            type: 'PV',
          },
          modifier: {
            type: 'Attribute',
            attribute: Atributo.FORCA,
          },
        },
        {
          source: {
            type: 'power',
            name: 'Sarado',
          },
          target: {
            type: 'Skill',
            name: Skill.FORTITUDE,
          },
          modifier: {
            type: 'Attribute',
            attribute: Atributo.FORCA,
          },
        },
      ],
    },
    {
      name: 'Sequência Destruidora',
      text: 'No início do seu turno, você pode gastar 2 PM para dizer um número (no mínimo 2). Se fizer e acertar uma quantidade de ataques igual ao número dito, o último recebe um bônus cumulativo de +4 na rolagem de dano por ataque feito. Por exemplo, se você falar “três” e fizer e acertar três ataques, o último ataque (o terceiro) receberá +12 na rolagem de dano.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Trocação' },
          { type: RequirementType.NIVEL, value: 12 },
        ],
      ],
    },
    {
      name: 'Trincado',
      text: 'Esculpido à exaustão, seu corpo se tornou uma máquina. Você soma sua Constituição nas rolagens de dano desarmado.',
      requirements: [
        [
          { type: RequirementType.ATRIBUTO, name: 'Constituição', value: 3 },
          { type: RequirementType.PODER, name: 'Sarado' },
          { type: RequirementType.NIVEL, value: 10 },
        ],
      ],
    },
    {
      name: 'Trocação',
      text: 'Quando você começa a bater, não para mais. Ao acertar um ataque desarmado, pode fazer outro ataque desarmado contra o mesmo alvo, pagando uma quantidade de PM igual à quantidade de ataques já realizados no turno. Ou seja, pode fazer o primeiro ataque extra gastando 1 PM, um segundo ataque extra gastando mais 2 PM e assim por diante, até errar um ataque ou não ter mais pontos de mana.',
      requirements: [[{ type: RequirementType.NIVEL, value: 6 }]],
    },
    {
      name: 'Trocação Tumultuosa',
      text: 'Quando usa a ação agredir para fazer um ataque desarmado, você pode gastar 2 PM para atingir todas as criaturas adjacentes — incluindo aliados! Você deve usar este poder antes de rolar o ataque e compara o resultado de seu teste contra a Defesa de cada criatura.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Trocação' },
          { type: RequirementType.NIVEL, value: 8 },
        ],
      ],
    },
    {
      name: 'Valentão',
      text: 'Você recebe +2 em testes de ataque e rolagens de dano contra oponentes caídos, desprevenidos, flanqueados ou indefesos.',
      requirements: [],
    },
    {
      name: 'Voadora',
      text: 'Quando faz uma investida desarmada, você pode gastar 2 PM. Se fizer isso, recebe +1d6 no dano para cada 3m que se deslocar até chegar ao oponente, limitado pelo seu nível.',
      requirements: [],
    },
  ],
  probDevoto: 0.3,
  faithProbability: {
    ARSENAL: 1,
    KALLYADRANOCH: 1,
    MEGALOKK: 1,
    THYATIS: 1,
    VALKARIA: 1,
  },
  attrPriority: [Atributo.FORCA, Atributo.CONSTITUICAO],
};

export default LUTADOR;
