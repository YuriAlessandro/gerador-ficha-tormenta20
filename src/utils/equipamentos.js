const EQUIPAMENTOS = {
  inicial: [
    {
      nome: 'Mochila',
    },
    {
      nome: 'Saco de dormir',
    },
    {
      nome: 'Traje de viajante',
    },
  ],
  armasSimples: [
    {
      nome: 'Adaga',
      dano: '1d4',
      critico: '19',
      peso: 0.5,
      tipo: 'Perf.',
      alcance: 'Curto',
      equip: 'Arma',
    },
    {
      nome: 'Espada Curta',
      dano: '1d6',
      critico: '19',
      peso: 1,
      tipo: 'Perf.',
      alcance: '-',
      equip: 'Arma',
    },
    {
      nome: 'Foice',
      dano: '1d6',
      critico: '3x',
      peso: 1,
      tipo: 'Corte',
      alcance: '-',
      equip: 'Arma',
    },
    {
      nome: 'Manopla',
      dano: '-',
      critico: '-',
      peso: 1,
      tipo: 'Impac.',
      alcance: '-',
      equip: 'Arma',
    },
    {
      nome: 'Clava',
      dano: '1d6',
      critico: '2x',
      peso: 1.5,
      tipo: 'Impac.',
      alcance: '-',
      equip: 'Arma',
    },
    {
      nome: 'Lança',
      dano: '1d6',
      critico: '2x',
      peso: 1.5,
      tipo: 'Perf.',
      alcance: 'Curto',
      equip: 'Arma',
    },
    {
      nome: 'Maça',
      dano: '1d8',
      critico: '2x',
      peso: 6,
      tipo: 'Impac.',
      alcance: '-',
      equip: 'Arma',
    },
    {
      nome: 'Bordão',
      dano: '1d6/1d6',
      critico: '2x',
      peso: 2,
      tipo: 'Impac.',
      alcance: '-',
      equip: 'Arma',
    },
    {
      nome: 'Pique',
      dano: '1d8',
      critico: '2x',
      peso: 5,
      tipo: 'Perf.',
      alcance: '-',
      equip: 'Arma',
    },
    {
      nome: 'Tacape',
      dano: '1d10',
      critico: '2x',
      peso: 4,
      tipo: 'Impacto',
      alcance: '-',
      equip: 'Arma',
    },
    {
      nome: 'Arco Curto',
      dano: '1d6',
      critico: '3x',
      peso: 1,
      tipo: 'Perf.',
      alcance: 'Médio',
      equip: 'Arma',
    },
    {
      nome: 'Besta Leve',
      dano: '1d8',
      critico: '19',
      peso: 3,
      tipo: 'Perf.',
      alcance: 'Médio',
      equip: 'Arma',
    },
    {
      nome: 'Azagaia',
      dano: '1d6',
      critico: '2x',
      peso: 1,
      tipo: 'Perf.',
      alcance: 'Médio',
      equip: 'Arma',
    },
    {
      nome: 'Funda',
      dano: '1d4',
      critico: '2x',
      peso: 0.25,
      tipo: 'Impac.',
      alcance: 'Médio',
      equip: 'Arma',
    },
  ],
  armasMarciais: [
    {
      nome: 'Machadinha',
      dano: '1d6',
      critico: '3x',
      peso: 2,
      tipo: 'Corte',
      equip: 'Arma',
    },
    {
      nome: 'Cimitarra',
      dano: '1d6',
      critico: '18',
      peso: 2,
      tipo: 'Corte',
      equip: 'Arma',
    },
  ],
  armadurasLeves: [
    {
      nome: 'Armadura de couro',
      bonus: 2,
      penalidade: 0,
      peso: 7,
      equip: 'Armadura',
    },
    {
      nome: 'Couro batido',
      bonus: 3,
      penalidade: 1,
      peso: 10,
    },
    {
      nome: 'Gibão de peles',
      bonus: 4,
      penalidade: 3,
      peso: 12,
      equip: 'Armadura',
    },
  ],
  armaduraPesada: [
    {
      nome: 'Brunea',
      bonus: 5,
      penalidade: 2,
      peso: 15,
      equip: 'Armadura',
    },
  ],
  escudos: [
    {
      nome: 'Escudo leve',
      bonus: 1,
      penalidade: 1,
      peso: 3,
    },
  ],
};

export default EQUIPAMENTOS;