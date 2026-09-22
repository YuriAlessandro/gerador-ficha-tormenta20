import { Spell, spellsCircles } from '../../../interfaces/Spells';
import {
  EMPTY_SPELL_FILTERS,
  applySpellFilters,
  toggleInArray,
} from '../spellFilters';

const mkSpell = (spell: Partial<Spell> & { nome: string }): Spell =>
  ({
    spellCircle: spellsCircles.c1,
    execucao: 'Padrão',
    school: 'Trans',
    description: '',
    ...spell,
  } as Spell);

const SPELLS: Spell[] = [
  mkSpell({ nome: 'Amedrontar', school: 'Necro' }),
  mkSpell({ nome: 'Seta Infalível', school: 'Evoc' }),
  mkSpell({
    nome: 'Bola de Fogo',
    school: 'Evoc',
    spellCircle: spellsCircles.c2,
  }),
  mkSpell({
    nome: 'Imagem Espelhada',
    school: 'Ilusão',
    spellCircle: spellsCircles.c2,
    execucao: 'Movimento',
  }),
  mkSpell({ nome: 'Arma Mágica', school: 'Trans' }),
];

const names = (spells: Spell[]) => spells.map((s) => s.nome);

describe('applySpellFilters', () => {
  it('listas vazias não filtram nada', () => {
    expect(applySpellFilters(SPELLS, EMPTY_SPELL_FILTERS)).toHaveLength(
      SPELLS.length
    );
  });

  it('várias escolas funcionam como OU', () => {
    const result = applySpellFilters(SPELLS, {
      ...EMPTY_SPELL_FILTERS,
      schools: ['Necro', 'Evoc', 'Ilusão'],
    });
    expect(names(result)).toEqual([
      'Amedrontar',
      'Seta Infalível',
      'Bola de Fogo',
      'Imagem Espelhada',
    ]);
  });

  it('filtros diferentes se combinam como E', () => {
    const result = applySpellFilters(SPELLS, {
      ...EMPTY_SPELL_FILTERS,
      schools: ['Necro', 'Evoc', 'Ilusão'],
      circles: [2],
    });
    expect(names(result)).toEqual(['Bola de Fogo', 'Imagem Espelhada']);
  });

  it('aceita várias execuções', () => {
    const result = applySpellFilters(SPELLS, {
      ...EMPTY_SPELL_FILTERS,
      circles: [1, 2],
      executions: ['Movimento'],
    });
    expect(names(result)).toEqual(['Imagem Espelhada']);
  });
});

describe('toggleInArray', () => {
  it('adiciona quando ausente e remove quando presente', () => {
    expect(toggleInArray([1, 2], 3)).toEqual([1, 2, 3]);
    expect(toggleInArray([1, 2, 3], 2)).toEqual([1, 3]);
  });
});
