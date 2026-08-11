import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import { normalizeSheet } from '../sheetNormalizer';
import CharacterSheet from '../../interfaces/CharacterSheet';

/**
 * `weaponOverrides` chega inteiro da nuvem sem schema forte (o backend guarda a
 * ficha como documento livre), então o normalizador é o chokepoint que garante
 * que o mapa está são antes de qualquer render.
 *
 * O que ele NÃO faz de propósito: podar overrides quando a ficha está fora de
 * forma. Diferente de `baseSize`/`computedMovementTypes`, que são derivados da
 * transformação ativa, estes existem justamente para atravessá-la.
 */
describe('normalizeSheet x weaponOverrides', () => {
  const normalize = (
    weaponOverrides: unknown
  ): CharacterSheet['weaponOverrides'] => {
    const sheet = createMockCharacterSheet();
    sheet.weaponOverrides =
      weaponOverrides as CharacterSheet['weaponOverrides'];
    normalizeSheet(sheet);
    return sheet.weaponOverrides;
  };

  test('ficha sem o campo continua sem o campo', () => {
    const sheet = createMockCharacterSheet();
    normalizeSheet(sheet);
    expect(sheet.weaponOverrides).toBeUndefined();
  });

  test('mapa válido passa intacto', () => {
    const valid = {
      'wildshape:feroz:basica:0': {
        attackAttribute: 'Sabedoria',
        damageAttribute: 'Destreza',
        customSkill: 'Luta',
      },
    };
    expect(normalize(valid)).toEqual(valid);
  });

  test('override sobrevive fora da Forma Selvagem', () => {
    const sheet = createMockCharacterSheet();
    sheet.activeEffects = [];
    sheet.weaponOverrides = {
      'wildshape:feroz:basica:0': { attackAttribute: 'Sabedoria' },
    };
    normalizeSheet(sheet);
    expect(sheet.weaponOverrides).toEqual({
      'wildshape:feroz:basica:0': { attackAttribute: 'Sabedoria' },
    });
  });

  test('valor que não é objeto é descartado', () => {
    expect(normalize('lixo')).toBeUndefined();
    expect(normalize([1, 2])).toBeUndefined();
    expect(normalize(null)).toBeUndefined();
  });

  test('entradas que não são objeto são podadas', () => {
    expect(
      normalize({ k1: 'lixo', k2: { attackAttribute: 'Sabedoria' } })
    ).toEqual({ k2: { attackAttribute: 'Sabedoria' } });
  });

  test('atributo fora da união é podado, o resto da entrada fica', () => {
    expect(
      normalize({
        k1: { attackAttribute: 'Aparência', damageAttribute: 'Força' },
      })
    ).toEqual({ k1: { damageAttribute: 'Força' } });
  });

  test("'Nenhum' é aceito nos dois atributos", () => {
    expect(
      normalize({
        k1: { attackAttribute: 'Nenhum', damageAttribute: 'Nenhum' },
      })
    ).toEqual({ k1: { attackAttribute: 'Nenhum', damageAttribute: 'Nenhum' } });
  });

  test('entrada que fica vazia some, e o mapa vazio some junto', () => {
    expect(normalize({ k1: { attackAttribute: 'Aparência' } })).toBeUndefined();
    expect(normalize({})).toBeUndefined();
  });
});
