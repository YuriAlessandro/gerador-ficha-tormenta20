import _ from 'lodash';
import Origin, { Items, OriginBenefits } from '../interfaces/Origin';
import {
  getNotRepeatedRandomSkill,
  getNotUsedSkillsFromAllowed,
} from './pericias';
import originPowers, { ORIGIN_POWER_TYPE } from './powers/originPowers';
import { DestinyPowers } from './powers/destinyPowers';
import {
  getNotRepeatedRandom,
  getRandomItemFromArray,
  pickFromArray,
} from '../functions/randomUtils';
import {
  OriginPower,
  GeneralPower,
  GeneralPowerType,
  PowerGetter,
} from '../interfaces/Poderes';
import generalPowers, { getUnrestricedTormentaPowers } from './poderes';
import Skill from '../interfaces/Skills';
import EQUIPAMENTOS, { Armas } from './equipamentos';
import combatPowers from './powers/combatPowers';
import CharacterSheet, { SubStep } from '../interfaces/CharacterSheet';
import { isPowerAvailable } from '../functions/powers';

export type origins =
  | 'Acólito'
  | 'Amigo dos Animais'
  | 'Amnésico'
  | 'Aristocrata'
  | 'Artesão'
  | 'Artista'
  | 'Assistente de Laboratório'
  | 'Batedor'
  | 'Capanga'
  | 'Charlatão'
  | 'Circense'
  | 'Criminoso'
  | 'Curandeiro'
  | 'Eremita'
  | 'Escravo'
  | 'Estudioso'
  | 'Fazendeiro'
  | 'Forasteiro'
  | 'Gladiador'
  | 'Guarda'
  | 'Herdeiro'
  | 'Herói Camponês'
  | 'Marujo'
  | 'Mateiro'
  | 'Membro de Guilda'
  | 'Mercador'
  | 'Minerador'
  | 'Nômade'
  | 'Pivete'
  | 'Refugiado'
  | 'Seguidor'
  | 'Selvagem'
  | 'Soldado'
  | 'Taverneiro'
  | 'Trabalhador';

function removeOriginPowers(origin: Origin) {
  return origin.poderes.filter((power) =>
    Object.values(GeneralPowerType).includes(power.type as GeneralPowerType)
  ) as GeneralPower[];
}

function makeOriginGeneralPowerGetter(
  origin: Origin,
  type?: GeneralPowerType
): PowerGetter {
  const originGeneralPowers = removeOriginPowers(origin);

  return (sheet: CharacterSheet, subSteps: SubStep[]) => {
    const originGeneralPowersbyOrigin =
      origin.name === 'Amnésico'
        ? Object.values(generalPowers).flat()
        : originGeneralPowers;
    const allowedByRequirement = originGeneralPowersbyOrigin.filter((power) => {
      if (type && power.type !== type) {
        return false;
      }

      return isPowerAvailable(sheet, power);
    });

    const randomPower = getNotRepeatedRandom(
      sheet.generalPowers,
      allowedByRequirement
    );

    if (randomPower) {
      sheet.generalPowers.push(randomPower);
      subSteps.push({
        name: 'Poder Geral',
        value: randomPower.name,
      });
      return;
    }

    const randomSkillFromOrigin = getNotRepeatedRandom(
      sheet.skills,
      origin.pericias
    );
    if (randomSkillFromOrigin) {
      sheet.skills.push(randomSkillFromOrigin);
      subSteps.push({
        name: 'Perícia',
        value: randomSkillFromOrigin,
      });
      return;
    }

    const randomSkill = getNotRepeatedRandom(
      sheet.skills,
      Object.values(Skill)
    );

    sheet.skills.push(randomSkill);
    subSteps.push({
      name: 'Perícia*',
      value: randomSkill,
    });
  };
}

