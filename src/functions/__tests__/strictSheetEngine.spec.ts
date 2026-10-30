import { describe, expect, it } from 'vitest';
import {
  buildSheetWithoutRandomness,
  MISSING_LEVEL_STEP,
  StrictSheetInput,
} from '../strictSheetEngine';
import { isStrictRandomMode } from '../randomUtils';
import { getPowerSelectionRequirements } from '../powers/manualPowerSelection';
import SelectedOptions from '../../interfaces/SelectedOptions';
import { WizardSelections } from '../../interfaces/WizardSelections';
import { SupplementId } from '../../types/supplement.types';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import { expandOficioInBasicas } from '../../data/systems/tormenta20/pericias';
import GUERREIRO from '../../data/systems/tormenta20/classes/guerreiro';
import EQUIPAMENTOS, {
  Armaduras,
} from '../../data/systems/tormenta20/equipamentos';

/**
 * Motor sem sorteio (Builds v2, bloco 1B): ficha + lacunas, sem Math.random.
 */
const ACCESS = {
  optionalRules: false,
  complications: false,
  multiclass: false,
};

const options = (nivel: number): SelectedOptions => ({
  nivel,
  raca: 'Anão',
  classe: 'Guerreiro',
  origin: 'Acólito',
  devocao: { label: '--', value: '--' },
  supplements: [SupplementId.TORMENTA20_CORE],
});

/** Poderes de Guerreiro sem pré-requisito nem escolha de efeito. */
const simplePowers = GUERREIRO.powers.filter(
  (p) =>
    (!p.requirements || p.requirements.length === 0) &&
    getPowerSelectionRequirements(p) === null
);

/** Tudo o que o assistente pede para um Guerreiro Anão Acólito. */
const completeGuerreiro = (): WizardSelections => ({
  characterName: 'Borin',
  characterGender: 'Masculino',
  baseAttributes: {
    [Atributo.FORCA]: 2,
    [Atributo.DESTREZA]: 1,
    [Atributo.CONSTITUICAO]: 2,
    [Atributo.INTELIGENCIA]: 0,
    [Atributo.SABEDORIA]: 1,
    [Atributo.CARISMA]: 0,
  },
  baseSkillChoices: expandOficioInBasicas(GUERREIRO.periciasbasicas)
    .filter((group) => group.type === 'or')
    .map((group) => group.list[0]),
  classSkills: GUERREIRO.periciasrestantes.list.slice(
    0,
    GUERREIRO.periciasrestantes.qtd
  ),
  originBenefits: [
    { type: 'skill', name: 'Cura' },
    { type: 'skill', name: 'Religião' },
  ],
  classEquipment: {
    simpleWeapon: EQUIPAMENTOS.armasSimples[0],
    martialWeapon: EQUIPAMENTOS.armasMarciais[0],
    armor: Armaduras.BRUNEA,
  },
  // O assistente rola o dinheiro ao abrir; aqui ele vem pronto.
  initialMoneyRoll: { amount: 12 },
  ageYears: 40,
});

const withLevels = (levels: number[]): WizardSelections => ({
  ...completeGuerreiro(),
  levelUpSelections: levels.map((level, index) => ({
    level,
    powerChoice: 'class',
    selectedClassPower: simplePowers[index],
  })),
});

const run = (input: Partial<StrictSheetInput> & { nivel: number }) =>
  buildSheetWithoutRandomness({
    selectedOptions: options(input.nivel),
    selections: input.selections ?? {},
    access: ACCESS,
    targetLevel: input.targetLevel,
  });

describe('buildSheetWithoutRandomness', () => {
  it('Guerreiro completo no nível 1: ficha sem lacunas', () => {
    const result = run({ nivel: 1, selections: completeGuerreiro() });
    expect(result.error).toBeUndefined();
    expect(result.gaps).toEqual([]);
    expect(result.sheet?.nivel).toBe(1);
    expect(result.sheet?.dinheiro).toBeGreaterThan(0);
  });

  it('Guerreiro completo até o nível 4: ficha sem lacunas', () => {
    const result = run({ nivel: 4, selections: withLevels([2, 3, 4]) });
    expect(result.error).toBeUndefined();
    expect(result.gaps).toEqual([]);
    expect(result.sheet?.nivel).toBe(4);
    const powerNames = (result.sheet?.classPowers ?? []).map((p) => p.name);
    simplePowers.slice(0, 3).forEach((power) => {
      expect(powerNames).toContain(power.name);
    });
  });

  it('sem seleções: lacunas do assistente e do motor, e a ficha sai', () => {
    const result = run({ nivel: 3 });
    expect(result.error).toBeUndefined();
    expect(result.sheet?.nivel).toBe(3);
    const wizardSteps = result.gaps
      .filter((gap) => gap.source === 'wizard')
      .map((gap) => `${gap.level}:${gap.step}`);
    expect(wizardSteps).toEqual(
      expect.arrayContaining([
        '1:Informações Básicas',
        '1:Perícias da Classe',
        '1:Equipamento Inicial',
        `2:${MISSING_LEVEL_STEP}`,
        '2:Escolha de Poder',
      ])
    );
    const engineGap = result.gaps.find(
      (gap) => gap.source === 'engine' && gap.step === 'Arma simples inicial'
    );
    expect(engineGap).toMatchObject({
      level: 1,
      kind: 'choice',
      picked: [EQUIPAMENTOS.armasSimples[0].nome],
    });
    expect(engineGap?.options).toContain(EQUIPAMENTOS.armasSimples[1].nome);
  });

  it('nível faltando no meio: lacuna só nele e a ficha chega ao alvo', () => {
    const result = run({ nivel: 4, selections: withLevels([2, 4]) });
    expect(result.error).toBeUndefined();
    expect(result.sheet?.nivel).toBe(4);
    expect(result.gaps.map((gap) => `${gap.level}:${gap.step}`)).toEqual([
      `3:${MISSING_LEVEL_STEP}`,
      '3:Escolha de Poder',
    ]);
  });

  it('é determinístico', () => {
    const first = run({ nivel: 5 });
    const second = run({ nivel: 5 });
    expect(JSON.stringify(second.gaps)).toBe(JSON.stringify(first.gaps));
    expect(second.sheet?.atributos).toEqual(first.sheet?.atributos);
    expect(second.sheet?.skills).toEqual(first.sheet?.skills);
    expect(second.sheet?.classPowers?.map((p) => p.name)).toEqual(
      first.sheet?.classPowers?.map((p) => p.name)
    );
  });

  it('targetLevel explícito manda sobre o nível do formulário', () => {
    const result = run({
      nivel: 1,
      targetLevel: 3,
      selections: withLevels([2, 3, 4]),
    });
    expect(result.sheet?.nivel).toBe(3);
  });

  it('não deixa o modo estrito ligado', () => {
    run({ nivel: 2 });
    expect(isStrictRandomMode()).toBe(false);
  });
});
