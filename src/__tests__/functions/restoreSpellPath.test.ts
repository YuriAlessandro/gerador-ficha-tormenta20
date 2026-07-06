/**
 * Regression tests for restoreSpellPath / rehydrateSheet with malformed sheets.
 * Prod crash (jul/2026): "undefined is not an object (evaluating 'tt.abilities.push')"
 * — ficha Arcanista sem subname e sem classe.abilities fazia restoreSpellPath
 * chamar ARCANISTA.setup(), que dava push num array inexistente.
 */
import { describe, it, expect } from 'vitest';
import { restoreSpellPath } from '../../functions/general';
import { rehydrateSheet } from '../../functions/sheetPayloadOptimizer';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';

const coreClasses = dataRegistry.getClassesBySupplements([
  SupplementId.TORMENTA20_CORE,
]);

describe('restoreSpellPath - fichas malformadas', () => {
  it('não quebra com Arcanista sem subname e sem abilities', () => {
    const sheet = {
      classe: {
        name: 'Arcanista',
        // subname ausente força o fallback baseClass.setup(sheet.classe)
        // abilities ausente reproduzia o crash de produção
      },
    } as unknown as CharacterSheet;

    expect(() => restoreSpellPath(sheet, coreClasses)).not.toThrow();
    expect(sheet.classe.abilities).toEqual([]);
    // O fallback via setup() deve ter reconstruído um spellPath utilizável
    expect(sheet.classe.spellPath).toBeDefined();
    expect(typeof sheet.classe.spellPath?.spellCircleAvailableAtLevel).toBe(
      'function'
    );
  });

  it('não quebra com classe sem abilities em conjuradores com setup (Clérigo)', () => {
    const sheet = {
      classe: { name: 'Clérigo' },
    } as unknown as CharacterSheet;

    expect(() => restoreSpellPath(sheet, coreClasses)).not.toThrow();
    expect(sheet.classe.abilities).toEqual([]);
    expect(sheet.classe.spellPath).toBeDefined();
  });
});

describe('rehydrateSheet - fallback de abilities', () => {
  it('restaura classe.abilities do catálogo quando o dado gravado veio sem ele', () => {
    const stored = {
      __stripped__: true,
      classe: {
        name: 'Arcanista',
        // abilities ausente (ficha antiga gravada sem o campo)
      },
    };

    const sheet = rehydrateSheet(stored, [SupplementId.TORMENTA20_CORE]);
    expect(Array.isArray(sheet.classe.abilities)).toBe(true);
    expect(sheet.classe.abilities.length).toBeGreaterThan(0);
  });

  it('preserva classe.abilities do dado gravado quando presente', () => {
    const storedAbilities = [
      { name: 'Habilidade Custom', text: 'x', nivel: 1 },
    ];
    const stored = {
      __stripped__: true,
      classe: {
        name: 'Arcanista',
        subname: 'Mago',
        abilities: storedAbilities,
      },
    };

    const sheet = rehydrateSheet(stored, [SupplementId.TORMENTA20_CORE]);
    expect(sheet.classe.abilities).toEqual(storedAbilities);
  });
});
