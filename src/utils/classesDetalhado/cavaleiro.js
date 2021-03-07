import PERICIAS from '../pericias';

const CAVALEIRO = {
  name: 'Cavaleiro',
  pv: 20,
  addpv: 5,
  pm: 3,
  addpm: 3,
  periciasbasicas: [
    {
      type: 'and',
      list: [PERICIAS.LUTA, PERICIAS.FORTITUDE],
    }],
  periciasrestantes: {
    qtd: 2,
    list: [
      PERICIAS.ADESTRAMENTO,
      PERICIAS.ATLETISMO,
      PERICIAS.CAVALGAR,
      PERICIAS.DIPLOMACIA,
      PERICIAS.GUERRA,
      PERICIAS.INICIATIVA,
      PERICIAS.INTIMIDACAO,
      PERICIAS.NOBREZA,
      PERICIAS.PERCEPCAO,
      PERICIAS.VONTADE,
    ],
  },
  proeficiencias: ['Armas Marciais', 'Armaduras pesadas e Escudos'],
  habilities: [
    {
      name: 'Código de Honra',
      text: 'Cavaleiros distinguem-se de meros combatentes por seguir um código de conduta. Fazem isto para mostrar que estão acima dos mercenários e bandoleiros que infestam os campos de batalha. Você não pode atacar um oponente pelas costas (em termos de jogo, não pode se beneficiar do bônus de flanquear), caído, desprevenido ou incapaz de lutar. Se violar o código, você perde todos os seus PM e só pode recuperá-los a partir do próximo dia. Rebaixar-se ao nível dos covardes e desesperados abala a autoconfiança que eleva o cavaleiro.',
      effect: null,
      nivel: 1,
    },
    {
      name: 'Baluarte',
      text: 'Você pode gastar 1 PM para receber +2 na Defesa e nos testes de resistência até o início do seu próximo turno. A cada quatro níveis, pode gastar +1 PM para aumentar o bônus em +2.',
      effect: null,
      nivel: 1,
    },
  ],
  magics: [],
};

export default CAVALEIRO;
