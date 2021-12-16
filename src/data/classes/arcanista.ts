import _ from 'lodash';
import { getRandomItemFromArray } from '../../functions/randomUtils';
import CharacterSheet, { SubStep } from '../../interfaces/CharacterSheet';
import {
  ClassDescription,
  ClassAbility,
  SpellPath,
} from '../../interfaces/Class';
import { RequirementType } from '../../interfaces/Poderes';
import Skill from '../../interfaces/Skills';
import { Atributo } from '../atributos';
import PROFICIENCIAS from '../proficiencias';

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
    text:
      'A magia é um poder incrível, capaz de alterar a realidade. Esse poder tem fontes distintas e cada uma opera conforme suas próprias regras. Você é um bruxo, capaz de lançar magias através de um foco como uma varinha, cajado, chapéu, etc.',
    nivel: 1,
  },
  Mago: {
    name: 'Caminho do Arcanista',
    text:
      'A magia é um poder incrível, capaz de alterar a realidade. Esse poder tem fontes distintas e cada uma opera conforme suas próprias regras. Você é um mago, capaz de lançar magia através de todo o seu estudo mágico. Seu livro de magias contém todas as suas magias, e a cada dia você pode preparar até metade de suas magias para usar durante o dia.',
    nivel: 1,
  },
  Feiticeiro: {
    name: 'Caminho do Arcanista',
    text:
      'A magia é um poder incrível, capaz de alterar a realidade. Esse poder tem fontes distintas e cada uma opera conforme suas próprias regras. Você é um feiticeiro, capaz de lançar magias atráves de um poder inato que corre no seu sangue.',
    nivel: 1,
  },
};

