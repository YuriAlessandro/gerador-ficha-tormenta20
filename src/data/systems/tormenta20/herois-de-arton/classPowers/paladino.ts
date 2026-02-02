import { ClassPower } from '../../../../../interfaces/Class';
import { RequirementType } from '../../../../../interfaces/Poderes';
import { spellsCircle2 } from '../../magias/generalSpells';
import PROFICIENCIAS from '../../proficiencias';

const PALADINO_POWERS: ClassPower[] = [
  {
    name: 'Arma Juramentada',
    text: 'Se você estiver empunhando a arma preferida de sua divindade, ela recebe uma fração do poder divino. Em suas mãos, ela é considerada mágica e recebe os benefícios de uma melhoria (escolhido ao receber este poder, exceto material especial), cujos pré-requisitos ela cumpra. Essa melhoria não conta no limite da arma. Se você descumprir as Obrigações & Restrições da divindade, este efeito deixa de funcionar até você recuperar seus PM.',
    requirements: [
      [{ type: RequirementType.TEXT, text: 'Devoto de uma divindade' }],
    ],
  },
  {
    name: 'Arma Sacramentada',
    text: 'A conexão de sua arma com sua divindade se torna mais forte. Em suas mãos, a arma também recebe os benefícios de um encanto (escolhido ao receber este poder) cujos pré-requisitos ela cumpra. Esse encanto não conta no limite da arma e também deixa de funcionar se você descumprir suas Obrigações & Restrições.',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Arma Juramentada' },
        { type: RequirementType.NIVEL, value: 11 },
      ],
    ],
  },
  {
    name: 'Aura Vingadora',
    text: 'Enquanto sua aura estiver ativa, você e cada aliado dentro dela recebem +1d6 de luz em uma rolagem de dano corpo a corpo uma vez por rodada.',
    requirements: [[{ type: RequirementType.NIVEL, value: 8 }]],
  },
  {
    name: 'Bloqueio Divino',
    text: 'Quando sofre um ataque, se estiver empunhando um escudo, você pode gastar 2 PM para receber +5 na Defesa contra esse ataque.',
    requirements: [
      [{ type: RequirementType.PROFICIENCIA, name: PROFICIENCIAS.ESCUDOS }],
    ],
  },
  {
    name: 'Convicção Heroica',
    text: 'Uma vez por cena, quando seus pontos de vida forem reduzidos a 0 ou menos, você pode gastar 5 PM para curar 50 PV.',
    requirements: [[{ type: RequirementType.NIVEL, value: 11 }]],
  },
  {
    name: 'Expurgo Sagrado',
    text: 'Quando você usa Golpe Divino contra um abissal ou um morto-vivo, seu custo diminui em –1 PM (cumulativo com outras reduções) e o bônus de dano da habilidade aumenta em mais um dado.',
    requirements: [],
  },
  {
    name: 'Escudo Fraterno',
    text: 'Se você estiver empunhando um escudo, sua Égide Sagrada afeta aliados até 9m (em vez de apenas adjacentes).',
    requirements: [[{ type: RequirementType.PODER, name: 'Égide Sagrada' }]],
  },
  {
    name: 'Escudo Sagrado',
    text: 'Se estiver empunhando um escudo, você pode gastar uma ação de movimento e 1 PM para criar uma barreira sagrada com duração sustentada a partir dele. Você recebe redução de dano igual ao seu Carisma.',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Bloqueio Divino' },
        { type: RequirementType.NIVEL, value: 7 },
      ],
    ],
  },
  {
    name: 'Fulgor Ardente',
    text: 'Quando usa Golpe Divino, você pode gastar +1 PM. Se fizer isso e acertar o ataque, todos os inimigos a até 6m do alvo do ataque sofrem dano de luz igual ao dano extra causado por essa habilidade.',
    requirements: [[{ type: RequirementType.PODER, name: 'Fulgor Divino' }]],
  },
  {
    name: 'Hoste Celestial',
    text: 'Você pode gastar uma ação padrão e 10 PM para convocar guerreiros espirituais para lutar ao seu lado. Eles flutuam ao seu redor, são incorpóreos e imunes a dano e possuem 100 pontos de luz. Uma vez por rodada, quando você sofre dano, pode fazer os espíritos absorverem esse dano; nesse caso, eles perdem pontos de luz igual ao dano que você sofreria. Além disso, uma vez por rodada, você pode gastar 2 PM para fazê-los atacar uma criatura em alcance curto (ataque igual a sua Religião com um bônus de +10, dano de luz igual a 4d8 + seu Carisma, crítico 18/x3). Os espíritos desaparecem se os pontos de luz deles forem reduzidos a 0 ou no fim da cena.',
    requirements: [
      [
        { type: RequirementType.PERICIA, name: 'Religião' },
        { type: RequirementType.PODER, name: 'Orar' },
        { type: RequirementType.NIVEL, value: 17 },
      ],
    ],
  },
  {
    name: 'Investida Sagrada',
    text: 'Quando faz uma investida montada, você pode pagar 1 PM para receber deslocamento de voo igual ao seu deslocamento base até o fim do seu turno e causar +1d8 pontos de dano.',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Montaria Sagrada' },
        { type: RequirementType.NIVEL, value: 10 },
      ],
    ],
  },
  {
    name: 'Julgamento Divino: Desafio',
    text: 'Você pode gastar 2 PM para marcar um inimigo em alcance curto. Sempre que esse inimigo ataca um de seus aliados, ele recebe uma penalidade cumulativa de –1 em testes de ataque (limitado pelo seu Carisma). Essa penalidade acaba se ele atacar você ou se você terminar seu turno além do alcance corpo a corpo dele.',
    requirements: [],
  },
  {
    name: 'Julgamento Divino: Proteção',
    text: 'Você pode gastar 2 PM para conceder 10 PV temporários e +2 na Defesa para uma criatura em alcance curto.',
    requirements: [],
  },
  {
    name: 'Julgamento Divino: Redenção',
    text: 'Você é capaz de criar um vínculo espiritual com um aliado. Você pode lançar Escudo da Fé, mas apenas com o aprimoramento que divide o dano entre o alvo e você (mas não precisa cumprir seu requisito de círculo).',
    requirements: [],
  },
  {
    name: 'Julgamento Divino: Retribuição',
    text: 'Você pode marcar um inimigo em alcance curto. Na próxima vez em que esse inimigo causar dano em você, você pode gastar 2 PM para fazer um ataque corpo a corpo contra ele (desde que ele esteja em seu alcance).',
    requirements: [],
  },
  {
    name: 'Luz Purificadora',
    text: 'Quando usa Golpe Divino, você pode gastar +1 PM para converter todo o dano causado para luz e ignorar 10 pontos de redução de dano do alvo.',
    requirements: [],
  },
  {
    name: 'Manto de Batalha',
    text: 'Você aprende e pode lançar Vestimenta da Fé, e pode usar seus aprimoramentos como se tivesse acesso aos mesmos círculos de magia que um clérigo de seu nível.',
    requirements: [[{ type: RequirementType.NIVEL, value: 5 }]],
    sheetActions: [
      {
        source: { type: 'power', name: 'Manto de Batalha' },
        action: {
          type: 'learnSpell',
          availableSpells: [spellsCircle2.vestimentaDaFe],
          pick: 1,
        },
      },
    ],
  },
  {
    name: 'Paladino do Reino',
    text: 'Você recebe um poder de cavaleiro cujos pré-requisitos cumpra, usando seu nível como nível de cavaleiro.',
    requirements: [[{ type: RequirementType.PERICIA, name: 'Nobreza' }]],
  },
  {
    name: 'Rajada Divina',
    text: 'Quando faz um Golpe Divino com Luz Purificadora, você pode gastar +1 PM para aumentar o alcance desse ataque para curto (ele ainda conta como um ataque corpo a corpo).',
    requirements: [[{ type: RequirementType.PODER, name: 'Luz Purificadora' }]],
  },
  {
    name: 'Sacrifício',
    text: 'Uma vez por rodada, quando faz um ataque corpo a corpo, você pode sacrificar 5 PV por patamar para aumentar o dano desse ataque em +1d10 por patamar. Por exemplo, se você for um personagem de 5º nível, pode perder 10 PV para causar +2d10 pontos de dano.',
    requirements: [],
  },
  {
    name: 'Sentença Dobrada',
    text: 'Quando profere um julgamento, você pode gastar +1 PM para proferir um segundo julgamento com a mesma ação (pagando o custo de ambos).',
    requirements: [],
  },
  {
    name: 'Virtude Paladinesca: Paciência',
    text: 'Em combate, você pode ficar uma rodada inteira em meditação, sem fazer ações (exceto reações), para receber +2 em testes de perícia e na Defesa até o fim da cena.',
    requirements: [],
  },
];

export default PALADINO_POWERS;
