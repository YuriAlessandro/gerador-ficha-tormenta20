import { describe, expect, it } from 'vitest';
import { generateEmptySheet } from '../general';
import { initializeClassLevels } from '../multiclass';
import { getPowerSelectionRequirements } from '../powers/manualPowerSelection';
import {
  buildLevelUpWizardContext,
  getLevelUpGaps,
  getLevelUpPowerOptions,
  getLevelUpSheetWithAbilities,
  getLevelUpSteps,
} from '../wizardRules/levelUpWizardRules';
import SelectedOptions from '../../interfaces/SelectedOptions';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { LevelUpSelections } from '../../interfaces/WizardSelections';
import { SupplementId } from '../../types/supplement.types';
import GUERREIRO from '../../data/systems/tormenta20/classes/guerreiro';

/**
 * Regras do assistente de subir de nível em funções puras (Builds v2, bloco
 * 1B): mesmos passos e mesma habilitação do "Próximo" que o componente usava.
 */
const SUPPLEMENTS = [SupplementId.TORMENTA20_CORE];

const OPTIONS: SelectedOptions = {
  nivel: 1,
  raca: 'Anão',
  classe: 'Guerreiro',
  origin: 'Acólito',
  devocao: { label: '--', value: '--' },
  supplements: SUPPLEMENTS,
};

const level1Sheet = (): CharacterSheet => {
  const sheet = generateEmptySheet(OPTIONS, { characterName: 'Teste' });
  return { ...sheet, classLevels: initializeClassLevels(sheet) };
};

/** Poder de Guerreiro sem pré-requisito nem escolha de efeito. */
const simpleGuerreiroPower = () => {
  const power = GUERREIRO.powers.find(
    (p) =>
      (!p.requirements || p.requirements.length === 0) &&
      getPowerSelectionRequirements(p) === null
  );
  if (!power) throw new Error('Nenhum poder simples de Guerreiro');
  return power;
};

const ctxFor = (
  selection: LevelUpSelections,
  { multiclassEnabled = false } = {}
) => {
  const sheet = level1Sheet();
  return buildLevelUpWizardContext({
    sheet,
    initialSheet: sheet,
    level: selection.level,
    selection,
    supplements: SUPPLEMENTS,
    multiclassEnabled,
  });
};

const gapSteps = (
  selection: LevelUpSelections,
  options?: { multiclassEnabled?: boolean }
) => getLevelUpGaps(ctxFor(selection, options)).map((gap) => gap.step);

describe('getLevelUpGaps', () => {
  it('nível 2 sem poder: lacuna em "Escolha de Poder"', () => {
    expect(gapSteps({ level: 2, powerChoice: 'class' })).toEqual([
      'Escolha de Poder',
    ]);
  });

  it('nível 2 com poder de classe simples: sem lacunas', () => {
    expect(
      gapSteps({
        level: 2,
        powerChoice: 'class',
        selectedClassPower: simpleGuerreiroPower(),
      })
    ).toEqual([]);
  });

  it('as lacunas levam o nível sendo montado', () => {
    const gaps = getLevelUpGaps(ctxFor({ level: 2, powerChoice: 'class' }));
    expect(gaps.every((gap) => gap.level === 2)).toBe(true);
  });

  it('multiclasse para Arcanista sem setup: "Configuração da Classe"', () => {
    const selection: LevelUpSelections = {
      level: 2,
      powerChoice: 'class',
      selectedClassName: 'Arcanista',
    };
    const steps = getLevelUpSteps(ctxFor(selection));
    expect(steps).toContain('Configuração da Classe');
    // 1º nível numa classe nova não concede poder
    expect(steps).not.toContain('Escolha de Poder');
    expect(gapSteps(selection)).toContain('Configuração da Classe');
    expect(
      gapSteps({ ...selection, classSetup: { arcanistaSubtype: 'Mago' } })
    ).not.toContain('Configuração da Classe');
  });
});

describe('getLevelUpSteps', () => {
  it('"Escolha de Classe" só com a multiclasse ligada', () => {
    const selection: LevelUpSelections = {
      level: 2,
      powerChoice: 'class',
      selectedClassName: 'Guerreiro',
    };
    expect(getLevelUpSteps(ctxFor(selection))).not.toContain(
      'Escolha de Classe'
    );
    expect(
      getLevelUpSteps(ctxFor(selection, { multiclassEnabled: true }))
    ).toContain('Escolha de Classe');
    expect(gapSteps(selection, { multiclassEnabled: true })).not.toContain(
      'Escolha de Classe'
    );
  });
});

describe('getLevelUpPowerOptions', () => {
  it('lista os poderes do passo "Escolha de Poder", com os reprovados à parte', () => {
    const ctx = ctxFor({ level: 2, powerChoice: 'class' });
    const options = getLevelUpPowerOptions(
      ctx,
      getLevelUpSheetWithAbilities(ctx)
    );
    const general = options.generalPowers.map((p) => p.name);
    const classPowers = options.classPowers.map((p) => p.name);
    // Trespassar exige Ataque Poderoso: aparece, mas indisponível.
    expect(general).toContain('Trespassar');
    expect(options.unavailableGeneralPowers).toContain('Trespassar');
    const simple = simpleGuerreiroPower().name;
    expect(classPowers).toContain(simple);
    expect(options.unavailableClassPowers).not.toContain(simple);
    expect(options.sheetForFiltering.classe.name).toBe('Guerreiro');
  });

  it('com "fora dos requisitos" o corte de nível sai da lista de classe', () => {
    const ctx = ctxFor({ level: 2, powerChoice: 'class' });
    const sheet = getLevelUpSheetWithAbilities(ctx);
    const strict = getLevelUpPowerOptions(ctx, sheet);
    const all = getLevelUpPowerOptions(ctx, sheet, { allowAll: true });
    expect(all.classPowers.length).toBeGreaterThanOrEqual(
      strict.classPowers.length
    );
  });
});
