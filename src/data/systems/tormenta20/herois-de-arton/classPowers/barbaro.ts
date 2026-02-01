import { ClassPower } from '../../../../../interfaces/Class';
import { RequirementType } from '../../../../../interfaces/Poderes';
import Skill from '../../../../../interfaces/Skills';
import { Atributo } from '../../atributos';

/**
 * Poderes de Bárbaro do suplemento Heróis de Arton
 */
const BARBARO_POWERS: ClassPower[] = [
  {
    name: 'Alma Inabalável',
    text: 'Quando faz um teste de resistência, você pode gastar 1 PM para substituir a perícia normal por Intimidação. Se você passar no teste e a fonte do efeito for uma criatura, ela fica abalada por 1d4 rodadas (Vontade CD igual ao resultado do teste de Intimidação evita).',
    requirements: [
      [{ type: RequirementType.PERICIA, name: Skill.INTIMIDACAO }],
    ],
  },
  {
    name: 'Ampliar Brado',
    text: 'O alcance de seus brados aumenta para médio e a CD para resistir a eles aumenta em +2.',
    requirements: [],
  },
  {
    name: 'Arremesso Violento',
    text: 'Enquanto você está em fúria, o dano e o alcance de suas armas de arremesso aumenta em um passo (de curto para médio e de médio para longo) e a penalidade em ataques que você sofre por arremessar armas sem alcance diminui para –2.',
    requirements: [[{ type: RequirementType.PODER, name: 'Fúria da Savana' }]],
  },
  {
    name: 'Beberrão Selvagem',
    text: 'Você pode gastar uma ação de movimento para ingerir um preparado alquímico que cause dano e tenha uma criatura como alvo. Se fizer isso, armazena o equivalente a 3 cargas do preparado em sua boca. Até o fim da cena, sempre que acerta um ataque corpo a corpo, você pode gastar uma carga para que o ataque cause dano adicional igual ao do preparado.',
    requirements: [
      [
        {
          type: RequirementType.ATRIBUTO,
          name: Atributo.CONSTITUICAO,
          value: 3,
        },
      ],
    ],
  },
  {
    name: 'Brado: Assombroso',
    text: 'Você pode gastar uma quantidade de PM limitada pela sua Constituição. Para cada PM que gastar, você causa 1d6 pontos de dano psíquico em todos os inimigos no alcance do brado (Von CD Con reduz à metade). Medo.',
    requirements: [[{ type: RequirementType.PODER, name: 'Brado Assustador' }]],
  },
  {
    name: 'Brado: Retardante',
    text: 'Você dá um berro que faz seus inimigos hesitarem. Criaturas a sua escolha no alcance do brado ficam lentas por 1 rodada. Medo.',
    requirements: [],
  },
  {
    name: 'Brado: Sísmico',
    text: 'Você emite um brado que faz o chão tremer. Criaturas no alcance do brado ficam vulneráveis por 1d4 rodadas e caídas (Fort CD For reduz para vulneráveis por 1 rodada). Criaturas que já estavam vulneráveis, inclusive por este efeito, ficam desprevenidas pelo mesmo tempo.',
    requirements: [
      [{ type: RequirementType.TEXT, text: 'Outro poder de brado' }],
    ],
  },
  {
    name: 'Brado Vitorioso',
    text: 'Quando faz um acerto crítico ou reduz um inimigo a 0 ou menos PV enquanto está em fúria, você pode usar um dos seus poderes de brado como ação livre.',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Brado Assustador' },
        { type: RequirementType.PODER, name: 'Sangue dos Inimigos' },
      ],
    ],
  },
  {
    name: 'Enigma do Aço',
    text: 'Após tantas lutas e matanças, você descobriu que a verdadeira força não reside na arma, mas na mão de quem a empunha. Se estiver empunhando uma arma mundana, você recebe +5 em testes de ataque e causa dois dados extras de dano do mesmo tipo.',
    requirements: [[{ type: RequirementType.NIVEL, value: 17 }]],
  },
  {
    name: 'Espiritualista',
    text: 'Você recebe +1 PM a cada nível ímpar. Além disso, aprende e pode lançar uma magia adicional definida pelo seu animal totêmico (atributo-chave Sabedoria) e pode lançá-la e sustentá-la mesmo em fúria. As magias são: Coruja (Augúrio), Corvo (Voz Divina), Falcão (Mapear), Grifo (Físico Divino), Lobo (Localização), Raposa (Camuflagem Ilusória), Tartaruga (Vestimenta da Fé), Urso (Soco de Arsenal).',
    requirements: [
      [
        { type: RequirementType.ATRIBUTO, name: Atributo.SABEDORIA, value: 2 },
        { type: RequirementType.PODER, name: 'Totem Espiritual' },
        { type: RequirementType.NIVEL, value: 6 },
      ],
    ],
  },
  {
    name: 'Fúria Bestial',
    text: 'Enquanto você está em fúria, o dano das suas armas naturais aumenta em dois passos e o multiplicador de crítico delas aumenta em +1.',
    requirements: [],
  },
  {
    name: 'Fúria Elemental',
    text: 'Escolha um elemento entre ácido, eletricidade, fogo ou frio. Uma vez feita, essa escolha não pode ser mudada. Enquanto está em fúria e faz um ataque em que aplique seus benefícios, você causa +1d12 pontos de dano do tipo escolhido.',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Totem Espiritual' },
        { type: RequirementType.NIVEL, value: 11 },
      ],
    ],
  },
  {
    name: 'Impiedoso',
    text: 'Você recebe +2 em testes de ataque, rolagens de dano e na CD de suas habilidades contra criaturas vulneráveis.',
    requirements: [],
  },
  {
    name: 'Invocar os Ancestrais',
    text: 'Você pode gastar uma ação completa e 2 PM para invocar 1d4+1 ancestrais capangas em espaços desocupados em alcance curto. Eles têm Defesa igual à sua, 1 PV, são incorpóreos e falham automaticamente em qualquer teste de resistência ou oposto. Você pode gastar uma ação de movimento para fazê-los se mover (deslocamento 9m). Cada ancestral fornece um bônus cumulativo de +2 em rolagens de dano a um personagem adjacente e, uma vez por rodada, quando faz a ação agredir, você pode gastar um ancestral pra fazer um ataque adicional.',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Totem Espiritual' },
        { type: RequirementType.NIVEL, value: 11 },
      ],
    ],
  },
  {
    name: 'Manifestar Totem',
    text: 'Escolha um tipo de parceiro entre assassino, atirador, combatente, fortão, guardião, perseguidor ou montaria. Uma vez feita, essa escolha não pode ser mudada. Você pode gastar 3 PM e uma ação de movimento para invocar uma manifestação espiritual de seu animal totêmico até o fim da cena. Ele é um parceiro veterano do tipo escolhido.',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Totem Espiritual' },
        { type: RequirementType.NIVEL, value: 7 },
      ],
    ],
  },
  {
    name: 'Recuperação Gutural',
    text: 'Quando usa um brado enquanto está em fúria, você recebe uma quantidade de PV temporários igual à metade do seu nível + sua Força.',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Alma de Bronze' },
        { type: RequirementType.TEXT, text: 'Um poder de brado' },
      ],
    ],
  },
  {
    name: 'Regeneração Sobrenatural',
    text: 'Enquanto está em fúria e com menos da metade de seus PV máximos, você tem Cura Acelerada 5.',
    requirements: [
      [
        {
          type: RequirementType.ATRIBUTO,
          name: Atributo.CONSTITUICAO,
          value: 5,
        },
        { type: RequirementType.PODER, name: 'Vigor Primal' },
        { type: RequirementType.NIVEL, value: 5 },
      ],
    ],
  },
  {
    name: 'Revide',
    text: 'Uma vez por rodada, quando sofre dano de um ataque corpo a corpo enquanto está em fúria, você pode gastar 2 PM para fazer um ataque corpo a corpo contra a criatura que o atacou, desde que ela esteja em seu alcance.',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Frenesi' },
        { type: RequirementType.NIVEL, value: 11 },
      ],
    ],
  },
  {
    name: 'Rigidez Selvagem',
    text: 'Enquanto está em fúria, você soma o bônus da fúria na Defesa, em Fortitude e em RD.',
    requirements: [],
  },
  {
    name: 'Sede Sanguinária',
    text: 'Enquanto está em fúria, quando faz um acerto crítico ou reduz um inimigo a 0 PV ou menos, você recupera 10 PV e 2 PM.',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Sangue dos Inimigos' },
        { type: RequirementType.NIVEL, value: 5 },
      ],
    ],
  },
];

export default BARBARO_POWERS;
