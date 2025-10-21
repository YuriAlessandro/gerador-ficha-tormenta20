import { shuffle, cloneDeep } from 'lodash';
import { OriginPower } from '../../../../../interfaces/Poderes';
import Skill from '../../../../../interfaces/Skills';
import { spellsCircle1 } from '../../magias/generalSpells';
import { allArcaneSpellsCircle1 } from '../../magias/arcane';
import { Atributo } from '../../atributos';
import { Spell } from '../../../../../interfaces/Spells';
import combatPowers from '../../powers/combatPowers';
import tormentaPowers from '../../powers/tormentaPowers';

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
  DUYSHID_AKK_INFILTRADO: {
    name: 'Duyshid akk Infiltrado',
    description:
      'Você recebe +2 em Furtividade e Vontade e pode usar Sabedoria como atributo-chave de Enganação (em vez de Carisma).',
    type: ORIGIN_POWER_TYPE,
    sheetBonuses: [
      {
        source: {
          type: 'power',
          name: 'Duyshid akk Infiltrado',
        },
        target: {
          type: 'Skill',
          name: Skill.FURTIVIDADE,
        },
        modifier: {
          type: 'Fixed',
          value: 2,
        },
      },
      {
        source: {
          type: 'power',
          name: 'Duyshid akk Infiltrado',
        },
        target: {
          type: 'Skill',
          name: Skill.VONTADE,
        },
        modifier: {
          type: 'Fixed',
          value: 2,
        },
      },
      {
        source: {
          type: 'power',
          name: 'Duyshid akk Infiltrado',
        },
        target: {
          type: 'ModifySkillAttribute',
          skill: Skill.ENGANACAO,
          attribute: Atributo.SABEDORIA,
        },
        modifier: {
          type: 'Fixed',
          value: 0,
        },
      },
    ],
  },
  EMISSARIO_UBANERI: {
    name: 'Emissário Ubaneri',
    description:
      'Você recebe um alikunhá, um parceiro iniciante, e pode usar Sabedoria como atributo-chave de Misticismo (em vez de Inteligência).',
    type: ORIGIN_POWER_TYPE,
    sheetBonuses: [
      {
        source: {
          type: 'power',
          name: 'Emissário Ubaneri',
        },
        target: {
          type: 'ModifySkillAttribute',
          skill: Skill.MISTICISMO,
          attribute: Atributo.SABEDORIA,
        },
        modifier: {
          type: 'Fixed',
          value: 0,
        },
      },
    ],
  },
  ESCUDEIRO_DA_LUZ: {
    name: 'Escudeiro da Luz',
    description:
      'Você é treinado em Nobreza. Além disso, recebe +2 na Defesa e +3 PM.',
    type: ORIGIN_POWER_TYPE,
    sheetBonuses: [
      {
        source: {
          type: 'power',
          name: 'Escudeiro da Luz',
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
          name: 'Escudeiro da Luz',
        },
        target: {
          type: 'PM',
        },
        modifier: {
          type: 'Fixed',
          value: 3,
        },
      },
    ],
  },
  ESCUDEIRO_SOLITARIO: {
    name: 'Escudeiro Solitário',
    description:
      'Você é treinado em Enganação e Ladinagem e recebe +10 em testes de Enganação para se disfarçar como cavaleiro da Luz. Além disso, se tiver Código de Honra (ou outro semelhante), atacar pelas costas não faz com que você o viole.',
    type: ORIGIN_POWER_TYPE,
    sheetBonuses: [
      {
        source: {
          type: 'power',
          name: 'Escudeiro Solitário',
        },
        target: {
          type: 'Skill',
          name: Skill.ENGANACAO,
        },
        modifier: {
          type: 'Fixed',
          value: 10,
        },
      },
    ],
  },
  ESTANDARTE_VIVO: {
    name: 'Estandarte Vivo',
    description:
      'Você recebe +2 em Sobrevivência e um poder de combate ou da Tormenta à sua escolha.',
    type: ORIGIN_POWER_TYPE,
    sheetBonuses: [
      {
        source: {
          type: 'power',
          name: 'Estandarte Vivo',
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
    ],
    sheetActions: [
      {
        source: {
          type: 'power',
          name: 'Estandarte Vivo',
        },
        action: {
          type: 'getGeneralPower',
          availablePowers: [
            ...Object.values(combatPowers),
            ...Object.values(tormentaPowers),
          ],
          pick: 1,
        },
      },
    ],
  },
  ESTUDANTE_DA_ACADEMIA: {
    name: 'Estudante da Academia',
    description:
      'Você aprende e pode lançar uma magia arcana de 1º círculo a sua escolha (atributo-chave Inteligência). Além disso, pode fazer testes de Misticismo mesmo sem ser treinado nessa perícia. Se for treinado, recebe +2 em testes dela.',
    type: ORIGIN_POWER_TYPE,
    sheetBonuses: [
      {
        source: {
          type: 'power',
          name: 'Estudante da Academia',
        },
        target: {
          type: 'Skill',
          name: Skill.MISTICISMO,
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
          name: 'Estudante da Academia',
        },
        action: {
          type: 'learnSpell',
          availableSpells: allArcaneSpellsCircle1,
          pick: 1,
          customAttribute: Atributo.INTELIGENCIA,
        },
      },
    ],
  },
  ESTUDANTE_DO_COLEGIO_REAL: {
    name: 'Estudante do Colégio Real',
    description:
      'Você é treinado em Cura. Além disso, seus efeitos de cura recuperam +2 PV por dado. Você perde esse benefício caso se torne um devoto de qualquer tipo.',
    type: ORIGIN_POWER_TYPE,
    sheetBonuses: [],
  },
  EXPLORADOR_DE_RUINAS: {
    name: 'Explorador de Ruínas',
    description:
      'Você recebe +2 em Ladinagem, Percepção e Reflexos e +3m em seu deslocamento.',
    type: ORIGIN_POWER_TYPE,
    sheetBonuses: [
      {
        source: {
          type: 'power',
          name: 'Explorador de Ruínas',
        },
        target: {
          type: 'Skill',
          name: Skill.LADINAGEM,
        },
        modifier: {
          type: 'Fixed',
          value: 2,
        },
      },
      {
        source: {
          type: 'power',
          name: 'Explorador de Ruínas',
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
      {
        source: {
          type: 'power',
          name: 'Explorador de Ruínas',
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
      {
        source: {
          type: 'power',
          name: 'Explorador de Ruínas',
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
  FILHOTE_DA_REVOADA: {
    name: 'Filhote da Revoada',
    description:
      'Você é treinado em Acrobacia e Pilotagem. Quando faz um teste de uma dessas perícias, pode gastar 1 PM para rolar um dado adicional e usar o melhor resultado.',
    type: ORIGIN_POWER_TYPE,
    sheetBonuses: [],
  },
  FUTURA_LENDA: {
    name: 'Futura Lenda',
    description:
      'Escolha um dos poderes de sua classe, normalmente disponíveis a partir do 2º nível. Você recebe esse poder.',
    type: ORIGIN_POWER_TYPE,
    sheetActions: [
      {
        source: { type: 'origin', originName: 'Futura Lenda (Nova Malpetrim)' },
        action: {
          type: 'getClassPower',
          minLevel: 2,
          ignoreOnlyLevelRequirement: true,
        },
      },
    ],
    sheetBonuses: [],
  },
  GINETE_DE_TUMARKHAN: {
    name: 'Ginete de Tumarkhân',
    description:
      'Você é treinado em Cavalgar e possui um parceiro tumarkhân iniciante, com quem recebe +2 em testes de Adestramento e Cavalgar. Se receber outra montaria especial (como pelos poderes Montaria ou Montaria Sagrada), você pode usar seu tumarkhân como essa montaria, acumulando o bônus em perícias com os benefícios da montaria especial.',
    type: ORIGIN_POWER_TYPE,
    sheetBonuses: [
      {
        source: {
          type: 'origin',
          originName: 'Ginete de Tumarkhân (Khubar)',
        },
        target: {
          type: 'Skill',
          name: Skill.CAVALGAR,
        },
        modifier: {
          type: 'Fixed',
          value: 2,
        },
      },
    ],
  },
  GRUMETE_PIRATA: {
    name: 'Grumete Pirata',
    description:
      'Você é treinado em Acrobacia, Atletismo e Reflexos e, se estiver se equilibrando, escalando ou nadando, só cai ou afunda se falhar no teste de perícia por 10 ou mais (em vez de 5 ou mais).',
    type: ORIGIN_POWER_TYPE,
    sheetBonuses: [
      {
        source: {
          type: 'origin',
          originName: 'Grumete Pirata (Três Mares)',
        },
        target: {
          type: 'Skill',
          name: Skill.INTIMIDACAO,
        },
        modifier: {
          type: 'Fixed',
          value: 1,
        },
      },
    ],
  },
  GUARDIAO_GLACIAL: {
    name: 'Guardião Glacial',
    description:
      'Você recebe redução de frio 5 e proficiência em arco longo e machado de batalha. Caso já possua proficiência com essas armas, você recebe +2 em rolagens de dano com elas.',
    type: ORIGIN_POWER_TYPE,
    sheetActions: [
      {
        source: {
          type: 'origin',
          originName: 'Guardião Glacial (Uivantes)',
        },
        action: {
          type: 'addProficiency',
          availableProficiencies: ['Arco Longo', 'Machado de Batalha'],
          pick: 2,
        },
      },
    ],
    sheetBonuses: [],
  },
  INICIADO_DOS_CACA_MONSTROS: {
    name: 'Iniciado dos Caça-Monstros',
    description:
      'Você pode fazer testes para identificar criaturas com uma ação de movimento e, quando acerta um ataque em uma criatura não humanoide, pode gastar 1 PM para causar +1d8 pontos de dano.',
    type: ORIGIN_POWER_TYPE,
    sheetBonuses: [],
  },
  INSURGENTE_TAPISTANO: {
    name: 'Insurgente Tapistano',
    description:
      'Você recebe +1 em Fortitude, Reflexos e Vontade. Além disso, recebe +3 pontos de vida no 1º nível e +1 PV por nível seguinte.',
    type: ORIGIN_POWER_TYPE,
    sheetBonuses: [
      {
        source: {
          type: 'origin',
          originName: 'Insurgente Tapistano (Império de Tauron)',
        },
        target: {
          type: 'Skill',
          name: Skill.FORTITUDE,
        },
        modifier: {
          type: 'Fixed',
          value: 1,
        },
      },
      {
        source: {
          type: 'origin',
          originName: 'Insurgente Tapistano (Império de Tauron)',
        },
        target: {
          type: 'Skill',
          name: Skill.REFLEXOS,
        },
        modifier: {
          type: 'Fixed',
          value: 1,
        },
      },
      {
        source: {
          type: 'origin',
          originName: 'Insurgente Tapistano (Império de Tauron)',
        },
        target: {
          type: 'Skill',
          name: Skill.VONTADE,
        },
        modifier: {
          type: 'Fixed',
          value: 1,
        },
      },
      {
        source: {
          type: 'origin',
          originName: 'Insurgente Tapistano (Império de Tauron)',
        },
        target: {
          type: 'PV',
        },
        modifier: {
          type: 'Fixed',
          value: 3,
        },
      },
    ],
  },
  IRMAO_SEM_ESPORAS: {
    name: 'Irmão sem Esporas',
    description:
      'Você possui um irmão cavalo, um cavalo de guerra parceiro iniciante que fornece +1 em testes de ataque e Reflexos. Se receber outra montaria especial (como aquela concedida pelos poderes Montaria ou Montaria Sagrada), você pode usar seu irmão cavalo como essa montaria, acumulando o bônus em perícias com os benefícios da montaria especial.',
    type: ORIGIN_POWER_TYPE,
    sheetBonuses: [
      {
        source: {
          type: 'origin',
          originName: 'Irmão sem Esporas (Namalkah)',
        },
        target: {
          type: 'WeaponAttack',
        },
        modifier: {
          type: 'Fixed',
          value: 1,
        },
      },
      {
        source: {
          type: 'origin',
          originName: 'Irmão sem Esporas (Namalkah)',
        },
        target: {
          type: 'Skill',
          name: Skill.REFLEXOS,
        },
        modifier: {
          type: 'Fixed',
          value: 1,
        },
      },
    ],
  },
  LEGIONARIO: {
    name: 'Legionário',
    description:
      'Você é treinado em Guerra e recebe proficiência com gládios e escudos. Se estiver empunhando um gládio e um escudo pesado, recebe +1 na margem de ameaça e +1 na Defesa.',
    type: ORIGIN_POWER_TYPE,
    sheetActions: [
      {
        source: {
          type: 'origin',
          originName: 'Legionário (Império de Tauron)',
        },
        action: {
          type: 'addProficiency',
          availableProficiencies: ['Gládio', 'Escudos'],
          pick: 2,
        },
      },
    ],
    sheetBonuses: [],
  },
  LENHADOR_DE_TOLLON: {
    name: 'Lenhador de Tollon',
    description:
      'Você é treinado em Ofício (artesão) e recebe +5 em testes de perícias (exceto testes de ataque) relacionados a madeira. Além disso, você recebe proficiência com machadinhas e machados de batalha; caso já possua proficiência com essas armas, recebe +2 em rolagens de dano com elas.',
    type: ORIGIN_POWER_TYPE,
    sheetActions: [
      {
        source: {
          type: 'origin',
          originName: 'Lenhador de Tollon (Tollon)',
        },
        action: {
          type: 'addProficiency',
          availableProficiencies: ['Machadinha', 'Machado de Batalha'],
          pick: 2,
        },
      },
    ],
    sheetBonuses: [
      {
        source: {
          type: 'origin',
          originName: 'Lenhador de Tollon (Tollon)',
        },
        target: {
          type: 'Skill',
          name: Skill.OFICIO_ARTESANATO,
        },
        modifier: {
          type: 'Fixed',
          value: 5,
        },
      },
    ],
  },
  LIRICISTA_DE_LENORIENN: {
    name: 'Liricista de Lenórienn',
    description:
      'Você é treinado em Atuação e recebe +2 nessa perícia. Além disso, pode usar Carisma como atributo-chave de Misticismo (no lugar de Inteligência).',
    type: ORIGIN_POWER_TYPE,
    sheetBonuses: [
      {
        source: {
          type: 'origin',
          originName: 'Liricista de Lenórienn (Lamnor)',
        },
        target: {
          type: 'Skill',
          name: Skill.ATUACAO,
        },
        modifier: {
          type: 'Fixed',
          value: 2,
        },
      },
      {
        source: {
          type: 'origin',
          originName: 'Liricista de Lenórienn (Lamnor)',
        },
        target: {
          type: 'ModifySkillAttribute',
          skill: Skill.MISTICISMO,
          attribute: Atributo.CARISMA,
        },
        modifier: {
          type: 'Fixed',
          value: 0,
        },
      },
    ],
  },
  MEMBRO_DO_PRINCIPADO: {
    name: 'Membro do Principado',
    description:
      'Você é treinado em Diplomacia e Intuição. Quando chega em uma cidade pela primeira vez em cada aventura, pode fazer um teste de Diplomacia (CD 20). Se passar, recebe 10% de desconto em todos os itens que comprar neste lugar (cumulativo com barganha).',
    type: ORIGIN_POWER_TYPE,
    sheetBonuses: [],
  },
  NITAMURANIANO: {
    name: 'Nitamuraniano',
    description:
      'Você recebe proficiência em katana e arco longo. Caso receba proficiência nessas armas novamente, recebe +2 em rolagens de dano com elas. Além disso, quando falha em um teste de perícia originalmente baseada em Sabedoria, você pode gastar 2 PM para refazer esse teste (apenas uma vez por teste).',
    type: ORIGIN_POWER_TYPE,
    sheetActions: [
      {
        source: {
          type: 'origin',
          originName: 'Nitamuraniano (Valkaria)',
        },
        action: {
          type: 'addProficiency',
          availableProficiencies: ['Katana', 'Arco Longo'],
          pick: 2,
        },
      },
    ],
    sheetBonuses: [],
  },
  NOBRE_ZAKHAROVIANO: {
    name: 'Nobre Zakharoviano',
    description:
      'Você é treinado em Ofício (armeiro) e recebe uma arma superior com uma melhoria (exceto material especial). Se estiver de posse dessa arma, recebe +2 PM por patamar (apenas após um dia).',
    type: ORIGIN_POWER_TYPE,
    sheetBonuses: [],
  },
  NOMADE_SAR_ALLAN: {
    name: 'Nômade Sar-Allan',
    description:
      'Você recebe +2 em Fortitude e Sobrevivência e nas rolagens de dano com alfanges, arcos curtos e cimitarras.',
    type: ORIGIN_POWER_TYPE,
    sheetBonuses: [
      {
        source: {
          type: 'origin',
          originName: 'Nômade Sar-Allan (Halak-Tûr)',
        },
        target: {
          type: 'Skill',
          name: Skill.FORTITUDE,
        },
        modifier: {
          type: 'Fixed',
          value: 2,
        },
      },
      {
        source: {
          type: 'origin',
          originName: 'Nômade Sar-Allan (Halak-Tûr)',
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
    ],
  },
  PESCADOR_PARRUDO: {
    name: 'Pescador Parrudo',
    description:
      'Você recebe +2 em Atletismo, Fortitude e Sobrevivência e +3 PV. Além disso, quando faz um teste de Atletismo para nadar você avança seu deslocamento (em vez de apenas a metade).',
    type: ORIGIN_POWER_TYPE,
    sheetBonuses: [
      {
        source: {
          type: 'origin',
          originName: 'Pescador Parrudo (Khubar)',
        },
        target: {
          type: 'Skill',
          name: Skill.ATLETISMO,
        },
        modifier: {
          type: 'Fixed',
          value: 2,
        },
      },
      {
        source: {
          type: 'origin',
          originName: 'Pescador Parrudo (Khubar)',
        },
        target: {
          type: 'Skill',
          name: Skill.FORTITUDE,
        },
        modifier: {
          type: 'Fixed',
          value: 2,
        },
      },
      {
        source: {
          type: 'origin',
          originName: 'Pescador Parrudo (Khubar)',
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
          type: 'origin',
          originName: 'Pescador Parrudo (Khubar)',
        },
        target: {
          type: 'PV',
        },
        modifier: {
          type: 'Fixed',
          value: 3,
        },
      },
    ],
  },
  PLEBEU_ARCANO: {
    name: 'Plebeu Arcano',
    description:
      'Você recebe +2 PM. Além disso, uma vez por rodada, quando falha em um teste de resistência contra um efeito mágico, você pode gastar 1 PM para rolar novamente esse teste.',
    type: ORIGIN_POWER_TYPE,
    sheetBonuses: [
      {
        source: {
          type: 'origin',
          originName: 'Plebeu Arcano (Wynlla)',
        },
        target: {
          type: 'PM',
        },
        modifier: {
          type: 'Fixed',
          value: 2,
        },
      },
    ],
  },
  PRISIONEIRO_DAS_CATACUMBAS: {
    name: 'Prisioneiro das Catacumbas',
    description:
      'Você é treinado em Percepção e Reflexos e recebe resistência a armadilhas e efeitos de movimento +5.',
    type: ORIGIN_POWER_TYPE,
    sheetBonuses: [],
  },
  PROCURADO_VIVO_OU_MORTO: {
    name: 'Procurado: Vivo ou Morto',
    description:
      'Você recebe proficiência com armas de fogo. Além disso, recebe +5 em testes de Intimidação e –5 em testes de Diplomacia contra qualquer um que, a critério do mestre, o reconheça e saiba de sua fama.',
    type: ORIGIN_POWER_TYPE,
    sheetActions: [
      {
        source: {
          type: 'origin',
          originName: 'Procurado: Vivo ou Morto (Smokestone)',
        },
        action: {
          type: 'addProficiency',
          availableProficiencies: ['Armas de Fogo'],
          pick: 1,
        },
      },
    ],
    sheetBonuses: [
      {
        source: {
          type: 'origin',
          originName: 'Procurado: Vivo ou Morto (Smokestone)',
        },
        target: {
          type: 'Skill',
          name: Skill.INTIMIDACAO,
        },
        modifier: {
          type: 'Fixed',
          value: 5,
        },
      },
      {
        source: {
          type: 'origin',
          originName: 'Procurado: Vivo ou Morto (Smokestone)',
        },
        target: {
          type: 'Skill',
          name: Skill.DIPLOMACIA,
        },
        modifier: {
          type: 'Fixed',
          value: -5,
        },
      },
    ],
  },
  PROFETA_DO_AKZATH: {
    name: 'Profeta do Akzath',
    description:
      'Você é treinado em Religião e pode lançar magias mesmo sob o efeito de Fúria Divina.',
    type: ORIGIN_POWER_TYPE,
    sheetBonuses: [],
  },
  QUERIDO_FILHO: {
    name: 'Querido Filho',
    description:
      'Você recebe redução de frio e trevas 5 e visão no escuro. Se já possuir visão no escuro, em vez disso recebe +2 em Percepção.',
    type: ORIGIN_POWER_TYPE,
    sheetBonuses: [],
  },
  REBELDE_AGITADOR: {
    name: 'Rebelde Agitador',
    description:
      'Você é treinado em Iniciativa e, uma vez por aventura, pode gastar um dia para convencer pessoas comuns a ajudá-lo. Faça um teste de Diplomacia (CD 10). Se passar, você convence uma pessoa, mais uma para cada 10 pontos acima da CD. Cada pessoa pode ser usada como um parceiro iniciante de um tipo à sua escolha por uma cena.',
    type: ORIGIN_POWER_TYPE,
    sheetBonuses: [],
  },
};

export default atlasOriginPowers;
