import _ from 'lodash';
import { recalculateSheet } from '../recalculateSheet';
import { applyItemEnhancements } from '../itemEnhancements/applyEnhancements';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Equipment from '../../interfaces/Equipment';
import Bag from '../../interfaces/Bag';
import Skill from '../../interfaces/Skills';

/**
 * A modificação "Cravejada de gemas" concede +2 em Enganação. O pipeline de
 * aprimoramentos emite um SheetBonus de perícia no item; o recalculateSheet
 * coleta esse bônus (Step 7.3) e o aplica em `completeSkills.others` (Step 8).
 * Também confere que remover a modificação zera o bônus.
 */
const enganacaoOthers = (sheet: CharacterSheet): number =>
  sheet.completeSkills?.find((s) => s.name === Skill.ENGANACAO)?.others ?? 0;

const mkSheet = (weapon: Equipment): CharacterSheet => {
  const sheet = createMockCharacterSheet();
  sheet.bag = new Bag({ Arma: [weapon] });
  return sheet;
};

describe('Cravejada de gemas — +2 em Enganação', () => {
  const espadaBase: Equipment = {
    id: 'w-cravejada',
    nome: 'Espada Longa',
    group: 'Arma',
    dano: '1d8',
    critico: 'x2',
    spaces: 1,
  };

  it('aplica +2 em Enganação (others) quando a mod está no item', () => {
    const weapon = applyItemEnhancements({
      ..._.cloneDeep(espadaBase),
      modifications: [{ mod: 'Cravejada de gemas' }],
    });
    const recalculated = recalculateSheet(mkSheet(weapon));
    expect(enganacaoOthers(recalculated)).toBe(2);
  });

  it('remover a mod zera o bônus de Enganação', () => {
    // Item que tinha a mod (com sheetBonuses/base capturados) e depois teve a
    // modificação removida — o pipeline limpa os sheetBonuses derivados.
    const withMod = applyItemEnhancements({
      ..._.cloneDeep(espadaBase),
      modifications: [{ mod: 'Cravejada de gemas' }],
    });
    const withoutMod = applyItemEnhancements({
      ...withMod,
      modifications: undefined,
    });
    const recalculated = recalculateSheet(mkSheet(withoutMod));
    expect(enganacaoOthers(recalculated)).toBe(0);
  });
});
