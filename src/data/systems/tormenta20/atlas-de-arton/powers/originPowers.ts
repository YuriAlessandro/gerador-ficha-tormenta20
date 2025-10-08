import { shuffle, cloneDeep } from 'lodash';
import { OriginPower } from '../../../../../interfaces/Poderes';
import Skill from '../../../../../interfaces/Skills';
import { spellsCircle1 } from '../../magias/generalSpells';
import { Atributo } from '../../atributos';
import { Spell } from '../../../../../interfaces/Spells';

export const ORIGIN_POWER_TYPE = 'ORIGEM';

/**
 * Prepara magias de 1º círculo com todas as variações de atributos
 * para o poder "De Outro Mundo".
 * Cada magia original é duplicada 3 vezes, uma para cada atributo mental.
 * A lista é embaralhada para garantir variação nas gerações aleatórias.
 * Usa cloneDeep para não modificar os objetos originais.
 */
function getDeOutroMundoSpells(): Spell[] {
  const allAttributes = [
    Atributo.INTELIGENCIA,
    Atributo.SABEDORIA,
    Atributo.CARISMA,
  ];

  const spellsWithVariations: Spell[] = [];

  Object.values(spellsCircle1).forEach((spell) => {
    allAttributes.forEach((attr) => {
      spellsWithVariations.push({
        ...cloneDeep(spell), // Clone profundo para não modificar o original
        customKeyAttr: attr,
      });
    });
  });

  // Embaralha a lista para que as escolhas aleatórias tenham variação
  return shuffle(spellsWithVariations);
}

