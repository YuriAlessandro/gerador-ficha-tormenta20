import _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { pickFromArray } from '../../../../functions/randomUtils';
import { ClassDescription } from '../../../../interfaces/Class';
import { RequirementType } from '../../../../interfaces/Poderes';
import Skills from '../../../../interfaces/Skills';
import { allSpellSchools } from '../../../../interfaces/Spells';
import { Atributo } from '../atributos';
import PROFICIENCIAS from '../proficiencias';

const DRUIDA: ClassDescription = {
  name: 'Druida',
  pv: 16,
  addpv: 4,
  pm: 4,
  addpm: 4,
  periciasbasicas: [
    {
      type: 'and',
      list: [Skills.SOBREVIVENCIA, Skills.VONTADE],
    },
  ],
  periciasrestantes: {
    qtd: 4,
    list: [
      Skills.ADESTRAMENTO,
      Skills.ATLETISMO,
      Skills.CAVALGAR,
      Skills.CONHECIMENTO,
      Skills.CURA,
      Skills.FORTITUDE,
      Skills.INICIATIVA,
      Skills.INTUICAO,
      Skills.LUTA,
      Skills.MISTICISMO,
      Skills.OFICIO,
      Skills.PERCEPCAO,
      Skills.RELIGIAO,
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
      text: 'Você se torna devoto de um deus disponível para druidas (Allihanna, Megalokk ou Oceano). Veja as regras de devotos na página 96. Ao contrário de devotos normais, você recebe dois poderes concedidos por se tornar devoto, em vez de apenas um.',
      nivel: 1,
    },
    {
      name: 'Empatia Selvagem',
      text: 'Você pode se comunicar com animais por meio de linguagem corporal e vocalizações. Você pode usar Adestramento com animais para mudar atitude e persuasão (veja a página 118).',
      nivel: 1,
    },
    {
      name: 'Magias',
      text: 'Escolha três escolas de magia. Uma vez feita, essa escolha não pode ser mudada. Você pode lançar magias divinas de 1º círculo que pertençam a essas escolas. À medida que sobe de nível, pode lançar magias de círculos maiores (2º círculo no 6º nível, 3º círculo no 10º nível e 4º círculo no 14º nível). Você começa com duas magias de 1º círculo. A cada nível par (2º, 4º etc.), aprende uma magia de qualquer círculo e escola que possa lançar. Seu atributo-chave para lançar magias é Sabedoria e você soma sua Sabedoria no seu total de PM. Veja o Capítulo 4 para as regras de magia.',
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
      name: 'Caminho dos Ermos',
      text: 'No 2º nível, você pode atravessar terrenos difíceis sem sofrer redução em seu deslocamento e a CD para rastreá-lo aumenta em +10. Esta habilidade só funciona em terrenos naturais.',
      nivel: 2,
    },
    {
      name: 'Força da Natureza',
      text: 'No 20º nível, você diminui o custo de todas as suas magias em –2 PM e aumenta a CD delas em +2. Os bônus dobram (–4 PM e +4 na CD) se você estiver em terrenos naturais.',
      nivel: 20,
    },
  ],
  powers: [
    {
      name: 'Aspecto do Inverno',
      text: 'Você aprende e pode lançar uma magia de convocação ou evocação, arcana ou divina, de qualquer círculo que possa lançar. Além disso, recebe redução de frio 5 e suas magias que causam dano de frio causam +1 ponto de dano por dado.',
      requirements: [[]],
      sheetActions: [
        {
          source: {
            type: 'power',
            name: 'Aspecto do Inverno',
          },
          action: {
            type: 'learnAnySpellFromHighestCircle',
            allowedType: 'Both',
            pick: 1,
            schools: ['Conv', 'Evoc'],
          },
        },
      ],
    },
    {
      name: 'Aspecto do Outono',
      text: 'Você aprende e pode lançar uma magia de necromancia, arcana ou divina, de qualquer círculo que possa lançar. Além disso, pode gastar 1 PM para impor uma penalidade de –2 nos testes de resistência de todos os inimigos em alcance curto até o início do seu próximo turno.',
      requirements: [[]],
      sheetActions: [
        {
          source: {
            type: 'power',
            name: 'Aspecto do Outono',
          },
          action: {
            type: 'learnAnySpellFromHighestCircle',
            allowedType: 'Both',
            pick: 1,
            schools: ['Necro'],
          },
        },
      ],
    },
    {
      name: 'Aspecto da Primavera',
      text: 'Você aprende e pode lançar uma magia de encantamento ou ilusão, arcana ou divina, de qualquer círculo que possa lançar. Além disso, escolha uma quantidade de magias igual ao seu Carisma (mínimo 1). O custo dessas magias é reduzido em −1 PM.',
      requirements: [[]],
      sheetActions: [
        {
          source: {
            type: 'power',
            name: 'Aspecto da Primavera',
          },
          action: {
            type: 'learnAnySpellFromHighestCircle',
            allowedType: 'Both',
            pick: 1,
            schools: ['Encan', 'Ilusão'],
          },
        },
      ],
    },
    {
      name: 'Aspecto do Verão',
      text: 'Você aprende e pode lançar uma magia de transmutação, arcana ou divina, de qualquer círculo que possa lançar. Além disso, pode gastar 1 PM para cobrir uma de suas armas com chamas até o fim da cena. A arma causa +1d6 pontos de dano de fogo. Sempre que você acertar um ataque com ela, recebe 1 PM temporário. Você pode ganhar um máximo de PM temporários por cena igual ao seu nível e eles desaparecem no final da cena.',
      requirements: [[]],
      rolls: [
        {
          id: uuid(),
          label: 'Dano de Fogo (arma em chamas)',
          dice: '1d6',
        },
      ],
      sheetActions: [
        {
          source: {
            type: 'power',
            name: 'Aspecto do Verão',
          },
          action: {
            type: 'learnAnySpellFromHighestCircle',
            allowedType: 'Both',
            pick: 1,
            schools: ['Trans'],
          },
        },
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
      name: 'Companheiro Animal',
      text: 'Você recebe um companheiro animal. Veja o quadro na página 62 para detalhes. Você pode escolher este poder quantas vezes quiser, mas deve escolher companheiros diferentes e ainda está sujeito ao limite de parceiros que pode ter (veja a página 260).',
      canRepeat: true,
      requirements: [[{ type: RequirementType.PERICIA, name: 'Adestramento' }]],
      // PROVAVEL TODO NAS ACTIONS PARA ADICIONAR COMPANHEIROS
    },
    {
      name: 'Companheiro Animal Aprimorado',
      text: 'Escolha um de seus companheiros animais. Ele recebe um segundo tipo, ganhando os bônus de seu nível. Por exemplo, se você tiver um companheiro guardião veterano, pode adicionar o tipo fortão a ele, tornando-o um guardião fortão veterano que concede +3 na Defesa e +1d12 em uma rolagem de dano corpo a corpo.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Companheiro Animal' },
          { type: RequirementType.NIVEL, value: 6 },
        ],
      ],
    },
    {
      name: 'Companheiro Animal Lendário',
      text: 'Escolha um de seus companheiros animais. Esse animal passa a dobrar os bônus concedidos de seu tipo original.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Companheiro Animal' },
          { type: RequirementType.NIVEL, value: 18 },
        ],
      ],
    },
    {
      name: 'Companheiro Animal Mágico',
      text: 'Escolha um de seus companheiros animais. Ele recebe um segundo tipo diferente, entre adepto, destruidor, magivocador ou médico, ganhando os bônus de seu nível.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Companheiro Animal' },
          { type: RequirementType.NIVEL, value: 8 },
        ],
      ],
    },
    {
      name: 'Coração da Selva',
      text: 'A CD para resistir a seus efeitos de veneno aumenta em +2 e estes efeitos causam +1 de perda de vida por dado.',
      requirements: [[]],
    },
    {
      name: 'Espírito dos Equinócios',
      text: 'Você pode gastar 4 PM para ficar em equilíbrio com o mundo. Até o final da cena, quando rola um dado, pode rolar novamente qualquer resultado 1.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Aspecto da Primavera' },
          { type: RequirementType.PODER, name: 'Aspecto do Outono' },
          { type: RequirementType.NIVEL, value: 10 },
        ],
      ],
    },
    {
      name: 'Espírito dos Solstícios',
      text: 'Você transita entre os extremos do mundo natural. Quando lança uma magia, pode gastar +4 PM para maximizar os efeitos numéricos variáveis dela. Por exemplo, uma magia Curar Ferimentos aprimorada para curar 5d8+5 PV irá curar automaticamente 45 PV, sem a necessidade de rolar dados. Uma magia sem efeitos variáveis não pode ser afetada por este poder.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Aspecto do Inverno' },
          { type: RequirementType.PODER, name: 'Aspecto do Verão' },
          { type: RequirementType.NIVEL, value: 10 },
        ],
      ],
    },
    {
      name: 'Força dos Penhascos',
      text: 'Você recebe +2 em Fortitude. Quando sofre dano enquanto em contato com o solo ou uma superfície de pedra, pode gastar uma quantidade de PM limitada por sua Sabedoria. Para cada PM gasto, reduz esse dano em 10.',
      requirements: [[{ type: RequirementType.NIVEL, value: 4 }]],
      sheetBonuses: [
        {
          source: {
            type: 'power',
            name: 'Força dos Penhascos',
          },
          target: {
            type: 'Skill',
            name: Skills.FORTITUDE,
          },
          modifier: {
            type: 'Fixed',
            value: 2,
          },
        },
      ],
    },
    {
      name: 'Forma Primal',
      text: 'Quando usa Forma Selvagem, você pode se transformar em uma fera primal. Você recebe os benefícios de dois tipos de animais (bônus iguais não se acumulam; use o que você quiser de cada tipo).',
      requirements: [[{ type: RequirementType.NIVEL, value: 18 }]],
    },
    {
      name: 'Forma Selvagem',
      text: 'Você pode se transformar em animais. A lista está disponível na página 63.',
      requirements: [[]],
    },
    {
      name: 'Forma Selvagem Aprimorada',
      text: 'Quando usa Forma Selvagem, você pode gastar 6 PM ao todo para assumir uma forma aprimorada.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Forma Selvagem' },
          { type: RequirementType.NIVEL, value: 6 },
        ],
      ],
    },
    {
      name: 'Forma Selvagem Superior',
      text: 'Quando usa Forma Selvagem, você pode gastar 10 PM ao todo para assumir uma forma superior.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Forma Selvagem Aprimorada' },
          { type: RequirementType.NIVEL, value: 12 },
        ],
      ],
    },
    {
      name: 'Liberdade da Pradaria',
      text: 'Você recebe +2 em Reflexos. Se estiver ao ar livre, sempre que lança uma magia, pode gastar 1 PM para aumentar o alcance dela em um passo (de toque para curto, de curto para médio ou de médio para longo).',
      requirements: [[]],
      sheetBonuses: [
        {
          source: {
            type: 'power',
            name: 'Liberdade da Pradaria',
          },
          target: {
            type: 'Skill',
            name: Skills.REFLEXOS,
          },
          modifier: {
            type: 'Fixed',
            value: 2,
          },
        },
      ],
    },
    {
      name: 'Magia Natural',
      text: 'Em forma selvagem, você pode lançar magias e empunhar catalisadores e esotéricos.',
      requirements: [[{ type: RequirementType.PODER, name: 'Forma Selvagem' }]],
    },
    {
      name: 'Presas Afiadas',
      text: 'A margem de ameaça de suas armas naturais aumenta em +2.',
      requirements: [[{ type: RequirementType.PODER, name: 'Forma Selvagem' }]],
    },
    {
      name: 'Segredos da Natureza',
      text: 'Você aprende duas magias de qualquer círculo que possa lançar. Elas devem pertencer às escolas que você sabe usar, mas podem ser arcanas ou divinas. Você pode escolher este poder quantas vezes quiser.',
      requirements: [[]],
    },
    {
      name: 'Tranquilidade dos Lagos',
      text: 'Você recebe +2 em Vontade. Se estiver portando um recipiente com água (não precisa estar empunhando), uma vez por rodada, quando faz um teste de resistência, pode pagar 1 PM para refazer a rolagem.',
      requirements: [[]],
      sheetBonuses: [
        {
          source: {
            type: 'power',
            name: 'Tranquilidade dos Lagos',
          },
          target: {
            type: 'Skill',
            name: Skills.VONTADE,
          },
          modifier: {
            type: 'Fixed',
            value: 2,
          },
        },
      ],
    },
  ],
  probDevoto: 1,
  qtdPoderesConcedidos: 2,
  faithProbability: {
    AHARADAK: 0,
    OCEANO: 1,
    TENEBRA: 0,
    VALKARIA: 0,
    WYNNA: 0,
    LENA: 0,
    SSZZAAS: 0,
    THYATIS: 0,
    ARSENAL: 0,
    TANNATOH: 0,
    ALLIHANNA: 1,
    MARAH: 0,
    KALLYADRANOCH: 0,
    KHALMYR: 0,
    THWOR: 0,
    HYNINN: 0,
    AZGHER: 0,
    LINWU: 0,
    MEGALOKK: 1,
    NIMB: 0,
  },
  attrPriority: [Atributo.SABEDORIA],
  setup: (classe) => {
    const modifiedClasse = _.cloneDeep(classe);
    modifiedClasse.spellPath = {
      initialSpells: 2,
      spellType: 'Divine',
      qtySpellsLearnAtLevel: (level) => (level % 2 === 0 ? 1 : 0),
      schools: pickFromArray(allSpellSchools, 3),
      spellCircleAvailableAtLevel: (level) => {
        if (level < 6) return 1;
        if (level < 10) return 2;
        if (level < 14) return 3;
        return 4;
      },
      keyAttribute: Atributo.SABEDORIA,
    };

    return modifiedClasse;
  },
};

export default DRUIDA;
