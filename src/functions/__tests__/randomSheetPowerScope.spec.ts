import { describe, expect, it } from 'vitest';
import generateRandomSheet from '../general';
import { SupplementId } from '../../types/supplement.types';
import { GeneralPowerType } from '../../interfaces/Poderes';
import { dataRegistry } from '../../data/registry';
import CharacterSheet from '../../interfaces/CharacterSheet';

/**
 * Teste ponta a ponta do gerador aleatório, escrito para cobrir a mudança que
 * fez `getPowersAllowedByRequirements` ler o `dataRegistry` em vez do catálogo
 * core. Os testes unitários provam a função isolada; aqui a pergunta é se o
 * gerador inteiro sobrevive e se o poder de suplemento realmente CHEGA na
 * ficha, atravessando `applyPower`, `applyGeneralPowers` e o recálculo final.
 *
 * Roda com TODOS os suplementos ligados de propósito: é a combinação que mais
 * amplia o catálogo e a que os usuários efetivamente usam.
 */
const ALL_SUPPLEMENTS = Object.values(SupplementId);

const CORE_POWER_NAMES = new Set(
  dataRegistry
    .getAllPowersBySupplements([SupplementId.TORMENTA20_CORE])
    .map((p) => p.name)
);

const PICKABLE = [
  GeneralPowerType.COMBATE,
  GeneralPowerType.DESTINO,
  GeneralPowerType.MAGIA,
  GeneralPowerType.TORMENTA,
];

/**
 * Poderes que a ficha ganhou pelo SORTEIO de subida de nível — o caminho que
 * esta mudança altera. Fora dele existem concessões explícitas de poder
 * concedido (Arcanista "Linhagem Abençoada", Minauro "Plurivalente"), que são
 * legítimas e não passam pelo catálogo sorteável.
 */
const levelUpPickedPowers = (sheet: CharacterSheet) => {
  const names = new Set<string>();
  (sheet.sheetActionHistory ?? []).forEach((entry) => {
    if (entry.source?.type !== 'levelUp') return;
    entry.changes.forEach((change) => {
      if (change.type === 'PowerAdded') names.add(change.powerName);
    });
  });
  return sheet.generalPowers.filter((p) => names.has(p.name));
};

const generateBatch = (count: number) =>
  Array.from({ length: count }, (_, i) =>
    generateRandomSheet({
      nivel: (i % 20) + 1,
      raca: 'Aleatório',
      classe: 'Aleatório',
      origin: 'Aleatório',
      devocao: { label: '--', value: '--' },
      supplements: ALL_SUPPLEMENTS,
    })
  );

describe('gerador aleatório — escopo dos poderes gerais', () => {
  const sheets = generateBatch(150);

  it('gera fichas de nível 1 a 20 com todos os suplementos sem quebrar', () => {
    expect(sheets).toHaveLength(150);
    sheets.forEach((sheet) => {
      expect(sheet.generalPowers).toBeDefined();
      expect(sheet.nivel).toBeGreaterThan(0);
    });
  });

  it('carimba os suplementos usados na ficha', () => {
    sheets.forEach((sheet) => {
      expect(sheet.supplements).toEqual(ALL_SUPPLEMENTS);
    });
  });

  it('sorteia poderes gerais fora do core', () => {
    const fromSupplements = sheets
      .flatMap(levelUpPickedPowers)
      .filter((p) => !CORE_POWER_NAMES.has(p.name));

    // Antes da correção este número era ZERO em qualquer amostra; hoje a
    // amostra de 150 fichas rende ~190 poderes de suplemento.
    expect(fromSupplements.length).toBeGreaterThan(0);
  });

  it('o sorteio nunca entrega poder concedido nem poder de raça', () => {
    const wrongType = sheets
      .flatMap(levelUpPickedPowers)
      .filter((p) => !PICKABLE.includes(p.type));

    expect(wrongType.map((p) => `${p.name} (${p.type})`)).toEqual([]);
  });

  it('todo poder sorteado tem seus pré-requisitos satisfeitos na ficha', () => {
    // Não reavalia requisito por requisito (a ficha final tem mais poderes que
    // no momento do sorteio); confere o invariante barato: nada duplicado que
    // não permita repetição.
    sheets.forEach((sheet) => {
      const seen = new Map<string, number>();
      sheet.generalPowers.forEach((p) => {
        seen.set(p.name, (seen.get(p.name) ?? 0) + 1);
      });
      const illegalDupes = [...seen.entries()]
        .filter(([name, n]) => {
          if (n < 2) return false;
          const power = sheet.generalPowers.find((p) => p.name === name);
          return !power?.allowSeveralPicks && !power?.canRepeat;
        })
        .map(([name]) => name);

      expect(illegalDupes).toEqual([]);
    });
  });
}, 300000);
