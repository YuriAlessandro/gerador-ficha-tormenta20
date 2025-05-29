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
      Skill.PERCEPCAO,
      Skill.PONTARIA,
    ],
  },
  proficiencias: [PROFICIENCIAS.LEVES, PROFICIENCIAS.SIMPLES],
  abilities: [
    {
      name: 'Engenhosidade',
      text: 'Quando faz um teste de perícia, você pode gastar 2 PM para somar a sua Inteligência no teste. Você não pode usar esta habilidade em testes de ataque.',
      nivel: 1,
    },
    {
      name: 'Protótipo',
      text: 'Você começa o jogo com um item superior, ou com 10 itens alquímicos, com preço total de até T$ 500. Veja o Capítulo 3: Equipamento para a lista de itens.',
      nivel: 1,
    },
    {
      name: 'Fabricar Item Superior',
      text: 'No 2º nível, você recebe um item superior com preço de até T$ 2.000 e passa a poder fabricar itens superiores com uma melhoria. Veja o Capítulo 3: Equipamento para a lista de melhorias. Nos níveis 5, 8 e 11, você pode substituir esse item por um item superior com duas, três e quatro melhorias, respectivamente, e passa a poder fabricar itens superiores com essa quantidade de melhorias. Considera-se que você estava trabalhando nos itens e você não gasta dinheiro ou tempo neles (mas gasta em itens que fabricar futuramente).',
      nivel: 2,
    },
    {
      name: 'Comerciante',
      text: 'No 3º nível, você pode vender itens 10% mais caro (não cumulativo com barganha).',
      nivel: 3,
    },
    {
      name: 'Encontrar Fraqueza',
      text: 'A partir do 7º nível, você pode gastar uma ação de movimento e 2 PM para analisar um objeto em alcance curto. Se fizer isso, ignora a redução de dano dele. Você também pode usar esta habilidade para encontrar uma fraqueza em um inimigo. Se ele estiver de armadura ou for um construto, você recebe +2 em seus testes de ataque contra ele. Os benefícios desta habilidade duram até o fim da cena.',
      nivel: 7,
    },
    {
      name: 'Fabricar Item Mágico',
      text: 'No 9º nível, você recebe um item mágico menor e passa a poder fabricar itens mágicos menores. Veja o Capítulo 8: Recompensas para as regras de itens mágicos. Nos níveis 13 e 17, você pode substituir esse item por um item mágico médio e maior, respectivamente, e passa a poder fabricar itens mágicos dessas categorias. Considera-se que você estava trabalhando nos itens que recebe e você não gasta dinheiro, tempo ou pontos de mana neles (mas gasta em itens que fabricar futuramente).',
      nivel: 9,
    },
    {
      name: 'Olho do Dragão',
      text: 'A partir do 10º nível, você pode gastar uma ação completa para analisar um item. Você automaticamente descobre se o item é mágico, suas propriedades e como utilizá-las.',
      nivel: 11,
    },
    {
      name: 'Obra-Prima',
      text: 'No 20º nível, você fabrica sua obra-prima, aquela pela qual seu nome será lembrado em eras futuras. Você é livre para criar as regras do item, mas ele deve ser aprovado pelo mestre. Como linha geral, ele pode ter benefícios equivalentes a de um item com cinco melhorias e quatro encantos. Considera-se que você estava trabalhando no item e você não gasta dinheiro, tempo ou PM nele.',
      nivel: 20,
    },
  ],
  powers: [
    {
      name: 'Agite Antes de Usar',
      text: 'Quando usa um preparado alquímico que cause dano, você pode gastar uma quantidade de PM a sua escolha (limitado por sua Inteligência). Para cada PM que gastar, o item causa um dado extra de dano do mesmo tipo.',
      requirements: [
        [{ type: RequirementType.PERICIA, name: Skill.OFICIO_ALQUIMIA }],
      ],
    },
    {
      name: 'Ajuste de Mira.',
      text: 'Você pode gastar uma ação padrão e uma quantidade de PM a sua escolha (limitado pela sua Inteligência) para aprimorar uma arma de ataque à distância. Para cada PM que gastar, você recebe +1 em rolagens de dano com a arma até o final da cena.',
      requirements: [[{ type: RequirementType.PODER, name: 'Balística' }]],
    },
    {
      name: 'Alquimista de Batalha',
      text: 'Quando usa um preparado alquímico ou poção que cause dano, você soma sua Inteligência na rolagem de dano.',
      requirements: [
        [{ type: RequirementType.PODER, name: 'Alquimista Iniciado' }],
      ],
    },
    {
      name: 'Alquimista Iniciado',
      text: 'Você recebe um livro de fórmulas e pode fabricar poções com fórmulas que conheça de 1º e 2º círculos. Veja as páginas 333 e 341 para as regras de poções.',
      requirements: [
        [
          { type: RequirementType.ATRIBUTO, name: 'Inteligência', value: 1 },
          { type: RequirementType.ATRIBUTO, name: 'Sabedoria', value: 1 },
          { type: RequirementType.PERICIA, name: Skill.OFICIO_ALQUIMIA },
        ],
      ],
    },
    {
      name: 'Armeiro',
      text: 'Você recebe proficiência com armas marciais corpo a corpo. Quando empunha uma arma corpo a corpo, pode usar sua Inteligência em vez de Força nos testes de ataque e rolagens de dano.',
      requirements: [
        [
          { type: RequirementType.PERICIA, name: Skill.OFICIO_ARMEIRO },
          { type: RequirementType.PERICIA, name: Skill.LUTA },
        ],
      ],
    },
    {
      name: 'Ativação Rápida',
      text: 'Ao ativar uma engenhoca com ação padrão, você pode pagar 2 PM para ativá-la com uma ação de movimento, em vez disto.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Engenhoqueiro' },
          { type: RequirementType.NIVEL, value: 7 },
        ],
      ],
    },
    {
      name: 'Aumento de Atributo',
      text: 'Você recebe +1 em um atributo. Você pode escolher este poder várias vezes, mas apenas uma vez por patamar para um mesmo atributo.',
      requirements: [[]],
      canRepeat: true,
      sheetActions: [
        {
          source: { type: 'power', name: 'Aumento de Atributo' },
          action: { type: 'increaseAttribute' },
        },
      ],
    },
    {
      name: 'Autômato',
      text: 'Você fabrica um autômato, um construto que obedece a seus comandos. Ele é um parceiro iniciante de um tipo a sua escolha entre ajudante, assassino, atirador, combatente, guardião, montaria ou vigilante. No 7º nível, ele muda para veterano e, no 15º nível, para mestre. Se o autômato for destruído, você pode fabricar um novo com uma semana de trabalho e T$ 100.',
      requirements: [[{ type: RequirementType.PODER, name: 'Engenhoqueiro' }]],
    },
    {
      name: 'Autômato Prototipado',
      text: 'Você pode gastar uma ação padrão e 2 PM para ativar uma melhoria experimental em seu autômato. Role 1d6. Em um resultado 2 a 6, você aumenta o nível de parceiro do autômato em um passo (até mestre), ou concede a ele a habilidade iniciante de outro de seus tipos, até o fim da cena. Em um resultado 1, o autômato enguiça como uma engenhoca.',
      requirements: [[{ type: RequirementType.PODER, name: 'Autômato' }]],
    },
    {
      name: 'Balística',
      text: 'Você recebe proficiência com armas marciais de ataque à distância ou com armas de fogo. Quando usa uma arma de ataque à distância, pode usar sua Inteligência em vez de Destreza nos testes de ataque (e, caso possua o poder Estilo de Disparo, nas rolagens de dano).',
      requirements: [
        [
          { type: RequirementType.PERICIA, name: Skill.PONTARIA },
          { type: RequirementType.PERICIA, name: Skill.OFICIO_ARMEIRO },
        ],
      ],
      sheetActions: [
        {
          source: {
            type: 'power',
            name: 'Balística',
          },
          action: {
            type: 'addProficiency',
            availableProficiencies: [
              PROFICIENCIAS.MARCIAIS_DISTANCIA,
              PROFICIENCIAS.FOGO,
            ],
            pick: 1,
          },
        },
      ],
    },
    {
      name: 'Blindagem',
      text: 'Você pode usar sua Inteligência na Defesa quando usa armadura pesada. Se fizer isso, não pode somar sua Destreza, mesmo que outras habilidades ou efeitos permitam isso.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Couraceiro' },
          { type: RequirementType.NIVEL, value: 8 },
        ],
      ],
    },
    {
      name: 'Cano Raiado',
      text: 'Quando usa uma arma de disparo feita por você mesmo, ela recebe +1 na margem de ameaça.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Balística' },
          { type: RequirementType.NIVEL, value: 5 },
        ],
      ],
    },
    {
      name: 'Catalisador Instável',
      text: 'Você pode gastar uma ação completa e 3 PM para fabricar um preparado alquímico ou poção cuja fórmula conheça instantaneamente. O custo do item é reduzido à metade e você não precisa fazer o teste de Ofício (alquimista), mas ele só dura até o fim da cena.',
      requirements: [
        [{ type: RequirementType.PODER, name: 'Alquimista Iniciado' }],
      ],
    },
    {
      name: 'Chutes e Palavrões',
      text: 'Uma vez por rodada, você pode pagar 1 PM para repetir um teste de Ofício (engenhoqueiro) recém realizado para ativar uma engenhoca.',
      requirements: [[{ type: RequirementType.PODER, name: 'Engenhoqueiro' }]],
    },
    {
      name: 'Conhecimento de Fórmulas',
      text: 'Você aprende três fórmulas de quaisquer círculos que possa aprender. Você pode escolher este poder quantas vezes quiser.',
      requirements: [
        [{ type: RequirementType.PODER, name: 'Alquimista Iniciado' }],
      ],
      canRepeat: true,
    },
    {
      name: 'Couraceiro',
      text: 'Você recebe proficiência com armaduras pesadas e escudos. Quando usa armadura, pode usar sua Inteligência em vez de Destreza na Defesa (mas continua não podendo somar um atributo na Defesa quando usa armadura pesada).',
      requirements: [
        [{ type: RequirementType.PERICIA, name: Skill.OFICIO_ARMEIRO }],
      ],
    },
    {
      name: 'Engenhoqueiro',
      text: 'Você pode fabricar engenhocas. Veja as regras para isso na página 70.',
      requirements: [
        [
          { type: RequirementType.ATRIBUTO, name: 'Inteligência', value: 3 },
          { type: RequirementType.PERICIA, name: Skill.OFICIO_EGENHOQUEIRO },
        ],
      ],
    },
    {
      name: 'Farmacêutico',
      text: 'Quando usa um item alquímico que cure pontos de vida, você pode gastar uma quantidade de PM a sua escolha (limitado por sua Inteligência). Para cada PM que gastar, o item cura um dado extra do mesmo tipo.',
      requirements: [
        [
          { type: RequirementType.ATRIBUTO, name: 'Sabedoria', value: 1 },
          { type: RequirementType.PERICIA, name: Skill.OFICIO_ALQUIMIA },
        ],
      ],
    },
    {
      name: 'Ferreiro',
      text: ' Quando usa uma arma corpo a corpo feita por você mesmo, o dano dela aumenta em um passo.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Armeiro' },
          { type: RequirementType.NIVEL, value: 5 },
        ],
      ],
    },
    {
      name: 'Granadeiro',
      text: 'Você pode arremessar itens alquímicos e poções em alcance médio. Você pode usar sua Inteligência em vez de Destreza para calcular a CD do teste de resistência desses itens.',
      requirements: [
        [{ type: RequirementType.PODER, name: 'Alquimista de Batalha' }],
      ],
    },
    {
      name: 'Homúnculo',
      text: 'Você possui um homúnculo, uma criatura Minúscula feita de alquimia. Vocês podem se comunicar telepaticamente em alcance longo e ele obedece a suas ordens, mas ainda está limitado ao que uma criatura de seu tamanho pode fazer. Um homúnculo é um parceiro ajudante iniciante. Você pode perder 1d6 pontos de vida para seu homúnculo assumir uma forma capaz de protegê-lo e se tornar também um parceiro guardião iniciante até o fim da cena.',
      requirements: [
        [{ type: RequirementType.PODER, name: 'Alquimista Iniciado' }],
      ],
    },
    {
      name: 'Invenção Potente',
      text: 'Quando usa um item ou engenhoca fabricado por você mesmo, você pode pagar 1 PM para aumentar em +2 a CD para resistir a ele.',
      requirements: [[]],
    },
    {
      name: 'Maestria em Perícia',
      text: 'Escolha um número de perícias treinadas igual a sua Inteligência, exceto bônus temporários. Com essas perícias, você pode gastar 1 PM para escolher 10 em qualquer situação, exceto testes de ataque.',
      requirements: [[]],
    },
    {
      name: 'Manutenção Eficiente',
      text: 'A quantidade de engenhocas que você pode manter aumenta em +3. Além disso, cada engenhoca passa a ocupar meio espaço.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Engenhoqueiro' },
          { type: RequirementType.NIVEL, value: 5 },
        ],
      ],
    },
    {
      name: 'Mestre Alquimista',
      text: 'Você pode fabricar poções com fórmulas que conheça de qualquer círculo.',
      requirements: [
        [
          { type: RequirementType.ATRIBUTO, name: 'Inteligência', value: 3 },
          { type: RequirementType.ATRIBUTO, name: 'Sabedoria', value: 3 },
          { type: RequirementType.PODER, name: 'Alquimista Iniciado' },
          { type: RequirementType.NIVEL, value: 10 },
        ],
      ],
    },
    {
      name: 'Mestre Cuca',
      text: 'Todas as comidas que você cozinha têm seu bônus numérico aumentado em +1.',
      requirements: [
        [{ type: RequirementType.PERICIA, name: Skill.OFICIO_CULINARIA }],
      ],
    },
    {
      name: 'Mistura Fervilhante',
      text: 'Quando usa um item alquímico ou poção, você pode gastar 2 PM para dobrar a área de efeito dele.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Alquimista Iniciado' },
          { type: RequirementType.NIVEL, value: 5 },
        ],
      ],
    },
    {
      name: 'Oficina de Campo',
      text: 'Você pode gastar uma hora e 2 PM para fazer a manutenção do equipamento de seu grupo. Cada membro do grupo escolhe uma arma, armadura ou escudo para manutenção. Armas recebem +1 em testes de ataque, armaduras e escudos aumentam seu bônus na Defesa em +1. Os benefícios duram um dia.',
      requirements: [
        [{ type: RequirementType.PERICIA, name: Skill.OFICIO_ARMEIRO }],
      ],
    },
    {
      name: 'Pedra de Amolar',
      text: 'Você pode gastar uma ação de movimento e uma quantidade de PM a sua escolha (limitado por sua Inteligência) para aprimorar uma arma corpo a corpo que esteja empunhando. Para cada PM que gastar, você recebe +1 em rolagens de dano com a arma até o final da cena.',
      requirements: [[{ type: RequirementType.PODER, name: 'Armeiro' }]],
    },
    {
      name: 'Síntese Rápida',
      text: 'Quando fabrica um item alquímico ou poção, você pode fabricar o dobro de doses no mesmo tempo (pagando o custo de matéria-prima de cada uma).',
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
