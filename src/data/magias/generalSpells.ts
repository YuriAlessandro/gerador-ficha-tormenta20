import { cloneDeep } from 'lodash';
import { pickFromArray } from '../../functions/randomUtils';
import CharacterSheet, { SubStep } from '../../interfaces/CharacterSheet';
import { Spell, spellsCircles } from '../../interfaces/Spells';
import { Atributo } from '../atributos';

export const manaExpenseByCircle: Record<spellsCircles, number> = {
  [spellsCircles.c1]: 1,
  [spellsCircles.c2]: 3,
  [spellsCircles.c3]: 6,
  [spellsCircles.c4]: 10,
  [spellsCircles.c5]: 15,
};

export enum spellsCircle1Names {
  abencoarAlimentos = 'abencoarAlimentos',
  acalmarAnimal = 'acalmarAnimal',
  armaduraArcana = 'armaduraArcana',
  adagaMental = 'adagaMental',
  alarme = 'alarme',
  amedrontar = 'amedrontar',
  areaEscorregadia = 'areaEscorregadia',
  armaEspiritual = 'armaEspiritual',
  armaMagica = 'armaMagica',
  armamentoDaNatureza = 'armamentoDaNatureza',
  aviso = 'aviso',
  bencao = 'bencao',
  caminhosDaNatureza = 'caminhosDaNatureza',
  comando = 'comando',
  compreensao = 'compreensao',
  concentracaoDeCombate = 'concentracaoDeCombate',
  conjurarMonstro = 'conjurarMonstro',
  consagrar = 'consagrar',
  controlarPlantas = 'controlarPlantas',
  criarElementos = 'criarElementos',
  criarIlusao = 'criarIlusao',
  curarFerimentos = 'curarFerimentos',
  despedacar = 'despedacar',
  detectarAmeacas = 'detectarAmeacas',
  disfarceIlusorio = 'disfarceIlusorio',
  enfeiticar = 'enfeiticar',
  escudoDaFe = 'escudoDaFe',
  escuridao = 'escuridao',
  explosaoDeChamas = 'explosaoDeChamas',
  hipnotismo = 'hipnotismo',
  imagemEspelhada = 'imagemEspelhada',
  infligirFerimentos = 'infligirFerimentos',
  lequeCromatico = 'lequeCromatico',
  luz = 'luz',
  nevoa = 'nevoa',
  orientacao = 'orientacao',
  perdicao = 'perdicao',
  primorAtletico = 'primorAtletico',
  profanar = 'profanar',
  protecaoDivina = 'protecaoDivina',
  quedaSuave = 'quedaSuave',
  raioDoEnfraquecimento = 'raioDoEnfraquecimento',
  resistenciaAEnergia = 'resistenciaAEnergia',
  santuario = 'santuario',
  setaInfalivelDeTalude = 'setaInfalivelDeTalude',
  sono = 'sono',
  suporteAmbiental = 'suporteAmbiental',
  teia = 'teia',
  toqueChocante = 'toqueChocante',
  trancaArcana = 'trancaArcana',
  tranquilidade = 'tranquilidade',
  transmutarObjetos = 'transmutarObjetos',
  visaoMistica = 'visaoMistica',
  vitalidadeFantasma = 'vitalidadeFantasma',
}

export enum spellsCircle2Names {
  sussurosInsanos = 'sussurosInsanos',
  augurio = 'augurio',
}

