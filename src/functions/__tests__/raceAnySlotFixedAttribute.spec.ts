/**
 * "+1 em OUTRO atributo": o slot livre não pode repetir o atributo fixo da
 * raça. Das 51 raças, só o Meio-Orc tem essa redação ("Força +2, +1 em outro
 * atributo (exceto Carisma)", Ameaças de Arton, p. 31). Raças que dizem só
 * "+1 em um atributo" / "+1 em dois atributos" (Galokk, Meio-Elfo, Minauro,
 * Moreau, Golem Desperto) ficam como estão.
 */
import { describe, it, expect } from 'vitest';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import {
  getAnySlotExcludedAttributes,
  getEffectiveRaceAttrs,
  modifyAttributesBasedOnRace,
} from '../general';
import { applyOpenRace } from '../../premium/functions/openRaces';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import Race from '../../interfaces/Race';

const ALL_SUPPLEMENTS = Object.values(SupplementId);

const race = (name: string): Race => {
  const found = dataRegistry.getRaceByName(name, ALL_SUPPLEMENTS);
  if (!found) throw new Error(`${name} não encontrada`);
  return found;
};

const exclusions = (r: Race) =>
  getAnySlotExcludedAttributes(r, getEffectiveRaceAttrs(r));

describe('slot livre de raça com "outro atributo"', () => {
  it('só o Meio-Orc declara o atributo fixo fora do slot livre', () => {
    const declared = dataRegistry
      .getRacesBySupplements(ALL_SUPPLEMENTS)
      .filter((r) => r.attributes.excludeFixedFromAny)
      .map((r) => r.name);
    expect(declared).toEqual(['Meio-Orc']);
  });

  it('Meio-Orc: Força fica fora das opções do +1', () => {
    expect(exclusions(race('Meio-Orc'))).toContain(Atributo.FORCA);
  });

  it('Meio-Orc: a escolha manual de Força (assistente) não vira Força +3', () => {
    const meioOrc = race('Meio-Orc');
    const { atributos } = createMockCharacterSheet();
    const forcaRolada = atributos[Atributo.FORCA].value;

    const result = modifyAttributesBasedOnRace(
      meioOrc,
      atributos,
      [],
      [],
      [Atributo.FORCA]
    );

    expect(result[Atributo.FORCA].value).toBe(forcaRolada + 2);
    const total = (attrs: typeof atributos) =>
      Object.values(attrs).reduce((sum, attr) => sum + attr.value, 0);
    // O +1 continua existindo, só que em outro atributo.
    expect(total(result)).toBe(total(atributos) + 3);
  });

  it.each([
    ['Lefou', Atributo.CARISMA],
    ['Osteon', Atributo.CONSTITUICAO],
  ])(
    '%s: escolha manual em %s (excludeFromAny) cai no sorteio',
    (name, proibido) => {
      const r = race(name);
      const { atributos } = createMockCharacterSheet();
      const result = modifyAttributesBasedOnRace(
        r,
        atributos,
        [],
        [],
        [proibido, Atributo.FORCA, Atributo.DESTREZA]
      );
      // Só o modificador negativo fixo da raça (–1) toca o atributo proibido.
      expect(result[proibido].value).toBe(atributos[proibido].value - 1);
    }
  );

  it('Galokk: escolha manual válida continua sendo respeitada', () => {
    const galokk = race('Galokk');
    const { atributos } = createMockCharacterSheet();
    const result = modifyAttributesBasedOnRace(
      galokk,
      atributos,
      [],
      [],
      [Atributo.SABEDORIA]
    );
    expect(result[Atributo.SABEDORIA].value).toBe(
      atributos[Atributo.SABEDORIA].value + 1
    );
  });

  it.each(['Galokk', 'Meio-Elfo', 'Minauro'])(
    '%s ("+1 em um/dois atributos", sem "outro") não ganha trava nova',
    (name) => {
      const r = race(name);
      const fixed = getEffectiveRaceAttrs(r)
        .filter((attr) => attr.attr !== 'any' && attr.mod > 0)
        .map((attr) => attr.attr);
      expect(fixed.length).toBeGreaterThan(0);
      fixed.forEach((attr) => {
        expect(exclusions(r)).not.toContain(attr);
      });
    }
  );

  it('Raças Abertas (Heróis p. 281) continua sem trava no Meio-Orc', () => {
    const meioOrc = race('Meio-Orc');
    const open = applyOpenRace(meioOrc, getEffectiveRaceAttrs(meioOrc));
    expect(exclusions(open)).toEqual([]);
  });
});
