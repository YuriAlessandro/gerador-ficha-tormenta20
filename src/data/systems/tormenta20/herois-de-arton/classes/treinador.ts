import { ClassDescription } from '../../../../../interfaces/Class';
import { RequirementType } from '../../../../../interfaces/Poderes';
import Skill from '../../../../../interfaces/Skills';
import { Atributo } from '../../atributos';

/**
 * Classe Treinador - Heróis de Arton
 *
 * Especialista em criar laços com criaturas e comandar seu melhor amigo
 * em combate. Possui habilidades de liderança e sincronia com parceiros.
 */
const TREINADOR: ClassDescription = {
  name: 'Treinador',
  pv: 12,
  addpv: 3,
  pm: 4,
  addpm: 4,
  periciasbasicas: [
    {
      type: 'and',
      list: [Skill.ADESTRAMENTO, Skill.VONTADE],
    },
  ],
  periciasrestantes: {
    qtd: 4,
    list: [
      Skill.ATLETISMO,
      Skill.CAVALGAR,
      Skill.DIPLOMACIA,
      Skill.GUERRA,
      Skill.INICIATIVA,
      Skill.INTIMIDACAO,
      Skill.INTUICAO,
      Skill.LUTA,
      Skill.OFICIO,
      Skill.PERCEPCAO,
      Skill.PONTARIA,
      Skill.REFLEXOS,
      Skill.RELIGIAO,
      Skill.SOBREVIVENCIA,
    ],
  },
  proficiencias: [],
  abilities: [
    {
      name: 'Direcionar',
      text: 'Se o seu melhor amigo estiver em alcance curto e fizer um teste de perícia, você pode gastar 2 PM para somar seu Carisma no teste dele.',
      nivel: 1,
    },
    {
      name: 'Melhor Amigo',
      text: 'Você recebe um melhor amigo, um parceiro especial que o acompanha em suas aventuras. Ele começa com dois truques a sua escolha e recebe um novo truque a cada três níveis seguintes. Caso seu melhor amigo morra, você fica atordoado por 1d4 rodadas. Você pode treinar um novo melhor amigo com um mês de trabalho.',
      nivel: 1,
    },
    {
      name: 'Domar Criatura',
      text: 'A partir do 2º nível, você pode gastar uma ação de movimento e 1 PM para fazer um teste de Adestramento oposto ao teste de Vontade de uma criatura não inteligente em alcance curto. Se você vencer, causa 2d8 pontos de dano psíquico não letal à criatura. Se perder, causa metade desse dano. Se a criatura for reduzida a 0 ou menos PV, em vez de cair inconsciente, ela se rende. A cada quatro níveis, você pode gastar +1 PM para aumentar o dano em +2d8. A partir do 5º nível, quando rende uma criatura com ND igual ou menor que seu nível, você pode gastar uma quantidade de PM igual ao ND dela para controlá-la até o fim da cena. A partir do 8º nível, se o ND da criatura for igual ou menor que seu nível –3, ela fica com você até o fim do dia. Criaturas que possuam habilidades sem custo de PM e sem limite de uso podem usá-las apenas uma vez por dia. Algumas criaturas são indomáveis (a critério do mestre).',
      nivel: 2,
    },
    {
      name: 'Treino Especializado',
      text: 'No 5º nível, escolha entre Conquistar pelos Números e Treino Intensivo. Conquistar pelos Números: Você recebe um segundo melhor amigo. Uma vez por rodada, quando faz uma ação padrão com um de seus melhores amigos, você pode gastar 3 PM para fazer uma ação padrão com o outro. Treino Intensivo: Seu melhor amigo recebe +4 PV por nível, redução de dano 5 e um truque. No 11º nível, a RD aumenta para 10 e ele recebe outro truque. No 17º nível, a RD aumenta para 15.',
      nivel: 5,
    },
    {
      name: 'Sincronia de Combate',
      text: 'A partir do 6º nível, uma vez por rodada, quando seu melhor amigo acerta um ataque usando a ação agredir, você pode gastar 2 PM para fazer um ataque contra o mesmo alvo.',
      nivel: 6,
    },
    {
      name: 'Sincronia Perfeita',
      text: 'No 20º nível, você pode gastar uma ação de movimento e 6 PM para entrar em um estado de sincronia perfeita com um dos seus melhores amigos. Até o fim da cena, o tamanho dele aumenta em uma categoria. Além disso, uma vez por rodada, quando usa uma ação padrão consigo mesmo, você recebe uma ação padrão extra para usar com ele.',
      nivel: 20,
    },
  ],
  powers: [
    {
      name: 'Amigo Divino',
      text: 'Seu melhor amigo vive em um mundo divino, mas você pode gastar uma ação de movimento e 2 PM para invocá-lo a Arton. Ele surge em um espaço desocupado em alcance curto e permanece até o fim da cena ou até você enviá-lo de volta (uma ação livre). Enquanto estiver no mundo divino e com menos da metade de seus PV, o melhor amigo tem Cura Acelerada 10.',
      requirements: [],
    },
    {
      name: 'Asas Aliadas',
      text: 'Uma vez por rodada, se você estiver em alcance curto de seu melhor amigo e ele usar deslocamento de voo, você pode pagar 1 PM para ser alçado aos céus. Se fizer isso, você se desloca para um quadrado desocupado no trajeto do amigo. Além disso, seu próximo ataque nesse turno conta como uma investida.',
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
      name: 'Bom Garoto',
      text: 'Uma vez por rodada, quando seu melhor amigo faz um acerto crítico em combate ou reduz um inimigo a 0 PV em seu turno, você recebe uma ação padrão que só pode usar consigo mesmo.',
      requirements: [[{ type: RequirementType.NIVEL, value: 11 }]],
    },
    {
      name: 'Comando Defensivo',
      text: 'Quando seu melhor amigo sofre dano, você pode gastar 2 PM para fazer um teste de Adestramento e reduzir o resultado do teste desse dano. Você pode usar esta habilidade uma vez por rodada para cada melhor amigo.',
      requirements: [],
    },
    {
      name: 'Comandos Distantes',
      text: 'O alcance de suas habilidades de treinador aumenta em uma categoria (de curto para médio, de médio para longo).',
      requirements: [],
    },
    {
      name: 'Convocar Enxame',
      text: 'Você aprende e pode lançar Enxame de Pestes (atributo-chave Carisma) e pode usar seus aprimoramentos como se tivesse acesso aos mesmos círculos de magia que um clérigo de seu nível. Esta não é uma habilidade mágica e provém de sua capacidade de atrair criaturas.',
      requirements: [[{ type: RequirementType.NIVEL, value: 5 }]],
    },
    {
      name: 'Coração Grande',
      text: 'Seu limite de parceiros aumenta em +1. No 11º nível, esse limite aumenta em +1.',
      requirements: [],
    },
    {
      name: 'Direcionamento Marcial',
      text: 'Quando usa Direcionar em um teste de ataque, você também soma seu Carisma na rolagem de dano desse ataque.',
      requirements: [],
    },
    {
      name: 'Domador Cativante',
      text: 'Você soma seu Carisma no dano de Domar Criatura, e os dados de dano dessa habilidade aumentam para d10.',
      requirements: [],
    },
    {
      name: 'Domador Lendário',
      text: 'Quando usa Domar Criatura, você pode gastar +2 PM para mudar os dados de dano para d12 e atingir todos os alvos dentro do alcance.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Domador Cativante' },
          { type: RequirementType.NIVEL, value: 17 },
        ],
      ],
    },
    {
      name: 'Ensinar Truque',
      text: 'Um de seus melhores amigos aprende um truque adicional. Você pode escolher este poder uma vez por patamar por amigo.',
      requirements: [],
      canRepeat: true,
    },
    {
      name: 'Investida Conjunta',
      text: 'Uma vez por rodada, quando um melhor amigo no qual você está montado faz uma investida, você pode gastar 2 PM para fazer um ataque corpo a corpo (que também conta como uma investida).',
      requirements: [],
    },
    {
      name: 'Líder da Matilha',
      text: 'Quando usa Direcionar, você pode aplicar o bônus ao próximo teste de perícia de outros melhores amigos com a mesma ação ao custo de +1 PM por amigo adicional. O bônus só afeta o teste se ele for feito até o fim do seu turno.',
      requirements: [
        [{ type: RequirementType.PODER, name: 'Conquistar pelos Números' }],
      ],
    },
    {
      name: 'Língua das Criaturas',
      text: 'Você pode se comunicar com criaturas não inteligentes (Int –4 ou –5) por meio de linguagem corporal e vocalizações. Você pode usar Adestramento com essas criaturas para mudar atitude e persuasão.',
      requirements: [],
    },
    {
      name: 'Mascote',
      text: 'Você tem um mascote. Você pode escolher este poder várias vezes para mascotes diferentes.',
      requirements: [],
      canRepeat: true,
    },
    {
      name: 'Petisco Merecido',
      text: 'Você pode gastar 2 PM para conceder +2 em Força e Destreza a um melhor amigo em alcance curto até o fim da cena.',
      requirements: [],
    },
    {
      name: 'Proteção Fraterna',
      text: 'Quando você e/ou seu melhor amigo sofre um efeito que permite um teste de resistência, se ele estiver em alcance curto, você pode gastar 2 PM para coordenar seus esforços. Os dois fazem o teste de resistência, mas ambos usam o melhor resultado. Se um de vocês tiver uma habilidade que modifica o efeito por passar no teste de resistência (como Evasão), ambos são afetados por ela.',
      requirements: [],
    },
    {
      name: 'Trabalho em Equipe',
      text: 'Uma vez por rodada, quando você faz uma ação de movimento, seus melhores amigos recebem uma ação de movimento.',
      requirements: [[{ type: RequirementType.NIVEL, value: 5 }]],
    },
    {
      name: 'Treinador Eclético',
      text: 'Seus melhores amigos usam seu nível de personagem, em vez de seu nível de treinador, para calcular seus PV, modificadores de perícias e Defesa.',
      requirements: [[{ type: RequirementType.NIVEL, value: 6 }]],
    },
    {
      name: 'Veterinário de Campo',
      text: 'Você pode gastar uma ação completa para fazer um teste de Adestramento em um melhor amigo adjacente. Ele recupera uma quantidade de PV igual ao resultado do teste. Você só pode usar este poder uma vez por dia num mesmo alvo.',
      requirements: [],
    },
  ],
  probDevoto: 0.3,
  faithProbability: {
    ALLIHANNA: 1,
    OCEANO: 1,
    NIMB: 1,
  },
  attrPriority: [Atributo.CARISMA, Atributo.CONSTITUICAO, Atributo.SABEDORIA],
};

export default TREINADOR;
