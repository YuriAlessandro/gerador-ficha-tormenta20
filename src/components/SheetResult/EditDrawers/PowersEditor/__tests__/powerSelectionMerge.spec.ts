import { describe, expect, it } from 'vitest';
import { SelectionOptions } from '@/interfaces/PowerSelections';
import { isRepeatablePower, mergeSelections } from '../powerSelectionMerge';

/**
 * Este merge estava copiado cinco vezes dentro do editor antigo. A assimetria
 * entre listas que acumulam e `attributes`, que sobrescreve, é a regra fácil
 * de perder numa das cópias — é o que estes testes travam.
 */
describe('mergeSelections', () => {
  it('poder não repetível descarta o histórico e fica com a escolha nova', () => {
    const previous: SelectionOptions = { skills: ['Atletismo'] };
    const incoming: SelectionOptions = { skills: ['Furtividade'] };

    expect(mergeSelections(previous, incoming, false)).toEqual({
      skills: ['Furtividade'],
    });
  });

  it('poder repetível acumula perícias, proficiências, poderes e magias', () => {
    const previous: SelectionOptions = {
      skills: ['Atletismo'],
      proficiencies: ['Armas Marciais'],
    };
    const incoming: SelectionOptions = {
      skills: ['Furtividade'],
      proficiencies: ['Armas de Fogo'],
    };

    const result = mergeSelections(previous, incoming, true);

    expect(result.skills).toEqual(['Atletismo', 'Furtividade']);
    expect(result.proficiencies).toEqual(['Armas Marciais', 'Armas de Fogo']);
  });

  it('armas acumulam — é o caminho do diálogo de especialização', () => {
    const result = mergeSelections(
      { weapons: ['Espada Longa'] },
      { weapons: ['Machado'] },
      true
    );

    expect(result.weapons).toEqual(['Espada Longa', 'Machado']);
  });

  it('attributes SOBRESCREVE mesmo em poder repetível', () => {
    // Cada aplicação de um poder de aumento de atributo só pode mexer no
    // atributo recém-escolhido; acumular aplicaria todos de novo no recálculo.
    const result = mergeSelections(
      { attributes: ['Força'] },
      { attributes: ['Destreza'] },
      true
    );

    expect(result.attributes).toEqual(['Destreza']);
  });

  it('preserva chaves que a escolha nova não menciona', () => {
    const result = mergeSelections(
      { familiars: ['coruja'] },
      { skills: ['Atletismo'] },
      true
    );

    expect(result.familiars).toEqual(['coruja']);
    expect(result.skills).toEqual(['Atletismo']);
  });

  it('funciona sem histórico anterior', () => {
    expect(mergeSelections(undefined, { skills: ['Atletismo'] }, true)).toEqual(
      {
        skills: ['Atletismo'],
      }
    );
  });
});

describe('isRepeatablePower', () => {
  it('aceita os dois campos — os dados usam um ou outro', () => {
    // GeneralPower usa `allowSeveralPicks`; ClassPower usa `canRepeat`.
    expect(isRepeatablePower({ allowSeveralPicks: true })).toBe(true);
    expect(isRepeatablePower({ canRepeat: true })).toBe(true);
    expect(isRepeatablePower({})).toBe(false);
  });
});
