import { cloneDeep } from 'lodash';
import { applyManualLevelUp } from '../general';
import { findClassDescription, getClassLevelsMap } from '../multiclass';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import { LevelUpSelections } from '../../interfaces/WizardSelections';

describe('applyManualLevelUp - sincronia de classLevels', () => {
  test('multiclasse não infla a classe primária quando classLevels veio dessincronizado', () => {
    // Cenário do bug: ficha Druida cujo nível foi reduzido para 3 sem aparar
    // classLevels (que ficou com 4 entradas). O level-up com multiclasse não
    // pode acumular um 4º nível de Druida fantasma.
    const druida = findClassDescription('Druida')!;
    const sheet = createMockCharacterSheet();
    sheet.classe = cloneDeep(druida);
    sheet.nivel = 3;
    sheet.classLevels = [1, 2, 3, 4].map((level) => ({
      level,
      className: 'Druida',
    }));

    const selections: LevelUpSelections = {
      level: 4,
      selectedClassName: 'Guerreiro',
      powerChoice: 'class',
    };

    const result = applyManualLevelUp(sheet, selections);

    expect(result.nivel).toBe(4);
    expect(result.classLevels).toHaveLength(4);
    expect(result.classLevels!.map((cl) => cl.className)).toEqual([
      'Druida',
      'Druida',
      'Druida',
      'Guerreiro',
    ]);

    const map = getClassLevelsMap(result);
    expect(map.get('Druida')).toBe(3);
    expect(map.get('Guerreiro')).toBe(1);
  });

  test('caso normal (classLevels já em sincronia) continua correto', () => {
    const druida = findClassDescription('Druida')!;
    const sheet = createMockCharacterSheet();
    sheet.classe = cloneDeep(druida);
    sheet.nivel = 3;
    sheet.classLevels = [1, 2, 3].map((level) => ({
      level,
      className: 'Druida',
    }));

    const result = applyManualLevelUp(sheet, {
      level: 4,
      selectedClassName: 'Guerreiro',
      powerChoice: 'class',
    });

    expect(result.nivel).toBe(4);
    expect(result.classLevels).toHaveLength(4);
    const map = getClassLevelsMap(result);
    expect(map.get('Druida')).toBe(3);
    expect(map.get('Guerreiro')).toBe(1);
  });
});
