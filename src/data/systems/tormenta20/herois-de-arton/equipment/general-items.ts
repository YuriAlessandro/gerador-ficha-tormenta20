import Equipment from '../../../../../interfaces/Equipment';
import Skill from '../../../../../interfaces/Skills';
import { BonusCondition } from '../../../../../interfaces/CharacterSheet';

/**
 * Vários itens deste capítulo anulam ou reduzem a própria penalidade quando o
 * personagem tem proficiência com armaduras pesadas.
 */
const heavyArmorProficiency = (has: boolean): BonusCondition => ({
  combinator: 'AND',
  clauses: [
    { kind: 'hasProficiency', value: 'Armaduras Pesadas', negate: !has },
  ],
});

/**
 * Itens Gerais do suplemento Heróis de Arton - Tormenta 20
 */

// ==========================================
// EQUIPAMENTO DE AVENTURA
// ==========================================

export const HEROIS_ARTON_ADVENTURE_EQUIPMENT: Equipment[] = [
  {
    nome: 'Ábaco',
    descricao:
      'Para usar você precisa ser treinado em Conhecimento. Em testes de Ofício para sustento, você recebe TO em vez de T$; com Poder Monetário, o limite de TO que pode gastar por dia aumenta.',
    group: 'Item Geral',
    preco: 45,
    spaces: 1,
  },
  {
    nome: 'Ampulheta',
    descricao:
      'Ao escolher 10 num teste de Ofício (alquimista), você considera o resultado do d20 como um 12 automático.',
    group: 'Item Geral',
    preco: 45,
    spaces: 1,
  },
  {
    nome: 'Aparelho de chá',
    descricao:
      'Uma vez por cena, você recebe +1d4 em um teste de Diplomacia ou Enganação feito com alguém que esteja tomando chá com você.',
    group: 'Item Geral',
    preco: 30,
    spaces: 1,
  },
  {
    nome: 'Astrolábio',
    descricao:
      'Instrumento de navegação avançado, limitado a quem teve educação avançada. Você pode usar Conhecimento no lugar de Sobrevivência para orientar-se.',
    group: 'Item Geral',
    preco: 90,
    spaces: 1,
  },
  {
    nome: 'Armação para mochila',
    descricao:
      'Com uma armação, uma mochila de aventureiro passa a aumentar sua capacidade de carga em 6 espaços (em vez de 2). Em troca, a ação para sacar seus itens aumenta em um passo.',
    group: 'Item Geral',
    preco: 50,
    spaces: 0,
  },
  {
    nome: 'Asas do texugo',
    descricao:
      'Mochila com duas asas retráteis. Estendê-las custa uma ação de movimento; permitem um voo irregular, mas controlável.',
    group: 'Item Geral',
    preco: 200,
    spaces: 2,
  },
  {
    nome: 'Bainha adornada',
    descricao:
      'Permite usar armas como parte de um traje da corte, participando de bailes, festas e encontros da nobreza armado sem chamar atenção.',
    group: 'Item Geral',
    preco: 100,
    spaces: 1,
  },
  {
    nome: 'Bússola',
    descricao:
      'Aponta sempre para o norte. Ao fazer um teste de Sobrevivência para orientar-se, você rola dois dados e usa o melhor resultado.',
    group: 'Item Geral',
    preco: 45,
    spaces: 1,
  },
  {
    nome: 'Cinto de utilidades',
    descricao:
      'Se estiver vestindo um cinto de utilidades, você pode sacar e guardar engenhocas como uma ação livre.',
    group: 'Item Geral',
    preco: 50,
    spaces: 1,
  },
  {
    nome: 'Condecoração militar',
    descricao:
      'Não é comprada, é conquistada. Ostentando-a, no início de cada combate você recebe PV temporários iguais a 3x o patamar em que foi conquistada, cumulativos com outros itens e outras condecorações.',
    group: 'Item Geral',
    preco: 0,
    spaces: 1,
  },
  {
    nome: 'Dente falso',
    descricao:
      'Frasco disfarçado de dente. Carrega um preparado alquímico consumível ou poção sem ocupar espaço e permite ingeri-lo como ação de movimento. Quebra ao ser usado; só um por vez.',
    group: 'Item Geral',
    preco: 300,
    spaces: 0,
  },
  {
    nome: 'Diagrama anatômico',
    descricao:
      'Mostra as regiões mais vulneráveis dos corpos humanoides. Quando usa Ataque Furtivo, você recebe +1 na margem de ameaça.',
    group: 'Item Geral',
    preco: 75,
    spaces: 1,
  },
  {
    nome: 'Espelho refletor',
    descricao:
      'Ação de movimento para um teste de Ladinagem oposto a Reflexos de uma criatura em alcance curto; vencendo, ela fica desprevenida contra seu próximo ataque até o fim do seu próximo turno. Uma vez por cena.',
    group: 'Item Geral',
    preco: 45,
    spaces: 1,
  },
  {
    nome: 'Estetoscópio',
    descricao:
      'Ação padrão para um teste de Investigação para ajudar a si mesmo, aplicando o bônus a um teste de Cura, ou de Ladinagem para abrir fechadura ou sabotar, feito até o fim do seu próximo turno.',
    group: 'Item Geral',
    preco: 60,
    spaces: 1,
  },
  {
    nome: 'Estrepes (bolsa para 3m)',
    descricao:
      'Ação padrão para cobrir um quadrado de até 3m de lado adjacente a você. Causam 1d4 de dano de perfuração em quem pisar na área, e a criatura fica lenta até o fim do próximo turno dela.',
    group: 'Item Geral',
    preco: 5,
    spaces: 1,
  },
  {
    nome: 'Favor da pessoa amada',
    descricao:
      'Item pessoal sem valor monetário, dado espontaneamente por alguém querido. Fornece +2 PM, cumulativo com bônus de outros itens. Uma desavença ou decepção suspende o benefício.',
    sheetBonuses: [
      {
        source: { type: 'equipment', equipmentName: 'Favor da pessoa amada' },
        target: { type: 'PM' },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
    group: 'Item Geral',
    preco: 0,
    spaces: 1,
  },
  {
    nome: 'Lampião de foco',
    descricao:
      'Funciona como um lampião, mas com cobertura e espelhos que concentram a luz em um cone de 24m.',
    group: 'Item Geral',
    preco: 15,
    spaces: 1,
  },
  {
    nome: 'Leque',
    descricao:
      'Uma vez por cena, ao fazer um teste de Vontade, você pode se abanar para usar seu Carisma em vez de Sabedoria nesse teste.',
    group: 'Item Geral',
    preco: 3,
    spaces: 1,
  },
  {
    nome: 'Livro de métodos anti-Nimb',
    descricao:
      'Você pode gastar 1 minuto consultando o livro e 1 PM para substituir testes de Jogatina por testes de Conhecimento.',
    group: 'Item Geral',
    preco: 100,
    spaces: 1,
  },
  {
    nome: 'Lupa',
    descricao:
      'Ao fazer um teste de Investigação para procurar usando a lupa, você rola dois dados e usa o melhor resultado.',
    group: 'Item Geral',
    preco: 30,
    spaces: 1,
  },
  {
    nome: 'Mapa',
    descricao:
      'Mapa de uma região determinada pelo mestre. Fornece +5 em testes de Sobrevivência para orientar-se nessa região.',
    group: 'Item Geral',
    preco: 30,
    spaces: 1,
  },
  {
    nome: 'Mecanismo de mola',
    descricao:
      'Preso ao antebraço, guarda uma arma leve com a qualidade ocultável. Ao ativá-lo, você saca essa arma como ação livre e ela recebe a qualidade surpreendente nesse ataque.',
    group: 'Item Geral',
    preco: 25,
    spaces: 1,
  },
  {
    nome: 'Mochila discreta',
    descricao:
      'Tem um compartimento oculto para 1 espaço de itens. Eles contam na sua carga, mas você recebe +5 em testes de Ladinagem para ocultá-los. Deve ser vestida e não ocupa espaço de carga.',
    group: 'Item Geral',
    preco: 20,
    spaces: 1,
  },
  {
    nome: 'Prancheta',
    descricao:
      'Quem carrega uma prancheta é logo tomado por figura de autoridade. Você pode fazer testes de Nobreza para etiqueta mesmo sem ser treinado.',
    group: 'Item Geral',
    preco: 5,
    spaces: 1,
  },
  {
    nome: 'Sinete',
    descricao:
      'Reduz em –1 PM o custo de Autoridade Feudal, Favor e de outras habilidades em que seu símbolo pessoal tenha peso, a critério do mestre.',
    group: 'Item Geral',
    preco: 50,
    spaces: 1,
  },
];

// ==========================================
// FERRAMENTAS — GERAIS
// ==========================================

export const HEROIS_ARTON_TOOLS: Equipment[] = [
  {
    nome: 'Apito de caça',
    descricao:
      'Fornece +1 em Adestramento e permite usar manejar animal com um parceiro não inteligente (Int –4 ou –5) como ação livre, uma vez por rodada.',
    sheetBonuses: [
      {
        source: { type: 'equipment', equipmentName: 'Apito de caça' },
        target: { type: 'Skill', name: Skill.ADESTRAMENTO },
        modifier: { type: 'Fixed', value: 1 },
      },
    ],
    group: 'Item Geral',
    preco: 6,
    spaces: 1,
  },
  {
    nome: 'Baralho marcado',
    descricao:
      'Você recebe +2 em testes de Jogatina com cartas. Se rolar 1 natural num teste de Jogatina com este baralho, você é descoberto.',
    group: 'Item Geral',
    preco: 15,
    spaces: 1,
  },
  {
    nome: 'Espelho cirúrgico',
    descricao:
      'Usando um espelho cirúrgico, você não sofre a penalidade de –5 em testes de Cura em si mesmo.',
    group: 'Item Geral',
    preco: 12,
    spaces: 1,
  },
  {
    nome: 'Estandarte',
    descricao:
      'Precisa ser empunhado com uma mão. Enquanto você o empunha, seus capangas recebem +1 na Defesa e em rolagens de dano.',
    group: 'Item Geral',
    preco: 15,
    spaces: 1,
  },
  {
    nome: 'Estandarte portátil',
    descricao:
      'Igual ao estandarte, mas usado nas costas ou preso à sela, deixando as mãos livres. Nas costas impõe penalidade de armadura de –2; na montaria, conta como um item vestido dela.',
    group: 'Item Geral',
    preco: 20,
    spaces: 1,
  },
  {
    nome: 'Molde pré-fabricado',
    descricao:
      'Existe um molde para cada escola de magia. Usá-lo reduz para três dias o tempo de fabricação de uma engenhoca que simule uma magia daquela escola.',
    group: 'Item Geral',
    preco: 500,
    spaces: 1,
  },
];

// ==========================================
// FERRAMENTAS — INSTRUMENTOS MUSICAIS
// ==========================================

export const HEROIS_ARTON_MUSICAL_INSTRUMENTS: Equipment[] = [
  {
    nome: 'Clarim deheoni',
    descricao:
      'Criaturas a sua escolha sob efeito de sua Inspiração recebem +1 adicional em testes de resistência.',
    group: 'Item Geral',
    preco: 150,
    spaces: 1,
  },
  {
    nome: 'Cítara heptatônica',
    descricao:
      'Criaturas a sua escolha sob efeito de sua Inspiração recebem +2 na CD da primeira habilidade mágica que usarem.',
    group: 'Item Geral',
    preco: 250,
    spaces: 1,
  },
  {
    nome: 'Cornamusa de Doherimm',
    descricao:
      'É vestida, não empunhada (mas exige ao menos uma mão livre). Enquanto a veste, o custo de sua Inspiração é reduzido em –1 PM.',
    group: 'Item Geral',
    preco: 750,
    spaces: 2,
  },
  {
    nome: 'Flauta sar-allan',
    descricao:
      'Concede +5 no teste de Atuação para usar uma Música de bardo, mas apenas contra criaturas reptilianas (cobras, nagahs, medusas, trogs e outras a critério do mestre).',
    group: 'Item Geral',
    preco: 150,
    spaces: 1,
  },
  {
    nome: 'Gaita de foles',
    descricao:
      'Ao usar Inspiração, faça um teste de Atuação (CD 20 + PM gastos). Passando, o bônus da Inspiração aumenta em +1; falhando, a habilidade não tem efeito e os PM são gastos assim mesmo.',
    group: 'Item Geral',
    preco: 500,
    spaces: 1,
  },
  {
    nome: 'Lira de casco de tartaruga',
    descricao:
      'Suas Músicas e magias de bardo de cura recuperam +1 PV por dado de cura.',
    group: 'Item Geral',
    preco: 300,
    spaces: 1,
  },
  {
    nome: 'Marionetes',
    descricao:
      'Você recebe +2 no teste oposto de Atuação para usar Música: Balada Fascinante e Fascinar em Massa, e na CD dos poderes Manipular e Manipular em Massa.',
    group: 'Item Geral',
    preco: 90,
    spaces: 1,
  },
  {
    nome: 'Pandeiro das estradas',
    descricao:
      'Você pode gastar uma ação de movimento, em vez de padrão, para manter a concentração em uma Música de bardo que exija isso.',
    group: 'Item Geral',
    preco: 200,
    spaces: 1,
  },
  {
    nome: 'Tamborete marcial',
    descricao:
      'Criaturas a sua escolha sob efeito de sua Inspiração recebem +3m em deslocamento.',
    group: 'Item Geral',
    preco: 80,
    spaces: 1,
  },
  {
    nome: 'Trombeta tapistana',
    descricao:
      'Ao usar Inspiração, cada criatura a sua escolha sob efeito dela recebe uma ação de movimento extra no próximo turno.',
    group: 'Item Geral',
    preco: 300,
    spaces: 1,
  },
  {
    nome: 'Violino soprano',
    descricao:
      'Cada criatura a sua escolha sob efeito de sua Inspiração recebe +1d4 em seu próximo teste de perícia (exceto testes de ataque).',
    group: 'Item Geral',
    preco: 300,
    spaces: 1,
  },
];

// ==========================================
// VESTUÁRIO
// ==========================================

export const HEROIS_ARTON_CLOTHING: Equipment[] = [
  {
    nome: 'Avental de forja',
    descricao:
      'Usando um avental de forja, você pode perder 1d6 PV para receber +1 em um teste de Ofício (cumulativo com outros itens).',
    group: 'Vestuário',
    preco: 75,
    spaces: 1,
  },
  {
    nome: 'Camisolão',
    descricao:
      'Dormir com um camisolão e nenhum outro item vestido transforma condições de descanso confortáveis em luxuosas.',
    group: 'Vestuário',
    preco: 12,
    spaces: 1,
  },
  {
    nome: 'Capa com dragonas',
    descricao:
      'Enquanto você a veste, sua armadura conta como um traje da corte e pode ser usada em bailes, festas e encontros da nobreza sem chamar atenção.',
    group: 'Vestuário',
    preco: 50,
    spaces: 1,
  },
  {
    nome: 'Casaca de apetrechos',
    descricao:
      'Aumenta sua capacidade de carga em 4 espaços (e ela própria não gasta espaço). Por ser volumosa, impõe penalidade de armadura de –2 e não pode ser usada com armadura.',
    // Só a carga é automatizada: o alvo `ArmorPenalty` hoje é decorativo (não
    // chega às perícias), então cadastrá-lo mentiria sobre os números.
    sheetBonuses: [
      {
        source: { type: 'equipment', equipmentName: 'Casaca de apetrechos' },
        target: { type: 'MaxSpaces' },
        modifier: { type: 'Fixed', value: 4 },
      },
    ],
    group: 'Vestuário',
    preco: 75,
    spaces: 0,
  },
  {
    nome: 'Chapéu emplumado',
    descricao:
      'Na primeira rodada de um combate, você pode gastar uma ação de movimento para saudar seus inimigos e receber 1 PM temporário até o fim da cena.',
    group: 'Vestuário',
    preco: 50,
    spaces: 1,
  },
  {
    nome: 'Elmo leve',
    descricao:
      'Fornece fortificação 25%, mas impõe –2 em Iniciativa e Percepção. Com proficiência em armaduras pesadas, a penalidade é anulada.',
    sheetBonuses: [
      {
        source: { type: 'equipment', equipmentName: 'Elmo leve' },
        target: { type: 'Skill', name: Skill.INICIATIVA },
        modifier: { type: 'Fixed', value: -2 },
        condition: heavyArmorProficiency(false),
      },
      {
        source: { type: 'equipment', equipmentName: 'Elmo leve' },
        target: { type: 'Skill', name: Skill.PERCEPCAO },
        modifier: { type: 'Fixed', value: -2 },
        condition: heavyArmorProficiency(false),
      },
    ],
    group: 'Vestuário',
    preco: 15,
    spaces: 1,
  },
  {
    nome: 'Elmo pesado',
    descricao:
      'Fornece fortificação 50%, mas impõe –5 em Iniciativa e Percepção. Com proficiência em armaduras pesadas, a penalidade cai para –2.',
    // Dois conjuntos mutuamente exclusivos (–5 sem proficiência, –2 com), como
    // na Armadura sensual: só o `negate` muda, então nunca somam.
    sheetBonuses: [
      {
        source: { type: 'equipment', equipmentName: 'Elmo pesado' },
        target: { type: 'Skill', name: Skill.INICIATIVA },
        modifier: { type: 'Fixed', value: -5 },
        condition: heavyArmorProficiency(false),
      },
      {
        source: { type: 'equipment', equipmentName: 'Elmo pesado' },
        target: { type: 'Skill', name: Skill.PERCEPCAO },
        modifier: { type: 'Fixed', value: -5 },
        condition: heavyArmorProficiency(false),
      },
      {
        source: { type: 'equipment', equipmentName: 'Elmo pesado' },
        target: { type: 'Skill', name: Skill.INICIATIVA },
        modifier: { type: 'Fixed', value: -2 },
        condition: heavyArmorProficiency(true),
      },
      {
        source: { type: 'equipment', equipmentName: 'Elmo pesado' },
        target: { type: 'Skill', name: Skill.PERCEPCAO },
        modifier: { type: 'Fixed', value: -2 },
        condition: heavyArmorProficiency(true),
      },
    ],
    group: 'Vestuário',
    preco: 200,
    spaces: 1,
  },
  {
    nome: 'Jaqueta de couro',
    descricao:
      'Você recebe +1 em testes de Investigação para interrogar e gasta apenas metade do dinheiro (arredondado para cima) neles.',
    group: 'Vestuário',
    preco: 15,
    spaces: 1,
  },
  {
    nome: 'Luva de falcoaria',
    descricao:
      'Concede +2 em testes de Adestramento com pássaros e criaturas semelhantes, a critério do mestre.',
    group: 'Vestuário',
    preco: 15,
    spaces: 1,
  },
  {
    nome: 'Luva magnética',
    descricao:
      'A vítima de um teste de Ladinagem para punga sofre –5 no teste de Percepção para notar que foi vítima disso.',
    group: 'Vestuário',
    preco: 20,
    spaces: 1,
  },
  {
    nome: 'Máscara bucal',
    descricao:
      'Quem vê alguém de máscara bucal precisa passar num teste de Percepção (CD 25) para conseguir descrevê-lo mais tarde.',
    group: 'Vestuário',
    preco: 3,
    spaces: 1,
  },
  {
    nome: 'Máscara completa',
    descricao:
      'Escolha uma perícia baseada em Carisma de acordo com a forma da máscara: ela concede +1 em testes dessa perícia.',
    // A perícia é escolhida na compra: mesmo mecanismo da Coleção de livros.
    selectableBonus: {
      availableSkills: [
        Skill.ADESTRAMENTO,
        Skill.ATUACAO,
        Skill.DIPLOMACIA,
        Skill.ENGANACAO,
        Skill.INTIMIDACAO,
        Skill.JOGATINA,
      ],
      bonusValue: 1,
      pick: 1,
    },
    group: 'Vestuário',
    preco: 15,
    spaces: 1,
  },
  {
    nome: 'Máscara de baile',
    descricao:
      'Uma vez por cena, em um baile, festa ou situação apropriada, você pode colocar ou trocar de máscara para repetir um teste de Diplomacia ou Enganação.',
    group: 'Vestuário',
    preco: 25,
    spaces: 1,
  },
  {
    nome: 'Máscara de soldador',
    descricao:
      'Ao fazer um teste de Ofício, você pode fazer um teste de Percepção para ajudar a si mesmo e aplicar o bônus a esse teste.',
    group: 'Vestuário',
    preco: 50,
    spaces: 1,
  },
  {
    nome: 'Monóculo',
    descricao:
      'Quando você usa a habilidade Orgulho em um teste de Vontade, o bônus fornecido por ela aumenta em +2.',
    group: 'Vestuário',
    preco: 50,
    spaces: 1,
  },
  {
    nome: 'Óculos de aeronauta',
    descricao:
      'Fornece +1 em Pilotagem, cumulativo com outros bônus de itens. Usá-los sem ser aeronauta pode piorar a atitude de quem valoriza a profissão.',
    sheetBonuses: [
      {
        source: { type: 'equipment', equipmentName: 'Óculos de aeronauta' },
        target: { type: 'Skill', name: Skill.PILOTAGEM },
        modifier: { type: 'Fixed', value: 1 },
      },
    ],
    group: 'Vestuário',
    preco: 15,
    spaces: 1,
  },
  {
    nome: 'Palmar',
    descricao:
      'Usando palmares você não pode empunhar nada nas mãos. Em compensação, ao passar num teste de Atletismo para natação você avança seu deslocamento inteiro (em vez de metade).',
    group: 'Vestuário',
    preco: 12,
    spaces: 1,
  },
  {
    nome: 'Peruca',
    descricao:
      'Permite que um personagem com Carisma menor que 0 seja considerado com Carisma 0 para perícias baseadas nesse atributo (exceto Adestramento) durante uma cena. Depois precisa ser penteada e limpa.',
    group: 'Vestuário',
    preco: 20,
    spaces: 1,
  },
  {
    nome: 'Rondel',
    descricao:
      'Dois discos de aço rebitados na armadura. Aumentam o bônus na Defesa dela em +1 (cumulativo com outros itens), mas impõem –2 em testes de ataque. Com proficiência em armaduras pesadas, a penalidade é anulada.',
    sheetBonuses: [
      {
        source: { type: 'equipment', equipmentName: 'Rondel' },
        target: { type: 'Defense' },
        modifier: { type: 'Fixed', value: 1 },
      },
      {
        source: { type: 'equipment', equipmentName: 'Rondel' },
        target: { type: 'AllAttackBonus' },
        modifier: { type: 'Fixed', value: -2 },
        condition: heavyArmorProficiency(false),
      },
    ],
    group: 'Vestuário',
    preco: 150,
    spaces: 1,
  },
  {
    nome: 'Roupão elegante',
    descricao:
      'Você recebe +5 em testes de Diplomacia dentro de uma de suas estruturas (base, negócio ou domínio). Não funciona se você vestir algo que dê bônus em perícias de Força, Destreza ou Constituição.',
    group: 'Vestuário',
    preco: 150,
    spaces: 1,
  },
  {
    nome: 'Rufo',
    descricao:
      'Usado junto de um traje da corte, faz o traje passar a fornecer +1 em Diplomacia (cumulativo com os bônus do próprio traje).',
    group: 'Vestuário',
    preco: 25,
    spaces: 1,
  },
  {
    nome: 'Sapatos confortáveis',
    descricao:
      'Vestindo-os, você ignora o primeiro teste de Fortitude para marcha forçada. A critério do mestre, vale para outros testes de Fortitude semelhantes.',
    group: 'Vestuário',
    preco: 6,
    spaces: 1,
  },
  {
    nome: 'Sapatos de salto alto',
    descricao:
      'Seu deslocamento é reduzido em –1,5m e você falha automaticamente em testes de Fortitude para marcha forçada. Em troca, uma vez por cena, uma ação completa caminhando na frente de uma criatura permite usar o poder Atraente contra ela pelo resto da cena.',
    sheetBonuses: [
      {
        source: { type: 'equipment', equipmentName: 'Sapatos de salto alto' },
        target: { type: 'Displacement' },
        modifier: { type: 'Fixed', value: -1.5 },
      },
    ],
    group: 'Vestuário',
    preco: 18,
    spaces: 1,
  },
  {
    nome: 'Veste acolchoada',
    descricao:
      'Usada sob a armadura, aumenta a penalidade de armadura em –2, mas reduz em –1 o multiplicador de crítico de qualquer ataque sofrido (mínimo x2).',
    group: 'Vestuário',
    preco: 60,
    spaces: 1,
  },
];

// ==========================================
// ALQUÍMICOS — PREPARADOS
// ==========================================

export const HEROIS_ARTON_ALCHEMY_PREPARED: Equipment[] = [
  {
    nome: 'Ácido concentrado',
    descricao:
      'Como ácido, mas o alvo sofre 4d8 de dano de ácido e fica vulnerável até o fim da cena (Reflexos CD Des reduz à metade e evita a condição).',
    group: 'Alquimía',
    preco: 60,
    spaces: 0.5,
  },
  {
    nome: 'Analgésico',
    descricao:
      'Ação padrão. Role 2d4: esse é o máximo de PM que você pode gastar com essa dose, mascarando os sintomas dos ferimentos até o fim da cena.',
    group: 'Alquimía',
    preco: 60,
    spaces: 0.5,
  },
  {
    nome: 'Estalinho Gury',
    descricao:
      'Ação padrão para arremessar em alcance curto. Criaturas a até 3m sofrem 4d6 de dano de impacto e ficam surdas (Fortitude CD Des reduz à metade e evita a condição).',
    group: 'Alquimía',
    preco: 30,
    spaces: 0.5,
  },
  {
    nome: 'Extrato de gelo eterno',
    descricao:
      'Ação padrão contra uma criatura em alcance curto: 2d12 de dano de frio e lenta por 1 rodada (Reflexos CD Des reduz à metade e evita a condição).',
    group: 'Alquimía',
    preco: 60,
    spaces: 0.5,
  },
  {
    nome: 'Extrato de oxxdon',
    descricao:
      'Ação padrão para arremessar num quadrado de 1,5m em alcance curto. Objetos não mágicos de metal na área são destruídos e criaturas de metal ficam fatigadas, mesmo se imunes.',
    group: 'Alquimía',
    preco: 180,
    spaces: 0.5,
  },
  {
    nome: 'Frasco abissal',
    descricao:
      'Proibido no Reinado. Ação padrão para arremessar em alcance curto: criaturas a até 3m sofrem 6d6 de dano de fogo e ficam em chamas (Reflexos CD Des reduz à metade e evita a condição).',
    group: 'Alquimía',
    preco: 300,
    spaces: 0.5,
  },
  {
    nome: 'Pó de cinza',
    descricao:
      'Gastar uma dose fornece +5 em um teste de Ladinagem para abrir fechaduras ou sabotar, cumulativo com o bônus de outros itens.',
    group: 'Alquimía',
    preco: 5,
    spaces: 0.5,
  },
  {
    nome: 'Pó do aparecimento',
    descricao:
      'Ação padrão sobre um ponto em alcance curto: criaturas invisíveis a até 3m deixam de estar invisíveis e passam a ter apenas camuflagem leve. Remover o pó demora 1 minuto.',
    group: 'Alquimía',
    preco: 30,
    spaces: 0.5,
  },
  {
    nome: 'Visco persistente',
    descricao:
      'Ação padrão contra uma criatura em alcance curto: 4d4 de dano de ácido e enredada (Fortitude CD Des reduz à metade e evita a condição).',
    group: 'Alquimía',
    preco: 25,
    spaces: 0.5,
  },
];

// ==========================================
// ALQUÍMICOS — CATALISADORES
// ==========================================

export const HEROIS_ARTON_ALCHEMY_CATALYSTS: Equipment[] = [
  {
    nome: 'Cristal reflexivo',
    descricao:
      'Aparato. Ao lançar uma magia de adivinhação, você recebe +1 na Defesa pela duração da magia.',
    group: 'Alquimía',
    preco: 30,
    spaces: 0.5,
  },
  {
    nome: 'Essência fantasmal',
    descricao:
      'Aparato. A magia ignora 5 pontos da RD de todas as criaturas afetadas.',
    group: 'Alquimía',
    preco: 30,
    spaces: 0.5,
  },
  {
    nome: 'Noz saltadora',
    descricao:
      'Aparato. Após lançar a magia, você pode se teletransportar para qualquer espaço desocupado em 4,5m.',
    group: 'Alquimía',
    preco: 90,
    spaces: 0.5,
  },
  {
    nome: 'Presa de Hyninn',
    descricao:
      'Aparato. Você recebe 25% de chance de ignorar ataques e efeitos (incluindo de área) por 1 rodada.',
    group: 'Alquimía',
    preco: 45,
    spaces: 0.5,
  },
];

// ==========================================
// ALQUÍMICOS — VENENOS
// ==========================================

export const HEROIS_ARTON_ALCHEMY_POISONS: Equipment[] = [
  {
    nome: 'Bolor hemorrágico',
    descricao:
      'Veneno de contato. A vítima fica sangrando e a CD para remover essa condição aumenta em +5.',
    group: 'Alquimía',
    preco: 60,
    spaces: 0.5,
  },
  {
    nome: 'Fumaça onírica',
    descricao:
      'Veneno de inalação, resistido com Vontade. A vítima fica fascinada por 3 rodadas, apenas uma vez por cena (ofuscada por 1 rodada).',
    group: 'Alquimía',
    preco: 150,
    spaces: 0.5,
  },
  {
    nome: 'Gás moroso',
    descricao:
      'Veneno de inalação. A vítima fica vulnerável (vulnerável por 1 rodada).',
    group: 'Alquimía',
    preco: 60,
    spaces: 0.5,
  },
  {
    nome: 'Seiva necrótica',
    descricao:
      'Veneno de contato. Perde 2d6 PV por rodada durante 3 rodadas. PV perdidos assim só podem ser recuperados com efeitos mágicos de luz.',
    group: 'Alquimía',
    preco: 120,
    spaces: 0.5,
  },
];

// ==========================================
// ALIMENTAÇÃO — BEBIDAS
// ==========================================

export const HEROIS_ARTON_FOOD: Equipment[] = [
  {
    nome: 'Baba de troll',
    descricao:
      'Bebida sem álcool, à base de leite, castanhas, nozes e mel. Fornece +1d4 em um teste a sua escolha até o fim do dia. Não exige teste de Fortitude.',
    group: 'Alimentação',
    preco: 30,
    spaces: 0.5,
  },
  {
    nome: 'Barba queimada',
    descricao: 'Cerveja anã forte e amarga. Fornece redução de dano 2. CD 20.',
    group: 'Alimentação',
    preco: 45,
    spaces: 0.5,
  },
  {
    nome: 'Cerveja deheoni',
    descricao:
      'A bebida mais comum nas tavernas do Reinado. Fornece +1 em testes de resistência. CD 15.',
    group: 'Alimentação',
    preco: 15,
    spaces: 0.5,
  },
  {
    nome: 'Dilínio',
    descricao:
      'Destilado raríssimo de Mortenstenn. Seu limite de gasto de PM aumenta em +1. CD 20. Não é possível fabricar este item.',
    group: 'Alimentação',
    preco: 600,
    spaces: 0.5,
  },
  {
    nome: 'Grogue negro',
    descricao: 'Rum com especiarias, criado por piratas do Conclave.',
    group: 'Alimentação',
    preco: 15,
    spaces: 0.5,
  },
  {
    nome: 'Grogue rubro',
    descricao:
      'Variação do grogue negro, com especiarias picantes — e certa inclinação para a violência em quem bebe.',
    group: 'Alimentação',
    preco: 45,
    spaces: 0.5,
  },
  {
    nome: 'Hidromel uivante',
    descricao:
      'Fabricada nas montanhas geladas. Fornece +2 em rolagens de dano corpo a corpo. CD 20.',
    group: 'Alimentação',
    preco: 21,
    spaces: 0.5,
  },
  {
    nome: 'Licor feérico',
    descricao:
      'Escolha uma habilidade: o custo para ativá-la diminui em –1 PM.',
    group: 'Alimentação',
    preco: 450,
    spaces: 0.5,
  },
  {
    nome: 'Sidra ahleniense',
    descricao:
      'Bebida doce que deixa qualquer um mais falante, fornecendo +2 em testes de perícias originalmente baseadas em Carisma.',
    group: 'Alimentação',
    preco: 45,
    spaces: 0.5,
  },
  {
    nome: 'Vinho Pruss',
    descricao:
      'Favorito do antigo Rei-Imperador Thormy. Fornece 3 PM temporários. CD 15.',
    group: 'Alimentação',
    preco: 60,
    spaces: 0.5,
  },
  {
    nome: 'Vinho élfico',
    descricao:
      'De sabor complexo, aguça a mente: fornece +1 na CD para resistir a suas habilidades. CD 20.',
    group: 'Alimentação',
    preco: 90,
    spaces: 0.5,
  },
];

// ==========================================
// ESOTÉRICOS
// ==========================================

export const HEROIS_ARTON_ESOTERIC: Equipment[] = [
  {
    nome: 'Compasso místico',
    descricao:
      'Aparato. Ao lançar uma magia com efeito em área, você pode excluir um alvo da área afetada.',
    group: 'Esotérico',
    preco: 600,
    spaces: 1,
  },
  {
    nome: 'Flauta convocadora',
    descricao:
      'Aparato. Ao lançar uma magia que conjura capangas, você conjura um capanga adicional do mesmo tipo.',
    group: 'Esotérico',
    preco: 300,
    spaces: 1,
  },
  {
    nome: 'Mandala onírica',
    descricao:
      'Aparato. Quando ao menos um inimigo falha no teste de Vontade de uma de suas magias, você recebe 1 PM temporário (limitado pelo total de PM gasto na magia).',
    group: 'Esotérico',
    preco: 300,
    spaces: 1,
  },
  {
    nome: 'Varinha armamentista',
    descricao:
      'Aparato. Aumenta em +2 o bônus de dano fornecido pelo poder Arcano de Batalha.',
    group: 'Esotérico',
    preco: 600,
    spaces: 1,
  },
];

// ==========================================
// ANIMAIS
// ==========================================

export const HEROIS_ARTON_ANIMALS: Equipment[] = [
  {
    nome: 'Armadura de montaria leve',
    descricao:
      'Vestida pela montaria. Aumenta um bônus numérico fornecido por ela em +1 (se fixo) ou em um passo (se rolado).',
    group: 'Animal',
    preco: 600,
    spaces: 2,
  },
  {
    nome: 'Armadura de montaria pesada',
    descricao:
      'Como a leve, mas aumenta o bônus em +2 ou dois passos. Em troca, diminui o deslocamento da montaria em –3m. Montarias voadoras não podem usá-la.',
    group: 'Animal',
    preco: 3000,
    spaces: 5,
  },
  {
    nome: 'Arreios namalkahnianos',
    descricao:
      'Contam como item vestido do animal. Aumentam em +3m o deslocamento de um veículo de tração animal.',
    group: 'Animal',
    preco: 50,
    spaces: 1,
  },
  {
    nome: 'Caparazão',
    descricao:
      'Cobertura de tecido decorado para montarias. Uma montaria com caparazão fornece +1 em Diplomacia e Intimidação, além de seus benefícios usuais.',
    group: 'Animal',
    preco: 75,
    spaces: 1,
  },
  {
    nome: 'Estribos',
    descricao:
      'Vestidos pela montaria. Ao fazer uma investida montada, você causa +1d8 pontos de dano.',
    group: 'Animal',
    preco: 60,
    spaces: 1,
  },
  {
    nome: 'Ornamento',
    descricao:
      'Uma vez por cena, montado e treinado em Cavalgar, você pode se exibir com sua montaria para receber +1d4 em um teste de perícia baseada em Carisma.',
    group: 'Animal',
    preco: 50,
    spaces: 1,
  },
];

// ==========================================
// VEÍCULOS
// ==========================================

export const HEROIS_ARTON_VEHICLES: Equipment[] = [
  {
    nome: 'Barcaça',
    descricao:
      'Navio de um mastro com remos, para rios e mar aberto. Requer piloto e 10 tripulantes. Tamanho Enorme, natação 6m, Defesa 10 (+ Des do piloto), 120 PV, RD 5; carrega 15 criaturas Médias ou 300 espaços.',
    group: 'Veículo',
    preco: 3000,
    spaces: 0,
  },
  {
    nome: 'Biga de guerra',
    descricao:
      'Carroça blindada de duas rodas puxada por dois cavalos, com o piloto de pé e uma mão livre. Conduzindo-a, você pode fazer investidas como se estivesse montado.',
    group: 'Veículo',
    preco: 250,
    spaces: 0,
  },
  {
    nome: 'Dirigível goblin',
    descricao:
      'Versão maior e mais robusta do balão goblin, com gôndola alongada que facilita equipar armas como balestras.',
    group: 'Veículo',
    preco: 1200,
    spaces: 0,
  },
  {
    nome: 'Jangada',
    descricao:
      'Plataforma flutuante com mastro simples e leme. Requer piloto e um tripulante. Tamanho Grande, natação 9m, Defesa 6 (+ Des do piloto), 50 PV, RD 5; carrega 4 criaturas Médias ou 80 espaços.',
    group: 'Veículo',
    preco: 60,
    spaces: 0,
  },
  {
    nome: 'Veleiro',
    descricao:
      'Navio de três mastros, típico de viagem e comércio. Requer piloto, navegador, capitão e 30 tripulantes. Tamanho Colossal, natação 12m, 220 PV, RD 5; carrega 60 criaturas Médias ou 1.200 espaços.',
    group: 'Veículo',
    preco: 10000,
    spaces: 0,
  },
];
