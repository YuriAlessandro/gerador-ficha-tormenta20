import CharacterSheet, {
  SheetAction,
  Step,
} from '../../interfaces/CharacterSheet';
import { ClassDescription } from '../../interfaces/Class';
import { ManualPowerSelections } from '../../interfaces/PowerSelections';
import { Spell, SpellSchool } from '../../interfaces/Spells';
import { SCHOOL_LABELS } from '../../components/SpellPicker/schoolLabels';
import { findClassDescription } from '../multiclass';
import { getClassFamilyName } from '../classFamily';
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

  const mainConfig = getSchoolChoiceConfig(sheet.classe, sheet);
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
      const config = classDesc ? getSchoolChoiceConfig(classDesc, sheet) : null;
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

/** "Abjuração" → "Abjur". `undefined` para rótulo desconhecido. */
export function spellSchoolFromLabel(label: string): SpellSchool | undefined {
  return (Object.keys(SCHOOL_LABELS) as SpellSchool[]).find(
    (school) => SCHOOL_LABELS[school] === label
  );
}

/**
 * Classe da ficha (principal ou multiclasse) da família `family` que escolhe
 * escolas — ex.: o Druida que recebe a escola de Xamã Místico.
 */
export function findSchoolTargetByFamily(
  sheet: CharacterSheet,
  family: string
): EditableSchoolTarget | undefined {
  return getEditableSchoolTargets(sheet).find((target) => {
    if (target.isMainClass) return getClassFamilyName(sheet.classe) === family;
    const serialized = sheet.multiclassSpellPaths?.[target.className];
    const classDesc = serialized
      ? findClassDescription(serialized.className, serialized.classSubname)
      : undefined;
    return !!classDesc && getClassFamilyName(classDesc) === family;
  });
}

/**
 * Acrescenta uma escola à classe da família `family` (sem duplicar). Devolve
 * as atualizações da ficha, ou `{}` quando não há classe ou ela já tem a
 * escola. Mesmo caminho de gravação do editor de escolas.
 */
export function buildAppendSpellSchoolUpdates(
  sheet: CharacterSheet,
  family: string,
  school: SpellSchool
): Partial<CharacterSheet> {
  const target = findSchoolTargetByFamily(sheet, family);
  if (!target || target.schools.includes(school)) return {};
  const updates = buildSpellSchoolUpdates(sheet, {
    [target.className]: [...target.schools, school],
  });
  // O passo de "Edição Manual" do editor não se aplica — o poder registra o
  // próprio passo.
  delete updates.steps;
  return updates;
}

/**
 * Escolas que um poder ainda não aplicado vai acrescentar à classe `classe`
 * (escolha de `appendChosenSpellSchoolTo` já feita no assistente). O passo de
 * magias do level-up vem depois do de efeitos do poder, então as magias da
 * escola nova já entram no pool do mesmo nível.
 */
export function getPendingAppendedSchools(
  power: { name: string; sheetActions?: SheetAction[] } | undefined,
  selections: ManualPowerSelections | undefined,
  classe: Pick<ClassDescription, 'name' | 'isVariant' | 'baseClassName'>
): SpellSchool[] {
  if (!power?.sheetActions) return [];
  const appendsHere = power.sheetActions.some(
    ({ action }) =>
      action.type === 'chooseFromOptions' &&
      action.appendChosenSpellSchoolTo === getClassFamilyName(classe)
  );
  if (!appendsHere) return [];
  return (selections?.[power.name]?.chosenOption ?? [])
    .map((label) => spellSchoolFromLabel(label))
    .filter((school): school is SpellSchool => !!school);
}
