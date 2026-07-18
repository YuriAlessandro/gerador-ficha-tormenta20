import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';
import { GeneralPowerType, RequirementType } from '../../interfaces/Poderes';
import DEUSES_MENORES_DIVINDADES from '../../data/systems/tormenta20/deuses-menores/divindades';
import GRANTED_POWERS from '../../data/systems/tormenta20/powers/grantedPowers';
import DEUSES_ARTON_POWERS from '../../data/systems/tormenta20/deuses-de-arton/powers';

/**
 * Cobre o suplemento Guia de Deuses Menores: o gate por suplemento (as 63
 * divindades só existem com ele ativo), o vínculo deus↔poder concedido e a
 * ausência de colisão de nomes com os poderes concedidos já existentes.
 */
describe('Guia de Deuses Menores', () => {
  const WITH = [
    SupplementId.TORMENTA20_CORE,
    SupplementId.TORMENTA20_DEUSES_MENORES,
  ];
  const WITHOUT = [SupplementId.TORMENTA20_CORE];

  it('traz 63 divindades, cada uma com um único poder concedido', () => {
    expect(DEUSES_MENORES_DIVINDADES).toHaveLength(63);
    DEUSES_MENORES_DIVINDADES.forEach((deity) => {
      expect(deity.poderes).toHaveLength(1);
      expect(deity.statusDivino).toBeGreaterThanOrEqual(1);
      expect(deity.statusDivino).toBeLessThanOrEqual(5);
    });
  });

  /**
   * A extração do PDF errou o nome de 3 deuses e o status divino de 6. Os
   * valores abaixo foram conferidos no livro e travados aqui porque o CSV de
   * origem não é versionado: sem esta guarda, uma regeração reintroduziria os
   * erros silenciosamente — e o status alimenta o bônus de PM e o círculo
   * máximo de magia.
   */
  it('mantém as correções feitas sobre a extração do PDF', () => {
    const byName = new Map(
      DEUSES_MENORES_DIVINDADES.map((d) => [d.name, d.statusDivino])
    );

    // Nomes corrigidos — as grafias antigas não podem voltar.
    expect(byName.has('Garanaam')).toBe(true);
    expect(byName.has('Garth')).toBe(true);
    expect(byName.has('Hippion')).toBe(true);
    ['Garanaan', 'Gath', 'Hippinos'].forEach((wrong) => {
      expect(byName.has(wrong)).toBe(false);
    });

    // Status corrigidos — todos vieram como 4 na extração.
    expect(byName.get('Beluhga')).toBe(3);
    expect(byName.get('Goharom')).toBe(2);
    expect(byName.get('Granto')).toBe(2);
    expect(byName.get('Klangor')).toBe(2);
    expect(byName.get('Zakharov')).toBe(2);
    expect(byName.get('Hippion')).toBe(3);

    // Os três vindos do Deuses de Arton seguem no suplemento.
    expect(byName.get('Gwendolynn')).toBe(3);
    expect(byName.get('Mauziell')).toBe(4);
    expect(byName.get('Tibar')).toBe(5);
  });

  it('cada poder exige DEVOTO do próprio deus', () => {
    DEUSES_MENORES_DIVINDADES.forEach((deity) => {
      const [power] = deity.poderes;
      expect(power.type).toBe(GeneralPowerType.CONCEDIDOS);
      const devotoNames = (power.requirements ?? [])
        .flat()
        .filter((req) => req.type === RequirementType.DEVOTO)
        .map((req) => req.name);
      expect(devotoNames).toEqual([deity.name]);
    });
  });

  it('só expõe as divindades quando o suplemento está ativo', () => {
    const namesWith = dataRegistry
      .getDeitiesWithSupplementPowers(WITH)
      .map((d) => d.name);
    const namesWithout = dataRegistry
      .getDeitiesWithSupplementPowers(WITHOUT)
      .map((d) => d.name);

    DEUSES_MENORES_DIVINDADES.forEach((deity) => {
      expect(namesWith).toContain(deity.name);
      expect(namesWithout).not.toContain(deity.name);
    });
    // Os 20 maiores continuam presentes nos dois casos.
    expect(namesWithout).toContain('Khalmyr');
    expect(namesWith).toContain('Khalmyr');
  });

  it('resolve nome curto sem colidir com nome que o contém', () => {
    // 'Ur' é substring de 'O Deus Cristal de Urielka': o match parcial do
    // registry anexaria o poder ao deus errado se o exato não tivesse
    // precedência.
    const ur = dataRegistry.getDeityByName('Ur', WITH);
    const urielka = dataRegistry.getDeityByName(
      'O Deus Cristal de Urielka',
      WITH
    );

    expect(ur?.poderes.map((p) => p.name)).toEqual([
      'Trilhas das Árvores Antigas',
    ]);
    expect(urielka?.poderes.map((p) => p.name)).toEqual(['Conjurar Cristal']);
  });

  it('não colide com os poderes concedidos já existentes', () => {
    const existing = new Set([
      ...Object.values(GRANTED_POWERS).map((p) => p.name),
      ...DEUSES_ARTON_POWERS[GeneralPowerType.CONCEDIDOS].map((p) => p.name),
    ]);
    const novos = DEUSES_MENORES_DIVINDADES.flatMap((d) =>
      d.poderes.map((p) => p.name)
    );

    expect(novos.filter((name) => existing.has(name))).toEqual([]);
    // E são únicos entre si (o refresh de fichas salvas é indexado por nome).
    expect(new Set(novos).size).toBe(novos.length);
  });
});
