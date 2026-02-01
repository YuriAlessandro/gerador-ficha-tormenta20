import { ClassPower } from '../../../../../interfaces/Class';
import { RequirementType } from '../../../../../interfaces/Poderes';
import Skill from '../../../../../interfaces/Skills';

/**
 * Poderes de Cavaleiro do suplemento Heróis de Arton
 */
const CAVALEIRO_POWERS: ClassPower[] = [
  {
    name: 'Armas da Cavalaria',
    text: 'Você recebe +2 em testes de ataque e rolagens de dano com espadas longas e bastardas, escudos leves e pesados, lanças montadas e de justa, maças e alabardas.',
    requirements: [[{ type: RequirementType.NIVEL, value: 5 }]],
  },
  {
    name: 'Cavaleiro das Paixões',
    text: 'Você recebe +5 em testes de atributo para usar suas Paixões.',
    requirements: [
      [{ type: RequirementType.TEXT, text: 'Um poder de Paixão' }],
    ],
  },
  {
    name: 'Cavaleiro Bandido',
    text: 'Você abandonou sua honra em favor de vitórias fáceis. Você perde as habilidades Código de Honra e Duelo, mas recebe Ataque Furtivo como se fosse um ladino do seu nível de cavaleiro.',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Código de Honra' },
        { type: RequirementType.PODER, name: 'Duelo' },
      ],
    ],
  },
  {
    name: 'Cavaleiro Sagrado',
    text: 'Você recebe um poder de paladino cujos pré-requisitos cumpra, usando seu nível de cavaleiro como nível de paladino.',
    requirements: [
      [
        { type: RequirementType.PERICIA, name: Skill.RELIGIAO },
        {
          type: RequirementType.TEXT,
          text: 'Devoto de uma divindade que aceite paladinos',
        },
      ],
    ],
  },
  {
    name: 'Duelista Escudado',
    text: 'Enquanto sua habilidade Duelo estiver ativa e você estiver empunhando um escudo, você recebe RD igual ao bônus concedido pela habilidade.',
    requirements: [],
  },
  {
    name: 'Duelo Irrecusável',
    text: 'Enquanto sua habilidade Duelo estiver ativa, a criatura escolhida sofre uma penalidade em testes de ataque e rolagens de dano contra seus aliados igual ao bônus concedido pela habilidade.',
    requirements: [],
  },
  {
    name: 'Grão-Mestre',
    text: 'Você é um cavaleiro lendário. Talvez seja um oficial de alto escalão — ou mesmo o líder — de uma ordem de cavalaria, talvez seja apenas um cavaleiro errante famoso no Reinado e além. Você recebe +5 em testes de Diplomacia e Nobreza e, quando ataca um inimigo contra o qual esteja recebendo os bônus de Duelo, ou quando faz uma investida, você causa dois dados de dano extras do mesmo tipo.',
    requirements: [[{ type: RequirementType.NIVEL, value: 17 }]],
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Grão-Mestre' },
        target: { type: 'Skill', name: Skill.DIPLOMACIA },
        modifier: { type: 'Fixed', value: 5 },
      },
      {
        source: { type: 'power', name: 'Grão-Mestre' },
        target: { type: 'Skill', name: Skill.NOBREZA },
        modifier: { type: 'Fixed', value: 5 },
      },
    ],
  },
  {
    name: 'Honra Compartilhada',
    text: 'Quando usa o poder Armadura da Honra, você pode fornecer seu benefício a todos os aliados em alcance curto.',
    requirements: [
      [{ type: RequirementType.PODER, name: 'Armadura da Honra' }],
    ],
  },
  {
    name: 'Inércia do Aço',
    text: 'Quando acerta um ataque com uma arma de duas mãos em uma criatura, você pode gastar 3 PM para causar metade do dano desse ataque a cada inimigo adjacente a essa criatura.',
    requirements: [[{ type: RequirementType.NIVEL, value: 5 }]],
  },
  {
    name: 'Investida Convicta',
    text: 'Quando faz uma investida, você pode gastar 1 PM para somar seu Carisma nos testes de ataque e rolagens de dano dela.',
    requirements: [],
  },
  {
    name: 'Investida Defensiva',
    text: 'Quando faz uma investida, você não sofre a penalidade de –2 na Defesa e seu deslocamento não ativa reações de inimigos (como por Ataque Reflexo).',
    requirements: [],
  },
  {
    name: 'Mestre das Posturas',
    text: 'O custo para assumir uma postura de combate diminui em –1 PM e você pode assumir e manter duas posturas ao mesmo tempo.',
    requirements: [
      [
        { type: RequirementType.TEXT, text: 'Dois poderes de postura' },
        { type: RequirementType.NIVEL, value: 11 },
      ],
    ],
  },
  {
    name: 'Paixão: Amor',
    text: 'Ao escolher esta Paixão, decida a quem ela vai se aplicar. Pode ser um personagem específico (como um amigo, parente ou interesse romântico) ou um grupo de pessoas (como sua família). Você pode evocar esta Paixão para extrair forças desse amor. Se passar, recupera 2d4 PM por ponto de bônus máximo que sua habilidade Duelo pode fornecer.',
    requirements: [],
  },
  {
    name: 'Paixão: Honra',
    text: 'A principal virtude de um cavaleiro, a honra é o combustível de seus feitos. Você pode evocar esta Paixão para resistir aos mais severos ferimentos. Se passar, recupera 2d12 PV por ponto de bônus máximo que sua habilidade Duelo pode fornecer.',
    requirements: [],
  },
  {
    name: 'Paixão: Hospitalidade',
    text: 'Para um cavaleiro, a hospitalidade vai além do abrigo físico: representa também o papel do cavaleiro como guardião daqueles ao seu redor. Você pode evocar esta Paixão para proteger seus aliados. Se passar, você emana uma aura de 6m de raio; dentro dela, você e seus aliados recebem um bônus na Defesa e em testes de resistência igual ao bônus máximo que sua habilidade Duelo pode fornecer.',
    requirements: [],
  },
  {
    name: 'Paixão: Lealdade',
    text: 'Ao escolher esta Paixão, decida a quem sua lealdade será dedicada. Pode ser um nobre, uma organização, uma região etc. Você pode evocar esta Paixão para buscar forças nesse compromisso de fidelidade. Se passar, você recebe um bônus em testes de ataque e rolagens de dano igual ao bônus máximo que sua habilidade Duelo pode fornecer.',
    requirements: [],
  },
  {
    name: 'Postura de Combate: Armamento Pesado',
    text: 'Para assumir esta postura, você precisa estar empunhando uma arma corpo a corpo de duas mãos. Você recebe +2 em Fortitude e em rolagens de dano com esta arma. Para cada PM adicional que você gastar quando assumir a postura, esse bônus aumenta em +1 (até um limite de +5). Além disso, quando acerta um ataque nesta postura, você pode empurrar o alvo 1,5m. Você precisa atacar todos os turnos para manter esta postura ativa.',
    requirements: [],
  },
  {
    name: 'Postura de Combate: Quebra-Magia',
    text: 'Você recebe resistência a magia +2. Para cada PM adicional que você gastar quando assumir esta postura, esse bônus aumenta em +1. Além disso, uma vez por rodada, quando uma criatura em seu alcance usa uma habilidade mágica, você pode gastar 1 PM para fazer um ataque corpo a corpo contra ela.',
    requirements: [],
  },
  {
    name: 'Postura de Combate: Sequência Blindada',
    text: 'Para assumir esta postura, você precisa estar vestindo armadura pesada. Quando faz a ação agredir, você pode fazer um ataque desarmado além de seus demais ataques.',
    requirements: [],
  },
  {
    name: 'Presença de Muralha',
    text: 'Você pode gastar 1 PM para gerar uma aura com 9m de raio e duração sustentada. Cada inimigo que começar seu turno nessa área deve fazer um teste de Vontade (CD Car). Se falhar, seu deslocamento é reduzido à metade pela duração do efeito. Se passar, não é mais afetado por este efeito nesse dia. Medo.',
    requirements: [],
  },
];

export default CAVALEIRO_POWERS;
