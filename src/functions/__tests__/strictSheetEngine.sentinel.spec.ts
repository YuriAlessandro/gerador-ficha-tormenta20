import _ from 'lodash';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildSheetWithoutRandomness,
  StrictSheetResult,
} from '../strictSheetEngine';
import { DEFAULT_RANDOM_LABEL, getRandomItemFromArray } from '../randomUtils';
import SelectedOptions from '../../interfaces/SelectedOptions';
import { LevelUpSelections } from '../../interfaces/WizardSelections';
import { SupplementId } from '../../types/supplement.types';
import { dataRegistry } from '../../data/registry';

/**
 * Teste-sentinela do motor sem sorteio (Builds v2, bloco 1B).
 *
 * `Math.random` e os sorteios do lodash LANÇAM. O motor estrito roda com
 * seleções vazias — o pior caso, em que todo ponto que sortearia é atingido —
 * por todo o catálogo: raças, classes e origens de todos os suplementos,
 * vários níveis e multiclasse. Se algum sorteio escapar do portão de
 * `randomUtils`, o cenário quebra. Também exige rótulo em toda lacuna do
 * motor, para que a lacuna diga O QUE faltou.
 *
 * Quebrou? Corrija o ponto de sorteio (passe pelo portão, com rótulo), não o
 * teste.
 */
const ALL_SUPPLEMENTS = Object.values(SupplementId);
const ACCESS = { optionalRules: true, complications: true, multiclass: true };

const forbid = (what: string) => () => {
  throw new Error(`${what} chamado no caminho estrito`);
};

beforeEach(() => {
  vi.spyOn(Math, 'random').mockImplementation(forbid('Math.random'));
  // O lodash guarda a própria referência de Math.random ao carregar, então o
  // spy acima não o pega: os sorteios dele são proibidos à parte.
  // As assinaturas sobrecarregadas do lodash confundem o tipo do spy; o
  // alvo é tratado como um registro de funções.
  const lodash = _ as unknown as Record<string, () => unknown>;
  ['shuffle', 'sample', 'sampleSize', 'random'].forEach((name) => {
    vi.spyOn(lodash, name).mockImplementation(forbid(`_.${name}`));
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

const options = (overrides: Partial<SelectedOptions>): SelectedOptions => ({
  nivel: 1,
  raca: 'Humano',
  classe: 'Guerreiro',
  origin: 'Acólito',
  devocao: { label: '--', value: '--' },
  supplements: ALL_SUPPLEMENTS,
  ...overrides,
});

const expectNoEscape = (result: StrictSheetResult) => {
  expect(result.error).toBeUndefined();
  expect(result.sheet).not.toBeNull();
  const unlabeled = result.gaps.filter(
    (gap) => gap.source === 'engine' && gap.step === DEFAULT_RANDOM_LABEL
  );
  expect(unlabeled).toEqual([]);
};

const run = (
  selectedOptions: SelectedOptions,
  levelUpSelections?: LevelUpSelections[]
) =>
  buildSheetWithoutRandomness({
    selectedOptions,
    selections: { levelUpSelections },
    access: ACCESS,
  });

it('o sentinela está armado: fora do modo estrito o sorteio lança', () => {
  expect(() => getRandomItemFromArray([1, 2])).toThrow('Math.random');
  expect(() => _.shuffle([1, 2])).toThrow('_.shuffle');
});

describe('todas as classes, do 1º ao 5º nível', () => {
  const classes = dataRegistry
    .getClassesBySupplements(ALL_SUPPLEMENTS)
    .map((classe) => classe.name);

  it.each(classes)('%s', (classe) => {
    expectNoEscape(run(options({ classe, nivel: 5 })));
  });

  it.each(classes)('%s devoto de Khalmyr', (classe) => {
    expectNoEscape(
      run(
        options({
          classe,
          nivel: 2,
          devocao: { label: 'Khalmyr', value: 'KHALMYR' },
        })
      )
    );
  });
});

describe('todas as raças', () => {
  const races = dataRegistry
    .getRacesBySupplements(ALL_SUPPLEMENTS)
    .map((race) => race.name);

  it.each(_.uniq(races))('%s', (raca) => {
    expectNoEscape(run(options({ raca, nivel: 3 })));
  });
});

describe('todas as origens', () => {
  const origins = dataRegistry
    .getOriginsBySupplements(ALL_SUPPLEMENTS)
    .map((origin) => origin.name);

  it.each(_.uniq(origins))('%s', (origin) => {
    expectNoEscape(run(options({ origin })));
  });
});

describe('multiclasse sem setup', () => {
  const multiclass = (
    from: string,
    to: string,
    atLevel: number
  ): LevelUpSelections[] => [
    { level: atLevel, powerChoice: 'class', selectedClassName: to },
    { level: atLevel + 1, powerChoice: 'class', selectedClassName: to },
    { level: atLevel + 2, powerChoice: 'class', selectedClassName: from },
  ];

  it.each([
    ['Guerreiro', 'Arcanista', 3],
    ['Bardo', 'Druida', 2],
    ['Ladino', 'Treinador', 2],
    ['Clérigo', 'Inventor', 4],
  ])('%s → %s no nível %i', (from, to, atLevel) => {
    expectNoEscape(
      run(options({ classe: from, nivel: atLevel + 2 }), [
        ...multiclass(from, to, atLevel),
      ])
    );
  });
});

// A classe é obrigatória em `generateEmptySheet` (só o gerador aleatório a
// sorteia); raça, origem e devoção vazias são sorteadas pelo motor.
describe('formulário sem raça, origem e devoção', () => {
  it.each([1, 4])('nível %i', (nivel) => {
    expectNoEscape(
      run(
        options({
          raca: '',
          origin: '',
          devocao: { label: '', value: '' },
          nivel,
        })
      )
    );
  });
});
