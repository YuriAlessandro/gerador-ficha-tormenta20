/**
 * Bônus passivos dos poderes personalizados.
 *
 * Três invariantes carregam o resto:
 *  - O Step 1 do `recalculateSheet` zera `sheetBonuses`, então o Step 7.1 é o
 *    único responsável por reaplicá-los — e por isso recalcular N vezes tem que
 *    dar o mesmo resultado que recalcular uma.
 *  - O `source` é RE-CARIMBADO a cada recálculo, nunca lido do que foi salvo:
 *    é o que faz o vínculo sobreviver a renomear o poder.
 *  - `sheetBonuses` de poder personalizado é conteúdo de usuário e chega da
 *    nuvem sem validação: o saneador é obrigatório nos dois pontos de entrada
 *    (recálculo e `normalizeSheet`).
 */
import { describe, it, expect } from 'vitest';
import { recalculateSheet } from '../recalculateSheet';
import { normalizeSheet } from '../sheetNormalizer';
import {
  MAX_CUSTOM_POWER_BONUSES,
  sanitizeCustomPowerBonuses,
} from '../powers/customPowerBonuses';
import { getPowerAppliedBonuses } from '../sheetBonuses/appliedBonuses';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet, { SheetBonus } from '../../interfaces/CharacterSheet';
import { CustomPower } from '../../interfaces/CustomPower';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import Skill from '../../interfaces/Skills';

/** O placeholder que o `SheetBonusBuilder` grava — precisa ser sobrescrito. */
const PLACEHOLDER_SOURCE = { type: 'race' as const, raceName: '' };

const skillBonus = (value: number): SheetBonus => ({
  source: PLACEHOLDER_SOURCE,
  target: { type: 'Skill', name: Skill.ATLETISMO },
  modifier: { type: 'Fixed', value },
});

const customPower = (overrides: Partial<CustomPower> = {}): CustomPower => ({
  id: 'custom-1',
  name: 'Golpe Devastador',
  description: 'Um poder inventado pelo jogador.',
  ...overrides,
});

const atletismoOthers = (sheet: CharacterSheet) =>
  sheet.completeSkills?.find((s) => s.name === Skill.ATLETISMO)?.others ?? 0;

const bonusesFrom = (sheet: CharacterSheet, powerName: string) =>
  sheet.sheetBonuses.filter(
    (b) => b.source.type === 'power' && b.source.name === powerName
  );

describe('bônus passivos de poder personalizado', () => {
  it('aplica um bônus de perícia declarado no poder', () => {
    const sheet = createMockCharacterSheet();
    const before = atletismoOthers(recalculateSheet(sheet));

    sheet.customPowers = [customPower({ sheetBonuses: [skillBonus(2)] })];
    const result = recalculateSheet(sheet);

    expect(atletismoOthers(result)).toBe(before + 2);
    expect(bonusesFrom(result, 'Golpe Devastador')).toHaveLength(1);
  });

  it('aplica também os bônus de customGrantedPowers', () => {
    const sheet = createMockCharacterSheet();
    const before = atletismoOthers(recalculateSheet(sheet));

    sheet.customGrantedPowers = [
      customPower({ id: 'granted-1', name: 'Bênção Inventada' }),
    ];
    sheet.customGrantedPowers[0].sheetBonuses = [skillBonus(3)];
    const result = recalculateSheet(sheet);

    expect(atletismoOthers(result)).toBe(before + 3);
    expect(bonusesFrom(result, 'Bênção Inventada')).toHaveLength(1);
  });

  it('re-carimba o source por cima do placeholder do builder', () => {
    const sheet = createMockCharacterSheet();
    sheet.customPowers = [customPower({ sheetBonuses: [skillBonus(2)] })];

    const result = recalculateSheet(sheet);

    expect(result.sheetBonuses).toContainEqual(
      expect.objectContaining({
        source: { type: 'power', name: 'Golpe Devastador' },
      })
    );
    expect(result.sheetBonuses.some((b) => b.source.type === 'race')).toBe(
      false
    );
  });

  it('não dobra o bônus ao recalcular duas vezes', () => {
    const sheet = createMockCharacterSheet();
    sheet.customPowers = [customPower({ sheetBonuses: [skillBonus(2)] })];

    const once = recalculateSheet(sheet);
    const twice = recalculateSheet(once);

    expect(atletismoOthers(twice)).toBe(atletismoOthers(once));
    expect(bonusesFrom(twice, 'Golpe Devastador')).toHaveLength(1);
  });

  it('remove o bônus junto com o poder', () => {
    const sheet = createMockCharacterSheet();
    sheet.customPowers = [customPower({ sheetBonuses: [skillBonus(2)] })];
    const withPower = recalculateSheet(sheet);

    const withoutPower = recalculateSheet({ ...withPower, customPowers: [] });

    expect(bonusesFrom(withoutPower, 'Golpe Devastador')).toHaveLength(0);
    expect(atletismoOthers(withoutPower)).toBe(
      atletismoOthers(recalculateSheet(createMockCharacterSheet()))
    );
  });

  it('segue casando o bônus depois de renomear o poder', () => {
    const sheet = createMockCharacterSheet();
    sheet.customPowers = [customPower({ sheetBonuses: [skillBonus(2)] })];
    const first = recalculateSheet(sheet);

    const renamed = recalculateSheet({
      ...first,
      customPowers: [{ ...first.customPowers![0], name: 'Nome Novo' }],
    });

    expect(bonusesFrom(renamed, 'Golpe Devastador')).toHaveLength(0);
    expect(bonusesFrom(renamed, 'Nome Novo')).toHaveLength(1);
    // É isto que faz os chips "Aplicado na ficha" continuarem aparecendo.
    expect(
      getPowerAppliedBonuses(renamed, {
        name: 'Nome Novo',
        sheetBonuses: renamed.customPowers![0].sheetBonuses,
      })
    ).not.toHaveLength(0);
  });

  it('manda alvo `Attribute` para a camada de atributo efetivo, não para o base', () => {
    const sheet = createMockCharacterSheet();
    const baseForca = sheet.atributos[Atributo.FORCA].value;
    sheet.customPowers = [
      customPower({
        sheetBonuses: [
          {
            source: PLACEHOLDER_SOURCE,
            target: { type: 'Attribute', attribute: Atributo.FORCA },
            modifier: { type: 'Fixed', value: 2 },
          },
        ],
      }),
    ];

    const result = recalculateSheet(sheet);

    expect(result.atributos[Atributo.FORCA].value).toBe(baseForca);
    expect(result.atributosTemporarios?.[Atributo.FORCA]).toBe(2);
  });

  it('aplica bônus de PV', () => {
    const sheet = createMockCharacterSheet();
    const before = recalculateSheet(sheet).pv;

    sheet.customPowers = [
      customPower({
        sheetBonuses: [
          {
            source: PLACEHOLDER_SOURCE,
            target: { type: 'PV' },
            modifier: { type: 'Fixed', value: 5 },
          },
        ],
      }),
    ];

    expect(recalculateSheet(sheet).pv).toBe(before + 5);
  });
});

