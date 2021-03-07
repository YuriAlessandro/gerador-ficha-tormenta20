import PERICIAS from '../pericias';

const LADINO = {
  name: 'Ladino',
  pv: 12,
  addpv: 3,
  pm: 4,
  addpm: 4,
  periciasbasicas: [
    {
      type: 'and',
      list: [PERICIAS.LADINAGEM, PERICIAS.REFLEXOS],
    }],
  periciasrestantes: {
    qtd: 8,
    list: [PERICIAS.ACROBACIA, PERICIAS.ATLETISMO, PERICIAS.ATUACAO, PERICIAS.CAVALGAR, PERICIAS.CONHECIMENTO, PERICIAS.DIPLOMACIA, PERICIAS.ENGANACAO, PERICIAS.FURTIVIDADE, PERICIAS.INICIATIVA, PERICIAS.INTIMIDACAO, PERICIAS.INTUICAO, PERICIAS.INVESTIGACAO, PERICIAS.JOGATINA, PERICIAS.LUTA, PERICIAS.OFICIO, PERICIAS.PERCEPCAO, PERICIAS.PONTARIA, PERICIAS.PILOTAGEM],
  },
  proeficiencias: ['Nenhuma.'],
  habilities: [
    {
      name: 'Ataque Furtivo',
      text: 'Você sabe atingir os pontos vitais de um inimigo distraído. Uma vez por rodada, quando atinge um alvo desprevenido com um ataque corpo a corpo ou em alcance curto, ou um alvo que esteja flanqueando, você causa 1d6 pontos de dano adicional. A cada dois níveis, esse dano adicional aumenta em +1d6. Uma criatura imune a acertos críticos também é imune a ataques furtivos.',
      effect: null,
      nivel: 1,
    },
    {
      name: 'Especialista',
      text: 'Escolha um número de perícias treinadas igual ao seu bônus de Inteligência (mínimo 1). Ao fazer um teste de uma dessas perícias, você pode gastar 1 PM para dobrar seu bônus de treinamento. Você não pode usar esta habilidade em testes de ataque.',
      effect: null,
      nivel: 1,
    },
  ],
  magics: [],
};

export default LADINO;
