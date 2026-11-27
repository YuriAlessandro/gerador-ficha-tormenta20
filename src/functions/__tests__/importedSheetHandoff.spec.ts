import { describe, expect, it } from 'vitest';
import type CharacterSheet from '../../interfaces/CharacterSheet';
import {
  handOffImportedSheet,
  takeImportedSheet,
} from '../importedSheetHandoff';

describe('importedSheetHandoff', () => {
  it('sem entrega, não há ficha', () => {
    expect(takeImportedSheet()).toBeNull();
  });

  it('entrega a mesma ficha, uma vez só', () => {
    const sheet = { id: 'a', nome: 'Lia' } as CharacterSheet;
    handOffImportedSheet(sheet);
    expect(takeImportedSheet()).toBe(sheet);
    expect(takeImportedSheet()).toBeNull();
  });
});
