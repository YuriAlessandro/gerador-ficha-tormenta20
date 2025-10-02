export interface Familiar {
  name: string;
  description: string;
}

const FAMILIARS: Record<string, Familiar> = {
  BORBOLETA: {
    name: 'Borboleta',
    description:
      'A CD dos testes de Vontade para resistir a suas magias aumenta em +1.',
  },
  COBRA: {
    name: 'Cobra',
    description:
      'A CD dos testes de Fortitude para resistir a suas magias aumenta em +1.',
  },
  CORUJA: {
    name: 'Coruja',
    description:
      'Quando lança uma magia com alcance de toque, você pode pagar 1 PM para aumentar seu alcance para curto.',
  },
  CORVO: {
    name: 'Corvo',
    description:
      'Quando faz um teste de Misticismo ou Vontade, você pode pagar 1 PM para rolar dois dados e usar o melhor resultado.',
  },
  FALCAO: {
    name: 'Falcão',
    description: 'Você não pode ser surpreendido e nunca fica desprevenido.',
  },
  GATO: {
    name: 'Gato',
    description: 'Você recebe visão no escuro e +2 em Furtividade.',
  },
  LAGARTO: {
    name: 'Lagarto',
    description:
      'A CD dos testes de Reflexos para resistir a suas magias aumenta em +1.',
  },
  MORCEGO: {
    name: 'Morcego',
    description: 'Você adquire percepção às cegas em alcance curto.',
  },
  RATO: {
    name: 'Rato',
    description:
      'Você pode usar seu atributo-chave em Fortitude, no lugar de Constituição.',
  },
  SAPO: {
    name: 'Sapo',
    description:
      'Você soma seu atributo-chave ao seu total de pontos de vida (cumulativo).',
  },
};

export const FAMILIAR_NAMES = Object.keys(FAMILIARS);
export { FAMILIARS };
export default FAMILIARS;
