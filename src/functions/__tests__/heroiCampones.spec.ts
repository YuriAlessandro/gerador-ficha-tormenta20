/**
 * Testes de criação de ficha com origem "Herói Camponês" via Wizard
 *
 * Herói Camponês é única entre as origens: possui 1 poder de origem
 * (Coração Heroico, type 'ORIGEM') e 3 poderes de destino (Sortudo,
 * Surto Heroico, Torcida, type DESTINO). A categorização entre poderes
 * de origem vs. gerais precisa funcionar corretamente para todas as
 * combinações de benefícios selecionados.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';
import { getOriginBenefits } from '../../data/systems/tormenta20/origins';
import { ORIGIN_POWER_TYPE } from '../../data/systems/tormenta20/powers/originPowers';
import { GeneralPowerType, OriginPower } from '../../interfaces/Poderes';
import Skill from '../../interfaces/Skills';
import { generateEmptySheet } from '../general';
import { recalculateSheet } from '../recalculateSheet';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import SelectOptions from '../../interfaces/SelectedOptions';
import {
  WizardSelections,
  OriginBenefit,
} from '../../interfaces/WizardSelections';
import Origin, { OriginBenefits } from '../../interfaces/Origin';
import CharacterSheet from '../../interfaces/CharacterSheet';

function getHeroiCampones(): Origin {
  const origins = dataRegistry.getOriginsBySupplements([
    SupplementId.TORMENTA20_CORE,
  ]);
  const origin = origins.find((o) => o.name === 'Herói Camponês');
  if (!origin) throw new Error('Herói Camponês not found in registry');
  return origin;
}

const BASE_OPTIONS: SelectOptions = {
  nivel: 1,
  raca: 'Humano',
  classe: 'Guerreiro',
  origin: 'Herói Camponês',
  devocao: { label: '--', value: '--' },
  supplements: [SupplementId.TORMENTA20_CORE],
};

function makeWizardSelections(
  originBenefits: OriginBenefit[],
  cachedOriginBenefits: OriginBenefits
): WizardSelections {
  return {
    originBenefits,
    cachedOriginBenefits,
  };
}

describe('Herói Camponês', () => {
  let allBenefits: OriginBenefits;
  let heroiCampones: Origin;

  beforeEach(() => {
    heroiCampones = getHeroiCampones();
    allBenefits = getOriginBenefits([], heroiCampones, true);
  });

  describe('getOriginBenefits - categorização de poderes', () => {
    it('Coração Heroico deve ser categorizado como poder de origem', () => {
      expect(allBenefits.powers.origin).toHaveLength(1);
      expect(allBenefits.powers.origin[0].name).toBe('Coração Heroico');
      expect(allBenefits.powers.origin[0].type).toBe(ORIGIN_POWER_TYPE);
    });

    it('Sortudo, Surto Heroico e Torcida devem ser categorizados como poderes gerais', () => {
      const generalPowers = allBenefits.powers.generalPowers || [];
      expect(generalPowers).toHaveLength(3);

      const names = generalPowers.map((p) => p.name).sort();
      expect(names).toEqual(['Sortudo', 'Surto Heroico', 'Torcida']);
      generalPowers.forEach((power) => {
        expect(power.type).toBe(GeneralPowerType.DESTINO);
      });
    });

    it('deve incluir ambas as perícias quando nenhuma está em uso', () => {
      expect(allBenefits.skills).toContain(Skill.ADESTRAMENTO);
      expect(allBenefits.skills).toContain('Ofício (Qualquer)');
    });

    it('deve excluir perícias já utilizadas', () => {
      const benefits = getOriginBenefits(
        [Skill.ADESTRAMENTO],
        heroiCampones,
        true
      );
      expect(benefits.skills).not.toContain(Skill.ADESTRAMENTO);
      expect(benefits.skills).toContain('Ofício (Qualquer)');
    });

    it('deve criar PowerGetters para poderes gerais', () => {
      expect(allBenefits.powers.general).toHaveLength(3);
      allBenefits.powers.general.forEach((getter) => {
        expect(typeof getter).toBe('function');
      });
    });
  });

  describe('generateEmptySheet - wizard selections com Herói Camponês', () => {
    it('2 perícias selecionadas: ambas devem aparecer em skills', () => {
      const wizSel = makeWizardSelections(
        [
          { type: 'skill', name: Skill.ADESTRAMENTO },
          { type: 'skill', name: 'Ofício (Qualquer)' },
        ],
        allBenefits
      );

      const sheet = generateEmptySheet(BASE_OPTIONS, wizSel);

      expect(sheet.skills).toContain(Skill.ADESTRAMENTO);
      expect(sheet.skills).toContain('Ofício (Qualquer)');
      expect(sheet.origin?.powers).toHaveLength(0);
    });

    it('1 perícia + poder de origem: Coração Heroico em origin.powers', () => {
      const wizSel = makeWizardSelections(
        [
          { type: 'skill', name: Skill.ADESTRAMENTO },
          { type: 'power', name: 'Coração Heroico' },
        ],
        allBenefits
      );

      const sheet = generateEmptySheet(BASE_OPTIONS, wizSel);

      expect(sheet.skills).toContain(Skill.ADESTRAMENTO);
      expect(sheet.origin?.powers).toHaveLength(1);
      expect(sheet.origin?.powers[0].name).toBe('Coração Heroico');
    });

    it('poder de origem + poder de destino: cada um no lugar correto', () => {
      const wizSel = makeWizardSelections(
        [
          { type: 'power', name: 'Coração Heroico' },
          { type: 'power', name: 'Sortudo' },
        ],
        allBenefits
      );

      const sheet = generateEmptySheet(BASE_OPTIONS, wizSel);

      expect(sheet.origin?.powers).toHaveLength(1);
      expect(sheet.origin?.powers[0].name).toBe('Coração Heroico');
      expect(sheet.generalPowers.some((p) => p.name === 'Sortudo')).toBe(true);
    });

    it('2 poderes de destino: ambos em generalPowers, origin.powers vazio', () => {
      const wizSel = makeWizardSelections(
        [
          { type: 'power', name: 'Sortudo' },
          { type: 'power', name: 'Surto Heroico' },
        ],
        allBenefits
      );

      const sheet = generateEmptySheet(BASE_OPTIONS, wizSel);

      expect(sheet.origin?.powers).toHaveLength(0);
      expect(sheet.generalPowers.some((p) => p.name === 'Sortudo')).toBe(true);
      expect(sheet.generalPowers.some((p) => p.name === 'Surto Heroico')).toBe(
        true
      );
    });

    it('selectedBenefits deve ser persistido na ficha', () => {
      const benefits: OriginBenefit[] = [
        { type: 'skill', name: Skill.ADESTRAMENTO },
        { type: 'power', name: 'Coração Heroico' },
      ];
      const wizSel = makeWizardSelections(benefits, allBenefits);

      const sheet = generateEmptySheet(BASE_OPTIONS, wizSel);

      expect(sheet.origin?.selectedBenefits).toEqual(benefits);
    });
  });

  describe('recalculateSheet - bônus de PM do Coração Heroico', () => {
    let mockSheet: CharacterSheet;

    beforeEach(() => {
      mockSheet = createMockCharacterSheet();
      mockSheet.nivel = 1;
      mockSheet.generalPowers = [];
      mockSheet.classPowers = [];
      mockSheet.sheetBonuses = [];
      mockSheet.sheetActionHistory = [];
    });

    it('Coração Heroico deve adicionar +3 PM no nível 1', () => {
      const baselineSheet = recalculateSheet(mockSheet);
      const basePM = baselineSheet.pm;

      mockSheet.origin = {
        name: 'Herói Camponês',
        powers: [heroiCampones.poderes[0] as unknown as OriginPower],
      };

      const result = recalculateSheet(mockSheet);
      expect(result.pm).toBe(basePM + 3);
    });

    it('sem Coração Heroico, PM base não muda', () => {
      const baselineSheet = recalculateSheet(mockSheet);
      const basePM = baselineSheet.pm;

      mockSheet.origin = {
        name: 'Herói Camponês',
        powers: [],
      };

      const result = recalculateSheet(mockSheet);
      expect(result.pm).toBe(basePM);
    });
  });
});