const benefitsStrategies = {
  string: (benefit: string, benefits: OriginBenefits): OriginBenefits =>
    _.merge(benefits, {
      skills: [...benefits.skills, benefit],
    }),
  OriginPower: (
    benefit: OriginPower,
    benefits: OriginBenefits
  ): OriginBenefits =>
    _.merge(benefits, {
      powers: {
        origin: [...benefits.powers.origin, benefit],
      },
    }),
  GeneralPower: (
    benefit: GeneralPower,
    benefits: OriginBenefits,
    origin: Origin,
    type?: GeneralPowerType
  ): OriginBenefits =>
    _.merge(benefits, {
      powers: {
        general: [
          ...benefits.powers.general,
          makeOriginGeneralPowerGetter(origin, type),
        ],
      },
    }),
};

function getBenefits(
  benefits: (string | OriginPower | GeneralPower)[],
  origin: Origin,
  type?: GeneralPowerType
) {
  return benefits.reduce<OriginBenefits>(
    (acc, benefit) => {
      if (typeof benefit === 'string') {
        return benefitsStrategies.string(benefit, acc);
      }

      if (benefit.type === ORIGIN_POWER_TYPE) {
        return benefitsStrategies.OriginPower(benefit, acc);
      }

      return benefitsStrategies.GeneralPower(
        benefit as GeneralPower,
        acc,
        origin,
        type
      );
    },
    {
      skills: [],
      powers: {
        origin: [],
        general: [],
      },
    }
  );
}

function sortDefaultBenefits(usedSkills: Skill[], origin: Origin) {
  const notRepeatedSkills = getNotUsedSkillsFromAllowed(
    usedSkills,
    origin.pericias
  );

  const sortedBenefits = pickFromArray<Skill | OriginPower | GeneralPower>(
    [...notRepeatedSkills, ...origin.poderes],
    2
  );

  return getBenefits(sortedBenefits, origin);
}

export function getOriginBenefits(
  usedSkills: Skill[],
  origin: Origin
): OriginBenefits {
  if (origin.getPowersAndSkills) {
    return origin.getPowersAndSkills(usedSkills, origin);
  }

  return sortDefaultBenefits(usedSkills, origin);
}

// Amnésico recebe uma skill random e um poder geral random
function sortAmnesicBenefits(
  usedSkills: Skill[],
  origin: Origin
): OriginBenefits {
  const newSkill = getNotRepeatedRandomSkill(usedSkills);

  return {
    skills: [newSkill],
    powers: {
      general: [makeOriginGeneralPowerGetter(origin)],
      origin: [originPowers.LEMBRANCAS_GRADUAIS],
    },
  };
}

// Assitente de Laboratório recebe um poder da Tormenta
function sortLabAssistentBenefits(
  skills: Skill[],
  origin: Origin
): OriginBenefits {
  const allowedTormentaPowers = getUnrestricedTormentaPowers();
  const choosenTormentaPowers = allowedTormentaPowers.length
    ? [getRandomItemFromArray(allowedTormentaPowers)]
    : [];

  const notRepeatedSkills = getNotUsedSkillsFromAllowed(
    skills,
    origin ? origin.pericias : []
  );

  const actualOriginPowers = origin ? origin.poderes : [];

  const sortedBenefits = pickFromArray<Skill | OriginPower | GeneralPower>(
    [...notRepeatedSkills, ...actualOriginPowers, ...choosenTormentaPowers],
    2
  );

  return getBenefits(sortedBenefits, origin, GeneralPowerType.TORMENTA);
}

// Para origens que recebem um poder de combate aleatório
function getBenefitsWithRandomCombatPower(
  skills: Skill[],
  origin: Origin
): OriginBenefits {
  const notRepeatedSkills = getNotUsedSkillsFromAllowed(
    skills,
    origin ? origin.pericias : []
  );

  const actualOriginPowers = origin ? origin.poderes : [];
  const choosenCombatPower = getRandomItemFromArray(generalPowers.COMBATE);

  const sortedBenefits = pickFromArray<Skill | OriginPower | GeneralPower>(
    [...notRepeatedSkills, ...actualOriginPowers, choosenCombatPower],
    2
  );

  return getBenefits(sortedBenefits, origin, GeneralPowerType.COMBATE);
}

