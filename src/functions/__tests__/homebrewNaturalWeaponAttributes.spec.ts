import { compileNaturalWeapon } from '../../premium/functions/compileRace';
import { validateRaceContent } from '../../premium/functions/homebrewValidation';
import type {
  HomebrewNaturalWeapon,
  HomebrewRaceContent,
} from '../../premium/interfaces/Homebrew';

/**
 * Armas naturais de homebrew não tinham onde declarar o atributo de ataque nem
 * o de dano — `compileNaturalWeapon` descartava tudo que não fosse
 * nome/dano/crítico/tipo, então quem criava conteúdo não conseguia fazer uma
 * garra atacar com Sabedoria.
 */

const base: HomebrewNaturalWeapon = {
  name: 'Garras',
  damage: '1d6',
  critMultiplier: 2,
  threatMargin: 20,
  damageType: 'Corte',
};

describe('compileNaturalWeapon — atributos', () => {
  test('sem atributos declarados, o Equipment não carrega os campos', () => {
    const compiled = compileNaturalWeapon(base);
    expect(compiled.attackAttribute).toBeUndefined();
    expect(compiled.damageAttribute).toBeUndefined();
    // Ausente tem que cair na regra padrão, não num valor gravado.
    expect('damageAttribute' in compiled).toBe(false);
  });

  test('propaga attackAttribute e damageAttribute', () => {
    const compiled = compileNaturalWeapon({
      ...base,
      attackAttribute: 'Sabedoria',
      damageAttribute: 'Destreza',
    });
    expect(compiled.attackAttribute).toBe('Sabedoria');
    expect(compiled.damageAttribute).toBe('Destreza');
  });

  test("'Nenhum' é propagado como valor concreto", () => {
    const compiled = compileNaturalWeapon({
      ...base,
      damageAttribute: 'Nenhum',
    });
    expect(compiled.damageAttribute).toBe('Nenhum');
  });

  test('os demais campos continuam iguais', () => {
    const compiled = compileNaturalWeapon({
      ...base,
      threatMargin: 19,
      critMultiplier: 3,
      attackAttribute: 'Inteligência',
    });
    expect(compiled.group).toBe('Arma');
    expect(compiled.nome).toBe('Garras');
    expect(compiled.dano).toBe('1d6');
    expect(compiled.critico).toBe('19/x3');
    expect(compiled.preco).toBe(0);
    expect(compiled.spaces).toBe(0);
  });
});

describe('validação de arma natural homebrew', () => {
  const mkRace = (weapon: HomebrewNaturalWeapon): HomebrewRaceContent =>
    ({
      attributes: { attrs: [] },
      abilities: [
        { name: 'Garras', description: 'garras', naturalWeapons: [weapon] },
      ],
    } as unknown as HomebrewRaceContent);

  const errorsFor = (weapon: HomebrewNaturalWeapon): string[] => {
    const errors: string[] = [];
    validateRaceContent(mkRace(weapon), errors);
    return errors;
  };

  // Filtra só o que esta suíte cobre: a raça sintética acima não é completa, e
  // outros erros de conteúdo não interessam aqui.
  const attributeErrors = (weapon: HomebrewNaturalWeapon): string[] =>
    errorsFor(weapon).filter((e) => e.includes('arma natural'));

  test('atributos válidos passam', () => {
    expect(
      attributeErrors({
        ...base,
        attackAttribute: 'Sabedoria',
        damageAttribute: 'Nenhum',
      })
    ).toEqual([]);
  });

  test('ausência dos campos passa', () => {
    expect(attributeErrors(base)).toEqual([]);
  });

  test('atributo de ataque inválido é rejeitado', () => {
    const errors = errorsFor({
      ...base,
      attackAttribute: 'Aparência' as never,
    });
    expect(errors.some((e) => e.includes('Atributo de ataque'))).toBe(true);
  });

  test('atributo de dano inválido é rejeitado', () => {
    const errors = errorsFor({
      ...base,
      damageAttribute: 'Sorte' as never,
    });
    expect(errors.some((e) => e.includes('Atributo de dano'))).toBe(true);
  });
});
