import { describe, test, expect } from 'vitest';
import {
  generateEmptySheet,
  modifyAttributesBasedOnRace,
  rollAttributeVariant,
} from '../../../../../../functions/general';
import {
  CharacterAttribute,
  CharacterAttributes,
} from '../../../../../../interfaces/Character';
import SelectedOptions from '../../../../../../interfaces/SelectedOptions';
import { WizardSelections } from '../../../../../../interfaces/WizardSelections';
import { SupplementId } from '../../../../../../types/supplement.types';
import { Atributo } from '../../../atributos';
import KALLYANACH from '../kallyanach';

const originalAttrs: CharacterAttributes = {
  Força: { value: 3, name: Atributo.FORCA },
  Carisma: { name: Atributo.CARISMA, value: 1 },
  Inteligência: { name: Atributo.INTELIGENCIA, value: 1 },
  Constituição: { name: Atributo.CONSTITUICAO, value: 1 },
  Destreza: { name: Atributo.DESTREZA, value: 0 },
  Sabedoria: { name: Atributo.SABEDORIA, value: 1 },
};

function countAttrWithBonus(
  attributes: CharacterAttribute[],
  bonus: number
): number {
  return attributes.reduce((acc, attr) => {
    const original = originalAttrs[attr.name];
    return attr.value === original.value + bonus ? acc + 1 : acc;
  }, 0);
}

describe('Testa as variantes de atributos do Kallyanach', () => {
  test('Kallyanach oferece +2 em 1 atributo OU +1 em 2 atributos', () => {
    expect(KALLYANACH.attributeVariants).toHaveLength(2);

    const [plusTwo, plusOneTwice] = KALLYANACH.attributeVariants ?? [];

    expect(plusTwo.attrs).toEqual([{ attr: 'any', mod: 2 }]);
    expect(plusOneTwice.attrs).toEqual([
      { attr: 'any', mod: 1 },
      { attr: 'any', mod: 1 },
    ]);
  });

  test('os atributos padrão do catálogo equivalem à primeira variante', () => {
    // O fallback é usado quando nenhuma variante foi escolhida/sorteada
    expect(KALLYANACH.attributes.attrs).toEqual(
      KALLYANACH.attributeVariants?.[0].attrs
    );
  });

  test('rollAttributeVariant sorteia entre as duas distribuições válidas', () => {
    let foundPlusTwo = false;
    let foundPlusOnePlusOne = false;

    // Testa 100 vezes para garantir que ambas variantes aparecem
    Array(100)
      .fill(0)
      .forEach(() => {
        const { race, variant } = rollAttributeVariant(KALLYANACH);

        expect(variant).toBeDefined();
        expect(race.attributes.attrs).toEqual(variant?.attrs);

        const received = modifyAttributesBasedOnRace(
          race,
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

  test('rollAttributeVariant não mexe em raças sem variantes', () => {
    const semVariantes = { ...KALLYANACH, attributeVariants: undefined };
    const { race, variant } = rollAttributeVariant(semVariantes);

    expect(variant).toBeUndefined();
    expect(race).toBe(semVariantes);
  });
});

describe('Testa a variante escolhida no assistente (Kallyanach)', () => {
  const BASE_OPTIONS: SelectedOptions = {
    nivel: 1,
    raca: 'Kallyanach',
    classe: 'Guerreiro',
    origin: '',
    devocao: { label: '--', value: '--' },
    supplements: [
      SupplementId.TORMENTA20_CORE,
      SupplementId.TORMENTA20_AMEACAS_ARTON,
    ],
  };

  function buildSheet(variantIndex: number, chosen: Atributo[]) {
    const wizSel: WizardSelections = {
      attributeVariant: KALLYANACH.attributeVariants?.[variantIndex],
      raceAttributes: chosen,
      baseAttributes: {
        [Atributo.FORCA]: 0,
        [Atributo.DESTREZA]: 0,
        [Atributo.CONSTITUICAO]: 0,
        [Atributo.INTELIGENCIA]: 0,
        [Atributo.SABEDORIA]: 0,
        [Atributo.CARISMA]: 0,
      },
    };
    return generateEmptySheet(BASE_OPTIONS, wizSel);
  }

  test('"+2 em 1 atributo" aplica +2 no atributo escolhido', () => {
    const sheet = buildSheet(0, [Atributo.FORCA]);

    expect(sheet.atributos[Atributo.FORCA].value).toBe(2);
    expect(sheet.atributos[Atributo.DESTREZA].value).toBe(0);
    expect(sheet.selectedAttributeVariant?.label).toBe('+2 em 1 atributo');
    expect(sheet.raca.attributes.attrs).toEqual([{ attr: 'any', mod: 2 }]);
  });

  test('"+1 em 2 atributos" aplica +1 em cada atributo escolhido', () => {
    const sheet = buildSheet(1, [Atributo.FORCA, Atributo.DESTREZA]);

    expect(sheet.atributos[Atributo.FORCA].value).toBe(1);
    expect(sheet.atributos[Atributo.DESTREZA].value).toBe(1);
    expect(sheet.atributos[Atributo.CONSTITUICAO].value).toBe(0);
    expect(sheet.selectedAttributeVariant?.label).toBe('+1 em 2 atributos');
  });
});

describe('Testa que Kallyanach possui as habilidades corretas', () => {
  test('Kallyanach deve ter exatamente 2 habilidades', () => {
    expect(KALLYANACH.abilities).toHaveLength(2);

    const abilityNames = KALLYANACH.abilities.map((a) => a.name);

    expect(abilityNames).toContain('Herança Dracônica');
    expect(abilityNames).toContain('Bênção de Kallyadranoch');
  });

  test('Kallyanach deve ter o nome correto', () => {
    expect(KALLYANACH.name).toBe('Kallyanach');
  });
});
