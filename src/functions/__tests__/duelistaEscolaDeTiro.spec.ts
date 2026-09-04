import _ from 'lodash';
import { recalculateSheet } from '../recalculateSheet';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { ClassDescription } from '../../interfaces/Class';
import Bag from '../../interfaces/Bag';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';
import { Armas } from '../../data/systems/tormenta20/equipamentos';
import { getSheetProficiencias } from '../proficiencies';
import PROFICIENCIAS from '../../data/systems/tormenta20/proficiencias';
import GRANTED_POWERS from '../../data/systems/tormenta20/powers/grantedPowers';
import VALKARIA from '../../data/systems/tormenta20/divindades/valkaria';

/**
 * Escola de Tiro (Duelista, 2º nível): "você recebe proficiência com armas de
 * fogo leves e de uma mão". A escolha era só texto — o personagem seguia com o
 * −5 de não proficiência na pistola e perdia os bônus que exigem proficiência
 * (Armas da Ambição, de Valkaria, foi como o problema apareceu).
 */
describe('Duelista — Escola de Tiro', () => {
  const duelista = (): ClassDescription => {
    const classe = dataRegistry
      .getClassesBySupplements([
        SupplementId.TORMENTA20_CORE,
        SupplementId.TORMENTA20_HEROIS_ARTON,
      ])
      .find((c) => c.name === 'Duelista');
    if (!classe) throw new Error('Duelista não encontrado no registry');
    return _.cloneDeep(classe);
  };

  const mkSheet = (escola: string): CharacterSheet => {
    const sheet = createMockCharacterSheet();
    sheet.nivel = 5;
    sheet.classe = duelista();
    sheet.optionChoices = { escolaDeDuelo: [escola] };
    sheet.bag = new Bag({
      Arma: [
        { ..._.cloneDeep(Armas.PISTOLA), id: 'pistola' },
        { ..._.cloneDeep(Armas.MOSQUETE), id: 'mosquete' },
      ],
    });
    sheet.sheetBonuses = [];
    sheet.sheetActionHistory = [];
    return sheet;
  };

  it('concede a proficiência com armas de fogo de uma mão', () => {
    const profs = getSheetProficiencias(
      recalculateSheet(mkSheet('Escola de Tiro'))
    );

    expect(profs).toContain(PROFICIENCIAS.FOGO_UMA_MAO);
  });

  it('outra escola de duelo não concede a proficiência', () => {
    const profs = getSheetProficiencias(
      recalculateSheet(mkSheet('Escola Clássica'))
    );

    expect(profs).not.toContain(PROFICIENCIAS.FOGO_UMA_MAO);
  });

  it('Armas da Ambição passa a valer na pistola, mas não no mosquete', () => {
    const sheet = mkSheet('Escola de Tiro');
    sheet.devoto = {
      divindade: _.cloneDeep(VALKARIA),
      poderes: [_.cloneDeep(GRANTED_POWERS.ARMAS_DA_AMBICAO)],
    };

    const armas = recalculateSheet(sheet).bag.equipments.Arma;

    // Pistola: uma mão → coberta pela Escola de Tiro (19 → 18).
    expect(armas.find((w) => w.id === 'pistola')?.critico).toBe('18/x3');
    // Mosquete: duas mãos → segue sem proficiência.
    expect(armas.find((w) => w.id === 'mosquete')?.critico).toBe('19/x3');
  });
});
