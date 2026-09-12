import { cloneDeep } from 'lodash';
import { applyManualLevelUp } from '../general';
import { recalculateSheet } from '../recalculateSheet';
import { findClassDescription } from '../multiclass';
import { isPowerAvailable } from '../powers';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import { LevelUpSelections } from '../../interfaces/WizardSelections';
import COMBAT_POWERS from '../../data/systems/tormenta20/powers/combatPowers';
import Skill from '../../interfaces/Skills';

/**
 * O assistente de nível passou a deixar escolher poder fora dos pré-requisitos
 * (opt-in). Isso só funciona porque nada revalida requisito depois do apply —
 * este teste é o guard: se algum dia `applyPower` ou o recálculo começarem a
 * podar por pré-requisito, o poder escolhido de propósito sumiria da ficha em
 * silêncio.
 */
describe('poder escolhido fora dos pré-requisitos sobrevive ao pipeline', () => {
  const ESTILO_DE_ARREMESSO = COMBAT_POWERS.ESTILO_DE_ARREMESO;

  const guerreiroSemPontaria = () => {
    const sheet = createMockCharacterSheet();
    sheet.classe = cloneDeep(findClassDescription('Guerreiro')!);
    sheet.nivel = 1;
    sheet.classLevels = [{ level: 1, className: 'Guerreiro' }];
    // Pontaria fora da lista de treinadas: o requisito do poder reprova.
    sheet.skills = [Skill.ATLETISMO, Skill.INTIMIDACAO];
    return sheet;
  };

  test('o requisito realmente reprova a ficha de partida', () => {
    expect(isPowerAvailable(guerreiroSemPontaria(), ESTILO_DE_ARREMESSO)).toBe(
      false
    );
  });

  test('applyManualLevelUp aceita o poder, aplica o bônus e registra no histórico', () => {
    const selections: LevelUpSelections = {
      level: 2,
      selectedClassName: 'Guerreiro',
      powerChoice: 'general',
      selectedGeneralPower: ESTILO_DE_ARREMESSO,
    };

    const result = applyManualLevelUp(guerreiroSemPontaria(), selections);

    expect(result.generalPowers.map((power) => power.name)).toContain(
      'Estilo de Arremesso'
    );
    expect(
      result.sheetBonuses.some(
        (bonus) =>
          bonus.source.type === 'power' &&
          bonus.source.name === 'Estilo de Arremesso' &&
          bonus.target.type === 'WeaponDamage'
      )
    ).toBe(true);
    expect(
      (result.sheetActionHistory || []).some((entry) =>
        entry.changes.some(
          (change) =>
            change.type === 'PowerAdded' &&
            change.powerName === 'Estilo de Arremesso'
        )
      )
    ).toBe(true);

    // E o recálculo (abrir/editar a ficha) não poda o poder nem o bônus.
    const recalculated = recalculateSheet(result);
    expect(recalculated.generalPowers.map((power) => power.name)).toContain(
      'Estilo de Arremesso'
    );
    expect(
      recalculated.sheetBonuses.some(
        (bonus) =>
          bonus.source.type === 'power' &&
          bonus.source.name === 'Estilo de Arremesso'
      )
    ).toBe(true);
  });
});
