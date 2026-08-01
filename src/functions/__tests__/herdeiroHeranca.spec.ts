/**
 * Testes do poder Herança (origem Herdeiro).
 *
 * Herança é o único conteúdo de T20 que permite escolher o MESMO poder duas
 * vezes ("Você herdou um item de preço de até T$ 1.000. Você pode escolher este
 * poder duas vezes, para um item de até T$ 2.000." — JDA, pág. da origem
 * Herdeiro). A escolha dupla é representada por duas entradas iguais em
 * `selectedBenefits`/`origin.powers`, o que só é seguro porque o poder é inerte
 * (sem sheetActions nem sheetBonuses).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';
import { getOriginBenefits } from '../../data/systems/tormenta20/origins';
import originPowers, {
  ORIGIN_POWER_TYPE,
} from '../../data/systems/tormenta20/powers/originPowers';
import { OriginPower } from '../../interfaces/Poderes';
import { generateEmptySheet } from '../general';
import { recalculateSheet } from '../recalculateSheet';
import { applyOriginBenefits } from '../originBenefits';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import SelectOptions from '../../interfaces/SelectedOptions';
import {
  WizardSelections,
  OriginBenefit,
} from '../../interfaces/WizardSelections';
import Origin, { OriginBenefits } from '../../interfaces/Origin';
import CharacterSheet from '../../interfaces/CharacterSheet';

function getHerdeiro(): Origin {
  const origins = dataRegistry.getOriginsBySupplements([
    SupplementId.TORMENTA20_CORE,
  ]);
  const origin = origins.find((o) => o.name === 'Herdeiro');
  if (!origin) throw new Error('Herdeiro not found in registry');
  return origin;
}

const BASE_OPTIONS: SelectOptions = {
  nivel: 1,
  raca: 'Humano',
  classe: 'Guerreiro',
  origin: 'Herdeiro',
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

const HERANCA_BENEFIT: OriginBenefit = { type: 'power', name: 'Herança' };

describe('Herança (Herdeiro)', () => {
  let allBenefits: OriginBenefits;
  let herdeiro: Origin;

  beforeEach(() => {
    herdeiro = getHerdeiro();
    allBenefits = getOriginBenefits([], herdeiro, true);
  });

  describe('dados do poder', () => {
    it('Herança é poder de origem e é marcado como repetível', () => {
      expect(allBenefits.powers.origin).toHaveLength(1);

      const heranca = allBenefits.powers.origin[0];
      expect(heranca.name).toBe('Herança');
      expect(heranca.type).toBe(ORIGIN_POWER_TYPE);
      expect(heranca.allowSeveralPicks).toBe(true);
    });

    it('Comandar continua sendo poder geral do Herdeiro', () => {
      const generalPowers = allBenefits.powers.generalPowers || [];
      expect(generalPowers.map((p) => p.name)).toContain('Comandar');
    });

    it('a descrição bate com o texto do livro', () => {
      const heranca = allBenefits.powers.origin[0];
      expect(heranca.description).toContain('um item de preço de até T$ 1.000');
      expect(heranca.description).toContain(
        'duas vezes, para um item de até T$ 2.000'
      );
    });

    it('só Herança é repetível, e todo poder repetível é inerte', () => {
      const repeatable = Object.values(originPowers).filter(
        (power) => power.allowSeveralPicks
      );

      expect(repeatable.map((p) => p.name)).toEqual(['Herança']);
      repeatable.forEach((power) => {
        // Duplicar um poder com sheetBonuses empilharia os bônus duas vezes
        expect(power.sheetActions).toBeUndefined();
        expect(power.sheetBonuses).toBeUndefined();
      });
    });
  });

  describe('generateEmptySheet - escolha dupla pelo wizard', () => {
    it('Herança escolhida duas vezes gera duas entradas em origin.powers', () => {
      const wizSel = makeWizardSelections(
        [HERANCA_BENEFIT, { ...HERANCA_BENEFIT }],
        allBenefits
      );

      const sheet = generateEmptySheet(BASE_OPTIONS, wizSel);

      expect(sheet.origin?.powers).toHaveLength(2);
      sheet.origin?.powers.forEach((power) => {
        expect(power.name).toBe('Herança');
      });
      expect(sheet.origin?.selectedBenefits).toHaveLength(2);
      expect(sheet.generalPowers.some((p) => p.name === 'Herança')).toBe(false);
    });

    it('Herança escolhida uma vez gera uma entrada só', () => {
      const wizSel = makeWizardSelections([HERANCA_BENEFIT], allBenefits);

      const sheet = generateEmptySheet(BASE_OPTIONS, wizSel);

      expect(sheet.origin?.powers).toHaveLength(1);
      expect(sheet.origin?.powers[0].name).toBe('Herança');
    });
  });

  describe('applyOriginBenefits - escolha dupla pelo editor de origem', () => {
    it('mantém as duas cópias em origin.powers', () => {
      const mockSheet = createMockCharacterSheet();
      mockSheet.generalPowers = [];

      const result = applyOriginBenefits(mockSheet, herdeiro, [
        HERANCA_BENEFIT,
        { ...HERANCA_BENEFIT },
      ]);

      expect(result.origin?.powers).toHaveLength(2);
      expect(result.origin?.powers.every((p) => p.name === 'Herança')).toBe(
        true
      );
      expect(result.origin?.selectedBenefits).toHaveLength(2);
    });
  });

  describe('recalculateSheet - a segunda cópia é inerte', () => {
    function makeSheetWithHeranca(copies: number): CharacterSheet {
      const mockSheet = createMockCharacterSheet();
      mockSheet.nivel = 1;
      mockSheet.generalPowers = [];
      mockSheet.classPowers = [];
      mockSheet.sheetBonuses = [];
      mockSheet.sheetActionHistory = [];
      mockSheet.origin = {
        name: 'Herdeiro',
        powers: Array.from(
          { length: copies },
          () => ({ ...originPowers.HERANCA } as OriginPower)
        ),
      };
      return mockSheet;
    }

    it('ficha com Herança ×2 tem os mesmos atributos derivados que com ×1', () => {
      const once = recalculateSheet(makeSheetWithHeranca(1));
      const twice = recalculateSheet(makeSheetWithHeranca(2));

      expect(twice.pv).toBe(once.pv);
      expect(twice.pm).toBe(once.pm);
      expect(twice.defesa).toBe(once.defesa);
      expect(twice.sheetBonuses?.length).toBe(once.sheetBonuses?.length);
    });
  });

  describe('gerador aleatório', () => {
    it('nunca sorteia Herança duas vezes (benefícios distintos)', () => {
      for (let i = 0; i < 50; i += 1) {
        const benefits = getOriginBenefits([], herdeiro);
        const herancaCount = benefits.powers.origin.filter(
          (p) => p.name === 'Herança'
        ).length;
        expect(herancaCount).toBeLessThanOrEqual(1);
      }
    });
  });
});
