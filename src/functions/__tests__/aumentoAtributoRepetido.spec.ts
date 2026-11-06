import { cloneDeep } from 'lodash';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import GUERREIRO from '../../data/systems/tormenta20/classes/guerreiro';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { ClassPower } from '../../interfaces/Class';
import { applyPower } from '../general';
import { recalculateSheet } from '../recalculateSheet';

/**
 * Feedback: "não está dando para pegar o poder Aumento de Atributo mais de uma
 * vez". A ficha mostrava o poder ×2, mas o `applyPower` via a entrada do 1º
 * no histórico e pulava o `increaseAttribute` do 2º — o +1 nunca entrava
 * (editor de poderes e ficha aleatória; o assistente de subir de nível força
 * a aplicação e não sofria disso).
 */
const AUMENTO = GUERREIRO.powers.find(
  (p) => p.name === 'Aumento de Atributo'
) as ClassPower;

const increaseEntries = (sheet: CharacterSheet) =>
  sheet.sheetActionHistory.filter(
    (entry) => entry.powerName === 'Aumento de Atributo'
  );

const attr = (sheet: CharacterSheet, attribute: Atributo) =>
  sheet.atributos[attribute].value;

/** Ficha nível 5 já com um Aumento de Atributo em Força. */
const sheetWithOneIncrease = (): CharacterSheet => {
  const original = createMockCharacterSheet();
  original.nivel = 5;
  return recalculateSheet(
    { ...original, classPowers: [cloneDeep(AUMENTO)] },
    original,
    { 'Aumento de Atributo': { attributes: [Atributo.FORCA] } }
  );
};

describe('Aumento de Atributo escolhido mais de uma vez', () => {
  test('a 2ª instância adicionada no editor aplica o +1', () => {
    const before = sheetWithOneIncrease();
    expect(increaseEntries(before)).toHaveLength(1);

    const after = recalculateSheet(
      {
        ...before,
        classPowers: [...(before.classPowers ?? []), cloneDeep(AUMENTO)],
      },
      before,
      { 'Aumento de Atributo': { attributes: [Atributo.DESTREZA] } }
    );

    expect(attr(after, Atributo.DESTREZA)).toBe(
      attr(before, Atributo.DESTREZA) + 1
    );
    expect(attr(after, Atributo.FORCA)).toBe(attr(before, Atributo.FORCA));
    expect(increaseEntries(after)).toHaveLength(2);
  });

  test('recalcular de novo não duplica nenhum aumento', () => {
    const before = sheetWithOneIncrease();
    const twice = recalculateSheet(
      {
        ...before,
        classPowers: [...(before.classPowers ?? []), cloneDeep(AUMENTO)],
      },
      before,
      { 'Aumento de Atributo': { attributes: [Atributo.DESTREZA] } }
    );

    const again = recalculateSheet(cloneDeep(twice), twice);

    expect(again.atributos).toEqual(twice.atributos);
    expect(increaseEntries(again)).toHaveLength(2);
  });

  test('instância sem escolha no recálculo fica pendente, sem +1 sorteado', () => {
    const before = sheetWithOneIncrease();

    const after = recalculateSheet(
      {
        ...before,
        classPowers: [...(before.classPowers ?? []), cloneDeep(AUMENTO)],
      },
      before
    );

    expect(after.atributos).toEqual(before.atributos);
    expect(increaseEntries(after)).toHaveLength(1);
  });

  test('duas instâncias novas na mesma edição recebem uma escolha cada', () => {
    const original = createMockCharacterSheet();
    original.nivel = 5;

    const after = recalculateSheet(
      {
        ...original,
        classPowers: [cloneDeep(AUMENTO), cloneDeep(AUMENTO)],
      },
      original,
      {
        'Aumento de Atributo': {
          attributes: [Atributo.FORCA, Atributo.DESTREZA],
        },
      }
    );

    expect(attr(after, Atributo.FORCA)).toBe(
      attr(original, Atributo.FORCA) + 1
    );
    expect(attr(after, Atributo.DESTREZA)).toBe(
      attr(original, Atributo.DESTREZA) + 1
    );
    expect(increaseEntries(after)).toHaveLength(2);
  });

  test('remover 1 de 2 desfaz só o último aumento', () => {
    const before = sheetWithOneIncrease();
    const twice = recalculateSheet(
      {
        ...before,
        classPowers: [...(before.classPowers ?? []), cloneDeep(AUMENTO)],
      },
      before,
      { 'Aumento de Atributo': { attributes: [Atributo.DESTREZA] } }
    );

    const after = recalculateSheet(
      { ...twice, classPowers: (twice.classPowers ?? []).slice(0, 1) },
      twice
    );

    expect(attr(after, Atributo.DESTREZA)).toBe(
      attr(before, Atributo.DESTREZA)
    );
    expect(attr(after, Atributo.FORCA)).toBe(attr(before, Atributo.FORCA));
    expect(increaseEntries(after)).toHaveLength(1);
  });

  test('ficha aleatória (sem pendingRepeatChoice) aplica a 2ª instância', () => {
    const before = sheetWithOneIncrease();
    const withSecond = {
      ...before,
      classPowers: [...(before.classPowers ?? []), cloneDeep(AUMENTO)],
    };

    const [after] = applyPower(withSecond, AUMENTO);

    const total = (sheet: CharacterSheet) =>
      Object.values(sheet.atributos).reduce((sum, a) => sum + a.value, 0);
    expect(total(after)).toBe(total(before) + 1);
    // Força já foi aumentada neste patamar.
    expect(attr(after, Atributo.FORCA)).toBe(attr(before, Atributo.FORCA));
    expect(increaseEntries(after)).toHaveLength(2);
  });
});
