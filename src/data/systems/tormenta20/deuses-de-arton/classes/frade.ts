import _ from 'lodash';
import { ClassDescription } from '../../../../../interfaces/Class';
import { RequirementType } from '../../../../../interfaces/Poderes';
import Skill from '../../../../../interfaces/Skills';
import { Atributo } from '../../atributos';
import { standardFaithProbability } from '../../divindades';

const FRADE: ClassDescription = {
  name: 'Frade',
  pv: 12,
  addpv: 3,
  pm: 6,
  addpm: 6,
  periciasbasicas: [
    {
      type: 'and',
      list: [Skill.RELIGIAO, Skill.VONTADE],
    },
  ],
  periciasrestantes: {
    qtd: 4,
    list: [
      Skill.ADESTRAMENTO,
      Skill.ATUACAO,
      Skill.CONHECIMENTO,
      Skill.CURA,
      Skill.DIPLOMACIA,
      Skill.FORTITUDE,
      Skill.GUERRA,
      Skill.INICIATIVA,
      Skill.INTIMIDACAO,
      Skill.INTUICAO,
      Skill.INVESTIGACAO,
      Skill.MISTICISMO,
      Skill.NOBREZA,
      Skill.OFICIO,
      Skill.PERCEPCAO,
    ],
  },
  proficiencias: [],
  abilities: [
    {
      name: 'Devoto Fiel',
      text: 'Você se torna devoto de um deus maior. Veja as regras de devotos em Tormenta20, p. 96. Ao contrário de devotos normais, você recebe dois poderes concedidos por se tornar devoto, em vez de apenas um. Como alternativa, você pode cultuar o Panteão como um todo. Não recebe nenhum Poder Concedido, mas sua única obrigação e restrição é não usar armas cortantes ou perfurantes (porque derramam sangue, algo que frades do Panteão consideram proibido). Sua arma preferida é a maça e você pode canalizar energia positiva ou negativa a sua escolha (uma vez feita, essa escolha não pode ser mudada). Cultuar o Panteão conta como sua devoção.',
      nivel: 1,
    },
    {
      name: 'Erudição',
      text: 'Quando faz um teste de perícia (exceto de ataque), você pode gastar uma quantidade de PM a sua escolha (limitada pela sua Inteligência). Para cada PM que gastar, recebe +2 no teste.',
      nivel: 1,
    },
    {
      name: 'Magias',
      text: 'Você pode lançar magias divinas de 1º círculo. A cada quatro níveis, pode lançar magias de um círculo maior (2º círculo no 5º nível, 3º círculo no 9º nível e assim por diante). Você começa com três magias de 1º círculo. A cada nível, aprende uma magia de qualquer círculo que possa lançar. Você pode lançar essas magias vestindo armaduras leves mas, se estiver usando armadura pesada, precisará fazer um teste de Misticismo como se fosse um conjurador arcano (veja "Armaduras e Magia Arcana", em Tormenta20, p. 171). Seu atributo-chave para lançar magias é Sabedoria e você soma sua Sabedoria no seu total de PM. Veja o Capítulo 4 de Tormenta20 para as regras de magia.',
      nivel: 1,
      sheetBonuses: [
        {
          source: {
            type: 'power',
            name: 'Magias',
          },
          target: {
            type: 'PM',
          },
          modifier: {
            type: 'Attribute',
            attribute: Atributo.SABEDORIA,
          },
        },
      ],
    },
    {
      name: 'Versiculário',
      text: 'No 2º nível, você recebe um versiculário, um livro de anotações religiosas pessoais. Uma vez por dia, você pode gastar 1 hora estudando suas anotações no versiculário. Quando faz isso, escolha uma quantidade de magias igual à sua Inteligência (limitada pelo seu nível). Até o próximo dia, quando lança uma dessas magias, você recebe +1 PM para gastar em aprimoramentos. Se perder seu versiculário, você pode escrever outro com 1 semana de trabalho e o gasto de T$ 100.',
      nivel: 2,
    },
    {
      name: 'Dádiva da Fé',
      text: 'No 5º nível, você recebe Proteção Sagrada (se sua divindade canaliza energia positiva) ou Cólera Divina (se canaliza energia negativa). Proteção Sagrada: Você pode gastar uma ação de movimento e até 2 PM por círculo de magia a que tem acesso para energizar seu símbolo sagrado até o fim da cena. Enquanto você estiver empunhando o símbolo, ele projeta uma aura com 9m de raio. Criaturas a sua escolha dentro dessa aura recebem redução de dano igual à metade do total de PM gastos. Cólera Divina: Você pode gastar uma ação de movimento e até 2 PM por círculo de magia a que tem acesso para energizar seu símbolo sagrado até o fim da cena. Enquanto você estiver empunhando o símbolo, ele projeta uma aura com 9m de raio. Criaturas a sua escolha dentro dessa aura recebem um bônus em suas rolagens de dano igual à metade do total de PM gastos.',
      nivel: 5,
    },
    {
      name: 'Solo Santificado',
      text: 'No 20º nível, o raio de sua Dádiva da Fé muda para 30m e criaturas afetadas por ela também somam o bônus concedido pela habilidade na CD de suas próprias habilidades.',
      nivel: 20,
    },
  ],
  powers: [
    {
      name: 'Acelerar Sacrário',
      text: 'Quando cria um sacrário, você pode gastar +2 PM para criá-lo como uma ação de movimento (em vez de uma ação padrão).',
      requirements: [[{ type: RequirementType.NIVEL, value: 5 }]],
    },
    {
      name: 'Ampliar Sacrário',
      text: 'Você pode criar sacrários em alcance médio e eles passam a ocupar uma esfera de 6m de raio.',
      requirements: [[{ type: RequirementType.NIVEL, value: 10 }]],
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
      name: 'Autoridade Eclesiástica',
      text: 'Você possui uma posição formal em uma igreja reconhecida pelos outros membros de sua fé. Os efeitos deste poder variam de acordo com sua divindade.',
      requirements: [
        [
          { type: RequirementType.NIVEL, value: 5 },
          { type: RequirementType.DEVOTO, name: 'any' },
        ],
      ],
      sheetActions: [
        {
          source: { type: 'power', name: 'Autoridade Eclesiástica' },
          action: {
            type: 'special',
            specialAction: 'fradeAutoridadeEclesiastica',
          },
        },
      ],
    },
    {
      name: 'Bênção Fortalecedora',
      text: 'Quando você lança Bênção, os aliados abençoados recebem uma quantidade de PV temporários igual a 5 vezes o bônus em testes de ataque fornecido pela magia. Esses PV temporários duram enquanto a magia durar.',
      requirements: [[{ type: RequirementType.MAGIA, name: 'Bênção' }]],
    },
    {
      name: 'Canto Monástico',
      text: 'Você pode gastar uma ação padrão e 1 PM para entoar um cântico religioso. Faça um teste de Atuação para ajudar. Seus aliados em alcance curto recebem um bônus igual ao bônus de ajuda em um teste de perícia feito até o fim da cena ou na CD para resistir a uma de suas habilidades usada até o fim da cena.',
      requirements: [[{ type: RequirementType.PERICIA, name: 'Atuação' }]],
    },
    {
      name: 'Comunhão Vital',
      text: 'Quando lança uma magia que cure uma criatura, você pode pagar +2 PM para que outra criatura em alcance curto (incluindo você mesmo) recupere uma quantidade de pontos de vida igual à metade dos PV da cura original.',
      requirements: [],
    },
    {
      name: 'Copista',
      text: 'Você pode criar pergaminhos, como se tivesse o poder Escrever Pergaminho. Se tiver ambos, pode fabricar o dobro de pergaminhos ao mesmo tempo (pagando o custo de matéria-prima de ambos).',
      requirements: [[{ type: RequirementType.PERICIA, name: 'Ofício' }]],
    },
    {
      name: 'Conhecimento Mágico',
      text: 'Você aprende duas magias de qualquer círculo que possa lançar. Você pode escolher este poder quantas vezes quiser.',
      requirements: [],
      canRepeat: true,
      sheetActions: [
        {
          source: {
            type: 'power',
            name: 'Conhecimento Mágico',
          },
          action: {
            type: 'learnAnySpellFromHighestCircle',
            allowedType: 'Divine',
            pick: 2,
          },
        },
      ],
    },
    {
      name: 'Cozinheiro da Abadia',
      text: 'Quando prepara um prato especial, você pode combinar os efeitos de dois pratos. Você faz apenas um teste de Ofício, mas paga o custo de ambos.',
      requirements: [[{ type: RequirementType.PERICIA, name: 'Ofício' }]],
    },
    {
      name: 'Estudante Diligente',
      text: 'No começo do dia você pode escolher uma perícia em que não seja treinado. Se fizer isso, até o fim do dia você sofre uma penalidade de –2 PM, mas pode fazer testes da perícia escolhida como se fosse treinado nela.',
      requirements: [],
    },
    {
      name: 'Fé e Razão',
      text: 'Quando usa uma habilidade de frade, você pode gastar uma quantidade de PM limitada por sua Inteligência. Se fizer isso, a CD dessa habilidade aumenta em +1 por PM gasto.',
      requirements: [],
    },
    {
      name: 'Mago Branco',
      text: 'Suas magias de cura de luz custam –1 PM e curam +1 PV por dado de cura.',
      requirements: [[{ type: RequirementType.NIVEL, value: 3 }]],
    },
    {
      name: 'Memorizar Liturgia',
      text: 'Uma vez por dia, você pode gastar 1 hora de estudo e um número de pergaminhos que contenham magias divinas igual ou menor que sua Inteligência. Até o fim do dia, você pode lançar as magias contidas nesses pergaminhos como se as conhecesse ou, se já conhecia a magia, você soma sua Inteligência no limite de PM para lançá-la.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Copista' },
          { type: RequirementType.NIVEL, value: 8 },
        ],
      ],
    },
    {
      name: 'Ofício do Mosteiro',
      text: 'Você pode fabricar itens de vestuário com Ofício (artesão) e pode usar essa perícia para fabricar itens com uma melhoria.',
      requirements: [[{ type: RequirementType.PERICIA, name: 'Ofício' }]],
    },
    {
      name: 'Psicografia',
      text: 'Seus textos recebem inspiração divina. Você pode fabricar pergaminhos de qualquer magia divina (mesmo uma que não conheça) de quaisquer círculos a que tenha acesso. A CD para fabricar um desses pergaminhos aumenta em +5.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Copista' },
          { type: RequirementType.NIVEL, value: 5 },
        ],
      ],
    },
    {
      name: 'Sacrário da Erudição',
      text: 'Quando lançam magias a partir de pergaminhos, você e seus aliados dentro do sacrário recebem +1 PM para gastar em aprimoramentos (mesmo que não conheçam a magia).',
      requirements: [],
    },
    {
      name: 'Sacrário da Misericórdia',
      text: 'No início dos seus turnos, cada criatura a sua escolha dentro do sacrário recupera uma quantidade de PV igual a 5 + sua Sabedoria. Este sacrário tem duração sustentada.',
      requirements: [[{ type: RequirementType.NIVEL, value: 5 }]],
    },
    {
      name: 'Sacrário da Resiliência',
      text: 'Você e seus aliados dentro do sacrário recebem +2 em testes de resistência e na Defesa. Quando cria este sacrário, você pode gastar mais PM para fortalecer seu efeito; para cada 2 PM adicionais gastos, o bônus concedido pelo sacrário aumenta em +1 (bônus máximo limitado pelo círculo máximo de magias que você pode lançar).',
      requirements: [[{ type: RequirementType.NIVEL, value: 5 }]],
    },
    {
      name: 'Sacrário da Solenidade',
      text: 'Criaturas dentro da área ficam sob condição terrível para lançar magias e sofrem –2 na Defesa. Quando cria este sacrário você pode gastar mais PM para fortalecer seu efeito; para cada 2 PM adicionais gastos, a penalidade causada pelo sacrário aumenta em 1 (penalidade máxima limitada pelo círculo máximo de magias que você pode lançar).',
      requirements: [],
    },
    {
      name: 'Sacrário da Verdade',
      text: 'Sempre que uma criatura na área passa em um teste de Acrobacia, Enganação, Furtividade ou Ladinagem, ou acerta um ataque contra uma criatura sob efeito de uma ou mais condições, ela sofre 2d6 pontos de dano psíquico por círculo de magia a que você tem acesso.',
      requirements: [],
    },
    {
      name: 'Sacrário das Sombras',
      text: 'A área do sacrário é coberta por sombras; criaturas dentro dela recebem camuflagem leve e, se forem mortos-vivos, também recebem +2 na Defesa e em testes de perícia.',
      requirements: [],
    },
    {
      name: 'Sacrário do Compartilhamento',
      text: 'Este sacrário tem duração sustentada. Quando lança uma magia de 1º ou 2º círculo que tenha apenas você como alvo, se estiver em alcance curto deste sacrário você pode gastar 2 PM para que um aliado dentro dele receba o efeito básico dessa magia.',
      requirements: [[{ type: RequirementType.NIVEL, value: 7 }]],
    },
    {
      name: 'Sacrário do Ocaso',
      text: 'Este sacrário é criado com 60 pontos de ocaso. No início de seus turnos, o sacrário perde 1d10 pontos de ocaso, e cada criatura dentro dele perde esse valor em PV. A perda de PV aumenta em +1d10 para cada círculo de magia que você possa lançar além do 1º. Quando cria o sacrário, você pode gastar mais PM para fortalecer seu efeito; para cada PM adicional gasto, o sacrário é criado com +20 pontos de ocaso. O sacrário desaparece quando seus pontos de ocaso terminam.',
      requirements: [],
    },
    {
      name: 'Sermão da Celeridade',
      text: 'Uma vez por rodada, você pode gastar 5 PM para fazer um aliado em alcance curto ganhar uma ação padrão adicional no próximo turno dele. Você só pode usar esta habilidade uma vez por cena em cada aliado.',
      requirements: [[{ type: RequirementType.NIVEL, value: 8 }]],
    },
    {
      name: 'Sermão da Égide',
      text: 'Você pode gastar uma ação padrão e 3 PM para orar por proteção para uma criatura em alcance curto. Até o seu próximo turno, quando essa criatura sofrer dano, ela pode gastar essa proteção para reduzir esse dano à metade.',
      requirements: [],
    },
    {
      name: 'Teologia Aplicada',
      text: 'Escolha duas perícias. Quando faz um teste de uma dessas perícias (exceto testes de ataque), você pode gastar 1 PM para rolar novamente esse teste, usando Religião. Você pode escolher este poder outras vezes para perícias diferentes.',
      requirements: [],
      canRepeat: true,
    },
    {
      name: 'Transferir Sacrário',
      text: 'Você pode gastar uma ação de movimento e 1 PM para transferir um de seus sacrários no alcance em que você pode criá-lo para outro ponto no mesmo alcance.',
      requirements: [],
    },
    {
      name: 'Zelador dos Vinhedos',
      text: 'Você pode usar Ofício (cozinheiro) para preparar poções de magias que você conheça e cujo alvo seja 1 criatura. As poções tomam a forma de bebidas e seguem as regras desses itens (Heróis de Arton, Capítulo 3), exceto que ingeri-las é uma ação padrão. A bebida pode ser comum ou especial. No segundo caso, a CD para fabricá-la aumenta em +5 e o custo aumenta conforme a bebida especial, mas consumi-la gera ambos os efeitos (da poção e da bebida especial).',
      requirements: [[{ type: RequirementType.PERICIA, name: 'Ofício' }]],
    },
  ],
  probDevoto: 0.95,
  qtdPoderesConcedidos: 2,
  faithProbability: standardFaithProbability,
  attrPriority: [Atributo.SABEDORIA],
  setup: (classe) => {
    const modifiedClasse = _.cloneDeep(classe);
    modifiedClasse.spellPath = {
      initialSpells: 3,
      spellType: 'Divine',
      qtySpellsLearnAtLevel: () => 1,
      spellCircleAvailableAtLevel: (level) => {
        if (level < 5) return 1;
        if (level < 9) return 2;
        if (level < 13) return 3;
        if (level < 17) return 4;
        return 5;
      },
      keyAttribute: Atributo.SABEDORIA,
    };

    return modifiedClasse;
  },
};

export default FRADE;
