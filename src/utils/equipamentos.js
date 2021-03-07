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
    },
    {
      nome: 'Espada Curta',
      dano: '1d6',
      critico: '19',
      peso: 1,
      tipo: 'Perf.',
    },
  ],
  armasMarciais: [
    {
      nome: 'Machadinha',
      dano: '1d6',
      critico: '3x',
      peso: 2,
      tipo: 'Corte',
    },
    {
      nome: 'Cimitarra',
      dano: '1d6',
      critico: '18',
      peso: 2,
      tipo: 'Corte',
    },
  ],
  armadurasLeves: [
    {
      nome: 'Armadura de couro',
      bonus: 2,
      penalidade: 0,
      peso: 7,
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
    },
  ],
  armaduraPesada: [
    {
      nome: 'Brunea',
      bonus: 5,
      penalidade: 2,
      peso: 15,
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

// // calc DINHEIRO

// // (RECEBE A CLASSE) E RETORNA UM ARRAY COM OS ITENS e MONEY
// export function addEquipClass(classe) {
//   // 5.1 A depender da classe os itens podem variar
//   let equipamentosIniciais = EQUIPAMENTOS.inicial;
//   let armas = EQUIPAMENTOS.armasSimples;
//   let armaduras = EQUIPAMENTOS.armadurasLeves;
//   let escudos = EQUIPAMENTOS.escudos;

//   if (classe.name == 'Paladino' || classe.name == 'Guerreiro' || classe.name == 'Cavaleiro' || classe.name == 'Nobre') {

//     equipamentosIniciais +=
//   }

//   return
// }

//   // Passo 5: Selecionar equipamentos com base na classe
//   const equipamentos = addEquipClass(classe);

// 	equipamentos,

export default EQUIPAMENTOS;
