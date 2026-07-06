/**
 * Regression tests for restoreSpellPath / rehydrateSheet / normalizeSheet with
 * malformed sheets. Prod crashes (jul/2026), mesma ficha corrompida na nuvem:
 * 1. "undefined is not an object (evaluating 'tt.abilities.push')" — Arcanista
 *    sem subname e sem classe.abilities fazia restoreSpellPath chamar
 *    ARCANISTA.setup(), que dava push num array inexistente.
 * 2. "Cannot read properties of undefined (reading 'Força')" — ficha sem
 *    `atributos` quebrava convertToFoundry, chamado em todo render do
 *    MainScreen.
 * 3. "undefined is not an object (evaluating 'Gr.proficiencias.filter')" —
 *    ficha sem `classe.proficiencias` quebrava useMemo do Result.
 */
import { describe, it, expect } from 'vitest';
import { restoreSpellPath } from '../../functions/general';
import { rehydrateSheet } from '../../functions/sheetPayloadOptimizer';
import { normalizeSheet } from '../../functions/sheetNormalizer';
import { convertToFoundry } from '../../2foundry';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { Atributo } from '../../data/systems/tormenta20/atributos';
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

describe('normalizeSheet - fichas sem campos obrigatórios', () => {
  it('preenche atributos, arrays e size com defaults neutros', () => {
    const sheet = {
      classe: { name: 'Guerreiro' },
      raca: { name: 'Humano' },
    } as unknown as CharacterSheet;

    normalizeSheet(sheet);

    Object.values(Atributo).forEach((attr) => {
      expect(sheet.atributos[attr]).toEqual({ name: attr, value: 0 });
    });
    expect(sheet.skills).toEqual([]);
    expect(sheet.size.name).toBe('Médio');
    expect(sheet.nivel).toBe(1);
    expect(sheet.classe.abilities).toEqual([]);
    expect(sheet.raca.abilities).toEqual([]);
    expect(sheet.bag).toBeDefined();
    // Crash 3: Result faz classe.proficiencias.filter direto
    expect(sheet.classe.proficiencias).toEqual([]);
    expect(sheet.classe.powers).toEqual([]);
    expect(sheet.classe.periciasbasicas).toEqual([]);
    expect(sheet.classe.periciasrestantes).toEqual({ qtd: 0, list: [] });
  });

  it('remove devoto parcial (sem divindade) e preenche poderes', () => {
    const semDivindade = {
      classe: { name: 'Guerreiro' },
      devoto: { poderes: [] },
    } as unknown as CharacterSheet;
    normalizeSheet(semDivindade);
    // Result renderiza devoto.divindade.name se devoto existir
    expect(semDivindade.devoto).toBeUndefined();

    const semPoderes = {
      classe: { name: 'Guerreiro' },
      devoto: { divindade: { name: 'Khalmyr' } },
    } as unknown as CharacterSheet;
    normalizeSheet(semPoderes);
    expect(semPoderes.devoto?.divindade.name).toBe('Khalmyr');
    expect(semPoderes.devoto?.poderes).toEqual([]);
  });

  it('não sobrescreve valores presentes', () => {
    const sheet = {
      nome: 'Test',
      nivel: 7,
      pv: 55,
      atributos: {
        [Atributo.FORCA]: { name: Atributo.FORCA, value: 3 },
      },
      classe: { name: 'Guerreiro', abilities: [{ name: 'X' }] },
    } as unknown as CharacterSheet;

    normalizeSheet(sheet);

    expect(sheet.nivel).toBe(7);
    expect(sheet.pv).toBe(55);
    expect(sheet.atributos[Atributo.FORCA].value).toBe(3);
    // Atributos ausentes são preenchidos, presentes são preservados
    expect(sheet.atributos[Atributo.CARISMA].value).toBe(0);
    expect(sheet.classe.abilities).toHaveLength(1);
  });

  it('ficha sem atributos sobrevive a restoreSpellPath + convertToFoundry (crash 2)', () => {
    const sheet = {
      nome: 'Ficha Corrompida',
      classe: { name: 'Arcanista' },
      raca: { name: 'Humano' },
    } as unknown as CharacterSheet;

    expect(() => restoreSpellPath(sheet, coreClasses)).not.toThrow();
    expect(() => convertToFoundry(sheet)).not.toThrow();

    const foundry = convertToFoundry(sheet);
    expect(foundry.system.atributos.for.base).toBe(0);
  });
});
