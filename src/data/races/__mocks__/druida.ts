import { GeneralPowerType } from '../../../interfaces/Poderes';
import { CharacterStats } from '../../../interfaces/Race';
import Skill from '../../../interfaces/Skills';
import { spellsCircles } from '../../../interfaces/Spells';
import { Atributo } from '../../atributos';
import { spellsCircle1 } from '../../magias/generalSpells';

export const druida: CharacterStats = {
  attributes: {
    Força: { name: Atributo.FORCA, value: 10, mod: 0 },
    Destreza: { name: Atributo.DESTREZA, value: 13, mod: 1 },
    Constituição: { name: Atributo.CONSTITUICAO, value: 11, mod: 0 },
    Inteligência: { name: Atributo.INTELIGENCIA, value: 12, mod: 1 },
    Sabedoria: { name: Atributo.SABEDORIA, value: 18, mod: 4 },
    Carisma: { name: Atributo.CARISMA, value: 16, mod: 3 },
  },
  bag: {
    equipments: {
      'Item Geral': [
        { nome: 'Mochila', group: 'Item Geral', peso: 1 },
        { nome: 'Saco de dormir', group: 'Item Geral', peso: 2.5 },
        { nome: 'Traje de viajante', group: 'Item Geral', peso: 2 },
      ],
      Alimentação: [],
      Alquimía: [],
      Animal: [],
      Arma: [
        {
          nome: 'Pique',
          dano: '1d8',
          critico: '2x',
          peso: 5,
          tipo: 'Perf.',
          alcance: '-',
          group: 'Arma',
        },
      ],
      Armadura: [
        {
          nome: 'Gibão de peles',
          defenseBonus: 4,
          armorPenalty: 3,
          peso: 12,
          group: 'Armadura',
        },
      ],
      Escudo: [],
      Hospedagem: [],
      Serviço: [],
      Vestuário: [],
      Veículo: [],
    },
    weight: 5.5,
    armorPenalty: 0,
  },
  classDescription: {
    name: 'Druida',
    pv: 16,
    addpv: 4,
    pm: 4,
    addpm: 4,
    periciasbasicas: [
      { type: 'and', list: [Skill.SOBREVIVENCIA, Skill.VONTADE] },
    ],
    periciasrestantes: {
      qtd: 4,
      list: [
        Skill.ADESTRAMENTO,
        Skill.ATLETISMO,
        Skill.CAVALGAR,
        Skill.CONHECIMENTO,
        Skill.CURA,
        Skill.FORTITUDE,
        Skill.INICIATIVA,
        Skill.INTUICAO,
        Skill.LUTA,
        Skill.MISTICISMO,
        Skill.OFICIO,
        Skill.PERCEPCAO,
        Skill.RELIGIAO,
      ],
    },
    proeficiencias: ['Armas Simples', 'Armaduras Leves'],
    abilities: [
      {
        name: 'Devoto',
        text:
          'Você se torna devoto de uma divindade disponível para druidas (Allihanna, Megalokk ou Oceano). Você deve obedecer às Obrigações & Restrições de seu deus, mas, em troca, ganha os Poderes Concedidos dele. O nome desta habilidade muda de acordo com a divindade escolhida: Devoto de Allihanna, Devoto de Megalokk ou Devoto de Oceano.',
        effect: null,
        nivel: 1,
      },
      {
        name: 'Empatia Selvagem',
        text:
          'Você pode se comunicar com animais por meio de linguagem corporal e vocalizações. Você pode usar Adestramento com animais para mudar atitude e pedir favores (veja Diplomacia, na página 117).',
        effect: null,
        nivel: 1,
      },
      {
        name: 'Magias',
        text:
          'Escolha três escolas de magia. Uma vez feita, essa escolha não pode ser mudada. Você pode lançar magias divinas de 1º círculo que pertençam a essas escolas. À medida que sobe de nível, pode lançar magias de círculos maiores (2º círculo no 6º nível, 3º círculo no 10º nível e 4º círculo no 14º nível). Você começa com duas magias de 1º círculo. A cada nível par (2º, 4º etc.), aprende uma magia de qualquer círculo e escola que possa lançar. Seu atributo-chave para lançar magias é Sabedoria e você soma seu bônus de Sabedoria no seu total de PM. Veja o Capítulo 4 para as regras de magia.',
        effect: null,
        nivel: 1,
      },
    ],
    probDevoto: 1,
    qtdPoderesConcedidos: 'all',
    faithProbability: {
      AHARADAK: 1,
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
      MEGALOKK: 0,
      NIMB: 0,
    },
    spellPath: {
      initialSpells: 2,
      spellType: 'Divine',
      schools: ['Abjur', 'Evoc', 'Necro'],
      keyAttribute: Atributo.SABEDORIA,
      qtySpellsLearnAtLevel: (level) => (level % 2 === 0 ? 1 : 0),
      spellCircleAvailableAtLevel: (level) => {
        if (level < 6) return 1;
        if (level < 10) return 2;
        if (level < 14) return 3;
        return 4;
      },
    },
  },
  defense: 11,
  displacement: 9,
  level: 1,
  size: {
    modifiers: { maneuver: 0, stealth: 0 },
    naturalRange: 1.5,
    name: 'Médio',
  },
  origin: {
    name: 'Assistente de Laboratório',
    itens: [],
    pericias: [Skill.OFICIO],
    poderes: [
      {
        name: 'Esse Cheiro...',
        description:
          'Você recebe +2 em Fortitude e passa automaticamente em testes de Ofício (alquimia) para identificar itens alquímicos.',
        type: 'ORIGEM',
      },
    ],
  },
  skills: [
    Skill.SOBREVIVENCIA,
    Skill.VONTADE,
    Skill.OFICIO,
    Skill.ADESTRAMENTO,
    Skill.CONHECIMENTO,
    Skill.ATLETISMO,
    Skill.INICIATIVA,
    Skill.JOGATINA,
  ],
  spells: [
    spellsCircle1.controlarPlantas,
    {
      spellCircle: spellsCircles.c1,
      nome: 'Proteção Divina',
      execucao: 'Padrão',
      alcance: 'Toque',
      alvo: '1 criatura',
      duracao: 'Cena',
      manaExpense: 1,
    },
    {
      spellCircle: spellsCircles.c1,
      nome: 'Despedaçar',
      execucao: 'Padrão',
      alcance: 'Curto',
      alvo: '1 critura ou objeto mundano pequeno',
      duracao: 'Instantânea',
      resistencia: 'Fortitude parcial ou Reflexos anula',
      manaExpense: 1,
    },
  ],
  devote: {
    divindade: {
      name: 'Allihanna',
      poderes: [
        {
          name: 'Dedo Verde',
          description: 'Você aprende e pode lançar Controlar Plantas.',
          type: GeneralPowerType.CONCEDIDOS,
          requirements: [],
        },
        {
          name: 'Descanso Natural',
          description:
            'Para você, dormir ao relento conta como uma estalagem confortável.',
          type: GeneralPowerType.CONCEDIDOS,
          requirements: [],
        },
        {
          name: 'Voz da Natureza',
          description:
            'Você pode falar com animais (como o efeito da magia Voz Divina) e aprende e pode lançar Acalmar Animal, mas só contra animais.',
          type: GeneralPowerType.CONCEDIDOS,
          requirements: [],
        },
      ],
    },
    poderes: [
      {
        name: 'Dedo Verde',
        description: 'Você aprende e pode lançar Controlar Plantas.',
        type: GeneralPowerType.CONCEDIDOS,
        requirements: [],
      },
      {
        name: 'Descanso Natural',
        description:
          'Para você, dormir ao relento conta como uma estalagem confortável.',
        type: GeneralPowerType.CONCEDIDOS,
        requirements: [],
      },
      {
        name: 'Voz da Natureza',
        description:
          'Você pode falar com animais (como o efeito da magia Voz Divina) e aprende e pode lançar Acalmar Animal, mas só contra animais.',
        type: GeneralPowerType.CONCEDIDOS,
        requirements: [],
      },
    ],
  },
  powers: {
    general: [],
    origin: [
      {
        name: 'Esse Cheiro...',
        description:
          'Você recebe +2 em Fortitude e passa automaticamente em testes de Ofício (alquimia) para identificar itens alquímicos.',
        type: 'ORIGEM',
      },
    ],
  },
  pv: 16,
  pm: 4,
};