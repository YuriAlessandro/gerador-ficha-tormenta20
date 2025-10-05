import {
  RaceAbility,
  RaceAttributeAbility,
} from '../../../../../interfaces/Race';
import { Atributo } from '../../atributos';
import Skill from '../../../../../interfaces/Skills';

export interface MoreauHeritage {
  name: string;
  attributes: RaceAttributeAbility[];
  abilities: RaceAbility[];
  displacement?: number;
}

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
};

export type MoreauHeritageName = keyof typeof MOREAU_HERITAGES;

export const MOREAU_HERITAGE_NAMES: MoreauHeritageName[] = Object.keys(
  MOREAU_HERITAGES
) as MoreauHeritageName[];
