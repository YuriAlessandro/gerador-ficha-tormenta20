import _, { find } from 'lodash';
import { applyRaceHabilities } from '../../../functions/general';
import { CharacterStats } from '../../../interfaces/Race';
import { Spell } from '../../../interfaces/Spells';
import { spellsCircle1, spellsCircle1Names } from '../../magias/generalSpells';
import DAHLLAN, { PLANTS_FRIEND_MANA_REDUCTION } from '../dahllan';
import { druida } from '../__mocks__/druida';
import { inventor } from '../__mocks__/inventor';

function getManaReduction({ manaReduction = 0 }: Spell) {
  return manaReduction;
}

describe('Testa habilidades da raça Dahllan', () => {
  const findControlPlants = (spell: Spell) =>
    spell.nome === spellsCircle1[spellsCircle1Names.controlarPlantas].nome;

  test('Amiga das plantas: ganha Controlar Plantas', () => {
    const stats: CharacterStats = _.cloneDeep(inventor);
    const received = applyRaceHabilities(DAHLLAN, stats);
    expect(received.spells.some(findControlPlants)).toBe(true);
  });
  test('Amiga das Plantas: se já tiver Controlar Plantas, diminui o custo em -1 PM', () => {
    const stats: CharacterStats = _.cloneDeep(druida);
    const received = applyRaceHabilities(DAHLLAN, stats);

    const oldControlPlants = stats.spells.find(findControlPlants);
    const controlPlants = received.spells.find(findControlPlants);

    if (oldControlPlants && controlPlants) {
      const oldManaReduction = getManaReduction(oldControlPlants);
      const manaReduction = getManaReduction(controlPlants);

      if (oldManaReduction < manaReduction)
        expect(manaReduction).toBe(PLANTS_FRIEND_MANA_REDUCTION);
    } else {
      fail('Magia não encontrada');
    }
  });
});
