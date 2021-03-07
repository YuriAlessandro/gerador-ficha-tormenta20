import PERICIAS from '../pericias';

const CACADOR = {
  name: 'Caçador',
  pv: 16,
  addpv: 4,
  pm: 4,
  addpm: 4,
  periciasbasicas: [
    {
      type: 'or',
      list: [PERICIAS.LUTA, PERICIAS.PONTARIA],
    },
    {
      type: 'and',
      list: [PERICIAS.SOBREVIVENCIA],
    }],
  periciasrestantes: {
    qtd: 6,
    list: [PERICIAS.ADESTRAMENTO, PERICIAS.ATLETISMO, PERICIAS.CAVALGAR, PERICIAS.CURA, PERICIAS.FORTITUDE, PERICIAS.FURTIVIDADE, PERICIAS.INICIATIVA, PERICIAS.INVESTIGACAO, PERICIAS.LUTA, PERICIAS.OFICIO, PERICIAS.PERCEPCAO, PERICIAS.PONTARIA, PERICIAS.REFLEXOS],
  },
  proeficiencias: ['Armas marciais e escudos.'],
  habilities: [
    {
      name: 'Marca da Presa',
      text: 'Você pode gastar uma ação de movimento e 1 PM para analisar uma criatura em alcance curto. Até o fim da cena, você recebe +1d4 nas rolagens de dano contra essa criatura. A cada quatro níveis, você pode gastar +1 PM para aumentar o bônus de dano (veja a tabela da classe).',
      effect: null,
      nivel: 1,
    },
    {
      name: 'Rastreador',
      text: 'Você recebe +2 em Sobrevivência. Além disso, pode se mover com seu deslocamento normal enquanto rastreia sem sofrer penalidades no teste de Sobrevivência.',
      effect: null,
      nivel: 1,
    },
  ],
  magics: [],
};

export default CACADOR;
