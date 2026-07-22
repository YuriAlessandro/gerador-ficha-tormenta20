import { describe, expect, it } from 'vitest';
import {
  GOLPE_PESSOAL_EFFECTS,
  GolpePessoalBuild,
} from '@/data/systems/tormenta20/golpePessoal';
import {
  calculateGolpePessoalCost,
  resolveGolpePessoalEffectKey,
  validateGolpePessoalBuild,
} from '@/functions/powers/golpePessoal';

const makeBuild = (
  effects: GolpePessoalBuild['effects'],
  totalCost = 0
): GolpePessoalBuild => ({
  weapon: 'Espada Longa',
  effects,
  totalCost,
  description: 'Golpe Pessoal (Espada Longa)',
});

describe('Golpe Pessoal — custos oficiais (JDA p. 66)', () => {
  it('usa os custos do livro para os efeitos corrigidos', () => {
    expect(GOLPE_PESSOAL_EFFECTS.DESTRUIDOR.cost).toBe(2);
    expect(GOLPE_PESSOAL_EFFECTS.LETAL.cost).toBe(2);
    expect(GOLPE_PESSOAL_EFFECTS.LENTO.cost).toBe(-2);
    expect(GOLPE_PESSOAL_EFFECTS.IMPACTANTE.cost).toBe(1);
    expect(GOLPE_PESSOAL_EFFECTS.TELEGUIADO.cost).toBe(1);
  });

  it('usa os nomes oficiais Impactante e Teleguiado', () => {
    expect(GOLPE_PESSOAL_EFFECTS.IMPACTANTE.name).toBe('Impactante');
    expect(GOLPE_PESSOAL_EFFECTS.TELEGUIADO.name).toBe('Teleguiado');
  });

  it('permite Letal no máximo duas vezes', () => {
    expect(GOLPE_PESSOAL_EFFECTS.LETAL.maxRepeats).toBe(2);
  });
});

describe('resolveGolpePessoalEffectKey', () => {
  it('resolve chaves legadas para as canônicas', () => {
    expect(resolveGolpePessoalEffectKey('IMPLACAVEL')).toBe('IMPACTANTE');
    expect(resolveGolpePessoalEffectKey('TELEGUIO')).toBe('TELEGUIADO');
  });

  it('mantém chaves canônicas e rejeita inexistentes', () => {
    expect(resolveGolpePessoalEffectKey('BRUTAL')).toBe('BRUTAL');
    expect(resolveGolpePessoalEffectKey('INEXISTENTE')).toBeUndefined();
  });
});

describe('calculateGolpePessoalCost', () => {
  it('recalcula builds antigos pelos custos atuais', () => {
    // Build salvo antes da correção: Brutal (1) + Destruidor (era 3) + Lento (era -1) = 3 PM
    const build = makeBuild(
      [
        { effectName: 'BRUTAL', repeats: 1 },
        { effectName: 'DESTRUIDOR', repeats: 1 },
        { effectName: 'LENTO', repeats: 1 },
      ],
      3
    );

    // Pelos valores do livro: 1 + 2 - 2 = 1 PM
    expect(calculateGolpePessoalCost(build.effects)).toBe(1);
  });

  it('calcula chaves legadas sem perder o efeito', () => {
    const build = makeBuild([
      { effectName: 'IMPLACAVEL', repeats: 1 },
      { effectName: 'TELEGUIO', repeats: 1 },
    ]);

    expect(calculateGolpePessoalCost(build.effects)).toBe(2);
  });

  it('multiplica pelo número de repetições', () => {
    const build = makeBuild([{ effectName: 'LETAL', repeats: 2 }]);

    expect(calculateGolpePessoalCost(build.effects)).toBe(4);
  });
});

describe('validateGolpePessoalBuild', () => {
  it('aceita build legado com chave antiga', () => {
    const build = makeBuild([{ effectName: 'IMPLACAVEL', repeats: 1 }], 1);

    expect(validateGolpePessoalBuild(build).isValid).toBe(true);
  });

  it('rejeita Letal com três repetições', () => {
    const build = makeBuild([{ effectName: 'LETAL', repeats: 3 }], 6);
    const result = validateGolpePessoalBuild(build);

    expect(result.isValid).toBe(false);
    expect(result.errors.join(' ')).toContain('Letal');
  });
});
