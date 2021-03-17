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
    nome: 'Abençoar Alimentos',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: 'Alimento para 1 criatura',
    duracao: 'Cena',
  },
  [spellsCircle1Names.acalmarAnimal]: {
    spellCircle: spellsCircles.c1,
    nome: 'Acalmar Animal',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 animal',
    duracao: 'Cena',
    resistencia: 'Vontade anula',
  },
  [spellsCircle1Names.adagaMental]: {
    spellCircle: spellsCircles.c1,
    nome: 'Adaga Mental',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 criatura',
    duracao: 'Instantânea',
    resistencia: 'Vontade parcial',
  },
  [spellsCircle1Names.alarme]: {
    spellCircle: spellsCircles.c1,
    nome: 'Alarme',
    execucao: 'Padrão',
    alcance: 'Curto',
    area: 'Esfera de 9m de raio',
    duracao: '1 dia',
  },
  [spellsCircle1Names.amedrontar]: {
    spellCircle: spellsCircles.c1,
    nome: 'Amedrontar',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 animal ou humanoide de ND 2 ou menor',
    duracao: 'Cena',
    resistencia: 'Vontade parcial',
  },
  [spellsCircle1Names.areaEscorregadia]: {
    spellCircle: spellsCircles.c1,
    nome: 'Área Escorregadia',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: 'Quadrado de 3m ou 1 objeto',
    duracao: 'Cena',
    resistencia: 'Reflexos',
  },
  [spellsCircle1Names.armaEspiritual]: {
    spellCircle: spellsCircles.c1,
    nome: 'Arma Espiritual',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
  },
  [spellsCircle1Names.armaMagica]: {
    spellCircle: spellsCircles.c1,
    nome: 'Arma Mágica',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 arma',
    duracao: 'Cena',
  },
  [spellsCircle1Names.armaduraArcana]: {
    spellCircle: spellsCircles.c1,
    nome: 'Armadura Arcana',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
  },
  [spellsCircle1Names.armamentoDaNatureza]: {
    spellCircle: spellsCircles.c1,
    nome: 'Armamento da Natureza',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 arma',
    duracao: 'Cena',
  },
  [spellsCircle1Names.aviso]: {
    spellCircle: spellsCircles.c1,
    nome: 'Aviso',
    execucao: 'Movimento',
    alcance: 'Longo',
    alvo: '1 criatura',
    duracao: 'Instantânea',
  },
  [spellsCircle1Names.bencao]: {
    spellCircle: spellsCircles.c1,
    nome: 'Bênção',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: 'Criaturas escolhidas',
    duracao: 'Cena',
  },
  [spellsCircle1Names.caminhosDaNatureza]: {
    spellCircle: spellsCircles.c1,
    nome: 'Caminhos da Natureza',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 arma',
    duracao: 'Cena',
  },
  [spellsCircle1Names.comando]: {
    spellCircle: spellsCircles.c1,
    nome: 'Comando',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 humanoide',
    duracao: '1 rodada',
    resistencia: 'Vontade anula',
  },
  [spellsCircle1Names.compreensao]: {
    spellCircle: spellsCircles.c1,
    nome: 'Compreensão',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura ou texto',
    duracao: 'Cena',
    resistencia: 'Vontade anula',
  },
  [spellsCircle1Names.concentracaoDeCombate]: {
    spellCircle: spellsCircles.c1,
    nome: 'Concentração de Combate',
    execucao: 'Livre',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: '1 rodada',
  },
  [spellsCircle1Names.conjurarMonstro]: {
    spellCircle: spellsCircles.c1,
    nome: 'Conjurar Monstro',
    execucao: 'Completa',
    alcance: 'Curto',
    alvo: '1 criatura conjurada',
    duracao: 'Sustentada',
  },
  [spellsCircle1Names.consagrar]: {
    spellCircle: spellsCircles.c1,
    nome: 'Consagrar',
    execucao: 'Padrão',
    alcance: 'Longo',
    area: 'Esfera com 9m de raio',
    duracao: '1 dia',
  },
  [spellsCircle1Names.controlarPlantas]: {
    spellCircle: spellsCircles.c1,
    nome: 'Controlar Plantas',
    execucao: 'Padrão',
    alcance: 'Curto',
    area: 'quadrado com 9m de lado',
    duracao: 'Cena',
    resistencia: 'Reflexos anula',
  },
  [spellsCircle1Names.criarElementos]: {
    spellCircle: spellsCircles.c1,
    nome: 'Criar Elementos',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: 'Elemento escolhido',
    duracao: 'Instantânea',
  },
  [spellsCircle1Names.criarIlusao]: {
    spellCircle: spellsCircles.c1,
    nome: 'Criar Ilusão',
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: 'Ilusão que se estende a até 4 cubos de 1,5m',
    duracao: 'Cena',
    resistencia: 'Vontade desacredita',
  },
  [spellsCircle1Names.curarFerimentos]: {
    spellCircle: spellsCircles.c1,
    nome: 'Curar Ferimentos',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Instantânea',
  },
  [spellsCircle1Names.despedacar]: {
    spellCircle: spellsCircles.c1,
    nome: 'Despedaçar',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 critura ou objeto mundano pequeno',
    duracao: 'Instantânea',
    resistencia: 'Fortitude parcial ou Reflexos anula',
  },
  [spellsCircle1Names.detectarAmeacas]: {
    spellCircle: spellsCircles.c1,
    nome: 'Detectar Ameaças',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Esfera de 9m de raio',
    duracao: 'Instantânea',
  },
  [spellsCircle1Names.disfarceIlusorio]: {
    spellCircle: spellsCircles.c1,
    nome: 'Disfarce Ilusório',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    resistencia: 'Vontade desacredita',
  },
  [spellsCircle1Names.enfeiticar]: {
    spellCircle: spellsCircles.c1,
    nome: 'Enfeitiçar',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 humanoide',
    duracao: 'Cena',
    resistencia: 'Vontade anula',
  },
  [spellsCircle1Names.escudoDaFe]: {
    spellCircle: spellsCircles.c1,
    nome: 'Escudo da Fé',
    execucao: 'Reação',
    alcance: 'Curto',
    alvo: '1 criatura',
    duracao: '1 turno',
  },
  [spellsCircle1Names.escuridao]: {
    spellCircle: spellsCircles.c1,
    nome: 'Escuridão',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 objeto',
    duracao: 'Cena',
    resistencia: 'Vontade anula',
  },
  [spellsCircle1Names.explosaoDeChamas]: {
    spellCircle: spellsCircles.c1,
    nome: 'Explosão de Chamas',
    execucao: 'Padrão',
    alcance: '6m',
    area: 'Cone',
    duracao: 'Instantânea',
  },
  [spellsCircle1Names.hipnotismo]: {
    spellCircle: spellsCircles.c1,
    nome: 'Hipnotismo',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: 'Criaturas escolhidas de ND 2 ou menor',
    duracao: '1d4 rodadas',
    resistencia: 'Vontade anula',
  },
  [spellsCircle1Names.imagemEspelhada]: {
    spellCircle: spellsCircles.c1,
    nome: 'Imagem Espelhada',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
  },
  [spellsCircle1Names.infligirFerimentos]: {
    spellCircle: spellsCircles.c1,
    nome: 'Infligir Ferimentos',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Instantânea',
    resistencia: 'Fortitude reduz à metade',
  },
  [spellsCircle1Names.lequeCromatico]: {
    spellCircle: spellsCircles.c1,
    nome: 'Leque Cromático',
    execucao: 'Padrão',
    alcance: '4,5m',
    area: 'Cone',
    duracao: 'Instantânea',
    resistencia: 'Vontade anula',
  },
  [spellsCircle1Names.luz]: {
    spellCircle: spellsCircles.c1,
    nome: 'Luz',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 objeto',
    duracao: 'Cena',
    resistencia: 'Vontade anula',
  },
  [spellsCircle1Names.nevoa]: {
    spellCircle: spellsCircles.c1,
    nome: 'Névoa',
    execucao: 'Padrão',
    alcance: 'Curto',
    area: 'Nuvem com 6m de raio e altura',
    duracao: 'Cena',
  },
  [spellsCircle1Names.orientacao]: {
    spellCircle: spellsCircles.c1,
    nome: 'Orientação',
    execucao: 'Movimentação',
    alcance: 'Curto',
    alvo: '1 criatura',
    duracao: 'Cena',
  },
  [spellsCircle1Names.perdicao]: {
    spellCircle: spellsCircles.c1,
    nome: 'Perdição',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: 'Criaturas escolhidas',
    duracao: 'Cena',
    resistencia: 'Nenhuma',
  },
  [spellsCircle1Names.primorAtletico]: {
    spellCircle: spellsCircles.c1,
    nome: 'Primor Atlético',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Cena',
  },
  [spellsCircle1Names.profanar]: {
    spellCircle: spellsCircles.c1,
    nome: 'Profanar',
    execucao: 'Padrão',
    alcance: 'Longo',
    area: 'Esfera com 9m de raio',
    duracao: '1 dia',
  },
  [spellsCircle1Names.protecaoDivina]: {
    spellCircle: spellsCircles.c1,
    nome: 'Proteção Divina',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Cena',
  },
  [spellsCircle1Names.quedaSuave]: {
    spellCircle: spellsCircles.c1,
    nome: 'Queda Suave',
    execucao: 'Reação',
    alcance: 'Curto',
    alvo: '1 criatura ou objeto com até 200kg',
    duracao: 'Até chegar ao solo ou cena, o que vier primeiro',
  },
  [spellsCircle1Names.raioDoEnfraquecimento]: {
    spellCircle: spellsCircles.c1,
    nome: 'Raio do Enfraquecimento',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 criatura',
    duracao: 'Cena',
    resistencia: 'Fortitude parcial',
  },
  [spellsCircle1Names.resistenciaAEnergia]: {
    spellCircle: spellsCircles.c1,
    nome: 'Resistência a Energia',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Cena',
  },
  [spellsCircle1Names.santuario]: {
    spellCircle: spellsCircles.c1,
    nome: 'Santuário',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Cena',
    resistencia: 'Vontade anula',
  },
  [spellsCircle1Names.setaInfalivelDeTalude]: {
    spellCircle: spellsCircles.c1,
    nome: 'Seta Infalível de Talude',
    execucao: 'Padrão',
    alcance: 'Médio',
    alvo: 'Até 2 criaturas',
    duracao: 'Instantânea',
  },
  [spellsCircle1Names.sono]: {
    spellCircle: spellsCircles.c1,
    nome: 'Sono',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 criatura de ND 2 ou menor',
    duracao: 'Cena',
    resistencia: 'Vontade parcial',
  },
  [spellsCircle1Names.suporteAmbiental]: {
    spellCircle: spellsCircles.c1,
    nome: 'Suporte Ambiental',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: '1 dia',
  },
  [spellsCircle1Names.teia]: {
    spellCircle: spellsCircles.c1,
    nome: 'Teia',
    execucao: 'Padrão',
    alcance: 'Curto',
    area: 'Cubo com 6m de lado',
    duracao: 'Cena',
    resistencia: 'Reflexos anula',
  },
  [spellsCircle1Names.toqueChocante]: {
    spellCircle: spellsCircles.c1,
    nome: 'Toque Chocante',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 criatura',
    duracao: 'Instantânea',
    resistencia: 'Fortitude reduz à metade',
  },
  [spellsCircle1Names.trancaArcana]: {
    spellCircle: spellsCircles.c1,
    nome: 'Tranca Arcana',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: '1 objeto Grande ou menor',
    duracao: 'Permanente',
  },
  [spellsCircle1Names.tranquilidade]: {
    spellCircle: spellsCircles.c1,
    nome: 'Tranquilidade',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 animal ou humanoide',
    duracao: 'Cena',
    resistencia: 'Vontade parcial',
  },
  [spellsCircle1Names.transmutarObjetos]: {
    spellCircle: spellsCircles.c1,
    nome: 'Transmutar Objetos',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: 'Matéria-prima, como madeeira, rochas, ossos',
    duracao: 'Cena',
  },
  [spellsCircle1Names.visaoMistica]: {
    spellCircle: spellsCircles.c1,
    nome: 'Visão Mística',
    execucao: 'Padrão',
    alcance: 'Toque',
    alvo: 'Você',
    duracao: 'Cena',
  },
  [spellsCircle1Names.vitalidadeFantasma]: {
    spellCircle: spellsCircles.c1,
    nome: 'Vitalidade Fantasma',
    execucao: 'Padrão',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Instantânea',
  },
};

export const spellsCircle2: Record<spellsCircle2Names, Spell> = {
  [spellsCircle2Names.sussurosInsanos]: {
    spellCircle: spellsCircles.c2,
    nome: 'Sussuros Insanos',
    execucao: 'Padrão',
    alcance: 'Curto',
    alvo: '1 humanoide',
    duracao: 'Cena',
    resistencia: 'Vontade anula',
  },
  [spellsCircle2Names.augurio]: {
    spellCircle: spellsCircles.c2,
    nome: 'Augúrio',
    execucao: 'Completa',
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Instatânea',
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
      stepValue: `Redução de mana -${manaReduction} (${spellsToChange[index].nome})`,
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
