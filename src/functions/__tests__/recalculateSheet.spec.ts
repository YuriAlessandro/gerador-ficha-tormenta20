import { recalculateSheet } from '../recalculateSheet';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import combatPowers from '../../data/systems/tormenta20/powers/combatPowers';
import { DestinyPowers } from '../../data/systems/tormenta20/powers/destinyPowers';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Skill from '../../interfaces/Skills';

describe('recalculateSheet', () => {
  let mockSheet: CharacterSheet;

  beforeEach(() => {
    mockSheet = createMockCharacterSheet();
    // Ensure we have a clean sheet with no general powers initially
    mockSheet.generalPowers = [];
    mockSheet.classPowers = [];
    mockSheet.sheetBonuses = [];
    mockSheet.sheetActionHistory = [];
  });

  describe('Power Addition', () => {
    it('should apply Esquiva bonuses correctly', () => {
      // Get baseline values
      const baselineSheet = recalculateSheet(mockSheet);
      const baseDefense = baselineSheet.defesa;
      const baseReflexos =
        baselineSheet.completeSkills?.find(
          (skill) => skill.name === Skill.REFLEXOS
        )?.others || 0;

      // Add Esquiva power
      const esquivaPower = combatPowers.ESQUIVA;
      mockSheet.generalPowers = [esquivaPower];

      const result = recalculateSheet(mockSheet);

      // Should have Defense bonus applied (+2)
      expect(result.defesa).toBe(baseDefense + 2);

      // Should have Reflexos skill bonus in others field (+2)
      const reflexosSkill = result.completeSkills?.find(
        (skill) => skill.name === Skill.REFLEXOS
      );
      expect(reflexosSkill?.others).toBe(baseReflexos + 2);
    });

    it('should apply Treinamento em Perícia correctly', () => {
      // Get baseline values
      const baselineSheet = recalculateSheet(mockSheet);
      const baseSkillCount = baselineSheet.skills.length;

      // Add Treinamento em Perícia power
      const treinamentoPower = DestinyPowers.TREINAMENTO_EM_PERICIA;
      mockSheet.generalPowers = [treinamentoPower];

      const result = recalculateSheet(mockSheet);

      // Should have more skills trained than before
      expect(result.skills.length).toBeGreaterThan(baseSkillCount);

      // Should have sheet action history entry
      const treinamentoHistoryEntry = result.sheetActionHistory.find(
        (entry) => entry.powerName === 'Treinamento em Perícia'
      );
      expect(treinamentoHistoryEntry).toBeDefined();
      expect(treinamentoHistoryEntry?.changes[0].type).toBe('SkillsAdded');
    });

    it('should apply Proficiência correctly', () => {
      // Get baseline values
      const baselineSheet = recalculateSheet(mockSheet);
      const baseProfCount = baselineSheet.classe.proficiencias.length;

      // Add Proficiência power
      const proficienciaPower = combatPowers.PROFICIENCIA;
      mockSheet.generalPowers = [proficienciaPower];

      const result = recalculateSheet(mockSheet);

      // Should have more proficiencies than before
      expect(result.classe.proficiencias.length).toBeGreaterThan(baseProfCount);

      // Should have sheet action history entry
      const proficienciaHistoryEntry = result.sheetActionHistory.find(
        (entry) => entry.powerName === 'Proficiência'
      );
      expect(proficienciaHistoryEntry).toBeDefined();
      expect(proficienciaHistoryEntry?.changes[0].type).toBe(
        'ProficiencyAdded'
      );
    });
  });

  describe('Power Removal', () => {
    it('should remove Esquiva bonuses when power is removed', () => {
      // First, create a sheet with Esquiva applied
      const originalSheet = { ...mockSheet };
      originalSheet.generalPowers = [combatPowers.ESQUIVA];
      const sheetWithEsquiva = recalculateSheet(originalSheet);

      // Verify Esquiva bonuses are applied
      const esquivaDefense = sheetWithEsquiva.defesa;
      const esquivaReflexos =
        sheetWithEsquiva.completeSkills?.find(
          (skill) => skill.name === Skill.REFLEXOS
        )?.others || 0;

      // Create baseline without Esquiva for comparison
      const baselineSheet = recalculateSheet(mockSheet);
      const baseDefense = baselineSheet.defesa;
      const baseReflexos =
        baselineSheet.completeSkills?.find(
          (skill) => skill.name === Skill.REFLEXOS
        )?.others || 0;

      // Verify Esquiva adds bonuses
      expect(esquivaDefense).toBe(baseDefense + 2);
      expect(esquivaReflexos).toBe(baseReflexos + 2);

      // Now remove Esquiva
      const sheetWithoutEsquiva = { ...sheetWithEsquiva };
      sheetWithoutEsquiva.generalPowers = []; // Remove Esquiva

      const result = recalculateSheet(sheetWithoutEsquiva, sheetWithEsquiva);

      // Verify bonuses are removed (should equal baseline values)
      expect(result.defesa).toBe(baseDefense);
      const reflexosSkillAfter = result.completeSkills?.find(
        (skill) => skill.name === Skill.REFLEXOS
      );
      expect(reflexosSkillAfter?.others).toBe(baseReflexos);
    });

    it('should remove learned skills when Treinamento em Perícia is removed', () => {
      // First, create a sheet with Treinamento em Perícia applied
      const originalSheet = { ...mockSheet };
      originalSheet.generalPowers = [DestinyPowers.TREINAMENTO_EM_PERICIA];
      const sheetWithTreinamento = recalculateSheet(originalSheet);

      // Get baseline for comparison
      const baselineSheet = recalculateSheet(mockSheet);

      // Verify skill was learned
      expect(sheetWithTreinamento.skills.length).toBeGreaterThan(
        baselineSheet.skills.length
      );

      // Now remove Treinamento em Perícia
      const sheetWithoutTreinamento = { ...sheetWithTreinamento };
      sheetWithoutTreinamento.generalPowers = []; // Remove power

      const result = recalculateSheet(
        sheetWithoutTreinamento,
        sheetWithTreinamento
      );

      // Verify skill was removed (should equal baseline)
      expect(result.skills.length).toBe(baselineSheet.skills.length);

      // Verify Treinamento action history was cleaned
      const treinamentoHistoryEntry = result.sheetActionHistory.find(
        (entry) => entry.powerName === 'Treinamento em Perícia'
      );
      expect(treinamentoHistoryEntry).toBeUndefined();
    });

    it('should remove proficiencies when Proficiência is removed', () => {
      // First, create a sheet with Proficiência applied
      const originalSheet = { ...mockSheet };
      originalSheet.generalPowers = [combatPowers.PROFICIENCIA];
      const sheetWithProf = recalculateSheet(originalSheet);

      // Get baseline for comparison
      const baselineSheet = recalculateSheet(mockSheet);

      // Verify proficiency was added
      expect(sheetWithProf.classe.proficiencias.length).toBeGreaterThan(
        baselineSheet.classe.proficiencias.length
      );

      // Now remove Proficiência
      const sheetWithoutProf = { ...sheetWithProf };
      sheetWithoutProf.generalPowers = []; // Remove power

      const result = recalculateSheet(sheetWithoutProf, sheetWithProf);

      // Verify proficiency was removed (should equal baseline)
      expect(result.classe.proficiencias.length).toBe(
        baselineSheet.classe.proficiencias.length
      );

      // Verify Proficiência action history was cleaned
      const proficienciaHistoryEntry = result.sheetActionHistory.find(
        (entry) => entry.powerName === 'Proficiência'
      );
      expect(proficienciaHistoryEntry).toBeUndefined();
    });
  });

  describe('Multiple Powers', () => {
    it('should handle multiple powers correctly', () => {
      // Get baseline values
      const baselineSheet = recalculateSheet(mockSheet);
      const baseDefense = baselineSheet.defesa;
      const baseSkillCount = baselineSheet.skills.length;

      // Add multiple powers
      const esquivaPower = combatPowers.ESQUIVA;
      const treinamentoPower = DestinyPowers.TREINAMENTO_EM_PERICIA;

      mockSheet.generalPowers = [esquivaPower, treinamentoPower];

      const result = recalculateSheet(mockSheet);

      // Should have bonuses from Esquiva
      expect(result.defesa).toBe(baseDefense + 2);

      // Should have learned skill from Treinamento
      expect(result.skills.length).toBeGreaterThan(baseSkillCount);

      // Should have history entries for Treinamento (Esquiva doesn't create history)
      const treinamentoHistoryEntry = result.sheetActionHistory.find(
        (entry) => entry.powerName === 'Treinamento em Perícia'
      );
      expect(treinamentoHistoryEntry).toBeDefined();
    });

    it('should remove only specified powers when multiple powers exist', () => {
      // Get baseline
      const baselineSheet = recalculateSheet(mockSheet);
      const baseDefense = baselineSheet.defesa;
      const baseSkillCount = baselineSheet.skills.length;

      // Add multiple powers
      const esquivaPower = combatPowers.ESQUIVA;
      const treinamentoPower = DestinyPowers.TREINAMENTO_EM_PERICIA;

      const originalSheet = { ...mockSheet };
      originalSheet.generalPowers = [esquivaPower, treinamentoPower];
      const sheetWithBothPowers = recalculateSheet(originalSheet);

      // Remove only Esquiva, keep Treinamento
      const sheetWithOnlyTreinamento = { ...sheetWithBothPowers };
      sheetWithOnlyTreinamento.generalPowers = [treinamentoPower];

      const result = recalculateSheet(
        sheetWithOnlyTreinamento,
        sheetWithBothPowers
      );

      // Esquiva bonuses should be removed (back to baseline)
      expect(result.defesa).toBe(baseDefense);

      // Treinamento effects should remain
      expect(result.skills.length).toBeGreaterThan(baseSkillCount);
      const treinamentoHistoryEntry = result.sheetActionHistory.find(
        (entry) => entry.powerName === 'Treinamento em Perícia'
      );
      expect(treinamentoHistoryEntry).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty power lists', () => {
      mockSheet.generalPowers = [];
      mockSheet.classPowers = [];

      const result = recalculateSheet(mockSheet);

      expect(result).toBeDefined();
      expect(result.sheetBonuses).toHaveLength(0);
    });

    it('should handle sheet without original sheet parameter', () => {
      const esquivaPower = combatPowers.ESQUIVA;
      mockSheet.generalPowers = [esquivaPower];

      const result = recalculateSheet(mockSheet); // No originalSheet

      expect(result).toBeDefined();
      // Should still apply powers normally
      const reflexosSkill = result.completeSkills?.find(
        (skill) => skill.name === Skill.REFLEXOS
      );
      expect(reflexosSkill?.others).toBe(2);
    });

    it('should preserve basic character data during recalculation', () => {
      const originalName = mockSheet.nome;
      const originalLevel = mockSheet.nivel;

      mockSheet.generalPowers = [combatPowers.ESQUIVA];

      const result = recalculateSheet(mockSheet);

      expect(result.nome).toBe(originalName);
      expect(result.nivel).toBe(originalLevel);
    });

    it('should handle skills reset correctly', () => {
      // Manually set a skill's others field
      if (mockSheet.completeSkills) {
        const reflexosSkill = mockSheet.completeSkills.find(
          (skill) => skill.name === Skill.REFLEXOS
        );
        if (reflexosSkill) {
          reflexosSkill.others = 5; // Manual bonus
        }
      }

      // Recalculate without any powers
      const result = recalculateSheet(mockSheet);

      // The manual bonus should be reset to 0
      const reflexosSkillAfter = result.completeSkills?.find(
        (skill) => skill.name === Skill.REFLEXOS
      );
      expect(reflexosSkillAfter?.others).toBe(0);
    });
  });
});