const atlasOriginPowers: Record<string, OriginPower> = {
  AGRICULTOR_SAMBUR: {
    name: 'Agricultor Sambur',
    description:
      'Você é treinado em Adestramento e Sobrevivência e, uma vez por cena, pode gastar 1 PM para receber +1d6 em um teste de perícia.',
    type: ORIGIN_POWER_TYPE,
  },
  AMAZONA_DE_HIPPION: {
    name: 'Amazona de Hippion',
    description:
      'Você é treinada em Cavalgar e, se não estiver usando armadura pesada, soma seu Carisma nos PM, limitado pelo seu nível (apenas após um dia).',
    type: ORIGIN_POWER_TYPE,
  },
  AMOQUE_PURPURA: {
    name: 'Amoque Púrpura',
    description:
      'Você é treinado em Intimidação e, quando está sob efeito de Fúria, Fúria Divina ou Poder Oculto, recebe +2 em rolagens de dano.',
    type: ORIGIN_POWER_TYPE,
  },
  ANAO_DE_ARMAS: {
    name: 'Anão de Armas',
    description:
      'Você é treinado em Ofício (armeiro) e recebe +2 em rolagens de dano com armas tradicionais anãs (machados, martelos, marretas e picaretas).',
    type: ORIGIN_POWER_TYPE,
  },
  ANDARILHO_UBANERI: {
    name: 'Andarilho Ubaneri',
    description:
      'Você recebe um alikunhá, um parceiro iniciante que não conta em seu limite de parceiros, e proficiência com escudos. Caso já tenha essa proficiência, o bônus na Defesa que seu escudo fornece aumenta em +1.',
    type: ORIGIN_POWER_TYPE,
  },
  APRENDIZ_DE_DRAGOEIRO: {
    name: 'Aprendiz de Dragoeiro',
    description:
      'Você recebe +2 na Defesa contra criaturas maiores que você e +2 em Reflexos. Além disso, se passar em um teste de Reflexos, seus ataques contra a fonte do efeito causam +1d8 pontos de dano até o final da cena.',
    type: ORIGIN_POWER_TYPE,
    sheetBonuses: [
      {
        source: {
          type: 'power',
          name: 'Aprendiz de Dragoeiro',
        },
        target: {
          type: 'Skill',
          name: Skill.REFLEXOS,
        },
        modifier: {
          type: 'Fixed',
          value: 2,
        },
      },
    ],
  },
  APRENDIZ_DE_DROGADORA: {
    name: 'Aprendiz de Drogadora',
    description:
      'Você é treinada em Cura e Ofício (alquimista). Como usa partes de seu corpo para fabricar preparados alquímicos e poções, você gasta apenas 1/4 do preço dos itens em matérias-primas.',
    type: ORIGIN_POWER_TYPE,
  },
  ARISTOCRATA_DAIZENSHI: {
    name: "Aristocrata Dai'zenshi",
    description:
      'Você é treinado em Ofício (armeiro) e pode fabricar armas com uma melhoria. Se aprender a fabricar armas superiores por outra habilidade, gasta apenas 1/4 do preço das melhorias que aplica em armas.',
    type: ORIGIN_POWER_TYPE,
  },
  ASPIRANTE_A_HEROI: {
    name: 'Aspirante a Herói',
    description: 'Você recebe +1 em um atributo à sua escolha.',
    type: ORIGIN_POWER_TYPE,
  },
  ASSISTENTE_FORENSE: {
    name: 'Assistente Forense',
    description:
      'Você é treinado em Investigação e pode usar esta perícia para necropsia, identificar itens alquímicos e rastrear. Além disso, pode identificar criaturas em uma cena de crime mesmo que não estejam presentes (penalidade de –1 por dia decorrido).',
    type: ORIGIN_POWER_TYPE,
  },
  ARMEIRO_ARMADO: {
    name: 'Armeiro Armado',
    description:
      'Você é treinado em Ofício (armeiro) e pode fabricar armas com uma melhoria. Se aprender a fabricar armas superiores por outra habilidade, gasta apenas 1/4 do preço das melhorias que aplica em armas.',
    type: ORIGIN_POWER_TYPE,
  },
  BANDOLEIRO_DA_FORTALEZA: {
    name: 'Bandoleiro da Fortaleza',
    description:
      'Você é treinado em Nobreza. Sempre que falha em um teste de perícia e a falha acarreta uma consequência negativa, você recebe +2 em testes da mesma perícia até o final da cena.',
    type: ORIGIN_POWER_TYPE,
  },
  CATADOR_DA_CIDADE_VELHA: {
    name: 'Catador da Cidade Velha',
    description:
      'Você é treinado em Fortitude e Percepção e pode gastar 1 PM para receber deslocamento de natação igual ao seu deslocamento básico (ou +3m se já tiver) por uma cena. Esse deslocamento dobra o limite de tempo em que você pode segurar sua respiração.',
    type: ORIGIN_POWER_TYPE,
  },
  BARAO_ARRUINADO: {
    name: 'Barão Arruinado',
    description:
      'Você é treinado em Nobreza. Sempre que falha em um teste de perícia e a falha acarreta uma consequência negativa, você recebe +2 em testes da mesma perícia até o final da cena.',
    type: ORIGIN_POWER_TYPE,
  },
  CATIVO_DAS_FADAS: {
    name: 'Cativo das Fadas',
    description:
      'Você recebe resistência a espíritos e magia +2 e +1 PV por nível de personagem.',
    type: ORIGIN_POWER_TYPE,
    sheetBonuses: [
      {
        source: {
          type: 'power',
          name: 'Cativo das Fadas',
        },
        target: {
          type: 'PV',
        },
        modifier: {
          type: 'LevelCalc',
          formula: '{level}',
        },
      },
    ],
  },
  COMPETIDOR_DO_CIRCUITO: {
    name: 'Competidor do Circuito',
    description:
      'Você recebe o poder Torcida. Enquanto está sob efeito desse poder, sempre que reduz um inimigo a 0 PV com um ataque corpo a corpo, você recupera 1 PM.',
    type: ORIGIN_POWER_TYPE,
  },
  COSMOPOLITA: {
    name: 'Cosmopolita',
    description:
      'Escolha um poder geral ou de uma classe na qual você tenha pelo menos dois níveis, e cujos requisitos você cumpra (exceto poderes concedidos ou da Tormenta). Você recebe esse poder. Uma vez por aventura, após concluir um descanso (oito horas de sono), pode trocar esse poder por outro.',
    type: ORIGIN_POWER_TYPE,
  },
  CRIA_DA_FAVELA: {
    name: 'Cria da Favela',
    description:
      'Você recebe +1 em Constituição e, por piores que sejam as condições de descanso, sua recuperação é sempre pelo menos normal.',
    type: ORIGIN_POWER_TYPE,
  },
  CRIADO_PELAS_VORACIS: {
    name: 'Criado pelas Voracis',
    description:
      'Você recebe +2 na Defesa e Sobrevivência e +3m em seu deslocamento.',
    type: ORIGIN_POWER_TYPE,
    sheetBonuses: [
      {
        source: {
          type: 'power',
          name: 'Criado pelas Voracis',
        },
        target: {
          type: 'Defense',
        },
        modifier: {
          type: 'Fixed',
          value: 2,
        },
      },
      {
        source: {
          type: 'power',
          name: 'Criado pelas Voracis',
        },
        target: {
          type: 'Skill',
          name: Skill.SOBREVIVENCIA,
        },
        modifier: {
          type: 'Fixed',
          value: 2,
        },
      },
      {
        source: {
          type: 'power',
          name: 'Criado pelas Voracis',
        },
        target: {
          type: 'Displacement',
        },
        modifier: {
          type: 'Fixed',
          value: 3,
        },
      },
    ],
  },
  DE_OUTRO_MUNDO: {
    name: 'De Outro Mundo',
    description:
      'Você possui uma habilidade ou tecnologia especial de seu mundo de origem. Para representar esse efeito, escolha uma magia de 1º círculo e um atributo-chave para ela. Se for uma habilidade, você pode lançar essa magia. Se for uma tecnologia, você recebe um item Minúsculo (RD 10, PV iguais à metade dos seus) que ocupa 1 espaço e deve ser empunhado para lançar a magia, mas seu limite de PM para ela aumenta em +2. Por fim, escolha se o efeito será mágico ou mundano (nesse caso, não contará como uma magia, exceto para fins de acúmulo).',
    type: ORIGIN_POWER_TYPE,
    sheetActions: [
      {
        source: {
          type: 'power',
          name: 'De Outro Mundo',
        },
        action: {
          type: 'learnSpell',
          availableSpells: getDeOutroMundoSpells(), // Cada magia tem um atributo aleatório
          pick: 1,
        },
      },
    ],
  },
  DESCENDENTE_COLLENIANO: {
    name: 'Descendente Colleniano',
    description:
      'Você recebe +2 em Percepção e pode lançar a magia Visão Mística. Caso aprenda essa magia novamente, seu custo diminui em –1 PM.',
    type: ORIGIN_POWER_TYPE,
    sheetBonuses: [
      {
        source: {
          type: 'power',
          name: 'Descendente Colleniano',
        },
        target: {
          type: 'Skill',
          name: Skill.PERCEPCAO,
        },
        modifier: {
          type: 'Fixed',
          value: 2,
        },
      },
    ],
    sheetActions: [
      {
        source: {
          type: 'power',
          name: 'Descendente Colleniano',
        },
        action: {
          type: 'learnSpell',
          availableSpells: [spellsCircle1.visaoMistica],
          pick: 1,
        },
      },
    ],
  },
  DESERTOR_DA_SUPREMACIA: {
    name: 'Desertor da Supremacia',
    description:
      'Você é treinado em Guerra e recebe proficiência com espadas bastardas e escudos. Se estiver empunhando uma espada bastarda e um escudo pesado, recebe +2 em testes de ataque.',
    type: ORIGIN_POWER_TYPE,
    sheetActions: [
      {
        source: {
          type: 'power',
          name: 'Desertor da Supremacia',
        },
        action: {
          type: 'addProficiency',
          availableProficiencies: ['Espada Bastarda', 'Escudos'],
          pick: 2,
        },
      },
    ],
  },
  DUPLO_FEERICO: {
    name: 'Duplo Feérico',
    description:
      'Escolha uma habilidade de classe de 1º nível de uma classe que não seja a sua. Você recebe essa habilidade e pode usá-la como se tivesse 1 nível naquela classe (se escolher a habilidade Magias, você aprende uma única magia e recebe +1 ponto de mana, mas não soma o atributo-chave da habilidade em seu total de PM).',
    type: ORIGIN_POWER_TYPE,
    sheetActions: [
      {
        source: { type: 'power', name: 'Duplo Feérico' },
        action: {
          type: 'learnClassAbility',
          availableClasses: [
            'Arcanista',
            'Bárbaro',
            'Bardo',
            'Bucaneiro',
            'Caçador',
            'Cavaleiro',
            'Clérigo',
            'Druida',
            'Guerreiro',
            'Inventor',
            'Ladino',
            'Lutador',
            'Nobre',
            'Paladino',
          ],
          level: 1,
        },
      },
    ],
  },
};

export default atlasOriginPowers;
