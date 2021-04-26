import { ClassDescription } from '../../interfaces/Class';
import { RequirementType } from '../../interfaces/Poderes';
import Skill from '../../interfaces/Skills';
import { Atributo } from '../atributos';
import PROFICIENCIAS from '../proficiencias';

const INVENTOR: ClassDescription = {
  name: 'Inventor',
  pv: 12,
  addpv: 3,
  pm: 4,
  addpm: 4,
  periciasbasicas: [
    {
      type: 'and',
      list: [Skill.OFICIO, Skill.VONTADE],
    },
  ],
  periciasrestantes: {
    qtd: 4,
    list: [
      Skill.CONHECIMENTO,
      Skill.CURA,
      Skill.DIPLOMACIA,
      Skill.FORTITUDE,
      Skill.INICIATIVA,
      Skill.INVESTIGACAO,
      Skill.LUTA,
      Skill.MISTICISMO,
      Skill.OFICIO,
      Skill.PILOTAGEM,
      Skill.PONTARIA,
      Skill.PERCEPCAO,
    ],
  },
  proficiencias: [PROFICIENCIAS.LEVES, PROFICIENCIAS.SIMPLES],
  abilities: [
    {
      name: 'Engenhosidade',
      text:
        'Quando faz um teste de perícia, você pode gastar 2 PM para receber um bônus igual ao seu modificador de Inteligência no teste. Você não pode usar esta habilidade em testes de ataque.',
      nivel: 1,
    },
    {
      name: 'Protótipo',
      text:
        'Você começa o jogo com um item superior com uma modificação ou 10 itens alquímicos, com preço total de até T$ 500. Veja o Capítulo 3: Equipamento para a lista de itens.',
      nivel: 1,
    },
    {
      name: 'Fabricar Item Superior',
      text:
        'No 2º nível, você recebe um item superior com preço de até T$ 2.000 e passa a poder fabricar itens superiores com uma modificação. Veja o Capítulo 3: Equipamento para a lista de modificações.\nNos níveis 4, 6, 8, 10 e 12, você pode substituir esse item por um item superior com duas, três, quatro, cinco e seis modificações, respectivamente, e passa a poder fabricar itens superiores com essa quantidade de modificações. O item do 4º nível tem limite de preço de T$ 5.000. Os demais itens não possuem limitação de preço.\nConsidera-se que você estava trabalhando nos itens e você não gasta dinheiro ou tempo neles (mas gasta em itens que fabricar futuramente).',
      nivel: 2,
    },
    {
      name: 'Comerciante',
      text:
        'No 3º nível, você pode vender itens 10% mais caro (não cumulativo com barganha).',
      nivel: 3,
    },
    {
      name: 'Encontrar Fraqueza',
      text:
        'A partir do 7º nível, você pode gastar uma ação de movimento e 2 PM para analisar um objeto em alcance curto. Se fizer isso, ignora a resistência a dano dele. Você também pode usar esta habilidade para encontrar uma fraqueza em um inimigo. Se ele estiver de armadura ou for um construto, você recebe +2 em seus testes de ataque contra ele. Os benefícios desta habilidade duram até o fim da cena.',
      nivel: 7,
    },
    {
      name: 'Fabricar Item Mágico',
      text:
        'No 9º nível, você recebe um item mágico menor e passa a poder fabricar itens mágicos menores. Veja o Capítulo 8: Recompensas para as regras de itens mágicos.\nNos níveis 13 e 17, você pode substituir esse item por um item mágico médio e maior, respectivamente, e passa a poder fabricar itens mágicos dessas categorias.\nConsidera-se que você estava trabalhando nos itens que recebe e você não gasta dinheiro, tempo ou pontos de mana neles (mas gasta em itens que fabricar futuramente).',
      nivel: 9,
    },
    {
      name: 'Olho do Dragão',
      text:
        'A partir do 11º nível, você pode gastar uma ação completa para analisar um item. Você automaticamente descobre se o item é mágico, suas propriedades e como utilizá-las.',
      nivel: 11,
    },
    {
      name: 'Obra-Prima',
      text:
        'No 20º nível, você fabrica sua obra-prima, aquela pela qual seu nome será lembrado em eras futuras. Você é livre para criar as regras do item, mas ele deve ser aprovado pelo mestre. Como linha geral, ele pode ter os benefícios de um item superior com seis modificações e de um item mágico maior. Considera-se que você estava trabalhando no item e você não gasta dinheiro, tempo ou PM nele.',
      nivel: 20,
    },
  ],
  powers: [
    {
      name: 'Agite Antes de Usar',
      text:
        'Quando usa um item alquímico que cause dano, você pode gastar uma quantidade de PM a sua escolha (limitado pelo seu bônus de Inteligência). Para cada PM que gastar, o item causa um dado extra de dano do mesmo tipo.',
      requirements: [
        [{ type: RequirementType.PERICIA, name: 'Ofício (Alquímia)' }],
      ],
    },
    {
      name: 'Ajuste de Mira.',
      text:
        'Você pode gastar uma ação de movimento e uma quantidade de PM a sua escolha (limitado pelo seu bônus de Inteligência) para aprimorar uma arma de ataque à distância que esteja usando. Para cada PM que gastar, você recebe +1 em rolagens de dano com a arma até o final da cena.',
      requirements: [[{ type: RequirementType.PODER, name: 'Balística' }]],
    },
    {
      name: 'Alquimista de Batalha',
      text:
        'Quando usa um item alquímico ou poção que cause dano, você soma seu modificador de Inteligência na rolagem de dano.',
      requirements: [
        [{ type: RequirementType.PODER, name: 'Alquimista Iniciado' }],
      ],
    },
    {
      name: 'Alquimista Iniciado',
      text:
        'Você recebe um livro de fórmulas e pode fabricar poções com fórmulas que conheça de 1º e 2º círculos. Veja a página 327 para as regras de poções.',
      requirements: [
        [
          { type: RequirementType.ATRIBUTO, name: 'Inteligência', value: 13 },
          { type: RequirementType.ATRIBUTO, name: 'Sabedoria', value: 13 },
          { type: RequirementType.PERICIA, name: 'Ofício (Alquímia)' },
        ],
      ],
    },
    {
      name: 'Armeiro',
      text:
        'Você recebe proficiência com armas marciais corpo a corpo. Quando usa uma arma corpo a corpo, pode usar seu modificador de Inteligência em vez de Força nos testes de ataque e rolagens de dano.',
      requirements: [
        [
          { type: RequirementType.PERICIA, name: 'Ofício (Armeiro)' },
          { type: RequirementType.PERICIA, name: 'Luta' },
        ],
      ],
    },
    {
      name: 'Ativação Rápida',
      text:
        'Ao ativar uma engenhoca com ação padrão, você pode pagar 2 PM para ativá-la com uma ação de movimento, ao invés disto.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Engenhoqueiro' },
          { type: RequirementType.NIVEL, value: 7 },
        ],
      ],
    },
    {
      name: 'Aumento de Atributo',
      text:
        'Você recebe +2 em um atributo a sua escolha. Você pode escolher este poder várias vezes. A partir da segunda vez que escolhê-lo para o mesmo atributo, o aumento diminui para +1.',
      requirements: [[]],
      canRepeat: true,
    },
    {
      name: 'Autômato',
      text:
        'Você fabrica um autômato, uma criatura mecânica que obedece a seus comandos. Ele é um aliado Iniciante de um tipo a sua escolha entre ajudante, assassino, atirador, combatente, guardião, montaria ou vigilante. No 7º nível, ele muda para Veterano e, no 15º nível, para Mestre. Se o autômato for destruído, você pode fabricar um novo com uma semana de trabalho e T$ 100.',
      requirements: [[]],
    },
    {
      name: 'Autômato Prototipado',
      text:
        'Você pode gastar uma ação padrão e 2 PM para ativar uma modificação experimental em seu autômato. Role 1d6. Em um resultado 2 a 6, você aumenta o nível de aliado do autômato em um passo (até Mestre), ou concede a ele a habilidade Iniciante de outro tipo de aliado, até o fim da cena. Em um resultado 1, o autômato enguiça como uma engenhoca.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Autômato' },
          { type: RequirementType.PODER, name: 'Engenhoqueiro' },
        ],
      ],
    },
    {
      name: 'Balística',
      text:
        'Você recebe proficiência com armas marciais de ataque à distância ou com armas de fogo. Quando usa uma arma de ataque à distância, pode usar seu modificador de Inteligência em vez de Destreza nos testes de ataque (e, caso possua o poder Estilo de Disparo, nas rolagens de dano).',
      requirements: [
        [
          { type: RequirementType.PERICIA, name: 'Pontaria' },
          { type: RequirementType.PERICIA, name: 'Ofício (Armeiro)' },
        ],
      ],
    },
    {
      name: 'Blindagem',
      text:
        'Você pode somar o modificador de Inteligência na Defesa quando usa armadura pesada. Se fizer isso, não pode somar o modificador de Destreza, mesmo que outras habilidades ou efeitos permitam isso (como a modificação Delicada, por exemplo).',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Couraceiro' },
          { type: RequirementType.NIVEL, value: 8 },
        ],
      ],
    },
    {
      name: 'Cano Raiado',
      text:
        'Quando usa uma arma de disparo feita por você mesmo, ela recebe +1 na margem de ameaça.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Balística' },
          { type: RequirementType.NIVEL, value: 5 },
        ],
      ],
    },
    {
      name: 'Catalisador Instável',
      text:
        'Você pode gastar uma ação completa e 3 PM para fabricar um item alquímico ou poção cuja fórmula conheça instantaneamente. O custo do item é reduzido à metade e você não precisa fazer o teste de Ofício (alquimia). Contudo, ele só dura até o fim da cena.',
      requirements: [
        [{ type: RequirementType.PODER, name: 'Alquimista Iniciado' }],
      ],
    },
    {
      name: 'Chutes e Palavrões',
      text:
        'Uma vez por rodada, você pode pagar 1 PM para repetir um teste falho de Ofício (engenhoqueiro) recém realizado para ativar uma engenhoca.',
      requirements: [[{ type: RequirementType.PODER, name: 'Engenhoqueiro' }]],
    },
    {
      name: 'Conhecimento de Fórmulas',
      text:
        'Você aprende três fórmulas de quaisquer círculos que possa aprender. Você pode escolher este poder quantas vezes quiser.',
      requirements: [
        [{ type: RequirementType.PODER, name: 'Alquimista Iniciado' }],
      ],
    },
    {
      name: 'Couraceiro',
      text:
        'Você recebe proficiência com armaduras pesadas e escudos. Quando usa armadura, pode somar seu bônus de Inteligência em vez de Destreza na Defesa (mas continua não podendo somar um bônus de atributo na Defesa quando usa armadura pesada).',
      requirements: [
        [{ type: RequirementType.PERICIA, name: 'Ofício (Armeiro)' }],
      ],
    },
    {
      name: 'Engenhoqueiro',
      text:
        'Você pode fabricar engenhocas. Veja as regras para isso na página 70.',
      requirements: [
        [
          { type: RequirementType.ATRIBUTO, name: 'Inteligência', value: 17 },
          { type: RequirementType.PERICIA, name: 'Ofício (Engenhoqueiro)' },
        ],
      ],
    },
    {
      name: 'Farmacêutico',
      text:
        'Quando usa um item alquímico que cure pontos de vida, você pode gastar uma quantidade de PM a sua escolha (limitado pelo seu bônus de Inteligência). Para cada PM que gastar, o item cura um dado extra do mesmo tipo.',
      requirements: [
        [
          { type: RequirementType.ATRIBUTO, name: 'Sabedoria', value: 13 },
          { type: RequirementType.PERICIA, name: 'Ofício (Alquimia)' },
        ],
      ],
    },
    {
      name: 'Ferreiro',
      text:
        'Quando usa uma arma corpo a corpo feita por você mesmo, o dano dela aumenta em um passo.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Armeiro' },
          { type: RequirementType.NIVEL, value: 5 },
        ],
      ],
    },
    {
      name: 'Granadeiro',
      text:
        'Você pode arremessar itens alquímicos e poções em alcance médio. Você pode usar seu modificador de Inteligência em vez de Destreza para calcular a CD do teste de resistência desses itens.',
      requirements: [
        [{ type: RequirementType.PODER, name: 'Alquimista de Batalha' }],
      ],
    },
    {
      name: 'Homúnculo',
      text:
        'Você possui um homúnculo, uma criatura Minúscula feita de alquimia. Vocês podem se comunicar telepaticamente em alcance médio e ele obedece a suas ordens, mas ainda está limitado ao que uma criatura de seu tamanho e forma pode fazer. Um homúnculo funciona como um aliado que fornece +2 em testes de uma perícia a sua escolha. Você pode sofrer 1d6 pontos de dano para seu homúnculo assumir uma forma capaz de protegê-lo. Se fizer isso, ele fornece +2 de Defesa até o fim da cena.',
      requirements: [
        [{ type: RequirementType.PODER, name: 'Alquimista Iniciado' }],
      ],
    },
    {
      name: 'Invenção Potente',
      text:
        'Quando usa um item fabricado por você mesmo, você pode pagar 1 PM para aumentar em +2 a CD para resistir a ele.',
      requirements: [[]],
    },
    {
      name: 'Maestria em Perícia',
      text:
        'Escolha um número de perícias treinadas igual ao seu bônus de Inteligência. Com essas perícias, você pode gastar 1 PM para escolher 10 em qualquer situação, exceto testes de ataque.',
      requirements: [[]],
    },
    {
      name: 'Manutenção Eficiente',
      text: 'A quantidade de engenhocas que você pode manter aumenta em +3.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Engenhoqueiro' },
          { type: RequirementType.NIVEL, value: 5 },
        ],
      ],
    },
    {
      name: 'Mestre Alquimista',
      text:
        'Você pode fabricar poções com fórmulas que conheça de qualquer círculo.',
      requirements: [
        [
          { type: RequirementType.ATRIBUTO, name: 'Inteligência', value: 17 },
          { type: RequirementType.ATRIBUTO, name: 'Sabedoria', value: 17 },
          { type: RequirementType.PODER, name: 'Alquimista Iniciado' },
          { type: RequirementType.NIVEL, value: 10 },
        ],
      ],
    },
    {
      name: 'Mestre Cuca',
      text:
        'Todas as comidas que você cozinha têm seu bônus numérico aumentado em +1.',
      requirements: [
        [{ type: RequirementType.PERICIA, name: 'Ofício (Culinária)' }],
      ],
    },
    {
      name: 'Mistura Fervilhante',
      text:
        'Quando usa um item alquímico ou poção, você pode gastar 2 PM para dobrar a área de efeito dele.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Alquimista Iniciado' },
          { type: RequirementType.NIVEL, value: 5 },
        ],
      ],
    },
    {
      name: 'Oficina de Campo',
      text:
        'Você pode gastar uma hora e 2 PM para fazer a manutenção do equipamento de seu grupo. Cada membro do grupo escolhe uma arma, armadura ou escudo para manutenção. Armas recebem +1 em testes de ataque, armaduras e escudos têm sua penalidade de armadura reduzida em 1. Os benefícios duram um dia.',
      requirements: [
        [{ type: RequirementType.PERICIA, name: 'Ofício (Armeiro)' }],
      ],
    },
    {
      name: 'Pedra de Amolar',
      text:
        'Você pode gastar uma ação de movimento e uma quantidade de PM a sua escolha (limitado pelo seu bônus de Inteligência) para aprimorar uma arma corpo a corpo que esteja usando. Para cada PM que gastar, você recebe +1 em rolagens de dano com a arma até o final da cena.',
      requirements: [[{ type: RequirementType.PODER, name: 'Armeiro' }]],
    },
    {
      name: 'Síntese Rápida',
      text:
        'Você fabrica itens alquímicos e poções em uma categoria de tempo menor. Três meses viram um mês, um mês vira uma semana, uma semana vira um dia e um dia vira uma hora (o tempo mínimo).',
      requirements: [
        [{ type: RequirementType.PODER, name: 'Alquimista Iniciado' }],
      ],
    },
  ],
  probDevoto: 0.3,
  faithProbability: {
    HYNINN: 1,
    NIMB: 1,
    SSZZAAS: 1,
    TANNATOH: 1,
    THYATIS: 1,
    VALKARIA: 1,
  },
  attrPriority: [Atributo.INTELIGENCIA],
};

export default INVENTOR;