export const spellsCircle1: Record<spellsCircle1Names, Spell> = {
  [spellsCircle1Names.abencoarAlimentos]: {
    spellCircle: spellsCircles.c1,
    nome: 'Aben??oar Alimentos',
    execucao: 'Padr??o',
    alcance: 'Curto',
    alvo: 'Alimento para 1 criatura',
    duracao: 'Cena',
    school: 'Trans',
  },
  [spellsCircle1Names.acalmarAnimal]: {
    spellCircle: spellsCircles.c1,
    nome: 'Acalmar Animal',
    execucao: 'Padr??o',
    alcance: 'Curto',
    alvo: '1 animal',
    duracao: 'Cena',
    resistencia: 'Vontade anula',
    school: 'Encan',
  },
  [spellsCircle1Names.adagaMental]: {
    spellCircle: spellsCircles.c1,
    nome: 'Adaga Mental',
    execucao: 'Padr??o',
    alcance: 'Curto',
    alvo: '1 criatura',
    duracao: 'Instant??nea',
    resistencia: 'Vontade parcial',
    school: 'Encan',
  },
  [spellsCircle1Names.alarme]: {
    spellCircle: spellsCircles.c1,
    nome: 'Alarme',
    execucao: 'Padr??o',
    alcance: 'Curto',
    area: 'Esfera de 9m de raio',
    duracao: '1 dia',
    school: 'Abjur',
  },
  [spellsCircle1Names.amedrontar]: {
    spellCircle: spellsCircles.c1,
    nome: 'Amedrontar',
    execucao: 'Padr??o',
    alcance: 'Curto',
    alvo: '1 animal ou humanoide de ND 2 ou menor',
    duracao: 'Cena',
    resistencia: 'Vontade parcial',
    school: 'Necro',
  },
  [spellsCircle1Names.areaEscorregadia]: {
    spellCircle: spellsCircles.c1,
    nome: '??rea Escorregadia',
    execucao: 'Padr??o',
    alcance: 'Curto',
    alvo: 'Quadrado de 3m ou 1 objeto',
    duracao: 'Cena',
    resistencia: 'Reflexos',
    school: 'Conv',
  },
  [spellsCircle1Names.armaEspiritual]: {
    spellCircle: spellsCircles.c1,
    nome: 'Arma Espiritual',
    execucao: 'Padr??o',
    alcance: 'Pessoal',
    alvo: 'Voc??',
    duracao: 'Cena',
    school: 'Conv',
  },
  [spellsCircle1Names.armaMagica]: {
    spellCircle: spellsCircles.c1,
    nome: 'Arma M??gica',
    execucao: 'Padr??o',
    alcance: 'Toque',
    alvo: '1 arma',
    duracao: 'Cena',
    school: 'Trans',
  },
  [spellsCircle1Names.armaduraArcana]: {
    spellCircle: spellsCircles.c1,
    nome: 'Armadura Arcana',
    execucao: 'Padr??o',
    alcance: 'Pessoal',
    alvo: 'Voc??',
    duracao: 'Cena',
    school: 'Abjur',
  },
  [spellsCircle1Names.armamentoDaNatureza]: {
    spellCircle: spellsCircles.c1,
    nome: 'Armamento da Natureza',
    execucao: 'Padr??o',
    alcance: 'Toque',
    alvo: '1 arma',
    duracao: 'Cena',
    school: 'Trans',
  },
  [spellsCircle1Names.aviso]: {
    spellCircle: spellsCircles.c1,
    nome: 'Aviso',
    execucao: 'Movimento',
    alcance: 'Longo',
    alvo: '1 criatura',
    duracao: 'Instant??nea',
    school: 'Adiv',
  },
  [spellsCircle1Names.bencao]: {
    spellCircle: spellsCircles.c1,
    nome: 'B??n????o',
    execucao: 'Padr??o',
    alcance: 'Curto',
    alvo: 'Criaturas escolhidas',
    duracao: 'Cena',
    school: 'Encan',
  },
  [spellsCircle1Names.caminhosDaNatureza]: {
    spellCircle: spellsCircles.c1,
    nome: 'Caminhos da Natureza',
    execucao: 'Padr??o',
    alcance: 'Curto',
    alvo: '1 arma',
    duracao: 'Cena',
    school: 'Conv',
  },
  [spellsCircle1Names.comando]: {
    spellCircle: spellsCircles.c1,
    nome: 'Comando',
    execucao: 'Padr??o',
    alcance: 'Curto',
    alvo: '1 humanoide',
    duracao: '1 rodada',
    resistencia: 'Vontade anula',
    school: 'Encan',
  },
  [spellsCircle1Names.compreensao]: {
    spellCircle: spellsCircles.c1,
    nome: 'Compreens??o',
    execucao: 'Padr??o',
    alcance: 'Toque',
    alvo: '1 criatura ou texto',
    duracao: 'Cena',
    resistencia: 'Vontade anula',
    school: 'Adiv',
  },
  [spellsCircle1Names.concentracaoDeCombate]: {
    spellCircle: spellsCircles.c1,
    nome: 'Concentra????o de Combate',
    execucao: 'Livre',
    alcance: 'Pessoal',
    alvo: 'Voc??',
    duracao: '1 rodada',
    school: 'Adiv',
  },
  [spellsCircle1Names.conjurarMonstro]: {
    spellCircle: spellsCircles.c1,
    nome: 'Conjurar Monstro',
    execucao: 'Completa',
    alcance: 'Curto',
    alvo: '1 criatura conjurada',
    duracao: 'Sustentada',
    school: 'Conv',
  },
  [spellsCircle1Names.consagrar]: {
    spellCircle: spellsCircles.c1,
    nome: 'Consagrar',
    execucao: 'Padr??o',
    alcance: 'Longo',
    area: 'Esfera com 9m de raio',
    duracao: '1 dia',
    school: 'Evoc',
  },
  [spellsCircle1Names.controlarPlantas]: {
    spellCircle: spellsCircles.c1,
    nome: 'Controlar Plantas',
    execucao: 'Padr??o',
    alcance: 'Curto',
    area: 'quadrado com 9m de lado',
    duracao: 'Cena',
    resistencia: 'Reflexos anula',
    school: 'Trans',
  },
  [spellsCircle1Names.criarElementos]: {
    spellCircle: spellsCircles.c1,
    nome: 'Criar Elementos',
    execucao: 'Padr??o',
    alcance: 'Curto',
    alvo: 'Elemento escolhido',
    duracao: 'Instant??nea',
    school: 'Conv',
  },
  [spellsCircle1Names.criarIlusao]: {
    spellCircle: spellsCircles.c1,
    nome: 'Criar Ilus??o',
    execucao: 'Padr??o',
    alcance: 'M??dio',
    alvo: 'Ilus??o que se estende a at?? 4 cubos de 1,5m',
    duracao: 'Cena',
    resistencia: 'Vontade desacredita',
    school: 'Ilus??o',
  },
  [spellsCircle1Names.curarFerimentos]: {
    spellCircle: spellsCircles.c1,
    nome: 'Curar Ferimentos',
    execucao: 'Padr??o',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Instant??nea',
    school: 'Evoc',
  },
  [spellsCircle1Names.despedacar]: {
    spellCircle: spellsCircles.c1,
    nome: 'Despeda??ar',
    execucao: 'Padr??o',
    alcance: 'Curto',
    alvo: '1 critura ou objeto mundano pequeno',
    duracao: 'Instant??nea',
    resistencia: 'Fortitude parcial ou Reflexos anula',
    school: 'Evoc',
  },
  [spellsCircle1Names.detectarAmeacas]: {
    spellCircle: spellsCircles.c1,
    nome: 'Detectar Amea??as',
    execucao: 'Padr??o',
    alcance: 'Pessoal',
    alvo: 'Esfera de 9m de raio',
    duracao: 'Instant??nea',
    school: 'Adiv',
  },
  [spellsCircle1Names.disfarceIlusorio]: {
    spellCircle: spellsCircles.c1,
    nome: 'Disfarce Ilus??rio',
    execucao: 'Padr??o',
    alcance: 'Pessoal',
    alvo: 'Voc??',
    duracao: 'Cena',
    resistencia: 'Vontade desacredita',
    school: 'Ilus??o',
  },
  [spellsCircle1Names.enfeiticar]: {
    spellCircle: spellsCircles.c1,
    nome: 'Enfeiti??ar',
    execucao: 'Padr??o',
    alcance: 'Curto',
    alvo: '1 humanoide',
    duracao: 'Cena',
    resistencia: 'Vontade anula',
    school: 'Encan',
  },
  [spellsCircle1Names.escudoDaFe]: {
    spellCircle: spellsCircles.c1,
    nome: 'Escudo da F??',
    execucao: 'Rea????o',
    alcance: 'Curto',
    alvo: '1 criatura',
    duracao: '1 turno',
    school: 'Abjur',
  },
  [spellsCircle1Names.escuridao]: {
    spellCircle: spellsCircles.c1,
    nome: 'Escurid??o',
    execucao: 'Padr??o',
    alcance: 'Curto',
    alvo: '1 objeto',
    duracao: 'Cena',
    resistencia: 'Vontade anula',
    school: 'Necro',
  },
  [spellsCircle1Names.explosaoDeChamas]: {
    spellCircle: spellsCircles.c1,
    nome: 'Explos??o de Chamas',
    execucao: 'Padr??o',
    alcance: '6m',
    area: 'Cone',
    duracao: 'Instant??nea',
    school: 'Evoc',
  },
  [spellsCircle1Names.hipnotismo]: {
    spellCircle: spellsCircles.c1,
    nome: 'Hipnotismo',
    execucao: 'Padr??o',
    alcance: 'Curto',
    alvo: 'Criaturas escolhidas de ND 2 ou menor',
    duracao: '1d4 rodadas',
    resistencia: 'Vontade anula',
    school: 'Encan',
  },
  [spellsCircle1Names.imagemEspelhada]: {
    spellCircle: spellsCircles.c1,
    nome: 'Imagem Espelhada',
    execucao: 'Padr??o',
    alcance: 'Pessoal',
    alvo: 'Voc??',
    duracao: 'Cena',
    school: 'Ilus??o',
  },
  [spellsCircle1Names.infligirFerimentos]: {
    spellCircle: spellsCircles.c1,
    nome: 'Infligir Ferimentos',
    execucao: 'Padr??o',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Instant??nea',
    resistencia: 'Fortitude reduz ?? metade',
    school: 'Necro',
  },
  [spellsCircle1Names.lequeCromatico]: {
    spellCircle: spellsCircles.c1,
    nome: 'Leque Crom??tico',
    execucao: 'Padr??o',
    alcance: '4,5m',
    area: 'Cone',
    duracao: 'Instant??nea',
    resistencia: 'Vontade anula',
    school: 'Ilus??o',
  },
  [spellsCircle1Names.luz]: {
    spellCircle: spellsCircles.c1,
    nome: 'Luz',
    execucao: 'Padr??o',
    alcance: 'Curto',
    alvo: '1 objeto',
    duracao: 'Cena',
    resistencia: 'Vontade anula',
    school: 'Evoc',
  },
  [spellsCircle1Names.nevoa]: {
    spellCircle: spellsCircles.c1,
    nome: 'N??voa',
    execucao: 'Padr??o',
    alcance: 'Curto',
    area: 'Nuvem com 6m de raio e altura',
    duracao: 'Cena',
    school: 'Conv',
  },
  [spellsCircle1Names.orientacao]: {
    spellCircle: spellsCircles.c1,
    nome: 'Orienta????o',
    execucao: 'Movimenta????o',
    alcance: 'Curto',
    alvo: '1 criatura',
    duracao: 'Cena',
    school: 'Adiv',
  },
  [spellsCircle1Names.perdicao]: {
    spellCircle: spellsCircles.c1,
    nome: 'Perdi????o',
    execucao: 'Padr??o',
    alcance: 'Curto',
    alvo: 'Criaturas escolhidas',
    duracao: 'Cena',
    resistencia: 'Nenhuma',
    school: 'Necro',
  },
  [spellsCircle1Names.primorAtletico]: {
    spellCircle: spellsCircles.c1,
    nome: 'Primor Atl??tico',
    execucao: 'Padr??o',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Cena',
    school: 'Trans',
  },
  [spellsCircle1Names.profanar]: {
    spellCircle: spellsCircles.c1,
    nome: 'Profanar',
    execucao: 'Padr??o',
    alcance: 'Longo',
    area: 'Esfera com 9m de raio',
    duracao: '1 dia',
    school: 'Necro',
  },
  [spellsCircle1Names.protecaoDivina]: {
    spellCircle: spellsCircles.c1,
    nome: 'Prote????o Divina',
    execucao: 'Padr??o',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Cena',
    school: 'Abjur',
  },
  [spellsCircle1Names.quedaSuave]: {
    spellCircle: spellsCircles.c1,
    nome: 'Queda Suave',
    execucao: 'Rea????o',
    alcance: 'Curto',
    alvo: '1 criatura ou objeto com at?? 200kg',
    duracao: 'At?? chegar ao solo ou cena, o que vier primeiro',
    school: 'Trans',
  },
  [spellsCircle1Names.raioDoEnfraquecimento]: {
    spellCircle: spellsCircles.c1,
    nome: 'Raio do Enfraquecimento',
    execucao: 'Padr??o',
    alcance: 'Curto',
    alvo: '1 criatura',
    duracao: 'Cena',
    resistencia: 'Fortitude parcial',
    school: 'Necro',
  },
  [spellsCircle1Names.resistenciaAEnergia]: {
    spellCircle: spellsCircles.c1,
    nome: 'Resist??ncia a Energia',
    execucao: 'Padr??o',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Cena',
    school: 'Abjur',
  },
  [spellsCircle1Names.santuario]: {
    spellCircle: spellsCircles.c1,
    nome: 'Santu??rio',
    execucao: 'Padr??o',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Cena',
    resistencia: 'Vontade anula',
    school: 'Abjur',
  },
  [spellsCircle1Names.setaInfalivelDeTalude]: {
    spellCircle: spellsCircles.c1,
    nome: 'Seta Infal??vel de Talude',
    execucao: 'Padr??o',
    alcance: 'M??dio',
    alvo: 'At?? 2 criaturas',
    duracao: 'Instant??nea',
    school: 'Evoc',
  },
  [spellsCircle1Names.sono]: {
    spellCircle: spellsCircles.c1,
    nome: 'Sono',
    execucao: 'Padr??o',
    alcance: 'Curto',
    alvo: '1 criatura de ND 2 ou menor',
    duracao: 'Cena',
    resistencia: 'Vontade parcial',
    school: 'Encan',
  },
  [spellsCircle1Names.suporteAmbiental]: {
    spellCircle: spellsCircles.c1,
    nome: 'Suporte Ambiental',
    execucao: 'Padr??o',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: '1 dia',
    school: 'Abjur',
  },
  [spellsCircle1Names.teia]: {
    spellCircle: spellsCircles.c1,
    nome: 'Teia',
    execucao: 'Padr??o',
    alcance: 'Curto',
    area: 'Cubo com 6m de lado',
    duracao: 'Cena',
    resistencia: 'Reflexos anula',
    school: 'Conv',
  },
  [spellsCircle1Names.toqueChocante]: {
    spellCircle: spellsCircles.c1,
    nome: 'Toque Chocante',
    execucao: 'Padr??o',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Instant??nea',
    resistencia: 'Fortitude reduz ?? metade',
    school: 'Evoc',
  },
  [spellsCircle1Names.trancaArcana]: {
    spellCircle: spellsCircles.c1,
    nome: 'Tranca Arcana',
    execucao: 'Padr??o',
    alcance: 'Toque',
    alvo: '1 objeto Grande ou menor',
    duracao: 'Permanente',
    school: 'Abjur',
  },
  [spellsCircle1Names.tranquilidade]: {
    spellCircle: spellsCircles.c1,
    nome: 'Tranquilidade',
    execucao: 'Padr??o',
    alcance: 'Curto',
    alvo: '1 animal ou humanoide',
    duracao: 'Cena',
    resistencia: 'Vontade parcial',
    school: 'Encan',
  },
  [spellsCircle1Names.transmutarObjetos]: {
    spellCircle: spellsCircles.c1,
    nome: 'Transmutar Objetos',
    execucao: 'Padr??o',
    alcance: 'Toque',
    alvo: 'Mat??ria-prima, como madeeira, rochas, ossos',
    duracao: 'Cena',
    school: 'Trans',
  },
  [spellsCircle1Names.visaoMistica]: {
    spellCircle: spellsCircles.c1,
    nome: 'Vis??o M??stica',
    execucao: 'Padr??o',
    alcance: 'Toque',
    alvo: 'Voc??',
    duracao: 'Cena',
    school: 'Adiv',
  },
  [spellsCircle1Names.vitalidadeFantasma]: {
    spellCircle: spellsCircles.c1,
    nome: 'Vitalidade Fantasma',
    execucao: 'Padr??o',
    alcance: 'Pessoal',
    alvo: 'Voc??',
    duracao: 'Instant??nea',
    school: 'Necro',
  },
};

