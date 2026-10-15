import { recalculateSheet } from '../recalculateSheet';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Equipment from '../../interfaces/Equipment';
import Bag from '../../interfaces/Bag';
import { sumLiveWeaponBonuses } from '../weaponBonusScope';
import { getWeaponDisplayDamage } from '../weaponSkill';
import { getEffectiveAttributes } from '../effectiveAttributes';
import type {
  ActiveEffect,
  ActiveEffectBonus,
} from '../../premium/interfaces/ActiveEffect';

/**
 * "Passos de dano" criados pelo usuário (efeito customizado / homebrew) usam o
 * alvo `WeaponDamageStep`. Ele é bakeado no `dano` da arma pelo
 * `applyWeaponBonuses`, exceto nos casos em que o baking não alcança: arma
 * editada manualmente e escopo por modo em arma híbrida de arremesso — esses
 * entram AO VIVO via `sumLiveWeaponBonuses` (Weapon.tsx).
 */

const mkEffect = (bonuses: ActiveEffectBonus[]): ActiveEffect => ({
  instanceId: 'step-effect-instance',
  powerKey: 'custom:passos',
  name: 'Passos de Teste',
  sourceLabel: 'Teste · Efeito',
  optionId: 'opt-1',
  optionLabel: 'Opção',
  bonuses,
  appliedAt: '2026-01-01T00:00:00.000Z',
});

const step = (
  value: number,
  scope: { meleeOnly?: boolean; rangedOnly?: boolean } = {}
): ActiveEffectBonus => ({
  target: { type: 'WeaponDamageStep', ...scope },
  modifier: { type: 'Fixed', value },
});

const espada: Equipment = {
  id: 'w-espada',
  nome: 'Espada Longa',
  group: 'Arma',
  dano: '1d8',
  critico: '19',
};
const arco: Equipment = {
  id: 'w-arco',
  nome: 'Arco Curto',
  group: 'Arma',
  dano: '1d6',
  critico: 'x3',
  alcance: 'Médio',
};
const lanca: Equipment = {
  id: 'w-lanca',
  nome: 'Lança',
  group: 'Arma',
  dano: '1d6',
  critico: 'x2',
  alcance: 'Curto',
  arremesso: true,
};

const run = (weapons: Equipment[], bonuses: ActiveEffectBonus[]) => {
  const sheet = createMockCharacterSheet();
  sheet.bag = new Bag({ Arma: weapons.map((w) => ({ ...w })) });
  sheet.activeEffects = [mkEffect(bonuses)];
  return recalculateSheet(sheet);
};

const find = (sheet: CharacterSheet, id: string) =>
  sheet.bag.equipments.Arma.find((w) => w.id === id)!;

const liveSteps = (sheet: CharacterSheet, w: Equipment, thrownMode = false) =>
  sumLiveWeaponBonuses(w, sheet.sheetBonuses, 'WeaponDamageStep', {
    atributos: getEffectiveAttributes(sheet),
    nivel: sheet.nivel,
    thrownMode,
  });

describe('efeito ativo de passos de dano', () => {
  it('+1 passo sobe o dado da arma (1d8 → 1d10)', () => {
    const out = run([espada], [step(1)]);
    expect(find(out, 'w-espada').dano).toBe('1d10');
  });

  it('passo negativo diminui o dado', () => {
    const out = run([espada], [step(-1)]);
    expect(find(out, 'w-espada').dano).toBe('1d6');
  });

  it('não acumula entre recálculos', () => {
    const out = recalculateSheet(run([espada], [step(1)]));
    expect(find(out, 'w-espada').dano).toBe('1d10');
  });

  it('escopo corpo a corpo não alcança arma à distância', () => {
    const out = run([espada, arco], [step(1, { meleeOnly: true })]);
    expect(find(out, 'w-espada').dano).toBe('1d10');
    expect(find(out, 'w-arco').dano).toBe('1d6');
  });

  it('escopo à distância não alcança arma corpo a corpo', () => {
    const out = run([espada, arco], [step(1, { rangedOnly: true })]);
    expect(find(out, 'w-espada').dano).toBe('1d8');
    expect(find(out, 'w-arco').dano).toBe('1d8');
  });

  it('arma editada manualmente: não bakeia, mas entra ao vivo', () => {
    const editada = { ...espada, hasManualEdits: true };
    const out = run([editada], [step(1)]);
    const w = find(out, 'w-espada');
    expect(w.dano).toBe('1d8');
    expect(liveSteps(out, w)).toBe(1);
    expect(getWeaponDisplayDamage(w, { ...out.atributos }, 0, 1)).toMatch(
      /^1d10/
    );
  });

  it('arma híbrida de arremesso com escopo corpo a corpo: só no corpo a corpo, ao vivo', () => {
    const out = run([lanca], [step(1, { meleeOnly: true })]);
    const w = find(out, 'w-lanca');
    expect(w.dano).toBe('1d6');
    expect(liveSteps(out, w, false)).toBe(1);
    expect(liveSteps(out, w, true)).toBe(0);
  });

  it('sem escopo em arma híbrida: bakeia e não entra ao vivo (sem contagem dupla)', () => {
    const out = run([lanca], [step(1)]);
    const w = find(out, 'w-lanca');
    expect(w.dano).toBe('1d8');
    expect(liveSteps(out, w)).toBe(0);
  });
});
