import { cloneDeep } from 'lodash';
import { recalculateSheet } from '../recalculateSheet';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import combatPowers from '../../data/systems/tormenta20/powers/combatPowers';
import { DestinyPowers } from '../../data/systems/tormenta20/powers/destinyPowers';
import tormentaPowers from '../../data/systems/tormenta20/powers/tormentaPowers';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Skill from '../../interfaces/Skills';
import { GeneralPower, GeneralPowerType } from '../../interfaces/Poderes';
import LUTADOR from '../../data/systems/tormenta20/classes/lutador';
import Bag from '../../interfaces/Bag';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import { DefenseEquipment } from '../../interfaces/Equipment';

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

  describe('Removed power reappearing via getGeneralPower (history synthesis)', () => {
    const viscoRubro = tormentaPowers.VISCO_RUBRO;

    const linhagemRubraAbility = {
      name: 'Linhagem Rubra',
      text: 'Seu sangue foi corrompido pela Tormenta.',
      nivel: 1,
      sheetActions: [
        {
          source: { type: 'power' as const, name: 'Linhagem Rubra' },
          action: {
            type: 'getGeneralPower' as const,
            availablePowers: Object.values(tormentaPowers),
            pick: 1,
          },
        },
      ],
    };

    it('should not re-add a removed power on old sheets (no history)', () => {
      // Simulate an old sheet: has Visco Rubro from Linhagem Rubra but NO history
      mockSheet.classe.abilities = [linhagemRubraAbility];
      mockSheet.generalPowers = [viscoRubro];
      mockSheet.sheetActionHistory = []; // Old sheet - no history

      // First recalculate to establish the sheet state
      const sheetWithPower = recalculateSheet(mockSheet);
      expect(
        sheetWithPower.generalPowers.some((p) => p.name === 'Visco Rubro')
      ).toBe(true);

      // Now remove Visco Rubro
      const editedSheet = {
        ...sheetWithPower,
        generalPowers: sheetWithPower.generalPowers.filter(
          (p) => p.name !== 'Visco Rubro'
        ),
      };

      const result = recalculateSheet(editedSheet, sheetWithPower);

      // Visco Rubro must NOT reappear
      expect(result.generalPowers.some((p) => p.name === 'Visco Rubro')).toBe(
        false
      );

      // A synthetic history entry should exist for Linhagem Rubra
      const syntheticEntry = result.sheetActionHistory.find(
        (e) => e.powerName === 'Linhagem Rubra'
      );
      expect(syntheticEntry).toBeDefined();
      expect(syntheticEntry?.changes[0].type).toBe('PowerAdded');
    });

    it('should not re-add a removed power on new sheets (with history)', () => {
      // Simulate a new sheet: has history for Linhagem Rubra granting Visco Rubro
      mockSheet.classe.abilities = [linhagemRubraAbility];
      mockSheet.generalPowers = [viscoRubro];
      mockSheet.sheetActionHistory = [
        {
          source: { type: 'power', name: 'Linhagem Rubra' },
          powerName: 'Linhagem Rubra',
          changes: [{ type: 'PowerAdded', powerName: 'Visco Rubro' }],
        },
      ];

      const sheetWithPower = recalculateSheet(mockSheet);

      // Remove Visco Rubro
      const editedSheet = {
        ...sheetWithPower,
        generalPowers: sheetWithPower.generalPowers.filter(
          (p) => p.name !== 'Visco Rubro'
        ),
      };

      const result = recalculateSheet(editedSheet, sheetWithPower);

      // Visco Rubro must NOT reappear
      expect(result.generalPowers.some((p) => p.name === 'Visco Rubro')).toBe(
        false
      );
    });

    it('should not re-add removed power from race ability (Kaijin Couraça Rúbea)', () => {
      const couracaPower: GeneralPower = {
        type: GeneralPowerType.TORMENTA,
        name: 'Couraça Rúbea (Kaijin)',
        description: 'RD 2.',
        requirements: [],
      };

      const couracaAbility = {
        name: 'Couraça Rúbea',
        description: 'Aplica o poder Couraça Rúbea.',
        sheetActions: [
          {
            source: { type: 'power' as const, name: 'Couraça Rúbea' },
            action: {
              type: 'getGeneralPower' as const,
              availablePowers: [couracaPower],
              pick: 1,
            },
          },
        ],
      };

      // Set up Kaijin race with Couraça Rúbea ability
      mockSheet.raca = {
        name: 'Kaijin',
        attributes: { attrs: [] },
        faithProbability: {},
        abilities: [couracaAbility],
      };
      mockSheet.generalPowers = [couracaPower];
      // Old sheet has no history, but we need to simulate a sheet that
      // was previously saved with the power already applied.
      // We provide a minimal history so the first recalculate doesn't re-execute.
      mockSheet.sheetActionHistory = [
        {
          source: { type: 'power', name: 'Couraça Rúbea' },
          powerName: 'Couraça Rúbea',
          changes: [
            { type: 'PowerAdded', powerName: 'Couraça Rúbea (Kaijin)' },
          ],
        },
      ];

      const sheetWithPower = recalculateSheet(mockSheet);
      expect(
        sheetWithPower.generalPowers.some(
          (p) => p.name === 'Couraça Rúbea (Kaijin)'
        )
      ).toBe(true);

      // Now simulate removing the power (user edits the sheet)
      const editedSheet = {
        ...sheetWithPower,
        generalPowers: sheetWithPower.generalPowers.filter(
          (p) => p.name !== 'Couraça Rúbea (Kaijin)'
        ),
        // Simulate old sheet: clear history to test synthesis
        sheetActionHistory: [],
      };

      const result = recalculateSheet(editedSheet, sheetWithPower);

      // Power must NOT reappear
      expect(
        result.generalPowers.some((p) => p.name === 'Couraça Rúbea (Kaijin)')
      ).toBe(false);

      // A synthetic history entry should exist for Couraça Rúbea
      const syntheticEntry = result.sheetActionHistory.find(
        (e) => e.powerName === 'Couraça Rúbea'
      );
      expect(syntheticEntry).toBeDefined();
    });
  });

  describe('Casca Grossa (Lutador)', () => {
    const buildLutadorSheet = (
      level: number,
      conMod: number,
      heavyArmor = false
    ): CharacterSheet => {
      const sheet = createMockCharacterSheet();
      sheet.classe = cloneDeep(LUTADOR);
      sheet.nivel = level;
      sheet.atributos[Atributo.CONSTITUICAO].value = conMod;
      sheet.generalPowers = [];
      sheet.classPowers = [];
      sheet.sheetBonuses = [];
      sheet.sheetActionHistory = [];

      if (heavyArmor) {
        const placas: DefenseEquipment = {
          nome: 'Placas (teste)',
          group: 'Armadura',
          defenseBonus: 0,
          armorPenalty: 0,
          isHeavyArmor: true,
        };
        sheet.bag = new Bag({ Armadura: [placas] });
      } else {
        sheet.bag = new Bag();
      }

      return sheet;
    };

    const getBaselineDefense = (
      level: number,
      conMod: number,
      heavyArmor = false
    ): number => {
      // Baseline = sheet recalculated com Lutador mas SEM Casca Grossa aplicada.
      // Como o fix ainda não existe / quando o fix existir, usamos nível abaixo
      // de 3 (onde Casca Grossa não se aplica) para obter a defesa base esperada.
      const baseline = buildLutadorSheet(2, conMod, heavyArmor);
      return recalculateSheet(baseline).defesa;
    };

    it('nível 3, Con +3, sem armadura pesada: adiciona +3 (capado pelo nível)', () => {
      const sheet = buildLutadorSheet(3, 3);
      const baseline = getBaselineDefense(3, 3);

      const result = recalculateSheet(sheet);

      expect(result.defesa).toBe(baseline + 3);
    });

    it('nível 3, Con +5, sem armadura pesada: cap do nível limita o bônus a +3', () => {
      const sheet = buildLutadorSheet(3, 5);
      const baseline = getBaselineDefense(3, 5);

      const result = recalculateSheet(sheet);

      expect(result.defesa).toBe(baseline + 3);
    });

    it('nível 5, Con +3, sem armadura pesada: ainda apenas Con (+3), sem escalonamento', () => {
      const sheet = buildLutadorSheet(5, 3);
      const baseline = getBaselineDefense(5, 3);

      const result = recalculateSheet(sheet);

      expect(result.defesa).toBe(baseline + 3);
    });

    it('nível 3, Con +3, com armadura pesada: Con não soma', () => {
      const sheet = buildLutadorSheet(3, 3, true);
      const baseline = getBaselineDefense(3, 3, true);

      const result = recalculateSheet(sheet);

      expect(result.defesa).toBe(baseline);
    });

    it('nível 7, Con +3, sem armadura pesada: Con (+3) + escalonamento (+1) = +4', () => {
      const sheet = buildLutadorSheet(7, 3);
      const baseline = getBaselineDefense(7, 3);

      const result = recalculateSheet(sheet);

      expect(result.defesa).toBe(baseline + 4);
    });

    it('nível 7, Con +3, com armadura pesada: apenas o escalonamento (+1)', () => {
      const sheet = buildLutadorSheet(7, 3, true);
      const baseline = getBaselineDefense(7, 3, true);

      const result = recalculateSheet(sheet);

      expect(result.defesa).toBe(baseline + 1);
    });

    it('nível 11, Con +4, sem armadura: Con (+4) + escalonamento (+2) = +6', () => {
      const sheet = buildLutadorSheet(11, 4);
      const baseline = getBaselineDefense(11, 4);

      const result = recalculateSheet(sheet);

      expect(result.defesa).toBe(baseline + 6);
    });

    it('nível 2 (Lutador sem Casca Grossa ainda): sem bônus', () => {
      const sheetWithoutCasca = buildLutadorSheet(2, 3);
      const defaultSheet = createMockCharacterSheet();
      defaultSheet.nivel = 2;
      defaultSheet.atributos[Atributo.CONSTITUICAO].value = 3;
      defaultSheet.generalPowers = [];
      defaultSheet.classPowers = [];
      defaultSheet.sheetBonuses = [];
      defaultSheet.sheetActionHistory = [];
      defaultSheet.bag = new Bag();

      const withLutador = recalculateSheet(sheetWithoutCasca).defesa;
      const withSimple = recalculateSheet(defaultSheet).defesa;

      expect(withLutador).toBe(withSimple);
    });

    it('classe sem Casca Grossa (regressão): Con não afeta Defesa', () => {
      const sheet = createMockCharacterSheet();
      sheet.nivel = 7;
      sheet.atributos[Atributo.CONSTITUICAO].value = 5;
      sheet.generalPowers = [];
      sheet.classPowers = [];
      sheet.sheetBonuses = [];
      sheet.sheetActionHistory = [];
      sheet.bag = new Bag();
      const baselineCon0 = cloneDeep(sheet);
      baselineCon0.atributos[Atributo.CONSTITUICAO].value = 0;

      const result = recalculateSheet(sheet);
      const baseline = recalculateSheet(baselineCon0);

      expect(result.defesa).toBe(baseline.defesa);
    });
  });
});
