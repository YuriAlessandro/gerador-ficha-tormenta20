import { Atributo } from '../data/systems/tormenta20/atributos';
import { DiceRoll } from './DiceRoll';

export interface Aprimoramento {
  addPm: number;
  text: string;
}

export enum spellsCircles {
  c1 = '1º Circulo',
  c2 = '2º Circulo',
  c3 = '3º Circulo',
  c4 = '4º Circulo',
  c5 = '5º Circulo',
}

export type Spell = {
  nome: string;
  execucao: 'Padrão' | 'Movimento' | 'Completa' | 'Reação' | string;
  alcance: 'Pessoal' | 'Toque' | 'Curto' | 'Médio' | 'Longo' | string;
  alvo?: string;
  area?: string;
  duracao: 'Instantânea' | 'Cena' | string;
  description: string;
  resistencia?: string;
  spellCircle: spellsCircles;
  manaExpense?: number;
  manaReduction?: number;
  customKeyAttr?: Atributo;
  school: SpellSchool;
  aprimoramentos?: Aprimoramento[];
  rolls?: DiceRoll[]; // Rolagens customizadas pelo usuário
};

export type SpellSchool =
  | 'Abjur'
  | 'Adiv'
  | 'Conv'
  | 'Encan'
  | 'Evoc'
  | 'Ilusão'
  | 'Necro'
  | 'Trans';

export const allSpellSchools: SpellSchool[] = [
  'Abjur',
  'Adiv',
  'Conv',
  'Encan',
  'Evoc',
  'Ilusão',
  'Necro',
  'Trans',
];

export type SpellCircle = {
  [key in SpellSchool]: Spell[];
};
