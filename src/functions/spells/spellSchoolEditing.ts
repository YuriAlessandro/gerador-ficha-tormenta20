import CharacterSheet, { Step } from '../../interfaces/CharacterSheet';
import { Spell, SpellSchool } from '../../interfaces/Spells';
import { SCHOOL_LABELS } from '../../components/SpellPicker/schoolLabels';
import { findClassDescription } from '../multiclass';
import { getSchoolChoiceConfig, SchoolChoiceConfig } from '../spellPathUtils';

/**
 * Uma classe da ficha cujas escolas de magia o jogador escolheu (Bardo,
 * Druida, variantes e homebrews com `schoolChoice`) e pode trocar depois.
 */
export interface EditableSchoolTarget {
  /** Nome da classe — também é a chave em `multiclassSpellPaths`. */
  className: string;
  isMainClass: boolean;
  config: SchoolChoiceConfig;
  schools: SpellSchool[];
}

/**
 * Classes da ficha com escolas editáveis: a principal (em
 * `classe.spellPath.schools`) e as multiclasses conjuradoras (em
 * `multiclassSpellPaths[classe].schools`).
 */
export function getEditableSchoolTargets(
  sheet: CharacterSheet
): EditableSchoolTarget[] {
  const targets: EditableSchoolTarget[] = [];

  const mainConfig = getSchoolChoiceConfig(sheet.classe);
  if (mainConfig && sheet.classe.spellPath) {
    targets.push({
      className: sheet.classe.name,
      isMainClass: true,
      config: mainConfig,
      schools: sheet.classe.spellPath.schools ?? [],
    });
  }

  Object.entries(sheet.multiclassSpellPaths ?? {}).forEach(
    ([className, serialized]) => {
      if (className === sheet.classe.name) return;
      const classDesc = findClassDescription(
        serialized.className,
        serialized.classSubname
      );
      const config = classDesc ? getSchoolChoiceConfig(classDesc) : null;
      if (!config) return;
      targets.push({
        className,
        isMainClass: false,
        config,
        schools: serialized.schools ?? [],
      });
    }
  );

  return targets;
}

const sameSchools = (a: SpellSchool[], b: SpellSchool[]): boolean =>
  a.length === b.length && a.every((school) => b.includes(school));

/**
 * Monta as atualizações da ficha para as novas escolas, por nome de classe.
 * Classes sem mudança são ignoradas; sem nenhuma mudança, devolve `{}`.
 *
 * Na multiclasse, grava também em `multiclassSetups` para que as escolhas do
 * 1º nível da classe continuem coerentes com o `spellPath` serializado.
 */
export function buildSpellSchoolUpdates(
  sheet: CharacterSheet,
  newSchoolsByClass: Record<string, SpellSchool[]>
): Partial<CharacterSheet> {
  const changed = getEditableSchoolTargets(sheet).filter((target) => {
    const next = newSchoolsByClass[target.className];
    return next !== undefined && !sameSchools(target.schools, next);
  });
  if (changed.length === 0) return {};

  const updates: Partial<CharacterSheet> = {};
  const historyEntries: Step['value'] = [];

  changed.forEach(({ className, isMainClass }) => {
    const schools = newSchoolsByClass[className];
    historyEntries.push({ name: className, value: schools.join(', ') });

    if (isMainClass && sheet.classe.spellPath) {
      // Spread raso preserva as funções do spellPath (qtySpellsLearnAtLevel etc.)
      updates.classe = {
        ...sheet.classe,
        spellPath: { ...sheet.classe.spellPath, schools },
      };
      return;
    }

    const serialized = sheet.multiclassSpellPaths?.[className];
    if (serialized) {
      updates.multiclassSpellPaths = {
        ...(updates.multiclassSpellPaths ?? sheet.multiclassSpellPaths),
        [className]: { ...serialized, schools },
      };
    }
    const setup = sheet.multiclassSetups?.[className];
    if (setup) {
      updates.multiclassSetups = {
        ...(updates.multiclassSetups ?? sheet.multiclassSetups),
        [className]: { ...setup, spellSchools: schools },
      };
    }
  });

  updates.steps = [
    ...sheet.steps,
    {
      label: 'Edição Manual - Escolas de Magia',
      type: 'Magias',
      value: historyEntries,
    },
  ];

  return updates;
}

/**
 * Escolas das quais a ficha pode aprender magias: a união das escolas de
 * todas as classes conjuradoras (principal e multiclasses), usando o
 * rascunho em edição quando houver. `null` = sem restrição — ficha sem classe
 * conjuradora ou com alguma que aprende de todas as escolas (ex.: Bardo com
 * Arcanista não restringe nada, porque o Arcanista aceita qualquer escola).
 */
export function getAllowedSpellSchools(
  sheet: CharacterSheet,
  draft: Record<string, SpellSchool[]> = {}
): SpellSchool[] | null {
  // `undefined` = classe que aprende de todas as escolas. O rascunho vale
  // mesmo vazio (jogador desmarcou tudo); escolas gravadas vazias, não.
  const casterSchools: (SpellSchool[] | undefined)[] = [];
  const addCaster = (className: string, stored?: SpellSchool[]) =>
    casterSchools.push(
      draft[className] ?? (stored?.length ? stored : undefined)
    );

  if (sheet.classe.spellPath) {
    addCaster(sheet.classe.name, sheet.classe.spellPath.schools);
  }
  Object.entries(sheet.multiclassSpellPaths ?? {}).forEach(
    ([className, serialized]) => {
      if (className !== sheet.classe.name) {
        addCaster(className, serialized.schools);
      }
    }
  );

  if (casterSchools.length === 0) return null;
  if (casterSchools.some((schools) => schools === undefined)) return null;

  const allowed = new Set<SpellSchool>();
  casterSchools.forEach((schools) =>
    schools?.forEach((school) => allowed.add(school))
  );
  return Array.from(allowed);
}

/**
 * Magias conhecidas de escolas que foram removidas. Elas não saem da ficha
 * (podem ter vindo de outra fonte, e o jogador decide), mas vale avisar.
 */
export function getSpellsFromRemovedSchools(
  spells: Spell[],
  previousSchools: SpellSchool[],
  nextSchools: SpellSchool[]
): Spell[] {
  const removed = previousSchools.filter(
    (school) => !nextSchools.includes(school)
  );
  if (removed.length === 0) return [];
  return spells.filter((spell) => removed.includes(spell.school));
}

/** Escolas escolhidas por classe (só classes que escolhem e já escolheram). */
export function getChosenSpellSchoolsByClass(
  sheet: CharacterSheet
): Record<string, SpellSchool[]> {
  const byClass: Record<string, SpellSchool[]> = {};
  getEditableSchoolTargets(sheet).forEach(({ className, schools }) => {
    if (schools.length > 0) byClass[className] = schools;
  });
  return byClass;
}

/** "Escolas escolhidas: Abjuração, Encantamento e Necromancia." */
export function describeChosenSpellSchools(schools: SpellSchool[]): string {
  const labels = schools.map((school) => SCHOOL_LABELS[school] ?? school);
  const list =
    labels.length > 1
      ? `${labels.slice(0, -1).join(', ')} e ${labels[labels.length - 1]}`
      : labels[0];
  return `Escolas escolhidas: ${list}.`;
}
