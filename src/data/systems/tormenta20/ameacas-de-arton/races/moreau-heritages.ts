import {
  RaceAbility,
  RaceAttributeAbility,
} from '../../../../../interfaces/Race';
import { Atributo } from '../../atributos';
import Skill from '../../../../../interfaces/Skills';
import Equipment from '../../../../../interfaces/Equipment';

export interface MoreauHeritage {
  name: string;
  attributes: RaceAttributeAbility[];
  abilities: RaceAbility[];
  displacement?: number;
}

// Armas Naturais dos Moreau
const garraMoreau: Equipment = {
  group: 'Arma',
  nome: 'Garra',
  dano: '1d6',
  critico: 'x2',
  tipo: 'Corte',
  spaces: 0,
  preco: 0,
};

const mordidaMoreau: Equipment = {
  group: 'Arma',
  nome: 'Mordida',
  dano: '1d6',
  critico: 'x2',
  tipo: 'Perf.',
  spaces: 0,
  preco: 0,
};

const mordidaLeao: Equipment = {
  group: 'Arma',
  nome: 'Mordida',
  dano: '1d8',
  critico: 'x2',
  tipo: 'Perf.',
  spaces: 0,
  preco: 0,
};

const chifresMoreau: Equipment = {
  group: 'Arma',
  nome: 'Chifres',
  dano: '1d6',
  critico: 'x2',
  tipo: 'Perf.',
  spaces: 0,
  preco: 0,
};

