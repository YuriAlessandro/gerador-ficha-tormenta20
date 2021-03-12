import { merge } from 'lodash';
import { Spell, spellsCircles } from '../../interfaces/Spells';

export const manaExpenseByCircle: Record<spellsCircles, number> = {
  [spellsCircles.c1]: 1,
  [spellsCircles.c2]: 3,
  [spellsCircles.c3]: 6,
  [spellsCircles.c4]: 10,
  [spellsCircles.c5]: 15,
};

export type spellsCircle1Names =
  | 'abencoarAlimentos'
  | 'acalmarAnimal'
  | 'adagaMental'
  | 'alarme'
  | 'amedrontar'
  | 'areaEscorregadia'
  | 'armaEspiritual'
  | 'armaMagica'
  | 'armaduraArcana'
  | 'armamentoDaNatureza'
  | 'aviso'
  | 'bencao'
  | 'caminhosDaNatureza'
  | 'comando'
  | 'compreensao'
  | 'concentracaoDeCombate'
  | 'conjurarMonstro'
  | 'consagrar'
  | 'controlarPlantas'
  | 'criarElementos'
  | 'criarIlusao'
  | 'curarFerimentos'
  | 'despedacar'
  | 'detectarAmeacas'
  | 'disfarceIlusorio'
  | 'enfeiticar'
  | 'escudoDaFe'
  | 'escuridao'
  | 'explosaoDeChamas'
  | 'hipnotismo'
  | 'imagemEspelhada'
  | 'infligirFerimentos'
  | 'lequeCromatico'
  | 'luz'
  | 'nevoa'
  | 'orientacao'
  | 'perdicao'
  | 'primorAtletico'
  | 'profanar'
  | 'protecaoDivina'
  | 'quedaSuave'
  | 'raioDoEnfraquecimento'
  | 'resistenciaAEnergia'
  | 'santuario'
  | 'setaInfalivelDeTalude'
  | 'sono'
  | 'suporteAmbiental'
  | 'teia'
  | 'toqueChocante'
  | 'trancaArcana'
  | 'tranquilidade'
  | 'transmutarObjetos'
  | 'visaoMistica'
  | 'vitalidadeFantasma';

