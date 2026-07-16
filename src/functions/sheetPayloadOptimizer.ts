import CharacterSheet from '../interfaces/CharacterSheet';
import { ClassDescription } from '../interfaces/Class';
import Race from '../interfaces/Race';
import { dataRegistry } from '../data/registry';
import { SupplementId } from '../types/supplement.types';
import { stampUsedSupplements } from './contentSources';

/**
 * Marker field to indicate the sheet has been stripped for storage.
 * Used by rehydrateSheet to detect if reconstruction is needed.
 */
const STRIPPED_MARKER = '__stripped__';

/**
 * Chaves de sheetData que nenhum fluxo legítimo jamais remove de uma ficha.
 * Após qualquer carga o normalizeSheet garante que elas existem, então um
 * delta com `null` nelas só pode significar corrupção em memória — e o
 * backend faria `$unset`, apagando o campo permanentemente do documento
 * (incidente do wipe, jul/2026).
 *
 * Espelha NEVER_UNSET_SHEET_KEYS em `backend/src/utils/sheetIntegrity.ts` —
 * mantenha as duas listas em sincronia.
 *
 * `completeSkills` fica FORA da lista: `undefined` é o sinal legítimo de
 * "reconstruir no recálculo" (é totalmente derivável de `skills`).
 */
export const NEVER_UNSET_SHEET_KEYS: readonly string[] = [
  'atributos',
  'skills',
  'bag',
  'classe',
  'raca',
  'nivel',
  'spells',
  'generalPowers',
  'sheetActionHistory',
  'steps',
];

/**
 * Erro lançado pelos serviços de save quando a escrita apagaria dados
 * críticos da ficha (ver detectCriticalWipe). A UI deve tratar mostrando
 * um aviso pedindo reload — os dados na nuvem ficam preservados.
 */
export class SheetIntegrityError extends Error {
  constructor(public readonly wipedFields: string[]) {
    super(
      `Salvamento bloqueado: a atualização apagaria dados críticos da ficha (${wipedFields.join(
        ', '
      )}).`
    );
    this.name = 'SheetIntegrityError';
  }
}

/**
 * Detecta um SheetIntegrityError mesmo depois de serializado pelo Redux
 * Toolkit (`unwrap()` re-lança um objeto plain com `name`/`message`, não a
 * instância original).
 */
