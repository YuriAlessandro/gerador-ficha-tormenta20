import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import {
  getAttributeDelta,
  getEffectiveAttributeModifier,
  getEffectiveAttributes,
} from '../effectiveAttributes';
import { recalculateSheet } from '../recalculateSheet';
import { applyStatModifiers } from '../general';
import { RETIRED_ACTIVE_POWER_KEYS } from '../../premium/data/activePowers';
import type { ActiveEffect } from '../../premium/interfaces/ActiveEffect';

/**
 * A camada de atributo efetivo: `atributos[attr].value` (base persistido) +
 * `atributosTemporarios[attr]` (delta recomputado a cada recálculo).
 */

const sheetWithDelta = (
  delta: Partial<Record<Atributo, number>>
): CharacterSheet => {
  const sheet = createMockCharacterSheet();
  sheet.atributosTemporarios = delta;
  return sheet;
};

describe('getAttributeDelta', () => {
  it('devolve 0 quando o campo não existe', () => {
    const sheet = createMockCharacterSheet();
    expect(sheet.atributosTemporarios).toBeUndefined();
    expect(getAttributeDelta(sheet, Atributo.FORCA)).toBe(0);
  });

  it('devolve 0 para atributo sem delta', () => {
    const sheet = sheetWithDelta({ [Atributo.FORCA]: 2 });
    expect(getAttributeDelta(sheet, Atributo.CARISMA)).toBe(0);
  });

  it('devolve o delta, inclusive negativo', () => {
    const sheet = sheetWithDelta({
      [Atributo.FORCA]: 2,
      [Atributo.DESTREZA]: -3,
    });
    expect(getAttributeDelta(sheet, Atributo.FORCA)).toBe(2);
    expect(getAttributeDelta(sheet, Atributo.DESTREZA)).toBe(-3);
  });

  it('trata valor corrompido como 0 em vez de propagar NaN', () => {
    const sheet = sheetWithDelta({
      [Atributo.FORCA]: NaN,
    } as Partial<Record<Atributo, number>>);
    expect(getAttributeDelta(sheet, Atributo.FORCA)).toBe(0);
  });
});

describe('getEffectiveAttributeModifier', () => {
  it('soma base + delta', () => {
    const sheet = sheetWithDelta({ [Atributo.FORCA]: 2 });
    const base = sheet.atributos[Atributo.FORCA].value;
    expect(getEffectiveAttributeModifier(sheet, Atributo.FORCA)).toBe(base + 2);
  });

  it('cai no base quando não há delta nenhum', () => {
    const sheet = createMockCharacterSheet();
    const base = sheet.atributos[Atributo.SABEDORIA].value;
    expect(getEffectiveAttributeModifier(sheet, Atributo.SABEDORIA)).toBe(base);
  });
});

describe('getEffectiveAttributes', () => {
  it('devolve o próprio objeto quando não há delta (evita churn de memo)', () => {
    const sheet = createMockCharacterSheet();
    expect(getEffectiveAttributes(sheet)).toBe(sheet.atributos);
  });

  it('aplica o delta só nos atributos afetados', () => {
    const sheet = sheetWithDelta({ [Atributo.FORCA]: 2 });
    const out = getEffectiveAttributes(sheet);

    expect(out[Atributo.FORCA].value).toBe(
      sheet.atributos[Atributo.FORCA].value + 2
    );
    // Atributo sem delta mantém a referência original.
    expect(out[Atributo.CARISMA]).toBe(sheet.atributos[Atributo.CARISMA]);
  });

  it('não muta o objeto de atributos da ficha', () => {
    const sheet = sheetWithDelta({ [Atributo.FORCA]: 5 });
    const before = sheet.atributos[Atributo.FORCA].value;
    getEffectiveAttributes(sheet);
    expect(sheet.atributos[Atributo.FORCA].value).toBe(before);
  });
});

describe('derivação nos dois motores', () => {
  const attributeEffect = (attr: Atributo, value: number): ActiveEffect => ({
    instanceId: 'eff-1',
    powerKey: 'test:attr',
    name: 'Efeito',
    sourceLabel: 'Teste',
    optionId: 'opt',
    optionLabel: 'Opção',
    bonuses: [
      {
        target: { type: 'Attribute', attribute: attr },
        modifier: { type: 'Fixed', value },
      },
    ],
    appliedAt: '2026-01-01T00:00:00.000Z',
  });

  it('recalculateSheet reduz alvos `Attribute` em atributosTemporarios', () => {
    const sheet = createMockCharacterSheet();
    sheet.activeEffects = [attributeEffect(Atributo.INTELIGENCIA, 2)];
    const out = recalculateSheet(sheet);
    expect(out.atributosTemporarios?.[Atributo.INTELIGENCIA]).toBe(2);
  });

  it('applyStatModifiers (ficha aleatória) espelha o mesmo ramo', () => {
    const sheet = createMockCharacterSheet();
    sheet.sheetBonuses = [
      {
        source: { type: 'manualEdit' },
        target: { type: 'Attribute', attribute: Atributo.INTELIGENCIA },
        modifier: { type: 'Fixed', value: 2 },
      },
    ];
    const out = applyStatModifiers(sheet);
    expect(out.atributosTemporarios?.[Atributo.INTELIGENCIA]).toBe(2);

    // Motor incremental: uma segunda passada não pode compor em cima da
    // primeira (`applyStatModifiers` não zera `sheetBonuses` como o Step 1).
    expect(
      applyStatModifiers(out).atributosTemporarios?.[Atributo.INTELIGENCIA]
    ).toBe(2);
  });

  it('efeito APOSENTADO não entra no atributo efetivo', () => {
    // A regra virou passivo automático; contar o efeito de novo dobraria.
    const [retiredKey] = [...RETIRED_ACTIVE_POWER_KEYS];
    const sheet = createMockCharacterSheet();
    sheet.activeEffects = [
      { ...attributeEffect(Atributo.FORCA, 2), powerKey: retiredKey },
    ];
    const out = recalculateSheet(sheet);
    expect(out.atributosTemporarios).toBeUndefined();
  });

  it('zera o campo quando o delta some (vira undefined, não {})', () => {
    const sheet = createMockCharacterSheet();
    sheet.activeEffects = [attributeEffect(Atributo.FORCA, 2)];
    const withEffect = recalculateSheet(sheet);
    expect(withEffect.atributosTemporarios).toBeDefined();

    withEffect.activeEffects = [];
    const without = recalculateSheet(withEffect);
    expect(without.atributosTemporarios).toBeUndefined();
  });
});
