/**
 * Motor de ficha SEM SORTEIO (Builds v2, bloco 1B).
 *
 * Monta a ficha como o assistente faz ao confirmar (`MainScreen`:
 * `handleWizardConfirm` + `handleLevelUpWizardConfirm`) — `generateEmptySheet`,
 * `applyManualLevelUp` por nível e o recálculo final — mas sem nenhum
 * `Math.random`. O que faltar vira lacuna:
 *
 * - `source: 'wizard'`: passo que o assistente não deixaria avançar
 *   (pré-detecção pelas regras de `wizardRules/`);
 * - `source: 'engine'`: sorteio que o motor faria, capturado pelo portão de
 *   `randomUtils` (rede de segurança). O motor segue com a primeira opção, e
 *   a lacuna diz qual valor provisório entrou (`picked`).
 *
 * A mesma escolha pode aparecer nas duas fontes; quem consome (simulador)
 * decide como mostrar.
 */
import CharacterSheet from '@/interfaces/CharacterSheet';
import SelectedOptions from '@/interfaces/SelectedOptions';
import {
  LevelUpSelections,
  WizardSelections,
} from '@/interfaces/WizardSelections';
import Bag from '@/interfaces/Bag';
import { getAgeExtraLevels } from '@/premium/functions/ages';
import {
  applyManualLevelUp,
  generateEmptySheet,
  RaceCustomization,
} from './general';
import { initializeClassLevels } from './multiclass';
import { recalculateSheet } from './recalculateSheet';
import { RandomGap, RandomGapKind, runWithoutRandomness } from './randomUtils';
import {
  buildCreationWizardContext,
  getCreationGaps,
} from './wizardRules/creationWizardRules';
import {
  buildLevelUpWizardContext,
  getLevelUpGaps,
  getLevelUpSteps,
} from './wizardRules/levelUpWizardRules';
import { WizardAccess, WizardStepGap } from './wizardRules/types';

const MAX_LEVEL = 20;

/** Passo usado quando um nível não tem entrada em `levelUpSelections`. */
export const MISSING_LEVEL_STEP = 'Escolhas do nível';

export type SheetGapSource = 'wizard' | 'engine';

export interface SheetGap {
  /** Nível da ficha: 1 = criação. */
  level: number;
  source: SheetGapSource;
  /** Passo do assistente ('wizard') ou rótulo do ponto de sorteio ('engine'). */
  step: string;
  kind?: RandomGapKind;
  /** Opções que existiam (só 'engine'). */
  options?: string[];
  /** Valor provisório usado no lugar do sorteio (só 'engine'). */
  picked?: string[];
  count?: number;
  /** Só 'engine': havia uma opção só; o resultado não dependia de escolha. */
  forced?: boolean;
}

export interface StrictSheetInput {
  selectedOptions: SelectedOptions;
  /** Seleções da criação, com `levelUpSelections` para os níveis 2+. */
  selections: WizardSelections;
  raceCustomization?: RaceCustomization;
  access: WizardAccess;
  /**
   * Nível final. Padrão: como o `MainScreen` (nível do formulário + níveis
   * extras de Idades Variadas, teto 20).
   */
  targetLevel?: number;
}

/** A ficha como ficou ao fim de um nível. */
export interface StrictLevelSheet {
  level: number;
  sheet: CharacterSheet;
}

export interface StrictSheetResult {
  /** A ficha montada, ou `null` se o motor lançou exceção. */
  sheet: CharacterSheet | null;
  /**
   * A ficha ao fim de cada nível montado (1 = criação), para avaliar
   * violações nível a nível. A do nível alvo é a mesma de `sheet` (com o
   * recálculo final); as anteriores são as que `applyManualLevelUp` devolveu.
   * Até onde chegou, se o motor lançou exceção.
   */
  levels: StrictLevelSheet[];
  gaps: SheetGap[];
  /** Mensagem da exceção, quando houve. */
  error?: string;
}

const fromWizard = (gap: WizardStepGap): SheetGap => ({
  level: gap.level,
  source: 'wizard',
  step: gap.step,
});

const fromEngine =
  (level: number, gaps: SheetGap[]) =>
  (gap: RandomGap): void => {
    gaps.push({
      level,
      source: 'engine',
      step: gap.label,
      kind: gap.kind,
      options: gap.options,
      picked: gap.picked,
      count: gap.count,
      ...(gap.forced ? { forced: true } : {}),
    });
  };

/** Roda sem sorteio, descartando as lacunas (o motor as registra depois). */
const withoutRandomness = <T>(fn: () => T): T =>
  runWithoutRandomness(fn, () => undefined);

