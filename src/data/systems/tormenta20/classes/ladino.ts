import { v4 as uuid } from 'uuid';
import { ClassDescription } from '../../../../interfaces/Class';
import { RequirementType } from '../../../../interfaces/Poderes';
import Skill from '../../../../interfaces/Skills';
import { Atributo } from '../atributos';
import PROFICIENCIAS from '../proficiencias';
import { allArcaneSpellsCircle1 } from '../magias/arcane';

const LADINO: ClassDescription = {
  name: 'Ladino',
  pv: 12,
  addpv: 3,
  pm: 4,
  addpm: 4,
  periciasbasicas: [
    {
      type: 'and',
      list: [Skill.LADINAGEM, Skill.REFLEXOS],
    },
  ],
  periciasrestantes: {
    qtd: 8,
    list: [
      Skill.ACROBACIA,
      Skill.ATLETISMO,
      Skill.ATUACAO,
      Skill.CAVALGAR,
      Skill.CONHECIMENTO,
      Skill.DIPLOMACIA,
      Skill.ENGANACAO,
      Skill.FURTIVIDADE,
      Skill.INICIATIVA,
      Skill.INTIMIDACAO,
      Skill.INTUICAO,
      Skill.INVESTIGACAO,
      Skill.JOGATINA,
      Skill.LUTA,
      Skill.OFICIO,
      Skill.PERCEPCAO,
      Skill.PONTARIA,
      Skill.PILOTAGEM,
    ],
  },
  proficiencias: [PROFICIENCIAS.LEVES, PROFICIENCIAS.SIMPLES],
  abilities: [
    {
      name: 'Ataque Furtivo',
      text: 'Você sabe atingir os pontos vitais de inimigos distraídos. Uma vez por rodada, quando atinge uma criatura desprevenida com um ataque corpo a corpo ou em alcance curto, ou uma criatura que esteja flanqueando, você causa 1d6 pontos de dano extra. A cada dois níveis, esse dano extra aumenta em +1d6. Uma criatura imune a acertos críticos também é imune a ataques furtivos.',
      nivel: 1,
      rolls: [
        {
          id: uuid(),
          label: 'Dano Furtivo (base)',
          dice: '1d6',
        },
      ],
    },
    {
      name: 'Especialista',
      text: 'Escolha um número de perícias treinadas igual a sua Inteligência, exceto bônus temporários (mínimo 1). Ao fazer um teste de uma dessas perícias, você pode gastar 1 PM para dobrar seu bônus de treinamento. Você não pode usar esta habilidade em testes de ataque.',
      nivel: 1,
    },
    {
      name: 'Evasão',
      text: 'A partir do 2º nível, quando sofre um efeito que permite um teste de Reflexos para reduzir o dano à metade, você não sofre dano algum se passar. Você ainda sofre dano normal se falhar no teste de Reflexos. Esta habilidade exige liberdade de movimentos; você não pode usá-la se estiver de armadura pesada ou na condição imóvel.',
      nivel: 2,
    },
    {
      name: 'Esquiva Sobrenatural',
      text: 'No 4º nível, seus instintos são tão apurados que você consegue reagir ao perigo antes que seus sentidos percebam. Você nunca fica surpreendido.',
      nivel: 4,
    },
    {
      name: 'Olhos nas Costas',
      text: 'A partir do 8º nível, você consegue lutar contra diversos inimigos como se fossem apenas um. Você não pode ser flanqueado.',
      nivel: 8,
    },
    {
      name: 'Evasão Aprimorada',
      text: 'No 10º nível, quando sofre um efeito que permite um teste de Reflexos para reduzir o dano à metade, você não sofre dano algum se passar e sofre apenas metade do dano se falhar. Esta habilidade exige liberdade de movimentos; você não pode usá- -la se estiver de armadura pesada ou na condição imóvel.',
      nivel: 10,
    },
    {
      name: 'A Pessoa Certa para o Trabalho',
      text: 'No 20º nível, você se torna um mestre da ladinagem. Ao fazer um ataque furtivo ou usar uma perícia da lista de ladino, você pode gastar 5 PM para receber +10 no teste.',
      nivel: 20,
    },
  ],
  powers: [
    {
      name: 'Assassinar',
      text: 'Você pode gastar uma ação de movimento e 3 PM para analisar uma criatura em alcance curto. Até o fim de seu próximo turno, seu primeiro Ataque Furtivo que causar dano a ela tem seus dados de dano extras dessa habilidade dobrados.',
      requirements: [[{ type: RequirementType.NIVEL, value: 5 }]],
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
      name: 'Contatos no Submundo',
      text: 'Quando chega em uma comunidade equivalente a uma vila ou maior, você pode gastar 2 PM para fazer um teste de Carisma (CD 10). Se passar, enquanto estiver nessa comunidade, recebe +5 em testes de Investigação para interrogar, pode comprar itens mundanos, poções e pergaminhos com 20% de desconto (não cumulativo com barganha e outros descontos) e, de acordo com o mestre, tem acesso a itens e serviços proibidos (como armas de pólvora e venenos).',
      requirements: [],
    },
    {
      name: 'Emboscar',
      text: 'Na primeira rodada de cada combate, você pode gastar 2 PM para executar uma ação padrão adicional em seu turno.',
      requirements: [
        [{ type: RequirementType.PERICIA, name: Skill.FURTIVIDADE }],
      ],
    },
    {
      name: 'Escapista',
      text: 'Você recebe +5 em testes de Acrobacia para escapar, passar por espaço apertado e passar por inimigo e em testes para resistir a efeitos de movimento.',
      requirements: [],
    },
    {
      name: 'Fuga Formidável',
      text: 'Você pode gastar uma ação completa e 1 PM para analisar o lugar no qual está (um castelo, um porto, a praça de uma cidade...). Até o fim da cena, recebe +3m em seu deslocamento, +5 em Acrobacia e Atletismo e ignora penalidades em movimento por terreno difícil. Você perde esses benefícios se fizer uma ação que não seja diretamente relacionada a fugir. Por exemplo, você só pode atacar um inimigo se ele estiver bloqueando seu caminho, agarrando-o etc. Você pode fazer ações para ajudar seus aliados, mas apenas se eles estiverem tentando escapar.',
      requirements: [
        [{ type: RequirementType.ATRIBUTO, name: 'Inteligência', value: 1 }],
      ],
    },
    {
      name: 'Gatuno',
      text: 'Você recebe +2 em Atletismo. Quando escala, não fica desprevenido e avança seu deslocamento normal, em vez de metade dele.',
      requirements: [
        [{ type: RequirementType.PERICIA, name: Skill.ATLETISMO }],
      ],
      sheetBonuses: [
        {
          source: {
            type: 'power',
            name: 'Gatuno',
          },
          target: {
            type: 'Skill',
            name: Skill.ATLETISMO,
          },
          modifier: {
            type: 'Fixed',
            value: 2,
          },
        },
      ],
    },
    {
      name: 'Ladrão Arcano',
      text: 'Quando causa dano com um ataque furtivo em uma criatura capaz de lançar magias, você pode “roubar” uma magia que já a tenha visto lançar. Você precisa pagar 1 PM por círculo da magia e pode roubar magias de até 4º círculo. Até o fim da cena, você pode lançar a magia roubada (atributo-chave Inteligência).',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Roubo de Mana' },
          { type: RequirementType.NIVEL, value: 13 },
        ],
      ],
    },
    {
      name: 'Mão na Boca',
      text: 'Você recebe +2 em testes de agarrar. Quando acerta um ataque furtivo contra uma criatura desprevenida, você pode fazer um teste de agarrar como uma ação livre. Se agarrar a criatura, ela não poderá falar enquanto estiver agarrada.',
      requirements: [[{ type: RequirementType.PERICIA, name: Skill.LUTA }]],
    },
    {
      name: 'Mãos Rápidas',
      text: 'Uma vez por rodada, ao fazer um teste de Ladinagem para abrir fechaduras, ocultar item, punga ou sabotar, você pode pagar 1 PM para fazê-lo como uma ação livre.',
      requirements: [
        [
          { type: RequirementType.ATRIBUTO, name: 'Destreza', value: 2 },
          { type: RequirementType.PERICIA, name: Skill.LADINAGEM },
        ],
      ],
    },
    {
      name: 'Mente Criminosa',
      text: 'Você soma sua Inteligência em Ladinagem e Furtividade',
      requirements: [
        [{ type: RequirementType.ATRIBUTO, name: 'Destreza', value: 1 }],
      ],
      sheetBonuses: [
        {
          source: {
            type: 'power',
            name: 'Mente Criminosa',
          },
          target: {
            type: 'Skill',
            name: Skill.LADINAGEM,
          },
          modifier: {
            type: 'Attribute',
            attribute: Atributo.INTELIGENCIA,
          },
        },
        {
          source: {
            type: 'power',
            name: 'Mente Criminosa',
          },
          target: {
            type: 'Skill',
            name: Skill.FURTIVIDADE,
          },
          modifier: {
            type: 'Attribute',
            attribute: Atributo.INTELIGENCIA,
          },
        },
      ],
    },
    {
      name: 'Oportunismo',
      text: 'Uma vez por rodada, quando um inimigo adjacente sofre dano de um de seus aliados, você pode gastar 2 PM para fazer um ataque corpo a corpo contra este inimigo.',
      requirements: [[{ type: RequirementType.NIVEL, value: 6 }]],
    },
    {
      name: 'Rolamento Defensivo',
      text: 'Sempre que sofre dano, você pode gastar 2 PM para reduzir esse dano à metade. Após usar este poder, você fica caído.',
      requirements: [[{ type: RequirementType.PERICIA, name: Skill.REFLEXOS }]],
    },
    {
      name: 'Roubo de Mana',
      text: 'Quando você causa dano com um ataque furtivo, para cada 1d6 de dano de seu ataque furtivo, você recebe 1 PM temporário e a criatura perde 1 ponto de mana (se tiver). Você só pode usar este poder uma vez por cena contra uma mesma criatura.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Truque Mágico' },
          { type: RequirementType.NIVEL, value: 7 },
        ],
      ],
    },
    {
      name: 'Saqueador de Tumbas',
      text: 'Você recebe +5 em testes de Investigação para encontrar armadilhas e em testes de resistência contra elas. Além disso, gasta uma ação padrão para desabilitar mecanismos, em vez de 1d4 rodadas (veja a perícia Ladinagem).',
      requirements: [],
    },
    {
      name: 'Sombra',
      text: 'Você recebe +2 em Furtividade, não sofre penalidade em testes de Furtividade por se mover no seu deslocamento normal e reduz a penalidade por atacar e fazer outras ações chamativas para –10. Pré-requisito: treinado em Furtividade.',
      requirements: [
        [{ type: RequirementType.PERICIA, name: Skill.FURTIVIDADE }],
      ],
      sheetBonuses: [
        {
          source: {
            type: 'power',
            name: 'Sombra',
          },
          target: {
            type: 'Skill',
            name: Skill.FURTIVIDADE,
          },
          modifier: {
            type: 'Fixed',
            value: 2,
          },
        },
      ],
    },
    {
      name: 'Truque Mágico',
      text: 'Você aprende e pode lançar uma magia arcana de 1º círculo a sua escolha, pagando seu custo normal em PM. Seu atributo-chave para esta magia é Inteligência. Você pode escolher este poder quantas vezes quiser.',
      requirements: [
        [{ type: RequirementType.ATRIBUTO, name: 'Inteligência', value: 1 }],
      ],
      canRepeat: true,
      sheetActions: [
        {
          source: {
            type: 'power',
            name: 'Truque Mágico',
          },
          action: {
            type: 'learnSpell',
            availableSpells: allArcaneSpellsCircle1,
            pick: 1,
          },
        },
      ],
    },
    {
      name: 'Velocidade Ladina',
      text: 'Uma vez por rodada, você pode gastar 2 PM para realizar uma ação de movimento adicional em seu turno.',
      requirements: [
        [
          { type: RequirementType.ATRIBUTO, name: 'Destreza', value: 2 },
          { type: RequirementType.PERICIA, name: Skill.INICIATIVA },
        ],
      ],
    },
    {
      name: 'Veneno Persistente',
      text: 'Quando aplica uma dose de veneno a uma arma, este veneno dura por três ataques (em vez de apenas um).',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Veneno Potente' },
          { type: RequirementType.NIVEL, value: 8 },
        ],
      ],
    },
    {
      name: 'Veneno Potente',
      text: 'A CD para resistir aos venenos que você usa aumenta em +5.',
      requirements: [
        [{ type: RequirementType.PERICIA, name: Skill.OFICIO_ALQUIMIA }],
      ],
    },
  ],
  probDevoto: 0.3,
  faithProbability: {
    HYNINN: 1,
    NIMB: 1,
    SSZZAAS: 1,
    TENEBRA: 1,
    VALKARIA: 1,
  },
  attrPriority: [Atributo.DESTREZA],
};

export default LADINO;
