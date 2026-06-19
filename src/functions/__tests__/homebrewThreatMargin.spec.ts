import { recalculateSheet } from '../recalculateSheet';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet, {
  StatModifierTarget,
} from '../../interfaces/CharacterSheet';
import Bag from '../../interfaces/Bag';

/**
 * Cobre o bônus de margem de ameaça (`WeaponThreatMargin`) com os modos
 * `increase` (alarga a margem) e `set` (define a margem), aplicado às armas pelo
 * recálculo. O bônus vem de uma habilidade de classe (recalc reconstrói os
 * sheetBonuses a partir das habilidades).
 */
describe('homebrew WeaponThreatMargin bonus', () => {
  const WID = 'tm-test-weapon';

  const mk = (
    target: StatModifierTarget,
    value: number,
    critico: string
  ): CharacterSheet => {
    const sheet = createMockCharacterSheet();
    sheet.bag = new Bag({
      Arma: [
        {
          id: WID,
          nome: 'Espada (teste)',
          group: 'Arma',
          dano: '1d8',
          critico,
        },
      ],
    });
    sheet.classe = {
      ...sheet.classe,
      originalAbilities: undefined,
      abilities: [
        {
          name: 'Golpe Letal',
          text: 'margem',
          nivel: 1,
          sheetBonuses: [
            {
              source: { type: 'class', className: sheet.classe.name },
              target,
              modifier: { type: 'Fixed', value },
            },
          ],
        },
      ],
    };
    sheet.sheetBonuses = [];
    sheet.sheetActionHistory = [];
    return sheet;
  };

  const crit = (sheet: CharacterSheet): string | undefined =>
    recalculateSheet(sheet).bag.equipments.Arma.find((w) => w.id === WID)
      ?.critico;

  it('increase widens the margin (19/x2 +1 → 18/x2)', () => {
    expect(
      crit(mk({ type: 'WeaponThreatMargin', mode: 'increase' }, 1, '19/x2'))
    ).toBe('18/x2');
  });

  it('set overrides the margin (19/x2 set 20 → 20/x2)', () => {
    expect(
      crit(mk({ type: 'WeaponThreatMargin', mode: 'set' }, 20, '19/x2'))
    ).toBe('20/x2');
  });

  it('applies to weapons with implicit margin 20 (x2 +1 → 19/x2)', () => {
    expect(
      crit(mk({ type: 'WeaponThreatMargin', mode: 'increase' }, 1, 'x2'))
    ).toBe('19/x2');
  });

  it('crit multiplier increase (19/x2 +1 → 19/x3)', () => {
    expect(
      crit(
        mk({ type: 'WeaponCriticalMultiplier', mode: 'increase' }, 1, '19/x2')
      )
    ).toBe('19/x3');
  });

  it('crit multiplier set (x2 set 4 → x4)', () => {
    expect(
      crit(mk({ type: 'WeaponCriticalMultiplier', mode: 'set' }, 4, 'x2'))
    ).toBe('x4');
  });

  it('crit multiplier applies to margin-only crit (19 +1 → 19/x3, implicit x2)', () => {
    expect(
      crit(mk({ type: 'WeaponCriticalMultiplier', mode: 'increase' }, 1, '19'))
    ).toBe('19/x3');
  });
});