export const spellsCircle2: Record<spellsCircle2Names, Spell> = {
  [spellsCircle2Names.augurio]: {
    spellCircle: spellsCircles.c2,
    nome: 'Aug??rio',
    execucao: 'Completa',
    alcance: 'Pessoal',
    alvo: 'Voc??',
    duracao: 'Instat??nea',
    school: 'Adiv',
  },
  [spellsCircle2Names.sussurosInsanos]: {
    spellCircle: spellsCircles.c2,
    nome: 'Sussuros Insanos',
    execucao: 'Padr??o',
    alcance: 'Curto',
    alvo: '1 humanoide',
    duracao: 'Cena',
    resistencia: 'Vontade anula',
    school: 'Encan',
  },
};

function cheapenSpell(
  spells: Spell[],
  index: number,
  manaReduction = 1
): {
  spells: Spell[];
  stepValue?: string;
} {
  const spellsToChange = spells;
  const { manaReduction: actualManaReduction = 0 } = spells[index];

  if (actualManaReduction < manaReduction) {
    spellsToChange[index] = {
      ...spells[index],
      manaReduction,
    };

    return {
      spells: spellsToChange,
      stepValue: `Redu????o de mana -${manaReduction} (${spellsToChange[index].nome})`,
    };
  }

  return {
    spells,
  };
}

