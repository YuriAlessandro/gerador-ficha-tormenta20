import _ from 'lodash';
import { getRandomItemFromArray } from '../../functions/randomUtils';
import {
  ClassDescription,
  ClassAbility,
  SpellPath,
} from '../../interfaces/Class';
import { RequirementType } from '../../interfaces/Poderes';
import Skill from '../../interfaces/Skills';
import { Atributo } from '../atributos';
import PROFICIENCIAS from '../proficiencias';
import tormentaPowers from '../powers/tormentaPowers';
import { spellsCircle1 } from '../magias/generalSpells';

type ArcanistaSubtypes = 'Bruxo' | 'Mago' | 'Feiticeiro';
const allArcanistaSubtypes: ArcanistaSubtypes[] = [
  'Bruxo',
  'Mago',
  'Feiticeiro',
];

const spellPaths: Record<ArcanistaSubtypes, SpellPath> = {
  Bruxo: {
    initialSpells: 3,
    spellType: 'Arcane',
    qtySpellsLearnAtLevel: (level: number) => {
      if (level === 1) return 0;
      return 1;
    },
    spellCircleAvailableAtLevel: (level) => {
      if (level < 5) return 1;
      if (level < 9) return 2;
      if (level < 13) return 3;
      if (level < 17) return 4;
      return 5;
    },
    keyAttribute: Atributo.INTELIGENCIA,
  },
  Mago: {
    initialSpells: 4,
    spellType: 'Arcane',
    qtySpellsLearnAtLevel: (level) => ([5, 9, 13, 17].includes(level) ? 2 : 1),
    spellCircleAvailableAtLevel: (level) => {
      if (level < 5) return 1;
      if (level < 9) return 2;
      if (level < 13) return 3;
      if (level < 17) return 4;
      return 5;
    },
    keyAttribute: Atributo.INTELIGENCIA,
  },
  Feiticeiro: {
    initialSpells: 3,
    spellType: 'Arcane',
    qtySpellsLearnAtLevel: (level) => (level % 2 === 1 ? 1 : 0),
    spellCircleAvailableAtLevel: (level) => {
      if (level < 5) return 1;
      if (level < 9) return 2;
      if (level < 13) return 3;
      if (level < 17) return 4;
      return 5;
    },
    keyAttribute: Atributo.CARISMA,
  },
};

const classAbilities: Record<ArcanistaSubtypes, ClassAbility> = {
  Bruxo: {
    name: 'Caminho do Arcanista',
    text: 'A magia é um poder incrível, capaz de alterar a realidade. Esse poder tem fontes distintas e cada uma opera conforme suas próprias regras. Você é um bruxo, capaz de lançar magias através de um foco como uma varinha, cajado, chapéu, etc.',
    nivel: 1,
  },
  Mago: {
    name: 'Caminho do Arcanista',
    text: 'A magia é um poder incrível, capaz de alterar a realidade. Esse poder tem fontes distintas e cada uma opera conforme suas próprias regras. Você é um mago, capaz de lançar magia através de todo o seu estudo mágico. Seu livro de magias contém todas as suas magias, e a cada dia você pode preparar até metade de suas magias para usar durante o dia.',
    nivel: 1,
  },
  Feiticeiro: {
    name: 'Caminho do Arcanista',
    text: 'A magia é um poder incrível, capaz de alterar a realidade. Esse poder tem fontes distintas e cada uma opera conforme suas próprias regras. Você é um feiticeiro, capaz de lançar magias atráves de um poder inato que corre no seu sangue.',
    nivel: 1,
  },
};

