import { partitionCrossTraditionByCircle } from '../spellPathUtils';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';

/**
 * Teurgista Místico (divindade Wynna): "até uma magia de cada círculo que você
 * aprender poderá ser escolhida entre magias da tradição oposta". O limite
 * (`crossTraditionLimit`) é POR CÍRCULO — círculos já esgotados param de ofertar
 * magias cross, mas círculos recém-abertos continuam ofertando.
 */
describe('partitionCrossTraditionByCircle', () => {
  const build = (): Map<number, Set<string>> =>
    new Map<number, Set<string>>([
      [1, new Set(['Cross A1', 'Cross B1'])],
      [2, new Set(['Cross A2', 'Cross B2'])],
    ]);

  it('círculo 1 esgotado + círculo 2 aberto: remove só o círculo 1', () => {
    const { removeNames, keepNames } = partitionCrossTraditionByCircle(
      build(),
      ['Cross A1'],
      1
    );
    // Círculo 1 esgotado (já tem 1 magia cross) → todas removidas do pool.
    expect(removeNames.has('Cross A1')).toBe(true);
    expect(removeNames.has('Cross B1')).toBe(true);
    // Círculo 2 ainda aberto → segue ofertando.
    expect(keepNames.has('Cross A2')).toBe(true);
    expect(keepNames.has('Cross B2')).toBe(true);
    expect(removeNames.has('Cross A2')).toBe(false);
    expect(keepNames.has('Cross A1')).toBe(false);
  });

  it('nada conhecido: nenhum círculo é removido', () => {
    const { removeNames, keepNames } = partitionCrossTraditionByCircle(
      build(),
      [],
      1
    );
    expect(removeNames.size).toBe(0);
    expect(keepNames.size).toBe(4);
  });

  it('todos os círculos esgotados: tudo é removido', () => {
    const { removeNames, keepNames } = partitionCrossTraditionByCircle(
      build(),
      ['Cross A1', 'Cross B2'],
      1
    );
    expect(removeNames.size).toBe(4);
    expect(keepNames.size).toBe(0);
  });

  it('respeita um limite maior que 1 (não esgota com 1 magia)', () => {
    const { removeNames, keepNames } = partitionCrossTraditionByCircle(
      build(),
      ['Cross A1'],
      2
    );
    // 1 magia conhecida < limite 2 → círculo 1 ainda aberto.
    expect(removeNames.size).toBe(0);
    expect(keepNames.size).toBe(4);
  });
});

/**
 * Regressão do bug reportado: um conjurador divino (Clérigo) devoto de Wynna com
 * Teurgista Místico escolhe 1 magia arcana no 1º círculo (nível 1). Ao subir
 * para o nível 5 (que abre o 2º círculo), o pool ainda deve ofertar magias
 * arcanas do 2º círculo — antes o limite era global e removia tudo.
 */
describe('Teurgista Místico: pool arcano por círculo (dados reais)', () => {
  const CORE = [SupplementId.TORMENTA20_CORE];
  const arcaneCircle1 = dataRegistry.getArcaneSpellsByCircleAndSupplements(
    1,
    CORE
  );
  const arcaneCircle2 = dataRegistry.getArcaneSpellsByCircleAndSupplements(
    2,
    CORE
  );

  it('há magias arcanas de 1º e 2º círculo no core', () => {
    expect(arcaneCircle1.length).toBeGreaterThan(1);
    expect(arcaneCircle2.length).toBeGreaterThan(0);
  });

  it('com 1 arcana de círculo 1 conhecida, o círculo 2 continua ofertando', () => {
    const crossNamesByCircle = new Map<number, Set<string>>([
      [1, new Set(arcaneCircle1.map((s) => s.nome))],
      [2, new Set(arcaneCircle2.map((s) => s.nome))],
    ]);
    const knownCircle1Spell = arcaneCircle1[0].nome;

    const { removeNames, keepNames } = partitionCrossTraditionByCircle(
      crossNamesByCircle,
      [knownCircle1Spell],
      1
    );

    // Círculo 1 esgotado: outra arcana de círculo 1 sai do pool.
    expect(removeNames.has(arcaneCircle1[1].nome)).toBe(true);
    // Círculo 2 aberto: a arcana de círculo 2 segue ofertada (o bug removia).
    expect(keepNames.has(arcaneCircle2[0].nome)).toBe(true);
    expect(removeNames.has(arcaneCircle2[0].nome)).toBe(false);
  });
});
