import { ClassPower } from '../../../../../interfaces/Class';
import { RequirementType } from '../../../../../interfaces/Poderes';

/**
 * Poderes de Druida do suplemento Heróis de Arton
 */
const DRUIDA_POWERS: ClassPower[] = [
  {
    name: 'Arma Tradicional',
    text: 'Quando faz um ataque com uma foice, você pode gastar 2 PM para lançar uma magia de ácido, eletricidade, fogo ou frio com execução de movimento, padrão ou completa como ação livre. Considere que a mão da arma está livre para lançar essa magia.',
    requirements: [
      [
        { type: RequirementType.TEXT, text: 'Druida de Arton' },
        { type: RequirementType.NIVEL, value: 5 },
      ],
    ],
  },
  {
    name: 'Auspício do Crepúsculo',
    text: 'Você pode gastar 1 PM para cobrir uma de suas armas com sombras até o fim da cena. A arma causa +1d6 pontos de dano de trevas. Se você estiver sob efeito de escuridão, sempre que acertar um ataque com ela em combate, recebe 5 PV temporários cumulativos.',
    requirements: [[{ type: RequirementType.TEXT, text: 'Druida de Tenebra' }]],
  },
  {
    name: 'Auspício da Madrugada',
    text: 'Você pode gastar 1 PM para impor uma penalidade de –1 em testes de perícia e na CD de habilidades de criaturas a sua escolha em alcance curto por 1 rodada. Se você estiver sob efeito de escuridão, a penalidade se torna –2.',
    requirements: [[{ type: RequirementType.TEXT, text: 'Druida de Tenebra' }]],
  },
  {
    name: 'Auspício da Meia-Noite',
    text: 'Você pode gastar uma ação de movimento e 2 PM para aumentar a CD das suas habilidades de druida em +1 até o fim da cena. Se você usar este poder sob efeito de escuridão, o bônus na CD se torna +2.',
    requirements: [[{ type: RequirementType.TEXT, text: 'Druida de Tenebra' }]],
  },
  {
    name: 'Banquete Selvagem',
    text: 'Se você estiver em forma selvagem e gastar uma ação padrão para devorar um pedaço de uma criatura inconsciente que esteja com 0 PV ou menos (exceto construtos e seres incorpóreos), recebe +2 em Força, +5 em Intimidação e 2 PV temporários por nível até o fim da cena. Se a criatura é do tipo lacaio, ela morre.',
    requirements: [
      [
        { type: RequirementType.TEXT, text: 'Druida de Megalokk' },
        { type: RequirementType.PODER, name: 'Forma Selvagem' },
      ],
    ],
  },
  {
    name: 'Ciclo da Vida',
    text: 'Uma vez por cena, você pode gastar uma ação padrão para fazer um cadáver em alcance curto se decompor instantaneamente. Se fizer isso, você recebe +2 pontos de mana por ND que a criatura tinha em vida. Esses PM adicionais duram até o fim do dia.',
    requirements: [],
  },
  {
    name: 'Companheiro Aberrante',
    text: 'Escolha um de seus companheiros animais. Ele recebe o tipo aberrante, ganhando os bônus de seu nível. Um parceiro aberrante fornece os benefícios a seguir. Iniciante: uma vez por rodada, você pode gastar 1 PM para disparar um pulso mental contra uma criatura em alcance curto; ela sofre 2d6 pontos de dano psíquico ou perde 1d4 PM, a sua escolha. Veterano: você também pode gastar 2 PM para causar 4d6 pontos de dano ou fazer a criatura perder 2d4 PM. Mestre: você também pode gastar 4 PM para causar 6d6 pontos de dano ou fazer a criatura perder 3d4 PM.',
    requirements: [
      [
        { type: RequirementType.TEXT, text: 'Druida de Aharadak' },
        { type: RequirementType.PODER, name: 'Companheiro Animal' },
        { type: RequirementType.NIVEL, value: 6 },
      ],
    ],
  },
  {
    name: 'Companheiro Elemental',
    text: "Escolha um de seus companheiros animais. Ele recebe o tipo destruidor, ganhando os bônus de seu nível. Se você possuir o suplemento Ameaças de Arton, em vez disso ele pode se tornar também um parceiro aquin'ne, t'peel, pakk ou terrier (também ganhando o bônus de seu nível).",
    requirements: [
      [
        { type: RequirementType.TEXT, text: 'Druida de Arton' },
        { type: RequirementType.PODER, name: 'Companheiro Animal' },
      ],
    ],
  },
  {
    name: 'Erupção Elemental',
    text: 'Se você estiver em forma elemental, pode gastar uma ação de movimento e 2 PM. Se fizer isso, seu próximo ataque com uma arma natural realizado nessa cena afeta todas as criaturas em um cone de 6m (faça um único ataque corpo a corpo e compare o resultado com a Defesa de cada criatura na área) e causa dois dados de dano extras.',
    requirements: [[{ type: RequirementType.PODER, name: 'Forma Elemental' }]],
  },
  {
    name: 'Força da Natureza',
    text: 'Se estiver em forma selvagem, você pode gastar 4 PM para se cobrir de terra e raízes, como um elemental da própria terra, até o fim da cena. Nesse estado, você recebe +4 em um atributo a sua escolha.',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Forma Selvagem Superior' },
        { type: RequirementType.NIVEL, value: 17 },
      ],
    ],
  },
  {
    name: 'Forma Aberrante',
    text: 'Quando usa Forma Selvagem, você pode gastar +2 PM para assumir uma forma aberrante. Nessa forma, você conta como se tivesse dois poderes da Tormenta adicionais (exceto para perda de Carisma).',
    requirements: [
      [
        { type: RequirementType.TEXT, text: 'Druida de Aharadak' },
        { type: RequirementType.PODER, name: 'Forma Selvagem' },
      ],
    ],
  },
  {
    name: 'Forma de Cardume',
    text: 'Quando usa Forma Selvagem, você pode gastar +1 PM para assumir a forma de um cardume de criaturas anfíbias com duração sustentada. Você recebe imunidade a manobras de combate, sofre apenas metade do dano de armas, pode entrar nos espaços ocupados por inimigos e criaturas no mesmo espaço que você ficam em condição ruim para lançar magias.',
    requirements: [
      [
        { type: RequirementType.TEXT, text: 'Druida de Oceano' },
        { type: RequirementType.PODER, name: 'Forma Selvagem' },
      ],
    ],
  },
  {
    name: 'Forma Elemental',
    text: 'Quando usa Forma Selvagem, você pode gastar +2 PM para assumir uma forma elemental. Escolha entre ácido, eletricidade, fogo ou frio. Você recebe imunidade ao tipo de dano escolhido e vulnerabilidade ao tipo oposto. Além disso, o alcance de suas armas naturais aumenta em +1,5m e elas causam dano do tipo escolhido (em vez de seu dano normal).',
    requirements: [
      [
        { type: RequirementType.TEXT, text: 'Druida de Arton' },
        { type: RequirementType.PODER, name: 'Forma Selvagem' },
      ],
    ],
  },
  {
    name: 'Forma Esquelética',
    text: 'Quando usa Forma Selvagem, você pode gastar +2 PM para assumir uma forma esquelética. Seu tipo muda para morto-vivo e você recebe redução de corte, frio e perfuração 5 e imunidade a efeitos de cansaço, metabólicos e de veneno. Por fim, você sofre dano por efeitos mágicos de cura de luz (Vontade CD do efeito reduz à metade) e recupera PV com dano de trevas.',
    requirements: [
      [
        { type: RequirementType.TEXT, text: 'Druida de Tenebra' },
        { type: RequirementType.PODER, name: 'Forma Selvagem' },
      ],
    ],
  },
  {
    name: 'Forma Vegetal',
    text: 'Quando usa Forma Selvagem, você pode gastar +2 PM para assumir uma forma vegetal. Você recebe RD 5/corte ou fogo e Natureza Vegetal (fica imune a atordoamento e metamorfose, mas é afetado por efeitos que afetem plantas monstruosas — se o efeito não tiver um teste de resistência, você tem direito a um teste de Fortitude).',
    requirements: [
      [
        { type: RequirementType.TEXT, text: 'Druida de Allihanna' },
        { type: RequirementType.PODER, name: 'Forma Selvagem' },
      ],
    ],
  },
  {
    name: 'Instinto Venenoso',
    text: 'Você pode usar Sab como atributo-chave de venenos (em vez de Int). Além disso, em Forma Selvagem, pode aplicar venenos de contato em suas armas naturais como ação livre.',
    requirements: [[{ type: RequirementType.PODER, name: 'Coração da Selva' }]],
  },
  {
    name: 'Metamorfose Instantânea',
    text: 'Uma vez por rodada, quando usa Forma Selvagem, você pode gastar +2 PM para usar essa habilidade como ação livre.',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Forma Selvagem' },
        { type: RequirementType.NIVEL, value: 11 },
      ],
    ],
  },
  {
    name: 'Oráculo da Natureza',
    text: 'Você pode gastar uma ação de movimento para se conectar com as energias naturais do mundo. Enquanto você permanecer no mesmo lugar, a CD para resistir a suas magias aumenta em +2 e, sempre que você lança uma magia, recebe 2 PM para gastar em aprimoramentos. Se você estiver em um ambiente urbano, a ação necessária para usar este poder muda para completa.',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Xamã Místico' },
        { type: RequirementType.NIVEL, value: 11 },
      ],
    ],
  },
  {
    name: 'Orador dos Elementos',
    text: 'Você aprende e pode lançar uma magia de dano de ácido, eletricidade, fogo ou frio, arcana ou divina, de qualquer círculo que possa lançar. Além disso, você pode aprender magias arcanas de ácido, eletricidade, fogo ou frio como se fossem divinas.',
    requirements: [],
  },
  {
    name: 'Proteção Fúngica',
    text: 'Você pode gastar 1 PM para cobrir seu corpo de esporos com duração sustentada. Nesse estado, sempre que você sofrer um ataque corpo a corpo de uma criatura adjacente, ela perde 1d8 PV. A cada quatro níveis acima do 1º, você pode gastar +1 PM quando usa este poder para aumentar a perda de vida em +1d8. Veneno.',
    requirements: [[{ type: RequirementType.PODER, name: 'Coração da Selva' }]],
  },
  {
    name: 'Transformação Repugnante',
    text: 'Quando usa Forma Selvagem, você pode gastar +2 PM. Se fizer isso, inimigos em alcance curto sofrem 1d6 pontos de dano psíquico para cada poder da Tormenta que você possui e ficam alquebrados e frustrados (Vontade CD Sab reduz à metade e evita as condições).',
    requirements: [[{ type: RequirementType.PODER, name: 'Forma Aberrante' }]],
  },
  {
    name: 'Xamã Místico',
    text: 'Você recebe +1 PM por nível de druida, pode aprender e lançar magias de uma escola adicional e a CD para resistir a suas magias aumenta em +1.',
    requirements: [
      [{ type: RequirementType.TEXT, text: 'Não possuir Forma Selvagem' }],
    ],
  },
];

export default DRUIDA_POWERS;