const feiticeiroPaths: ClassAbility[] = [
  {
    name: 'Linhagem Dracônica',
    text: 'Um de seus antepassados foi um majestoso dragão. Escolha um tipo de dano entre ácido, eletricidade, fogo ou frio. Básica: Você soma seu modificador de Carisma em seus pontos de vida iniciais e recebe resistência ao tipo de dano escolhido 5',
    nivel: 1,
    // Tipo do dano está sendo escolhido no setup
    sheetBonuses: [
      {
        source: {
          type: 'power',
          name: 'Linhagem Dracônica',
        },
        target: { type: 'PV' },
        modifier: { type: 'Attribute', attribute: Atributo.CARISMA },
      },
    ],
  },
  {
    name: 'Linhagem Feérica',
    text: 'Seu sangue foi tocado pelas fadas. Básica: Você se torna treinado em Enganação e aprende uma magia de 1º círculo de encantamento ou ilusão, arcana ou divina, a sua escolha.',
    nivel: 1,
    // Enganação já foi dado no setup
    sheetActions: [
      {
        source: {
          type: 'power',
          name: 'Linhagem Feérica',
        },
        action: {
          type: 'learnSpell',
          availableSpells: Object.values(spellsCircle1).filter(
            (spell) => spell.school === 'Encan' || spell.school === 'Ilusão'
          ),
          pick: 1,
        },
      },
    ],
  },
  {
    name: 'Linhagem Rubra',
    text: 'Seu sangue foi corrompido pela Tormenta. Básica: Você recebe um poder da Tormenta. Além disso, pode perder outro atributo em vez de Carisma por poderes da Tormenta.',
    nivel: 1,
    // Gimmick de perder Carisma está na parte de aplicar poderes da tormenta
    sheetActions: [
      {
        source: {
          type: 'power',
          name: 'Linhagem Rubra',
        },
        action: {
          type: 'getGeneralPower',
          availablePowers: Object.values(tormentaPowers),
          pick: 1,
        },
      },
    ],
  },
];

