import {
  GeneralPower,
  GeneralPowerType,
  RequirementType,
} from '../../../../../interfaces/Poderes';
import Skill from '../../../../../interfaces/Skills';

/**
 * Poderes de Raça do suplemento Heróis de Arton
 */
const racePowers: Record<string, GeneralPower> = {
  AJUDANTE_NATO: {
    name: 'Ajudante Nato',
    description:
      'Quando você passa em um teste para ajudar, o bônus fornecido aumenta em +1. Além disso, se você estiver flanqueando um inimigo, o bônus que seus aliados recebem em testes de ataque contra esse inimigo por flanquear aumenta em +1 (para um total de +3).',
    type: GeneralPowerType.RACA,
    requirements: [[{ type: RequirementType.RACA, name: 'Qareen' }]],
  },
  AMO: {
    name: 'Amo',
    description:
      'Escolha um personagem (jogador ou NPC). Você adotou esse personagem como seu amo. Quando usa a habilidade Desejos a pedido do seu amo, o custo da magia diminui em –2 PM (em vez de apenas –1). Contudo, sempre que seu amo estiver presente em uma situação de perigo (como um combate) ou sob efeito de uma condição, você sofre –2 em testes de perícias. Se o amo morrer, essa penalidade permanece até o fim da aventura (quando então você pode escolher um novo amo).',
    type: GeneralPowerType.RACA,
    requirements: [[{ type: RequirementType.RACA, name: 'Qareen' }]],
  },
  ARMA_AMADA: {
    name: 'Arma Amada',
    description:
      'Escolha uma arma. Com essa arma, você recebe +2 em rolagens de dano e +5 em testes de manobra para resistir a desarmar e quebrar.',
    type: GeneralPowerType.RACA,
    requirements: [
      [{ type: RequirementType.RACA, name: 'Anão' }],
      [{ type: RequirementType.RACA, name: 'Hobgoblin' }],
    ],
  },
  ARMA_NATURAL_APRIMORADA: {
    name: 'Arma Natural Aprimorada',
    description:
      'Escolha uma de suas armas naturais fornecidas por raça. O dano dessa arma aumenta em um passo e sua margem de ameaça aumenta em +1. Você pode escolher este poder outras vezes para armas naturais diferentes.',
    type: GeneralPowerType.RACA,
    requirements: [
      [
        {
          type: RequirementType.TEXT,
          text: 'Arma natural fornecida por uma habilidade de raça',
        },
      ],
    ],
    canRepeat: true,
  },
  ARMA_NATURAL_HABIL: {
    name: 'Arma Natural Hábil',
    description:
      'Escolha uma arma natural fornecida por raça com a qual você possa gastar 1 PM para fazer um ataque corpo a corpo extra quando faz a ação agredir. Você não precisa gastar pontos de mana para isso. Você continua só podendo fazer isso uma vez por rodada.',
    type: GeneralPowerType.RACA,
    requirements: [
      [
        {
          type: RequirementType.TEXT,
          text: 'Arma natural fornecida por uma habilidade de raça',
        },
      ],
    ],
  },
  ARQUEARIA_ELFICA: {
    name: 'Arquearia Élfica',
    description:
      'Para você, todos os arcos são armas simples. Além disso, você recebe +2 nas rolagens de dano com arcos.',
    type: GeneralPowerType.RACA,
    requirements: [[{ type: RequirementType.RACA, name: 'Elfo' }]],
  },
  ARSENAL_DE_LISANDRA: {
    name: 'Arsenal de Lisandra',
    description:
      'Você aprende e pode lançar Armamento da Natureza. Caso aprenda novamente essa magia, seu custo diminui em –1 PM. Além disso, ao usar sua habilidade Armadura de Allihanna, você recebe um bônus na Defesa adicional de +1 por patamar (ou seja, Defesa +3 no patamar iniciante, +4 no veterano e assim por diante).',
    type: GeneralPowerType.RACA,
    requirements: [[{ type: RequirementType.RACA, name: 'Dahllan' }]],
  },
  ASAS_DE_ACO: {
    name: 'Asas de Aço',
    description:
      'Suas asas são sobrenaturalmente resistentes. Elas fornecem +2 na Defesa e podem ser usadas como armas naturais (dano 2d4, crítico x2, impacto). Uma vez por rodada, quando usa a ação agredir para atacar com outra arma, você pode gastar 1 PM para fazer um ataque corpo a corpo extra com as asas (exceto se as estiver usando para voar).',
    type: GeneralPowerType.RACA,
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Hárpia' },
        { type: RequirementType.TEXT, text: 'Possuir asas' },
      ],
      [
        { type: RequirementType.RACA, name: 'Kallyanach' },
        { type: RequirementType.TEXT, text: 'Possuir asas' },
      ],
      [
        { type: RequirementType.RACA, name: 'Pteros' },
        { type: RequirementType.TEXT, text: 'Possuir asas' },
      ],
      [
        { type: RequirementType.RACA, name: 'Suraggel' },
        { type: RequirementType.TEXT, text: 'Possuir asas' },
      ],
    ],
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Asas de Aço' },
        target: { type: 'Defense' },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
  ASAS_EXTRAPLANARES: {
    name: 'Asas Extraplanares',
    description:
      'Você desenvolve um par de asas adequado à sua herança planar — normalmente, emplumadas se você for um aggelus ou coriáceas se você for um sulfure, embora isso possa mudar. Você pode gastar 1 PM por rodada para voar com deslocamento de 12m. Enquanto estiver voando dessa forma, você fica vulnerável.',
    type: GeneralPowerType.RACA,
    requirements: [[{ type: RequirementType.RACA, name: 'Suraggel' }]],
  },
  ATRACAO_PELA_POLVORA: {
    name: 'Atração pela Pólvora',
    description:
      'Entre seu povo, existem aqueles que amam a pólvora. Você é um deles! Você recebe +1 em testes de ataque e +2 em rolagens de dano com armas de fogo. Com bombas e itens similares baseados em pólvora, você causa +1 de dano por dado de dano.',
    type: GeneralPowerType.RACA,
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Anão' },
        { type: RequirementType.PERICIA, name: Skill.OFICIO },
      ],
      [
        { type: RequirementType.RACA, name: 'Goblin' },
        { type: RequirementType.PERICIA, name: Skill.OFICIO },
      ],
      [
        { type: RequirementType.RACA, name: 'Hobgoblin' },
        { type: RequirementType.PERICIA, name: Skill.OFICIO },
      ],
      [
        { type: RequirementType.RACA, name: 'Kliren' },
        { type: RequirementType.PERICIA, name: Skill.OFICIO },
      ],
    ],
  },
  CAMUFLAGEM_MIMETICA: {
    name: 'Camuflagem Mimética',
    description:
      'Você pode mudar sua cor e textura a ponto de ficar quase invisível. Você pode gastar uma ação de movimento e 2 PM para receber um bônus em Furtividade até o fim da cena. O bônus varia conforme o que você estiver vestindo: +10 se estiver sem armadura e com no máximo um item vestido, +5 se estiver de armadura leve e/ou com até dois itens vestidos, +2 se estiver de armadura pesada e/ou com mais de dois itens vestidos.',
    type: GeneralPowerType.RACA,
    requirements: [
      [{ type: RequirementType.RACA, name: 'Sereia/Tritão' }],
      [{ type: RequirementType.RACA, name: 'Trog' }],
    ],
  },
  CANTO_DA_SEREIA: {
    name: 'Canto da Sereia',
    description:
      'Sua voz é melodiosa e encantadora, capaz de fascinar até as pessoas mais cruéis. Você recebe +2 em Atuação. Além disso, o alcance das magias adquiridas por sua Canção dos Mares aumenta em um passo (de curto para médio e de médio para longo) e a CD para resistir a elas aumenta em +2.',
    type: GeneralPowerType.RACA,
    requirements: [[{ type: RequirementType.RACA, name: 'Sereia/Tritão' }]],
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Canto da Sereia' },
        target: { type: 'Skill', name: Skill.ATUACAO },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
  CASCOS_PODEROSOS: {
    name: 'Cascos Poderosos',
    description:
      'Quando faz um ataque desarmado, você pode gastar 1 PM para desferir esse ataque usando seus cascos. Se fizer isso, causa +1 dado de dano do mesmo tipo, mas não pode escolher causar dano não letal.',
    type: GeneralPowerType.RACA,
    requirements: [
      [{ type: RequirementType.RACA, name: 'Centauro' }],
      [{ type: RequirementType.RACA, name: 'Minotauro' }],
      [{ type: RequirementType.RACA, name: 'Sátiro' }],
    ],
  },
  CHASSI_GRACIOSO: {
    name: 'Chassi Gracioso',
    description:
      'Seu corpo artificial foi feito com materiais leves e belos. Você recebe +2 em Diplomacia e não possui a penalidade de armadura da habilidade Chassi.',
    type: GeneralPowerType.RACA,
    requirements: [[{ type: RequirementType.RACA, name: 'Golem' }]],
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Chassi Gracioso' },
        target: { type: 'Skill', name: Skill.DIPLOMACIA },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
  CITADINO: {
    name: 'Citadino',
    description:
      'Você foi criado em uma metrópole, onde se acostumou a lidar com várias pessoas — mas também às facilidades da civilização. Você recebe +2 em testes de perícias baseadas em Carisma (exceto Adestramento).',
    type: GeneralPowerType.RACA,
    requirements: [
      [{ type: RequirementType.RACA, name: 'Humano' }],
      [{ type: RequirementType.RACA, name: 'Hynne' }],
      [{ type: RequirementType.RACA, name: 'Kliren' }],
      [{ type: RequirementType.RACA, name: 'Meio-Elfo' }],
    ],
  },
  COMANDAR_APRIMORADO: {
    name: 'Comandar Aprimorado',
    description:
      'Quando usa Comandar, você pode gastar +2 PM para aumentar o bônus fornecido pelo poder em +1.',
    type: GeneralPowerType.RACA,
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Humano' },
        { type: RequirementType.ATRIBUTO, name: 'Carisma', value: 2 },
        { type: RequirementType.PODER, name: 'Comandar' },
      ],
    ],
  },
  CONFORTO_DO_ACO: {
    name: 'Conforto do Aço',
    description:
      'Seu povo veste metal como se fosse algodão. Você não sofre penalidade de armadura por usar armaduras (mas ainda sofre por escudos). Além disso, se estiver usando armadura pesada, recebe +2 na Defesa.',
    type: GeneralPowerType.RACA,
    requirements: [[{ type: RequirementType.RACA, name: 'Anão' }]],
  },
  CONSTRICAO_ATROZ: {
    name: 'Constrição Atroz',
    description:
      'Você pode gastar uma ação de movimento e 1 PM para expelir gavinhas de seu corpo. No início de cada um de seus turnos, qualquer inimigo em alcance curto deve fazer um teste de Reflexos (CD Sab). Se falhar, fica enredado. Um inimigo enredado pode escapar gastando uma ação padrão e passando em um teste de Acrobacia ou Atletismo (CD Sab), ou afastando-se 9m de você. Este poder tem duração sustentada.',
    type: GeneralPowerType.RACA,
    requirements: [[{ type: RequirementType.RACA, name: 'Dahllan' }]],
  },
  CORACAO_DE_PEDRA: {
    name: 'Coração de Pedra',
    description: 'Você recebe +1 PV por nível e imunidade a petrificação.',
    type: GeneralPowerType.RACA,
    requirements: [
      [{ type: RequirementType.RACA, name: 'Anão' }],
      [{ type: RequirementType.RACA, name: 'Medusa' }],
    ],
  },
  CORO_SIBILANTE: {
    name: 'Coro Sibilante',
    description:
      'Você pode gastar 1 PM para fazer suas serpentes ecoarem suas palavras. Até o fim da cena, você recebe +2 em testes de perícias originalmente baseadas em Carisma (exceto testes de ataque).',
    type: GeneralPowerType.RACA,
    requirements: [[{ type: RequirementType.RACA, name: 'Medusa' }]],
  },
  CRESCIMENTO_FEERICO: {
    name: 'Crescimento Feérico',
    description:
      'Você pode gastar uma ação de movimento e 1 PM para aumentar uma categoria de tamanho e receber +1 em Força (máximo Grande). A partir do patamar veterano, você também pode gastar 3 PM para aumentar duas categorias de tamanho; nesse caso, recebe +2 em Força (máximo Enorme). Seu equipamento muda com você. A transformação dura pelo tempo que você quiser, mas você reverte ao tamanho normal se ficar inconsciente ou morrer. Voltar ao seu tamanho original é uma ação livre.',
    type: GeneralPowerType.RACA,
    requirements: [
      [{ type: RequirementType.RACA, name: 'Duende' }],
      [{ type: RequirementType.RACA, name: 'Sílfide' }],
    ],
  },
  CRIANCA_DA_LUZ: {
    name: 'Criança da Luz',
    description:
      'O sangue extraplanar é mais forte em você. Seu bônus racial em Diplomacia e Intuição aumenta para +5 e você recebe redução de eletricidade e frio 5.',
    type: GeneralPowerType.RACA,
    requirements: [[{ type: RequirementType.RACA, name: 'Aggelus' }]],
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Criança da Luz' },
        target: { type: 'DamageReduction', damageType: 'Eletricidade' },
        modifier: { type: 'Fixed', value: 5 },
      },
      {
        source: { type: 'power', name: 'Criança da Luz' },
        target: { type: 'DamageReduction', damageType: 'Frio' },
        modifier: { type: 'Fixed', value: 5 },
      },
    ],
  },
  CRIANCA_DAS_TREVAS: {
    name: 'Criança das Trevas',
    description:
      'O sangue extraplanar é mais forte em você. Seu bônus racial em Enganação e Furtividade aumenta para +5 e você recebe redução de fogo e trevas 5.',
    type: GeneralPowerType.RACA,
    requirements: [[{ type: RequirementType.RACA, name: 'Sulfure' }]],
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Criança das Trevas' },
        target: { type: 'DamageReduction', damageType: 'Fogo' },
        modifier: { type: 'Fixed', value: 5 },
      },
      {
        source: { type: 'power', name: 'Criança das Trevas' },
        target: { type: 'DamageReduction', damageType: 'Trevas' },
        modifier: { type: 'Fixed', value: 5 },
      },
    ],
  },
  DEVOCAO_ILUMINADA: {
    name: 'Devoção Iluminada',
    description:
      'Você recebe +2 em Vontade, perde a sensibilidade a luz causada por sua raça e não pode mais ser ofuscado.',
    type: GeneralPowerType.RACA,
    requirements: [
      [
        {
          type: RequirementType.TEXT,
          text: 'Sensibilidade a luz como habilidade racial',
        },
        {
          type: RequirementType.TEXT,
          text: 'Devoto de uma divindade que canalize energia positiva',
        },
      ],
    ],
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Devoção Iluminada' },
        target: { type: 'Skill', name: Skill.VONTADE },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
  DUAS_CABECAS: {
    name: 'Duas Cabeças',
    description:
      'Você nasceu com duas cabeças, ou então uma segunda cabeça brotou de seu corpo em determinado momento. Elas podem ser iguais ou não (por exemplo, uma pode ser menor ou atrofiada) e podem ter personalidades compatíveis ou não — fique à vontade para interpretar diálogos entre elas. Sempre que fizer um teste de Vontade, você pode gastar 1 PM para rolar dois dados e usar o melhor resultado. Além disso, se você tem uma arma natural de mordida, recebe uma arma natural extra do mesmo tipo e com as mesmas estatísticas (se você pode fazer um ataque extra com sua mordida original gastando 1 PM, agora poderá fazer um ataque com cada mordida gastando 2 PM). Se um efeito modificar uma de suas mordidas, escolha qual é afetada.',
    type: GeneralPowerType.RACA,
    requirements: [
      [{ type: RequirementType.RACA, name: 'Gnoll' }],
      [{ type: RequirementType.RACA, name: 'Kaijin' }],
      [{ type: RequirementType.RACA, name: 'Lefou' }],
      [{ type: RequirementType.RACA, name: 'Orc' }],
      [{ type: RequirementType.RACA, name: 'Trog' }],
    ],
  },
  DUPLA_CONJURACAO: {
    name: 'Dupla Conjuração',
    description:
      'Uma vez por rodada, quando lança uma magia usando uma ação padrão, você pode gastar 5 PM para lançar uma magia adicional (mas somente magias cuja execução seja ação de movimento ou padrão). Você precisa gesticular com duas mãos livres, em vez de uma, para isso.',
    type: GeneralPowerType.RACA,
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Gnoll' },
        { type: RequirementType.ATRIBUTO, name: 'Destreza', value: 2 },
        { type: RequirementType.TEXT, text: 'Lançar magias' },
        { type: RequirementType.PODER, name: 'Dupla Inteligência' },
      ],
      [
        { type: RequirementType.RACA, name: 'Kaijin' },
        { type: RequirementType.ATRIBUTO, name: 'Destreza', value: 2 },
        { type: RequirementType.TEXT, text: 'Lançar magias' },
        { type: RequirementType.PODER, name: 'Dupla Inteligência' },
      ],
      [
        { type: RequirementType.RACA, name: 'Lefou' },
        { type: RequirementType.ATRIBUTO, name: 'Destreza', value: 2 },
        { type: RequirementType.TEXT, text: 'Lançar magias' },
        { type: RequirementType.PODER, name: 'Dupla Inteligência' },
      ],
      [
        { type: RequirementType.RACA, name: 'Orc' },
        { type: RequirementType.ATRIBUTO, name: 'Destreza', value: 2 },
        { type: RequirementType.TEXT, text: 'Lançar magias' },
        { type: RequirementType.PODER, name: 'Dupla Inteligência' },
      ],
      [
        { type: RequirementType.RACA, name: 'Trog' },
        { type: RequirementType.ATRIBUTO, name: 'Destreza', value: 2 },
        { type: RequirementType.TEXT, text: 'Lançar magias' },
        { type: RequirementType.PODER, name: 'Dupla Inteligência' },
      ],
    ],
  },
  DUPLA_INTELIGENCIA: {
    name: 'Dupla Inteligência',
    description:
      'Quando faz um teste de Inteligência ou de perícias baseadas nesse atributo, você pode gastar 2 PM para rolar dois dados e usar o melhor resultado.',
    type: GeneralPowerType.RACA,
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Gnoll' },
        { type: RequirementType.ATRIBUTO, name: 'Inteligência', value: 2 },
        { type: RequirementType.PODER, name: 'Duas Cabeças' },
      ],
      [
        { type: RequirementType.RACA, name: 'Kaijin' },
        { type: RequirementType.ATRIBUTO, name: 'Inteligência', value: 2 },
        { type: RequirementType.PODER, name: 'Duas Cabeças' },
      ],
      [
        { type: RequirementType.RACA, name: 'Lefou' },
        { type: RequirementType.ATRIBUTO, name: 'Inteligência', value: 2 },
        { type: RequirementType.PODER, name: 'Duas Cabeças' },
      ],
      [
        { type: RequirementType.RACA, name: 'Orc' },
        { type: RequirementType.ATRIBUTO, name: 'Inteligência', value: 2 },
        { type: RequirementType.PODER, name: 'Duas Cabeças' },
      ],
      [
        { type: RequirementType.RACA, name: 'Trog' },
        { type: RequirementType.ATRIBUTO, name: 'Inteligência', value: 2 },
        { type: RequirementType.PODER, name: 'Duas Cabeças' },
      ],
    ],
  },
  DUPLA_PRONTIDAO: {
    name: 'Dupla Prontidão',
    description:
      'Com campo de visão superior e órgãos sensoriais duplicados, você recebe +2 em Percepção, nunca fica desprevenido e não pode ser flanqueado.',
    type: GeneralPowerType.RACA,
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Gnoll' },
        { type: RequirementType.ATRIBUTO, name: 'Sabedoria', value: 2 },
        { type: RequirementType.PODER, name: 'Duas Cabeças' },
      ],
      [
        { type: RequirementType.RACA, name: 'Kaijin' },
        { type: RequirementType.ATRIBUTO, name: 'Sabedoria', value: 2 },
        { type: RequirementType.PODER, name: 'Duas Cabeças' },
      ],
      [
        { type: RequirementType.RACA, name: 'Lefou' },
        { type: RequirementType.ATRIBUTO, name: 'Sabedoria', value: 2 },
        { type: RequirementType.PODER, name: 'Duas Cabeças' },
      ],
      [
        { type: RequirementType.RACA, name: 'Orc' },
        { type: RequirementType.ATRIBUTO, name: 'Sabedoria', value: 2 },
        { type: RequirementType.PODER, name: 'Duas Cabeças' },
      ],
      [
        { type: RequirementType.RACA, name: 'Trog' },
        { type: RequirementType.ATRIBUTO, name: 'Sabedoria', value: 2 },
        { type: RequirementType.PODER, name: 'Duas Cabeças' },
      ],
    ],
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Dupla Prontidão' },
        target: { type: 'Skill', name: Skill.PERCEPCAO },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
  DURO_COMO_ACO: {
    name: 'Duro Como Aço',
    description:
      'Se estiver usando armadura pesada, você pode somar sua Constituição na Defesa. Se fizer isso, não pode somar sua Destreza, mesmo que outras habilidades ou efeitos permitam isso.',
    type: GeneralPowerType.RACA,
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Anão' },
        { type: RequirementType.NIVEL, value: 11 },
      ],
    ],
  },
  ENTRE_AS_PERNAS: {
    name: 'Entre as Pernas',
    description:
      'Você pode ocupar o mesmo espaço de criaturas duas categorias de tamanho maiores que você (em vez de três). Enquanto estiver ocupando o mesmo espaço que uma criatura maior que você, ataques contra você têm 25% de chance de acertar a criatura maior (inclusive ataques feitos pela própria criatura!).',
    type: GeneralPowerType.RACA,
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Goblin' },
        { type: RequirementType.PERICIA, name: Skill.ACROBACIA },
      ],
      [
        { type: RequirementType.RACA, name: 'Hynne' },
        { type: RequirementType.PERICIA, name: Skill.ACROBACIA },
      ],
      [
        { type: RequirementType.RACA, name: 'Kobold' },
        { type: RequirementType.PERICIA, name: Skill.ACROBACIA },
      ],
    ],
  },
  ESCAPADA_CRIATIVA: {
    name: 'Escapada Criativa',
    description:
      'Quando faz um teste de resistência, você pode gastar 2 PM para somar sua Inteligência ao resultado do teste.',
    type: GeneralPowerType.RACA,
    requirements: [
      [{ type: RequirementType.RACA, name: 'Goblin' }],
      [{ type: RequirementType.RACA, name: 'Meio-Elfo' }],
    ],
  },
  ESGRIMA_ELFICA: {
    name: 'Esgrima Élfica',
    description:
      'Sua raça mescla arte e guerra como nenhuma outra. Você recebe +1 em testes de ataque com espadas e, para você, todas as espadas são consideradas armas ágeis.',
    type: GeneralPowerType.RACA,
    requirements: [[{ type: RequirementType.RACA, name: 'Elfo' }]],
  },
  ESTILO_CLASSICO: {
    name: 'Estilo Clássico',
    description:
      'Enquanto estiver empunhando uma espada e um escudo, você recebe +2 nas rolagens de dano com sua arma e +2 na Defesa.',
    type: GeneralPowerType.RACA,
    requirements: [[{ type: RequirementType.RACA, name: 'Humano' }]],
  },
  ESTIRPE_ARCANA: {
    name: 'Estirpe Arcana',
    description:
      'Você recebe +2 pontos de mana por patamar e +2 em Misticismo.',
    type: GeneralPowerType.RACA,
    requirements: [
      [{ type: RequirementType.RACA, name: 'Elfo' }],
      [{ type: RequirementType.RACA, name: 'Eiradaan' }],
      [{ type: RequirementType.RACA, name: 'Nagah' }],
    ],
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Estirpe Arcana' },
        target: { type: 'Skill', name: Skill.MISTICISMO },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
  EXALTACAO_DO_REJEITADO: {
    name: 'Exaltação do Rejeitado',
    description:
      'Muitos acreditam que você não merece sua divindade, mas ela prova o contrário. Quando lança uma magia divina, você recebe um bônus em testes de resistência igual ao círculo da magia lançada, até o início do seu próximo turno.',
    type: GeneralPowerType.RACA,
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Kaijin' },
        { type: RequirementType.TEXT, text: 'Lançar magias divinas' },
      ],
      [
        { type: RequirementType.RACA, name: 'Lefou' },
        { type: RequirementType.TEXT, text: 'Lançar magias divinas' },
      ],
    ],
  },
  EXPLOSAO_OSSEA: {
    name: 'Explosão Óssea',
    description:
      'Sempre que você sofre dano, pode gastar 2 PM para fazer alguns de seus ossos se soltarem, absorvendo o choque. Isso reduz o dano sofrido à metade, mas o deixa fraco (já que você perde partes de seu esqueleto). Essa condição é cumulativa — se usar este poder duas vezes, você fica debilitado e, se usá-lo três vezes, fica inconsciente. Essas condições duram até você recolher seus ossos (uma ação completa) ou até o fim do dia.',
    type: GeneralPowerType.RACA,
    requirements: [[{ type: RequirementType.RACA, name: 'Osteon' }]],
  },
  FALATORIO_CRIATIVO: {
    name: 'Falatório Criativo',
    description:
      'Escolha uma perícia originalmente baseada em Carisma. Você pode usar Inteligência como atributo-chave dessa perícia.',
    type: GeneralPowerType.RACA,
    requirements: [[{ type: RequirementType.RACA, name: 'Goblin' }]],
  },
  FAMILIAR_DE_ELEMENTO: {
    name: 'Familiar de Elemento',
    description:
      'Seu familiar se transforma em uma criatura elemental (por exemplo, se você é um qareen do fogo e seu familiar é um corvo, ele passa a ser um corvo feito de chamas). Seu familiar se torna imune a dano do seu elemento e, sempre que você lança uma magia que gere um efeito desse elemento, recebe +1 PM para gastar em aprimoramentos. Ele continua fornecendo seus benefícios originais.',
    type: GeneralPowerType.RACA,
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Qareen' },
        { type: RequirementType.TEXT, text: 'Possuir um familiar' },
      ],
    ],
  },
  FAMILIAR_DE_LUZ: {
    name: 'Familiar de Luz',
    description:
      'Seu familiar se transforma em uma criatura celestial. Além dos benefícios normais, seu familiar se torna imune a dano de luz e, sempre que lança uma magia que gere um efeito de luz, você recebe +1 PM para gastar em aprimoramentos.',
    type: GeneralPowerType.RACA,
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Aggelus' },
        { type: RequirementType.TEXT, text: 'Possuir um familiar' },
      ],
      [
        { type: RequirementType.RACA, name: 'Qareen' },
        { type: RequirementType.TEXT, text: 'Possuir um familiar' },
      ],
    ],
  },
  FAMILIAR_DE_TREVAS: {
    name: 'Familiar de Trevas',
    description:
      'Seu familiar se transforma em uma criatura abissal. Além dos benefícios normais, seu familiar se torna imune a dano de trevas e, sempre que lança uma magia que gere um efeito de trevas, você recebe +1 PM para gastar em aprimoramentos.',
    type: GeneralPowerType.RACA,
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Sulfure' },
        { type: RequirementType.TEXT, text: 'Possuir um familiar' },
      ],
      [
        { type: RequirementType.RACA, name: 'Qareen' },
        { type: RequirementType.TEXT, text: 'Possuir um familiar' },
      ],
    ],
  },
  FARO_APRIMORADO: {
    name: 'Faro Aprimorado',
    description:
      'Seu olfato é ainda mais apurado que o padrão de sua raça. Você recebe +2 em Intuição, Investigação e Percepção, +5 em testes de Sobrevivência para rastrear e percebe automaticamente a presença de criaturas em alcance curto (mas não sua localização). De acordo com o mestre, criaturas sem cheiro (como alguns construtos ou seres incorpóreos) podem ser indetectáveis ao seu faro.',
    type: GeneralPowerType.RACA,
    requirements: [
      [{ type: RequirementType.RACA, name: 'Minotauro' }],
      [{ type: RequirementType.RACA, name: 'Moreau' }],
    ],
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Faro Aprimorado' },
        target: { type: 'Skill', name: Skill.INTUICAO },
        modifier: { type: 'Fixed', value: 2 },
      },
      {
        source: { type: 'power', name: 'Faro Aprimorado' },
        target: { type: 'Skill', name: Skill.INVESTIGACAO },
        modifier: { type: 'Fixed', value: 2 },
      },
      {
        source: { type: 'power', name: 'Faro Aprimorado' },
        target: { type: 'Skill', name: Skill.PERCEPCAO },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
  FRAGRANCIA_DE_ROSAS: {
    name: 'Fragrância de Rosas',
    description:
      'Você cheira bem. Você recebe +2 em Diplomacia e pode gastar uma ação padrão e 2 PM para forçar todas as criaturas em alcance curto a fazerem um teste de Fortitude (CD Car). Uma criatura que falhe fica pasma por 1 rodada (apenas uma vez por cena) como um efeito metabólico.',
    type: GeneralPowerType.RACA,
    requirements: [
      [{ type: RequirementType.RACA, name: 'Dahllan' }],
      [{ type: RequirementType.RACA, name: 'Duende' }],
    ],
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Fragrância de Rosas' },
        target: { type: 'Skill', name: Skill.DIPLOMACIA },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
  FURIA_ATERRORIZANTE: {
    name: 'Fúria Aterrorizante',
    description:
      'Quando você entra em fúria, inimigos em alcance curto ficam abalados até o fim da cena (Von CD Con reduz para 1 rodada).',
    type: GeneralPowerType.RACA,
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Galokk' },
        { type: RequirementType.HABILIDADE, name: 'Fúria' },
      ],
      [
        { type: RequirementType.RACA, name: 'Ogro' },
        { type: RequirementType.HABILIDADE, name: 'Fúria' },
      ],
    ],
  },
  FURIA_NATURAL: {
    name: 'Fúria Natural',
    description:
      'Quando você é dominado por seus instintos selvagens, prefere usar suas armas naturais àquelas criadas pela civilização. Quando você está em fúria, o dano de suas armas naturais aumenta em um passo e a margem de ameaça delas aumenta em +1.',
    type: GeneralPowerType.RACA,
    requirements: [
      [
        { type: RequirementType.HABILIDADE, name: 'Fúria' },
        {
          type: RequirementType.TEXT,
          text: 'Arma natural fornecida por uma habilidade de raça',
        },
      ],
    ],
  },
  GAVINHAS: {
    name: 'Gavinhas',
    description:
      'Quando você usa Armadura de Allihanna, duas gavinhas crescem de suas costas. Cada gavinha é uma arma natural (dano 1d4 cada, crítico x2, impacto) com 3m de alcance e versátil, fornecendo +2 em testes para desarmar e derrubar. Uma vez por rodada, quando usa a ação agredir para atacar com uma arma, você pode gastar 1 PM por gavinha para fazer um ataque corpo a corpo extra com ela (desde que ela já não tenha sido usada na rodada).',
    type: GeneralPowerType.RACA,
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Dahllan' },
        { type: RequirementType.NIVEL, value: 5 },
      ],
    ],
  },
  GINETE_DE_JAVALI: {
    name: 'Ginete de Javali',
    description:
      'Você recebe um javali doherita iniciante, com o qual possui +2 em Adestramento e Cavalgar. Se perder seu javali, você pode obter outro com uma semana de busca e T$ 100.',
    type: GeneralPowerType.RACA,
    requirements: [[{ type: RequirementType.RACA, name: 'Anão' }]],
  },
  GLAMOUR: {
    name: 'Glamour',
    description:
      'O mais icônico dos poderes feéricos, glamour é uma ilusão tão poderosa que gera efeitos reais. Escolha três magias de 1º círculo, arcanas ou divinas. Você pode lançar essas magias (atributo-chave Carisma), com as seguintes mudanças: Elas contam como magias de ilusão além de seus tipos normais; Sempre que você lança uma magia de glamour que não pede testes de resistência, precisa rolar 1d6 — se rolar 1, a magia não funciona (mas você gasta os PM mesmo assim) e você não pode mais lançar magias de glamour até o fim da cena; Sempre que você lança uma magia de glamour que permite testes de resistência de Fortitude ou Reflexos, os alvos podem substituir os testes originais por Vontade — além disso, se um alvo passar no teste de resistência, você não pode mais lançar magias de glamour até o fim da cena. Se você aprender uma magia de glamour novamente, pode lançá-la como uma magia normal ou de glamour — nesse caso, ela sofre as mudanças acima, mas seu custo diminui em –1 PM.',
    type: GeneralPowerType.RACA,
    requirements: [
      [{ type: RequirementType.RACA, name: 'Duende' }],
      [{ type: RequirementType.RACA, name: 'Eiradaan' }],
      [{ type: RequirementType.RACA, name: 'Sílfide' }],
    ],
  },
  GLAMOUR_MAIOR: {
    name: 'Glamour Maior',
    description:
      'Você aprende mais três magias, de 1º ou 2º círculo, arcanas ou divinas, que pode lançar como magias de glamour (veja o poder anterior).',
    type: GeneralPowerType.RACA,
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Duende' },
        { type: RequirementType.PODER, name: 'Glamour' },
        { type: RequirementType.NIVEL, value: 5 },
      ],
      [
        { type: RequirementType.RACA, name: 'Eiradaan' },
        { type: RequirementType.PODER, name: 'Glamour' },
        { type: RequirementType.NIVEL, value: 5 },
      ],
      [
        { type: RequirementType.RACA, name: 'Sílfide' },
        { type: RequirementType.PODER, name: 'Glamour' },
        { type: RequirementType.NIVEL, value: 5 },
      ],
    ],
  },
  GOLPE_DOS_TITAS: {
    name: 'Golpe dos Titãs',
    description:
      'Quando você usa Força dos Titãs, resultados um ponto abaixo do máximo (por exemplo, 9 ao rolar 1d10) também permitem rolar o dado extra.',
    type: GeneralPowerType.RACA,
    requirements: [[{ type: RequirementType.RACA, name: 'Galokk' }]],
  },
  GOLPE_NO_JOELHO: {
    name: 'Golpe no Joelho',
    description:
      'Se você fizer um ataque corpo a corpo contra uma criatura maior que você enquanto ocupa o mesmo espaço que ela, o dano desse ataque aumenta em um passo e você recebe +2 na margem de ameaça.',
    type: GeneralPowerType.RACA,
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Goblin' },
        { type: RequirementType.PODER, name: 'Entre as Pernas' },
      ],
      [
        { type: RequirementType.RACA, name: 'Hynne' },
        { type: RequirementType.PODER, name: 'Entre as Pernas' },
      ],
      [
        { type: RequirementType.RACA, name: 'Kobold' },
        { type: RequirementType.PODER, name: 'Entre as Pernas' },
      ],
    ],
  },
  GRANDE_MARCA_DE_WYNNA: {
    name: 'Grande Marca de Wynna',
    description:
      'Sua tatuagem mística é especialmente grande e chamativa, e contém ainda mais poder mágico que o normal. Você pode lançar uma magia de 1º círculo a sua escolha (atributo-chave Carisma), além daquela fornecida pela habilidade Tatuagem Mística e pode usar os aprimoramentos de ambas como se tivesse acesso aos mesmos círculos de magia que um feiticeiro do seu nível.',
    type: GeneralPowerType.RACA,
    requirements: [[{ type: RequirementType.RACA, name: 'Qareen' }]],
  },
  HERANCA_ERUDITA: {
    name: 'Herança Erudita',
    description:
      'Seu sangue não carrega apenas a fagulha mágica que lhe dá poder, mas também conhecimento ancestral. Escolha uma perícia originalmente baseada em Inteligência. Você soma seu Carisma nessa perícia.',
    type: GeneralPowerType.RACA,
    requirements: [
      [{ type: RequirementType.RACA, name: 'Eiradaan' }],
      [{ type: RequirementType.RACA, name: 'Elfo' }],
      [{ type: RequirementType.RACA, name: 'Kallyanach' }],
    ],
  },
  LOGICA_GNOMICA: {
    name: 'Lógica Gnômica',
    description:
      'Uma vez por cena, quando faz um teste de perícia (exceto testes de ataque), você pode gastar 3 PM para substituir o atributo-chave dessa perícia por Inteligência. Por exemplo, ao fazer um teste de Atletismo você pode gastar 3 PM para somar sua Inteligência em vez de sua Força.',
    type: GeneralPowerType.RACA,
    requirements: [[{ type: RequirementType.RACA, name: 'Kliren' }]],
  },
  MAGIA_OFIDICA: {
    name: 'Magia Ofídica',
    description:
      'Para cada círculo de magia que você é capaz de lançar, a CD para resistir a seus efeitos de veneno aumenta em +1 e esses venenos causam +1 ponto de perda de vida por dado.',
    type: GeneralPowerType.RACA,
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Medusa' },
        { type: RequirementType.TEXT, text: 'Lançar magias' },
      ],
      [
        { type: RequirementType.RACA, name: 'Moreau da Serpente' },
        { type: RequirementType.TEXT, text: 'Lançar magias' },
      ],
      [
        { type: RequirementType.RACA, name: 'Nagah' },
        { type: RequirementType.TEXT, text: 'Lançar magias' },
      ],
    ],
  },
  MANIPULACAO_ESQUELETICA: {
    name: 'Manipulação Esquelética',
    description:
      'Você pode gastar uma ação de movimento e 1 PM para estender seus braços e aumentar seu alcance natural em +1,5m, para estender suas pernas e aumentar seu deslocamento terrestre em +3m ou para se transformar numa pilha de ossos que fornece +5 em Furtividade (nessa forma você só pode fazer reações ou cancelar esse efeito). A manipulação dura até o fim da cena, até você usar outra manipulação ou até você cancelar o efeito (uma ação livre).',
    type: GeneralPowerType.RACA,
    requirements: [[{ type: RequirementType.RACA, name: 'Osteon' }]],
  },
  MARRADA_PODEROSA: {
    name: 'Marrada Poderosa',
    description:
      'Quando você faz uma investida com seus chifres e acerta o ataque, o dano deles aumenta em um passo e você pode gastar 1 PM para fazer um ataque corpo a corpo desarmado ou com uma arma que esteja empunhando. Esse ataque também recebe o bônus de +2 por investida.',
    type: GeneralPowerType.RACA,
    requirements: [
      [{ type: RequirementType.RACA, name: 'Minotauro' }],
      [{ type: RequirementType.RACA, name: 'Sátiro' }],
    ],
  },
  MEDITACAO_MISTICA: {
    name: 'Meditação Mística',
    description:
      'Uma vez por dia, você pode entrar em um transe místico por 1d4 minutos. Enquanto medita, você fica fascinado. Você pode interromper sua meditação a qualquer momento, mas, se concluí-la, recupera um número de pontos de mana igual ao seu nível.',
    type: GeneralPowerType.RACA,
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Eiradaan' },
        { type: RequirementType.ATRIBUTO, name: 'Sabedoria', value: 1 },
        { type: RequirementType.PERICIA, name: 'Vontade' },
      ],
      [
        { type: RequirementType.RACA, name: 'Elfo' },
        { type: RequirementType.ATRIBUTO, name: 'Sabedoria', value: 1 },
        { type: RequirementType.PERICIA, name: 'Vontade' },
      ],
    ],
  },
  OLHAR_PETRIFICANTE: {
    name: 'Olhar Petrificante',
    description:
      'Você pode gastar uma ação padrão e 3 PM para forçar uma criatura em alcance curto a fazer um teste de Fortitude (CD Car). Se a criatura falhar, fica lenta por 1d4 rodadas. Se já estiver lenta por este efeito, em vez disso é petrificada permanentemente — ela e seu equipamento se transformam em uma estátua inerte e sem consciência, com RD 8 e os mesmos PV que ela tinha em vida. Se a estátua for quebrada, a criatura morrerá.',
    type: GeneralPowerType.RACA,
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Medusa' },
        { type: RequirementType.NIVEL, value: 9 },
      ],
    ],
  },
  OSSOS_AFIADOS: {
    name: 'Ossos Afiados',
    description:
      'Você recebe +2 em Intimidação e +2 em rolagens de dano com armas naturais e ataques desarmados.',
    type: GeneralPowerType.RACA,
    requirements: [[{ type: RequirementType.RACA, name: 'Osteon' }]],
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Ossos Afiados' },
        target: { type: 'Skill', name: Skill.INTIMIDACAO },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
  PIRATA_OCEANICO: {
    name: 'Pirata Oceânico',
    description:
      'Sua habilidade Mestre do Tridente passa a afetar também arpões. Além disso, você recebe +2 em testes de ataque com todas as armas afetadas por essa habilidade e as considera armas ágeis.',
    type: GeneralPowerType.RACA,
    requirements: [[{ type: RequirementType.RACA, name: 'Sereia/Tritão' }]],
  },
  PROGRAMACAO_DE_COMBATE: {
    name: 'Programação de Combate',
    description:
      'Você pode gastar uma ação de movimento e 3 PM para ativar um modo de análise de inimigos, com duração sustentada. Enquanto estiver com esse modo ativo, quando faz um ataque você rola dois dados e usa o melhor resultado.',
    type: GeneralPowerType.RACA,
    requirements: [[{ type: RequirementType.RACA, name: 'Golem' }]],
  },
  PROGRAMACAO_HOLISTICA: {
    name: 'Programação Holística',
    description:
      'Você pode gastar uma ação completa e 2 PM para se tornar treinado em uma perícia a sua escolha até o fim do dia. Sempre que usa este poder, role 1d4. Em um resultado 1, você sobrecarrega seu cérebro artificial — até o fim do dia, você fica frustrado e não pode mais usar este poder.',
    type: GeneralPowerType.RACA,
    requirements: [[{ type: RequirementType.RACA, name: 'Golem' }]],
  },
  PROTETOR_ETERNO: {
    name: 'Protetor Eterno',
    description:
      'Enquanto tiver pelo menos um aliado adjacente, você continua consciente mesmo se estiver com 0 ou menos pontos de vida. Você ainda morre caso seus PV cheguem no limite negativo, como normal.',
    type: GeneralPowerType.RACA,
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Minotauro' },
        { type: RequirementType.PODER, name: 'Protetor Táurico' },
      ],
    ],
  },
  PROTETOR_TAURICO: {
    name: 'Protetor Táurico',
    description:
      'Você pode gastar uma ação de movimento para carregar consigo (no colo, sobre os ombros…) um aliado adjacente Médio ou menor. Você precisa de uma mão livre, que fica ocupada enquanto você estiver carregando o aliado. Enquanto está sendo carregado, o aliado é considerado sob cobertura leve (Defesa +5). Além disso, qualquer ataque contra o aliado tem 50% de chance de ter você, e não o aliado, como alvo.',
    type: GeneralPowerType.RACA,
    requirements: [[{ type: RequirementType.RACA, name: 'Minotauro' }]],
  },
  QUADRIDESTRIA: {
    name: 'Quadridestria',
    description:
      'Você consegue agir com todos os seus braços ao mesmo tempo. Uma vez por rodada, quando usa o poder Estilo de Duas Armas, você pode gastar 2 PM para fazer um ataque com cada arma que estiver empunhando, desde que todas, com exceção de uma, sejam leves. Assim, se estiver empunhando três armas (e pelo menos duas forem leves), pode fazer três ataques; se estiver empunhando quatro armas (e pelo menos três forem leves), pode fazer quatro ataques. Poderes que modificam Estilo de Duas Armas também se aplicam aos seus braços extras. Por exemplo, Arma Secundária Grande permite que você use armas de uma mão em todos os seus braços e Ambidestria elimina a penalidade de todos os ataques.',
    type: GeneralPowerType.RACA,
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Kaijin' },
        { type: RequirementType.PODER, name: 'Estilo de Duas Armas' },
        { type: RequirementType.HABILIDADE, name: 'Quatro Braços' },
        { type: RequirementType.NIVEL, value: 5 },
      ],
      [
        { type: RequirementType.RACA, name: 'Lefou' },
        { type: RequirementType.PODER, name: 'Estilo de Duas Armas' },
        { type: RequirementType.HABILIDADE, name: 'Quatro Braços' },
        { type: RequirementType.NIVEL, value: 5 },
      ],
      [
        { type: RequirementType.RACA, name: 'Nagah' },
        { type: RequirementType.PODER, name: 'Estilo de Duas Armas' },
        { type: RequirementType.HABILIDADE, name: 'Quatro Braços' },
        { type: RequirementType.NIVEL, value: 5 },
      ],
      [
        { type: RequirementType.RACA, name: 'Orc' },
        { type: RequirementType.PODER, name: 'Estilo de Duas Armas' },
        { type: RequirementType.HABILIDADE, name: 'Quatro Braços' },
        { type: RequirementType.NIVEL, value: 5 },
      ],
      [
        { type: RequirementType.RACA, name: 'Trog' },
        { type: RequirementType.PODER, name: 'Estilo de Duas Armas' },
        { type: RequirementType.HABILIDADE, name: 'Quatro Braços' },
        { type: RequirementType.NIVEL, value: 5 },
      ],
    ],
  },
  QUATRO_BRACOS: {
    name: 'Quatro Braços',
    description:
      'Você possui um par de braços extras. Isso permite que você empunhe até quatro objetos, mas não fornece ações extras — por exemplo, você continua fazendo apenas um ataque com a ação agredir (mas veja Quadridestria).',
    type: GeneralPowerType.RACA,
    requirements: [
      [{ type: RequirementType.RACA, name: 'Kaijin' }],
      [{ type: RequirementType.RACA, name: 'Lefou' }],
      [{ type: RequirementType.RACA, name: 'Nagah' }],
      [{ type: RequirementType.RACA, name: 'Orc' }],
      [{ type: RequirementType.RACA, name: 'Trog' }],
    ],
  },
  SALIVA_CORROSIVA: {
    name: 'Saliva Corrosiva',
    description:
      'Sua mordida causa +1d6 pontos de dano de ácido. Além disso, você pode gastar uma ação de movimento para cobrir de saliva uma arma que esteja usando. A arma causa +1d6 pontos de dano de ácido. O ácido dura até você acertar um ataque ou até o fim da cena (o que acontecer primeiro).',
    type: GeneralPowerType.RACA,
    requirements: [[{ type: RequirementType.RACA, name: 'Trog' }]],
  },
  SANGUE_MAGICO: {
    name: 'Sangue Mágico',
    description:
      'Você pode dar seu sangue para conjurar magias — literalmente! Uma vez por dia, você pode receber um número de PM a sua escolha, limitado pela sua Constituição. Por exemplo, se você possui Con 3, pode ganhar 1, 2 ou 3 PM. Se você fizer isso e lançar uma magia no mesmo turno, os PM ganhos por este poder podem ultrapassar seu limite de PM por nível. Se usar este poder, no final do seu turno você perde 1d4 PV por PM recebido. Por exemplo, se escolheu receber 3 PM, perde 3d4 PV.',
    type: GeneralPowerType.RACA,
    requirements: [
      [{ type: RequirementType.RACA, name: 'Eiradaan' }],
      [{ type: RequirementType.RACA, name: 'Qareen' }],
      [{ type: RequirementType.RACA, name: 'Sílfide' }],
    ],
  },
  SARAIVADA_FLORESTAL: {
    name: 'Saraivada Florestal',
    description:
      'Se estiver sob efeito de sua Armadura de Allihanna, você pode gastar uma ação de movimento e 2 PM para disparar folhas afiadas e lascas de madeira em um cone de 9m. Todas as criaturas nessa área sofrem 2d8+2 pontos de dano de corte (Ref CD Sab reduz à metade). Para cada patamar acima de iniciante, você pode gastar +1 PM para aumentar o dano em +1d8+1.',
    type: GeneralPowerType.RACA,
    requirements: [[{ type: RequirementType.RACA, name: 'Dahllan' }]],
  },
  SOCO_FOGUETE: {
    name: 'Soco Foguete',
    description:
      'Quando faz um ataque corpo a corpo, você pode gastar 1 PM para disparar seu punho e atingir um alvo em alcance curto. Após o ataque, sua mão volta voando para você. Esse ataque não pode ser usado para agarrar.',
    type: GeneralPowerType.RACA,
    requirements: [[{ type: RequirementType.RACA, name: 'Golem' }]],
  },
  VALENTIA_NATA: {
    name: 'Valentia Nata',
    description:
      'Seu povo não tem medo. Nem juízo. Você recebe imunidade a medo e +5 em Iniciativa.',
    type: GeneralPowerType.RACA,
    requirements: [[{ type: RequirementType.RACA, name: 'Hynne' }]],
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Valentia Nata' },
        target: { type: 'Skill', name: Skill.INICIATIVA },
        modifier: { type: 'Fixed', value: 5 },
      },
    ],
  },
  TRADICAO_DE_AYRELYNN: {
    name: 'Tradição de Ayrelynn',
    description:
      'Você recebe proficiência com armas de fogo e pode usar Sabedoria em vez de Destreza nos testes de ataque com essas armas (e, caso possua o poder Estilo de Disparo, nas rolagens de dano).',
    type: GeneralPowerType.RACA,
    requirements: [[{ type: RequirementType.RACA, name: 'Anão' }]],
  },
  TRADICAO_PERDIDA: {
    name: 'Tradição Perdida',
    description:
      'Membros de sua raça sabem lançar magias de uma forma diferente das conhecidas. Escolha um atributo (Força, Destreza, Constituição, Inteligência, Sabedoria ou Carisma) e uma de suas classes com a habilidade Magias. Para essa classe, você soma o atributo escolhido no seu total de PM, em vez do atributo determinado por ela, até um limite de 6 pontos de atributo, +2 pontos por patamar acima de iniciante — com parte de seu conhecimento perdido, as tradições mais antigas possuem certas limitações. Aumentos temporários nesse atributo não fornecem PM adicionais.',
    type: GeneralPowerType.RACA,
    requirements: [
      [
        { type: RequirementType.TEXT, text: 'Não humano' },
        { type: RequirementType.HABILIDADE, name: 'Magias' },
      ],
    ],
  },
  TRADICAO_PERDIDA_APRIMORADA: {
    name: 'Tradição Perdida Aprimorada',
    description:
      'Seu atributo-chave para lançar magias para a classe escolhida para Tradição Perdida passa a ser o atributo escolhido para esse poder (sujeito aos mesmos limites desse poder).',
    type: GeneralPowerType.RACA,
    requirements: [[{ type: RequirementType.PODER, name: 'Tradição Perdida' }]],
  },
  VENENO_APRIMORADO: {
    name: 'Veneno Aprimorado',
    description:
      'O veneno que você aplica com sua habilidade Natureza Venenosa passa a causar a perda de 2d12 PV.',
    type: GeneralPowerType.RACA,
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Medusa' },
        { type: RequirementType.ATRIBUTO, name: 'Constituição', value: 1 },
      ],
    ],
  },
  VIGILANCIA_ELFICA: {
    name: 'Vigilância Élfica',
    description:
      'Em seu primeiro turno de cada combate, você recebe uma ação de movimento adicional.',
    type: GeneralPowerType.RACA,
    requirements: [
      [{ type: RequirementType.RACA, name: 'Elfo' }],
      [{ type: RequirementType.RACA, name: 'Meio-Elfo' }],
      [{ type: RequirementType.RACA, name: 'Naidora' }],
    ],
  },
  VITALIDADE_DAS_FADAS: {
    name: 'Vitalidade das Fadas',
    description:
      'Sua energia vital não provém de simples saúde física, mas de convicção, postura positiva e força de personalidade. Você soma seu Carisma em seus pontos de vida iniciais e em Fortitude, e recebe +1 PV por nível a partir do 2º.',
    type: GeneralPowerType.RACA,
    requirements: [
      [{ type: RequirementType.RACA, name: 'Dahllan' }],
      [{ type: RequirementType.RACA, name: 'Duende' }],
      [{ type: RequirementType.RACA, name: 'Sátiro' }],
      [{ type: RequirementType.RACA, name: 'Sílfide' }],
    ],
  },
};

export default racePowers;
