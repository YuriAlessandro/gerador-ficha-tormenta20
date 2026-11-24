import { describe, expect, it } from 'vitest';
import {
  allArcaneSpellsCircle1,
  allArcaneSpellsCircle2,
} from '../../../data/systems/tormenta20/magias/arcane';
import {
  allDivineSpellsCircle1,
  allDivineSpellsCircle2,
} from '../../../data/systems/tormenta20/magias/divine';
import { parseSpellDescriptionBlocks } from '../FormattedSpellText';
import {
  SpellFilters,
  filterEnrichedSpells,
  mergeAndEnrichSpells,
} from '../../DatabaseTables/spellsFilters';

const baseFilters = (overrides: Partial<SpellFilters> = {}): SpellFilters => ({
  search: '',
  circles: [],
  schools: [],
  executionTimes: [],
  spellType: 'all',
  funcoes: [],
  descritores: [],
  tiposDano: [],
  alvoTipos: [],
  resistencias: [],
  alcances: [],
  deities: [],
  ...overrides,
});

describe('spellsFilters e formatação Obsidian', () => {
  const sampleSpells = mergeAndEnrichSpells([
    ...allArcaneSpellsCircle1.map((s) => ({
      ...s,
      spellType: 'arcane' as const,
    })),
    ...allArcaneSpellsCircle2.map((s) => ({
      ...s,
      spellType: 'arcane' as const,
    })),
    ...allDivineSpellsCircle1.map((s) => ({
      ...s,
      spellType: 'divine' as const,
    })),
    ...allDivineSpellsCircle2.map((s) => ({
      ...s,
      spellType: 'divine' as const,
    })),
  ]);

  it('reconhece magias Universais presentes nas duas tradições', () => {
    const universais = filterEnrichedSpells(
      sampleSpells,
      baseFilters({ spellType: 'universal' })
    );
    expect(universais.map((s) => s.nome)).toContain('Dissipar Magia');
    expect(universais.map((s) => s.nome)).toContain('Luz');
  });

  it('filtra pelas facetas ontológicas de Função, Descritor e Tipo de Alvo', () => {
    const fogoArea = filterEnrichedSpells(
      sampleSpells,
      baseFilters({
        funcoes: ['dano'],
        descritores: ['fogo'],
        alvoTipos: ['area'],
      })
    );
    expect(fogoArea.map((s) => s.nome)).toContain('Bola de Fogo');
    expect(fogoArea.map((s) => s.nome)).not.toContain('Curar Ferimentos');
  });

  it('separa efeitos com marcadores * no texto formatado estilo Obsidian', () => {
    const controlarFogo = sampleSpells.find(
      (s) => s.nome === 'Controlar Fogo'
    );
    expect(controlarFogo?.formattedDescription).toBeDefined();

    const blocks = parseSpellDescriptionBlocks(
      controlarFogo!.description,
      controlarFogo!.formattedDescription
    );
    const bulletBlocks = blocks.filter((b) => b.kind === 'bullet');
    expect(bulletBlocks.length).toBeGreaterThanOrEqual(4);
    expect(bulletBlocks.some((b) => b.text.includes('Chamejar'))).toBe(true);
  });

  it('faz fallback heurístico para separar efeitos em texto corrido de suplemento', () => {
    const raw =
      'Você manipula energia. Ao lançar a magia, escolha um dos efeitos. Chama: causa 1d6 de fogo. Gelo: causa 1d6 de frio.';
    const blocks = parseSpellDescriptionBlocks(raw);
    expect(blocks[0].kind).toBe('paragraph');
    expect(blocks.filter((b) => b.kind === 'bullet')).toHaveLength(2);
  });
});