const ARCANISTA: ClassDescription = {
  name: 'Arcanista',
  pv: 8,
  addpv: 2,
  pm: 6,
  addpm: 6,
  periciasbasicas: [
    {
      type: 'and',
      list: [Skill.MISTICISMO, Skill.VONTADE],
    },
  ],
  periciasrestantes: {
    qtd: 2,
    list: [
      Skill.CONHECIMENTO,
      Skill.DIPLOMACIA,
      Skill.ENGANACAO,
      Skill.GUERRA,
      Skill.INICIATIVA,
      Skill.INTIMIDACAO,
      Skill.INTUICAO,
      Skill.INVESTIGACAO,
      Skill.NOBREZA,
      Skill.OFICIO,
      Skill.PERCEPCAO,
    ],
  },
  proficiencias: [PROFICIENCIAS.SIMPLES, PROFICIENCIAS.LEVES],
  abilities: [
    {
      name: 'Magias',
      text: 'Você pode lançar magias arcanas de 1º círculo. A cada quatro níveis, pode lançar magias de um círculo maior (2o círculo no 5o nível, 3o círculo no 9o nível e assim por diante).',
      nivel: 1,
      sheetBonuses: [
        {
          source: {
            type: 'power',
            name: 'Magias',
          },
          target: { type: 'PM' },
          modifier: { type: 'SpecialAttribute', attribute: 'spellKeyAttr' },
        },
      ],
    },
    {
      name: 'Alta Arcana',
      text: 'No 20º nível, seu domínio das artes arcanas é total. O custo em PM de suas magias arcanas é reduzido à metade (após aplicar aprimoramentos e quaisquer outros efeitos que reduzam custo).',
      nivel: 20,
    },
  ],
  powers: [
    {
      name: 'Arcano de Batalha',
      text: 'Você soma o bônus de seu atributo-chave nas rolagens de dano para magias.',
      requirements: [],
    },
    {
      name: 'Aumento de Atributo',
      text: 'Você recebe +1 em um atributo a sua escolha (NÃO CONTABILIZADO).  Você recebe +1 em um atributo. Você pode escolher este poder várias vezes, mas apenas uma vez por patamar para um mesmo atributo',
      canRepeat: true,
      requirements: [],
    },
    {
      name: 'Caldeirão do Bruxo',
      text: 'Você pode criar poções, como se tivesse o poder geral Preparar Poção. Se tiver ambos, você pode criar poções de 5º círculo.',
      requirements: [
        [
          { type: RequirementType.TIPO_ARCANISTA, name: 'Bruxo' },
          { type: RequirementType.PERICIA, name: Skill.OFICIO_ALQUIMIA },
        ],
      ],
    },
    {
      name: 'Conhecimento Mágico',
      text: 'Você aprende duas magias de qualquer círculo que possa lançar. Você pode escolher este poder quantas vezes quiser.',
      canRepeat: true,
      requirements: [],
      sheetActions: [
        {
          source: {
            type: 'power',
            name: 'Conhecimento Mágico',
          },
          action: {
            type: 'learnAnySpellFromHighestCircle',
            pick: 2,
            allowedType: 'Arcane',
          },
        },
      ],
      // action: (sheet: CharacterSheet, substeps: SubStep[]): CharacterSheet => {
      //   const sheetClone = _.cloneDeep(sheet);
      //   const currentSpellCircle =
      //     sheetClone.classe.spellPath?.spellCircleAvailableAtLevel(
      //       sheet.nivel
      //     ) || 1;

      //   const keyAttr = sheetClone.classe.spellPath?.keyAttribute;

      //   const availableSpells = getSpellsOfCircle(currentSpellCircle).filter(
      //     (spell) => !!sheetClone.spells.find((s) => s.nome !== spell.nome)
      //   );

      //   addOrCheapenRandomSpells(
      //     sheetClone,
      //     substeps,
      //     availableSpells,
      //     'Conhecimento Mágico',
      //     keyAttr || Atributo.INTELIGENCIA,
      //     2
      //   );

      //   return sheetClone;
      // },
    },
    {
      name: 'Contramágica Aprimorada',
      text: 'Uma vez por rodada, você pode fazer uma contramágica como uma reação (veja a página 164).',
      requirements: [[{ type: RequirementType.MAGIA, name: 'Dissipar Magia' }]],
    },
    {
      name: 'Envolto em Mistério',
      text: 'Sua aparência e postura assombrosas o permitem manipular e assustar pessoas ignorantes ou supersticiosas. O mestre define o que exatamente você pode fazer e quem se encaixa nessa descrição. Como regra geral, você recebe +5 em Enganação e Intimidação contra pessoas não treinadas em Conhecimento ou Misticismo.',
      requirements: [],
    },
    {
      name: 'Escriba Arcano',
      text: 'Você pode aprender magias copiando os textos de pergaminhos e grimórios de outros magos. Aprender uma magia dessa forma exige um dia de trabalho e T$ 250 em matérias-primas por PM necessário para lançar a magia. Assim, aprender uma magia de 3º círculo (6 PM) exige 6 dias de trabalho e o gasto de T$ 1.500.',
      requirements: [
        [
          { type: RequirementType.TIPO_ARCANISTA, name: 'Mago' },
          { type: RequirementType.PERICIA, name: Skill.OFICIO_ESCRITA },
        ],
      ],
    },
    {
      name: 'Especialista em Escola',
      text: 'Escolha uma escola de magia. A CD para resistir a suas magias dessa escola aumenta em +2.',
      requirements: [
        [{ type: RequirementType.TIPO_ARCANISTA, name: 'Bruxo' }],
        [{ type: RequirementType.TIPO_ARCANISTA, name: 'Mago' }],
      ],
    },
    {
      name: 'Familiar',
      text: 'Você possui um animal de estimação mágico (ver página 38).',
      requirements: [],
    },
    {
      name: 'Fluxo de Mana',
      text: 'Você pode manter dois efeitos sustentados ativos simultaneamente com apenas uma ação livre, pagando o custo de cada efeito separadamente.',
      requirements: [[{ type: RequirementType.NIVEL, value: 10 }]],
    },
    {
      name: 'Foco Vital',
      text: 'Se você estiver segurando seu foco e sofrer dano que o levaria a 0 PV ou menos, você fica com 1 PV e o foco perde pontos de vida igual ao valor excedente, até ser destruído.',
      requirements: [[{ type: RequirementType.TIPO_ARCANISTA, name: 'Bruxo' }]],
    },
    {
      name: 'Fortalecimento Arcano',
      text: 'A CD para resistir a suas magias aumenta em +1. Se você puder lançar magias de 4º círculo, em vez disso ela aumenta em +2.',
      requirements: [[{ type: RequirementType.NIVEL, value: 5 }]],
    },
    {
      name: 'Herança Aprimorada',
      text: 'Você recebe a herança aprimorada de sua linhagem sobrenatural.',
      requirements: [
        [
          { type: RequirementType.TIPO_ARCANISTA, name: 'Feiticeiro' },
          { type: RequirementType.NIVEL, value: 6 },
        ],
      ],
    },
    {
      name: 'Herança Superior',
      text: 'Você recebe a herança superior de sua linhagem sobrenatural.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Herança Aprimorada' },
          { type: RequirementType.NIVEL, value: 11 },
        ],
      ],
    },
    {
      name: 'Magia Pungente',
      text: 'Quando lança uma magia, você pode pagar 1 PM para aumentar em +2 a CD para resistir a ela.',
      requirements: [],
    },
    {
      name: 'Mestre em Escola',
      text: 'Escolha uma escola de magia. O custo para lançar magias dessa escola diminui em –1 PM.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Especialista em Escola' },
          { type: RequirementType.NIVEL, value: 8 },
        ],
      ],
    },
    {
      name: 'Poder Mágico',
      text: 'Você recebe +1 ponto de mana por nível de arcanista. Quando sobe de nível, os PM que recebe por este poder aumentam de acordo. Por exemplo, se escolher este poder no 4º nível, recebe 4 PM. Quando subir para o 5º nível, recebe +1 PM e assim por diante.',
      requirements: [],
      sheetBonuses: [
        {
          source: { type: 'power', name: 'Poder Mágico' },
          target: { type: 'PM' },
          modifier: { type: 'LevelCalc', formula: '{level}' },
        },
      ],
    },
    {
      name: 'Raio Arcano',
      text: 'Você pode gastar uma ação padrão para causar 1d8 pontos de dano de essência num alvo em alcance curto. Esse dano aumenta em +1d8 para cada círculo de magia acima do 1º que você puder lançar. O alvo pode fazer um teste de Reflexos (CD atributo-chave) para reduzir o dano à metade. O raio arcano conta como uma magia para efeitos de habilidades e itens que beneficiem suas magias.',
      requirements: [],
    },
    {
      name: 'Raio Elemental',
      text: 'Quando usa Raio Arcano, você pode pagar 1 PM para que ele cause dano de um tipo de energia a sua escolha, entre ácido, eletricidade, fogo, frio ou trevas. Se o alvo falhar no teste de Reflexos, sofre uma condição, de acordo com o tipo de energia. Veja a descrição das condições no Apêndice. Ácido: vulnerável por 1 rodada. Eletricidade: ofuscado por 1 rodada. Fogo: fica em chamas. Frio: lento por 1 rodada. Trevas: não pode curar PV por 1 uma rodada.',
      requirements: [[{ type: RequirementType.PODER, name: 'Raio Arcano' }]],
    },
    {
      name: 'Raio Poderoso',
      text: 'Os dados de dano do seu Raio Arcano aumentam para d12 e o alcance dele aumenta para médio.',
      requirements: [[{ type: RequirementType.PODER, name: 'Raio Arcano' }]],
    },
    {
      name: 'Tinta do Mago',
      text: 'Você pode criar pergaminhos, como se tivesse o poder Escrever Pergaminho. Se tiver ambos, seu custo para criar pergaminhos é reduzido à metade.',
      requirements: [
        [
          { type: RequirementType.TIPO_ARCANISTA, name: 'MAGO' },
          { type: RequirementType.PERICIA, name: Skill.OFICIO_ESCRITA },
        ],
      ],
    },
  ],
  probDevoto: 0.3,
  faithProbability: {
    AHARADAK: 1,
    AZGHER: 1,
    KALLYADRANOCH: 1,
    NIMB: 1,
    SSZZAAS: 1,
    TANNATOH: 1,
    TENEBRA: 1,
    VALKARIA: 1,
    WYNNA: 1,
  },
  attrPriority: [Atributo.INTELIGENCIA],
  setup: (classe) => {
    const modifiedClasse = _.cloneDeep(classe);
    const subtype = getRandomItemFromArray(allArcanistaSubtypes);
    modifiedClasse.subname = subtype;
    modifiedClasse.spellPath = spellPaths[subtype];
    modifiedClasse.abilities.push(classAbilities[subtype]);
    if (subtype === 'Feiticeiro') {
      modifiedClasse.attrPriority = [Atributo.CARISMA];
      const selectedSubType = getRandomItemFromArray(feiticeiroPaths);
      if (selectedSubType.name === 'Linhagem Dracônica') {
        selectedSubType.text += `. Tipo escolhido: ${getRandomItemFromArray([
          'Ácido',
          'Elétrico',
          'Fogo',
          'Frio',
        ])}`;
      } else if (selectedSubType.name === 'Linhagem Feérica') {
        modifiedClasse.periciasbasicas.push({
          type: 'and',
          list: [Skill.ENGANACAO],
        });
      } else if (selectedSubType.name === 'Linhagem Rubra') {
        // Nothing here
      }

      modifiedClasse.abilities.push(selectedSubType);
    }

    return modifiedClasse;
  },
};

export default ARCANISTA;
