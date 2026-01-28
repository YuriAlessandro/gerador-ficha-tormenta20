import AGGELUS from '../../data/systems/tormenta20/races/aggelus';
import HUMANO from '../../data/systems/tormenta20/races/humano';
import { modifyAttributesBasedOnRace } from '../general';
import {
  CharacterAttribute,
  CharacterAttributes,
} from '../../interfaces/Character';
import { Atributo } from '../../data/systems/tormenta20/atributos';

const originalAttrs: CharacterAttributes = {
  Força: { value: 3, name: Atributo.FORCA },
  Carisma: { name: Atributo.CARISMA, value: 1 },
  Inteligência: { name: Atributo.INTELIGENCIA, value: 1 },
  Constituição: { name: Atributo.CONSTITUICAO, value: 1 },
  Destreza: { name: Atributo.DESTREZA, value: 0 },
  Sabedoria: { name: Atributo.SABEDORIA, value: 1 },
};

describe('Testa modificações da raça Aggelus', () => {
  test('Se o Aggelus altera corretamente os atributos', () => {
    const attrNotChanged = {
      Força: { name: Atributo.FORCA, value: 3 },
      Constituição: { name: Atributo.CONSTITUICAO, value: 1 },
      Inteligência: { name: Atributo.INTELIGENCIA, value: 1 },
      Destreza: { name: Atributo.DESTREZA, value: 0 },
    };

    const expectedAttrs = {
      ...attrNotChanged,
      Carisma: { name: Atributo.CARISMA, value: 2 },
      Sabedoria: { name: Atributo.SABEDORIA, value: 3 },
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
    return attr.value === original.value + 1 ? acc + 1 : acc;
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
