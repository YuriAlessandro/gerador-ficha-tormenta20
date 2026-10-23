import { Atributo } from '../../data/systems/tormenta20/atributos';
import CLERIGO from '../../data/systems/tormenta20/classes/clerigo';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { ClassPower } from '../../interfaces/Class';
import { recalculateSheet } from '../recalculateSheet';
import { normalizeSheet } from '../sheetNormalizer';

/**
 * Ficha da nuvem cuja classe não está entre os suplementos ativos volta do
 * `rehydrateSheet` sem `classe.attrPriority` (o strip remove o campo). O
 * Aumento de Atributo fazia `attrPriority.filter` e o Salvar do editor de
 * poderes não fazia nada (fórum: "Não Conseguindo Salvar Após Adicionar Poder").
 */
const AUMENTO = CLERIGO.powers.find(
  (p) => p.name === 'Aumento de Atributo'
) as ClassPower;

const sheetWithoutPriority = (): CharacterSheet => {
  const sheet = createMockCharacterSheet();
  sheet.classe = {
    ...sheet.classe,
    attrPriority: undefined as unknown as Atributo[],
  };
  return sheet;
};

describe('Aumento de Atributo sem classe.attrPriority', () => {
  test('aplica a escolha manual sem quebrar o recálculo', () => {
    const original = sheetWithoutPriority();
    const sheet = { ...original, classPowers: [AUMENTO] };

    const result = recalculateSheet(sheet, original, {
      'Aumento de Atributo': { attributes: [Atributo.SABEDORIA] },
    });

    expect(result.atributos[Atributo.SABEDORIA].value).toBe(
      original.atributos[Atributo.SABEDORIA].value + 1
    );
  });

  test('sem escolha manual, sorteia entre os disponíveis', () => {
    const original = sheetWithoutPriority();
    const sheet = { ...original, classPowers: [AUMENTO] };

    const result = recalculateSheet(sheet, original);

    const before = Object.values(original.atributos).reduce(
      (acc, a) => acc + a.value,
      0
    );
    const after = Object.values(result.atributos).reduce(
      (acc, a) => acc + a.value,
      0
    );
    expect(after).toBe(before + 1);
  });

  test('normalizeSheet devolve attrPriority como array', () => {
    const sheet = sheetWithoutPriority();
    normalizeSheet(sheet);
    expect(sheet.classe.attrPriority).toEqual([]);
  });
});
