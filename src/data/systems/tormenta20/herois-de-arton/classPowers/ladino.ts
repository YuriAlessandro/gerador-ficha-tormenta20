import { ClassPower } from '../../../../../interfaces/Class';
import { RequirementType } from '../../../../../interfaces/Poderes';
import Skill from '../../../../../interfaces/Skills';

const LADINO_POWERS: ClassPower[] = [
  {
    name: 'Ameaça Brutal',
    text: 'Se fizer um teste de Intimidação para assustar uma criatura na qual tenha causado dano desde a última rodada, você recebe +5 no teste e ela fica apavorada se você passar por 5 ou mais (em vez de 10 ou mais).',
    requirements: [],
  },
  {
    name: 'Assassino em Série',
    text: 'Você pode gastar 2 PM para usar Ataque Furtivo uma segunda vez na rodada.',
    requirements: [[{ type: RequirementType.NIVEL, value: 11 }]],
  },
  {
    name: 'Ataque Furtivo Letal',
    text: 'Quando você faz um ataque furtivo, sempre que rolar o resultado máximo ou um ponto abaixo em um dado da habilidade (por exemplo, um 5 ou 6 ao rolar 1d6), role um dado extra.',
    requirements: [[{ type: RequirementType.NIVEL, value: 5 }]],
  },
  {
    name: 'Bombardeiro Furtivo',
    text: 'Você pode usar Ataque Furtivo ao utilizar preparados alquímicos de dano.',
    requirements: [
      [{ type: RequirementType.PERICIA, name: 'Ofício (alquimista)' }],
    ],
  },
  {
    name: 'Chefe de Gangue',
    text: 'Seus capangas podem usar Ataque Furtivo +1d6 e Evasão, e podem fazer testes de Reflexos usando o seu valor nessa perícia.',
    requirements: [[{ type: RequirementType.NIVEL, value: 5 }]],
  },
  {
    name: 'Conhecimento Anatômico',
    text: 'Contra humanoides, os dados do seu Ataque Furtivo aumentam em um passo.',
    requirements: [[{ type: RequirementType.PERICIA, name: 'Cura' }]],
  },
  {
    name: 'Enganar os Olhos',
    text: 'Quando você faz um teste de Acrobacia para passar por inimigo, a criatura o considera invisível por 1 rodada (Reflexos CD Des evita).',
    requirements: [],
  },
  {
    name: 'Finta Acrobática',
    text: 'Você soma sua Destreza em testes de Enganação para fintar.',
    requirements: [
      [
        { type: RequirementType.PERICIA, name: 'Acrobacia' },
        { type: RequirementType.PERICIA, name: 'Enganação' },
      ],
    ],
  },
  {
    name: 'Improvisação Arcana',
    text: 'Quando passa em um teste de Misticismo para lançar uma magia arcana que não conhece de um pergaminho, para cada 2 pontos pelos quais seu teste superar a CD, você pode gastar 1 PM em aprimoramentos da magia.',
    requirements: [[{ type: RequirementType.PERICIA, name: 'Misticismo' }]],
  },
  {
    name: 'Investida Rasteira',
    text: 'Se você acertar um ataque corpo a corpo contra uma criatura que sofreu uma investida desde a última rodada, ela fica desprevenida por 1 rodada e caída (Reflexos CD Des evita).',
    requirements: [],
  },
  {
    name: 'Mestre Assassino',
    text: 'Quando usa Assassinar, você pode gastar +2 PM para: usar esse poder como uma ação livre; rolar dois dados no teste de ataque contra a criatura analisada e usar o melhor resultado; ignorar a imunidade a acertos críticos da criatura analisada. Você pode usar quantos desses modificadores quiser (desde que pague por eles!).',
    requirements: [
      [
        { type: RequirementType.PERICIA, name: 'Cura' },
        { type: RequirementType.PERICIA, name: 'Percepção' },
        { type: RequirementType.PODER, name: 'Assassinar' },
        { type: RequirementType.PODER, name: 'Ataque Furtivo Letal' },
        { type: RequirementType.NIVEL, value: 11 },
      ],
    ],
  },
  {
    name: 'Mestre Envenenador',
    text: 'Quando afeta uma criatura com um veneno, você pode gastar +2 PM para: aumentar quaisquer efeitos do veneno em mais um dado do mesmo tipo; aumentar a CD para resistir ao veneno em +5; ignorar a imunidade a venenos da criatura. Você pode usar quantos desses modificadores quiser.',
    requirements: [
      [
        { type: RequirementType.PERICIA, name: 'Cura' },
        { type: RequirementType.PODER, name: 'Veneno Persistente' },
        { type: RequirementType.NIVEL, value: 11 },
      ],
    ],
  },
  {
    name: 'Papo Furado',
    text: 'Quando você passa em um teste de Diplomacia contra uma criatura, se passar também em um teste de Enganação contra ela até o fim do seu próximo turno, a atitude da criatura em relação a você melhora em uma categoria.',
    requirements: [
      [
        { type: RequirementType.PERICIA, name: 'Diplomacia' },
        { type: RequirementType.PERICIA, name: 'Enganação' },
      ],
    ],
  },
  {
    name: 'Precisão Furtiva',
    text: 'O alcance do seu Ataque Furtivo aumenta em uma categoria (de curto para médio e de médio para longo). Além disso, quando você ataca uma criatura desprevenida ou que você esteja flanqueando, sua margem de ameaça aumenta em +2.',
    requirements: [
      [
        { type: RequirementType.PERICIA, name: 'Pontaria' },
        { type: RequirementType.PODER, name: 'Ataque Furtivo' },
      ],
    ],
  },
  {
    name: 'Rei do Crime',
    text: 'Você é uma lenda dos becos e das tavernas, e todos querem lhe servir para ter uma chance de progredir no submundo. Uma vez por cena, você pode gastar 6 PM para invocar 2d4+2 assassinos capangas em espaços desocupados em alcance curto. Os assassinos possuem deslocamento 9m, Defesa 17, dano 1d6+5 de corte cada e Ataque Furtivo +4d6. Uma vez por rodada, quando você é alvo de um efeito, pode sacrificar um capanga adjacente para ignorar o efeito.',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Chefe de Gangue' },
        { type: RequirementType.PODER, name: 'Contatos no Submundo' },
        { type: RequirementType.PODER, name: 'Mente Criminosa' },
        { type: RequirementType.NIVEL, value: 17 },
      ],
    ],
  },
  {
    name: 'Sabotagem Corrosiva',
    text: 'Quando faz um teste de Ladinagem para abrir fechaduras ou sabotar, você pode gastar um ácido para receber um bônus de +5 nesse teste. Além disso, pode gastar uma ação de movimento e um ácido para fazer um teste de Ladinagem oposto ao teste de Reflexos de uma criatura em alcance curto. Se você vencer o teste oposto, a criatura fica desprevenida e sofre –5 em testes de ataque por 1 rodada.',
    requirements: [],
  },
  {
    name: 'Senhor do Submundo',
    text: 'Você é uma figura sombria e sua mera presença incita medo e respeito. Você recebe +5 em Intimidação e imunidade a medo. Além disso, quando você fica adjacente a outra criatura (independente de quem tenha se movido), você pode deixá-la apavorada e desprevenida por 1 rodada. Uma mesma criatura só pode ser afetada por este poder uma vez por cena.',
    requirements: [
      [
        { type: RequirementType.PERICIA, name: 'Intimidação' },
        { type: RequirementType.NIVEL, value: 17 },
      ],
    ],
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Senhor do Submundo' },
        target: { type: 'Skill', name: Skill.INTIMIDACAO },
        modifier: { type: 'Fixed', value: 5 },
      },
    ],
  },
  {
    name: 'Truque de Palco',
    text: 'Escolha três magias arcanas de 1º círculo que possuam o aprimoramento truque. Você aprende e pode lançar essas magias (atributo-chave Inteligência), mas apenas com esse aprimoramento. Esta não é uma habilidade mágica — os efeitos provêm de prestidigitação.',
    requirements: [[{ type: RequirementType.PERICIA, name: 'Atuação' }]],
  },
  {
    name: 'Truque do Chapéu',
    text: 'Uma vez por rodada, você pode gastar uma ação de movimento para tirar e arremessar um item que esteja vestindo em uma criatura em alcance curto. Se fizer isso, você pode fazer um ataque com uma arma de arremesso, ou arremessar um preparado alquímico ou poção contra ela como parte dessa ação.',
    requirements: [[{ type: RequirementType.PERICIA, name: 'Enganação' }]],
  },
  {
    name: 'Vestido Para a Ocasião',
    text: 'Se estiver usando um traje da corte ou de viajante, você pode gastar uma ação completa e 1 PM para transformar esse item em outro item de vestuário mundano até o fim da cena. Isso fornece +5 em testes de Enganação para disfarce, além dos benefícios do novo item.',
    requirements: [[{ type: RequirementType.PERICIA, name: 'Enganação' }]],
  },
];

export default LADINO_POWERS;
