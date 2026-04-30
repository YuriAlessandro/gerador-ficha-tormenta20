import { describe, it, expect } from 'vitest';
import { stepUpDamage } from '../../functions/weaponDamageStep';

describe('stepUpDamage — linear ladder', () => {
  it('advances a single step on common dice', () => {
    expect(stepUpDamage('1d4', 1)).toBe('1d6');
    expect(stepUpDamage('1d6', 1)).toBe('1d8');
    expect(stepUpDamage('1d8', 1)).toBe('1d10');
    expect(stepUpDamage('1d10', 1)).toBe('1d12');
  });

  it('jumps from 1d12 to 3d6 (next ladder rung)', () => {
    expect(stepUpDamage('1d12', 1)).toBe('3d6');
  });

  it('continues into multi-die territory', () => {
    expect(stepUpDamage('3d6', 1)).toBe('4d6');
    expect(stepUpDamage('4d6', 1)).toBe('4d8');
    expect(stepUpDamage('4d8', 1)).toBe('4d10');
    expect(stepUpDamage('4d10', 1)).toBe('4d12');
  });

  it('caps at 4d12 (max)', () => {
    expect(stepUpDamage('4d12', 1)).toBe('4d12');
    expect(stepUpDamage('4d12', 5)).toBe('4d12');
  });

  it('handles fixed damage of 1 (count=0 in ladder)', () => {
    expect(stepUpDamage('1', 1)).toBe('1d2');
    expect(stepUpDamage('1', 3)).toBe('1d4');
  });

  it('walks multiple steps at once', () => {
    expect(stepUpDamage('1d4', 2)).toBe('1d8');
    expect(stepUpDamage('1d6', 3)).toBe('1d12');
    expect(stepUpDamage('1d8', 4)).toBe('4d6');
  });

  it('preserves trailing modifiers (e.g. flat damage bonus)', () => {
    expect(stepUpDamage('1d8+3', 1)).toBe('1d10+3');
    expect(stepUpDamage('2d4-1', 0)).toBe('2d4-1');
  });

  it('processes composite damage strings split by /', () => {
    expect(stepUpDamage('1d10/1d12', 1)).toBe('1d12/3d6');
    expect(stepUpDamage('1d6/1d6', 2)).toBe('1d10/1d10');
  });

  it('returns the original string when no parsable die is present', () => {
    expect(stepUpDamage('-', 1)).toBe('-');
    expect(stepUpDamage('', 1)).toBe('');
    expect(stepUpDamage('Especial', 2)).toBe('Especial');
  });

  it('returns the original string for unknown dice not on the ladder', () => {
    // 1d20 is not on the canonical T20 weapon ladder
    expect(stepUpDamage('1d20', 1)).toBe('1d20');
    // 2d4 isn't on the ladder either (the table lists only 1dN and 3-4dN forms)
    expect(stepUpDamage('2d4', 1)).toBe('2d4');
  });

  it('is a no-op when steps is 0', () => {
    expect(stepUpDamage('1d8', 0)).toBe('1d8');
    expect(stepUpDamage('3d6', 0)).toBe('3d6');
  });
});
