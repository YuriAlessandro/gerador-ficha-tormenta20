import { rehydrateSheet, stripSheetForStorage } from '../sheetPayloadOptimizer';
import { resolveClassPowerCatalog } from '../powers';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { ClassDescription } from '../../interfaces/Class';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';

/**
 * `stripSheetForStorage` zera `classe.powers` (o catálogo pesa ~50-100KB) e
 * `rehydrateSheet` só o restaura quando a classe é encontrada DENTRO dos
 * suplementos ativos do usuário. Uma classe VARIANTE (Alquimista, Necromante,
 * Duelista…) vem de um suplemento; com ele desativado, a ficha carrega com
 * `powers: []` e o editor de poderes escondia o acordeão inteiro sem mensagem.
 *
 * `resolveClassPowerCatalog` é o fallback: resolve pelo registry inteiro,
 * independente dos suplementos ativos.
 */
describe('catálogo de poderes de classe em fichas carregadas', () => {
  const ALL: SupplementId[] = [
    SupplementId.TORMENTA20_CORE,
    SupplementId.TORMENTA20_HEROIS_ARTON,
  ];

  const classFromRegistry = (name: string): ClassDescription => {
    const classe = dataRegistry
      .getClassesBySupplements(ALL)
      .find((c) => c.name === name);
    if (!classe) throw new Error(`${name} não encontrada no registry`);
    return classe;
  };

  const buildSheet = (className: string): CharacterSheet => {
    const sheet = createMockCharacterSheet();
    sheet.nivel = 5;
    sheet.classe = { ...classFromRegistry(className) };
    return sheet;
  };

  const roundTrip = (
    sheet: CharacterSheet,
    activeSupplements: SupplementId[]
  ): CharacterSheet => {
    const stripped = stripSheetForStorage(sheet);
    const wire = JSON.parse(JSON.stringify(stripped)) as Record<
      string,
      unknown
    >;
    return rehydrateSheet(wire, activeSupplements);
  };

  it('o Alquimista herda os poderes do Inventor no registry', () => {
    // 30 poderes do básico + 20 de Heróis de Arton.
    expect(classFromRegistry('Alquimista').powers.length).toBe(
      classFromRegistry('Inventor').powers.length
    );
    expect(
      classFromRegistry('Alquimista').powers.length
    ).toBeGreaterThanOrEqual(50);
  });

  it('variante + suplemento desativado zera classe.powers, mas o fallback resolve', () => {
    const loaded = roundTrip(buildSheet('Alquimista'), [
      SupplementId.TORMENTA20_CORE,
    ]);

    // O bug: sem Heróis de Arton ativo, a variante não é resolvida.
    expect(loaded.classe.powers).toHaveLength(0);

    // O fix: o fallback busca no registry inteiro.
    expect(resolveClassPowerCatalog(loaded).length).toBeGreaterThanOrEqual(50);
  });

  it('com o suplemento ativo, o catálogo volta normalmente', () => {
    const loaded = roundTrip(buildSheet('Alquimista'), ALL);

    expect(loaded.classe.powers.length).toBeGreaterThanOrEqual(50);
    expect(resolveClassPowerCatalog(loaded)).toBe(loaded.classe.powers);
  });

  it('regressão: Inventor puro mantém o catálogo mesmo só com o core', () => {
    const loaded = roundTrip(buildSheet('Inventor'), [
      SupplementId.TORMENTA20_CORE,
    ]);

    // Classe do livro básico: sempre resolve. Mas com HdA desativado ela volta
    // só com os 30 poderes do core.
    expect(resolveClassPowerCatalog(loaded).length).toBeGreaterThanOrEqual(30);
  });
});
