import { modifyAttributesBasedOnRace } from '../../../../../../functions/general';
import {
  CharacterAttribute,
  CharacterAttributes,
} from '../../../../../../interfaces/Character';
import { Atributo } from '../../../atributos';
import KALLYANACH from '../kallyanach';

const originalAttrs: CharacterAttributes = {
  Força: { value: 17, mod: 3, name: Atributo.FORCA },
  Carisma: { name: Atributo.CARISMA, value: 12, mod: 1 },
  Inteligência: { name: Atributo.INTELIGENCIA, value: 12, mod: 1 },
  Constituição: { name: Atributo.CONSTITUICAO, value: 12, mod: 1 },
  Destreza: { name: Atributo.DESTREZA, value: 10, mod: 0 },
  Sabedoria: { name: Atributo.SABEDORIA, value: 13, mod: 1 },
};

function countAttrWithBonus(
  attributes: CharacterAttribute[],
  bonus: number
): number {
  return attributes.reduce((acc, attr) => {
    const original = originalAttrs[attr.name];
    return attr.mod === original.mod + bonus ? acc + 1 : acc;
  }, 0);
}

describe('Testa modificações da raça Kallyanach com setup aleatório', () => {
  test('Kallyanach deve escolher aleatoriamente entre +2 em 1 atributo OU +1 em 2 atributos', () => {
    let foundPlusTwo = false;
    let foundPlusOnePlusOne = false;

    // Testa 100 vezes para garantir que ambas variantes aparecem
    Array(100)
      .fill(0)
      .forEach(() => {
        // Setup é chamado pelo dataRegistry, então precisamos simular isso
        const setupRace = KALLYANACH.setup
          ? KALLYANACH.setup(KALLYANACH, [])
          : KALLYANACH;

        const received = modifyAttributesBasedOnRace(
          setupRace,
          originalAttrs,
          [],
          []
        );

        const qtdOfAttrWithPlusTwo = countAttrWithBonus(
          Object.values(received),
          2
        );
        const qtdOfAttrWithPlusOne = countAttrWithBonus(
          Object.values(received),
          1
        );

        // Deve ser uma das duas opções válidas
        if (qtdOfAttrWithPlusTwo === 1 && qtdOfAttrWithPlusOne === 0) {
          foundPlusTwo = true;
        } else if (qtdOfAttrWithPlusTwo === 0 && qtdOfAttrWithPlusOne === 2) {
          foundPlusOnePlusOne = true;
        } else {
          // Falha se não for nenhuma das opções válidas
          throw new Error(
            `Invalid attribute distribution: +2 count=${qtdOfAttrWithPlusTwo}, +1 count=${qtdOfAttrWithPlusOne}`
          );
        }
      });

    // Verifica que ambas variantes apareceram pelo menos uma vez
    expect(foundPlusTwo).toBe(true);
    expect(foundPlusOnePlusOne).toBe(true);
  });
});

describe('Testa que Kallyanach possui as habilidades corretas', () => {
  test('Kallyanach deve ter exatamente 3 habilidades', () => {
    expect(KALLYANACH.abilities).toHaveLength(3);

    const abilityNames = KALLYANACH.abilities.map((a) => a.name);

    expect(abilityNames).toContain('Herança Dracônica');
    expect(abilityNames).toContain('Armamento Kallyanach');
    expect(abilityNames).toContain('Bênção de Kallyadranoch');
  });

  test('Kallyanach deve ter o nome correto', () => {
    expect(KALLYANACH.name).toBe('Kallyanach');
  });

  test('Kallyanach deve ter a função setup definida', () => {
    expect(KALLYANACH.setup).toBeDefined();
    expect(typeof KALLYANACH.setup).toBe('function');
  });
});
