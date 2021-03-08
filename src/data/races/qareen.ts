import Race from '../../interfaces/Race';

const QAREEN: Race = {
  name: 'Qareen',
  habilites: {
    attrs: [
      { attr: 'Carisma', mod: 4 },
      { attr: 'Inteligência', mod: 2 },
      { attr: 'Sabedoria', mod: -2 },
    ],
    other: [],
    texts: [
      'Se lançar uma magia que alguém tenha pedido desde seu último turno, o custo da magia diminui em –1 PM. Fazer um desejo ao qareen é uma ação livre.',
      'Conforme sua ascendência, você recebe resistência 10 a um tipo de dano. Escolha uma: frio (qareen da água), eletricidade (do ar), fogo (do fogo), ácido (da terra), luz (da luz) ou trevas (qareen das trevas).',
      'Você pode lançar uma magia de 1º círculo a sua escolha (atributo- chave Carisma). Caso aprenda novamente essa magia, seu custo diminui em –1 PM.',
    ],
  },
};

export default QAREEN;
