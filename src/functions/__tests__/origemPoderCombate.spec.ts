/**
 * Testes para origens que concedem "um poder à sua escolha" de um tipo específico
 * como UM ÚNICO slot de benefício:
 * - Gladiador / Soldado / Capanga / Guarda: um poder de combate à sua escolha.
 * - Assistente de Laboratório: um poder da Tormenta à sua escolha.
 *
 * Regra: o usuário pode escolher no máximo UM poder desse tipo. Antes da correção,
 * era possível pegar dois poderes de combate ao escolher essas origens.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';
import { getOriginBenefits } from '../../data/systems/tormenta20/origins';
import { GeneralPowerType } from '../../interfaces/Poderes';
import Origin from '../../interfaces/Origin';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';

function getOrigin(name: string): Origin {
  const origins = dataRegistry.getOriginsBySupplements([
    SupplementId.TORMENTA20_CORE,
  ]);
  const origin = origins.find((o) => o.name === name);
  if (!origin) throw new Error(`${name} not found in registry`);
  return origin;
}

describe('Origens com "um poder de combate à sua escolha"', () => {
  let gladiador: Origin;
  let soldado: Origin;

  beforeEach(() => {
    gladiador = getOrigin('Gladiador');
    soldado = getOrigin('Soldado');
  });

  describe('caminho do wizard (returnAllOptions = true)', () => {
    it('Gladiador deve sinalizar limitedPowerType = COMBATE', () => {
      const benefits = getOriginBenefits([], gladiador, true);
      expect(benefits.limitedPowerType).toBe(GeneralPowerType.COMBATE);
    });

    it('Soldado deve sinalizar limitedPowerType = COMBATE', () => {
      const benefits = getOriginBenefits([], soldado, true);
      expect(benefits.limitedPowerType).toBe(GeneralPowerType.COMBATE);
    });

    it('deve oferecer vários poderes de combate como opções (escolha de um)', () => {
      const benefits = getOriginBenefits([], gladiador, true);
      const combatOptions = (benefits.powers.generalPowers || []).filter(
        (p) => p.type === GeneralPowerType.COMBATE
      );
      // Mais de um disponível para escolha; a UI limita a seleção a um.
      expect(combatOptions.length).toBeGreaterThan(1);
    });
  });

  describe('caminho aleatório (returnAllOptions = false)', () => {
    it('nunca deve oferecer mais de um poder de combate (50 iterações)', () => {
      for (let i = 0; i < 50; i += 1) {
        const benefits = getOriginBenefits([], gladiador);
        const combatPowers = (benefits.powers.generalPowers || []).filter(
          (p) => p.type === GeneralPowerType.COMBATE
        );
        expect(combatPowers.length).toBeLessThanOrEqual(1);
      }
    });

    it('ao aplicar os getters, no máximo um poder de combate é concedido (50 iterações)', () => {
      for (let i = 0; i < 50; i += 1) {
        const benefits = getOriginBenefits([], gladiador);
        const sheet = createMockCharacterSheet();
        sheet.generalPowers = [];
        benefits.powers.general.forEach((getPower) => getPower(sheet, []));

        const combatGranted = sheet.generalPowers.filter(
          (p) => p.type === GeneralPowerType.COMBATE
        );
        expect(combatGranted.length).toBeLessThanOrEqual(1);
      }
    });
  });
});

describe('Assistente de Laboratório ("um poder da Tormenta à sua escolha")', () => {
  let labAssistant: Origin;

  beforeEach(() => {
    labAssistant = getOrigin('Assistente de Laboratório');
  });

  it('deve sinalizar limitedPowerType = TORMENTA no wizard', () => {
    const benefits = getOriginBenefits([], labAssistant, true);
    expect(benefits.limitedPowerType).toBe(GeneralPowerType.TORMENTA);
  });

  it('caminho aleatório nunca deve oferecer mais de um poder da Tormenta (50 iterações)', () => {
    for (let i = 0; i < 50; i += 1) {
      const benefits = getOriginBenefits([], labAssistant);
      const tormentaPowers = (benefits.powers.generalPowers || []).filter(
        (p) => p.type === GeneralPowerType.TORMENTA
      );
      expect(tormentaPowers.length).toBeLessThanOrEqual(1);
    }
  });
});
