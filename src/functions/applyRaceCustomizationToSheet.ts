import _ from 'lodash';

import CharacterSheet from '@/interfaces/CharacterSheet';
import Race from '@/interfaces/Race';
import Skill from '@/interfaces/Skills';
import { Atributo } from '@/data/systems/tormenta20/atributos';

import {
  recalculateSheet,
  reverseSheetActionsForPower,
} from './recalculateSheet';

export interface RaceCustomizationMetadata {
  raceSizeCategory?: string;
  raceChassis?: string;
  raceEnergySource?: string;
  raceHeritage?: string;
  raceAttributeChoices?: Atributo[];
  duendeNature?: string;
  duendePresentes?: string[];
  duendeTabuSkill?: Skill;
}

/**
 * Replaces the sheet's race with `newRace` and reconciles all side effects of
 * the previous race's abilities.
 *
 * Used by post-random customization handlers (Duende, Moreau, Golem Desperto)
 * to swap the auto-generated race for a user-customized one without leaving
 * residual bonuses, senses, skills, spells, or history entries from the old
 * abilities.
 *
 * Algorithm:
 *   1. Diff abilities by name to find which were removed.
 *   2. Revert the removed abilities' effects (history + arrays mutated outside
 *      `sheetBonuses`) via `reverseSheetActionsForPower`.
 *   3. Drop the aggregate `{type:'race'}` history entry — it will be re-pushed
 *      by `applyRaceAbilities` for the new race.
 *   4. Replace the race and propagate metadata (sizeCategory, chassis, etc.).
 *   5. Run `recalculateSheet` — Step 1 wipes `sheetBonuses` and Step 4 reapplies
 *      everything from scratch using the new race's abilities.
 *
 * Abilities that exist in both old and new races keep their history entries,
 * so `isActionAlreadyApplied` (in `applyPower`) skips re-execution and their
 * coupled state (sentidos, skills, etc.) remains intact.
 */
export function applyRaceCustomizationToSheet(
  sheet: CharacterSheet,
  newRace: Race,
  metadata?: RaceCustomizationMetadata
): CharacterSheet {
  const working = _.cloneDeep(sheet);

  const oldNames = new Set((working.raca.abilities || []).map((a) => a.name));
  const newNames = new Set((newRace.abilities || []).map((a) => a.name));
  const removed = Array.from(oldNames).filter((n) => !newNames.has(n));

  removed.forEach((name) => reverseSheetActionsForPower(working, name));

  working.sheetActionHistory = working.sheetActionHistory.filter(
    (e) =>
      !(e.source.type === 'race' && e.source.raceName === working.raca.name)
  );

  working.raca = newRace;

  if (newRace.getDisplacement) {
    working.displacement = newRace.getDisplacement(newRace);
  }
  if (newRace.size) {
    working.size = newRace.size;
  }
  if (metadata) {
    Object.assign(working, metadata);
  }

  return recalculateSheet(working);
}
