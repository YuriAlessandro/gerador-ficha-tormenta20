import { recalculateSheet } from '../recalculateSheet';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Bag from '../../interfaces/Bag';
import { RACE_SIZES } from '../../data/systems/tormenta20/races/raceSizes/raceSizes';
import type {
  ActiveEffect,
  ActiveEffectBonus,
} from '../../premium/interfaces/ActiveEffect';
import { getActiveEffectForSpell } from '../../premium/data/activePowers';

/**
 * Passo de dano por categoria de tamanho (JDA, Toques Finais p. 106) e o
 * primitivo relativo `SizeSteps` que a magia Alterar Tamanho usa.
 */

const WID = 'size-test-weapon';

const mkEffect = (bonuses: ActiveEffectBonus[]): ActiveEffect => ({
  instanceId: 'size-test-instance',
  powerKey: 'test:size',
  name: 'Efeito de Tamanho',
  sourceLabel: 'Teste · Tamanho',
  optionId: 'opt-1',
  optionLabel: 'Opção',
  bonuses,
  appliedAt: '2026-01-01T00:00:00.000Z',
});

/** Ficha Média com uma espada 1d8, opcionalmente com efeitos ativos. */
const sheetWith = (
  bonuses: ActiveEffectBonus[] = [],
  size = RACE_SIZES.MEDIO
): CharacterSheet => {
  const sheet = createMockCharacterSheet();
  sheet.size = size;
  sheet.bag = new Bag({
    Arma: [{ id: WID, nome: 'Espada', group: 'Arma', dano: '1d8' }],
  });
  if (bonuses.length > 0) sheet.activeEffects = [mkEffect(bonuses)];
  return sheet;
};

const weapon = (sheet: CharacterSheet) =>
  sheet.bag.equipments.Arma.find((w) => w.id === WID);

const steps = (value: number): ActiveEffectBonus => ({
  target: { type: 'SizeSteps', steps: value },
  modifier: { type: 'Fixed', value: 0 },
});

describe('passo de dano derivado do tamanho', () => {
  it('Médio usa armas normais', () => {
    const out = recalculateSheet(sheetWith());
    expect(weapon(out)?.dano).toBe('1d8');
  });

  it('Grande usa armas aumentadas (+1 passo), sem efeito nenhum', () => {
    const out = recalculateSheet(sheetWith([], RACE_SIZES.GRANDE));
    expect(weapon(out)?.dano).toBe('1d10');
  });

  it('Enorme também é +1 passo; Colossal é +2', () => {
    expect(
      weapon(recalculateSheet(sheetWith([], RACE_SIZES.ENORME)))?.dano
    ).toBe('1d10');
    expect(
      weapon(recalculateSheet(sheetWith([], RACE_SIZES.COLOSSAL)))?.dano
    ).toBe('1d12');
  });

  it('Pequeno usa armas normais e Minúsculo usa reduzidas (−1 passo)', () => {
    expect(
      weapon(recalculateSheet(sheetWith([], RACE_SIZES.PEQUENO)))?.dano
    ).toBe('1d8');
    expect(
      weapon(recalculateSheet(sheetWith([], RACE_SIZES.MINUSCULO)))?.dano
    ).toBe('1d6');
  });

  it('é idempotente em recálculos sucessivos', () => {
    const once = recalculateSheet(sheetWith([], RACE_SIZES.GRANDE));
    const twice = recalculateSheet(once);
    expect(weapon(twice)?.dano).toBe('1d10');
  });
});

describe('WeaponDamageStep não compõe entre recálculos', () => {
  // Regressão: `resetWeaponToBase` só snapshotava `baseDano` quando o dano
  // tinha "+N". Um bônus de passo puro não deixa rastro na string, então a
  // arma subia um degrau por recálculo (1d8 → 1d10 → 1d12 → 3d6).
  const stepEffect = mkEffect([
    {
      target: { type: 'WeaponDamageStep' },
      modifier: { type: 'Fixed', value: 1 },
    },
  ]);

  it('três recálculos seguidos mantêm um único passo', () => {
    const sheet = sheetWith();
    sheet.activeEffects = [stepEffect];

    let out = recalculateSheet(sheet);
    expect(weapon(out)?.dano).toBe('1d10');

    out = recalculateSheet(out);
    out = recalculateSheet(out);
    expect(weapon(out)?.dano).toBe('1d10');
  });

  it('remover o efeito devolve o dado à base', () => {
    const sheet = sheetWith();
    sheet.activeEffects = [stepEffect];

    const buffed = recalculateSheet(sheet);
    const reverted = recalculateSheet({ ...buffed, activeEffects: [] });
    expect(weapon(reverted)?.dano).toBe('1d8');
  });
});

