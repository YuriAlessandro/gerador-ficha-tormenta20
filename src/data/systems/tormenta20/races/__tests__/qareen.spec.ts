import _, { cloneDeep, differenceBy } from 'lodash';
import { applyRaceAbilities } from '../../../../../functions/general';
import { druida } from '../../../../../__mocks__/classes/druida';
import { inventor } from '../../../../../__mocks__/classes/inventor';
import { Atributo } from '../../atributos';
import { spellsCircle1 } from '../../magias/generalSpells';
import QAREEN from '../qareen';

describe('Testa habilidades da raça Qareen', () => {
  const sheet = _.cloneDeep(inventor(QAREEN));
  const received = applyRaceAbilities(sheet);

  test('Tatuagem Mística: deve aprender uma magia aleatória', () => {
    expect(received.spells).toHaveLength(sheet.spells.length + 1);
  });

  test('Tatuagem Mística: magia aprendida com atributo-chave Carisma ou aplicar redução de mana', () => {
    const sheetWithSpell = cloneDeep(druida(QAREEN));
    const { spells } = applyRaceAbilities(sheetWithSpell);
    const [addedSpell] = differenceBy(spells, sheetWithSpell.spells, 'nome');
    if (addedSpell) {
      expect(addedSpell.customKeyAttr).toBe(Atributo.CARISMA);
    } else {
      const existingSpell = spells.find(
        (element) => element.nome === spellsCircle1.controlarPlantas.nome
      );

      if (existingSpell) {
        expect(existingSpell.manaReduction).toBeGreaterThan(0);
      } else {
        throw new Error('Magia não encontrada no array.');
      }
    }
  });
});
