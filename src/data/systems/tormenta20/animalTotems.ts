export interface AnimalTotem {
  name: string;
  description: string;
  spellName: string;
}

const ANIMAL_TOTEMS: Record<string, AnimalTotem> = {
  CORUJA: {
    name: 'Coruja',
    description:
      'A sábia coruja guia seus discípulos. Você pode lançar Orientação.',
    spellName: 'Orientação',
  },
  CORVO: {
    name: 'Corvo',
    description:
      'Um seguidor do corvo enxerga além do véu. Você pode lançar Visão Mística.',
    spellName: 'Visão Mística',
  },
  FALCAO: {
    name: 'Falcão',
    description:
      'Sempre atento, o falcão permite que você lance Detectar Ameaças.',
    spellName: 'Detectar Ameaças',
  },
  GRIFO: {
    name: 'Grifo',
    description:
      'O mais veloz dos animais, o grifo permite que você lance Primor Atlético.',
    spellName: 'Primor Atlético',
  },
  LOBO: {
    name: 'Lobo',
    description:
      'O lobo é feroz e letal. Você pode lançar Concentração de Combate.',
    spellName: 'Concentração de Combate',
  },
  RAPOSA: {
    name: 'Raposa',
    description:
      'A sagaz raposa nunca está onde se espera. Você pode lançar Imagem Espelhada.',
    spellName: 'Imagem Espelhada',
  },
  TARTARUGA: {
    name: 'Tartaruga',
    description:
      'A tartaruga protege os seus. Você pode lançar Armadura Arcana.',
    spellName: 'Armadura Arcana',
  },
  URSO: {
    name: 'Urso',
    description: 'O vigoroso urso permite que você lance Vitalidade Fantasma.',
    spellName: 'Vitalidade Fantasma',
  },
};

export const ANIMAL_TOTEM_NAMES = Object.keys(ANIMAL_TOTEMS);
export { ANIMAL_TOTEMS };
export default ANIMAL_TOTEMS;
