import _ from 'lodash';
import Origin, { OriginBenefits } from '../interfaces/Origin';
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
import { Armas } from './equipamentos';
import combatPowers from './powers/combatPowers';

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
    itens: [
      {
        equipment: 'Símbolo sagrado',
      },
      {
        equipment: 'Traje de Sacerdote',
      },
    ],
    pericias: [Skill.CURA, Skill.RELIGIAO, Skill.VONTADE],
    poderes: [
      originPowers.MEMBRO_DA_IGREJA,
      DestinyPowers.MEDICINA,
      DestinyPowers.VONTADE_DE_FERRO,
    ],
  },
  'Amigo dos Animais': {
    name: 'Amigo dos Animais',
    itens: [
      {
        equipment: 'Cão de guarda, cavalo, pônei ou trobo (escolha um).',
      },
    ],
    pericias: [Skill.ADESTRAMENTO, Skill.CAVALGAR],
    poderes: [originPowers.AMIGO_ESPECIAL],
  },
  Amnésico: {
    name: 'Amnésico',
    itens: [
      {
        equipment:
          'Um ou mais itens (somando até T$ 100), que podem ser uma pista misteriosa da sua vida antiga.',
      },
    ],
    pericias: [],
    poderes: [originPowers.LEMBRANCAS_GRADUAIS],
  }, // TODO: Em vez de dois benefícios de uma lista, Amnésico recebe uma perícia e um poder escolhidos pelo mestre e o poder Lembranças Graduais
  Aristocrata: {
    name: 'Aristocrata',
    itens: [
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
    itens: [
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
    itens: [
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
    itens: [
      {
        equipment: 'Kit de Ofício (alquimia)',
      },
    ],
    pericias: [Skill.OFICIO_ALQUIMIA, Skill.MISTICISMO],
    poderes: [originPowers.ESSE_CHEIRO, DestinyPowers.VENEFICIO], // TODO: Um poder da tormenta a sua escolha
  },
  Batedor: {
    name: 'Batedor',
    itens: [
      {
        equipment: 'Barraca',
      }, // TODO: uma arma simples ou marcial de ataque à distância.
    ],
    pericias: [Skill.FURTIVIDADE, Skill.PERCEPCAO, Skill.SOBREVIVENCIA],
    poderes: [
      originPowers.PROVA_DE_TUDO,
      combatPowers.ESTILO_DE_DISPARO,
      DestinyPowers.SENTIDOS_AGUCADOS,
    ],
  },
  Capanga: {
    name: 'Capanga',
    itens: [
      {
        equipment:
          'Tatuagem ou outro adereço de sua gangue aprimorado (+2 em Intimidação),',
      },
    ], // TODO: uma arma simples corpo a corpo.
    pericias: [Skill.LUTA, Skill.INTIMIDACAO],
    poderes: [originPowers.CONFISSAO], // TODO: Um poder de combate random
  },
  Charlatão: {
    name: 'Charlatão',
    itens: [
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
    itens: [
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
    itens: [
      {
        equipment: 'Kit de Ladrão',
      },
    ],
    pericias: [Skill.ENGANACAO, Skill.FURTIVIDADE, Skill.LADINAGEM],
    poderes: [originPowers.PUNGUISTA, DestinyPowers.VENEFICIO],
  },
  Curandeiro: {
    name: 'Curandeiro',
    itens: [
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
    itens: [
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
    itens: [
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
    itens: [
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
    itens: [
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
    itens: [
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
    itens: [
      {
        equipment: 'Item sem valor recebido de um admirador',
      },
    ], // TODO: Arma marcia ou exótica
    pericias: [Skill.ATUACAO, Skill.LUTA],
    poderes: [
      originPowers.PAO_E_CIRCO,
      DestinyPowers.ATRAENTE,
      DestinyPowers.TORCIDA,
    ], // TODO: um poder de combate Random
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
    poderes: [originPowers.DETETIVE, DestinyPowers.INVESTIGADOR], // TODO: um poder de combate random
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
    poderes: [originPowers.INFLUENCIA_MILITAR], // TODO: Um poder de combate random
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
        origin: [...benefits.powers.origin, benefit],
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

function sortAmnesicBenefits(skills: Skill[]): OriginBenefits {
  const powers: (OriginPower | GeneralPower)[] = [];

  const newSkill = getNotRepeatedRandomSkill(skills);
  powers.push(originPowers.LEMBRANCAS_GRADUAIS);

  return {
    skills: [newSkill],
    powers: {
      general: [getRandomItemFromArray(Object.values(generalPowers).flat())],
      origin: [originPowers.LEMBRANCAS_GRADUAIS],
    },
  };
}

function sortLabAssistentBenefits(usedSkills: Skill[]): OriginBenefits {
  const allowedTormentaPowers = getUnrestricedTormentaPowers();
  const choosenTormentaPower = getRandomItemFromArray(allowedTormentaPowers);
  const origin = ORIGINS['Assistente de Laboratório'];

  const notRepeatedSkills = getNotUsedSkillsFromAllowed(
    usedSkills,
    origin.pericias
  );

  const sortedBenefits = pickFromArray<Skill | OriginPower | GeneralPower>(
    [...notRepeatedSkills, ...origin.poderes, choosenTormentaPower],
    2
  );

  return getBenefits(sortedBenefits);
}

const originStrategies = {
  [ORIGINS.Amnésico.name]: sortAmnesicBenefits,
  [ORIGINS['Assistente de Laboratório'].name]: sortLabAssistentBenefits,
};

// TODO: EVITAR PODER REPETIDO
export function getOriginBenefits(
  origin: Origin,
  skills: Skill[]
): OriginBenefits {
  if (originStrategies[origin.name]) {
    return originStrategies[origin.name](skills);
  }

  return sortDefaultBenefits(skills, origin);
}

export default ORIGINS;
