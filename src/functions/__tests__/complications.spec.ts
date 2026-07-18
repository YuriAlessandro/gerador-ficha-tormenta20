/**
 * Testes de integração da Complicação (Heróis de Arton) no motor de recálculo.
 *
 * Regras verificadas:
 * - As penalidades (sheetBonuses) da complicação são aplicadas pelo recalc.
 * - Recalcular várias vezes não duplica os bônus (idempotência via wipe+reapply).
 * - Remover a complicação (diff com originalSheet) reverte as penalidades.
 */
import { describe, it, expect } from 'vitest';
import { recalculateSheet } from '../recalculateSheet';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import Skill from '../../interfaces/Skills';
import CharacterSheet from '../../interfaces/CharacterSheet';
import type { SheetComplication } from '../../premium/interfaces/Complication';
import { getComplicationByName } from '../../premium/data/complications';

const TEST_COMPLICATION: SheetComplication = {
  name: 'Complicação de Teste',
  description: 'Penalidade de teste.',
  type: 'classe',
  className: 'Guerreiro',
  grantedPowerName: 'Poder de Teste',
  sheetBonuses: [
    {
      source: {
        type: 'complication',
        complicationName: 'Complicação de Teste',
      },
      target: { type: 'Skill', name: Skill.VONTADE },
      modifier: { type: 'Fixed', value: -2 },
    },
  ],
};

function countComplicationBonuses(sheet: CharacterSheet): number {
  return (sheet.sheetBonuses || []).filter(
    (b) => b.source.type === 'complication'
  ).length;
}

describe('Complicação no recalculateSheet', () => {
  it('aplica a penalidade da complicação embutida', () => {
    const sheet = createMockCharacterSheet();
    sheet.complication = { ...TEST_COMPLICATION };

    const result = recalculateSheet(sheet);

    expect(countComplicationBonuses(result)).toBe(1);
    const vontade = result.completeSkills?.find(
      (s) => s.name === Skill.VONTADE
    );
    expect(vontade?.others).toBe(-2);
  });

  it('não duplica os bônus ao recalcular várias vezes', () => {
    const sheet = createMockCharacterSheet();
    sheet.complication = { ...TEST_COMPLICATION };

    const once = recalculateSheet(sheet);
    const twice = recalculateSheet(once);

    expect(countComplicationBonuses(twice)).toBe(1);
  });

  it('reverte a penalidade quando a complicação é removida', () => {
    const withComplication = createMockCharacterSheet();
    withComplication.complication = { ...TEST_COMPLICATION };
    const applied = recalculateSheet(withComplication);

    // Usuário removeu a complicação: nova ficha sem o campo
    const withoutComplication = { ...applied };
    delete withoutComplication.complication;

    const result = recalculateSheet(withoutComplication, applied);

    expect(countComplicationBonuses(result)).toBe(0);
    const vontade = result.completeSkills?.find(
      (s) => s.name === Skill.VONTADE
    );
    expect(vontade?.others ?? 0).toBe(0);
  });

  it('aplica uma complicação real (Combalido: -5 Fortitude, -1 PV/nível)', () => {
    const combalido = getComplicationByName('Combalido');
    expect(combalido).toBeDefined();

    const sheet = createMockCharacterSheet();
    sheet.nivel = 5;
    const pvBefore = recalculateSheet(sheet).pv;

    sheet.complication = {
      ...(combalido as SheetComplication),
      grantedPowerName: 'Qualquer Poder',
    };
    const result = recalculateSheet(sheet);

    const fortitude = result.completeSkills?.find(
      (s) => s.name === Skill.FORTITUDE
    );
    expect(fortitude?.others).toBe(-5);
    // -1 PV por nível (nível 5) → 5 PV a menos que sem a complicação
    expect(result.pv).toBe(pvBefore - 5);
  });
});
