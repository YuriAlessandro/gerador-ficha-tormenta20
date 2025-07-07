import _ from 'lodash';
import { ClassDescription } from '../../interfaces/Class';
import { RequirementType } from '../../interfaces/Poderes';
import Skill from '../../interfaces/Skills';
import { Atributo } from '../atributos';
import { standardFaithProbability } from '../divindades';
import PROFICIENCIAS from '../proficiencias';

const CLERIGO: ClassDescription = {
  name: 'Clérigo',
  pv: 16,
  addpv: 4,
  pm: 5,
  addpm: 5,
  periciasbasicas: [
    {
      type: 'and',
      list: [Skill.RELIGIAO, Skill.VONTADE],
    },
  ],
  periciasrestantes: {
    qtd: 2,
    list: [
      Skill.CONHECIMENTO,
      Skill.CURA,
      Skill.DIPLOMACIA,
      Skill.FORTITUDE,
      Skill.INICIATIVA,
      Skill.INTUICAO,
      Skill.LUTA,
      Skill.MISTICISMO,
      Skill.NOBREZA,
      Skill.OFICIO,
      Skill.PERCEPCAO,
    ],
  },
  proficiencias: [
    PROFICIENCIAS.SIMPLES,
    PROFICIENCIAS.LEVES,
    PROFICIENCIAS.ESCUDOS,
  ],
  abilities: [
    {
      name: 'Devoto Fiel',
      text: 'Você se torna devoto de um deus maior. Veja as regras de devotos na página 96. Ao contrário de devotos normais, você recebe dois poderes concedidos por se tornar devoto, em vez de apenas um. Como alternativa, você pode cultuar o Panteão como um todo. Não recebe nenhum Poder Concedido, mas sua única obrigação e restrição é não usar armas cortantes ou perfurantes (porque derramam sangue, algo que clérigos do Panteão consideram proibido). Sua arma preferida é a maça e você pode canalizar energia positiva ou negativa a sua escolha (uma vez feita, essa escolha não pode ser mudada). Cultuar o Panteão conta como sua devoção.',
      nivel: 1,
    },
    {
      name: 'Magias',
      text: 'Você pode lançar magias divinas de 1º círculo. A cada quatro níveis, pode lançar magias de um círculo maior (2º círculo no 5º nível, 3º círculo no 9º nível e assim por diante). Você começa com três magias de 1º círculo. A cada nível, aprende uma magia de qualquer círculo que possa lançar. Seu atributo-chave para lançar magias é Sabedoria e você soma sua Sabedoria no seu total de PM. Veja o Capítulo 4 para as regras de magia.',
      nivel: 1,
      sheetBonuses: [
        {
          source: {
            type: 'power',
            name: 'Magias',
          },
          target: {
            type: 'PM',
          },
          modifier: {
            type: 'Attribute',
            attribute: Atributo.SABEDORIA,
          },
        },
      ],
    },
    {
      name: 'Mão da Divindade',
      text: 'No 20º nível, você pode gastar uma ação completa e 15 PM para canalizar energia divina. Ao fazer isso, você lança três magias divinas quaisquer (de qualquer círculo, incluindo magias que você não conhece), como uma ação livre e sem gastar PM (mas ainda precisa pagar outros custos). Você pode aplicar aprimoramentos, mas precisa pagar por eles. Após usar esta habilidade, você fica atordoado por 1d4 rodadas (mesmo se for imune a esta condição). Corpos mortais não foram feitos para lidar com tanto poder.',
      nivel: 20,
    },
  ],
  powers: [
    {
      name: 'Abençoar Arma',
      text: 'Você se torna proficiente na arma preferida de sua divindade. Se estiver empunhando essa arma, pode gastar uma ação de movimento e 3 PM para infundi-la com poder divino. Até o final da cena, a arma é considerada mágica e emite luz dourada ou púrpura (como uma tocha). Além disso, o dano da arma aumenta em um passo e você pode usar sua Sabedoria em testes de ataque e rolagens de dano com ela, em vez do atributo padrão (não cumulativo com efeitos que somam este atributo).',
      requirements: [],
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
      name: 'Autoridade Eclesiástica',
      text: 'Você possui uma posição formal em uma igreja reconhecida pelos outros membros de sua fé. Os efeitos deste poder variam de acordo com a igreja e o deus — clérigos de Khalmyr, por exemplo, possuem autoridade como juízes no Reinado — e ficam a cargo do mestre. Como regra geral, você recebe +5 em testes de Diplomacia ou Intimidação ao lidar com devotos de sua divindade e paga metade do preço de itens alquímicos, poções e serviços em templos de sua divindade.',
      requirements: [[{ type: RequirementType.NIVEL, value: 5 }]],
    },
    {
      name: 'Canalizar Energia Positiva/Negativa',
      text: 'Você pode gastar uma ação padrão e PM para liberar uma onda de luz (se sua divindade canaliza energia positiva) ou trevas (se canaliza energia negativa) que afeta criaturas a sua escolha em alcance curto. Para cada PM que gastar, luz cura 1d6 PV em criaturas vivas e causa 1d6 pontos de dano de luz em mortos-vivos (Vontade CD Sab reduz o dano à metade). Trevas tem o efeito inverso — causa dano de trevas a criaturas vivas e cura mortos-vivos.',
      requirements: [],
    },
    {
      name: 'Canalizar Amplo',
      text: 'Quando você usa a habilidade Canalizar Energia, pode gastar +2 PM para aumentar o alcance dela para médio.',
      requirements: [
        [
          {
            type: RequirementType.PODER,
            name: 'Canalizar Energia Positiva/Negativa',
          },
        ],
      ],
    },
    {
      name: 'Comunhão Vital',
      text: 'Quando lança uma magia que cure uma criatura, você pode pagar +2 PM para que outra criatura em alcance curto (incluindo você mesmo) recupere uma quantidade de pontos de vida igual à metade dos PV da cura original.',
      requirements: [],
    },
    {
      name: 'Conhecimento Mágico',
      text: 'Você aprende duas magias divinas de qualquer círculo que possa lançar. Você pode escolher este poder quantas vezes quiser.',
      requirements: [],
      canRepeat: true,
      sheetActions: [
        {
          source: {
            type: 'power',
            name: 'Conhecimento Mágico',
          },
          action: {
            type: 'learnAnySpellFromHighestCircle',
            allowedType: 'Divine',
            pick: 2,
          },
        },
      ],
    },
    {
      name: 'Expulsar/Comandar Mortos-Vivos',
      text: 'Você pode gastar uma ação padrão e 3 PM para expulsar (se sua divindade canaliza energia positiva) ou comandar (se canaliza energia negativa) todos os mortos-vivos em alcance curto. Mortos-vivos expulsos ficam apavorados por 1d6 rodadas. Mortos-vivos comandados não inteligentes (Int –4 ou menor) ficam sob suas ordens por um dia (até um limite de ND somados igual a seu nível +3; dar uma ordem a todos eles é uma ação de movimento) e mortos-vivos comandados inteligentes ficam fascinados por uma rodada. Mortos-vivos têm direito a um teste de Vontade (CD Sab) para evitar qualquer destes efeitos.',
      requirements: [
        [
          {
            type: RequirementType.PODER,
            name: 'Canalizar Energia Positiva/Negativa',
          },
        ],
      ],
    },
    {
      name: 'Liturgia Mágica',
      text: 'Você pode gastar uma ação de movimento para executar uma breve liturgia de sua fé. Se fizer isso, a CD para resistir à sua próxima habilidade de clérigo (desde que usada até o final de seu próximo turno) aumenta em +2.',
      requirements: [],
    },
    {
      name: 'Magia Sagrada/Profana',
      text: 'Quando lança uma magia divina que causa dano, você pode gastar +1 PM. Se fizer isso, muda o tipo de dano da magia para luz (se sua divindade canaliza energia positiva) ou trevas (se canaliza energia negativa).',
      requirements: [],
    },
    {
      name: 'Mestre Celebrante',
      text: 'O número de pessoas que você afeta com uma missa aumenta em dez vezes e os benefícios que elas recebem dobram.',
      requirements: [
        [{ type: RequirementType.PODER, name: 'Missa: Bênção da Vida' }],
        [{ type: RequirementType.PODER, name: 'Missa: Chamado às Armas' }],
        [{ type: RequirementType.PODER, name: 'Missa: Elevação do Espírito' }],
        [{ type: RequirementType.PODER, name: 'Missa: Escudo Divino' }],
        [{ type: RequirementType.PODER, name: 'Missa: Superar as Limitações' }],
      ],
    },
    {
      name: 'Missa: Bênção da Vida',
      text: 'Os participantes recebem pontos de vida temporários em um valor igual ao seu nível + sua Sabedoria.',
      requirements: [],
    },
    {
      name: 'Missa: Chamado às Armas',
      text: 'Os participantes recebem +1 em testes de ataque e rolagens de dano.',
      requirements: [],
    },
    {
      name: 'Missa: Elevação do Espírito',
      text: 'Os participantes recebem pontos de mana temporários em um valor igual a sua Sabedoria.',
      requirements: [],
    },
    {
      name: 'Missa: Escudo Divino',
      text: 'Os participantes recebem +1 na Defesa e testes de resistência.',
      requirements: [],
    },
    {
      name: 'Missa: Superar as Limitações',
      text: 'Cada participante recebe +1d6 num único teste a sua escolha e pode usá-lo mesmo após rolar o dado.',
      requirements: [],
    },
    {
      name: 'Prece de Combate',
      text: 'Quando lança uma magia divina com tempo de conjuração de uma ação padrão em si mesmo, você pode gastar +2 PM para lançá-la como uma ação de movimento.',
      requirements: [],
    },
    {
      name: 'Símbolo Sagrado Abençoado',
      text: 'Você pode gastar uma ação de movimento e 1 PM para fazer uma prece e energizar seu símbolo sagrado até o fim da cena. Um símbolo sagrado energizado emite uma luz dourada ou prateada (se sua divindade canaliza energia positiva) ou púrpura ou avermelhada (se canaliza energia negativa) que ilumina como uma tocha. Enquanto você estiver empunhando um símbolo sagrado energizado, o custo em PM para lançar suas magias divinas diminui em 1.',
      requirements: [],
    },
  ],
  probDevoto: 0.95,
  qtdPoderesConcedidos: 'all',
  faithProbability: standardFaithProbability,
  attrPriority: [Atributo.SABEDORIA],
  setup: (classe) => {
    const modifiedClasse = _.cloneDeep(classe);
    modifiedClasse.spellPath = {
      initialSpells: 3,
      spellType: 'Divine',
      qtySpellsLearnAtLevel: () => 1,
      spellCircleAvailableAtLevel: (level) => {
        if (level < 5) return 1;
        if (level < 9) return 2;
        if (level < 13) return 3;
        if (level < 17) return 4;
        return 5;
      },
      keyAttribute: Atributo.SABEDORIA,
    };

    return modifiedClasse;
  },
};

export default CLERIGO;
