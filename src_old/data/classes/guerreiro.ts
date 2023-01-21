import { ClassDescription } from '../../interfaces/Class';
import { RequirementType } from '../../interfaces/Poderes';
import Skill from '../../interfaces/Skills';
import { Atributo } from '../atributos';
import PROFICIENCIAS from '../proficiencias';

const GUERREIRO: ClassDescription = {
  name: 'Guerreiro',
  pv: 20,
  addpv: 5,
  pm: 3,
  addpm: 3,
  periciasbasicas: [
    {
      type: 'or',
      list: [Skill.LUTA, Skill.PONTARIA],
    },
    {
      type: 'and',
      list: [Skill.FORTITUDE],
    },
  ],
  periciasrestantes: {
    qtd: 2,
    list: [
      Skill.ADESTRAMENTO,
      Skill.ATLETISMO,
      Skill.CAVALGAR,
      Skill.GUERRA,
      Skill.INICIATIVA,
      Skill.INTIMIDACAO,
      Skill.LUTA,
      Skill.OFICIO,
      Skill.PERCEPCAO,
      Skill.PONTARIA,
      Skill.REFLEXOS,
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
      name: 'Ataque Especial',
      text: 'Quando faz um ataque, você pode gastar 1 PM para receber +4 no teste de ataque ou na rolagem de dano. A cada quatro níveis, pode gastar +1 PM para aumentar o bônus em +4. Você pode dividir os bônus igualmente. Por exemplo, no 17º nível, pode gastar 5 PM para receber +20 no ataque, +20 no dano ou +10 no ataque e +10 no dano.',
      nivel: 1,
    },
    {
      name: 'Durão',
      text: 'A partir do 3ª nível, sua rijeza muscular permite que você absorva ferimentos. Sempre que sofre dano, você pode gastar 2 PM para reduzir esse dano à metade.',
      nivel: 3,
    },
    {
      name: 'Ataque Extra',
      text: 'A partir do 6º nível, quando usa a ação atacar, você pode gastar 2 PM para realizar um ataque adicional com a mesma arma.',
      nivel: 6,
    },
    {
      name: 'Campeão',
      text: 'No 20º nível, o dano de todos os seus ataques aumenta em um passo. Além disso, sempre que você faz um Ataque Especial ou um Golpe Pessoal e acerta o ataque, recupera metade dos PM gastos nele. Por exemplo, se fizer um Ataque Especial gastando 5 PM para ganhar +20 nas rolagens de dano e acertar o ataque, recupera 2 PM.',
      nivel: 20,
    },
  ],
  powers: [
    {
      name: 'Ambidestria',
      text: 'Se estiver usando duas armas (e pelo menos uma delas for leve) e fizer a ação atacar, você pode fazer dois ataques, um com cada arma. Se fizer isso, sofre –2 em todos os testes de ataque até o seu próximo turno.',
      requirements: [
        [{ type: RequirementType.ATRIBUTO, name: 'Destreza', value: 15 }],
      ],
    },
    {
      name: 'Aumento de Atributo',
      text: 'Você recebe +2 em um atributo a sua escolha (NÃO CONTABILIZADO). Você pode escolher este poder várias vezes. A partir da segunda vez que escolhê-lo para o mesmo atributo, o aumento diminui para +1.',
      requirements: [],
      canRepeat: true,
    },
    {
      name: 'Arqueiro',
      text: 'Se estiver usando uma arma de ataque à distância, você soma seu bônus de Sabedoria em rolagens de dano (limitado pelo seu nível).',
      requirements: [
        [{ type: RequirementType.ATRIBUTO, name: 'Sabedoria', value: 13 }],
      ],
    },
    {
      name: 'Ataque Reflexo',
      text: 'Se um alvo em alcance de seus ataques corpo a corpo ficar desprevenido ou se mover voluntariamente para fora do seu alcance, você pode gastar 1 PM para fazer um ataque corpo a corpo contra esse alvo como uma reação.',
      requirements: [
        [{ type: RequirementType.ATRIBUTO, name: 'Destreza', value: 13 }],
      ],
    },
    {
      name: 'Bater e Correr',
      text: 'Quando faz uma investida, você pode continuar se movendo após o ataque, até o limite de seu deslocamento. Se gastar 2 PM, pode fazer uma investida sobre terreno difícil e sem sofrer a penalidade de Defesa.',
      requirements: [],
    },
    {
      name: 'Destruidor',
      text: 'Quando causa dano com uma arma corpo a corpo de duas mãos, você pode rolar novamente qualquer resultado 1 ou 2 das rolagens de dano da arma.',
      requirements: [
        [{ type: RequirementType.ATRIBUTO, name: 'Força', value: 13 }],
      ],
    },
    {
      name: 'Esgrimista',
      text: 'Quando usa uma arma leve ou ágil, você soma seu bônus de Inteligência nas rolagens de dano (limitado pelo seu nível).',
      requirements: [
        [{ type: RequirementType.ATRIBUTO, name: 'Inteligência', value: 13 }],
      ],
    },
    {
      name: 'Especialização em Arma',
      text: 'Escolha uma arma. Você recebe +2 em rolagens de dano com a arma escolhida. Você pode escolher este poder outras vezes para armas diferentes.',
      requirements: [],
      canRepeat: true,
    },
    {
      name: 'Especialização em Armadura',
      text: 'Você recebe resistência a dano 5 se estiver usando uma armadura pesada.',
      requirements: [[{ type: RequirementType.NIVEL, value: 12 }]],
    },
    {
      name: 'Golpe de Raspão',
      text: 'Quando erra um ataque, você pode gastar 1 PM. Se fizer isso, causa 1d8 pontos de dano (do tipo da arma) no alvo do ataque.',
      requirements: [],
    },
    {
      name: 'Golpe Demolidor',
      text: 'Quando usa a manobra quebrar ou ataca um objeto, você pode gastar 2 PM para ignorar a RD dele.',
      requirements: [],
    },
    {
      name: 'Golpe Pessoal',
      text: 'Quando faz um ataque, você pode desferir seu Golpe Pessoal, uma manobra única, com efeitos determinados por você. Você constrói o seu Golpe Pessoal escolhendo efeitos (Tormenta 20, pág 66). Cada efeito possui um custo; a soma deles será o custo do Golpe Pessoal (mínimo 1 PM e máximo igual ao seu nível). O Golpe Pessoal só pode ser usado com um tipo de arma específico (por exemplo, apenas espadas longas). Quando sobe de nível, você pode reconstruir seu Golpe Pessoal e alterar a arma que ele usa. Você pode escolher este poder outras vezes para golpes diferentes.',
      requirements: [[{ type: RequirementType.NIVEL, value: 5 }]],
    },
    {
      name: 'Ímpeto',
      text: 'Você pode gastar 1 PM para aumentar seu deslocamento em +6m por uma rodada.',
      requirements: [],
    },
    {
      name: 'Mestre em Arma',
      text: 'Escolha uma arma. Com esta arma, seu dano aumenta em um passo e você pode gastar 2 PM para rolar novamente um teste de ataque recém realizado. Você deve possui especialização na arma escolhida.',
      requirements: [
        [{ type: RequirementType.PODER, name: 'Especialização em Arma' }],
      ],
    },
    {
      name: 'Planejamento Marcial',
      text: 'Uma vez por dia, você pode gastar uma hora e 3 PM para escolher um poder de guerreiro ou de combate cujos pré-requisitos cumpra. Você recebe os benefícios desse poder até o próximo dia.',
      requirements: [
        [
          {
            type: RequirementType.PERICIA,
            name: 'Guerra',
          },
          {
            type: RequirementType.NIVEL,
            value: 10,
          },
        ],
      ],
    },
    {
      name: 'Romper Resistências',
      text: 'Quando faz um Ataque Especial, você pode gastar 2 PM adicionais para ignorar qualquer resistência a dano de uma criatura.',
      requirements: [],
    },
    {
      name: 'Solidez',
      text: 'Se estiver usando um escudo, você aplica o bônus na Defesa recebido pelo escudo em testes de resistência.',
      requirements: [],
    },
    {
      name: 'Tornado de Dor',
      text: 'Você pode gastar uma ação padrão e 2 PM para desferir uma série de golpes giratórios. Faça um ataque corpo a corpo e compare-o com a Defesa de cada inimigo adjacente. Então faça uma rolagem de dano com um bônus cumulativo de +2 para cada acerto e aplique-a em cada inimigo atingido.',
      requirements: [[{ type: RequirementType.NIVEL, value: 6 }]],
    },
    {
      name: 'Valentão',
      text: 'Você recebe +2 em testes de ataque e rolagens de dano contra oponentes caídos, desprevenidos, flanqueados ou indefesos.',
      requirements: [],
    },
  ],
  probDevoto: 0.3,
  faithProbability: {
    ARSENAL: 1,
    AZGHER: 1,
    KALLYADRANOCH: 1,
    KHALMYR: 1,
    LINWU: 1,
    THYATIS: 1,
    VALKARIA: 1,
  },
  attrPriority: [Atributo.FORCA, Atributo.DESTREZA, Atributo.CONSTITUICAO],
};

export default GUERREIRO;