export const ORIGINS: Record<origins, Origin> = {
  Acólito: {
    name: 'Acólito',
    pericias: [Skill.CURA, Skill.RELIGIAO, Skill.VONTADE],
    poderes: [
      DestinyPowers.MEDICINA,
      originPowers.MEMBRO_DA_IGREJA,
      DestinyPowers.VONTADE_DE_FERRO,
    ],
    getItems: (): Items[] => [
      {
        equipment: 'Símbolo sagrado',
      },
      {
        equipment: 'Traje de Sacerdote',
      },
    ],
  },
  'Amigo dos Animais': {
    name: 'Amigo dos Animais',
    getItems: (): Items[] => [
      {
        equipment: 'Cão de guarda, cavalo, pônei ou trobo (escolha um).',
      },
    ],
    pericias: [Skill.ADESTRAMENTO, Skill.CAVALGAR],
    poderes: [originPowers.AMIGO_ESPECIAL],
  },
  Amnésico: {
    name: 'Amnésico',
    getItems: (): Items[] => [
      {
        equipment:
          'Um ou mais itens (somando até T$ 500), aprovados pelo mestre, que podem ser uma pista misteriosa do seu passado.',
      },
    ],
    pericias: [],
    poderes: [],
    getPowersAndSkills: sortAmnesicBenefits,
  },
  Aristocrata: {
    name: 'Aristocrata',
    getItems: (): Items[] => [
      {
        equipment: 'Joia de família no valor de T$ 300',
      },
      {
        equipment: 'Traje da Corte',
      },
    ],
    pericias: [Skill.DIPLOMACIA, Skill.ENGANACAO, Skill.NOBREZA],
    poderes: [originPowers.SANGUE_AZUL, DestinyPowers.COMANDAR],
  },
  Artesão: {
    name: 'Artesão',
    getItems: (): Items[] => [
      {
        equipment: 'Instrumentos de ofício (qualquer)',
      },
      {
        equipment: 'Um item que você possa fabricar de até T$ 50',
      },
    ],
    pericias: [Skill.OFICIO_ARTESANATO, Skill.VONTADE],
    poderes: [originPowers.FRUTOS_DO_TRABALHO, DestinyPowers.SORTUDO],
  },
  Artista: {
    name: 'Artista',
    getItems: (): Items[] => [
      {
        equipment:
          'Estojo de disfarces ou um instrumento musical a sua escolha.',
      },
    ],
    pericias: [Skill.ATUACAO, Skill.ENGANACAO],
    poderes: [
      DestinyPowers.ATRAENTE,
      originPowers.DOM_ARTISTICO,
      DestinyPowers.SORTUDO,
      DestinyPowers.TORCIDA,
    ],
  },
  'Assistente de Laboratório': {
    name: 'Assistente de Laboratório',
    getItems: (): Items[] => [
      {
        equipment: 'Instrumentos de Ofício (alquimista)',
      },
    ],
    pericias: [Skill.OFICIO_ALQUIMIA, Skill.MISTICISMO],
    poderes: [originPowers.ESSE_CHEIRO, DestinyPowers.VENEFICIO],
    getPowersAndSkills: sortLabAssistentBenefits,
  },
  Batedor: {
    name: 'Batedor',
    getItems: (): Items[] => {
      const allowedWapons = [
        Armas.ARCOCURTO,
        Armas.BESTALEVE,
        Armas.AZAGAIA,
        Armas.FUNDA,
        Armas.ARCO_LONGO,
        Armas.BESTA_PESADA,
      ];

      const selectedWeapon = getRandomItemFromArray(allowedWapons);

      const originItems = [
        {
          equipment: selectedWeapon,
          description: 'Uma arma simples ou marcial de ataque à distância',
        },
        {
          equipment: 'Barraca',
        },
        {
          equipment: 'Equipamento de viagem',
        },
      ];

      return originItems;
    },
    pericias: [Skill.FURTIVIDADE, Skill.PERCEPCAO, Skill.SOBREVIVENCIA],
    poderes: [
      originPowers.PROVA_DE_TUDO,
      combatPowers.ESTILO_DE_DISPARO,
      DestinyPowers.SENTIDOS_AGUCADOS,
    ],
  },
  Capanga: {
    name: 'Capanga',
    getItems: (): Items[] => {
      const allowedWapons = [Armas.ADAGA, Armas.ESPADACURTA, Armas.FOICE];

      const selectedWeapon = getRandomItemFromArray(allowedWapons);

      const originItems = [
        {
          equipment: selectedWeapon,
        },
        {
          equipment:
            'Tatuagem ou outro adereço de sua gangue aprimorado (+1 em Intimidação)',
        },
      ];

      return originItems;
    },
    pericias: [Skill.LUTA, Skill.INTIMIDACAO],
    poderes: [originPowers.CONFISSAO],
    getPowersAndSkills: getBenefitsWithRandomCombatPower,
  },
  Charlatão: {
    name: 'Charlatão',
    getItems: (): Items[] => [
      {
        equipment:
          'Joia falsificada (valor aparente de T$ 100, sem valor real)',
      },
      {
        equipment: 'Estojo de disfarces',
      },
    ],
    pericias: [Skill.ENGANACAO, Skill.JOGATINA],
    poderes: [
      originPowers.ALPINISTA_SOCIAL,
      DestinyPowers.APARENCIA_INOFENSIVA,
      DestinyPowers.SORTUDO,
    ],
  },
  Circense: {
    name: 'Circense',
    getItems: (): Items[] => [
      {
        equipment: 'Bola Colorida (+1 em Atuação)',
        qtd: 3,
      },
    ],
    pericias: [Skill.ACROBACIA, Skill.ATUACAO, Skill.REFLEXOS],
    poderes: [
      DestinyPowers.ACROBATICO,
      DestinyPowers.TORCIDA,
      originPowers.TRUQUE_DE_MAGICA,
    ],
  },
  Criminoso: {
    name: 'Criminoso',
    getItems: (): Items[] => [
      {
        equipment: 'Estojo de disfarces',
      },
      {
        equipment: 'Gazua',
      },
    ],
    pericias: [Skill.ENGANACAO, Skill.FURTIVIDADE, Skill.LADINAGEM],
    poderes: [originPowers.PUNGUISTA, DestinyPowers.VENEFICIO],
  },
  Curandeiro: {
    name: 'Curandeiro',
    getItems: (): Items[] => [
      {
        equipment: 'Bálsamo restaurador',
        qtd: 2,
      },
      {
        equipment: 'Maleta de Medicamentos',
      },
    ],
    pericias: [Skill.CURA, Skill.VONTADE],
    poderes: [
      originPowers.MEDICO_DE_CAMPO,
      DestinyPowers.MEDICINA,
      DestinyPowers.VENEFICIO,
    ],
  },
  Eremita: {
    name: 'Eremita',
    getItems: (): Items[] => [
      {
        equipment: 'Barraca',
      },
      {
        equipment: 'Equipamento de viagem',
      },
    ],
    pericias: [Skill.MISTICISMO, Skill.RELIGIAO, Skill.SOBREVIVENCIA],
    poderes: [originPowers.BUSCA_INTERIOR, DestinyPowers.LOBO_SOLITARIO],
  },
  Escravo: {
    name: 'Escravo',
    getItems: (): Items[] => [
      {
        equipment: 'Algemas',
      },
      {
        equipment: 'Ferramenta Pesada (mesma estatística que maça)',
      },
    ],
    pericias: [Skill.ATLETISMO, Skill.FORTITUDE, Skill.FURTIVIDADE],
    poderes: [originPowers.DESEJO_DE_LIBERDADE, combatPowers.VITALIDADE],
  },
  Estudioso: {
    name: 'Estudioso',
    getItems: (): Items[] => [
      {
        equipment:
          'Coleção de livros (+1 em Conhecimento, Guerra, Misticismo ou Nobreza, a sua escolha).',
      },
    ],
    pericias: [Skill.CONHECIMENTO, Skill.GUERRA, Skill.MISTICISMO],
    poderes: [
      originPowers.PALPITE_FUNDAMENTADO,
      DestinyPowers.APARENCIA_INOFENSIVA,
    ],
  },
  Fazendeiro: {
    name: 'Fazendeiro',
    getItems: (): Items[] => [
      {
        equipment: 'Carroça',
      },
      {
        equipment: 'Ferramenta agrícola (mesmas estatísticas de uma lança)',
      },
      {
        equipment: 'Ração de Viagem',
        qtd: 10,
      },
      {
        equipment: 'Animal não combativo (como uma galinha, porco ou ovelha)',
      },
    ],
    pericias: [
      Skill.ADESTRAMENTO,
      Skill.CAVALGAR,
      Skill.OFICIO_FAZENDEIRO,
      Skill.SOBREVIVENCIA,
    ],
    poderes: [originPowers.AGUA_NO_FEIJAO, combatPowers.GINETE],
  },
  Forasteiro: {
    name: 'Forasteiro',
    getItems: (): Items[] => [
      {
        equipment: 'Equipamento de viagem',
      },
      {
        equipment: 'Traje de Viagem Estrangeiro',
      },
      {
        equipment:
          'Instrumento musical exótico (+1 em uma perícia de Carisma aprovada pelo mestre)',
      },
    ],
    pericias: [Skill.CAVALGAR, Skill.PILOTAGEM, Skill.SOBREVIVENCIA],
    poderes: [originPowers.CULTURA_EXOTICA, DestinyPowers.LOBO_SOLITARIO],
  },
  Gladiador: {
    name: 'Gladiador',
    getItems: (): Items[] => {
      const allowedWapons = [
        ...EQUIPAMENTOS.armasMarciais,
        ...EQUIPAMENTOS.armasExoticas,
      ];

      const selectedWeapon = getRandomItemFromArray(allowedWapons);

      const originItems = [
        {
          equipment: selectedWeapon,
          description: 'Uma arma marcial ou exótica',
        },
        {
          equipment: 'Item sem valor recebido de um admirador',
        },
      ];

      return originItems;
    },
    pericias: [Skill.ATUACAO, Skill.LUTA],
    poderes: [
      originPowers.PAO_E_CIRCO,
      DestinyPowers.ATRAENTE,
      DestinyPowers.TORCIDA,
    ],
    getPowersAndSkills: getBenefitsWithRandomCombatPower,
  },
  Guarda: {
    name: 'Guarda',
    getItems: (): Items[] => {
      const allowedWapons = [...EQUIPAMENTOS.armasMarciais];

      const selectedWeapon = getRandomItemFromArray(allowedWapons);

      const originItems = [
        {
          equipment: 'Insígnia da Milícia',
        },
        {
          equipment: 'Apito',
        },
        {
          equipment: selectedWeapon,
          description: 'Uma arma marcial',
        },
      ];

      return originItems;
    },
    pericias: [Skill.INVESTIGACAO, Skill.LUTA, Skill.PERCEPCAO],
    poderes: [originPowers.DETETIVE, DestinyPowers.INVESTIGADOR],
    getPowersAndSkills: getBenefitsWithRandomCombatPower,
  },
  Herdeiro: {
    name: 'Herdeiro',
    getItems: (): Items[] => [
      {
        equipment: 'Símbolo de Herança',
      },
    ],
    pericias: [Skill.MISTICISMO, Skill.NOBREZA, Skill.OFICIO],
    poderes: [originPowers.HERANCA, DestinyPowers.COMANDAR],
  },
  'Herói Camponês': {
    name: 'Herói Camponês',
    getItems: (): Items[] => [
      {
        equipment: 'Instrumentos de ofício',
      },
      {
        equipment: 'Traje de Plebeu',
      },
    ],
    pericias: [Skill.ADESTRAMENTO, Skill.OFICIO],
    poderes: [
      originPowers.CORACAO_HEROICO,
      DestinyPowers.SORTUDO,
      DestinyPowers.SURTO_HEROICO,
      DestinyPowers.TORCIDA,
    ],
  },
  Marujo: {
    name: 'Marujo',
    getItems: (): Items[] => [
      {
        equipment: 'Corda',
      },
    ],
    pericias: [Skill.ATLETISMO, Skill.JOGATINA, Skill.PILOTAGEM],
    poderes: [originPowers.PASSAGEM_DE_NAVIO, DestinyPowers.ACROBATICO],
  },
  Mateiro: {
    name: 'Mateiro',
    getItems: (): Items[] => [
      {
        equipment: 'Barraca',
      },
      {
        equipment: 'Equipamento de viagem',
      },
      {
        equipment: 'Flechas',
        qtd: 20,
      },
      {
        equipment: Armas.ARCOCURTO,
        description: 'Arco curto',
      },
    ],
    pericias: [Skill.ATLETISMO, Skill.FURTIVIDADE, Skill.SOBREVIVENCIA],
    poderes: [
      originPowers.VENDEDOR_DE_CARCACAS,
      DestinyPowers.LOBO_SOLITARIO,
      DestinyPowers.SENTIDOS_AGUCADOS,
    ],
  },
  'Membro de Guilda': {
    name: 'Membro de Guilda',
    getItems: (): Items[] => {
      const allowedEquipments = [
        { equipment: 'Gazua.' },
        { equipment: 'Instrumento de Ofício' },
      ];

      const selectedItem = getRandomItemFromArray(allowedEquipments);

      return [selectedItem];
    },
    pericias: [
      Skill.DIPLOMACIA,
      Skill.ENGANACAO,
      Skill.MISTICISMO,
      Skill.OFICIO,
    ],
    poderes: [originPowers.REDE_DE_CONTATOS, DestinyPowers.FOCO_EM_PERICIA],
  },
  Mercador: {
    name: 'Mercador',
    getItems: (): Items[] => [
      {
        equipment: 'Carroça',
      },
      {
        equipment: 'Trobo',
      },
      {
        equipment: 'Mercadoria no valor de T$ 100',
      },
    ],
    pericias: [Skill.DIPLOMACIA, Skill.INTUICAO, Skill.OFICIO],
    poderes: [
      originPowers.NEGOCIACAO,
      combatPowers.PROFICIENCIA,
      DestinyPowers.SORTUDO,
    ],
  },
  Minerador: {
    name: 'Minerador',
    getItems: (): Items[] => [
      {
        equipment: 'Gemas preciosas no valor de T$ 100',
      },
      {
        equipment: Armas.PICARETA,
        description: 'Picareta',
      },
    ],
    pericias: [Skill.ATLETISMO, Skill.FORTITUDE, Skill.OFICIO_MINERADOR],
    poderes: [
      originPowers.ESCAVADOR,
      combatPowers.ATAQUE_PODEROSO,
      DestinyPowers.SENTIDOS_AGUCADOS,
    ],
  },
  Nômade: {
    name: 'Nômade',
    getItems: (): Items[] => [
      {
        equipment: Armas.BORDAO,
        description: 'Bordão',
      },
      {
        equipment: 'Equipamento de viagem',
      },
    ],
    pericias: [Skill.CAVALGAR, Skill.PILOTAGEM, Skill.SOBREVIVENCIA],
    poderes: [
      originPowers.MOCHILEIRO,
      DestinyPowers.SENTIDOS_AGUCADOS,
      DestinyPowers.LOBO_SOLITARIO,
    ],
  },
  Pivete: {
    name: 'Pivete',
    getItems: (): Items[] => [
      {
        equipment: 'Gazua',
      },
      {
        equipment: 'Traje de Plebeu',
      },
      {
        equipment: 'Animal urbano (como um cão, gato, rato ou pombo)',
      },
    ],
    pericias: [Skill.FURTIVIDADE, Skill.INICIATIVA, Skill.LADINAGEM],
    poderes: [
      originPowers.QUEBRA_GALHO,
      DestinyPowers.APARENCIA_INOFENSIVA,
      DestinyPowers.ACROBATICO,
    ],
  },
  Refugiado: {
    name: 'Refugiado',
    getItems: (): Items[] => [
      {
        equipment: 'Um item estrangeiro de até T$ 100.',
      },
    ],
    pericias: [Skill.FORTITUDE, Skill.REFLEXOS, Skill.VONTADE],
    poderes: [originPowers.ESTOICO, DestinyPowers.VONTADE_DE_FERRO],
  },
  Seguidor: {
    name: 'Seguidor',
    getItems: (): Items[] => [
      {
        equipment: 'Um item recebido de seu mestre de até T$ 100.',
      },
    ],
    pericias: [Skill.ADESTRAMENTO, Skill.OFICIO],
    poderes: [
      originPowers.ANTIGO_MESTRE,
      combatPowers.PROFICIENCIA,
      DestinyPowers.SURTO_HEROICO,
    ],
  },
  Selvagem: {
    name: 'Selvagem',
    getItems: (): Items[] => {
      const allowedWapons = [...EQUIPAMENTOS.armasSimples];

      const selectedWeapon = getRandomItemFromArray(allowedWapons);

      const originItems = [
        {
          equipment: 'Pequeno animal de estimação como um pássaro ou esquilo',
        },
        {
          equipment: selectedWeapon,
          description: 'Uma arma simples',
        },
      ];

      return originItems;
    },
    pericias: [Skill.PERCEPCAO, Skill.REFLEXOS, Skill.SOBREVIVENCIA],
    poderes: [
      originPowers.VIDA_RUSTICA,
      DestinyPowers.LOBO_SOLITARIO,
      combatPowers.VITALIDADE,
    ],
  },
  Soldado: {
    name: 'Soldado',
    getItems: (): Items[] => {
      const selectedWeapon = getRandomItemFromArray(EQUIPAMENTOS.armasMarciais);

      const originItems = [
        {
          equipment: selectedWeapon,
          description: 'Uma arma marcial ou exótica',
        },
        {
          equipment: 'Uniforme militar',
        },
        {
          equipment: 'Insígnia de seu exército',
        },
      ];

      return originItems;
    },
    pericias: [Skill.FORTITUDE, Skill.GUERRA, Skill.LUTA, Skill.PONTARIA],
    poderes: [originPowers.INFLUENCIA_MILITAR],
    getPowersAndSkills: getBenefitsWithRandomCombatPower,
  },
  Taverneiro: {
    name: 'Taverneiro',
    getItems: (): Items[] => [
      {
        equipment:
          'Rolo de macarrão ou martelo de carne (mesmas estatísticas de uma clava)',
      },
      {
        equipment: 'Panela',
      },
      {
        equipment: 'Avental',
      },
      {
        equipment: 'Caneca',
      },
      {
        equipment: 'Pano Sujo',
      },
    ],
    pericias: [Skill.DIPLOMACIA, Skill.JOGATINA, Skill.OFICIO_CULINARIA],
    poderes: [
      originPowers.GOROROBA,
      combatPowers.PROFICIENCIA,
      combatPowers.VITALIDADE,
    ],
  },
  Trabalhador: {
    name: 'Trabalhador',
    getItems: (): Items[] => [
      {
        equipment:
          'Uma ferramenta pesada (mesmas estatísticas de uma maça ou lança, a sua escolha).',
      },
    ],
    pericias: [Skill.ATLETISMO, Skill.FORTITUDE],
    poderes: [originPowers.ESFORCADO, DestinyPowers.ATLETICO],
  },
};

export default ORIGINS;
