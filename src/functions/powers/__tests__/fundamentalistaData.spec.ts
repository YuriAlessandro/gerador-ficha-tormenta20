/**
 * Dados do Fundamentalista: dogmas resumidos (Deuses de Arton) e arma
 * preferida dos 20 deuses maiores (Tormenta20, p. 96 em diante).
 */
import { describe, it, expect } from 'vitest';
import {
  allDivindadeNames,
  DivindadeNames,
  PREFERRED_WEAPON_ANY,
  PREFERRED_WEAPON_NONE,
} from '../../../interfaces/Divindade';
import { FUNDAMENTALISTAS } from '../../../data/systems/tormenta20/deuses-de-arton/fundamentalistas';
import { DivindadeEnum } from '../../../data/systems/tormenta20/divindades';
import { dataRegistry } from '../../../data/registry';
import { SupplementId } from '../../../types/supplement.types';

// Resumo, não transcrição: o limite força a brevidade (regra do app).
const MAX_RESUMO = 230;

describe('dados do Fundamentalista', () => {
  it('todo deus maior tem dogma de sacerdote resumido e com página', () => {
    allDivindadeNames.forEach((key) => {
      const { sacerdote } = FUNDAMENTALISTAS[key];
      expect(sacerdote.texto?.trim(), key).toBeTruthy();
      expect(sacerdote.herdaSacerdote, key).toBeFalsy();
      expect(sacerdote.pagina, key).toBeGreaterThan(0);
    });
  });

  it('cobre exatamente os druidas e paladinos do livro', () => {
    const comDruida = allDivindadeNames.filter(
      (key) => FUNDAMENTALISTAS[key].druida
    );
    const comPaladino = allDivindadeNames.filter(
      (key) => FUNDAMENTALISTAS[key].paladino
    );
    expect(comDruida.sort()).toEqual(
      ['AHARADAK', 'ALLIHANNA', 'MEGALOKK', 'OCEANO', 'TENEBRA'].sort()
    );
    expect(comPaladino.sort()).toEqual(
      [
        'AZGHER',
        'KHALMYR',
        'LENA',
        'LINWU',
        'MARAH',
        'TANNATOH',
        'THYATIS',
        'VALKARIA',
      ].sort()
    );
  });

  it('dogma sem herança tem texto; nenhum resumo passa do limite', () => {
    allDivindadeNames.forEach((key) => {
      const entry = FUNDAMENTALISTAS[key];
      [entry.sacerdote, entry.druida, entry.paladino].forEach((dogma) => {
        if (!dogma) return;
        if (!dogma.herdaSacerdote)
          expect(dogma.texto?.trim(), key).toBeTruthy();
        expect((dogma.texto ?? '').length, key).toBeLessThanOrEqual(MAX_RESUMO);
      });
    });
  });

  it('todo deus maior tem arma preferida, e ela existe no catálogo', () => {
    const weapons = dataRegistry
      .getEquipmentBySupplements([SupplementId.TORMENTA20_CORE])
      .weapons.map((w) => w.nome);
    allDivindadeNames.forEach((key: DivindadeNames) => {
      const preferred = DivindadeEnum[key].preferredWeapon;
      expect(preferred, key).toBeTruthy();
      if (
        preferred !== PREFERRED_WEAPON_NONE &&
        preferred !== PREFERRED_WEAPON_ANY
      ) {
        expect(weapons, `${key}: ${preferred}`).toContain(preferred);
      }
    });
  });

  it('casos especiais de arma preferida', () => {
    expect(DivindadeEnum.LENA.preferredWeapon).toBe(PREFERRED_WEAPON_NONE);
    expect(DivindadeEnum.MARAH.preferredWeapon).toBe(PREFERRED_WEAPON_NONE);
    expect(DivindadeEnum.NIMB.preferredWeapon).toBe(PREFERRED_WEAPON_ANY);
  });
});
