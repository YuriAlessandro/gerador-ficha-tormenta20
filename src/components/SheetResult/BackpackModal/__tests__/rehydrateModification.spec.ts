import Equipment, { DefenseEquipment } from '../../../../interfaces/Equipment';
import { removeModificationWithDependents } from '../../../../utils/superiorItemsValidation';
import { rehydrateModification } from '../itemEditorSave';

/**
 * Reabrir um item salvo: a melhoria gravada guarda só o nome, e o editor
 * precisa do dado completo para validar a remoção. Sem o pré-requisito, dava
 * para tirar Ajustada e manter Sob medida.
 */

const couraca: DefenseEquipment = {
  id: 'couraca',
  nome: 'Couraça',
  group: 'Armadura',
  defenseBonus: 5,
  armorPenalty: 0,
  spaces: 2,
  modifications: [{ mod: 'Ajustada' }, { mod: 'Sob medida' }],
};

describe('rehydrateModification', () => {
  test('traz o pré-requisito do catálogo', () => {
    const mods = (couraca.modifications ?? []).map((m) =>
      rehydrateModification(m, couraca)
    );

    expect(mods[1]).toMatchObject({
      mod: 'Sob medida',
      prerequisite: 'Ajustada',
    });
  });

  test('remover Ajustada de um item reaberto leva Sob medida junto', () => {
    const mods = (couraca.modifications ?? []).map((m) =>
      rehydrateModification(m, couraca)
    );

    const after = removeModificationWithDependents(mods[0], mods);

    expect(after).toEqual([]);
  });

  test('melhoria de arma resolve pelo lado das armas', () => {
    const espada: Equipment = {
      nome: 'Espada longa',
      group: 'Arma',
      spaces: 1,
      modifications: [{ mod: 'Cruel' }, { mod: 'Atroz' }],
    };

    expect(rehydrateModification({ mod: 'Atroz' }, espada).prerequisite).toBe(
      'Cruel'
    );
  });

  test('o snapshot gravado no item vence o catálogo', () => {
    const effect = { weaponStats: { atkBonus: 9 } };
    const mod = rehydrateModification(
      { mod: 'Melhoria de homebrew', effect, supplementId: 'hb' },
      couraca
    );

    expect(mod).toMatchObject({
      mod: 'Melhoria de homebrew',
      effect,
      supplementId: 'hb',
    });
  });
});
