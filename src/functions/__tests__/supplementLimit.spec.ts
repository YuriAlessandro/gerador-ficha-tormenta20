import {
  SupportLevel,
  getMaxSupplements,
  getSupplementCeiling,
} from '../../types/subscription.types';
import {
  SupplementId,
  countNonCore,
  SUPPLEMENT_METADATA,
} from '../../types/supplement.types';

/**
 * Trava a política de limite de suplementos por nível de apoio. Estes valores
 * são espelhados no backend (`getMaxSupplements` em src/types/subscription.ts),
 * que revalida toda escrita — mudou aqui, mude lá.
 */
describe('limite de suplementos por nível de apoio', () => {
  const PAID_LEVELS = Object.values(SupportLevel).filter(
    (level) => level !== SupportLevel.FREE
  );

  it('grátis pode 4 além do básico; apoiadores, ilimitado', () => {
    expect(getMaxSupplements(SupportLevel.FREE)).toBe(4);
    PAID_LEVELS.forEach((level) => {
      expect(getMaxSupplements(level)).toBeNull();
    });
  });

  it('o livro básico não conta para o limite', () => {
    expect(countNonCore([SupplementId.TORMENTA20_CORE])).toBe(0);
    expect(
      countNonCore([
        SupplementId.TORMENTA20_CORE,
        SupplementId.TORMENTA20_ATLAS_ARTON,
      ])
    ).toBe(1);
  });

  it('o limite força uma escolha: há mais suplementos do que cabem', () => {
    const nonCore = Object.values(SUPPLEMENT_METADATA).filter(
      (s) => s.id !== SupplementId.TORMENTA20_CORE
    );
    expect(nonCore.length).toBeGreaterThan(
      getMaxSupplements(SupportLevel.FREE) as number
    );
  });

  it('não força quem já está acima do limite a desativar nada', () => {
    // Ex-apoiador com 5 ativos: o teto acompanha o que ele já tem...
    expect(getSupplementCeiling(SupportLevel.FREE, 5)).toBe(5);
    // ...mas não deixa crescer além disso.
    expect(getSupplementCeiling(SupportLevel.FREE, 5)).toBeLessThan(6);
    // Quem está dentro do limite continua com o teto normal.
    expect(getSupplementCeiling(SupportLevel.FREE, 2)).toBe(4);
    expect(getSupplementCeiling(SupportLevel.NIVEL_2, 5)).toBeNull();
  });
});
