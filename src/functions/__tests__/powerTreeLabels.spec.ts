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

const classes = dataRegistry.getClassesWithSupplementInfo(SUPPLEMENTS);
const generalPowers = dataRegistry.getAllPowersBySupplements(SUPPLEMENTS);

function graphOf(name: string) {
  const classe = classes.find((c) => c.name === name);
  if (!classe) throw new Error(`classe ${name} não encontrada`);
  return buildClassPowerGraph({ classe, generalPowers });
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
    const arvore = graphOf('Clérigo').clusters.find(
      (c) => c.rootIds.length === 5
    );

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