export function addOrCheapenSpell(
  sheet: CharacterSheet,
  spell: Spell,
  customKeyAttr?: Atributo
): {
  spells: Spell[];
  stepValue?: string;
} {
  const index = sheet.spells.findIndex(
    (sheetSpell) => spell.nome === sheetSpell.nome
  );

  const spellClone = cloneDeep(spell);

  const spellToAdd = customKeyAttr
    ? { ...spellClone, customKeyAttr }
    : spellClone;

  if (index < 0) {
    return {
      spells: [...sheet.spells, spellToAdd],
      stepValue: `Adicionou magia ${spellToAdd.nome}`,
    };
  }

  return cheapenSpell(sheet.spells, index);
}

function getRandomSpells(allowedSpells: Spell[], qtd: number) {
  return pickFromArray(allowedSpells, qtd);
}

export function addOrCheapenRandomSpells(
  sheet: CharacterSheet,
  substeps: SubStep[],
  allowedSpells: Spell[],
  stepName: string,
  customKeyAttr: Atributo,
  qtd = 2
): void {
  const sheetToChange = sheet;
  const randomSpells = getRandomSpells(allowedSpells, qtd);

  randomSpells.forEach((randomSpell) => {
    const { spells, stepValue } = addOrCheapenSpell(
      sheet,
      randomSpell,
      customKeyAttr
    );

    sheetToChange.spells = spells;

    if (stepValue) {
      substeps.push({
        name: stepName,
        value: stepValue,
      });
    }
  });
}
