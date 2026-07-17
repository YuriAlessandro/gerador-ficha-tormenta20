import { describe, expect, test, vi } from 'vitest';
import {
  parseCritical,
  parseDamage,
  rollCriticalDamage,
  rollDamage,
} from '../diceRoller';

/**
 * Cobre o parse da string de crítico das armas e a multiplicação de dados em
 * acerto crítico (regra T20: multiplica os DADOS, nunca o modificador
 * numérico).
 */
describe('parseCritical', () => {
  test('vazio, "-" e "**" caem no padrão 20/x2 (todo ataque crita no 20 natural)', () => {
    expect(parseCritical('')).toEqual({ threshold: 20, multiplier: 2 });
    expect(parseCritical('-')).toEqual({ threshold: 20, multiplier: 2 });
    expect(parseCritical('**')).toEqual({ threshold: 20, multiplier: 2 });
  });

  test('apenas threshold: "19" => 19/x2', () => {
    expect(parseCritical('19')).toEqual({ threshold: 19, multiplier: 2 });
    expect(parseCritical('18')).toEqual({ threshold: 18, multiplier: 2 });
  });

  test('apenas multiplicador: "x3" => 20/x3', () => {
    expect(parseCritical('x3')).toEqual({ threshold: 20, multiplier: 3 });
    expect(parseCritical('x4')).toEqual({ threshold: 20, multiplier: 4 });
  });

  test('formato completo: "19/x3"', () => {
    expect(parseCritical('19/x3')).toEqual({ threshold: 19, multiplier: 3 });
  });

  test('tolera espaços e maiúsculas: " 18/X4 "', () => {
    expect(parseCritical(' 18/X4 ')).toEqual({ threshold: 18, multiplier: 4 });
  });

  test('string inválida cai no padrão 20/x2', () => {
    expect(parseCritical('abc')).toEqual({ threshold: 20, multiplier: 2 });
  });
});

describe('rollCriticalDamage', () => {
  test('multiplica a contagem de dados, não o modificador (3d12+5 x2 => 6d12+5)', () => {
    const result = rollCriticalDamage('3d12+5', 2);
    expect(result).not.toBeNull();
    expect(result?.diceString).toBe('6d12');
    expect(result?.diceRolls).toHaveLength(6);
    expect(result?.modifier).toBe(5);
  });

  test('multiplica cada grupo de dados (1d8+1d6+3 x3 => 3d8+3d6+3)', () => {
    const result = rollCriticalDamage('1d8+1d6+3', 3);
    expect(result).not.toBeNull();
    expect(result?.diceString).toBe('3d8+3d6');
    expect(result?.diceRolls).toHaveLength(6);
    expect(result?.modifier).toBe(3);
  });

  test('total = soma dos dados + modificador (RNG travado)', () => {
    // Math.random() = 0.5 => cada d8 rola 5
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const result = rollCriticalDamage('2d8+3', 2);
    expect(result?.diceRolls).toEqual([5, 5, 5, 5]);
    expect(result?.total).toBe(4 * 5 + 3);
    spy.mockRestore();
  });

  test('string inválida retorna null', () => {
    expect(rollCriticalDamage('-', 2)).toBeNull();
    expect(rollCriticalDamage('', 2)).toBeNull();
  });
});

describe('parseDamage / rollDamage', () => {
  test('parseia múltiplos grupos e soma modificadores', () => {
    expect(parseDamage('1d8+1d6+3-1')).toEqual({
      diceGroups: [
        { count: 1, sides: 8 },
        { count: 1, sides: 6 },
      ],
      modifier: 2,
      diceString: '1d8+1d6',
    });
  });

  test('strings inválidas retornam null', () => {
    expect(parseDamage('-')).toBeNull();
    expect(parseDamage('')).toBeNull();
    expect(rollDamage('abc')).toBeNull();
  });
});
