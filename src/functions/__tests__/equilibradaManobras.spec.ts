import _ from 'lodash';
import { recalculateSheet } from '../recalculateSheet';
import { applyItemEnhancements } from '../itemEnhancements/applyEnhancements';
import { TEXT_ONLY_MODIFICATIONS } from '../modifications/modificationEffects';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Equipment from '../../interfaces/Equipment';
import Bag from '../../interfaces/Bag';
import Skill from '../../interfaces/Skills';

/**
 * Equilibrada: "Ela fornece +2 em testes de manobras (desarmar, quebrar etc.)"
 * (Tormenta20, p. 165), e o teste de manobra é "um teste de ataque corpo a
 * corpo" (p. 234). O app dava +2 permanente em Atletismo. Aparecia como
 * divergência no Nobre Zakharoviano, cuja arma superior sorteia a melhoria: o
 * assistente não mostrava o bônus e o primeiro recálculo, sim.
 */
const atletismoOthers = (sheet: CharacterSheet): number =>
  sheet.completeSkills?.find((s) => s.name === Skill.ATLETISMO)?.others ?? 0;

describe('Equilibrada — +2 em testes de manobras', () => {
  const picareta: Equipment = {
    id: 'w-equilibrada',
    nome: 'Picareta',
    group: 'Arma',
    dano: '1d6',
    critico: 'x4',
    spaces: 1,
  };

  it('não dá bônus de perícia ao item', () => {
    const weapon = applyItemEnhancements({
      ..._.cloneDeep(picareta),
      modifications: [{ mod: 'Equilibrada' }],
    });
    expect(weapon.sheetBonuses ?? []).toEqual([]);
  });

  it('a arma equilibrada não muda o Atletismo no recálculo', () => {
    const weapon = applyItemEnhancements({
      ..._.cloneDeep(picareta),
      modifications: [{ mod: 'Equilibrada' }],
    });
    const sheet = createMockCharacterSheet();
    sheet.bag = new Bag({ Arma: [weapon] });

    expect(atletismoOthers(recalculateSheet(sheet))).toBe(0);
  });

  it('ficha salva com o Atletismo +2 gravado no item perde o bônus ao recalcular', () => {
    // O recálculo coleta os bônus de item (passo 7.3) antes de refazer as
    // melhorias (passo 17): o primeiro recálculo limpa o item, o seguinte já
    // sai sem o bônus.
    // Forma como o item ficava salvo antes: base capturada e o bônus derivado.
    const salvo: Equipment = {
      ..._.cloneDeep(picareta),
      modifications: [{ mod: 'Equilibrada' }],
      baseSheetBonuses: [],
      sheetBonuses: [
        {
          source: { type: 'equipment', equipmentName: 'Picareta' },
          target: { type: 'Skill', name: Skill.ATLETISMO },
          modifier: { type: 'Fixed', value: 2 },
        },
      ],
    };
    const sheet = createMockCharacterSheet();
    sheet.bag = new Bag({ Arma: [salvo] });

    const first = recalculateSheet(sheet);
    const [arma] = first.bag.equipments.Arma ?? [];
    expect(arma?.sheetBonuses ?? []).toEqual([]);
    expect(atletismoOthers(recalculateSheet(first))).toBe(0);
  });

  it('fica registrada como melhoria só descritiva', () => {
    expect(TEXT_ONLY_MODIFICATIONS.has('Equilibrada')).toBe(true);
  });
});