const feiticeiroPaths: ClassAbility[] = [
  {
    name: 'Linhagem Dracônica',
    text:
      'Um de seus antepassados foi um majestoso dragão. Escolha um tipo de dano entre ácido, eletricidade, fogo ou frio. Básica: Você soma seu modificador de Carisma em seus pontos de vida iniciais e recebe resistência ao tipo de dano escolhido 5. (ADICIONE VOCÊ MESMO)',
    nivel: 1,
  },
  {
    name: 'Linhagem Feérica',
    text:
      'Seu sangue foi tocado pelas fadas. Básica: Você se torna treinado em Enganação e aprende uma magia de 1º círculo de encantamento ou ilusão, arcana ou divina, a sua escolha. (ADICIONE VOCÊ MESMO)',
    nivel: 1,
  },
  {
    name: 'Linhagem Rubra',
    text:
      'Seu sangue foi corrompido pela Tormenta. Básica: Você recebe um poder da Tormenta. Quando adquire um poder da Tormenta, você pode aplicar a penalidade em Carisma a outro atributo. Sua relação com a invasão aberrante lhe permite sacrificar partes específicas de seu ser. (ADICIONE VOCÊ MESMO)',
    nivel: 1,
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
    qtd: 1,
    list: [Skill.CONHECIMENTO, Skill.INICIATIVA, Skill.OFICIO, Skill.PERCEPCAO],
  },
  proficiencias: [PROFICIENCIAS.SIMPLES, PROFICIENCIAS.LEVES],
  abilities: [
    {
      name: 'Magias',
      text:
        'Você pode lançar magias arcanas de 1º círculo. A cada quatro níveis, pode lançar magias de um círculo maior (2o círculo no 5o nível, 3o círculo no 9o nível e assim por diante).',
      nivel: 1,
      action(sheet: CharacterSheet, substeps: SubStep[]): CharacterSheet {
        const sheetClone = _.cloneDeep(sheet);

        let keyAttr = 'INT';
        let keyAttrMod = sheet.atributos.Inteligência.mod;
        if (sheet.classe.subname === 'Feiticeiro') {
          keyAttr = 'CAR';
          keyAttrMod = sheet.atributos.Carisma.mod;
        }

        const finalPM = sheet.pm + keyAttrMod;
        substeps.push({
          name: 'Magias',
          value: `+(Mod ${keyAttr}) PMs inicias (${sheet.pm} + ${keyAttrMod} = ${finalPM})`,
        });

        return _.merge<CharacterSheet, Partial<CharacterSheet>>(sheetClone, {
          pm: finalPM,
        });
      },
    },
    {
      name: 'Alta Arcana',
      text:
        'No 20º nível, seu domínio das artes arcanas é total. O custo em PM de suas magias arcanas é reduzido à metade (após aplicar aprimoramentos e quaisquer outros efeitos que reduzam custo).',
      nivel: 20,
    },
  ],
  powers: [
    {
      name: 'Arcano de Batalha',
      text:
        'Você soma o bônus de seu atributo-chave nas rolagens de dano para magias e para seu Raio Arcano (caso possua).',
      requirements: [],
    },
    {
      name: 'Aumento de Atributo',
      text:
        'Você recebe +2 em um atributo a sua escolha (NÃO CONTABILIZADO). Você pode escolher este poder várias vezes. A partir da segunda vez que escolhê-lo para o mesmo atributo, o aumento diminui para +1.',
      canRepeat: true,
      requirements: [],
    },
    {
      name: 'Caldeirão do Bruxo',
      text:
        'Você pode criar poções, como se tivesse o poder geral Preparar Poção. Se tiver ambos, você pode criar poções de 3º círculo.',
      requirements: [
        [
          { type: RequirementType.TIPO_ARCANISTA, name: 'Bruxo' },
          { type: RequirementType.PERICIA, name: Skill.OFICIO_ALQUIMIA },
        ],
      ],
    },
    {
      name: 'Conhecimento Mágico',
      text:
        'Você aprende duas magias de qualquer círculo que possa lançar (NÃO INCLUÍDO). Você pode escolher este poder quantas vezes quiser.',
      canRepeat: true,
      requirements: [],
    },
    {
      name: 'Contramágica Aprimorada',
      text:
        'Uma vez por rodada, você pode fazer uma contramágica como uma reação (veja a página 164).',
      requirements: [[{ type: RequirementType.MAGIA, name: 'Dissipar Magia' }]],
    },
    {
      name: 'Envolto em Mistério',
      text:
        'Sua aparência e postura assombrosas o permitem manipular e assustar pessoas ignorantes ou supersticiosas. O mestre define o que exatamente você pode fazer e quem se encaixa nessa descrição. Como regra geral, você recebe +5 em Enganação e Intimidação contra pessoas não treinadas em Conhecimento ou Misticismo.',
      requirements: [],
    },
    {
      name: 'Escriba Arcano',
      text:
        'Você pode aprender magias copiando os textos de pergaminhos e grimórios de outros magos. Aprender uma magia dessa forma exige um dia de trabalho e T$ 250 em matérias-primas por PM necessário para lançar a magia. Assim, aprender uma magia de 3º círculo (6 PM) exige 6 dias de trabalho e o gasto de T$ 1.500.',
      requirements: [[{ type: RequirementType.TIPO_ARCANISTA, name: 'Mago' }]],
    },
    {
      name: 'Especialista em Escola',
      text:
        'Escolha uma escola de magia. A CD para resistir a suas magias dessa escola aumenta em +2.',
      requirements: [
        [{ type: RequirementType.TIPO_ARCANISTA, name: 'Bruxo' }],
        [{ type: RequirementType.TIPO_ARCANISTA, name: 'Mago' }],
      ],
    },
    {
      name: 'Familiar',
      text: 'Você possui um animal de estimação mágico (ver página 36).',
      requirements: [],
    },
    {
      name: 'Fluxo de Mana',
      text:
        'Você pode manter dois efeitos sustentados ativos simultaneamente com apenas uma ação livre, pagando o custo de cada efeito separadamente.',
      requirements: [[{ type: RequirementType.NIVEL, value: 10 }]],
    },
    {
      name: 'Foco Vital',
      text:
        'Se você estiver segurando seu foco e sofrer dano que o levaria a 0 PV ou menos, você fica com 1 PV e o foco perde pontos de vida igual ao valor excedente, até ser destruído.',
      requirements: [[{ type: RequirementType.TIPO_ARCANISTA, name: 'Bruxo' }]],
    },
    {
      name: 'Fortalecimento Arcano',
      text:
        'A CD para resistir a suas magias aumenta em +1. Se você puder lançar magias de 4º círculo, em vez disso ela aumenta em +2.',
      requirements: [],
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
      text:
        'Quando lança uma magia, você pode pagar 1 PM para aumentar em +2 a CD para resistir a ela.',
      requirements: [],
    },
    {
      name: 'Mestre em Escola',
      text:
        'Escolha uma escola de magia. O custo para lançar magias dessa escola diminui em –1 PM.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Especialista em Escola' },
          { type: RequirementType.NIVEL, value: 8 },
        ],
      ],
    },
    {
      name: 'Poder Mágico',
      text:
        'Você recebe +1 ponto de mana por nível de arcanista (NÃO CONTABILIZADO). Quando sobe de nível, os PM que recebe por este poder aumentam de acordo. Por exemplo, se escolher este poder no 4º nível, recebe 4 PM. Quando subir para o 5º nível, recebe +1 PM e assim por diante. Você pode escolher este poder uma segunda vez, para um total de +2 PM por nível.',
      requirements: [],
    },
    {
      name: 'Raio Arcano',
      text:
        'Você pode gastar uma ação padrão para disparar um raio num alvo em alcance curto que causa 1d6 pontos de dano de essência. Esse dano aumenta em +1d6 para cada círculo de magia acima do 1º que você puder lançar. O alvo pode fazer um teste de Reflexos (CD atributo-chave) para reduzir o dano à metade.',
      requirements: [],
    },
    {
      name: 'Raio Elemental',
      text:
        'Quando usa Raio Arcano, você pode pagar 1 PM para que ele cause dano de um tipo de energia a sua escolha, entre ácido, eletricidade, fogo, frio ou trevas. Se o alvo falhar no teste de Reflexos, sofre uma condição, de acordo com o tipo de energia. Veja a descrição das condições no Apêndice. Ácido: vulnerável por uma rodada. Eletricidade: ofuscado por uma rodada. Fogo: fica em chamas. Frio: lento por uma rodada. Trevas: não pode ser curado por uma rodada.',
      requirements: [[{ type: RequirementType.PODER, name: 'Raio Elemental' }]],
    },
    {
      name: 'Raio Poderoso',
      text:
        'Os dados de dano do seu Raio Arcano aumentam para d8 e o alcance dele aumenta para médio.',
      requirements: [[{ type: RequirementType.PODER, name: 'Raio Poderoso' }]],
    },
    {
      name: 'Tinta do Mago',
      text:
        'Você pode criar pergaminhos, como se tivesse o poder Escrever Pergaminho. Se tiver ambos, seu custo para criar pergaminhos é reduzido à metade.',
      requirements: [
        [
          { type: RequirementType.TIPO_ARCANISTA, name: 'MAGO' },
          { type: RequirementType.PERICIA, name: Skill.CONHECIMENTO },
        ],
      ],
    },
  ],
  probDevoto: 0.3,
  faithProbability: {
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
      modifiedClasse.abilities.push(getRandomItemFromArray(feiticeiroPaths));
      modifiedClasse.attrPriority = [Atributo.CARISMA];
    }

    return modifiedClasse;
  },
};

export default ARCANISTA;