export function isSheetIntegrityError(err: unknown): boolean {
  if (err instanceof SheetIntegrityError) return true;
  return (
    typeof err === 'object' &&
    err !== null &&
    (err as { name?: string }).name === 'SheetIntegrityError'
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Existe ao menos um atributo com value numérico diferente de zero. */
function attributesHaveRealValues(sheetData: Record<string, unknown>): boolean {
  const { atributos } = sheetData;
  if (!isRecord(atributos)) return false;
  return Object.values(atributos).some(
    (attr) =>
      isRecord(attr) && typeof attr.value === 'number' && attr.value !== 0
  );
}

function skillsAreNonEmpty(sheetData: Record<string, unknown>): boolean {
  return Array.isArray(sheetData.skills) && sheetData.skills.length > 0;
}

/** Bag com ao menos um item em algum grupo de equipments. */
function bagHasItems(sheetData: Record<string, unknown>): boolean {
  const { bag } = sheetData;
  if (!isRecord(bag)) return false;
  const { equipments } = bag;
  if (!isRecord(equipments)) return false;
  return Object.values(equipments).some(
    (group) => Array.isArray(group) && group.length > 0
  );
}

/**
 * Compara o baseline (último estado conhecido na nuvem) com a ficha stripped
 * que está prestes a ser salva e retorna os grupos críticos que o save
 * apagaria: 'atributos' (tinha value != 0 → todos zero/ausente), 'skills'
 * (não-vazio → vazio) e 'bag' (com itens → vazio).
 *
 * Sem baseline (fallback de PUT completo), usa a assinatura absoluta do bug
 * do wipe: ficha não-ameaça com todos os atributos em 0 E skills vazio nunca
 * é legítima — é o output do normalizeSheet sobre um documento corrompido.
 *
 * Política do chamador: >= 2 grupos → bloquear o save (SheetIntegrityError);
 * 1 grupo → permitir (vender tudo / destreinar tudo são legítimos).
 */
export function detectCriticalWipe(
  baseline: Record<string, unknown> | undefined,
  updated: Record<string, unknown>
): string[] {
  if (updated.isThreat === true) return [];

  if (!baseline) {
    // Assinatura absoluta do wipe (Path A): sem referência de baseline, só
    // bloqueia o que nunca é uma ficha válida.
    if (!attributesHaveRealValues(updated) && !skillsAreNonEmpty(updated)) {
      return ['atributos', 'skills'];
    }
    return [];
  }

  if (baseline.isThreat === true) return [];

  const wiped: string[] = [];
  if (attributesHaveRealValues(baseline) && !attributesHaveRealValues(updated))
    wiped.push('atributos');
  if (skillsAreNonEmpty(baseline) && !skillsAreNonEmpty(updated))
    wiped.push('skills');
  if (bagHasItems(baseline) && !bagHasItems(updated)) wiped.push('bag');
  return wiped;
}

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
 * - sheetActionHistory: CANNOT be stripped - recalculateSheet depends on it
 *   via isActionAlreadyApplied() to skip already-applied power actions.
 *
 * NOT SAFE to strip (used by recalculateSheet and Result display):
 * - classe.abilities: Read by recalculateSheet Step 5 (applyClassAbilities) and Result UI.
 *   Contains sheetBonuses/sheetActions that are pushed to sheet.sheetBonuses during recalculation.
 * - raca.abilities: Read by recalculateSheet Step 4 (applyRaceAbilities) and Result UI.
 *   Contains sheetBonuses (e.g., Anão +PV, Osteon RD) and sheetActions (e.g., Humano Versátil).
 * - sheetBonuses: The computed total of all bonuses. Cleared and rebuilt by recalculateSheet.
 * - classPowers, generalPowers, spells, bag, origin: All essential gameplay data.
 * - steps: Feeds the "Passo-a-passo da Criação" UI section. Captures wizard
 *   decisions (chosen base attributes, market purchases, skill picks) that
 *   aren't derivable from any other field — once dropped, they're lost forever.
 */
export function stripSheetForStorage(
  sheet: CharacterSheet
): Record<string, unknown> {
  // Garante que `usedSupplements` reflita os homebrews realmente usados ANTES
  // de gravar na nuvem — é o que sustenta o bloqueio de desativação de um
  // homebrew em uso (checkSupplementUsage consulta `sheetData.usedSupplements`).
  stampUsedSupplements(sheet);

  const stripped: Record<string, unknown> = { ...sheet };

  // Drop top-level keys whose value is `undefined`. The spread above preserves
  // them, but `JSON.stringify` later drops them on the wire — and the delta
  // would silently lose "user cleared this field" intent. By omitting the key
  // here, computeSheetDelta's "missing in updated" branch turns it into an
  // explicit `null`, which the backend interprets as `$unset`.
  Object.keys(stripped).forEach((key) => {
    if (stripped[key] === undefined) delete stripped[key];
  });

  // Mark as stripped for rehydration detection
  stripped[STRIPPED_MARKER] = true;

  // Defensivo: nunca persistir o ledger deprecated `conditionAttributePenalties`.
  // O efeito de condições é puramente temporário e re-derivado a partir de
  // `activeConditions` no `recalculateSheet`. Mantido aqui como salvaguarda
  // contra clientes/payloads antigos durante o rollout do fix.
  delete stripped.conditionAttributePenalties;

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

  // NOTE: sheetActionHistory is NOT stripped - recalculateSheet depends on it
  // via isActionAlreadyApplied() to know which power actions to skip.

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
      // Nunca emitir $unset de chave crítica: uma ficha válida sempre as tem
      // (normalizeSheet), então a ausência aqui é corrupção em memória — e o
      // $unset apagaria o campo permanentemente do documento na nuvem.
      if (NEVER_UNSET_SHEET_KEYS.includes(key)) {
        // eslint-disable-next-line no-console
        console.error(`[sheet-integrity] blocked $unset of "${key}"`);
        return;
      }
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
/**
 * Refresh `sheetActions` and `sheetBonuses` on every chosen power from the
 * current data catalog. Existing sheets serialized before a power gained new
 * behavior would otherwise stay frozen on the old definition. We preserve
 * per-instance customizations (rolls, dynamicText) by spreading stored on top.
 */
function refreshChosenPowersFromCatalog(
  sheet: CharacterSheet,
  supplementIds: SupplementId[]
) {
  const allGeneralPowers =
    dataRegistry.getAllPowersBySupplements(supplementIds);
  if (sheet.generalPowers && allGeneralPowers.length > 0) {
    sheet.generalPowers = sheet.generalPowers.map((stored) => {
      const fresh = allGeneralPowers.find((p) => p.name === stored.name);
      if (!fresh) return stored;
      return {
        ...fresh,
        ...stored,
        sheetActions: fresh.sheetActions,
        sheetBonuses: fresh.sheetBonuses,
      };
    });
  }
  if (sheet.classPowers && sheet.classe?.name) {
    const classDef = dataRegistry.getClassByName(
      sheet.classe.name,
      supplementIds
    );
    const classCatalog = classDef?.powers || sheet.classe.powers;
    if (classCatalog && classCatalog.length > 0) {
      sheet.classPowers = sheet.classPowers.map((stored) => {
        const fresh = classCatalog.find((p) => p.name === stored.name);
        if (!fresh) return stored;
        return {
          ...fresh,
          ...stored,
          sheetActions: fresh.sheetActions,
          sheetBonuses: fresh.sheetBonuses,
        };
      });
    }
  }
}

export function rehydrateSheet(
  sheetData: Record<string, unknown>,
  supplementIds: SupplementId[]
): CharacterSheet {
  const sheet = sheetData as unknown as CharacterSheet;

  // If not stripped, we still refresh chosen powers from the catalog so that
  // legacy sheets pick up new sheetActions/sheetBonuses added to a power's
  // definition (e.g., weapon-specialization on Foco em Arma).
  if (!(STRIPPED_MARKER in sheetData)) {
    refreshChosenPowersFromCatalog(sheet, supplementIds);
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
        // Fichas antigas podem ter sido gravadas sem `abilities`; sem esse
        // fallback, restoreSpellPath e recalculateSheet quebram ao iterar/push
        abilities: sheet.classe.abilities ?? fullClass.abilities,
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
          : sheet.classe.spellPath,
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

  refreshChosenPowersFromCatalog(sheet, supplementIds);

  return sheet;
}
