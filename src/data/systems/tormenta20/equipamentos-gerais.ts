import Equipment from '../../../interfaces/Equipment';
import Skill from '../../../interfaces/Skills';

// Função helper para processar preços (remove "T$ " e converte para número)
function parsePrice(priceStr: string): number {
  return parseFloat(priceStr.replace('T$ ', '').replace(',', '.')) || 0;
}

// Função helper para processar espaços (converte "—" para 0, strings para números)
function parseSpaces(spacesStr: string | number): number {
  if (spacesStr === '—' || spacesStr === '') return 0;
  if (typeof spacesStr === 'string') {
    return parseFloat(spacesStr.replace(',', '.')) || 0;
  }
  return spacesStr || 0;
}

// Equipamentos de Aventureiro (categoria: Item Geral)
export const equipamentoAventureiro: Equipment[] = [
  {
    nome: 'Água benta',
    group: 'Item Geral',
    preco: parsePrice('T$ 10'),
    descricao: 'Produzida com a magia Abençoar Alimentos, esta água sagrada é um poderoso recurso na luta contra o mal. Para usar a água benta, você gasta uma ação padrão e escolhe um morto-vivo ou abissal em alcance curto (a água benta é inofensiva contra outras criaturas). O alvo sofre 2d10 pontos de dano de luz (Reflexos CD Sab reduz à metade).',
    spaces: parseSpaces(0.5),
    rolls: [
      {
        label: 'Dano de Luz',
        dice: '2d10',
        description:
          'O alvo sofre 2d10 pontos de dano de luz (Reflexos CD Sab reduz à metade).',
      },
    ],
  },
  {
    nome: 'Algemas',
    group: 'Item Geral',
    preco: parsePrice('T$ 15'),
    descricao: 'Um par de algemas para criaturas . Prender uma criatura que não esteja indefesa exige empunhar a algema, agarrar o alvo (veja “Manobras de Combate”, no Capítulo 5) e vencer um novo teste de agarrar contra ela. Você pode prender os dois pulsos da pessoa (–5 em testes que exijam o uso das mãos, impede conjuração) ou um dos pulsos dela em um objeto imóvel adjacente, caso haja, para impedir que ela se mova. Escapar das algemas exige uma ação completa e um teste de Acrobacia contra CD 30 ou de Força contra CD 25 — ou ter as chaves...',
    spaces: parseSpaces(1),
  },
  {
    nome: 'Arpéu',
    group: 'Item Geral',
    preco: parsePrice('T$ 5'),
    descricao: 'Um gancho de aço amarrado na ponta de uma corda para se fixar em muros, janelas, parapeitos de prédios... Prender um arpéu exige um teste de Pontaria (CD 15). Subir um muro com a ajuda de uma corda fornece +5 no teste de Atletismo.',
    spaces: parseSpaces(1),
  },
  {
    nome: 'Bandoleira de poções',
    group: 'Item Geral',
    preco: parsePrice('T$ 20'),
    descricao: 'Um cinto de couro com bolsos que comportam pequenos frascos. Se você estiver vestindo uma bandoleira, pode sacar itens alquímicos e poções como uma ação livre.',
    spaces: parseSpaces(1),
  },
  {
    nome: 'Barraca',
    group: 'Item Geral',
    preco: parsePrice('T$ 10'),
    descricao: 'Esta barraca de lona conta como um saco de dormir para duas pessoas e fornece +2 em testes de Sobrevivência para acampar.',
    spaces: parseSpaces(1),
  },
  {
    nome: 'Corda',
    group: 'Item Geral',
    preco: parsePrice('T$ 1'),
    descricao: 'Um rolo com 10 metros de corda de cânhamo, o mesmo tipo usado em navios. Possui diversas utilidades: pode ajudar a descer um buraco ou muro (+5 em testes de Atletismo nessas situações), amarrar pessoas etc. Dar um nó firme ou especial (por exemplo, capaz de deslizar, se desfazer com um puxão etc.) exige um teste de Destreza (CD 15). Arrebentar a corda exige 2 pontos de dano de corte ou uma ação padrão e um teste de Força (CD 20).',
    spaces: parseSpaces(1),
  },
  {
    nome: 'Espelho',
    group: 'Item Geral',
    preco: parsePrice('T$ 10'),
    descricao: 'Este pequeno espelho possui diversas utilidades: observar cantos, fazer sinais de luz e, claro, garantir que você esteja apresentável.',
    spaces: parseSpaces(1),
  },
  {
    nome: 'Lampião',
    group: 'Item Geral',
    preco: parsePrice('T$ 7'),
    descricao: 'Um cilindro com uma alça e duas portinholas. Uma chama alimentada por óleo é acesa dentro do cilindro e uma das portinholas aberta deixa a luz sair. Acender um lampião é uma ação padrão e sua luz ilumina um raio com 15m. Carregar um lampião com óleo é uma ação padrão e ele dura uma cena.',
    spaces: parseSpaces(1),
  },
  {
    nome: 'Mochila',
    group: 'Item Geral',
    preco: parsePrice('T$ 2'),
    descricao: 'Uma bolsa de lona com tiras para ser carregada nas costas. Não conta como item vestido.',
    spaces: parseSpaces('—'),
  },
  {
    nome: 'Mochila de aventureiro',
    group: 'Item Geral',
    preco: parsePrice('T$ 50'),
    descricao: 'Feita de couro resistente, esta mochila é repleta de bolsos para prender equipamento. Vestir uma mochila de aventureiro aumenta sua capacidade de carga em 2 espaços (ela própria não gasta um espaço).',
    spaces: parseSpaces('—'),
    sheetBonuses: [
      {
        source: { type: 'equipment', equipmentName: 'Mochila de aventureiro' },
        target: { type: 'MaxSpaces' },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
  {
    nome: 'Óleo',
    group: 'Item Geral',
    preco: parsePrice('T$ 0,1'),
    descricao: 'Um frasco com óleo inflamável para lampião. Você pode atirar o frasco em uma criatura em alcance curto com uma ação padrão. Se ela sofrer dano de fogo até o fim do seu próximo turno, sofre 1d6 pontos de dano extra e fica em chamas.',
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Organizador de pergaminhos',
    group: 'Item Geral',
    preco: parsePrice('T$ 25'),
    descricao: 'Um estojo de madeira ou couro rígido. Se você estiver vestindo um organizador de pergaminhos, pode sacar pergaminhos como uma ação livre.',
    spaces: parseSpaces(1),
  },
  {
    nome: 'Pé de cabra',
    group: 'Item Geral',
    preco: parsePrice('T$ 2'),
    descricao: 'Esta barra de ferro fornece +5 em testes de Força para abrir portas, janelas e baús fechados. Um pé de cabra pode ser usado como arma, com as estatísticas de uma clava.',
    spaces: parseSpaces(1),
  },
  {
    nome: 'Saco de dormir',
    group: 'Item Geral',
    preco: parsePrice('T$ 1'),
    descricao: 'Um colchão com uma coberta fina o bastante para ser enrolada e amarrada, é especialmente útil para aventureiros, que nunca',
    spaces: parseSpaces(1),
  },
  {
    nome: 'Símbolo sagrado',
    group: 'Item Geral',
    preco: parsePrice('T$ 5'),
    descricao: 'Um medalhão de madeira ou metal com o símbolo de uma divindade. Se você estiver vestindo (normalmente com uma corrente ao redor do pescoço) ou empunhando o símbolo sagrado de um deus do qual é devoto, recebe +1 em testes de resistência.',
    spaces: parseSpaces(1),
    sheetBonuses: [
      {
        source: { type: 'equipment', equipmentName: 'Símbolo sagrado' },
        target: { type: 'Skill', name: Skill.FORTITUDE },
        modifier: { type: 'Fixed', value: 1 },
      },
      {
        source: { type: 'equipment', equipmentName: 'Símbolo sagrado' },
        target: { type: 'Skill', name: Skill.REFLEXOS },
        modifier: { type: 'Fixed', value: 1 },
      },
      {
        source: { type: 'equipment', equipmentName: 'Símbolo sagrado' },
        target: { type: 'Skill', name: Skill.VONTADE },
        modifier: { type: 'Fixed', value: 1 },
      },
    ],
  },
  {
    nome: 'Tocha',
    group: 'Item Geral',
    preco: parsePrice('T$ 0,1'),
    descricao: 'Um bastão de madeira com algum combustível na ponta (geralmente trapos embebidos em parafina). Acender uma tocha é uma ação padrão. Ela ilumina um raio de 9m e dura uma cena. Pode ser usada como uma arma simples leve (dano 1d4 de impacto mais 1 de fogo, crítico x2).',
    spaces: parseSpaces(1),
    canBeUsedAsWeapon: true,
    weaponStats: {
      dano: '1d4+1',
      critico: 'x2',
      tipo: 'Impacto/Fogo',
    },
  },
  {
    nome: 'Vara de madeira (3m)',
    group: 'Item Geral',
    preco: parsePrice('T$ 0,2'),
    spaces: parseSpaces(1),
  },
];

// Ferramentas (categoria: Item Geral)
export const ferramentas: Equipment[] = [
  {
    nome: 'Alaúde élfico',
    group: 'Item Geral',
    preco: parsePrice('T$ 300'),
    descricao: 'Feito com madeira de alta qualidade e manufatura delicada, este alaúde gera notas vívidas e emocionantes. Enquanto empunha este item, você pode usar a habilidade Inspiração como uma ação de movimento. Conta como um instrumento musical.',
    spaces: parseSpaces(1),
  },
  {
    nome: 'Coleção de livros',
    group: 'Item Geral',
    preco: parsePrice('T$ 75'),
    descricao: 'Uma pequena coleção de tomos e tratados sobre um assunto. Fornece +1 em Conhecimento, Guerra, Misticismo,',
    spaces: parseSpaces(1),
    selectableBonus: {
      availableSkills: [
        Skill.CONHECIMENTO,
        Skill.GUERRA,
        Skill.MISTICISMO,
        Skill.NOBREZA,
        Skill.RELIGIAO,
      ],
      bonusValue: 1,
      pick: 1,
    },
  },
  {
    nome: 'Equipamento de viagem',
    group: 'Item Geral',
    preco: parsePrice('T$ 10'),
    descricao: 'Um saco de lona contendo instrumentos úteis para sobreviver',
    spaces: parseSpaces(1),
  },
  {
    nome: 'Estojo de disfarces',
    group: 'Item Geral',
    preco: parsePrice('T$ 50'),
    descricao: 'Um conjunto de cosméticos, tintas para cabelo e algumas próteses simples (como bigodes e narizes falsos). Um personagem sem este item sofre –5 em testes de Enganação para disfarce. Você precisa empunhar um instrumento musical com as duas mãos para receber seus benefícios e para usar Músicas de Bardo (veja a página 45). Instrumentos musicais podem ser usados como esotéricos por bardos (permitindo que lance magias usando a mão que empunha o instrumento).',
    spaces: parseSpaces(1),
  },
  {
    nome: 'Flauta mística',
    group: 'Item Geral',
    preco: parsePrice('T$ 150'),
    descricao: 'Um instrumento delicado, repleto de runas e pequenas gemas místicas. Um bardo que empunhe este item aumenta a CD para resistir às magias lançadas por ele em +1. Conta como um instrumento musical. Instrumentos musicais podem receber melhorias de ferramentas (contam como itens ligados a Atuação) e de esotéricos (mas afetam apenas magias lançadas por bardos).',
    spaces: parseSpaces(1),
    conditionalBonuses: [
      {
        condition: { type: 'isClass', value: 'Bardo' },
        bonuses: [
          {
            source: { type: 'equipment', equipmentName: 'Flauta mística' },
            target: { type: 'SpellDC' },
            modifier: { type: 'Fixed', value: 1 },
          },
        ],
      },
    ],
  },
  {
    nome: 'Gazua',
    group: 'Item Geral',
    preco: parsePrice('T$ 5'),
    descricao: 'Uma barra fina de ferro, com a ponta torta ou em forma de gancho. Um personagem sem este item sofre –5 em testes de Ladinagem para abrir fechaduras. Instrumentos de <Ofício>. Existe uma versão deste item para cada perícia de Ofício. Por exemplo, martelo, pregos e serrote para Ofício (carpinteiro), pergaminhos em branco, tinta e pena para Ofício (escriba) e assim por diante. Um personagem sem os instrumentos de seu Ofício sofre –5 nessa perícia. Itens desta categoria afetam testes de perícia, eliminando penalidades ou fornecendo bônus. A CD para fabricar qualquer ferramenta é 20.',
    spaces: parseSpaces(1),
  },
  {
    nome: 'Instrumentos de «ofício»',
    group: 'Item Geral',
    preco: parsePrice('T$ 30'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Instrumento musical',
    group: 'Item Geral',
    preco: parsePrice('T$ 35'),
    descricao: 'Um instrumento típico, como um bandolim, flauta ou lira. Veja o quadro acima para as regras deste item.',
    spaces: parseSpaces(1),
  },
  {
    nome: 'Luneta',
    group: 'Item Geral',
    preco: parsePrice('T$ 100'),
    descricao: 'Este instrumento valioso consiste de um cilindro metálico com duas lentes. Fornece +5 em testes de Percepção para observar coisas em alcance longo ou além.',
    spaces: parseSpaces(1),
  },
  {
    nome: 'Maleta de medicamentos',
    group: 'Item Geral',
    preco: parsePrice('T$ 50'),
    descricao: 'Caixa de madeira com ervas, unguentos, bandagens e outros materiais úteis. Um personagem sem este item sofre –5 em Cura. Nobreza ou Religião (definido quando o item é comprado ou fabricado).',
    spaces: parseSpaces(1),
  },
  {
    nome: 'Sela',
    group: 'Item Geral',
    preco: parsePrice('T$ 20'),
    descricao: 'Uma peça de couro e pelego colocada sobre o lombo da montaria, sobre a qual o cavaleiro se senta. Inclui arreios para conduzir o animal. Um personagem montado em uma montaria sem sela sofre –5 em testes de Cavalgar. Usada no animal, a sela não ocupa espaço de carga do personagem. nos ermos, como pederneira',
    spaces: parseSpaces(1),
  },
  {
    nome: 'Tambor das profundezas',
    group: 'Item Geral',
    preco: parsePrice('T$ 80'),
    descricao: 'Um instrumento típico de anões de Doherimm, capaz de sons graves e retumbantes. Enquanto empunha este item, o alcance da habilidade Inspiração e de qualquer Música de Bardo é dobrado. Conta como um instrumento musical. 158',
    spaces: parseSpaces(1),
  },
];

// Vestuário (categoria: Vestuário)
export const vestuario: Equipment[] = [
  {
    nome: 'Andrajos de aldeão',
    group: 'Vestuário',
    preco: parsePrice('T$ 1'),
    descricao: 'Roupas típicas de camponês. Consiste de camisa larga e calças soltas ou blusa e saia e não inclui botas — os mais pobres andam descalços. Fornece +2 em testes de Investigação para interrogar (ninguém se importa com o que um aldeão escuta) e, se você possuir o poder Aparência Inofensiva, a CD para resistir a ele aumenta em +2. Porém, impõe –2 em perícias baseadas em Carisma contra pessoas que se importam com classe social.',
    spaces: parseSpaces(1),
  },
  {
    nome: 'Bandana',
    group: 'Vestuário',
    preco: parsePrice('T$ 5'),
    descricao: 'Um lenço tipicamente usado por bandidos e piratas. Fornece +1 em Intimidação.',
    spaces: parseSpaces(1),
    sheetBonuses: [
      {
        source: { type: 'equipment', equipmentName: 'Bandana' },
        target: { type: 'Skill', name: Skill.INTIMIDACAO },
        modifier: { type: 'Fixed', value: 1 },
      },
    ],
  },
  {
    nome: 'Botas reforçadas',
    group: 'Vestuário',
    preco: parsePrice('T$ 20'),
    descricao: 'Grossas e resistentes, estas botas de cano alto protegem contra perigos do terreno. Aumentam seu deslocamento em +1,5m se ele for reduzido por terreno difícil (após a redução).',
    spaces: parseSpaces(1),
  },
  {
    nome: 'Camisa bufante',
    group: 'Vestuário',
    preco: parsePrice('T$ 25'),
    descricao: 'Blusa colorida, com mangas e golas longas e encrespadas. Fornece +1 em Atuação.',
    spaces: parseSpaces(1),
    sheetBonuses: [
      {
        source: { type: 'equipment', equipmentName: 'Camisa bufante' },
        target: { type: 'Skill', name: Skill.ATUACAO },
        modifier: { type: 'Fixed', value: 1 },
      },
    ],
  },
  {
    nome: 'Capa esvoaçante',
    group: 'Vestuário',
    preco: parsePrice('T$ 25'),
    descricao: 'Favorita entre heróis ousados, esta capa de seda produz movimentos amplos e chamativos, que fornecem +1 em Enganação.',
    spaces: parseSpaces(1),
    sheetBonuses: [
      {
        source: { type: 'equipment', equipmentName: 'Capa esvoaçante' },
        target: { type: 'Skill', name: Skill.ENGANACAO },
        modifier: { type: 'Fixed', value: 1 },
      },
    ],
  },
  {
    nome: 'Capa pesada',
    group: 'Vestuário',
    preco: parsePrice('T$ 15'),
    descricao: 'Uma capa de couro grossa e resistente. Protege e aquece o corpo, fornecendo +1 em Fortitude.',
    spaces: parseSpaces(1),
    sheetBonuses: [
      {
        source: { type: 'equipment', equipmentName: 'Capa pesada' },
        target: { type: 'Skill', name: Skill.FORTITUDE },
        modifier: { type: 'Fixed', value: 1 },
      },
    ],
  },
  {
    nome: 'Casaco longo',
    group: 'Vestuário',
    preco: parsePrice('T$ 20'),
    descricao: 'Feito de peles ou couro grosso forrado com lã, e impermeabilizado com óleo, este casaco é quente e pesado. Fornece +5 em testes de Fortitude para resistir a efeitos de frio, mas impõe penalidade de armadura de –2.',
    spaces: parseSpaces(1),
  },
  {
    nome: 'Chapéu arcano',
    group: 'Vestuário',
    preco: parsePrice('T$ 50'),
    descricao: 'Com pinturas e bordados de símbolos místicos, este chapéu pontudo ajuda a canalizar energias mágicas. Ele fornece +1 ponto de mana, mas apenas se você possuir a habilidade de classe Caminho do Arcanista.',
    spaces: parseSpaces(1),
    conditionalBonuses: [
      {
        condition: { type: 'hasClassAbility', value: 'Caminho do Arcanista' },
        bonuses: [
          {
            source: { type: 'equipment', equipmentName: 'Chapéu arcano' },
            target: { type: 'PM' },
            modifier: { type: 'Fixed', value: 1 },
          },
        ],
      },
    ],
  },
  {
    nome: 'Enfeite de elmo',
    group: 'Vestuário',
    preco: parsePrice('T$ 15'),
    descricao: 'Um adorno chamativo, como crina de cavalo, plumas, asas ou um totem de animal. Fornece resistência a medo +2.',
    spaces: parseSpaces(1),
  },
  {
    nome: 'Fardamento de guarnição',
    group: 'Vestuário',
    preco: parsePrice('T$ 1'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Farrapos de ermitão',
    group: 'Vestuário',
    preco: parsePrice('T$ 5'),
    descricao: 'Trapos “adornados” com plantas e raízes. Uma pessoa vestindo farrapos de ermitão não parece muito civilizada, e sofre –2 em Diplomacia e em testes de Investigação para interrogar. Entretanto, recebe +2 em Adestramento.',
    spaces: parseSpaces(1),
    sheetBonuses: [
      {
        source: { type: 'equipment', equipmentName: 'Farrapos de ermitão' },
        target: { type: 'Skill', name: Skill.DIPLOMACIA },
        modifier: { type: 'Fixed', value: -2 },
      },
      {
        source: { type: 'equipment', equipmentName: 'Farrapos de ermitão' },
        target: { type: 'Skill', name: Skill.ADESTRAMENTO },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
  {
    nome: 'Gorro de ervas',
    group: 'Vestuário',
    preco: parsePrice('T$ 75'),
    descricao: 'Formado por duas camadas de tecido, este chapéu é preenchido com ervas preparadas para auxiliar a concentração do usuário. Fornece +1 em Vontade.',
    spaces: parseSpaces(1),
    sheetBonuses: [
      {
        source: { type: 'equipment', equipmentName: 'Gorro de ervas' },
        target: { type: 'Skill', name: Skill.VONTADE },
        modifier: { type: 'Fixed', value: 1 },
      },
    ],
  },
  {
    nome: 'Luva de pelica',
    group: 'Vestuário',
    preco: parsePrice('T$ 5'),
    descricao: 'Estas luvas delicadas preservam o tato e impedem que o suor deixe os dedos escorregadios. Fornecem +1 em Ladinagem.',
    spaces: parseSpaces(1),
    sheetBonuses: [
      {
        source: { type: 'equipment', equipmentName: 'Luva de pelica' },
        target: { type: 'Skill', name: Skill.LADINAGEM },
        modifier: { type: 'Fixed', value: 1 },
      },
    ],
  },
  {
    nome: 'Manopla',
    group: 'Vestuário',
    preco: parsePrice('T$ 10'),
    descricao: 'Luva metálica que permite socos mais perigosos — o dano de seus ataques desarmados torna-se letal. Uma manopla conta como uma arma para receber melhorias e encantos para usá-los em seus ataques desarmados.',
    spaces: parseSpaces(1),
  },
  {
    nome: 'Manto camuflado',
    group: 'Vestuário',
    preco: parsePrice('T$ 12'),
    descricao: 'Um manto camuflado é feito para um tipo de terreno específico (veja a habilidade Explorador, na página 51). Por exemplo, um manto camuflado para floresta pode ser verde e marrom e coberto de folhas, enquanto um manto urbano pode ser cinza ou negro. Usar um manto camuflado no terreno correto fornece +2 em Furtividade.',
    spaces: parseSpaces(1),
  },
  {
    nome: 'Manto eclesiástico',
    group: 'Vestuário',
    preco: parsePrice('T$ 20'),
    descricao: 'Um manto típico de igrejas e templos. Fornece +1 em Religião.',
    spaces: parseSpaces(1),
    sheetBonuses: [
      {
        source: { type: 'equipment', equipmentName: 'Manto eclesiástico' },
        target: { type: 'Skill', name: Skill.RELIGIAO },
        modifier: { type: 'Fixed', value: 1 },
      },
    ],
  },
  {
    nome: 'Robe místico',
    group: 'Vestuário',
    preco: parsePrice('T$ 50'),
    descricao: 'Um manto longo, adornado com temas arcanos. Fornece +1 em Misticismo.',
    spaces: parseSpaces(1),
    sheetBonuses: [
      {
        source: { type: 'equipment', equipmentName: 'Robe místico' },
        target: { type: 'Skill', name: Skill.MISTICISMO },
        modifier: { type: 'Fixed', value: 1 },
      },
    ],
  },
  {
    nome: 'Sapatos de andruança',
    group: 'Vestuário',
    preco: parsePrice('T$ 8'),
    spaces: parseSpaces(1),
    sheetBonuses: [
      {
        source: { type: 'equipment', equipmentName: 'Sapatos de andruança' },
        target: { type: 'Skill', name: Skill.ACROBACIA },
        modifier: { type: 'Fixed', value: 1 },
      },
    ],
  },
  {
    nome: 'Tabardo',
    group: 'Vestuário',
    preco: parsePrice('T$ 10'),
    descricao: 'Uma peça de tecido usada como um colete, cobrindo o peito e as costas. Geralmente ostenta a heráldica de um reino, igreja, casa nobre ou ordem de cavaleiros. Fornece +1 em Diplomacia.',
    spaces: parseSpaces(1),
    sheetBonuses: [
      {
        source: { type: 'equipment', equipmentName: 'Tabardo' },
        target: { type: 'Skill', name: Skill.DIPLOMACIA },
        modifier: { type: 'Fixed', value: 1 },
      },
    ],
  },
  {
    nome: 'Traje da corte',
    group: 'Vestuário',
    preco: parsePrice('T$ 100'),
    descricao: 'Roupas de luxo, feitas sob medida e adequadas à nobreza e realeza. Inclui algumas joias, como aneis e colares. Em certos ambientes (um baile, um salão de palácio), um personagem que não esteja vestindo este item sofre –5 em perícias baseadas em Carisma.',
    spaces: parseSpaces(1),
  },
  {
    nome: 'Traje de viajante',
    group: 'Vestuário',
    preco: parsePrice('T$ 10'),
    descricao: 'Inclui botas, calças ou saias, cinto, camisa de linho e capa com capuz. A roupa padrão de aventureiros.',
    spaces: parseSpaces(1),
  },
  {
    nome: 'Veste de seda',
    group: 'Vestuário',
    preco: parsePrice('T$ 25'),
    descricao: 'Esta roupa leve e elegante deixa seus movimentos os mais livres possíveis. Fornece +1 em Reflexos. Itens utilizados por conjuradores para lançar magias de forma mais eficiente. Para usar um esotérico, você precisa empunhá-lo com a mão que usará para gesticular ao lançar a magia. Uma magia só pode receber os benefícios de um esotérico por vez. A CD para fabricar qualquer esotérico é 20 e para fabricá-lo você deve ser treinado em Misticismo.',
    spaces: parseSpaces(1),
    sheetBonuses: [
      {
        source: { type: 'equipment', equipmentName: 'Veste de seda' },
        target: { type: 'Skill', name: Skill.REFLEXOS },
        modifier: { type: 'Fixed', value: 1 },
      },
    ],
  },
];

// Esotéricos (categoria: Esotérico)
export const esotericos: Equipment[] = [
  {
    nome: 'Bolsa de pó',
    group: 'Esotérico',
    preco: parsePrice('T$ 300'),
    descricao: 'Uma bolsa com pó multicolorido, fabricado a partir das pétalas trituradas de flores que',
    spaces: parseSpaces(1),
  },
  {
    nome: 'Cajado arcano',
    group: 'Esotérico',
    preco: parsePrice('T$ 1000'),
    spaces: parseSpaces(2),
  },
  {
    nome: 'Cetro elemental',
    group: 'Esotérico',
    preco: parsePrice('T$ 750'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Costela de lich',
    group: 'Esotérico',
    preco: parsePrice('T$ 300'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Dedo de ente',
    group: 'Esotérico',
    preco: parsePrice('T$ 200'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Luva de ferro',
    group: 'Esotérico',
    preco: parsePrice('T$ 150'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Medalhão de prata',
    group: 'Esotérico',
    preco: parsePrice('T$ 750'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Orbe cristalina',
    group: 'Esotérico',
    preco: parsePrice('T$ 750'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Tomo hermético',
    group: 'Esotérico',
    preco: parsePrice('T$ 1500'),
    spaces: parseSpaces(1),
  },
  {
    nome: 'Varinha arcana',
    group: 'Esotérico',
    preco: parsePrice('T$ 100'),
    spaces: parseSpaces(1),
  },
];

// Alquímicos - Preparados (categoria: Alquimía)
export const alquimicosPreparados: Equipment[] = [
  {
    nome: 'Ácido',
    group: 'Alquimía',
    preco: parsePrice('T$ 10'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Bálsamo restaurador',
    group: 'Alquimía',
    preco: parsePrice('T$ 10'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Bomba',
    group: 'Alquimía',
    preco: parsePrice('T$ 50'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Cosmético',
    group: 'Alquimía',
    preco: parsePrice('T$ 30'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Elixir amor',
    group: 'Alquimía',
    preco: parsePrice('T$ 100'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Essência de mana',
    group: 'Alquimía',
    preco: parsePrice('T$ 50'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Fogo alquímico',
    group: 'Alquimía',
    preco: parsePrice('T$ 10'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Pó do desaparecimento',
    group: 'Alquimía',
    preco: parsePrice('T$ 100'),
    spaces: parseSpaces(0.5),
  },
];

// Alquímicos - Catalisadores (categoria: Alquimía)
export const alquimicosCatalisadores: Equipment[] = [
  {
    nome: 'Baga-de-fogo',
    group: 'Alquimía',
    preco: parsePrice('T$ 30'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Sangue de dragão',
    group: 'Alquimía',
    preco: parsePrice('T$ 45'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Essência abissal',
    group: 'Alquimía',
    preco: parsePrice('T$ 150'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Líquen lilás',
    group: 'Alquimía',
    preco: parsePrice('T$ 30'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Musgo púrpura',
    group: 'Alquimía',
    preco: parsePrice('T$ 45'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Ossos de monstro',
    group: 'Alquimía',
    preco: parsePrice('T$ 45'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Pó de cristal',
    group: 'Alquimía',
    preco: parsePrice('T$ 30'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Pó de giz',
    group: 'Alquimía',
    preco: parsePrice('T$ 30'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Ramo verdejante',
    group: 'Alquimía',
    preco: parsePrice('T$ 45'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Saco de sal',
    group: 'Alquimía',
    preco: parsePrice('T$ 45'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Seiva de âmbar',
    group: 'Alquimía',
    preco: parsePrice('T$ 30'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Terra de cemitério',
    group: 'Alquimía',
    preco: parsePrice('T$ 30'),
    spaces: parseSpaces(0.5),
  },
];

// Alquímicos - Venenos (categoria: Alquimía)
export const alquimicosVenenos: Equipment[] = [
  {
    nome: 'Beladona',
    group: 'Alquimía',
    preco: parsePrice('T$ 1500'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Bruma sonolenta',
    group: 'Alquimía',
    preco: parsePrice('T$ 150'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Cicuta',
    group: 'Alquimía',
    preco: parsePrice('T$ 60'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Essência de sombra',
    group: 'Alquimía',
    preco: parsePrice('T$ 100'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Névoa tóxica',
    group: 'Alquimía',
    preco: parsePrice('T$ 30'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Peçonha comum',
    group: 'Alquimía',
    preco: parsePrice('T$ 15'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Peçonha concentrada',
    group: 'Alquimía',
    preco: parsePrice('T$ 90'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Peçonha potente',
    group: 'Alquimía',
    preco: parsePrice('T$ 600'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Pó de lich',
    group: 'Alquimía',
    preco: parsePrice('T$ 3000'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Riso de Nimb',
    group: 'Alquimía',
    preco: parsePrice('T$ 150'),
    spaces: parseSpaces(0.5),
  },
];

// Alimentação (categoria: Alimentação)
export const alimentacao: Equipment[] = [
  {
    nome: 'Batata valkariana',
    group: 'Alimentação',
    preco: parsePrice('T$ 2'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Gorad quente',
    group: 'Alimentação',
    preco: parsePrice('T$ 18'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Macarrão de vivakin',
    group: 'Alimentação',
    preco: parsePrice('T$ 6'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Prato do aventureiro',
    group: 'Alimentação',
    preco: parsePrice('T$ 1'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Ração de viagem (por dia)',
    group: 'Alimentação',
    preco: parsePrice('T$ 0,5'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Refeição comum',
    group: 'Alimentação',
    preco: parsePrice('T$ 0,3'),
    spaces: parseSpaces(0.5),
  },
  {
    nome: 'Sopa de peixe',
    group: 'Alimentação',
    preco: parsePrice('T$ 1'),
    spaces: parseSpaces(0.5),
  },
];

// Animais (categoria: Animal)
export const animais: Equipment[] = [
  {
    nome: 'Alforje',
    group: 'Animal',
    preco: parsePrice('T$ 30'),
    spaces: parseSpaces('—'),
  },
  {
    nome: 'Cão de caça',
    group: 'Animal',
    preco: parsePrice('T$ 150'),
    spaces: parseSpaces('—'),
  },
  {
    nome: 'Cavalo',
    group: 'Animal',
    preco: parsePrice('T$ 75'),
    spaces: parseSpaces('—'),
  },
  {
    nome: 'Cavalo de guerra',
    group: 'Animal',
    preco: parsePrice('T$ 400'),
    spaces: parseSpaces('—'),
  },
  {
    nome: 'Estábulo (por dia)',
    group: 'Animal',
    preco: parsePrice('T$ 0,1'),
    spaces: parseSpaces('—'),
  },
  {
    nome: 'Pônei',
    group: 'Animal',
    preco: parsePrice('T$ 5'),
    spaces: parseSpaces('—'),
  },
  {
    nome: 'Pônei de guerra',
    group: 'Animal',
    preco: parsePrice('T$ 30'),
    spaces: parseSpaces('—'),
  },
  {
    nome: 'Trobo',
    group: 'Animal',
    preco: parsePrice('T$ 60'),
    spaces: parseSpaces('—'),
  },
];

// Arrays unificados por categoria para uso no componente
export const generalItems: Equipment[] = [
  ...equipamentoAventureiro,
  ...ferramentas,
];

export const esotericItems: Equipment[] = [...esotericos];

export const clothingItems: Equipment[] = [...vestuario];

export const alchemyItems: Equipment[] = [
  ...alquimicosPreparados,
  ...alquimicosCatalisadores,
  ...alquimicosVenenos,
];

export const foodItems: Equipment[] = [...alimentacao];

export const animalItems: Equipment[] = [...animais];

// Objeto para facilitar o acesso organizado no componente
export const GENERAL_EQUIPMENT = {
  // Subcategorias para Item Geral
  adventurerEquipment: equipamentoAventureiro,
  tools: ferramentas,

  // Esotéricos (categoria própria)
  esoteric: esotericos,

  // Categorias diretas
  clothing: vestuario,

  // Subcategorias para Alquimia
  alchemyPrepared: alquimicosPreparados,
  alchemyCatalysts: alquimicosCatalisadores,
  alchemyPoisons: alquimicosVenenos,

  // Categoria direta
  food: alimentacao,

  // Animais
  animals: animais,

  // Arrays unificados
  generalItems,
  esotericItems,
  clothingItems,
  alchemyItems,
  foodItems,
  animalItems,
};
