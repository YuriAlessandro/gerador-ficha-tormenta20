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
      'Você pode percorrer até o seu deslocamento em linha reta antes de desferir o golpe.',
    category: 'utility',
  },
  BRANDO: {
    name: 'Brando',
    cost: 0,
    description: 'Seu golpe causa dano não letal.',
    category: 'utility',
  },
  CARREGADO: {
    name: 'Carregado',
    cost: 1,
    description:
      'Você pode gastar uma ação padrão para energizar seu ataque. Se você fizer isso e atacar até a próxima rodada, seu ataque causa +2d8 pontos de dano.',
    category: 'offensive',
  },
  SEQUENCIAL: {
    name: 'Sequencial',
    cost: 2,
    description:
      'Seu golpe causa +1d6 pontos de dano. A cada vez que você acerta o golpe na mesma cena, esse bônus aumenta em um passo.',
    category: 'offensive',
  },
  SIFAO: {
    name: 'Sifão',
    cost: 2,
    description:
      'Você recebe 1 PM temporário para cada 10 pontos da rolagem de dano. Você pode receber um máximo de PM temporários por cena igual ao seu nível e eles desaparecem no fim da cena.',
    category: 'utility',
  },
  // Limitações (custos negativos)
  GOLPE_DE_ABERTURA: {
    name: 'Golpe de Abertura',
    cost: -2,
    description:
      'Seu golpe só pode ser usado em seu primeiro turno do combate.',
    category: 'drawback',
  },
  TRUQUE_SECRETO: {
    name: 'Truque Secreto',
    cost: -2,
    description:
      'Seu golpe só pode ser usado uma vez contra cada alvo por cena.',
    category: 'drawback',
  },
};

export default HEROIS_ARTON_GOLPE_PESSOAL_EFFECTS;
