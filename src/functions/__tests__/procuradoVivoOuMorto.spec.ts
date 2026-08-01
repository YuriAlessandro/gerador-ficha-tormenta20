import _ from 'lodash';
import { recalculateSheet } from '../recalculateSheet';
import { normalizeSheet } from '../sheetNormalizer';
import { getSkillOthersBreakdown } from '../skills/skillBonusBreakdown';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet, { SheetBonus } from '../../interfaces/CharacterSheet';
import Skill from '../../interfaces/Skills';
import atlasOriginPowers from '../../data/systems/tormenta20/atlas-de-arton/powers/originPowers';
import {
  ACTIVE_POWERS,
  getActivePowerForSheetEntry,
} from '../../premium/data/activePowers';

/**
 * Origem "Procurado: Vivo ou Morto (Smokestone)" (Atlas de Arton).
 *
 * O livro condiciona AS DUAS metades do benefício — "+5 em testes de
 * Intimidação e –5 em testes de Diplomacia contra qualquer um que, a critério
 * do mestre, o reconheça e saiba de sua fama". Aplicá-las como `sheetBonus`
 * permanente grudava uma penalidade que o personagem não deveria ter (feedback
 * de usuário, ago/2026). O par virou efeito ativo; a ficha não carrega mais
 * nada, e as fichas já salvas se corrigem ao serem abertas.
 */