export const MOREAU_HERITAGES: Record<string, MoreauHeritage> = {
  Coruja: {
    name: 'Herança da Coruja',
    attributes: [
      { attr: Atributo.SABEDORIA, mod: 1 },
      { attr: 'any', mod: 1 },
      { attr: 'any', mod: 1 },
    ],
    abilities: [
      {
        name: 'Espreitador',
        description: 'Você recebe visão no escuro e +2 em Percepção e Vontade.',
        sheetBonuses: [
          {
            source: { type: 'power', name: 'Espreitador' },
            target: { type: 'Skill', name: Skill.PERCEPCAO },
            modifier: { type: 'Fixed', value: 2 },
          },
          {
            source: { type: 'power', name: 'Espreitador' },
            target: { type: 'Skill', name: Skill.VONTADE },
            modifier: { type: 'Fixed', value: 2 },
          },
        ],
      },
      {
        name: 'Garras',
        description:
          'Você tem duas armas naturais de garra (dano 1d6, crítico x2, corte), uma em cada mão. Uma vez por rodada, quando usa a ação agredir para atacar com uma arma, você pode gastar 1 PM para fazer um ataque corpo a corpo extra com uma das garras, desde que ela esteja livre e não tenha sido usada para atacar neste turno. Como alternativa, se tiver habilidades que exijam uma arma secundária (como Estilo de Duas Armas), você pode usá-las com suas garras.',
        sheetActions: [
          {
            source: { type: 'power', name: 'Garras' },
            action: {
              type: 'addEquipment',
              equipment: { Arma: [garraMoreau] },
              description: 'Garra pode ser usada como arma.',
            },
          },
        ],
      },
      {
        name: 'Sapiência',
        description:
          'Você pode lançar uma magia de 1º círculo de adivinhação a sua escolha (atributo-chave Sabedoria). Caso aprenda novamente essa magia, seu custo diminui em –1 PM.',
        sheetActions: [
          {
            source: { type: 'power', name: 'Sapiência' },
            action: {
              type: 'special',
              specialAction: 'moreauSapiencia',
            },
          },
        ],
      },
    ],
  },
  Hiena: {
    name: 'Herança da Hiena',
    attributes: [
      { attr: Atributo.SABEDORIA, mod: 1 },
      { attr: 'any', mod: 1 },
      { attr: 'any', mod: 1 },
    ],
    abilities: [
      {
        name: 'Destemor',
        description:
          'Você recebe +2 em rolagens de dano e em testes de resistência contra criaturas maiores que você.',
      },
      {
        name: 'Faro',
        description:
          'Você tem olfato apurado. Contra inimigos em alcance curto que não possa ver, você não fica desprevenido e camuflagem total lhe causa apenas 20% de chance de falha.',
      },
      {
        name: 'Mordida',
        description:
          'Você possui uma arma natural de mordida (dano 1d6, crítico x2, perfuração). Uma vez por rodada, quando usa a ação agredir para atacar com outra arma, pode gastar 1 PM para fazer um ataque corpo a corpo extra com a mordida.',
        sheetActions: [
          {
            source: { type: 'power', name: 'Mordida' },
            action: {
              type: 'addEquipment',
              equipment: { Arma: [mordidaMoreau] },
              description: 'Mordida pode ser usada como arma.',
            },
          },
        ],
      },
    ],
  },
  Raposa: {
    name: 'Herança da Raposa',
    attributes: [
      { attr: Atributo.INTELIGENCIA, mod: 1 },
      { attr: 'any', mod: 1 },
      { attr: 'any', mod: 1 },
    ],
    abilities: [
      {
        name: 'Agarra-me Se Puderes',
        description:
          'Seu deslocamento é 12m (em vez de 9m) e você tem visão na penumbra.',
        sheetBonuses: [
          {
            source: { type: 'power', name: 'Agarra-me Se Puderes' },
            target: { type: 'Displacement' },
            modifier: { type: 'Fixed', value: 3 },
          },
        ],
      },
      {
        name: 'Esperteza Vulpina',
        description:
          'Você recebe +2 em duas perícias originalmente baseadas em Inteligência ou Carisma, a sua escolha.',
        sheetActions: [
          {
            source: { type: 'power', name: 'Esperteza Vulpina' },
            action: {
              type: 'special',
              specialAction: 'moreauEspertezaVulpina',
            },
          },
        ],
      },
      {
        name: 'Faro',
        description:
          'Você tem olfato apurado. Contra inimigos em alcance curto que não possa ver, você não fica desprevenido e camuflagem total lhe causa apenas 20% de chance de falha.',
      },
    ],
    displacement: 12,
  },
  Serpente: {
    name: 'Herança da Serpente',
    attributes: [
      { attr: Atributo.INTELIGENCIA, mod: 1 },
      { attr: 'any', mod: 1 },
      { attr: 'any', mod: 1 },
    ],
    abilities: [
      {
        name: 'Arborícola',
        description:
          'Você recebe deslocamento de escalada 6m e +2 em Furtividade.',
        sheetBonuses: [
          {
            source: { type: 'power', name: 'Arborícola' },
            target: { type: 'Skill', name: Skill.FURTIVIDADE },
            modifier: { type: 'Fixed', value: 2 },
          },
        ],
      },
      {
        name: 'Constritor',
        description:
          'Você recebe +2 em testes para agarrar e em rolagens de dano contra criaturas que estiver agarrando.',
      },
      {
        name: 'Instintos Traiçoeiros',
        description:
          'Você recebe visão no escuro e +2 em Diplomacia e na CD de seus efeitos mentais.',
        sheetBonuses: [
          {
            source: { type: 'power', name: 'Instintos Traiçoeiros' },
            target: { type: 'Skill', name: Skill.DIPLOMACIA },
            modifier: { type: 'Fixed', value: 2 },
          },
        ],
      },
    ],
  },
  Bufalo: {
    name: 'Herança do Búfalo',
    attributes: [
      { attr: Atributo.FORCA, mod: 1 },
      { attr: 'any', mod: 1 },
      { attr: 'any', mod: 1 },
    ],
    abilities: [
      {
        name: 'Chifres',
        description:
          'Você possui uma arma natural de chifres (dano 1d6, crítico x2, perfuração). Uma vez por rodada, quando usa a ação agredir para atacar com outra arma, pode gastar 1 PM para fazer um ataque corpo a corpo extra com os chifres.',
        sheetActions: [
          {
            source: { type: 'power', name: 'Chifres' },
            action: {
              type: 'addEquipment',
              equipment: { Arma: [chifresMoreau] },
              description: 'Chifres pode ser usado como arma.',
            },
          },
        ],
      },
      {
        name: 'Faro',
        description:
          'Você tem olfato apurado. Contra inimigos em alcance curto que não possa ver, você não fica desprevenido e camuflagem total lhe causa apenas 20% de chance de falha.',
      },
      {
        name: 'Marrada Impressionante',
        description:
          'Você recebe +2 em ataques em investida e em testes para empurrar, e pode usar Força como atributo-chave de Intimidação (em vez de Carisma).',
      },
    ],
  },
  Coelho: {
    name: 'Herança do Coelho',
    attributes: [
      { attr: Atributo.DESTREZA, mod: 1 },
      { attr: 'any', mod: 1 },
      { attr: 'any', mod: 1 },
    ],
    abilities: [
      {
        name: 'Patas Ligeiras',
        description:
          'Seu deslocamento é 12m e, quando faz uma investida ou um teste de Atletismo para correr, você não precisa percorrer uma linha reta.',
        sheetBonuses: [
          {
            source: { type: 'power', name: 'Patas Ligeiras' },
            target: { type: 'Displacement' },
            modifier: { type: 'Fixed', value: 3 },
          },
        ],
      },
      {
        name: 'Pé de Coelho',
        description:
          'Quando faz um teste de uma perícia baseada em Destreza (exceto testes de ataque), você pode gastar 1 PM para rolar dois dados e usar o melhor resultado.',
      },
      {
        name: 'Senso de Preservação',
        description:
          'Você recebe visão na penumbra e +2 em Percepção e Reflexos.',
        sheetBonuses: [
          {
            source: { type: 'power', name: 'Senso de Preservação' },
            target: { type: 'Skill', name: Skill.PERCEPCAO },
            modifier: { type: 'Fixed', value: 2 },
          },
          {
            source: { type: 'power', name: 'Senso de Preservação' },
            target: { type: 'Skill', name: Skill.REFLEXOS },
            modifier: { type: 'Fixed', value: 2 },
          },
        ],
      },
    ],
    displacement: 12,
  },
  Crocodilo: {
    name: 'Herança do Crocodilo',
    attributes: [
      { attr: Atributo.CONSTITUICAO, mod: 1 },
      { attr: 'any', mod: 1 },
      { attr: 'any', mod: 1 },
    ],
    abilities: [
      {
        name: 'Mordida Poderosa',
        description:
          'Você possui uma arma natural de mordida (dano 1d6, crítico x2, perfuração), com a qual recebe +2 em testes de agarrar. Uma vez por rodada, quando usa a ação agredir para atacar com outra arma, pode gastar 1 PM para fazer um ataque corpo a corpo extra com a mordida.',
        sheetActions: [
          {
            source: { type: 'power', name: 'Mordida Poderosa' },
            action: {
              type: 'addEquipment',
              equipment: { Arma: [mordidaMoreau] },
              description: 'Mordida pode ser usada como arma.',
            },
          },
        ],
      },
      {
        name: 'Predador Aquático',
        description:
          'Você tem deslocamento de natação 6m e recebe +1 na Defesa e +2 em Furtividade.',
        sheetBonuses: [
          {
            source: { type: 'power', name: 'Predador Aquático' },
            target: { type: 'Defense' },
            modifier: { type: 'Fixed', value: 1 },
          },
          {
            source: { type: 'power', name: 'Predador Aquático' },
            target: { type: 'Skill', name: Skill.FURTIVIDADE },
            modifier: { type: 'Fixed', value: 2 },
          },
        ],
      },
      {
        name: 'Surto Reptiliano',
        description:
          'Uma vez por cena, você pode gastar 1 PM para realizar uma ação de movimento adicional em seu turno.',
      },
    ],
  },
  Leão: {
    name: 'Herança do Leão',
    attributes: [
      { attr: Atributo.FORCA, mod: 1 },
      { attr: 'any', mod: 1 },
      { attr: 'any', mod: 1 },
    ],
    abilities: [
      {
        name: 'Mordida',
        description:
          'Você possui uma arma natural de mordida (dano 1d8, crítico x2, perfuração). Uma vez por rodada, quando usa a ação agredir para atacar com outra arma, pode gastar 1 PM para fazer um ataque corpo a corpo extra com a mordida.',
        sheetActions: [
          {
            source: { type: 'power', name: 'Mordida' },
            action: {
              type: 'addEquipment',
              equipment: { Arma: [mordidaLeao] },
              description: 'Mordida pode ser usada como arma.',
            },
          },
        ],
      },
      {
        name: 'Rugido Imponente',
        description:
          'Você pode gastar uma ação de movimento e 1 PM para emitir um rugido assustador. Todos os inimigos em alcance curto sofrem -2 em rolagens de dano por 1 rodada. Medo.',
      },
      {
        name: 'Sentidos da Realeza',
        description:
          'Você recebe visão na penumbra e +2 em Intimidação e Percepção.',
        sheetBonuses: [
          {
            source: { type: 'power', name: 'Sentidos da Realeza' },
            target: { type: 'Skill', name: Skill.INTIMIDACAO },
            modifier: { type: 'Fixed', value: 2 },
          },
          {
            source: { type: 'power', name: 'Sentidos da Realeza' },
            target: { type: 'Skill', name: Skill.PERCEPCAO },
            modifier: { type: 'Fixed', value: 2 },
          },
        ],
      },
    ],
  },
  Gato: {
    name: 'Herança do Gato',
    attributes: [
      { attr: Atributo.CARISMA, mod: 1 },
      { attr: 'any', mod: 1 },
      { attr: 'any', mod: 1 },
    ],
    abilities: [
      {
        name: 'As Muitas Vidas de um Gato',
        description:
          'Você soma seu Carisma em testes de Constituição para estabilizar sangramento e em Acrobacia e, se estiver consciente em uma queda, reduz o dano dela em 3d6.',
      },
      {
        name: 'Garras',
        description:
          'Você tem duas armas naturais de garra (dano 1d6, crítico x2, corte), uma em cada mão. Uma vez por rodada, quando usa a ação agredir para atacar com uma arma, você pode gastar 1 PM para fazer um ataque corpo a corpo extra com uma das garras, desde que ela esteja livre e não tenha sido usada para atacar neste turno. Como alternativa, se tiver habilidades que exijam uma arma secundária (como Estilo de Duas Armas), você pode usá-las com suas garras.',
        sheetActions: [
          {
            source: { type: 'power', name: 'Garras' },
            action: {
              type: 'addEquipment',
              equipment: { Arma: [garraMoreau] },
              description: 'Garra pode ser usada como arma.',
            },
          },
        ],
      },
      {
        name: 'Sentidos Felinos',
        description:
          'Você recebe visão na penumbra e +2 em Furtividade e Percepção.',
        sheetBonuses: [
          {
            source: { type: 'power', name: 'Sentidos Felinos' },
            target: { type: 'Skill', name: Skill.FURTIVIDADE },
            modifier: { type: 'Fixed', value: 2 },
          },
          {
            source: { type: 'power', name: 'Sentidos Felinos' },
            target: { type: 'Skill', name: Skill.PERCEPCAO },
            modifier: { type: 'Fixed', value: 2 },
          },
        ],
      },
    ],
  },
  Lobo: {
    name: 'Herança do Lobo',
    attributes: [
      { attr: Atributo.CARISMA, mod: 1 },
      { attr: 'any', mod: 1 },
      { attr: 'any', mod: 1 },
    ],
    abilities: [
      {
        name: 'Faro',
        description:
          'Você tem olfato apurado. Contra inimigos em alcance curto que não possa ver, você não fica desprevenido e camuflagem total lhe causa apenas 20% de chance de falha.',
      },
      {
        name: 'Mordida',
        description:
          'Você possui uma arma natural de mordida (dano 1d6, crítico x2, perfuração). Uma vez por rodada, quando usa a ação agredir para atacar com outra arma, pode gastar 1 PM para fazer um ataque corpo a corpo extra com a mordida.',
        sheetActions: [
          {
            source: { type: 'power', name: 'Mordida' },
            action: {
              type: 'addEquipment',
              equipment: { Arma: [mordidaMoreau] },
              description: 'Mordida pode ser usada como arma.',
            },
          },
        ],
      },
      {
        name: 'Táticas de Matilha',
        description:
          'Você recebe +2 nas rolagens de dano e na margem de ameaça em ataques contra oponentes que esteja flanqueando.',
      },
    ],
  },
  Morcego: {
    name: 'Herança do Morcego',
    attributes: [
      { attr: Atributo.DESTREZA, mod: 1 },
      { attr: 'any', mod: 1 },
      { attr: 'any', mod: 1 },
    ],
    abilities: [
      {
        name: 'Asas',
        description:
          'Você pode pairar a 1,5m do chão com deslocamento 9m. Isso permite que você ignore terreno difícil e o torna imune a dano por queda (a menos que esteja inconsciente). Se não estiver usando armadura pesada, você pode gastar 1 PM por rodada para voar com deslocamento de 12m. Você precisa de espaço para abrir suas asas; quando paira ou voa, ocupa o espaço de uma criatura de uma categoria de tamanho maior que a sua.',
      },
      {
        name: 'Criatura da Noite',
        description:
          'Você recebe visão no escuro e +2 em Furtividade e Percepção.',
        sheetBonuses: [
          {
            source: { type: 'power', name: 'Criatura da Noite' },
            target: { type: 'Skill', name: Skill.FURTIVIDADE },
            modifier: { type: 'Fixed', value: 2 },
          },
          {
            source: { type: 'power', name: 'Criatura da Noite' },
            target: { type: 'Skill', name: Skill.PERCEPCAO },
            modifier: { type: 'Fixed', value: 2 },
          },
        ],
      },
      {
        name: 'Ecolocalização',
        description:
          'Você pode gastar 1 PM para receber percepção às cegas em alcance médio por 1 rodada.',
      },
    ],
  },
};

export type MoreauHeritageName = keyof typeof MOREAU_HERITAGES;

export const MOREAU_HERITAGE_NAMES: MoreauHeritageName[] = Object.keys(
  MOREAU_HERITAGES
) as MoreauHeritageName[];
