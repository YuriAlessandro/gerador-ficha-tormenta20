import AGGELUS from '../../data/races/aggelus';
import HUMANO from '../../data/races/humano';
import {
  getClassDetailsModifiedByRace,
  modifyAttributesBasedOnRace,
  getModValue,
} from '../general';
import {
  CharacterAttribute,
  CharacterAttributes,
} from '../../interfaces/CharacterSheet';
import { Atributo } from '../../data/atributos';

const originalAttrs: CharacterAttributes = {
  Força: { value: 17, mod: 3, name: Atributo.FORCA },
  Carisma: { name: Atributo.CARISMA, value: 12, mod: 1 },
  Inteligência: { name: Atributo.INTELIGENCIA, value: 12, mod: 1 },
  Constituição: { name: Atributo.CONSTITUICAO, value: 12, mod: 1 },
  Destreza: { name: Atributo.DESTREZA, value: 10, mod: 0 },
  Sabedoria: { name: Atributo.SABEDORIA, value: 13, mod: 1 },
};

const classDetails = { pv: 26, pm: 3, defesa: 12, pericias: [] };

describe('Testa modificações da raça Aggelus', () => {
  test('Se o Aggelus não modifica detalhes da classe ', () => {
    const received = getClassDetailsModifiedByRace(classDetails, AGGELUS);
    expect(received).toEqual(classDetails);
  });

  test('Se o Aggelus altera corretamente os atributos', () => {
    const attrNotChanged = {
      Força: { name: Atributo.FORCA, value: 17, mod: 3 },
      Constituição: { name: Atributo.CONSTITUICAO, value: 12, mod: 1 },
      Inteligência: { name: Atributo.INTELIGENCIA, value: 12, mod: 1 },
    };

    const expectedAttrs = {
      ...attrNotChanged,
      Destreza: { name: Atributo.DESTREZA, value: 14, mod: 2 },
      Carisma: { name: Atributo.CARISMA, value: 14, mod: 2 },
      Sabedoria: { name: Atributo.SABEDORIA, value: 17, mod: 3 },
    };

    const received = modifyAttributesBasedOnRace(AGGELUS, originalAttrs);

    expect(received).toEqual(expectedAttrs);
  });
});

function countAttrWithPlusTwo(attributes: CharacterAttribute[]) {
  return attributes.reduce((acc, attr) => {
    const original = originalAttrs[attr.name];
    return attr.value === original.value + 2 ? acc + 1 : acc;
  }, 0);
}

describe('Testa modificações da raça Humano', () => {
  Array(1)
    .fill(0)
    .forEach(() => {
      test('Se o Humano tem recebe duas perícias diferentes', () => {
        const received = getClassDetailsModifiedByRace(classDetails, HUMANO);

        const {
          pericias: [periciaA, periciaB],
        } = received;

        expect(received.pericias).toHaveLength(2);
        expect(periciaA).not.toBe(periciaB);
      });

      test('Se o Humano recebe +2 em 3 atributos diferentes', () => {
        const received = modifyAttributesBasedOnRace(HUMANO, originalAttrs);
        const qtdOfAttrWithPlusTwo = countAttrWithPlusTwo(
          Object.values(received)
        );

        expect(qtdOfAttrWithPlusTwo).toBe(3);

        Object.values(received).forEach((attribute) => {
          const expected = getModValue(attribute.value);
          expect(attribute.mod).toBe(expected);
        });
      });
    });
});
