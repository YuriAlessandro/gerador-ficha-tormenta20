import { describe, expect, it } from 'vitest';
import { generateEmptySheet } from '../general';
import { initializeClassLevels } from '../multiclass';
import { getPowerSelectionRequirements } from '../powers/manualPowerSelection';
import {
  buildLevelUpWizardContext,
  getLevelUpGaps,
  getLevelUpPowerOptions,
  getLevelUpPowerSpellChoiceInfo,
  getLevelUpSheetWithAbilities,
  getLevelUpSheetWithProjectedClassLevel,
  getLevelUpSteps,
  isLevelUpStepComplete,
} from '../wizardRules/levelUpWizardRules';
import SelectedOptions from '../../interfaces/SelectedOptions';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { LevelUpSelections } from '../../interfaces/WizardSelections';
import { SupplementId } from '../../types/supplement.types';
import GUERREIRO from '../../data/systems/tormenta20/classes/guerreiro';
import { dataRegistry } from '../../data/registry';
import {
  CAMINHO_GOVERNANTE,
  CAMINHO_SOLDADO,
} from '../../data/systems/tormenta20/herois-de-arton/variantClasses/vassaloSheetBonuses';
import spellPowers from '../../data/systems/tormenta20/powers/spellPowers';
import { arcaneSpellsCircle1 } from '../../data/systems/tormenta20/magias/arcane';

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

/**
 * Mudanças da `main` levadas para as regras na sincronização com a pilha
 * (Builds v2, bloco S): escolha de magia nos poderes (#571), ordem do Lorde
 * do Vassalo e ficha projetada do Conhecimento Mágico em multiclasse.
 */
