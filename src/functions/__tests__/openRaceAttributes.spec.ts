import { describe, expect, test } from 'vitest';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import SelectedOptions from '../../interfaces/SelectedOptions';
import { WizardSelections } from '../../interfaces/WizardSelections';
import { SupplementId } from '../../types/supplement.types';
import {
  generateEmptySheet,
  getEffectiveRaceAttrs,
  isRaceAttributeSelectionComplete,
} from '../general';
import { rehydrateSheet, stripSheetForStorage } from '../sheetPayloadOptimizer';
import { dataRegistry } from '../../data/registry';
import { applyOpenRace } from '../../premium/functions/openRaces';

const ZEROED: Record<Atributo, number> = {
  [Atributo.FORCA]: 0,
  [Atributo.DESTREZA]: 0,
  [Atributo.CONSTITUICAO]: 0,
  [Atributo.INTELIGENCIA]: 0,
  [Atributo.SABEDORIA]: 0,
  [Atributo.CARISMA]: 0,
};

// Anão: Con +2, Sab +1, Des −1. Com Raças Abertas o jogador aplica esses três
// modificadores onde quiser — aqui, deliberadamente em atributos atípicos.
const BASE_OPTIONS: SelectedOptions = {
  nivel: 1,
  raca: 'Anão',
  classe: 'Guerreiro',
  origin: '',
  devocao: { label: '--', value: '--' },
  supplements: [SupplementId.TORMENTA20_CORE],
};

function buildOpenRaceSheet() {
  const wizardSelections: WizardSelections = {
    openRaces: true,
    // Pareado por ÍNDICE com os slots: +2 → Carisma, +1 → Inteligência,
    // −1 → Constituição.
    raceAttributes: [
      Atributo.CARISMA,
      Atributo.INTELIGENCIA,
      Atributo.CONSTITUICAO,
    ],
    baseAttributes: { ...ZEROED },
  };
  return generateEmptySheet(BASE_OPTIONS, wizardSelections);
}

describe('Raças Abertas (Heróis de Arton) na geração de ficha', () => {
  test('aplica cada modificador racial no atributo escolhido', () => {
    const sheet = buildOpenRaceSheet();

    expect(sheet.atributos[Atributo.CARISMA].value).toBe(2);
    expect(sheet.atributos[Atributo.INTELIGENCIA].value).toBe(1);
    expect(sheet.atributos[Atributo.CONSTITUICAO].value).toBe(-1);
  });

  test('os atributos padrão da raça ficam zerados (nada aplicado em dobro)', () => {
    const sheet = buildOpenRaceSheet();

    // Sabedoria e Destreza são os alvos padrão do anão (+1 e −1); com a regra
    // ligada eles não recebem nada, e a Constituição recebe o −1 escolhido em
    // vez do +2 do catálogo.
    expect(sheet.atributos[Atributo.SABEDORIA].value).toBe(0);
    expect(sheet.atributos[Atributo.DESTREZA].value).toBe(0);
    expect(sheet.atributos[Atributo.FORCA].value).toBe(0);
  });

  test('registra a regra em optionalRules e marca a variante como sintética', () => {
    const sheet = buildOpenRaceSheet();

    expect(sheet.optionalRules?.openRaces).toBe(true);
    expect(sheet.selectedAttributeVariant?.openRace).toBe(true);
    expect(sheet.selectedAttributeVariant?.attrs).toEqual([
      { attr: 'any', mod: 2 },
      { attr: 'any', mod: 1 },
      { attr: 'any', mod: -1 },
    ]);
  });

  test('a distribuição sobrevive ao ciclo de gravação e releitura na nuvem', () => {
    const sheet = buildOpenRaceSheet();
    const roundTripped = rehydrateSheet(
      JSON.parse(JSON.stringify(stripSheetForStorage(sheet))),
      [SupplementId.TORMENTA20_CORE]
    );

    expect(roundTripped.optionalRules?.openRaces).toBe(true);
    expect(roundTripped.selectedAttributeVariant?.openRace).toBe(true);
    expect(roundTripped.raca.attributes.attrs).toEqual([
      { attr: 'any', mod: 2 },
      { attr: 'any', mod: 1 },
      { attr: 'any', mod: -1 },
    ]);
    expect(roundTripped.raceAttributeChoices).toEqual([
      Atributo.CARISMA,
      Atributo.INTELIGENCIA,
      Atributo.CONSTITUICAO,
    ]);
    expect(roundTripped.atributos[Atributo.CARISMA].value).toBe(2);
  });

  test('sem a regra, a ficha usa os modificadores padrão da raça', () => {
    const sheet = generateEmptySheet(BASE_OPTIONS, {
      baseAttributes: { ...ZEROED },
    });

    expect(sheet.atributos[Atributo.CONSTITUICAO].value).toBe(2);
    expect(sheet.atributos[Atributo.SABEDORIA].value).toBe(1);
    expect(sheet.atributos[Atributo.DESTREZA].value).toBe(-1);
    expect(sheet.optionalRules).toBeUndefined();
  });
});

describe('Avanço do passo "Atributos da Raça"', () => {
  const getRace = (name: string) =>
    dataRegistry
      .getRacesBySupplements([SupplementId.TORMENTA20_CORE])
      .find((r) => r.name === name)!;

  test('raça de modificadores fixos libera o avanço SEM escolha nenhuma', () => {
    // O passo passou a existir também para raças sem slot `any` — é onde mora o
    // interruptor de Raças Abertas. Sem tratar `undefined` como "nada
    // escolhido", o "Próximo" ficava travado para todo anão que não ligasse a
    // regra opcional.
    const anao = getRace('Anão');

    expect(isRaceAttributeSelectionComplete(anao, undefined, undefined)).toBe(
      true
    );
    expect(isRaceAttributeSelectionComplete(anao, undefined, [])).toBe(true);
  });

  test('raça com slots livres exige todas as escolhas', () => {
    const humano = getRace('Humano'); // três slots `any`

    expect(isRaceAttributeSelectionComplete(humano, undefined, undefined)).toBe(
      false
    );
    expect(
      isRaceAttributeSelectionComplete(humano, undefined, [Atributo.FORCA])
    ).toBe(false);
    expect(
      isRaceAttributeSelectionComplete(humano, undefined, [
        Atributo.FORCA,
        Atributo.DESTREZA,
        Atributo.CARISMA,
      ])
    ).toBe(true);
  });

  test('atributo repetido não conta como completo', () => {
    const humano = getRace('Humano');

    expect(
      isRaceAttributeSelectionComplete(humano, undefined, [
        Atributo.FORCA,
        Atributo.FORCA,
        Atributo.CARISMA,
      ])
    ).toBe(false);
  });

  test('com Raças Abertas, o anão passa a exigir as três escolhas', () => {
    const anao = getRace('Anão');
    const aberto = applyOpenRace(anao, getEffectiveRaceAttrs(anao, undefined));

    expect(isRaceAttributeSelectionComplete(aberto, undefined, undefined)).toBe(
      false
    );
    expect(
      isRaceAttributeSelectionComplete(aberto, undefined, [
        Atributo.CARISMA,
        Atributo.INTELIGENCIA,
        Atributo.CONSTITUICAO,
      ])
    ).toBe(true);
  });
});

describe('Devoções Abertas (Heróis de Arton) na geração de ficha', () => {
  test('registra a regra na ficha quando ligada no formulário', () => {
    const sheet = generateEmptySheet(
      { ...BASE_OPTIONS, openDeities: true },
      { baseAttributes: { ...ZEROED } }
    );

    expect(sheet.optionalRules?.openDeities).toBe(true);
  });
});
