import { cloneDeep } from 'lodash';
import { applyManualLevelUp } from '../general';
import { findClassDescription } from '../multiclass';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import { recalculateSheet } from '../recalculateSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';

/**
 * `classe.abilities` é reconstruído a partir de `originalAbilities` em três
 * pontos diferentes. Estes testes travam o contrato: o que o USUÁRIO escreveu
 * na habilidade sobrevive à reconstrução.
 */
const makeSheetWithUserFields = (): CharacterSheet => {
  const druida = findClassDescription('Druida')!;
  const sheet = createMockCharacterSheet();
  sheet.classe = cloneDeep(druida);
  sheet.nivel = 3;
  sheet.classLevels = [1, 2, 3].map((level) => ({
    level,
    className: 'Druida',
  }));
  sheet.classe.originalAbilities = cloneDeep(druida.abilities);
  sheet.classe.abilities = cloneDeep(druida.abilities).filter(
    (ability) => ability.nivel <= 3
  );

  const target = sheet.classe.abilities[0];
  target.rolls = [{ label: 'Dano', dice: '1d8' }];
  target.customName = 'Empatia Selvagem (Mestre)';
  target.customDescription = 'Peguei no nível 1, versão combinada na mesa.';

  return sheet;
};

const findAbility = (sheet: CharacterSheet, name: string) =>
  sheet.classe.abilities.find((ability) => ability.name === name);

describe('campos do usuário em habilidades de classe', () => {
  test('sobrevivem ao level-up manual', () => {
    const sheet = makeSheetWithUserFields();
    const abilityName = sheet.classe.abilities[0].name;

    const result = applyManualLevelUp(sheet, {
      level: 4,
      selectedClassName: 'Druida',
      powerChoice: 'class',
    });

    const ability = findAbility(result, abilityName);
    expect(ability).toBeDefined();
    expect(ability?.customName).toBe('Empatia Selvagem (Mestre)');
    expect(ability?.customDescription).toBe(
      'Peguei no nível 1, versão combinada na mesa.'
    );
    expect(ability?.rolls).toHaveLength(1);
  });

  test('sobrevivem ao recálculo da ficha', () => {
    const sheet = makeSheetWithUserFields();
    const abilityName = sheet.classe.abilities[0].name;

    const result = recalculateSheet(sheet);

    const ability = findAbility(result, abilityName);
    expect(ability).toBeDefined();
    expect(ability?.customName).toBe('Empatia Selvagem (Mestre)');
    expect(ability?.customDescription).toBe(
      'Peguei no nível 1, versão combinada na mesa.'
    );
    expect(ability?.rolls).toHaveLength(1);
  });

  test('sobrevivem ao level-up seguido de recálculo (ordem real da UI)', () => {
    const sheet = makeSheetWithUserFields();
    const abilityName = sheet.classe.abilities[0].name;

    const leveled = applyManualLevelUp(sheet, {
      level: 4,
      selectedClassName: 'Druida',
      powerChoice: 'class',
    });
    const result = recalculateSheet(leveled);

    const ability = findAbility(result, abilityName);
    expect(ability?.customName).toBe('Empatia Selvagem (Mestre)');
    expect(ability?.rolls).toHaveLength(1);
  });
});