describe('sincronização com a main', () => {
  const ARCANISTA_OPTIONS: SelectedOptions = {
    ...OPTIONS,
    raca: 'Humano',
    classe: 'Arcanista',
  };
  const sono = arcaneSpellsCircle1.Encan.find((spell) => spell.nome === 'Sono');

  const arcanistaCtx = (selection: LevelUpSelections) => {
    const base = generateEmptySheet(ARCANISTA_OPTIONS, {
      characterName: 'Teste',
      arcanistaSubtype: 'Mago',
    });
    const sheet: CharacterSheet = {
      ...base,
      classLevels: initializeClassLevels(base),
      spells: sono ? [sono] : [],
    };
    return buildLevelUpWizardContext({
      sheet,
      initialSheet: sheet,
      level: selection.level,
      selection,
      supplements: SUPPLEMENTS,
      multiclassEnabled: false,
    });
  };

  const focoEmMagia: LevelUpSelections = {
    level: 2,
    powerChoice: 'general',
    selectedGeneralPower: spellPowers.FOCO_EM_MAGIA,
  };

  it('"Magia do Poder" entra depois de "Seleção de Magias" com Foco em Magia', () => {
    const steps = getLevelUpSteps(arcanistaCtx(focoEmMagia));
    expect(steps).toContain('Magia do Poder');
    expect(steps.indexOf('Magia do Poder')).toBeGreaterThan(
      steps.indexOf('Seleção de Magias')
    );
    expect(steps.indexOf('Magia do Poder')).toBeGreaterThan(
      steps.indexOf('Escolha de Poder')
    );
  });

  it('"Magia do Poder" só fica completo com a magia escolhida', () => {
    expect(
      isLevelUpStepComplete(arcanistaCtx(focoEmMagia), 'Magia do Poder')
    ).toBe(false);
    const chosen = arcanistaCtx({
      ...focoEmMagia,
      spellModifierChoices: { 'Foco em Magia': ['Sono'] },
    });
    expect(isLevelUpStepComplete(chosen, 'Magia do Poder')).toBe(true);
    expect(getLevelUpPowerSpellChoiceInfo(chosen)?.choice.chosen).toEqual([
      'Sono',
    ]);
  });

  it('poder sem escolha de magia não tem o passo', () => {
    const steps = getLevelUpSteps(
      ctxFor({
        level: 2,
        powerChoice: 'class',
        selectedClassPower: simpleGuerreiroPower(),
      })
    );
    expect(steps).not.toContain('Magia do Poder');
  });

  it('Lorde: "Efeitos de Habilidades" vem antes de "Escolha de Poder"', () => {
    const supplements = [
      SupplementId.TORMENTA20_CORE,
      SupplementId.TORMENTA20_HEROIS_ARTON,
    ];
    const base = generateEmptySheet(
      { ...OPTIONS, raca: 'Humano', classe: 'Vassalo', supplements },
      { characterName: 'Teste' }
    );
    const sheet: CharacterSheet = { ...base, nivel: 8 };
    const ctx = buildLevelUpWizardContext({
      sheet,
      initialSheet: sheet,
      level: 9,
      selection: { level: 9, powerChoice: 'class' },
      supplements,
      multiclassEnabled: false,
    });
    const steps = getLevelUpSteps(ctx);
    expect(steps).toContain('Efeitos de Habilidades');
    expect(steps.indexOf('Efeitos de Habilidades')).toBeLessThan(
      steps.indexOf('Escolha de Poder')
    );
  });

  it('Conhecimento Mágico: a ficha projetada conta o nível novo da classe secundária', () => {
    const sheet = level1Sheet();
    const ctx = buildLevelUpWizardContext({
      sheet,
      initialSheet: sheet,
      level: 2,
      selection: {
        level: 2,
        powerChoice: 'class',
        selectedClassName: 'Arcanista',
      },
      supplements: SUPPLEMENTS,
      multiclassEnabled: true,
    });
    const projected = getLevelUpSheetWithProjectedClassLevel(ctx);
    expect(projected.classLevels?.at(-1)).toEqual({
      level: 2,
      className: 'Arcanista',
      classSubname: undefined,
    });
    expect(projected.classLevels?.[0]?.className).toBe('Guerreiro');
  });

  describe('lista de poderes (getLevelUpPowerOptions)', () => {
    const HEROIS = [
      SupplementId.TORMENTA20_CORE,
      SupplementId.TORMENTA20_HEROIS_ARTON,
    ];
    const vassalo9 = (lorde?: string) => {
      const base = generateEmptySheet(
        { ...OPTIONS, raca: 'Humano', classe: 'Vassalo', supplements: HEROIS },
        { characterName: 'Teste' }
      );
      const sheet: CharacterSheet = { ...base, nivel: 8 };
      return buildLevelUpWizardContext({
        sheet,
        initialSheet: sheet,
        level: 9,
        selection: {
          level: 9,
          powerChoice: 'class',
          ...(lorde
            ? { abilityEffectSelections: { Lorde: { chosenOption: [lorde] } } }
            : {}),
        },
        supplements: HEROIS,
        multiclassEnabled: false,
      });
    };
    const classesOf = (lorde: string) => {
      const ctx = vassalo9(lorde);
      return new Set(
        getLevelUpPowerOptions(ctx, getLevelUpSheetWithAbilities(ctx))
          .classPowers.map((p) => p.className)
          .filter(Boolean)
      );
    };

    it('Lorde: a opção escolhida decide de qual classe vem o poder', () => {
      expect([...classesOf(CAMINHO_SOLDADO)]).toEqual(['Guerreiro']);
      expect([...classesOf(CAMINHO_GOVERNANTE)]).toEqual(['Nobre']);
    });

    it('poder de distinção só aparece com a distinção na ficha', () => {
      const all = [...Object.values(SupplementId)];
      const distinctionPower = (dataRegistry.getPowersBySupplements(all)
        .DISTINCAO ?? [])[0];
      expect(distinctionPower?.distinctionId).toBeTruthy();
      const names = (distinctions: CharacterSheet['distinctions']) => {
        const sheet: CharacterSheet = { ...level1Sheet(), distinctions };
        const ctx = buildLevelUpWizardContext({
          sheet,
          initialSheet: sheet,
          level: 2,
          selection: { level: 2, powerChoice: 'general' },
          supplements: all,
          multiclassEnabled: false,
        });
        return getLevelUpPowerOptions(
          ctx,
          getLevelUpSheetWithAbilities(ctx)
        ).generalPowers.map((p) => p.name);
      };
      expect(names(undefined)).not.toContain(distinctionPower.name);
      expect(
        names([
          {
            id: distinctionPower.distinctionId ?? '',
            name: 'Distinção',
            acquiredAtLevel: 1,
          },
        ])
      ).toContain(distinctionPower.name);
    });
  });
});
