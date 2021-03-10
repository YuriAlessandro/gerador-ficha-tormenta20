export type Spell = {
  nome: string;
  execucao: 'Padrão' | 'Movimento' | 'Completa' | 'Reação' | string;
  alcance: 'Pessoal' | 'Toque' | 'Curto' | 'Médio' | 'Longo' | string;
  alvo?: string;
  area?: string;
  duracao: 'Instantânea' | 'Cena' | string;
  resistencia?: string;
  efeito?: string;
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
