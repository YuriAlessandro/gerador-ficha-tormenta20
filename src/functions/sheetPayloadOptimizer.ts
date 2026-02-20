import CharacterSheet from '../interfaces/CharacterSheet';
import { ClassDescription } from '../interfaces/Class';
import Race from '../interfaces/Race';
import { dataRegistry } from '../data/registry';
import { SupplementId } from '../types/supplement.types';

/**
 * Marker field to indicate the sheet has been stripped for storage.
 * Used by rehydrateSheet to detect if reconstruction is needed.
 */
const STRIPPED_MARKER = '__stripped__';

/**
 * Strips redundant/reconstructable data from a CharacterSheet before sending to the backend.
 *
 * SAFE to strip (purely static catalog data, never read at runtime):
 * - classe.powers: Full catalog of ALL available class powers (~15KB).
 *   The character's CHOSEN powers are in the separate `classPowers` field.
 * - classe.periciasbasicas, periciasrestantes, proficiencias: Static definitions.
 * - classe.probDevoto, faithProbability, attrPriority: Generation metadata.
 * - devoto.divindade.poderes: Full catalog of ALL deity powers (~62KB).
 *   The character's CHOSEN deity powers are in `devoto.poderes`.
 *   recalculateSheet only reads `devoto.poderes`, not the catalog.
 * - steps: UI walkthrough data.
 * - sheetActionHistory: Generation audit trail.
 *
 * NOT SAFE to strip (used by recalculateSheet and Result display):
 * - classe.abilities: Read by recalculateSheet Step 5 (applyClassAbilities) and Result UI.
 *   Contains sheetBonuses/sheetActions that are pushed to sheet.sheetBonuses during recalculation.
 * - raca.abilities: Read by recalculateSheet Step 4 (applyRaceAbilities) and Result UI.
 *   Contains sheetBonuses (e.g., Anão +PV, Osteon RD) and sheetActions (e.g., Humano Versátil).
 * - sheetBonuses: The computed total of all bonuses. Cleared and rebuilt by recalculateSheet.
 * - classPowers, generalPowers, spells, bag, origin: All essential gameplay data.
 */
export function stripSheetForStorage(
  sheet: CharacterSheet
): Record<string, unknown> {
  const stripped: Record<string, unknown> = { ...sheet };

  // Mark as stripped for rehydration detection
  stripped[STRIPPED_MARKER] = true;

  // Strip class data: remove the powers CATALOG (all available powers for this class).
  // Keep abilities (needed by recalculateSheet + Result display) and numeric fields.
  if (sheet.classe) {
    const strippedClasse: Record<string, unknown> = {
      name: sheet.classe.name,
      subname: sheet.classe.subname,
      isVariant: sheet.classe.isVariant,
      baseClassName: sheet.classe.baseClassName,
      pv: sheet.classe.pv,
      addpv: sheet.classe.addpv,
      pm: sheet.classe.pm,
      addpm: sheet.classe.addpm,
      qtdPoderesConcedidos: sheet.classe.qtdPoderesConcedidos,
      // PRESERVE abilities (used by recalculateSheet + UI display)
      abilities: sheet.classe.abilities,
      originalAbilities: sheet.classe.originalAbilities,
      // STRIP powers (full catalog, ~50-100KB - character's chosen powers are in classPowers)
      powers: [],
      // STRIP generation metadata (not needed post-creation)
      periciasbasicas: [],
      periciasrestantes: { qtd: 0, list: [] },
      proficiencias: [],
    };

    // Keep spellPath data (without function references which are lost on serialization anyway)
    if (sheet.classe.spellPath) {
      strippedClasse.spellPath = {
        initialSpells: sheet.classe.spellPath.initialSpells,
        spellType: sheet.classe.spellPath.spellType,
        schools: sheet.classe.spellPath.schools,
        excludeSchools: sheet.classe.spellPath.excludeSchools,
        includeDivineSchools: sheet.classe.spellPath.includeDivineSchools,
        includeArcaneSchools: sheet.classe.spellPath.includeArcaneSchools,
        crossTraditionLimit: sheet.classe.spellPath.crossTraditionLimit,
        keyAttribute: sheet.classe.spellPath.keyAttribute,
      };
    }

    stripped.classe = strippedClasse;
  }

  // Strip race data: remove only generation metadata.
  // PRESERVE abilities (used by recalculateSheet + UI display, contain sheetBonuses).
  if (sheet.raca) {
    stripped.raca = {
      name: sheet.raca.name,
      attributes: sheet.raca.attributes,
      size: sheet.raca.size,
      // PRESERVE abilities (critical for recalculateSheet + display)
      abilities: sheet.raca.abilities,
      // Preserve variant-specific fields
      heritage: sheet.raca.heritage,
      chassis: sheet.raca.chassis,
      energySource: sheet.raca.energySource,
      sizeCategory: sheet.raca.sizeCategory,
      nature: sheet.raca.nature,
      presentPowers: sheet.raca.presentPowers,
      tabuSkill: sheet.raca.tabuSkill,
      // STRIP generation metadata (not needed post-creation)
      // faithProbability, attributeVariants, setup, getSize, getDisplacement, getAttributes
      // are omitted (functions are lost on serialization anyway)
    };
  }

  // Strip devoto.divindade.poderes (deity powers CATALOG, ~62KB).
  // Keep devoto.divindade.name (needed by UI) and devoto.poderes (character's chosen deity powers).
  // recalculateSheet only reads devoto.poderes (line 525), never divindade.poderes.
  if (
    sheet.devoto?.divindade &&
    sheet.devoto.divindade.poderes &&
    sheet.devoto.divindade.poderes.length > 0
  ) {
    stripped.devoto = {
      poderes: sheet.devoto.poderes,
      divindade: {
        name: sheet.devoto.divindade.name,
        poderes: [],
      },
    };
  }

  // Strip steps (purely UI walkthrough data, not needed for display or editing)
  stripped.steps = [];

  // Strip sheetActionHistory (generation audit trail, not needed post-creation)
  stripped.sheetActionHistory = [];

  return stripped;
}

