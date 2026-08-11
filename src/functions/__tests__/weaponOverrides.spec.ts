import {
  mergeWeaponOverride,
  resolveWeaponOverride,
  setWeaponOverride,
} from '../weaponOverrides';
import Equipment, { WeaponOverride } from '../../interfaces/Equipment';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Skill from '../../interfaces/Skills';

const garra: Equipment = {
  nome: 'Garra',
  group: 'Arma',
  dano: '1d6',
  overrideKey: 'wildshape:feroz:basica:0',
};

// A ficha inteira é grande demais para montar aqui e nada disso a lê — só o
// campo `weaponOverrides` importa para estas funções.
const mkSheet = (
  weaponOverrides?: Record<string, WeaponOverride>
): CharacterSheet =>
  ({ nome: 'Teste', weaponOverrides } as unknown as CharacterSheet);

describe('resolveWeaponOverride', () => {
  const overrides = {
    'wildshape:feroz:basica:0': { attackAttribute: 'Sabedoria' as const },
  };

  test('devolve undefined sem mapa', () => {
    expect(resolveWeaponOverride(undefined, 'qualquer')).toBeUndefined();
  });

  test('casa pela chave exata', () => {
    expect(
      resolveWeaponOverride(overrides, 'wildshape:feroz:basica:0')
    ).toEqual({ attackAttribute: 'Sabedoria' });
  });

  test('usa a primeira chave que existir, na ordem dada', () => {
    expect(
      resolveWeaponOverride(
        overrides,
        'inexistente',
        'wildshape:feroz:basica:0'
      )
    ).toEqual({ attackAttribute: 'Sabedoria' });
  });
});

describe('mergeWeaponOverride', () => {
  test('sem override devolve a MESMA referência', () => {
    expect(mergeWeaponOverride(garra)).toBe(garra);
  });

  test('só sobrescreve o que o override define', () => {
    const base: Equipment = { ...garra, damageAttribute: 'Força' };
    const merged = mergeWeaponOverride(base, { attackAttribute: 'Destreza' });
    expect(merged.attackAttribute).toBe('Destreza');
    expect(merged.damageAttribute).toBe('Força');
    expect(merged.nome).toBe('Garra');
  });

  test('não muta a arma original', () => {
    mergeWeaponOverride(garra, { attackAttribute: 'Destreza' });
    expect(garra.attackAttribute).toBeUndefined();
  });

  test('aplica perícia e os dois atributos juntos', () => {
    const merged = mergeWeaponOverride(garra, {
      customSkill: Skill.MISTICISMO,
      attackAttribute: 'Inteligência',
      damageAttribute: 'Nenhum',
    });
    expect(merged.customSkill).toBe(Skill.MISTICISMO);
    expect(merged.attackAttribute).toBe('Inteligência');
    expect(merged.damageAttribute).toBe('Nenhum');
  });
});

describe('setWeaponOverride', () => {
  test('cria o mapa na primeira gravação', () => {
    const next = setWeaponOverride(mkSheet(), 'k1', {
      attackAttribute: 'Sabedoria',
    });
    expect(next.weaponOverrides).toEqual({
      k1: { attackAttribute: 'Sabedoria' },
    });
  });

  test('não muta a ficha original', () => {
    const sheet = mkSheet();
    setWeaponOverride(sheet, 'k1', { attackAttribute: 'Sabedoria' });
    expect(sheet.weaponOverrides).toBeUndefined();
  });

  test('preserva as outras entradas', () => {
    const sheet = mkSheet({ k1: { attackAttribute: 'Sabedoria' } });
    const next = setWeaponOverride(sheet, 'k2', {
      damageAttribute: 'Destreza',
    });
    expect(next.weaponOverrides).toEqual({
      k1: { attackAttribute: 'Sabedoria' },
      k2: { damageAttribute: 'Destreza' },
    });
  });

  // "Restaurar padrão" manda um override vazio: a entrada tem que sumir, senão
  // a arma ficaria travada num override invisível.
  test('override vazio remove a entrada', () => {
    const sheet = mkSheet({
      k1: { attackAttribute: 'Sabedoria' },
      k2: { damageAttribute: 'Destreza' },
    });
    const next = setWeaponOverride(sheet, 'k1', {});
    expect(next.weaponOverrides).toEqual({
      k2: { damageAttribute: 'Destreza' },
    });
  });

  test('mapa vazio some da ficha inteira', () => {
    const sheet = mkSheet({ k1: { attackAttribute: 'Sabedoria' } });
    const next = setWeaponOverride(sheet, 'k1', {});
    expect(next.weaponOverrides).toBeUndefined();
    expect('weaponOverrides' in next).toBe(false);
  });
});