describe('SizeSteps — mudança relativa de categoria', () => {
  it('+1 degrau leva Médio a Grande e sobe o dado um passo', () => {
    const out = recalculateSheet(sheetWith([steps(1)]));
    expect(out.size.name).toBe('Grande');
    expect(weapon(out)?.dano).toBe('1d10');
  });

  it('−1 degrau leva Médio a Pequeno sem mexer no dado', () => {
    const out = recalculateSheet(sheetWith([steps(-1)]));
    expect(out.size.name).toBe('Pequeno');
    expect(weapon(out)?.dano).toBe('1d8');
  });

  it('−1 degrau a partir de Pequeno chega em Minúsculo e reduz o dado', () => {
    const out = recalculateSheet(sheetWith([steps(-1)], RACE_SIZES.PEQUENO));
    expect(out.size.name).toBe('Minúsculo');
    expect(weapon(out)?.dano).toBe('1d6');
  });

  it('resolve contra o tamanho de QUEM recebe, não de quem lançou', () => {
    // O mesmo bônus congelado numa oferta de mesa: um alvo Pequeno vira Médio.
    const out = recalculateSheet(sheetWith([steps(1)], RACE_SIZES.PEQUENO));
    expect(out.size.name).toBe('Médio');
  });

  it('faz clamp em Colossal e em Minúsculo', () => {
    expect(recalculateSheet(sheetWith([steps(9)])).size.name).toBe('Colossal');
    expect(recalculateSheet(sheetWith([steps(-9)])).size.name).toBe(
      'Minúsculo'
    );
  });

  it('soma com um SizeOverride absoluto', () => {
    const out = recalculateSheet(
      sheetWith([
        {
          target: { type: 'SizeOverride', size: 'ENORME' },
          modifier: { type: 'Fixed', value: 0 },
        },
        steps(1),
      ])
    );
    expect(out.size.name).toBe('Colossal');
    expect(weapon(out)?.dano).toBe('1d12');
  });

  it('remover o efeito restaura tamanho e dano, descartando o snapshot', () => {
    const transformed = recalculateSheet(sheetWith([steps(1)]));
    expect(transformed.baseSize?.name).toBe('Médio');

    const reverted = recalculateSheet({ ...transformed, activeEffects: [] });
    expect(reverted.size.name).toBe('Médio');
    expect(reverted.baseSize).toBeUndefined();
    expect(weapon(reverted)?.dano).toBe('1d8');
  });
});

describe('magias que mudam de categoria', () => {
  it('Alterar Tamanho está registrada com os tiers de +2 e +3 PM', () => {
    const def = getActiveEffectForSpell('Alterar Tamanho');
    expect(def).toBeDefined();

    const options = def?.getUsageOptions(createMockCharacterSheet()) ?? [];
    expect(options).toHaveLength(2);

    const [maior, menor] = options;
    expect(maior.bonuses).toContainEqual(steps(1));
    expect(menor.bonuses).toContainEqual(steps(-1));
  });

  it('Alterar Tamanho aplica Força +2 junto do aumento de categoria', () => {
    const def = getActiveEffectForSpell('Alterar Tamanho');
    const [maior] = def?.getUsageOptions(createMockCharacterSheet()) ?? [];

    const out = recalculateSheet(sheetWith(maior.bonuses));
    expect(out.size.name).toBe('Grande');
    // 1d8 → 1d10 pelo tamanho, +2 de dano melee pela expansão de Força.
    expect(weapon(out)?.dano).toBe('1d10+2');
  });

  it('Potência Divina também sobe uma categoria', () => {
    const def = getActiveEffectForSpell('Potência Divina');
    const options = def?.getUsageOptions(createMockCharacterSheet()) ?? [];
    options.forEach((option) => {
      expect(option.bonuses).toContainEqual(steps(1));
    });
  });
});
