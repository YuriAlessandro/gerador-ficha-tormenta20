import { cloneDeep, merge } from 'lodash';
import { getRandomItemFromArray } from '../../functions/randomUtils';
import CharacterSheet from '../../interfaces/CharacterSheet';
import {
  GeneralPower,
  GeneralPowerType,
  grantedPowers,
  RequirementType,
} from '../../interfaces/Poderes';
import Skill from '../../interfaces/Skills';
import { Atributo } from '../atributos';
import {
  addOrCheapenSpell,
  spellsCircle1,
  spellsCircle2,
} from '../magias/generalSpells';
import { getNotRepeatedRandomSkill } from '../pericias';

const GRANTED_POWERS: Record<grantedPowers, GeneralPower> = {
  AFINIDADE_COM_A_TORMENTA: {
    name: 'Afinidade com a Tormenta',
    description:
      'Você recebe +10 em testes de resistência contra efeitos da Tormenta e de suas criaturas',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  ANFIBIO: {
    name: 'Anfíbio',
    description:
      'Você pode respirar embaixo d’água e adquire deslocamento de natação igual a seu deslocamento terrestre.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  ARMAS_DA_AMBICAO: {
    name: 'Armas da Ambição',
    description:
      'Você recebe +1 em testes de ataque com armas nas quais é proficiente.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  ARSENAL_DAS_PROFUNDEZAS: {
    name: 'Arsenal das profundezas',
    description:
      'Você recebe +2 nas rolagens de dano com azagaias, lanças e tridentes.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  ASTUCIA_DA_SERPENTE: {
    name: 'Astúcia da Serpente',
    description: 'Você recebe +2 em Enganação e Intuição.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  ATAQUE_PIEDOSO: {
    name: 'Ataque Piedoso',
    description:
      ' Você pode usar armas de corpo a corpo para causar dano não letal sem sofrer a penalidade de -5 no teste de ataque',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  AURA_DE_MEDO: {
    name: 'Aura de Medo',
    description:
      'Você pode gastar 2 PM para gerar uma aura de medo com alcance curto e duração até o fim da cena. Todos os inimigos que entrem na aura devem fazer um teste de Vontade (CD Car) ou ficam abalados até o fim da cena. Uma criatura que passe no teste de Vontade fica imune a esta habilidade por um dia.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  AURA_DA_PAZ: {
    name: 'Aura de Paz',
    description:
      'Você pode gastar 2 PM para gerar uma aura de paz com alcance curto e duração de uma cena. Qualquer inimigo dentro da aura que tente fazer uma ação hostil contra você deve fazer um teste de Vontade (CD Car). Se falhar, perderá sua ação. Se passar, fica imune a esta habilidade por um dia.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  AURA_RESTAURADORA: {
    name: 'Aura Restauradora',
    description:
      'Você e seus aliados em alcance curto recuperam duas vezes mais pontos de vida por descanso.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  BENCAO_DO_MANA: {
    name: 'Bênção do Mana',
    description: 'Você recebe +3 pontos de mana (JÁ INCLUSO).',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
    action(
      sheet: CharacterSheet,
      subSteps: {
        name: string;
        value: string;
      }[]
    ): CharacterSheet {
      const sheetClone = cloneDeep(sheet);

      subSteps.push({
        name: 'Bênção do Mana',
        value: '+3 de mana',
      });

      sheetClone.pm += 3;

      return sheetClone;
    },
  },
  CARICIA_SOMBRIA: {
    name: 'Carícia Sombria',
    description:
      'Você pode gastar 1 PM e uma ação padrão para cobrir sua mão com energia negativa e tocar uma criatura em alcance corpo a corpo. A criatura sofre 2d6 pontos de dano de trevas (Fortitude CD Sab reduz à metade) e você recupera PV iguais à metade do dano causado. Você pode aprender Toque Vampírico como uma magia divina. Se fizer isso, o custo dela diminui em –1 PM.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  CENTELHA_MAGICA: {
    name: 'Centelha Mágica',
    description:
      'Escolha uma magia arcana ou divina de 1º círculo. Você aprende e pode lançar essa magia (JÁ INCLUSO).',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [
      [{ type: RequirementType.HABILIDADE, name: 'Magias', not: true }],
    ],
    action(
      sheet: CharacterSheet,
      subSteps: {
        name: string;
        value: string;
      }[]
    ): CharacterSheet {
      const sheetClone = cloneDeep(sheet);

      const newSpell = getRandomItemFromArray(Object.values(spellsCircle1));

      subSteps.push({
        name: 'Centelha Mágica',
        value: newSpell.nome,
      });

      sheetClone.spells.push(newSpell);

      return sheetClone;
    },
  },
  CONHECIMENTO_ENCICLOPEDICO: {
    name: 'Conhecimento Enciclopédico',
    description:
      'Você se torna treinado em duas perícias baseadas em Inteligência a sua escolha (JÁ INCLUSO).',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
    action(
      sheet: CharacterSheet,
      subSteps: {
        name: string;
        value: string;
      }[]
    ): CharacterSheet {
      const sheetClone = cloneDeep(sheet);

      const allowedSkills = [
        Skill.CONHECIMENTO,
        Skill.GUERRA,
        Skill.INVESTIGACAO,
        Skill.MISTICISMO,
        Skill.NOBREZA,
        Skill.OFICIO,
      ];

      const newSkill = getNotRepeatedRandomSkill(
        sheetClone.skills,
        allowedSkills
      );

      subSteps.push({
        name: 'Conhecimento Enciclopédico',
        value: `Treinamento em ${newSkill}`,
      });

      sheetClone.skills.push(newSkill);

      return sheetClone;
    },
  },
  CONJURAR_ARMA: {
    name: 'Conjurar Arma',
    description:
      'Você pode gastar 1 PM para invocar uma arma corpo a corpo ou de arremesso com a qual seja proficiente. A arma surge em sua mão, recebe um bônus de +1 em testes de ataque e rolagens de dano e dura pela cena. Você não pode criar armas de disparo, mas pode criar 20 projéteis (flechas, virotes etc.)',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  CORAGEM_TOTAL: {
    name: 'Coragem Total',
    description:
      'Você é imune a efeitos de medo, mágicos ou não. Este poder não elimina fobias raciais (como o medo de altura dos minotauros).',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  CURA_GENTIL: {
    name: 'Cura Gentil',
    description:
      'Você adiciona seu bônus de Carisma (mínimo +1) aos PV restaurados por suas magias de cura.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  CURANDEIRA_PERFEITA: {
    name: 'Curandeira Perfeita',
    description:
      'Você sempre pode escolher 10 em testes de Cura. Além disso, pode usar essa perícia mesmo sem um kit de medicamentos. Se usar o kit, recebe +2 no teste de Cura.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  DEDO_VERDE: {
    name: 'Dedo Verde',
    description: 'Você aprende e pode lançar Controlar Plantas.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
    action(
      sheet: CharacterSheet,
      subSteps: { name: string; value: string }[]
    ): CharacterSheet {
      const sheetClone = cloneDeep(sheet);
      const { spells, stepValue } = addOrCheapenSpell(
        sheet,
        spellsCircle1.controlarPlantas,
        Atributo.SABEDORIA
      );

      if (stepValue) {
        subSteps.push({
          name: 'Dedo Verde',
          value: stepValue,
        });
      }

      return merge<CharacterSheet, Partial<CharacterSheet>>(sheetClone, {
        spells,
      });
    },
  },
  DESCANSO_NATURAL: {
    name: 'Descanso Natural',
    description:
      'Para você, dormir ao relento conta como uma estalagem confortável.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  DOM_DA_IMORTALIDADE: {
    name: 'Dom da Imortalidade',
    description:
      'Você é imortal. Sempre que morre, não importando o motivo, volta à vida após 3d6 dias. Você não perde níveis de experiência.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.CLASSE, name: 'Paladino' }]],
  },
  DOM_DA_PROFECIA: {
    name: 'Dom da Profecia',
    description:
      'Você pode lançar Augúrio. Você também pode gastar 2 PM para receber +2 em um teste.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
    action(
      sheet: CharacterSheet,
      subSteps: { name: string; value: string }[]
    ): CharacterSheet {
      const sheetClone = cloneDeep(sheet);

      const newSpell = spellsCircle2.augurio;

      subSteps.push({
        name: 'Dom da Profecia',
        value: 'Adicionou magia Augúrio',
      });

      sheetClone.spells.push(newSpell);

      return sheetClone;
    },
  },
  DOM_DA_RESSUREICAO: {
    name: 'Dom da Ressurreição',
    description:
      'Você pode gastar uma ação completa e todos os PM que possui (mínimo 1 PM) para tocar o corpo de uma criatura morta há menos de um ano e ressuscitá- la. A criatura volta à vida com 1 PV e 0 PM, e perde 2 pontos de Constituição permanentemente. Este poder só pode ser usado uma vez em cada criatura.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.CLASSE, name: 'Clérigo' }]],
  },
  DOM_DA_VERDADE: {
    name: 'Dom da Verdade',
    description:
      'Você pode pagar 1 PM para receber +5 em testes de Intuição até o fim da cena.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  ESCAMAS_DRACONICAS: {
    name: 'Escamas Dracônicas',
    description: 'Você recebe +1 na Defesa (JÁ INCLUSO).',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
    action(
      sheet: CharacterSheet,
      subSteps: { name: string; value: string }[]
    ): CharacterSheet {
      const sheetClone = cloneDeep(sheet);

      subSteps.push({
        name: 'Escamas Dracônicas',
        value: '+1 na Defesa',
      });

      sheetClone.defesa += 1;

      return sheetClone;
    },
  },
  ESCUDO_MAGICO: {
    name: 'Escudo Mágico',
    description:
      'Quando lança uma magia, você recebe +2 na Defesa até o início do seu próximo turno.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  ESPADA_JUSTICEIRA: {
    name: 'Espada Justiceira',
    description:
      'Você pode gastar 1 PM para encantar sua espada (ou outra arma corpo a corpo de corte que esteja empunhando). Ela recebe +1 em testes de ataque e rolagens de dano até o fim da cena.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  ESPADA_SOLAR: {
    name: 'Espada Solar',
    description:
      'Você pode gastar 1 PM para fazer uma arma corpo a corpo de corte que esteja empunhando causar +1d6 de dano por fogo até o fim da cena.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  FARSA_DO_FINGIDOR: {
    name: 'Farsa do Fingidor',
    description: 'Você aprende e pode lançar Criar Ilusão.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
    action(
      sheet: CharacterSheet,
      subSteps: { name: string; value: string }[]
    ): CharacterSheet {
      const sheetClone = cloneDeep(sheet);
      const newSpell = spellsCircle1.criarIlusao;

      subSteps.push({
        name: 'Farsa do Fingidor',
        value: newSpell.nome,
      });

      sheetClone.spells.push(newSpell);

      return sheetClone;
    },
  },
  FORMA_DE_MACACO: {
    name: 'Forma de Macaco',
    description:
      'Você pode gastar uma ação completa e 2 PM para se transformar em um macaco. Você adquire tamanho Minúsculo (o que fornece +5 em Furtividade e –5 em testes de manobra) e recebe deslocamento de escalar 9m. Seu equipamento desaparece (e você perde seus benefícios) até você voltar ao normal, mas suas outras estatísticas não são alteradas. A transformação dura indefinidamente, mas termina caso você faça um ataque, lance uma magia ou sofra dano.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  FURIA_DIVINA: {
    name: 'Fúria Divina',
    description:
      'Você pode gastar 2 PM para invocar uma fúria selvagem, tornando-se temível em combate. Você recebe +2 em testes de ataque e rolagens de dano corpo a corpo, mas não pode executar nenhuma ação que exija paciência ou concentração (como usar a perícia Furtividade ou lançar magias). A Fúria Divina termina se, ao fim da rodada, você não tiver atacado nem sido alvo de um efeito hostil.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  GOLPISTA_DIVINO: {
    name: 'Golpista Divino',
    description: 'Você recebe +2 em Enganação e Ladinagem.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  HABITANTE_DO_DESERTO: {
    name: 'Habitante do Deserto',
    description:
      'Você recebe resistência a fogo 5 e pode pagar 1 PM para criar água pura e potável suficiente para um odre (ou outro recipiente pequeno).',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  INIMIGO_DE_TENEBRA: {
    name: 'Inimigo de Tenebra',
    description:
      'Seus ataques e habilidades causam +1d6 pontos de dano contra mortos-vivos.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  KIAI_DIVINO: {
    name: 'Kiai Divino',
    description:
      'Quando faz um ataque corpo a corpo, você pode pagar 2 PM. Se acertar o ataque, causa dano máximo.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  LIBERADE_DIVINA: {
    name: 'Liberdade Divina',
    description:
      'Você pode gastar 2 PM e uma reação para lançar Libertação com alcance pessoal e duração de 1 rodada.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  MANTO_DA_PENUMBRA: {
    name: 'Manto da Penumbra',
    description: 'Você aprende e pode lançar Escuridão.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
    action(
      sheet: CharacterSheet,
      subSteps: { name: string; value: string }[]
    ): CharacterSheet {
      const sheetClone = cloneDeep(sheet);
      const newSpell = spellsCircle1.escuridao;

      subSteps.push({
        name: 'Manto da Penumbra',
        value: newSpell.nome,
      });

      sheetClone.spells.push(newSpell);

      return sheetClone;
    },
  },
  MENTE_ANALITICA: {
    name: 'Mente Analítica',
    description: 'Você recebe +2 em Intuição e Vontade.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  MENTE_VAZIA: {
    name: 'Mente Vazia',
    description: 'Você recebe +2 em Iniciativa e Vontade.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  MESTRE_DOS_MARES: {
    name: 'Mestre dos Mares',
    description:
      'Você pode falar com animais aquáticos (como o efeito da magia Voz Divina) e aprende e pode lançar Acalmar Animal, mas só contra criaturas aquáticas.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  OLHAR_AMEDRONTADOR: {
    name: 'Olhar Amedrontador',
    description: 'Você aprende e pode lançar Amedrontar.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
    action(
      sheet: CharacterSheet,
      subSteps: { name: string; value: string }[]
    ): CharacterSheet {
      const sheetClone = cloneDeep(sheet);
      const newSpell = spellsCircle1.amedrontar;

      subSteps.push({
        name: 'Olhar Amedrontador',
        value: newSpell.nome,
      });

      sheetClone.spells.push(newSpell);

      return sheetClone;
    },
  },
  PALAVRAS_DE_BONDADE: {
    name: 'Palavras de Bondade',
    description: 'Você aprende e pode lançar Enfeitiçar.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
    action(
      sheet: CharacterSheet,
      subSteps: { name: string; value: string }[]
    ): CharacterSheet {
      const sheetClone = cloneDeep(sheet);
      const newSpell = spellsCircle1.enfeiticar;

      subSteps.push({
        name: 'Palavras de Bondade',
        value: newSpell.nome,
      });

      sheetClone.spells.push(newSpell);

      return sheetClone;
    },
  },
  PERCEPCAO_TEMPORAL: {
    name: 'Percepção Temporal',
    description:
      'Você pode gastar 3 PM para adicionar seu bônus de Sabedoria (mínimo +1, limitado por seu nível) a seus ataques, Defesa e testes de Reflexos até o fim da cena.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  PODER_OCULTO: {
    name: 'Poder Oculto',
    description:
      'Você pode gastar uma ação de movimento e 2 PM para invocar a força, a rapidez ou o vigor dos loucos. Role 1d6 para receber +4 em Força (1 ou 2), Destreza (3 ou 4) ou Constituição (5 ou 6) até o fim da cena. Você pode usar este poder várias vezes, cada vez gastando uma ação de movimento e 2 PM.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  PRESAS_VENENOSAS: {
    name: 'Presas venenosas',
    description:
      'Você pode gastar uma ação de movimento e 1 PM para envenenar uma arma corpo a corpo que esteja empunhando. Em caso de acerto, a arma causa 1d12 pontos de dano de veneno. A arma permanece envenenada até atingir uma criatura ou até o fim da cena, o que acontecer primeiro.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  REJEICAO_DIVINA: {
    name: 'Rejeição Divina',
    description:
      'Você recebe +5 em testes de resistência contra magias divinas.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  SANGUE_DE_FERRO: {
    name: 'Sangue de Ferro',
    description:
      'Você pode pagar 2 PM para receber +2 em rolagens de dano e resistência a dano 5 até o fim da cena',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  SANGUE_OFIDICO: {
    name: 'Sangue Ofídico',
    description:
      'Você recebe resistência a veneno 5 e a CD para resistir aos seus venenos aumenta em +2.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  SERVOS_DO_DRAGAO: {
    name: 'Servos do Dragão',
    description:
      'Você pode gastar uma ação completa e 2 PM para invocar 2d4+1 kobolds em espaços desocupados em alcance curto. Você pode usar uma ação de movimento para fazer os kobolds andarem (eles têm deslocamento 9m) ou uma ação padrão para fazê-los causar dano a criaturas adjacentes (1d6–1 pontos de dano de perfuração cada). Os kobolds têm For 8, Des 14, 1 PV, não têm valor de Defesa ou testes de resistência e falham automaticamente em qualquer teste oposto. Eles desaparecem quando morrem ou no fim da cena. Os kobolds não agem sem receber uma ordem. Usos criativos para criaturas invocadas fora de combate ficam a critério do mestre.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  SORTE_DOS_LOUCOS: {
    name: 'Sorte dos loucos',
    description:
      'Você pode pagar 1 PM para rolar novamente um teste recém realizado. Se ainda assim falhar no teste, você perde 1d6 PM.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  TALENTO_ARTISTICO: {
    name: 'Talento Artístico',
    description: 'Você recebe +2 em Atuação e Diplomacia.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  TEURGISTA_MISTICO: {
    name: 'Teurgista Místico',
    description:
      'Até uma magia de cada círculo que você aprender poderá ser escolhida entre magias divinas (se você for um conjurador arcano) ou entre magias arcanas (se for um conjurador divino).',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.HABILIDADE, name: 'Magias' }]],
  },
  TRANSMISSAO_DA_LOUCURA: {
    name: 'Transmissão da Loucura',
    description: 'Você pode lançar Sussurros Insanos (CD Car).',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
    action(
      sheet: CharacterSheet,
      subSteps: { name: string; value: string }[]
    ): CharacterSheet {
      const sheetClone = cloneDeep(sheet);

      const newSpell = spellsCircle2.sussurosInsanos;

      subSteps.push({
        name: 'Transmissão da Loucura',
        value: 'Ganhou a magia Sussurros Insanos',
      });

      sheetClone.spells.push(newSpell);

      return sheetClone;
    },
  },
  TROPAS_DUYSHIDAKK: {
    name: 'Tropas Duyshidakk',
    description:
      'Você pode gastar uma ação completa e 2 PM para invocar 1d4+1 goblinoides em espaços desocupados em alcance curto. Você pode usar uma ação de movimento para fazer os goblinoides andarem (eles têm deslocamento 9m) ou uma ação padrão para fazê-los causar dano a criaturas adjacentes (1d6+1 pontos de dano de corte cada). Os goblinoides têm For 14, Des 14, 1 PV, não têm valor de Defesa ou testes de resistência e falham automaticamente em qualquer teste oposto. Eles desaparecem quando morrem ou no fim da cena. Os goblinoides não agem sem receber uma ordem. Usos criativos para criaturas invocadas fora de combate ficam a critério do mestre.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  URRO_DIVINO: {
    name: 'Urro Divino',
    description:
      'Quando faz um ataque ou lança uma magia, você pode pagar 1 PM para somar seu modificador de Constituição (mínimo +1) à rolagem de dano desse ataque ou magia.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  VISAO_NAS_TREVAS: {
    name: 'Visão nas Trevas',
    description:
      'Você enxerga perfeitamente no escuro, incluindo em magias de escuridão.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  VOZ_DA_CIVILIZACAO: {
    name: 'Voz da Civilização',
    description: 'Você está sempre sob efeito de Compreensão.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
  VOZ_DA_NATUREZA: {
    name: 'Voz da Natureza',
    description:
      'Você pode falar com animais (como o efeito da magia Voz Divina) e aprende e pode lançar Acalmar Animal, mas só contra animais.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
    action(
      sheet: CharacterSheet,
      subSteps: { name: string; value: string }[]
    ): CharacterSheet {
      const sheetClone = cloneDeep(sheet);
      const newSpell = spellsCircle1.acalmarAnimal;

      subSteps.push({
        name: 'Voz da Natureza',
        value: newSpell.nome,
      });

      sheetClone.spells.push(newSpell);

      return sheetClone;
    },
  },
  VOZ_DOS_MONSTROS: {
    name: 'Voz dos Monstros',
    description:
      'Você conhece os idiomas de todos os monstros inteligentes (criaturas do tipo monstro com Int 3 ou mais) e pode se comunicar livremente com monstros não inteligentes (Int 1 ou 2), como se estivesse sob efeito da magia Voz Divina.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [],
  },
};

export default GRANTED_POWERS;