/** Nível final padrão, igual ao do `MainScreen.handleWizardConfirm`. */
export function getDefaultTargetLevel(
  selectedOptions: SelectedOptions,
  selections: WizardSelections
): number {
  const ageExtraLevels = selections.variedAges
    ? getAgeExtraLevels(selections.ageBracket)
    : 0;
  return Math.min(MAX_LEVEL, (selectedOptions.nivel || 1) + ageExtraLevels);
}

/** Monta a ficha sem sorteio e devolve as lacunas encontradas. */
export function buildSheetWithoutRandomness(
  input: StrictSheetInput
): StrictSheetResult {
  const { selectedOptions, selections, raceCustomization, access } = input;
  const gaps: SheetGap[] = [];
  const levels: StrictLevelSheet[] = [];
  const targetLevel = Math.min(
    MAX_LEVEL,
    input.targetLevel ?? getDefaultTargetLevel(selectedOptions, selections)
  );

  try {
    // A pré-detecção também passa pelo portão: avaliar um passo pode chamar
    // código que sorteia (ex.: `origin.getItems()` sem os itens congelados).
    // Esses sorteios são descartados aqui — o motor vai encontrá-los de novo
    // logo abaixo e registrá-los como lacuna.
    const creationCtx = withoutRandomness(() =>
      buildCreationWizardContext({
        selectedOptions,
        selections,
        raceCustomization,
        access,
      })
    );
    const { supplements } = creationCtx;
    withoutRandomness(() => getCreationGaps(creationCtx)).forEach((gap) =>
      gaps.push(fromWizard(gap))
    );

    const level1Sheet = runWithoutRandomness(
      () => generateEmptySheet(selectedOptions, selections, raceCustomization),
      fromEngine(1, gaps)
    );
    level1Sheet.bag = new Bag(level1Sheet.bag?.equipments);
    levels.push({ level: 1, sheet: level1Sheet });

    if (targetLevel <= 1) return { sheet: level1Sheet, levels, gaps };

    let sheet = level1Sheet;
    for (let level = 2; level <= targetLevel; level += 1) {
      const before: CharacterSheet = sheet.classLevels
        ? sheet
        : { ...sheet, classLevels: initializeClassLevels(sheet) };
      let selection: LevelUpSelections | undefined =
        selections.levelUpSelections?.find((sel) => sel.level === level);
      if (!selection) {
        gaps.push({ level, source: 'wizard', step: MISSING_LEVEL_STEP });
        // Seleção padrão do assistente ao abrir um nível.
        selection = {
          level,
          selectedClassName: before.classe.name,
          selectedClassSubname: before.classe.subname,
          powerChoice: 'class',
        };
      }

      const levelSelection = selection;
      const levelCtx = withoutRandomness(() =>
        buildLevelUpWizardContext({
          sheet: before,
          initialSheet: level1Sheet,
          level,
          selection: levelSelection,
          supplements,
          multiclassEnabled: access.multiclass,
        })
      );
      withoutRandomness(() => getLevelUpGaps(levelCtx)).forEach((gap) =>
        gaps.push(fromWizard(gap))
      );
      const levelSteps = withoutRandomness(() => getLevelUpSteps(levelCtx));

      // Como o assistente ao confirmar o nível: a classe vem preenchida, e
      // engenhocas de um nível sem o passo "Engenhocas" (escolhidas antes de
      // trocar o poder Engenhoqueiro) não seguem junto.
      const finalSelection: LevelUpSelections = {
        ...selection,
        selectedClassName: selection.selectedClassName || before.classe.name,
        selectedClassSubname:
          selection.selectedClassSubname || before.classe.subname,
        ...(levelSteps.includes('Engenhocas')
          ? {}
          : { engenhocasFabricadas: undefined, engenhocasCost: undefined }),
      };
      const sheetBefore = sheet;
      sheet = runWithoutRandomness(
        () => applyManualLevelUp(sheetBefore, finalSelection),
        fromEngine(level, gaps)
      );
      if (level < targetLevel) levels.push({ level, sheet });
    }

    // Igual ao MainScreen: PV/PM atuais voltam ao máximo no recálculo.
    const lastSheet: CharacterSheet = {
      ...sheet,
      currentPV: undefined,
      currentPM: undefined,
    };
    const finalSheet = runWithoutRandomness(
      () => recalculateSheet(lastSheet),
      fromEngine(targetLevel, gaps)
    );
    levels.push({ level: targetLevel, sheet: finalSheet });
    return { sheet: finalSheet, levels, gaps };
  } catch (error) {
    return {
      sheet: null,
      levels,
      gaps,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
