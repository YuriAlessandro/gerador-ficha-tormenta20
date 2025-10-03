import { modifyAttributesBasedOnRace } from '../../../../../../functions/general';
import {
  CharacterAttribute,
  CharacterAttributes,
} from '../../../../../../interfaces/Character';
import { Atributo } from '../../../atributos';
import KALLYANACH_PLUS1 from '../kallyanach-plus1';
import KALLYANACH_PLUS2 from '../kallyanach-plus2';

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

describe('Testa modificações da raça Kallyanach (variante +2)', () => {
  test('Kallyanach (+2) deve receber +2 em exatamente 1 atributo', () => {
    // Testa 50 vezes para garantir aleatoriedade
    Array(50)
      .fill(0)
      .forEach(() => {
        const received = modifyAttributesBasedOnRace(
          KALLYANACH_PLUS2,
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

        // Deve ter exatamente 1 atributo com +2
        expect(qtdOfAttrWithPlusTwo).toBe(1);
        // Não deve ter nenhum atributo com +1
        expect(qtdOfAttrWithPlusOne).toBe(0);
      });
  });
});

describe('Testa modificações da raça Kallyanach (variante +1/+1)', () => {
  test('Kallyanach (+1/+1) deve receber +1 em exatamente 2 atributos diferentes', () => {
    // Testa 50 vezes para garantir aleatoriedade
    Array(50)
      .fill(0)
      .forEach(() => {
        const received = modifyAttributesBasedOnRace(
          KALLYANACH_PLUS1,
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

        // Deve ter exatamente 2 atributos com +1
        expect(qtdOfAttrWithPlusOne).toBe(2);
        // Não deve ter nenhum atributo com +2
        expect(qtdOfAttrWithPlusTwo).toBe(0);
      });
  });
});

describe('Testa que ambas variantes compartilham as mesmas habilidades', () => {
  test('Kallyanach (+2) e (+1/+1) devem ter as mesmas 3 habilidades', () => {
    expect(KALLYANACH_PLUS2.abilities).toHaveLength(3);
    expect(KALLYANACH_PLUS1.abilities).toHaveLength(3);

    // Verifica os nomes das habilidades
    const plus2AbilityNames = KALLYANACH_PLUS2.abilities.map((a) => a.name);
    const plus1AbilityNames = KALLYANACH_PLUS1.abilities.map((a) => a.name);

    expect(plus2AbilityNames).toContain('Herança Dracônica');
    expect(plus2AbilityNames).toContain('Armamento Kallyanach');
    expect(plus2AbilityNames).toContain('Bênção de Kallyadranoch');

    expect(plus1AbilityNames).toContain('Herança Dracônica');
    expect(plus1AbilityNames).toContain('Armamento Kallyanach');
    expect(plus1AbilityNames).toContain('Bênção de Kallyadranoch');
  });

  test('Ambas variantes devem ter o mesmo nome de raça', () => {
    expect(KALLYANACH_PLUS2.name).toBe('Kallyanach');
    expect(KALLYANACH_PLUS1.name).toBe('Kallyanach');
  });
});
