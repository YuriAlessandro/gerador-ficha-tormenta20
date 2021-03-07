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
      equip: 'Arma',
    },
    {
      nome: 'Espada Curta',
      dano: '1d6',
      critico: '19',
      peso: 1,
      tipo: 'Perf.',
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
