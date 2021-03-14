import _ from 'lodash';
import Origin, { Items, OriginBenefits } from '../interfaces/Origin';
import {
  getNotRepeatedRandomSkill,
  getNotUsedSkillsFromAllowed,
} from './pericias';
import originPowers, { ORIGIN_POWER_TYPE } from './powers/originPowers';
import { DestinyPowers } from './powers/destinyPowers';
import {
  getRandomItemFromArray,
  pickFromArray,
} from '../functions/randomUtils';
import { OriginPower, GeneralPower } from '../interfaces/Poderes';
import generalPowers, { getUnrestricedTormentaPowers } from './poderes';
import Skill from '../interfaces/Skills';
import EQUIPAMENTOS, { Armas } from './equipamentos';
import combatPowers from './powers/combatPowers';

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
    benefit: OriginPower,
    benefits: OriginBenefits
  ): OriginBenefits =>
    _.merge(benefits, {
      powers: {
        general: [...benefits.powers.general, benefit],
      },
    }),
};

function getBenefits(benefits: (string | OriginPower | GeneralPower)[]) {
  return benefits.reduce<OriginBenefits>(
    (acc, benefit) => {
      if (typeof benefit === 'string') {
        return benefitsStrategies.string(benefit, acc);
      }

      if (benefit.type === ORIGIN_POWER_TYPE) {
        return benefitsStrategies.OriginPower(benefit, acc);
      }

      return benefitsStrategies.GeneralPower(benefit, acc);
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

  return getBenefits(sortedBenefits);
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
function sortAmnesicBenefits(usedSkills: Skill[]): OriginBenefits {
  const newSkill = getNotRepeatedRandomSkill(usedSkills);

  return {
    skills: [newSkill],
    powers: {
      general: [getRandomItemFromArray(Object.values(generalPowers).flat())],
      origin: [originPowers.LEMBRANCAS_GRADUAIS],
    },
  };
}

// Assitente de Laboratório recebe um poder da Tormenta
function sortLabAssistentBenefits(
  skills: Skill[],
  origin?: Origin
): OriginBenefits {
  const allowedTormentaPowers = getUnrestricedTormentaPowers();
  const choosenTormentaPower = getRandomItemFromArray(allowedTormentaPowers);

  const notRepeatedSkills = getNotUsedSkillsFromAllowed(
    skills,
    origin ? origin.pericias : []
  );

  const actualOriginPowers = origin ? origin.poderes : [];

  const sortedBenefits = pickFromArray<Skill | OriginPower | GeneralPower>(
    [...notRepeatedSkills, ...actualOriginPowers, choosenTormentaPower],
    2
  );

  return getBenefits(sortedBenefits);
}

// Para origens que recebem um poder de combate aleatório
function getBenefitsWithRandomCombatPower(
  skills: Skill[],
  origin?: Origin
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

  return getBenefits(sortedBenefits);
}

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

export const ORIGINS: Record<origins, Origin> = {
  Acólito: {
    name: 'Acólito',
    pericias: [Skill.CURA, Skill.RELIGIAO, Skill.VONTADE],
    poderes: [
      originPowers.MEMBRO_DA_IGREJA,
      DestinyPowers.MEDICINA,
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
          'Um ou mais itens (somando até T$ 100), que podem ser uma pista misteriosa da sua vida antiga.',
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
        equipment: 'Joia de família no valor de T$ 100',
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
        equipment: 'Kit de Ofício (qualquer)',
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
        equipment: 'Kit de disfarces ou instrumento musical.',
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
        equipment: 'Kit de Ofício (alquimia)',
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
        ...[Armas.ARCOCURTO, Armas.BESTALEVE, Armas.AZAGAIA, Armas.FUNDA],
        ...[Armas.ARCO_LONGO, Armas.BESTA_PESADA],
      ];

      const selectedWeapon = getRandomItemFromArray(allowedWapons);

      const originItems = [
        {
          equipment: selectedWeapon,
        },
        {
          equipment: 'Barraca',
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
            'Tatuagem ou outro adereço de sua gangue aprimorado (+2 em Intimidação)',
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
          'Joia Falsificada (valor aparente de T$ 100, sem valor real),',
      },
      {
        equipment: 'Kit de Disfarces',
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
        equipment: 'Traje de Artista',
      },
      {
        equipment: 'Bola Colorida',
        qtd: 3,
      },
      {
        equipment: 'Baralho',
      },
    ],
    pericias: [Skill.ACROBACIA, Skill.ATUACAO, Skill.REFLEXOS],
    poderes: [DestinyPowers.ACROBATICO, originPowers.TRUQUE_DE_MAGICA],
  },
  Criminoso: {
    name: 'Criminoso',
    getItems: (): Items[] => [
      {
        equipment: 'Kit de Ladrão',
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
      },
      {
        equipment: 'Kit de Medicamentos',
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
        equipment: 'Kit de Medicamentos',
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
          'Livro aprimorado (+2 em Conhecimento, Guerra ou Misticismo)',
      },
      {
        equipment: 'Livro Comum',
        qtd: 3,
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
    pericias: [Skill.ADESTRAMENTO, Skill.CAVALGAR, Skill.OFICIO_FAZENDEIRO],
    poderes: [originPowers.AGUA_NO_FEIJAO, combatPowers.GINETE],
  },
  Forasteiro: {
    name: 'Forasteiro',
    getItems: (): Items[] => [
      {
        equipment: 'Diário de Viagens',
      },
      {
        equipment: 'Traje de Viagem Estrangeiro',
      },
      {
        equipment: 'Instrumento Músical Exótico',
      },
    ],
    pericias: [Skill.CAVALGAR, Skill.PILOTAGEM, Skill.SOBREVIVENCIA],
    poderes: [originPowers.CULTURA_EXOTICA, DestinyPowers.LOBO_SOLITARIO],
  },
  Gladiador: {
    name: 'Gladiador',
    // itens: [
    //   {
    //     equipment: 'Item sem valor recebido de um admirador',
    //   },
    // ], // TODO: Arma marcia ou exótica
    getItems: (): Items[] => {
      const allowedWapons = [
        ...[
          Armas.MACHADINHA,
          Armas.CIMITARRA,
          Armas.FLORETE,
          Armas.MACHADO_DE_BATALHA,
          Armas.MANGUAL,
          Armas.MARTELO_DE_GUERRA,
          Armas.PICARETA,
          Armas.TRIDENTE,
        ],
        ...[],
      ];

      const selectedWeapon = getRandomItemFromArray(allowedWapons);

      const originItems = [
        {
          equipment: selectedWeapon,
        },
        {
          equipment: 'Barraca',
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
    itens: [
      {
        equipment: 'Apito',
      },
      {
        equipment: 'Insígnia da Milícia',
      },
    ], // TODO: Uma arma marcial
    pericias: [Skill.INVESTIGACAO, Skill.LUTA, Skill.PERCEPCAO],
    poderes: [originPowers.DETETIVE, DestinyPowers.INVESTIGADOR],
    getPowersAndSkills: getBenefitsWithRandomCombatPower,
  },
  Herdeiro: {
    name: 'Herdeiro',
    itens: [
      {
        equipment: 'Símbolo de Herança',
      },
    ],
    pericias: [Skill.MISTICISMO, Skill.NOBREZA, Skill.OFICIO],
    poderes: [
      originPowers.HERANCA,
      originPowers.HERANCA,
      DestinyPowers.COMANDAR,
    ],
  },
  'Herói Camponês': {
    name: 'Herói Camponês',
    itens: [
      {
        equipment: 'Kit de Ofício',
      },
      {
        equipment: 'Traje de Plebeu',
      },
    ],
    pericias: [Skill.ADESTRAMENTO, Skill.OFICIO],
    poderes: [
      originPowers.AMIGO_DOS_PLEBEUS,
      DestinyPowers.SORTUDO,
      DestinyPowers.SURTO_HEROICO,
      DestinyPowers.TORCIDA,
    ],
  },
  Marujo: {
    name: 'Marujo',
    itens: [
      {
        equipment: 'Corda',
      },
    ],
    pericias: [Skill.ATLETISMO, Skill.JOGATINA, Skill.PILOTAGEM],
    poderes: [originPowers.PASSAGEM_DE_NAVIO, DestinyPowers.ACROBATICO],
  },
  Mateiro: {
    name: 'Mateiro',
    itens: [
      {
        equipment: 'Barraca',
      },
      {
        equipment: Armas.ARCOCURTO,
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
    itens: [
      {
        equipment: 'Kit de Ladrão',
      },
    ], // TODO: Kit de ladrão ou kit de ofício.
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
    itens: [
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
    itens: [
      {
        equipment: 'Gemas preciosas no valor de T$ 100',
      },
      {
        equipment: Armas.PICARETA,
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
    itens: [
      {
        equipment: Armas.BORDAO,
      },
      {
        equipment: 'Bussola',
      },
    ],
    pericias: [Skill.CAVALGAR, Skill.PILOTAGEM, Skill.SOBREVIVENCIA],
    poderes: [originPowers.MOCHILEIRO, DestinyPowers.SENTIDOS_AGUCADOS],
  },
  Pivete: {
    name: 'Pivete',
    itens: [
      {
        equipment: 'Kit de Ladrão',
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
    itens: [
      {
        equipment: 'Um item estrangeiro de até T$ 100.',
      },
    ],
    pericias: [Skill.FORTITUDE, Skill.REFLEXOS, Skill.VONTADE],
    poderes: [originPowers.ESTOICO, DestinyPowers.VONTADE_DE_FERRO],
  },
  Seguidor: {
    name: 'Seguidor',
    itens: [
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
    itens: [
      {
        equipment: 'Pequeno animal de estimação como um pássaro ou esquilo',
      }, // TODO: Uma arma simples
    ],
    pericias: [Skill.PERCEPCAO, Skill.REFLEXOS, Skill.SOBREVIVENCIA],
    poderes: [
      originPowers.VIDA_RUSTICA,
      DestinyPowers.LOBO_SOLITARIO,
      combatPowers.VITALIDADE,
    ],
  },
  Soldado: {
    name: 'Soldado',
    itens: [
      {
        equipment: 'Uniforme Militar',
      },
      {
        equipment: 'Insígnia de seu exército',
      },
    ],
    pericias: [Skill.FORTITUDE, Skill.GUERRA, Skill.LUTA, Skill.PONTARIA],
    poderes: [originPowers.INFLUENCIA_MILITAR],
    getPowersAndSkills: getBenefitsWithRandomCombatPower,
  },
  Taverneiro: {
    name: 'Taverneiro',
    itens: [
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
    itens: [
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