/**
 * Computes a delta between a baseline stripped sheet and an updated stripped sheet.
 * Compares top-level keys using JSON.stringify for deep equality.
 * Returns only the changed/added keys, or null if nothing changed.
 * Deleted keys are represented as explicit null values.
 */
export function computeSheetDelta(
  baseline: Record<string, unknown>,
  updated: Record<string, unknown>
): Record<string, unknown> | null {
  const delta: Record<string, unknown> = {};
  let hasChanges = false;

  // Check for changed or added keys
  Object.keys(updated).forEach((key) => {
    if (key === STRIPPED_MARKER) return;
    if (JSON.stringify(baseline[key]) !== JSON.stringify(updated[key])) {
      delta[key] = updated[key];
      hasChanges = true;
    }
  });

  // Check for deleted keys (present in baseline but absent in updated)
  Object.keys(baseline).forEach((key) => {
    if (key === STRIPPED_MARKER) return;
    if (!(key in updated)) {
      delta[key] = null;
      hasChanges = true;
    }
  });

  return hasChanges ? delta : null;
}

/**
 * Rehydrates a stripped sheet by reconstructing catalog data from the DataRegistry.
 * If the sheet was not stripped (old format), returns it as-is for backward compatibility.
 *
 * Reconstructs:
 * - classe.powers: Full class powers catalog (needed for PowersEditDrawer to show available powers)
 * - classe.proficiencias, periciasbasicas, periciasrestantes: Static definitions
 * - spellPath functions: qtySpellsLearnAtLevel, spellCircleAvailableAtLevel
 * - Race functions: setup, getSize, getDisplacement, getAttributes (if present in registry)
 * - devoto.divindade.poderes: Full deity powers catalog (needed for DeityPowerEditDrawer)
 */
export function rehydrateSheet(
  sheetData: Record<string, unknown>,
  supplementIds: SupplementId[]
): CharacterSheet {
  const sheet = sheetData as unknown as CharacterSheet;

  // If not stripped, return as-is (backward compatibility with old sheets)
  if (!(STRIPPED_MARKER in sheetData)) {
    return sheet;
  }

  // Remove the stripped marker
  delete (sheet as unknown as Record<string, unknown>)[STRIPPED_MARKER];

  // Rehydrate class data (restore powers catalog + static definitions + spellPath functions)
  if (sheet.classe?.name) {
    const fullClass = dataRegistry.getClassByName(
      sheet.classe.name,
      supplementIds
    );
    if (fullClass) {
      sheet.classe = {
        // Start with stored data (has abilities, numeric fields, identity)
        ...sheet.classe,
        // Restore catalog data from registry
        powers: fullClass.powers,
        periciasbasicas: fullClass.periciasbasicas,
        periciasrestantes: fullClass.periciasrestantes,
        proficiencias: fullClass.proficiencias,
        probDevoto: fullClass.probDevoto,
        faithProbability: fullClass.faithProbability,
        attrPriority: fullClass.attrPriority,
        setup: fullClass.setup,
        // Restore spellPath with functions from registry + data fields from stored
        spellPath: fullClass.spellPath
          ? {
              ...fullClass.spellPath,
              ...(sheet.classe.spellPath || {}),
              // Always use registry functions (stored ones are lost on serialization)
              qtySpellsLearnAtLevel: fullClass.spellPath.qtySpellsLearnAtLevel,
              spellCircleAvailableAtLevel:
                fullClass.spellPath.spellCircleAvailableAtLevel,
            }
          : undefined,
      } as ClassDescription;
    }
  }

  // Rehydrate race data (restore functions that were lost on serialization)
  if (sheet.raca?.name) {
    const fullRace = dataRegistry.getRaceByName(sheet.raca.name, supplementIds);
    if (fullRace) {
      sheet.raca = {
        // Start with stored data (has abilities, attributes, variant-specific fields)
        ...sheet.raca,
        // Restore functions from registry (lost on serialization)
        setup: fullRace.setup,
        getSize: fullRace.getSize,
        getDisplacement: fullRace.getDisplacement,
        getAttributes: fullRace.getAttributes,
        // Restore generation metadata from registry
        faithProbability: fullRace.faithProbability,
        attributeVariants: fullRace.attributeVariants,
      } as Race;
    }
  }

  // Rehydrate devoto.divindade (restore deity powers catalog from registry)
  if (sheet.devoto?.divindade?.name) {
    const fullDeity = dataRegistry.getDeityByName(
      sheet.devoto.divindade.name,
      supplementIds
    );
    if (fullDeity) {
      sheet.devoto = {
        ...sheet.devoto,
        divindade: fullDeity,
      };
    }
  }

  return sheet;
}
