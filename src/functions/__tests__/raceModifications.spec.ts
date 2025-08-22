import AGGELUS from '../../data/races/aggelus';
import HUMANO from '../../data/races/humano';
import { modifyAttributesBasedOnRace, getModValue } from '../general';
import {
  CharacterAttribute,
  CharacterAttributes,
} from '../../interfaces/Character';
import { Atributo } from '../../data/atributos';

const originalAttrs: CharacterAttributes = {
  Força: { value: 17, mod: 3, name: Atributo.FORCA },
  Carisma: { name: Atributo.CARISMA, value: 12, mod: 1 },
  Inteligência: { name: Atributo.INTELIGENCIA, value: 12, mod: 1 },
  Constituição: { name: Atributo.CONSTITUICAO, value: 12, mod: 1 },
  Destreza: { name: Atributo.DESTREZA, value: 10, mod: 0 },
  Sabedoria: { name: Atributo.SABEDORIA, value: 13, mod: 1 },
};

describe('Testa modificações da raça Aggelus', () => {
  test('Se o Aggelus altera corretamente os atributos', () => {
    const attrNotChanged = {
      Força: { name: Atributo.FORCA, value: 17, mod: 3 },
      Constituição: { name: Atributo.CONSTITUICAO, value: 12, mod: 1 },
      Inteligência: { name: Atributo.INTELIGENCIA, value: 12, mod: 1 },
      Destreza: { name: Atributo.DESTREZA, value: 10, mod: 0 },
    };

    const expectedAttrs = {
      ...attrNotChanged,
      Carisma: { name: Atributo.CARISMA, value: 12, mod: 2 },
      Sabedoria: { name: Atributo.SABEDORIA, value: 13, mod: 3 },
    };

    const received = modifyAttributesBasedOnRace(
      AGGELUS,
      originalAttrs,
      [],
      []
    );

    expect(received).toEqual(expectedAttrs);
  });
});

function countAttrWithPlusOne(attributes: CharacterAttribute[]) {
  return attributes.reduce((acc, attr) => {
    const original = originalAttrs[attr.name];
    return attr.mod === original.mod + 1 ? acc + 1 : acc;
  }, 0);
}

describe('Testa modificações da raça Humano', () => {
  Array(1)
    .fill(0)
    .forEach(() => {
      test('Se o Humano recebe +1 em 3 atributos diferentes', () => {
        const received = modifyAttributesBasedOnRace(
          HUMANO,
          originalAttrs,
          [],
          []
        );
        const qtdOfAttrWithPlusOne = countAttrWithPlusOne(
          Object.values(received)
        );

        expect(qtdOfAttrWithPlusOne).toBe(3);
      });
    });
});
