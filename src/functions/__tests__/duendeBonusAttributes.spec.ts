import generateRandomSheet from '../general';
import { SupplementId } from '../../types/supplement.types';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import {
  DUENDE_NATURES,
  DUENDE_SIZES,
} from '../../data/systems/tormenta20/herois-de-arton/races/duende-config';

/**
 * Regressão: fichas de Duende não podiam ser salvas no editor porque os Dons
 * escolhidos nunca eram persistidos (o botão Salvar ficava permanentemente
 * desabilitado). A geração agora grava `duendeBonusAttributes` na ficha, e a
 * soma dos atributos da raça deve continuar coerente com Dons + natureza +
 * tamanho (sem drift).
 */
describe('Duende: Dons persistidos e coerência de atributos', () => {
  const supplements = [
    SupplementId.TORMENTA20_CORE,
    SupplementId.TORMENTA20_HEROIS_ARTON,
  ];

  const generateDuende = () =>
    generateRandomSheet({
      nivel: 1,
      raca: 'Duende',
      classe: 'Guerreiro',
      origin: '',
      devocao: { label: '', value: '' },
      supplements,
    });

  it('persiste dois Dons distintos em duendeBonusAttributes', () => {
    for (let i = 0; i < 25; i += 1) {
      const sheet = generateDuende();
      expect(sheet.raca.name).toBe('Duende');
      const dons = sheet.duendeBonusAttributes;
      expect(dons).toBeDefined();
      expect((dons?.length ?? 0) >= 2).toBe(true);
      // Os dois primeiros Dons são sempre atributos diferentes
      expect(dons?.[0]).not.toBe(dons?.[1]);
      dons?.forEach((d) => {
        expect(Object.values(Atributo)).toContain(d);
      });
    }
  });

  it('atributos da raça = Dons + natureza + tamanho (sem drift)', () => {
    for (let i = 0; i < 25; i += 1) {
      const sheet = generateDuende();
      const dons = sheet.duendeBonusAttributes ?? [];
      const natureId = sheet.duendeNature ?? sheet.raca.nature;
      const isAnimal = natureId
        ? Boolean(DUENDE_NATURES[natureId]?.extraAttribute)
        : false;

      // Soma esperada: +1 por cada um dos 2 Dons, +1 do 3º (natureza Animal),
      // e os modificadores de tamanho.
      const expected = new Map<Atributo, number>();
      const add = (attr: Atributo, mod: number) =>
        expected.set(attr, (expected.get(attr) ?? 0) + mod);

      dons.slice(0, 2).forEach((d) => add(d, 1));
      if (isAnimal && dons[2]) add(dons[2], 1);

      const sizeId = sheet.raceSizeCategory;
      const sizeMods = sizeId
        ? DUENDE_SIZES[sizeId]?.attributeModifiers ?? []
        : [];
      sizeMods.forEach((m) => {
        if (m.attr !== 'any') add(m.attr, m.mod);
      });

      // Soma real das entradas concretas (não-'any') da raça
      const actual = new Map<Atributo, number>();
      sheet.raca.attributes.attrs.forEach((a) => {
        if (a.attr !== 'any') {
          actual.set(a.attr, (actual.get(a.attr) ?? 0) + a.mod);
        }
      });

      // Compara apenas entradas com valor != 0 dos dois lados
      const keys = new Set<Atributo>([...expected.keys(), ...actual.keys()]);
      keys.forEach((k) => {
        expect(actual.get(k) ?? 0).toBe(expected.get(k) ?? 0);
      });
    }
  });
});
