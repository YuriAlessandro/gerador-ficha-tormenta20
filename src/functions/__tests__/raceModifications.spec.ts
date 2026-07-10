import AGGELUS from '../../data/systems/tormenta20/races/aggelus';
import HUMANO from '../../data/systems/tormenta20/races/humano';
import NAGAH from '../../data/systems/tormenta20/ameacas-de-arton/races/nagah';
import {
  modifyAttributesBasedOnRace,
  resolveSexForAttributes,
} from '../general';
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

describe('Testa modificações da raça Nagah (dimorfismo sexual)', () => {
  test('Se a Nagah masculina recebe +1 em FOR/DES/CON', () => {
    const received = modifyAttributesBasedOnRace(
      NAGAH,
      originalAttrs,
      [],
      [],
      undefined,
      'Masculino'
    );

    expect(received).toEqual({
      ...originalAttrs,
      Força: { name: Atributo.FORCA, value: 4 },
      Destreza: { name: Atributo.DESTREZA, value: 1 },
      Constituição: { name: Atributo.CONSTITUICAO, value: 2 },
    });
  });

  test('Se a Nagah feminina recebe +1 em INT/SAB/CAR', () => {
    const received = modifyAttributesBasedOnRace(
      NAGAH,
      originalAttrs,
      [],
      [],
      undefined,
      'Feminino'
    );

    expect(received).toEqual({
      ...originalAttrs,
      Inteligência: { name: Atributo.INTELIGENCIA, value: 2 },
      Sabedoria: { name: Atributo.SABEDORIA, value: 2 },
      Carisma: { name: Atributo.CARISMA, value: 2 },
    });
  });

  test('Se a Nagah sem sexo definido usa o conjunto default (FOR/DES/CON)', () => {
    const received = modifyAttributesBasedOnRace(NAGAH, originalAttrs, [], []);

    expect(received).toEqual({
      ...originalAttrs,
      Força: { name: Atributo.FORCA, value: 4 },
      Destreza: { name: Atributo.DESTREZA, value: 1 },
      Constituição: { name: Atributo.CONSTITUICAO, value: 2 },
    });
  });
});

describe('Testa resolveSexForAttributes', () => {
  test('Gêneros binários resolvem para si mesmos', () => {
    expect(resolveSexForAttributes('Masculino')).toBe('Masculino');
    expect(resolveSexForAttributes('Feminino', 'Masculino')).toBe('Feminino');
  });

  test("Gênero 'Outro' resolve para a escolha de dimorfismo", () => {
    expect(resolveSexForAttributes('Outro', 'Feminino')).toBe('Feminino');
    expect(resolveSexForAttributes('Outro', 'Masculino')).toBe('Masculino');
    expect(resolveSexForAttributes('Outro')).toBeUndefined();
  });

  test('Gênero ausente resolve para undefined', () => {
    expect(resolveSexForAttributes(undefined, 'Feminino')).toBeUndefined();
    expect(resolveSexForAttributes('')).toBeUndefined();
  });
});