describe('sanitizeCustomPowerBonuses', () => {
  it('devolve [] para entrada que não é array', () => {
    expect(sanitizeCustomPowerBonuses(undefined)).toEqual([]);
    expect(
      sanitizeCustomPowerBonuses('nope' as unknown as SheetBonus[])
    ).toEqual([]);
  });

  it('clampa valores fixos absurdos', () => {
    const [bonus] = sanitizeCustomPowerBonuses([skillBonus(999)]);
    expect(bonus.modifier).toEqual({ type: 'Fixed', value: 50 });

    const [negative] = sanitizeCustomPowerBonuses([skillBonus(-999)]);
    expect(negative.modifier).toEqual({ type: 'Fixed', value: -50 });
  });

  it(`corta a lista em ${MAX_CUSTOM_POWER_BONUSES} bônus`, () => {
    const many = Array.from({ length: 30 }, () => skillBonus(1));
    expect(sanitizeCustomPowerBonuses(many)).toHaveLength(
      MAX_CUSTOM_POWER_BONUSES
    );
  });

  it('descarta fórmula que não passa na whitelist (o ramo do eval)', () => {
    const evil: SheetBonus = {
      source: PLACEHOLDER_SOURCE,
      target: { type: 'PV' },
      modifier: { type: 'LevelCalc', formula: 'Math.random() * 100' },
    };
    expect(sanitizeCustomPowerBonuses([evil])).toEqual([]);
  });

  it('descarta alvos sem consumidor no motor', () => {
    const trainSkill: SheetBonus = {
      source: PLACEHOLDER_SOURCE,
      // `TrainSkill` só existe como marcador de compilação do homebrew.
      target: { type: 'TrainSkill', skills: [Skill.LUTA], pick: 1 },
      modifier: { type: 'Fixed', value: 1 },
    };
    const pickSkill: SheetBonus = {
      source: PLACEHOLDER_SOURCE,
      target: { type: 'PickSkill', skills: [Skill.LUTA], pick: 1 },
      modifier: { type: 'Fixed', value: 1 },
    };
    expect(sanitizeCustomPowerBonuses([trainSkill, pickSkill])).toEqual([]);
  });

  it('força `by: level` na escala por nível', () => {
    const [bonus] = sanitizeCustomPowerBonuses([
      {
        source: PLACEHOLDER_SOURCE,
        target: { type: 'PV' },
        modifier: {
          type: 'LevelBreakpoints',
          by: 'classLevel',
          breakpoints: [{ fromLevel: 1, value: 2 }],
        },
      },
    ]);
    expect(bonus.modifier).toMatchObject({ by: 'level' });
  });
});

describe('normalizeSheet', () => {
  it('saneia os bônus de poder personalizado vindos da nuvem', () => {
    const sheet = createMockCharacterSheet();
    sheet.customPowers = [customPower({ sheetBonuses: [skillBonus(999)] })];

    normalizeSheet(sheet);

    expect(sheet.customPowers![0].sheetBonuses![0].modifier).toEqual({
      type: 'Fixed',
      value: 50,
    });
  });

  it('preserva poder personalizado sem bônus', () => {
    const sheet = createMockCharacterSheet();
    sheet.customPowers = [customPower()];

    normalizeSheet(sheet);

    expect(sheet.customPowers).toHaveLength(1);
    expect(sheet.customPowers![0].sheetBonuses).toBeUndefined();
  });
});
