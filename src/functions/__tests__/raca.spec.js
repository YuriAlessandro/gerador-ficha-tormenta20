import AGGELUS from '../../data/racasDetalhado/aggelus';
import HUMANO from '../../data/racasDetalhado/humano';
import {
  getClassDetailsModifiedByRace,
  modifyAttributesBasedOnRace,
  getModValues,
} from '../general';

const originalAttrs = [
  { name: 'Força', value: 17, mod: 3 },
  { name: 'Constituição', value: 12, mod: 1 },
  { name: 'Inteligência', value: 12, mod: 1 },
  { name: 'Destreza', value: 10, mod: 0 },
  { name: 'Carisma', value: 12, mod: 1 },
  { name: 'Sabedoria', value: 13, mod: 1 },
];

const classDetails = { pv: 26, pm: 3, defesa: 12, pericias: [] };

describe('Testa modificações da raça Aggelus', () => {
  test('Se o Aggelus não modifica detalhes da classe ', () => {
    const received = getClassDetailsModifiedByRace(classDetails, AGGELUS);
    expect(received).toEqual(classDetails);
  });

  test('Se o Aggelus altera corretamente os atributos', () => {
    const attrNotChanged = [
      { name: 'Força', value: 17, mod: 3 },
      { name: 'Constituição', value: 12, mod: 1 },
      { name: 'Inteligência', value: 12, mod: 1 },
    ];
    const expectedAttrs = [
      ...attrNotChanged,
      { name: 'Destreza', value: 14, mod: 2 },
      { name: 'Carisma', value: 14, mod: 2 },
      { name: 'Sabedoria', value: 17, mod: 3 },
    ];

    const received = modifyAttributesBasedOnRace(AGGELUS, originalAttrs);

    expect(received).toEqual(expectedAttrs);
  });
});

function countAttrWithPlusTwo(attributes) {
  return attributes.reduce((acc, attr) => {
    const original = originalAttrs.find((item) => item.name === attr.name);
    return attr.value === original.value + 2 ? acc + 1 : acc;
  }, 0);
}

describe('Testa modificações da raça Humano', () => {
  Array(10)
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
        const qtdOfAttrWithPlusTwo = countAttrWithPlusTwo(received);

        expect(qtdOfAttrWithPlusTwo).toBe(3);

        received.forEach((attribute) => {
          const expected = getModValues(attribute.value);
          expect(attribute.mod).toBe(expected);
        });
      });
    });
});
