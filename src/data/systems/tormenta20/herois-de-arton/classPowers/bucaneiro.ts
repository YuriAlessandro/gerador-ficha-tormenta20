import { ClassPower } from '../../../../../interfaces/Class';
import { RequirementType } from '../../../../../interfaces/Poderes';
import Skill from '../../../../../interfaces/Skills';
import { Atributo } from '../../atributos';

/**
 * Poderes de Bucaneiro do suplemento Heróis de Arton
 */
const BUCANEIRO_POWERS: ClassPower[] = [
  {
    name: 'Ardil Afiado',
    text: 'Você pode usar Audácia em testes de manobra. Se fizer isso contra um oponente desprevenido, soma o dobro do Carisma no teste.',
    requirements: [
      [
        { type: RequirementType.ATRIBUTO, name: Atributo.CARISMA, value: 1 },
        { type: RequirementType.PERICIA, name: Skill.ENGANACAO },
      ],
    ],
  },
  {
    name: 'Bloqueio Desconcertante',
    text: 'Quando uma criatura erra um ataque corpo a corpo contra você, ou quando você bloqueia um ataque com Aparar, você pode gastar 1 PM. Se você fizer isso, a criatura fica desprevenida contra seu próximo ataque feito até o fim do seu próximo turno.',
    requirements: [[{ type: RequirementType.PODER, name: 'Esgrimista' }]],
  },
  {
    name: 'Bom de Trago',
    text: 'Uma vez por rodada, você pode ingerir uma bebida, preparado ou poção que esteja empunhando como uma ação livre.',
    requirements: [],
  },
  {
    name: 'Charme Cafajeste',
    text: 'Você aprende e pode lançar Enfeitiçar (atributo-chave Carisma). A CD para resistir a esta habilidade aumenta em +2 para criaturas inamistosas e em +5 para criaturas hostis. Esta não é uma habilidade mágica e provém de sua habilidade de cativar seus adversários.',
    requirements: [
      [
        { type: RequirementType.PERICIA, name: Skill.ENGANACAO },
        { type: RequirementType.NIVEL, value: 3 },
      ],
    ],
  },
  {
    name: 'Cobrir de Pólvora',
    text: 'Você pode gastar uma ação de movimento, 1 PM e uma bala de arma de fogo para cobrir uma criatura em alcance curto com uma pequena quantidade de pólvora. O alvo fica cego por 1 rodada (Ref CD Car evita) e, até o fim da cena, o próximo ataque contra ele causa +1d6 pontos de dano de fogo e deixa-o em chamas.',
    requirements: [],
  },
  {
    name: 'Cortejo de Espadas',
    text: 'Quando você faz um teste de Acrobacia para passar por um inimigo, o espaço ocupado por esse inimigo não conta como terreno difícil e ele só pode usar Iniciativa para o teste oposto. Se você vencer esse teste, recebe +2 na Defesa e em Reflexos contra esse inimigo por 1 rodada.',
    requirements: [[{ type: RequirementType.PERICIA, name: Skill.ACROBACIA }]],
  },
  {
    name: 'Dançar nas Cordas',
    text: 'Se você usar Ataque Acrobático tendo vencido um teste oposto para passar pelo espaço de um inimigo, os bônus fornecidos por esse poder aumentam para +5 e se aplicam a todos os seus ataques contra esse inimigo nessa rodada.',
    requirements: [
      [{ type: RequirementType.PODER, name: 'Ataque Acrobático' }],
    ],
  },
  {
    name: 'Entrada Triunfal',
    text: 'Se um combate começar e você for o primeiro na iniciativa, recebe uma quantidade de PV temporários igual à metade de seus PV máximos.',
    requirements: [],
  },
  {
    name: 'Esgrima Sambur',
    text: 'Se estiver empunhando duas armas corpo a corpo leves ou ágeis e fizer a ação agredir, você pode gastar 1 PM para fazer dois ataques, um com cada arma (se tiver Ambidestria ou Estilo de Duas Armas, em vez disso não sofre penalidade para usá-los). Além disso, se tiver o poder Aparar, pode usá-lo uma segunda vez na rodada.',
    requirements: [[{ type: RequirementType.PODER, name: 'Esgrimista' }]],
  },
  {
    name: 'Estampido Ensurdecedor',
    text: 'Quando faz um ataque à distância com uma arma de fogo, você pode pagar 1 PM para deixar todas as criaturas adjacentes a você abaladas e surdas (Fort CD Car reduz a duração das condições para 1 rodada).',
    requirements: [[{ type: RequirementType.PODER, name: 'Grudar o Cano' }]],
  },
  {
    name: 'Estocada no Flanco',
    text: 'Uma vez por rodada, quando vence um teste oposto para passar por um inimigo, você pode gastar 2 PM para fazer um ataque contra ele. Se você acertar o ataque e causar dano de corte ou perfuração, o inimigo fica sangrando.',
    requirements: [
      [{ type: RequirementType.PODER, name: 'Cortejo de Espadas' }],
    ],
  },
  {
    name: 'Gole da Coragem',
    text: 'Uma vez por cena, quando ingerir uma bebida, preparado ou poção, você recebe uma ação padrão adicional nesse turno.',
    requirements: [],
  },
  {
    name: 'Golpe Humilhante',
    text: 'Você pode gastar 2 PM para humilhar uma criatura em alcance curto. Até o fim da cena, sempre que você acertar um ataque nessa criatura, ela sofre uma penalidade de –1 na Defesa. A penalidade é cumulativa, limitada pelo seu Carisma e dura até o fim da cena.',
    requirements: [],
  },
  {
    name: 'Introdução Calorosa',
    text: 'Na primeira rodada de um combate, você pode gastar uma ação para se apresentar. Você recebe todos os benefícios das ações anteriores e eles duram até o fim da cena. Ação livre: +1 teste de ataque. Ação de movimento: +2 rolagens de dano. Ação padrão: +2 na Defesa. Ação completa: todos os anteriores.',
    requirements: [],
  },
  {
    name: 'Lobo do Mar',
    text: 'Você já viu quase todo o mundo e almeja ver o resto. Quando você chega a um lugar no qual nunca esteve, pelo resto da aventura o custo de Audácia diminui em –1 PM e você pode usá-la em testes de ataque (ambos nesse lugar).',
    requirements: [[{ type: RequirementType.NIVEL, value: 17 }]],
  },
  {
    name: 'Lorotas da Terra e do Mar',
    text: 'Você pode gastar 10 minutos para contar uma mentira sobre seu passado. Escolha uma cena de uma de suas aventuras e reconte-a de forma "criativa" para um NPC que não a testemunhou. Então faça um teste de Enganação (CD 15 + 5 para cada vez que usou este poder na mesma aventura). Se passar, pode usar um poder qualquer cujos pré-requisitos cumpra e que seja relacionado à sua mentira (a critério do mestre), até o fim do dia ou até usar este efeito novamente. Se falhar, não pode mais usar este efeito até o fim da aventura.',
    requirements: [
      [
        { type: RequirementType.PERICIA, name: Skill.ENGANACAO },
        { type: RequirementType.NIVEL, value: 11 },
      ],
    ],
  },
  {
    name: 'Lenda de Sangue',
    text: 'Sempre que você deixa alguém sangrando, a perda de vida causada por sangramento aumenta em um passo (cumulativo até um máximo de d12) e a criatura falha automaticamente em seu próximo teste de Constituição para remover essa condição.',
    requirements: [
      [{ type: RequirementType.PODER, name: 'Estocada no Flanco' }],
    ],
  },
  {
    name: 'Passo das Ondas',
    text: 'Uma vez por rodada, quando acerta um ataque em um inimigo, você pode gastar 2 PM para se mover até a metade do seu deslocamento. Esse deslocamento ignora terreno difícil e não ativa reações dos inimigos (como pelo poder Ataque Reflexo).',
    requirements: [[{ type: RequirementType.PODER, name: 'Pernas do Mar' }]],
  },
  {
    name: 'Pirouette',
    text: 'Enquanto está sob efeito de En Garde, você pode gastar uma ação de movimento para receber +5 na Defesa por 1 rodada.',
    requirements: [[{ type: RequirementType.PODER, name: 'En Garde' }]],
  },
  {
    name: 'Remise',
    text: 'Enquanto está sob efeito de En Garde, uma vez por rodada, quando usa a ação agredir, você pode gastar 2 PM para realizar um ataque adicional.',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'En Garde' },
        { type: RequirementType.NIVEL, value: 7 },
      ],
    ],
  },
  {
    name: 'Sucesso Atrai Sucesso',
    text: 'Você pode gastar 2 PM para invocar uma onda de boa sorte. Sempre que fizer um acerto crítico em um inimigo, você recebe um bônus cumulativo de +2 nas rolagens de dano (limitado pelo seu Carisma) até o fim da cena.',
    requirements: [],
  },
];

export default BUCANEIRO_POWERS;