describe('Procurado: Vivo ou Morto', () => {
  const POWER_NAME = 'Procurado: Vivo ou Morto';
  const ORIGIN_NAME = 'Procurado: Vivo ou Morto (Smokestone)';
  const power = atlasOriginPowers.PROCURADO_VIVO_OU_MORTO;

  /** Os `sheetBonuses` que as fichas antigas embutiram (estado legado). */
  const legacyBonuses = (): SheetBonus[] => [
    {
      source: { type: 'origin', originName: ORIGIN_NAME },
      target: { type: 'Skill', name: Skill.INTIMIDACAO },
      modifier: { type: 'Fixed', value: 5 },
    },
    {
      source: { type: 'origin', originName: ORIGIN_NAME },
      target: { type: 'Skill', name: Skill.DIPLOMACIA },
      modifier: { type: 'Fixed', value: -5 },
    },
  ];

  const mkSheet = (): CharacterSheet => {
    const sheet = createMockCharacterSheet();
    sheet.origin = { name: ORIGIN_NAME, powers: [_.cloneDeep(power)] };
    sheet.sheetBonuses = [];
    sheet.sheetActionHistory = [];
    return sheet;
  };

  const othersOf = (sheet: CharacterSheet, skill: Skill): number =>
    sheet.completeSkills?.find((s) => s.name === skill)?.others ?? 0;

  describe('dado do poder', () => {
    it('não aplica mais bônus de perícia de forma permanente', () => {
      expect(power.sheetBonuses).toEqual([]);
    });

    it('mantém a proficiência com armas de fogo (incondicional no livro)', () => {
      expect(power.sheetActions).toHaveLength(1);
      expect(power.sheetActions?.[0].action).toMatchObject({
        type: 'addProficiency',
        availableProficiencies: ['Armas de Fogo'],
      });
    });

    it('mantém a condição enunciada na descrição', () => {
      expect(power.description).toContain('a critério do mestre');
    });
  });

  describe('ficha nova', () => {
    it('não recebe ±5 em Diplomacia/Intimidação ao recalcular', () => {
      const recalculated = recalculateSheet(mkSheet());

      expect(othersOf(recalculated, Skill.INTIMIDACAO)).toBe(0);
      expect(othersOf(recalculated, Skill.DIPLOMACIA)).toBe(0);
    });

    it('não deixa nenhuma parcela da origem no detalhamento do "Outros"', () => {
      const recalculated = recalculateSheet(mkSheet());
      const diplomacia = recalculated.completeSkills?.find(
        (s) => s.name === Skill.DIPLOMACIA
      );

      const breakdown = getSkillOthersBreakdown(recalculated, diplomacia!);
      expect(breakdown.some((entry) => entry.label === ORIGIN_NAME)).toBe(
        false
      );
    });
  });

  describe('efeito ativo', () => {
    const definition = ACTIVE_POWERS.find(
      (def) => def.key === 'origin:procurado-vivo-ou-morto'
    );

    it('está no registry e casa com o poder da ficha em qualquer classe', () => {
      expect(definition).toBeDefined();
      expect(getActivePowerForSheetEntry('Guerreiro', POWER_NAME)?.key).toBe(
        'origin:procurado-vivo-ou-morto'
      );
      expect(getActivePowerForSheetEntry('Bardo', POWER_NAME)?.key).toBe(
        'origin:procurado-vivo-ou-morto'
      );
    });

    it('oferece um único tier, sem custo de PM, com os dois lados juntos', () => {
      const [option, ...rest] = definition!.getUsageOptions(mkSheet());

      expect(rest).toHaveLength(0);
      expect(option.pmCost).toBe(0);
      expect(option.bonuses).toEqual([
        {
          target: { type: 'Skill', name: Skill.INTIMIDACAO },
          modifier: { type: 'Fixed', value: 5 },
        },
        {
          target: { type: 'Skill', name: Skill.DIPLOMACIA },
          modifier: { type: 'Fixed', value: -5 },
        },
      ]);
    });

    it('não aparece para fichas sem a origem', () => {
      const semOrigem = createMockCharacterSheet();
      expect(definition!.getUsageOptions(semOrigem)).toEqual([]);
    });

    it('aparece na adição manual mesmo sem a origem (ignoreRequirements)', () => {
      const semOrigem = createMockCharacterSheet();
      expect(
        definition!.getUsageOptions(semOrigem, { ignoreRequirements: true })
      ).toHaveLength(1);
    });

    it('aplica os ±5 quando ativo, creditados ao efeito ativo', () => {
      const sheet = mkSheet();
      const [option] = definition!.getUsageOptions(sheet);
      sheet.activeEffects = [
        {
          instanceId: 'test-effect',
          powerKey: definition!.key,
          name: definition!.name,
          sourceLabel: definition!.sourceLabel,
          optionId: option.id,
          optionLabel: option.label,
          bonuses: option.bonuses,
          appliedAt: '2026-08-01T00:00:00.000Z',
        },
      ];

      const recalculated = recalculateSheet(sheet);

      expect(othersOf(recalculated, Skill.INTIMIDACAO)).toBe(5);
      expect(othersOf(recalculated, Skill.DIPLOMACIA)).toBe(-5);
      expect(
        recalculated.sheetBonuses.filter(
          (b) => b.source.type === 'activeEffect'
        )
      ).toHaveLength(2);
    });
  });

  describe('migração de fichas salvas', () => {
    /**
     * Estado exato de uma ficha antiga: a cópia embutida do poder carrega os
     * bônus, `sheetBonuses` tem as entradas aplicadas e `completeSkills` tem o
     * número já somado. Abrir a ficha não dispara recálculo, então normalizar
     * precisa desfazer os três.
     */
    const mkLegacySheet = (): CharacterSheet => {
      const sheet = createMockCharacterSheet();
      sheet.origin = {
        name: ORIGIN_NAME,
        powers: [{ ..._.cloneDeep(power), sheetBonuses: legacyBonuses() }],
      };
      sheet.sheetBonuses = legacyBonuses();
      sheet.sheetActionHistory = [];
      sheet.completeSkills = sheet.completeSkills?.map((skill) => {
        if (skill.name === Skill.INTIMIDACAO) return { ...skill, others: 5 };
        if (skill.name === Skill.DIPLOMACIA) return { ...skill, others: -5 };
        return skill;
      });
      return sheet;
    };

    it('limpa a cópia embutida, os sheetBonuses e o "Outros" ao carregar', () => {
      const sheet = mkLegacySheet();

      normalizeSheet(sheet);

      expect(sheet.origin?.powers[0].sheetBonuses).toEqual([]);
      expect(sheet.sheetBonuses).toEqual([]);
      expect(othersOf(sheet, Skill.INTIMIDACAO)).toBe(0);
      expect(othersOf(sheet, Skill.DIPLOMACIA)).toBe(0);
    });

    it('é idempotente — normalizar de novo não muda nada', () => {
      const sheet = mkLegacySheet();

      normalizeSheet(sheet);
      const afterFirst = _.cloneDeep(sheet.completeSkills);
      normalizeSheet(sheet);

      expect(sheet.completeSkills).toEqual(afterFirst);
      expect(sheet.sheetBonuses).toEqual([]);
    });

    it('não mexe em bônus de outras fontes na mesma perícia', () => {
      const sheet = mkLegacySheet();
      const outro: SheetBonus = {
        source: { type: 'power', name: 'Outro Poder' },
        target: { type: 'Skill', name: Skill.DIPLOMACIA },
        modifier: { type: 'Fixed', value: 2 },
      };
      sheet.sheetBonuses.push(outro);
      sheet.completeSkills = sheet.completeSkills?.map((skill) =>
        skill.name === Skill.DIPLOMACIA ? { ...skill, others: -3 } : skill
      );

      normalizeSheet(sheet);

      expect(sheet.sheetBonuses).toEqual([outro]);
      expect(othersOf(sheet, Skill.DIPLOMACIA)).toBe(2);
    });

    it('preserva o ajuste manual do usuário', () => {
      const sheet = mkLegacySheet();
      sheet.completeSkills = sheet.completeSkills?.map((skill) =>
        skill.name === Skill.INTIMIDACAO
          ? { ...skill, manualOthers: 3, others: 8 }
          : skill
      );

      normalizeSheet(sheet);

      const intimidacao = sheet.completeSkills?.find(
        (s) => s.name === Skill.INTIMIDACAO
      );
      expect(intimidacao?.manualOthers).toBe(3);
      expect(intimidacao?.others).toBe(3);
    });
  });
});
