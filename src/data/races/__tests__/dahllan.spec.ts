import _ from 'lodash';
import { applyRaceAbilities } from '../../../functions/general';
import { Spell } from '../../../interfaces/Spells';
import { spellsCircle1, spellsCircle1Names } from '../../magias/generalSpells';
import DAHLLAN, { PLANTS_FRIEND_MANA_REDUCTION } from '../dahllan';
import { druida } from '../../../__mocks__/classes/druida';
import { inventor } from '../../../__mocks__/classes/inventor';

function getManaReduction({ manaReduction = 0 }: Spell) {
  return manaReduction;
}

describe('Testa habilidades da raça Dahllan', () => {
  const findControlPlants = (spell: Spell) =>
    spell.nome === spellsCircle1[spellsCircle1Names.controlarPlantas].nome;

  test('Amiga das plantas: ganha Controlar Plantas', () => {
    const sheet = _.cloneDeep(inventor(DAHLLAN));
    const received = applyRaceHabilities(sheet);
    expect(received.spells.some(findControlPlants)).toBe(true);
  });
  test('Amiga das Plantas: se já tiver Controlar Plantas, diminui o custo em -1 PM', () => {
    const sheet = _.cloneDeep(druida(DAHLLAN));
    const received = applyRaceHabilities(sheet);

    const oldControlPlants = sheet.spells.find(findControlPlants);
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
