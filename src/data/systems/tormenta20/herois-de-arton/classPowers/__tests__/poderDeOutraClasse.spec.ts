import _ from 'lodash';
import { describe, expect, it } from 'vitest';
import PALADINO_POWERS from '../paladino';
import CAVALEIRO_POWERS from '../cavaleiro';
import PALADINO from '../../../classes/paladino';
import CAVALEIRO from '../../../classes/cavaleiro';
import { createMockCharacterSheet } from '../../../../../../__mocks__/characterSheet';
import { applyPower } from '../../../../../../functions/general';
import {
  getFilteredAvailableOptions,
  getPowerSelectionRequirements,
} from '../../../../../../functions/powers/manualPowerSelection';
import CharacterSheet from '../../../../../../interfaces/CharacterSheet';
import {
  ClassDescription,
  ClassPower,
} from '../../../../../../interfaces/Class';
import { GeneralPower } from '../../../../../../interfaces/Poderes';
import { SupplementId } from '../../../../../../types/supplement.types';

/**
 * "Paladino do Reino" (paladino) e "Cavaleiro Sagrado" (cavaleiro), Heróis de
 * Arton p. 77: cada um concede um poder da OUTRA classe. Eram texto inerte —
 * sem `sheetActions`, o assistente não desenhava passo de escolha e o poder
 * não entregava nada (reporte de usuário, out/2026).
 */

const SUPPLEMENTS = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_HEROIS_ARTON,
];

const byName = (powers: ClassPower[], name: string): ClassPower => {
  const found = powers.find((power) => power.name === name);
  if (!found) throw new Error(`Poder ausente: ${name}`);
  return found;
};

const mkSheet = (classe: ClassDescription, nivel: number): CharacterSheet => {
  const sheet = createMockCharacterSheet();
  sheet.nivel = nivel;
  sheet.classe = _.cloneDeep(classe);
  sheet.sheetBonuses = [];
  sheet.sheetActionHistory = [];
  sheet.generalPowers = [];
  sheet.classPowers = [];
  sheet.supplements = SUPPLEMENTS;
  return sheet;
};

describe.each([
  {
    powerName: 'Paladino do Reino',
    power: byName(PALADINO_POWERS, 'Paladino do Reino'),
    classe: PALADINO,
    foreignClass: 'Cavaleiro',
  },
  {
    powerName: 'Cavaleiro Sagrado',
    power: byName(CAVALEIRO_POWERS, 'Cavaleiro Sagrado'),
    classe: CAVALEIRO,
    foreignClass: 'Paladino',
  },
])('$powerName', ({ power, classe, foreignClass }) => {
  it(`pede a escolha de um poder de ${foreignClass}`, () => {
    const requirements = getPowerSelectionRequirements(power);
    const classPowerStep = requirements?.requirements.find(
      (requirement) => requirement.type === 'getClassPower'
    );

    expect(classPowerStep?.metadata?.fromClasses).toEqual([foreignClass]);
  });

  it(`oferece só poderes de ${foreignClass}`, () => {
    const sheet = mkSheet(classe, 3);
    const requirement = getPowerSelectionRequirements(power)?.requirements.find(
      (entry) => entry.type === 'getClassPower'
    );
    if (!requirement) throw new Error('Sem passo de escolha');

    const options = getFilteredAvailableOptions(
      requirement,
      sheet,
      SUPPLEMENTS
    ) as ClassPower[];

    expect(options.length).toBeGreaterThan(0);
    expect(options.every((option) => option.className === foreignClass)).toBe(
      true
    );
  });

  it('concede o poder escolhido', () => {
    const sheet = mkSheet(classe, 3);
    const requirement = getPowerSelectionRequirements(power)?.requirements.find(
      (entry) => entry.type === 'getClassPower'
    );
    if (!requirement) throw new Error('Sem passo de escolha');
    const [escolhido] = getFilteredAvailableOptions(
      requirement,
      sheet,
      SUPPLEMENTS
    ) as ClassPower[];

    const [updated] = applyPower(sheet, power, {
      powers: [escolhido as unknown as GeneralPower],
    });

    expect((updated.classPowers ?? []).map((p) => p.name)).toContain(
      escolhido.name
    );
  });
});
