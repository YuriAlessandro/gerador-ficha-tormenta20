import { describe, expect, it } from 'vitest';
import { applyManualLevelUp } from '../general';
import { getLastLevelSummary, revertLastLevel } from '../revertLevel';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { Spell, spellsCircles } from '../../interfaces/Spells';
import { LevelUpSelections } from '../../interfaces/WizardSelections';
import INVENTOR from '../../data/systems/tormenta20/classes/inventor';

/**
 * Engenhocas fabricadas no assistente de nível: entram como magias marcadas,
 * custam T$ e são desfeitas (com reembolso) ao reverter o nível.
 */
describe('Fabricação de engenhocas ao subir de nível', () => {
  const engenhoca = (nome: string, apelido?: string): Spell => ({
    nome,
    execucao: 'Padrão',
    alcance: 'Curto',
    duracao: 'Instantânea',
    description: 'Efeito.',
    spellCircle: spellsCircles.c1,
    school: 'Evoc',
    engenhoca: { forma: 'empunhada', nome: apelido },
  });

  const buildInventor = (): CharacterSheet => {
    const sheet = createMockCharacterSheet();
    sheet.nivel = 2;
    sheet.classe = { ...INVENTOR, abilities: [] };
    sheet.classLevels = [1, 2].map((level) => ({
      level,
      className: 'Inventor',
    }));
    sheet.spells = [];
    sheet.dinheiro = 500;
    return sheet;
  };

  const selections = (
    extra: Partial<LevelUpSelections>
  ): LevelUpSelections => ({
    level: 3,
    selectedClassName: 'Inventor',
    powerChoice: 'class',
    ...extra,
  });

  it('adiciona as engenhocas, debita o custo e registra no histórico', () => {
    const result = applyManualLevelUp(
      buildInventor(),
      selections({
        engenhocasFabricadas: [
          engenhoca('Seta Infalível de Talude', 'Besta de repetição'),
          engenhoca('Curar Ferimentos'),
        ],
        engenhocasCost: 200,
      })
    );

    expect(result.spells.map((s) => s.nome)).toEqual([
      'Seta Infalível de Talude',
      'Curar Ferimentos',
    ]);
    expect(result.spells[0].engenhoca?.nome).toBe('Besta de repetição');
    expect(result.dinheiro).toBe(300);

    const marker = result.sheetActionHistory.find(
      (entry) =>
        entry.source.type === 'levelUp' &&
        entry.changes.some((c) => c.type === 'MoneySpent')
    );
    expect(marker?.changes).toEqual([
      {
        type: 'SpellsLearned',
        spellNames: ['Seta Infalível de Talude', 'Curar Ferimentos'],
      },
      { type: 'MoneySpent', amount: 200 },
    ]);
  });

  it('sem desconto (custo 0) o dinheiro fica intacto', () => {
    const result = applyManualLevelUp(
      buildInventor(),
      selections({
        engenhocasFabricadas: [engenhoca('Curar Ferimentos')],
        engenhocasCost: 0,
      })
    );

    expect(result.spells).toHaveLength(1);
    expect(result.dinheiro).toBe(500);
    expect(
      result.sheetActionHistory.some((entry) =>
        entry.changes.some((c) => c.type === 'MoneySpent')
      )
    ).toBe(false);
  });

  it('desfazer o nível tira as engenhocas e devolve o T$', () => {
    const up = applyManualLevelUp(
      buildInventor(),
      selections({
        engenhocasFabricadas: [engenhoca('Curar Ferimentos')],
        engenhocasCost: 100,
      })
    );
    expect(up.dinheiro).toBe(400);

    const summary = getLastLevelSummary(up);
    expect(summary.spells).toContain('Curar Ferimentos');
    expect(summary.moneyRefunded).toBe(100);

    const reverted = revertLastLevel(up);
    expect(reverted.nivel).toBe(2);
    expect(reverted.spells).toHaveLength(0);
    expect(reverted.dinheiro).toBe(500);
  });
});
