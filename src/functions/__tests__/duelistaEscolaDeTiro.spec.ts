import _ from 'lodash';
import generateRandomSheet from '../general';
import { recalculateSheet } from '../recalculateSheet';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { ClassDescription } from '../../interfaces/Class';
import Bag from '../../interfaces/Bag';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';
import { Armas } from '../../data/systems/tormenta20/equipamentos';
import {
  getSheetProficiencias,
  isProficientWithWeapon,
} from '../proficiencies';
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

  it('Mosquete legado (sem `twoHanded` gravado) segue não proficiente', () => {
    // `twoHanded` só existe no catálogo desde 02/05/2026 e
    // `refreshBagItemsFromCatalog` não o recarimba: uma cópia antiga na mochila
    // chega sem o campo e passaria como arma de uma mão. O fallback por nome
    // fecha isso.
    const mosqueteLegado = _.cloneDeep(Armas.MOSQUETE);
    delete (mosqueteLegado as { twoHanded?: boolean }).twoHanded;

    expect(
      isProficientWithWeapon(mosqueteLegado, [PROFICIENCIAS.FOGO_UMA_MAO])
    ).toBe(false);
    // E a pistola legada continua coberta.
    const pistolaLegada = _.cloneDeep(Armas.PISTOLA);
    delete (pistolaLegada as { twoHanded?: boolean }).twoHanded;
    expect(
      isProficientWithWeapon(pistolaLegada, [PROFICIENCIAS.FOGO_UMA_MAO])
    ).toBe(true);
  });

  /**
   * A ficha aleatória não passa por `recalculateSheet`: `generateRandomSheet`
   * termina em `applyStatModifiers`, e `chooseFromOptions` empurra o bônus da
   * escola direto para `sheet.sheetBonuses`. Sem um ramo `Proficiency` lá, o
   * Duelista sorteado com Escola de Tiro (1 em 3) ficava com o −5 na pistola
   * até algum recálculo posterior curar a ficha.
   */
  describe('caminho de geração aleatória', () => {
    // O sorteio da escola é aleatório; tenta até sair a que interessa em vez
    // de fixar semente (a geração não expõe uma).
    const gerarComEscolaDeTiro = (): CharacterSheet | null => {
      for (let i = 0; i < 60; i += 1) {
        const sheet = generateRandomSheet({
          nivel: 5,
          raca: 'Humano',
          classe: 'Duelista',
          origin: '',
          devocao: { label: '', value: '' },
          supplements: [
            SupplementId.TORMENTA20_CORE,
            SupplementId.TORMENTA20_HEROIS_ARTON,
          ],
        });
        if (sheet.optionChoices?.escolaDeDuelo?.includes('Escola de Tiro')) {
          return sheet;
        }
      }
      return null;
    };

    it('aplica a proficiência sem depender de um recálculo posterior', () => {
      const sheet = gerarComEscolaDeTiro();
      // 60 tentativas com 1 em 3 de chance: só um sorteio absurdo chega aqui
      // nulo, e nesse caso é melhor falhar do que passar sem afirmar nada.
      expect(sheet).not.toBeNull();
      if (!sheet) return;

      const profs = getSheetProficiencias(sheet);
      expect(profs).toContain(PROFICIENCIAS.FOGO_UMA_MAO);

      // E a proficiência de fato cobre a pistola — sem o ramo `Proficiency` em
      // `applyStatModifiers` a arma seguia com o −5. (O recorte "só uma mão"
      // é afirmado nos testes determinísticos acima: aqui a ficha é sorteada e
      // pode ganhar 'Armas de Fogo' por outro caminho.)
      expect(isProficientWithWeapon(_.cloneDeep(Armas.PISTOLA), profs)).toBe(
        true
      );
    });
  });
});
