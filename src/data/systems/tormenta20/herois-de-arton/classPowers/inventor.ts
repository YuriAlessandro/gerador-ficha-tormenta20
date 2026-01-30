import { ClassPower } from '../../../../../interfaces/Class';
import { RequirementType } from '../../../../../interfaces/Poderes';
import { Atributo } from '../../atributos';

const INVENTOR_POWERS: ClassPower[] = [
  {
    name: 'Alquimista Exímio',
    text: 'Quando você usa um preparado alquímico ou uma poção, a CD para resistir a ele aumenta em +2 e, se ele causar dano ou recuperar PV ou PM, esse efeito aumenta em +1 por dado.',
    requirements: [
      [{ type: RequirementType.PODER, name: 'Alquimista Iniciado' }],
    ],
  },
  {
    name: 'Alterar Programação',
    text: 'Você pode gastar uma ação completa e 3 PM para alterar a programação de um construto não inteligente (Int –4 ou menor) adjacente. Faça um teste de Ofício (artesão) oposto ao teste de Vontade do construto. Se você vencer, ele fica confuso por 1 rodada e vulnerável. Se for um lacaio, em vez disso fica sob seu controle até o fim da aventura (veja Domar Criatura, p. 17). Você só pode controlar um construto dessa forma por vez e cada construto só pode ser alvo deste poder uma vez por cena.',
    requirements: [
      [{ type: RequirementType.PERICIA, name: 'Ofício (artesão)' }],
    ],
  },
  {
    name: 'Aparato Personalizado',
    text: 'O primeiro aparato de cada uma de suas engenhocas não aumenta a CD para ativá-la.',
    requirements: [[{ type: RequirementType.PODER, name: 'Engenhoqueiro' }]],
  },
  {
    name: 'Armadura Avançada',
    text: 'Quando ativa uma engenhoca acoplada, você recebe um bônus no teste de ativação igual ao número de melhorias da armadura. Além disso, você pode gastar 4 PM para ativar uma engenhoca acoplada como ação livre (apenas se sua ativação for ação de movimento, padrão ou completa).',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Armadura Mecanizada' },
        { type: RequirementType.NIVEL, value: 7 },
      ],
    ],
  },
  {
    name: 'Armadura Mecanizada',
    text: 'Você pode gastar T$ 100 e 1 dia de trabalho para acoplar uma engenhoca em sua armadura. Armaduras leves podem ter uma engenhoca acoplada e armaduras pesadas podem ter até três. Uma engenhoca acoplada não conta em seu limite de itens vestidos e não precisa ser empunhada.',
    requirements: [[{ type: RequirementType.PODER, name: 'Engenhoqueiro' }]],
  },
  {
    name: 'Artesão Criativo',
    text: 'Você pode usar Ofício (artesão) no lugar de qualquer outro Ofício para qualquer fim (como pré-requisitos, por exemplo).',
    requirements: [
      [{ type: RequirementType.PERICIA, name: 'Ofício (artesão)' }],
    ],
  },
  {
    name: 'Autômato Alquímico',
    text: 'Seu autômato pode armazenar itens alquímicos e poções, com uma capacidade de carga igual à sua Inteligência. Além disso, uma vez por rodada, você pode gastar 1 PM para usar um desses itens como uma ação livre.',
    requirements: [[{ type: RequirementType.PODER, name: 'Autômato' }]],
  },
  {
    name: 'Autômato Engenhocado',
    text: 'Você pode gastar T$ 100 e 1 dia de trabalho para acoplar em seu autômato uma engenhoca que simule uma magia de 1º círculo com alvo 1 criatura ou objeto, ou que afete uma área. Uma vez por rodada, se o autômato estiver em alcance curto, você pode gastar +2 PM para ativar essa engenhoca como uma ação de movimento, tendo como origem o autômato.',
    requirements: [
      [{ type: RequirementType.PODER, name: 'Autômato Prototipado' }],
    ],
  },
  {
    name: 'Catalisador Experimental',
    text: 'Quando ativa uma engenhoca, você pode usar um catalisador e aplicar seus efeitos a ela.',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Engenhoqueiro' },
        { type: RequirementType.NIVEL, value: 5 },
      ],
    ],
  },
  {
    name: 'Estilista',
    text: 'Se estiver vestindo um item de vestuário feito por você mesmo, o bônus em perícias fornecido por ele aumenta em +1 e se aplica também a testes de Diplomacia e Enganação com criaturas inteligentes (Int –3 ou maior).',
    requirements: [
      [
        { type: RequirementType.ATRIBUTO, name: Atributo.CARISMA, value: 1 },
        { type: RequirementType.PERICIA, name: 'Ofício (alfaiate)' },
      ],
    ],
  },
  {
    name: 'Explicação Científica',
    text: 'Você pode gastar uma ação de movimento e uma quantidade de PM limitada pela sua Inteligência para receber resistência a magia igual aos PM gastos até o fim da cena.',
    requirements: [[{ type: RequirementType.NIVEL, value: 5 }]],
  },
  {
    name: 'Explorar Fraqueza',
    text: 'Quando usa Encontrar Fraqueza em um inimigo, você também ignora 5 pontos da redução de dano dele até o fim da cena.',
    requirements: [
      [{ type: RequirementType.PODER, name: 'Encontrar Fraqueza' }],
    ],
  },
  {
    name: 'Farmácia Mágica',
    text: 'Você pode usar Farmacêutico em poções de cura.',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Alquimista Iniciado' },
        { type: RequirementType.PODER, name: 'Farmacêutico' },
      ],
    ],
  },
  {
    name: 'Forçar a Calibragem',
    text: 'Quando faz um teste para ativar uma engenhoca, você pode sofrer uma penalidade de –5 nesse teste para aumentar a CD para resistir à engenhoca em +2.',
    requirements: [[{ type: RequirementType.PODER, name: 'Engenhoqueiro' }]],
  },
  {
    name: 'Galvanização',
    text: 'Você pode gastar uma ação padrão para adicionar um material especial a um item adequado (isso não conta no limite de melhorias do item e se acumula com outros materiais especiais). O preço do material é reduzido a 5% do normal e você não precisa fazer o teste de Ofício para aplicá-lo, mas ele só dura até o fim da cena.',
    requirements: [
      [{ type: RequirementType.PERICIA, name: 'Ofício (artesão)' }],
    ],
  },
  {
    name: 'Gênio Inovador',
    text: 'Você entende o mundo de forma diferente, e sua capacidade de inovar é quase ilimitada. Você pode usar Inteligência como atributo-chave de até duas perícias a sua escolha (em vez do atributo normal). Além disso, quando fabrica um item superior, você pode adicionar uma melhoria extra gratuita, que não conta no limite (por exemplo, por T$ +6.000, adiciona cinco melhorias, em vez de quatro). Por fim, os itens que você fabrica podem ter dois materiais especiais diferentes (em vez de apenas um).',
    requirements: [[{ type: RequirementType.NIVEL, value: 17 }]],
  },
  {
    name: 'Golpe de Gênio',
    text: 'Uma vez por aventura (ou uma vez por mês, de acordo com o mestre), você pode usar Engenhosidade duas vezes em um mesmo teste, ou pode fabricar um item superior ou mágico com uma semana de trabalho (em vez de um mês).',
    requirements: [[{ type: RequirementType.NIVEL, value: 11 }]],
  },
  {
    name: 'Infusão Distante',
    text: 'Quando usa um item alquímico ou uma poção que normalmente afetaria apenas um alvo adjacente, você pode gastar 1 PM para afetar um alvo em alcance curto. Se tiver o poder Granadeiro, em vez disso você afeta um alvo em alcance médio.',
    requirements: [
      [{ type: RequirementType.PODER, name: 'Alquimista Iniciado' }],
    ],
  },
  {
    name: 'Oficina Esotérica',
    text: 'Você pode usar Oficina de Campo em itens esotéricos, poções e pergaminhos. Itens esotéricos aumentam o limite de PM para magias em +1, poções rendem duas doses (a segunda dose deve ser consumida até o fim do dia) e pergaminhos permitem gastar +1 PM em aprimoramentos (mesmo que o usuário não conheça a magia).',
    requirements: [
      [
        { type: RequirementType.PERICIA, name: 'Misticismo' },
        { type: RequirementType.PODER, name: 'Oficina de Campo' },
      ],
    ],
  },
  {
    name: 'Saraivada Alquímica',
    text: 'Quando usa um preparado alquímico ou uma poção de dano, você pode gastar 2 PM e uma dose extra do mesmo item para aumentar o dano causado em 50%.',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Granadeiro' },
        { type: RequirementType.NIVEL, value: 7 },
      ],
    ],
  },
];

export default INVENTOR_POWERS;
