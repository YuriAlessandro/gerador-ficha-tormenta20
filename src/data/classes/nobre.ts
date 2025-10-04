import { ClassDescription } from '../../interfaces/Class';
import { RequirementType } from '../../interfaces/Poderes';
import Skill from '../../interfaces/Skills';
import { Atributo } from '../atributos';
import PROFICIENCIAS from '../proficiencias';

const NOBRE: ClassDescription = {
  name: 'Nobre',
  pv: 16,
  addpv: 4,
  pm: 4,
  addpm: 4,
  periciasbasicas: [
    {
      type: 'or',
      list: [Skill.DIPLOMACIA, Skill.INTIMIDACAO],
    },
    {
      type: 'and',
      list: [Skill.VONTADE],
    },
  ],
  periciasrestantes: {
    qtd: 4,
    list: [
      Skill.ADESTRAMENTO,
      Skill.ATUACAO,
      Skill.CAVALGAR,
      Skill.CONHECIMENTO,
      Skill.DIPLOMACIA,
      Skill.ENGANACAO,
      Skill.FORTITUDE,
      Skill.GUERRA,
      Skill.INICIATIVA,
      Skill.INTIMIDACAO,
      Skill.INTUICAO,
      Skill.INVESTIGACAO,
      Skill.JOGATINA,
      Skill.LUTA,
      Skill.NOBREZA,
      Skill.OFICIO,
      Skill.PERCEPCAO,
      Skill.PONTARIA,
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
      name: 'Autoconfiança',
      text: 'Você pode usar seu Carisma em vez de Destreza na Defesa (mas continua não podendo somar um atributo na Defesa quando usa armadura pesada).',
      nivel: 1,
    },
    {
      name: 'Espólio',
      text: 'Você recebe um item a sua escolha com preço de até T$ 2.000.',
      nivel: 1,
    },
    {
      name: 'Orgulho',
      text: 'Quando faz um teste de perícia, você pode gastar uma quantidade de PM a sua escolha (limitado pelo seu Carisma). Para cada PM que gastar, recebe +2 no teste.',
      nivel: 1,
    },
    {
      name: 'Palavras Afiadas',
      text: 'Você pode gastar uma ação padrão e 1 PM para fazer um teste de Diplomacia ou Intimidação oposto ao teste de Vontade de uma criatura inteligente (Int –3 ou maior) em alcance curto. Se vencer, você causa 2d6 pontos de dano psíquico não letal à criatura. Se perder, causa metade deste dano. Se a criatura for reduzida a 0 ou menos PV, em vez de cair inconsciente, ela se rende (se você usou Diplomacia) ou fica apavorada e foge de você da maneira mais eficiente possível (se usou Intimidação). A cada quatro níveis, você pode gastar +1 PM para aumentar o dano (veja a tabela da classe). Mental.',
      nivel: 2,
    },
    {
      name: 'Riqueza',
      text: 'No 3º nível, você passa a receber dinheiro de sua família, patrono ou negócios. Uma vez por aventura, pode fazer um teste de Carisma com um bônus igual ao seu nível de nobre. Você recebe um número de Tibares de ouro igual ao resultado do teste. Assim, um nobre de 5º nível com Carisma 4 que role 13 no dado recebe 22 TO. O uso desta habilidade é condicionado a sua relação com sua família, patrono ou negócios e a onde você está. Por exemplo, um nobre viajando pelos ermos, isolado da civilização, dificilmente teria como receber dinheiro.',
      nivel: 3,
    },
    {
      name: 'Gritar Ordens',
      text: 'A partir do 4º nível, você pode gastar uma quantidade de PM a sua escolha (limitado pelo seu Carisma). Até o início de seu próximo turno, todos os seus aliados em alcance curto recebem um bônus nos testes de perícia igual à quantidade de PM que você gastou.',
      nivel: 4,
    },
    {
      name: 'Presença Aristocrática',
      text: 'A partir do 5º nível, sempre que uma criatura inteligente tentar machucá-lo (causar dano com um ataque, magia ou habilidade) você pode gastar 2 PM. Se fizer isso, a criatura deve fazer um teste de Vontade (CD Car). Se falhar, não conseguirá machucá-lo e perderá a ação. Você só pode usar esta habilidade uma vez por cena contra cada criatura.',
      nivel: 5,
    },
    {
      name: 'Realeza',
      text: 'No 20º nível, a CD para resistir a sua Presença Aristocrática aumenta em +5 e uma criatura que falhe no teste de Vontade por 10 ou mais se arrepende tanto de ter tentado machucá-lo que passa a lutar ao seu lado (e seguir suas ordens, se puder entendê-lo) pelo resto da cena. Além disso, uma criatura que seja reduzida a 0 PV por Palavras Afiadas não sofre este dano; em vez disso, passa a lutar ao seu lado pelo resto da cena.',
      nivel: 20,
    },
  ],
  powers: [
    {
      name: 'Armadura Brilhante',
      text: 'Você pode usar seu Carisma na Defesa quando usa armadura pesada. Se fizer isso, não pode somar sua Destreza, mesmo que outras habilidades ou efeitos permitam isso.',
      requirements: [[{ type: RequirementType.NIVEL, value: 8 }]],
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
      name: 'Autoridade Feudal',
      text: 'Você pode gastar uma hora e 2 PM para conclamar o povo a ajudá-lo (qualquer pessoa sem um título de nobreza ou uma posição numa igreja reconhecida pelo seu reino). Em termos de jogo, essas pessoas contam como um parceiro iniciante de um tipo a sua escolha (aprovado pelo mestre) que lhe acompanha até o fim da aventura. Esta habilidade só pode ser usada em locais onde sua posição carregue alguma influência (a critério do mestre).',
      requirements: [[{ type: RequirementType.NIVEL, value: 6 }]],
    },
    {
      name: 'Educação Privilegiada',
      text: 'Você se torna treinado em duas perícias de nobre a sua escolha.',
      requirements: [],
      sheetActions: [
        {
          source: {
            type: 'power',
            name: 'Educação Privilegiada',
          },
          action: {
            type: 'learnSkill',
            availableSkills: [
              Skill.ADESTRAMENTO,
              Skill.ATUACAO,
              Skill.CAVALGAR,
              Skill.CONHECIMENTO,
              Skill.DIPLOMACIA,
              Skill.ENGANACAO,
              Skill.FORTITUDE,
              Skill.GUERRA,
              Skill.INICIATIVA,
              Skill.INTIMIDACAO,
              Skill.INTUICAO,
              Skill.INVESTIGACAO,
              Skill.JOGATINA,
              Skill.LUTA,
              Skill.NOBREZA,
              Skill.PERCEPCAO,
              Skill.PONTARIA,
            ],
            pick: 2,
          },
        },
      ],
    },
    {
      name: 'Estrategista',
      text: 'Você pode direcionar aliados em alcance curto. Gaste uma ação padrão e 1 PM por aliado que quiser direcionar (limitado pelo seu Carisma). No próximo turno do aliado, ele ganha uma ação de movimento.',
      requirements: [
        [
          { type: RequirementType.ATRIBUTO, name: 'Inteligência', value: 1 },
          { type: RequirementType.PERICIA, name: Skill.GUERRA },
          { type: RequirementType.NIVEL, value: 6 },
        ],
      ],
    },
    {
      name: 'Favor',
      text: 'Você pode usar sua influência para pedir favores a pessoas poderosas. Isso gasta 5 PM e uma hora de conversa e bajulação, ou mais, de acordo com o mestre, e funciona como o uso persuasão de Diplomacia (veja a página 118). Porém, você pode pedir favores ainda mais caros, difíceis ou perigosos — um convite para uma festa particular, uma carona de barco até Galrasia ou mesmo acesso aos planos militares do reino. Se você falhar, não pode pedir o mesmo favor por pelo menos uma semana.',
      requirements: [],
    },
    {
      name: 'General',
      text: 'Quando você usa o poder Estrategista, aliados direcionados recebem 1d4 PM temporários. Esses PM duram até o fim do turno do aliado e não podem ser usados em efeitos que concedam PM.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Estrategista' },
          { type: RequirementType.NIVEL, value: 12 },
        ],
      ],
    },
    {
      name: 'Grito Tirânico',
      text: 'Você pode usar Palavras Afiadas como uma ação completa, em vez de padrão. Se fizer isso, seus dados de dano aumentam para d8 e você atinge todos os inimigos em alcance curto.',
      requirements: [[{ type: RequirementType.NIVEL, value: 8 }]],
    },
    {
      name: 'Inspirar Confiança',
      text: 'Sua presença faz as pessoas darem o melhor de si. Quando um aliado em alcance curto faz um teste, você pode gastar 2 PM para fazer com que ele possa rolar esse teste novamente.',
      requirements: [],
    },
    {
      name: 'Inspirar Glória',
      text: 'A presença de um nobre motiva as pessoas a realizarem grandes façanhas. Uma vez por rodada, você pode gastar 5 PM para fazer um aliado em alcance curto ganhar uma ação padrão adicional no próximo turno dele. Você só pode usar esta habilidade uma vez por cena em cada aliado.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Inspirar Confiança' },
          { type: RequirementType.NIVEL, value: 8 },
        ],
      ],
    },
    {
      name: 'Jogo da Corte',
      text: 'Você pode gastar 1 PM para rolar novamente um teste recém realizado de Diplomacia, Intuição ou Nobreza.',
      requirements: [],
    },
    {
      name: 'Liderar pelo Exemplo',
      text: 'Você pode gastar 2 PM para servir de inspiração. Até o início de seu próximo turno, sempre que você passar em um teste de perícia, aliados em alcance curto que fizerem um teste da mesma perícia podem usar o resultado do seu teste em vez de fazer o seu próprio.',
      requirements: [[{ type: RequirementType.NIVEL, value: 6 }]],
    },
    {
      name: 'Língua de Ouro',
      text: 'Você pode gastar uma ação padrão e 4 PM para gerar o efeito da magia Enfeitiçar com os aprimoramentos de sugerir ação e afetar todas as criaturas dentro do alcance (CD Car). Esta não é uma habilidade mágica e provém de sua capacidade de influenciar outras pessoas.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Língua de Prata' },
          { type: RequirementType.NIVEL, value: 8 },
        ],
      ],
    },
    {
      name: 'Língua de Prata',
      text: 'Quando faz um teste de perícia baseada em Carisma, você pode gastar 2 PM para receber um bônus no teste igual a metade do seu nível.',
      requirements: [],
    },
    {
      name: 'Língua Rápida',
      text: 'Quando faz um teste de Diplomacia para mudar atitude como uma ação completa, você sofre uma penalidade de –5, em vez de –10.',
      requirements: [],
    },
    {
      name: 'Presença Majestosa',
      text: 'Sua Presença Aristocrática passa a funcionar contra qualquer criatura com valor de Inteligência (passa a afetar até mesmo animais, embora continue não funcionando contra criaturas sem Int). Além disso, você pode usá-la mais de uma vez contra uma mesma criatura na mesma cena.',
      requirements: [[{ type: RequirementType.NIVEL, value: 16 }]],
    },
    {
      name: 'Título',
      text: 'Você adquire um título de nobreza. Converse com o mestre para definir os benefícios exatos de seu título. Como regra geral, no início de cada aventura você recebe 20 TO por nível de nobre (rendimentos dos impostos) ou a ajuda de um parceiro veterano (um membro de sua corte).',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Autoridade Feudal' },
          { type: RequirementType.NIVEL, value: 10 },
          {
            type: RequirementType.TEXT,
            text: 'Ter conquistado terras ou realizado um serviço para um nobre que possa se tornar seu suserano.',
          },
        ],
      ],
    },
    {
      name: 'Voz Poderosa',
      text: 'Você recebe +2 em Diplomacia e Intimidação. Suas habilidades de nobre com alcance curto passam para alcance médio.',
      requirements: [],
      sheetBonuses: [
        {
          source: {
            type: 'power',
            name: 'Voz Poderosa',
          },
          target: {
            type: 'Skill',
            name: Skill.DIPLOMACIA,
          },
          modifier: {
            type: 'Fixed',
            value: 2,
          },
        },
        {
          source: {
            type: 'power',
            name: 'Voz Poderosa',
          },
          target: {
            type: 'Skill',
            name: Skill.INTIMIDACAO,
          },
          modifier: {
            type: 'Fixed',
            value: 2,
          },
        },
      ],
    },
  ],
  probDevoto: 0.3,
  faithProbability: {
    AZGHER: 1,
    HYNINN: 1,
    KALLYADRANOCH: 1,
    KHALMYR: 1,
    LENA: 1,
    LINWU: 1,
    MARAH: 1,
    SSZZAAS: 1,
    TANNATOH: 1,
    VALKARIA: 1,
  },
  attrPriority: [Atributo.CARISMA],
};

export default NOBRE;
