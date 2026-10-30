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
import { DivindadeEnum } from '../../data/systems/tormenta20/divindades';

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

/**
 * Roda um cenário por item e junta as falhas: com centenas de poderes por
 * grupo, a mensagem precisa dizer QUAL poder deixou o sorteio escapar.
 */
const escapesFor = <T>(
  items: T[],
  name: (item: T) => string,
  scenario: (item: T) => StrictSheetResult
): string[] =>
  items.flatMap((item) => {
    const result = scenario(item);
    const unlabeled = result.gaps.filter(
      (gap) => gap.source === 'engine' && gap.step === DEFAULT_RANDOM_LABEL
    );
    if (result.error) return [`${name(item)}: ${result.error}`];
    if (unlabeled.length > 0) return [`${name(item)}: lacuna sem rótulo`];
    return [];
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

// Seleções vazias só atingem o que o motor sortearia SEM escolha. Há sorteios
// que só existem DEPOIS de uma escolha (ex.: o Companheiro Animal escolhido
// sorteava nome e espécie), então cada poder também é escolhido de verdade.
describe('cada poder de classe escolhido no 2º nível', () => {
  const classes = dataRegistry.getClassesBySupplements(ALL_SUPPLEMENTS);

  it.each(classes.map((classe) => [classe.name, classe] as const))(
    '%s',
    (_name, classe) => {
      expect(
        escapesFor(
          classe.powers ?? [],
          (power) => power.name,
          (power) =>
            run(options({ classe: classe.name, nivel: 2 }), [
              { level: 2, powerChoice: 'class', selectedClassPower: power },
            ])
        )
      ).toEqual([]);
    }
  );
});

describe('cada poder geral escolhido no 2º nível', () => {
  const powers = dataRegistry.getPowersBySupplements(ALL_SUPPLEMENTS);

  it.each(Object.entries(powers))('%s', (_type, list) => {
    expect(
      escapesFor(
        list,
        (power) => power.name,
        (power) =>
          run(options({ nivel: 2 }), [
            { level: 2, powerChoice: 'general', selectedGeneralPower: power },
          ])
      )
    ).toEqual([]);
  });
});

describe('cada poder concedido de cada divindade', () => {
  const deities = Object.entries(DivindadeEnum).map(([key, base]) => ({
    key,
    deity: dataRegistry.getDeityByName(base.name, ALL_SUPPLEMENTS) ?? base,
  }));

  it.each(deities.map(({ key, deity }) => [deity.name, key, deity] as const))(
    '%s',
    (_name, key, deity) => {
      expect(
        escapesFor(
          deity.poderes,
          (power) => power.name,
          (power) =>
            buildSheetWithoutRandomness({
              selectedOptions: options({
                nivel: 2,
                devocao: { label: deity.name, value: key },
              }),
              selections: { deityPowers: [power.name] },
              access: ACCESS,
            })
        )
      ).toEqual([]);
    }
  );
});