export const spellsCircle1: Record<spellsCircle1Names, Spell> = {
  abencoarAlimentos: {
    spellCircle: spellsCircles.c1,
    nome: 'Abençoar Alimentos',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: 'Alimento para 1 criatura',
    duracao: 'Cena',
  },
  acalmarAnimal: {
    spellCircle: spellsCircles.c1,
    nome: 'Acalmar Animal',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 animal',
    duracao: 'Cena',
    resistencia: 'Vontade anula',
  },
  adagaMental: {
    spellCircle: spellsCircles.c1,
    nome: 'Adaga Mental',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 criatura',
    duracao: 'Instantânea',
    resistencia: 'Vontade parcial',
  },
  alarme: {
    spellCircle: spellsCircles.c1,
    nome: 'Alarme',
    execucao: 'Padrão',
    alcance: 'Curto',
    area: 'Esfera de 9m de raio',
    duracao: '1 dia',
  },
  amedrontar: {
    spellCircle: spellsCircles.c1,
    nome: 'Amedrontar',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 animal ou humanoide de ND 2 ou menor',
    duracao: 'Cena',
    resistencia: 'Vontade parcial',
  },
  areaEscorregadia: {
    spellCircle: spellsCircles.c1,
    nome: 'Área Escorregadia',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: 'Quadrado de 3m ou 1 objeto',
    duracao: 'Cena',
    resistencia: 'Reflexos',
  },
  armaEspiritual: {
    spellCircle: spellsCircles.c1,
    nome: 'Arma Espiritual',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
  },
  armaMagica: {
    spellCircle: spellsCircles.c1,
    nome: 'Arma Mágica',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 arma',
    duracao: 'Cena',
  },
  armaduraArcana: {
    spellCircle: spellsCircles.c1,
    nome: 'Armadura Arcana',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
  },
  armamentoDaNatureza: {
    spellCircle: spellsCircles.c1,
    nome: 'Armamento da Natureza',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 arma',
    duracao: 'Cena',
  },
  aviso: {
    spellCircle: spellsCircles.c1,
    nome: 'Aviso',
    execucao: 'Movimento',
    alcance: 'Longo',
    alvo: '1 criatura',
    duracao: 'Instantânea',
  },
  bencao: {
    spellCircle: spellsCircles.c1,
    nome: 'Bênção',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: 'Criaturas escolhidas',
    duracao: 'Cena',
  },
  caminhosDaNatureza: {
    spellCircle: spellsCircles.c1,
    nome: 'Caminhos da Natureza',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 arma',
    duracao: 'Cena',
  },
  comando: {
    spellCircle: spellsCircles.c1,
    nome: 'Comando',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 humanoide',
    duracao: '1 rodada',
    resistencia: 'Vontade anula',
  },
  compreensao: {
    spellCircle: spellsCircles.c1,
    nome: 'Compreensão',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura ou texto',
    duracao: 'Cena',
    resistencia: 'Vontade anula',
  },
  concentracaoDeCombate: {
    spellCircle: spellsCircles.c1,
    nome: 'Concentração de Combate',
    execucao: 'Livre',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: '1 rodada',
  },
  conjurarMonstro: {
    spellCircle: spellsCircles.c1,
    nome: 'Conjurar Monstro',
    execucao: 'Completa',
    alcance: 'Curto',
    alvo: '1 criatura conjurada',
    duracao: 'Sustentada',
  },
  consagrar: {
    spellCircle: spellsCircles.c1,
    nome: 'Consagrar',
    execucao: 'Padrão',
    alcance: 'Longo',
    area: 'Esfera com 9m de raio',
    duracao: '1 dia',
  },
  controlarPlantas: {
    spellCircle: spellsCircles.c1,
    nome: 'Controlar Plantas',
    execucao: 'Padrão',
    alcance: 'Curto',
    area: 'quadrado com 9m de lado',
    duracao: 'Cena',
    resistencia: 'Reflexos anula',
  },
  criarElementos: {
    spellCircle: spellsCircles.c1,
    nome: 'Criar Elementos',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: 'Elemento escolhido',
    duracao: 'Instantânea',
  },
  criarIlusao: {
    spellCircle: spellsCircles.c1,
    nome: 'Criar Ilusão',
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: 'Ilusão que se estende a até 4 cubos de 1,5m',
    duracao: 'Cena',
    resistencia: 'Vontade desacredita',
  },
  curarFerimentos: {
    spellCircle: spellsCircles.c1,
    nome: 'Curar Ferimentos',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Instantânea',
  },
  despedacar: {
    spellCircle: spellsCircles.c1,
    nome: 'Despedaçar',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 critura ou objeto mundano pequeno',
    duracao: 'Instantânea',
    resistencia: 'Fortitude parcial ou Reflexos anula',
  },
  detectarAmeacas: {
    spellCircle: spellsCircles.c1,
    nome: 'Detectar Ameaças',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Esfera de 9m de raio',
    duracao: 'Instantânea',
  },
  disfarceIlusorio: {
    spellCircle: spellsCircles.c1,
    nome: 'Disfarce Ilusório',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    resistencia: 'Vontade desacredita',
  },
  enfeiticar: {
    spellCircle: spellsCircles.c1,
    nome: 'Enfeitiçar',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 humanoide',
    duracao: 'Cena',
    resistencia: 'Vontade anula',
  },
  escudoDaFe: {
    spellCircle: spellsCircles.c1,
    nome: 'Escudo da Fé',
    execucao: 'Reação',
    alcance: 'Curto',
    alvo: '1 criatura',
    duracao: '1 turno',
  },
  escuridao: {
    spellCircle: spellsCircles.c1,
    nome: 'Escuridão',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 objeto',
    duracao: 'Cena',
    resistencia: 'Vontade anula',
  },
  explosaoDeChamas: {
    spellCircle: spellsCircles.c1,
    nome: 'Explosão de Chamas',
    execucao: 'Padrão',
    alcance: '6m',
    area: 'Cone',
    duracao: 'Instantânea',
  },
  hipnotismo: {
    spellCircle: spellsCircles.c1,
    nome: 'Hipnotismo',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: 'Criaturas escolhidas de ND 2 ou menor',
    duracao: '1d4 rodadas',
    resistencia: 'Vontade anula',
  },
  imagemEspelhada: {
    spellCircle: spellsCircles.c1,
    nome: 'Imagem Espelhada',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
  },
  infligirFerimentos: {
    spellCircle: spellsCircles.c1,
    nome: 'Infligir Ferimentos',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Instantânea',
    resistencia: 'Fortitude reduz à metade',
  },
  lequeCromatico: {
    spellCircle: spellsCircles.c1,
    nome: 'Leque Cromático',
    execucao: 'Padrão',
    alcance: '4,5m',
    area: 'Cone',
    duracao: 'Instantânea',
    resistencia: 'Vontade anula',
  },
  luz: {
    spellCircle: spellsCircles.c1,
    nome: 'Luz',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 objeto',
    duracao: 'Cena',
    resistencia: 'Vontade anula',
  },
  nevoa: {
    spellCircle: spellsCircles.c1,
    nome: 'Névoa',
    execucao: 'Padrão',
    alcance: 'Curto',
    area: 'Nuvem com 6m de raio e altura',
    duracao: 'Cena',
  },
  orientacao: {
    spellCircle: spellsCircles.c1,
    nome: 'Orientação',
    execucao: 'Movimentação',
    alcance: 'Curto',
    alvo: '1 criatura',
    duracao: 'Cena',
  },
  perdicao: {
    spellCircle: spellsCircles.c1,
    nome: 'Perdição',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: 'Criaturas escolhidas',
    duracao: 'Cena',
    resistencia: 'Nenhuma',
  },
  primorAtletico: {
    spellCircle: spellsCircles.c1,
    nome: 'Primor Atlético',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Cena',
  },
  profanar: {
    spellCircle: spellsCircles.c1,
    nome: 'Profanar',
    execucao: 'Padrão',
    alcance: 'Longo',
    area: 'Esfera com 9m de raio',
    duracao: '1 dia',
  },
  protecaoDivina: {
    spellCircle: spellsCircles.c1,
    nome: 'Proteção Divina',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Cena',
  },
  quedaSuave: {
    spellCircle: spellsCircles.c1,
    nome: 'Queda Suave',
    execucao: 'Reação',
    alcance: 'Curto',
    alvo: '1 criatura ou objeto com até 200kg',
    duracao: 'Até chegar ao solo ou cena, o que vier primeiro',
  },
  raioDoEnfraquecimento: {
    spellCircle: spellsCircles.c1,
    nome: 'Raio do Enfraquecimento',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 criatura',
    duracao: 'Cena',
    resistencia: 'Fortitude parcial',
  },
  resistenciaAEnergia: {
    spellCircle: spellsCircles.c1,
    nome: 'Resistência a Energia',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Cena',
  },
  santuario: {
    spellCircle: spellsCircles.c1,
    nome: 'Santuário',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Cena',
    resistencia: 'Vontade anula',
  },
  setaInfalivelDeTalude: {
    spellCircle: spellsCircles.c1,
    nome: 'Seta Infalível de Talude',
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: 'Até 2 criaturas',
    duracao: 'Instantânea',
  },
  sono: {
    spellCircle: spellsCircles.c1,
    nome: 'Sono',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 criatura de ND 2 ou menor',
    duracao: 'Cena',
    resistencia: 'Vontade parcial',
  },
  suporteAmbiental: {
    spellCircle: spellsCircles.c1,
    nome: 'Suporte Ambiental',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: '1 dia',
  },
  teia: {
    spellCircle: spellsCircles.c1,
    nome: 'Teia',
    execucao: 'Padrão',
    alcance: 'Curto',
    area: 'Cubo com 6m de lado',
    duracao: 'Cena',
    resistencia: 'Reflexos anula',
  },
  toqueChocante: {
    spellCircle: spellsCircles.c1,
    nome: 'Toque Chocante',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Instantânea',
    resistencia: 'Fortitude reduz à metade',
  },
  trancaArcana: {
    spellCircle: spellsCircles.c1,
    nome: 'Tranca Arcana',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 objeto Grande ou menor',
    duracao: 'Permanente',
  },
  tranquilidade: {
    spellCircle: spellsCircles.c1,
    nome: 'Tranquilidade',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 animal ou humanoide',
    duracao: 'Cena',
    resistencia: 'Vontade parcial',
  },
  transmutarObjetos: {
    spellCircle: spellsCircles.c1,
    nome: 'Transmutar Objetos',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: 'Matéria-prima, como madeeira, rochas, ossos',
    duracao: 'Cena',
  },
  visaoMistica: {
    spellCircle: spellsCircles.c1,
    nome: 'Visão Mística',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: 'Você',
    duracao: 'Cena',
  },
  vitalidadeFantasma: {
    spellCircle: spellsCircles.c1,
    nome: 'Vitalidade Fantasma',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Instantânea',
  },
};

export function setupSpell(spell: Spell): Spell {
  return merge<Spell, Partial<Spell>>(spell, {
    manaExpense: manaExpenseByCircle[spell.spellCircle],
  });
}
