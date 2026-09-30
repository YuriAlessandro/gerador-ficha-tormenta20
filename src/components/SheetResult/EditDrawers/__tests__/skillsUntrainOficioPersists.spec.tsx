import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import CharacterSheet from '@/interfaces/CharacterSheet';
import Skill, { CompleteSkill } from '@/interfaces/Skills';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import { createMockCharacterSheet } from '@/__mocks__/characterSheet';
import { recalculateSheet } from '@/functions/recalculateSheet';
import SkillsEditDrawer from '../SkillsEditDrawer';

/**
 * Desmarcar um Ofício no drawer de perícias apagava a linha de
 * `completeSkills`, mas deixava o nome em `skills`. A rede de segurança de
 * Ofícios do `recalculateSheet` (Ofício em `skills` sem linha = recriar
 * treinado) ressuscitava a perícia ao reabrir a ficha.
 */

const OFICIO = 'Ofício (Culinária)' as Skill;

function sheetWithOficio(): CharacterSheet {
  const sheet = createMockCharacterSheet();
  sheet.nivel = 3;
  sheet.skills = [Skill.LUTA, OFICIO];
  sheet.completeSkills = [
    {
      name: Skill.LUTA,
      halfLevel: 1,
      training: 2,
      modAttr: Atributo.FORCA,
      others: 0,
    },
    {
      name: OFICIO,
      halfLevel: 1,
      training: 2,
      modAttr: Atributo.INTELIGENCIA,
      others: 0,
    },
  ] as CompleteSkill[];
  return sheet;
}

describe('SkillsEditDrawer — destreinar Ofício', () => {
  it('Ofício desmarcado não volta depois do recálculo', () => {
    const sheet = sheetWithOficio();
    const onSave = vi.fn();

    render(
      <SkillsEditDrawer
        open
        onClose={() => undefined}
        sheet={sheet}
        onSave={onSave}
      />
    );

    const row = screen.getByText(OFICIO).closest('tr') as HTMLElement;
    fireEvent.click(within(row).getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /salvar/i }));

    expect(onSave).toHaveBeenCalledTimes(1);
    const updates = onSave.mock.calls[0][0] as Partial<CharacterSheet>;
    expect(updates.skills).toEqual([Skill.LUTA]);

    const reopened = recalculateSheet({ ...sheet, ...updates });
    expect(reopened.skills).not.toContain(OFICIO);
    expect(reopened.completeSkills?.some((s) => s.name === OFICIO)).toBeFalsy();
  });

  it('rede de segurança continua recriando Ofício legado sem linha', () => {
    const sheet = sheetWithOficio();
    sheet.completeSkills = sheet.completeSkills?.filter(
      (s) => s.name !== OFICIO
    );

    const result = recalculateSheet(sheet);
    const oficio = result.completeSkills?.find((s) => s.name === OFICIO);
    expect(oficio?.training).toBeGreaterThan(0);
  });
});
