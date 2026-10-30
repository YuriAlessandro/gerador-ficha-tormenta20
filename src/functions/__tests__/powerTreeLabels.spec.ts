import { describe, expect, test } from 'vitest';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';
import { buildClassPowerGraph } from '../powerTree';
import { getPowerTreeLabel, sortRootNames } from '../../data/powerTreeLabels';

const SUPPLEMENTS = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_AMEACAS_ARTON,
  SupplementId.TORMENTA20_DEUSES_ARTON,
  SupplementId.TORMENTA20_HEROIS_ARTON,
];

function graphOf(name: string, supplements = SUPPLEMENTS) {
  const classe = dataRegistry
    .getClassesWithSupplementInfo(supplements)
    .find((c) => c.name === name);
  if (!classe) throw new Error(`classe ${name} não encontrada`);
  // Mesma conta da ClassPowerTreesView: poderes da classe fora do filtro.
  const active = new Set(classe.powers.map((power) => power.name));
  const inactivePowerNames = new Set(
    (
      dataRegistry
        .getClassesWithSupplementInfo(Object.values(SupplementId))
        .find((c) => c.name === name)?.powers ?? []
    )
      .map((power) => power.name)
      .filter((powerName) => !active.has(powerName))
  );
  return buildClassPowerGraph({
    classe,
    generalPowers: dataRegistry.getAllPowersBySupplements(supplements),
    inactivePowerNames,
  });
}

describe('getPowerTreeLabel', () => {
  test('não inventa nome para conjunto desconhecido', () => {
    expect(getPowerTreeLabel(['Assassinar', 'Ataque Furtivo Letal'])).toBe(
      undefined
    );
  });

  test('independe da ordem em que as raízes chegam', () => {
    const raizes = [
      'Armadilha: Rede',
      'Armadilha: Arataca',
      'Armadilha: Laço',
      'Armadilha: Espinhos',
    ];

    expect(getPowerTreeLabel(raizes)).toBe('Armadilhas');
  });

  test('sortRootNames ordena respeitando acento', () => {
    expect(sortRootNames(['Éden', 'Abril', 'Zulu'])).toEqual([
      'Abril',
      'Éden',
      'Zulu',
    ]);
  });
});

describe('casamento com os dados reais', () => {
  test('a árvore de armadilhas do Caçador tem nome curado', () => {
    const arvore = graphOf('Caçador').clusters.find(
      (c) => c.rootIds.length === 4
    );

    expect(arvore?.rootIds).toContain('Armadilha: Arataca');
    expect(getPowerTreeLabel(arvore?.rootIds ?? [])).toBe('Armadilhas');
  });

  test('a árvore de missas do Clérigo tem nome curado', () => {
    // Com Heróis de Arton: as cinco do básico + as três novas (p. 65).
    const arvore = graphOf('Clérigo').clusters.find(
      (c) => c.rootIds.length === 8
    );

    expect(arvore?.rootIds).toContain('Missa: Mente Abençoada');
    expect(getPowerTreeLabel(arvore?.rootIds ?? [])).toBe('Missas');
  });

  test('só com o livro básico, as cinco missas também têm nome curado', () => {
    const arvore = graphOf('Clérigo', [
      SupplementId.TORMENTA20_CORE,
    ]).clusters.find((c) => c.rootIds.length === 5);

    expect(arvore?.rootIds).toContain('Missa: Bênção da Vida');
    expect(getPowerTreeLabel(arvore?.rootIds ?? [])).toBe('Missas');
  });

  test('a variante herda o nome curado da base sem entrada extra', () => {
    const seteiro = graphOf('Seteiro').clusters.find(
      (c) => c.rootIds.length === 4
    );

    expect(getPowerTreeLabel(seteiro?.rootIds ?? [])).toBe('Armadilhas');
  });

  test('árvore de entrada única não precisa de nome curado', () => {
    const umaRaiz = graphOf('Druida').clusters.filter(
      (c) => c.rootIds.length === 1
    );

    expect(umaRaiz.length).toBeGreaterThan(0);
    umaRaiz.forEach((c) => {
      expect(getPowerTreeLabel(c.rootIds)).toBe(undefined);
    });
  });
});
