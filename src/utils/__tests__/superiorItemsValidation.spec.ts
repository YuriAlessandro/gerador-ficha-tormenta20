import {
  addModificationWithPrerequisites,
  formatPrerequisite,
  isPrereqMetByNames,
  removeModificationWithDependents,
  validateModificationCombination,
  validateModificationRequirement,
} from '../superiorItemsValidation';
import { ItemMod } from '../../interfaces/Rewards';

const banhada: ItemMod = {
  min: 0,
  max: 0,
  mod: 'Banhada a ouro',
};
const cravejada: ItemMod = {
  min: 0,
  max: 0,
  mod: 'Cravejada de gemas',
};
const deslumbrante: ItemMod = {
  min: 0,
  max: 0,
  mod: 'Deslumbrante',
  prerequisite: ['Banhada a ouro', 'Cravejada de gemas'],
};
const cruel: ItemMod = { min: 0, max: 0, mod: 'Cruel' };
const atroz: ItemMod = {
  min: 0,
  max: 0,
  mod: 'Atroz',
  prerequisite: 'Cruel',
};

describe('formatPrerequisite', () => {
  test('returns empty string when prereq is undefined', () => {
    expect(formatPrerequisite(undefined)).toBe('');
  });

  test('returns the string as-is for single prereq', () => {
    expect(formatPrerequisite('Cruel')).toBe('Cruel');
  });

  test('joins array prereqs with " ou "', () => {
    expect(formatPrerequisite(['Banhada a ouro', 'Cravejada de gemas'])).toBe(
      'Banhada a ouro ou Cravejada de gemas'
    );
  });
});

describe('validateModificationRequirement', () => {
  test('passes when mod has no prerequisite', () => {
    expect(validateModificationRequirement(cruel, [])).toBe(true);
  });

  test('passes when single prerequisite is satisfied', () => {
    expect(validateModificationRequirement(atroz, [cruel])).toBe(true);
  });

  test('fails when single prerequisite is missing', () => {
    expect(validateModificationRequirement(atroz, [])).toBe(false);
  });

  test('passes when first OR prerequisite is present', () => {
    expect(validateModificationRequirement(deslumbrante, [banhada])).toBe(true);
  });

  test('passes when second OR prerequisite is present', () => {
    expect(validateModificationRequirement(deslumbrante, [cravejada])).toBe(
      true
    );
  });

  test('fails when no OR prerequisite is present', () => {
    expect(validateModificationRequirement(deslumbrante, [cruel])).toBe(false);
  });
});

describe('validateModificationCombination', () => {
  test('reports error with " ou "-joined prereqs for OR mods', () => {
    const result = validateModificationCombination([deslumbrante]);
    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual([
      'Deslumbrante requer Banhada a ouro ou Cravejada de gemas',
    ]);
    expect(result.missingPrerequisites).toEqual([
      'Banhada a ouro',
      'Cravejada de gemas',
    ]);
  });

  test('valid when any OR prereq is present', () => {
    const result = validateModificationCombination([cravejada, deslumbrante]);
    expect(result.isValid).toBe(true);
  });
});

describe('addModificationWithPrerequisites', () => {
  const allMods = [banhada, cravejada, deslumbrante, cruel, atroz];

  test('auto-adds the FIRST prereq from an OR list', () => {
    const result = addModificationWithPrerequisites(deslumbrante, [], allMods);
    expect(result.map((m) => m.mod)).toEqual([
      'Banhada a ouro',
      'Deslumbrante',
    ]);
  });

  test('does not add prereq when any OR option already present', () => {
    const result = addModificationWithPrerequisites(
      deslumbrante,
      [cravejada],
      allMods
    );
    expect(result.map((m) => m.mod)).toEqual([
      'Cravejada de gemas',
      'Deslumbrante',
    ]);
  });

  test('still works for single-prereq mods', () => {
    const result = addModificationWithPrerequisites(atroz, [], allMods);
    expect(result.map((m) => m.mod)).toEqual(['Cruel', 'Atroz']);
  });
});

describe('removeModificationWithDependents', () => {
  test('removes dependent when single prereq is removed', () => {
    const result = removeModificationWithDependents(cruel, [cruel, atroz]);
    expect(result).toEqual([]);
  });

  test('keeps OR-dependent when alternate prereq remains', () => {
    const result = removeModificationWithDependents(banhada, [
      banhada,
      cravejada,
      deslumbrante,
    ]);
    expect(result.map((m) => m.mod)).toEqual([
      'Cravejada de gemas',
      'Deslumbrante',
    ]);
  });

  test('removes OR-dependent when last prereq is removed', () => {
    const result = removeModificationWithDependents(banhada, [
      banhada,
      deslumbrante,
    ]);
    expect(result).toEqual([]);
  });
});

describe('isPrereqMetByNames', () => {
  test('returns true when no prereq', () => {
    expect(isPrereqMetByNames(undefined, [])).toBe(true);
  });

  test('matches single string against name list', () => {
    expect(isPrereqMetByNames('Cruel', ['Cruel'])).toBe(true);
    expect(isPrereqMetByNames('Cruel', [])).toBe(false);
  });

  test('matches OR array against name list', () => {
    expect(
      isPrereqMetByNames(
        ['Banhada a ouro', 'Cravejada de gemas'],
        ['Cravejada de gemas']
      )
    ).toBe(true);
    expect(
      isPrereqMetByNames(['Banhada a ouro', 'Cravejada de gemas'], ['Cruel'])
    ).toBe(false);
  });
});
