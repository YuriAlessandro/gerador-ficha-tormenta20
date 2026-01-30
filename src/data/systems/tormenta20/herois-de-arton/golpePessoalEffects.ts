import { GolpePessoalEffect } from '../golpePessoal';

/**
 * Novos Efeitos de Golpe Pessoal do suplemento Heróis de Arton
 * Estes efeitos são adicionados ao Golpe Pessoal do Guerreiro quando o suplemento está ativo
 */
const HEROIS_ARTON_GOLPE_PESSOAL_EFFECTS: Record<string, GolpePessoalEffect> = {
  AVANCO: {
    name: 'Avanço',
    cost: 1,
    description:
      'Você se movimenta até seu deslocamento antes de desferir o golpe.',
    category: 'utility',
  },
  BRANDO: {
    name: 'Brando',
    cost: 0,
    description: 'O dano causado é não letal.',
    category: 'utility',
  },
  CARREGADO: {
    name: 'Carregado',
    cost: 1,
    description:
      'O ataque é uma investida, causando +2d8 pontos de dano. Você sofre a penalidade de –2 na Defesa como se tivesse feito uma investida.',
    category: 'offensive',
  },
  SEQUENCIAL: {
    name: 'Sequencial',
    cost: 2,
    description:
      'Você causa +1d6 pontos de dano cumulativo para cada vez que acertou este golpe em um combate. Ou seja, seu primeiro golpe causa +1d6, o segundo +2d6, o terceiro +3d6 e assim por diante.',
    category: 'offensive',
  },
  SIFAO: {
    name: 'Sifão',
    cost: 2,
    description:
      'Você recebe 1 PM temporário para cada 10 pontos de dano que causar com o golpe (arredondado para baixo). Esses PM temporários duram até o fim da cena.',
    category: 'utility',
  },
  // Limitações (custos negativos)
  GOLPE_DE_ABERTURA: {
    name: 'Golpe de Abertura',
    cost: -2,
    description: 'O ataque só pode ser usado no primeiro turno do combate.',
    category: 'drawback',
  },
  TRUQUE_SECRETO: {
    name: 'Truque Secreto',
    cost: -2,
    description:
      'O ataque só pode ser usado uma vez por alvo por cena. Se você errar o ataque, ainda assim gasta os PM.',
    category: 'drawback',
  },
};

export default HEROIS_ARTON_GOLPE_PESSOAL_EFFECTS;
