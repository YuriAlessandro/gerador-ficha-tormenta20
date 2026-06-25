import { recalculateSheet } from '../recalculateSheet';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Skill from '../../interfaces/Skills';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import Bag from '../../interfaces/Bag';
import type {
  ActiveEffect,
  ActiveEffectBonus,
} from '../../premium/interfaces/ActiveEffect';

/**
 * Regressões dos 3 bugs de efeitos ativos:
 *  1. Efeito com alvo `Attribute` não aumentava nada (sem ramo no motor).
 *  2. Efeito de ataque+dano só aplicava ataque em armas com aprimoramento
 *     (a reaplicação de aprimoramentos sobrescrevia o dano baked).
 *  (Bug 3 — prompt de magia homebrew — é coberto no spec do adapter.)
 */

const mkEffect = (bonuses: ActiveEffectBonus[]): ActiveEffect => ({
  instanceId: 'test-effect-instance',
  powerKey: 'test:effect',
  name: 'Efeito de Teste',
  sourceLabel: 'Teste · Efeito',
  optionId: 'opt-1',
  optionLabel: 'Opção',
  bonuses,
  appliedAt: '2026-01-01T00:00:00.000Z',
});

const WID = 'ae-test-weapon';

const skillOthers = (sheet: CharacterSheet, name: Skill): number =>
  sheet.completeSkills?.find((s) => s.name === name)?.others ?? 0;

const weapon = (sheet: CharacterSheet) =>
  sheet.bag.equipments.Arma.find((w) => w.id === WID);

describe('Bug 1 — efeito ativo de atributo expande para perícias/dano/Defesa', () => {
  it('FORCA +2 soma +2 nas perícias de Força e no dano de arma melee', () => {
    const base = recalculateSheet(createMockCharacterSheet());

    const sheet = createMockCharacterSheet();
    sheet.bag = new Bag({
      Arma: [{ id: WID, nome: 'Espada', group: 'Arma', dano: '1d8' }],
    });
    sheet.activeEffects = [
      mkEffect([
        {
          target: { type: 'Attribute', attribute: Atributo.FORCA },
          modifier: { type: 'Fixed', value: 2 },
        },
      ]),
    ];
    const out = recalculateSheet(sheet);

    expect(skillOthers(out, Skill.LUTA) - skillOthers(base, Skill.LUTA)).toBe(
      2
    );
    expect(
      skillOthers(out, Skill.ATLETISMO) - skillOthers(base, Skill.ATLETISMO)
    ).toBe(2);
    // Dano de arma melee recebe a Força (fora do sistema de perícias).
    expect(weapon(out)?.dano).toBe('1d8+2');
    // NUNCA muta o valor do atributo persistido.
    expect(out.atributos[Atributo.FORCA].value).toBe(2);
  });

  it('DESTREZA +2 soma +2 na Defesa e nas perícias de Destreza', () => {
    const base = recalculateSheet(createMockCharacterSheet());

    const sheet = createMockCharacterSheet();
    sheet.activeEffects = [
      mkEffect([
        {
          target: { type: 'Attribute', attribute: Atributo.DESTREZA },
          modifier: { type: 'Fixed', value: 2 },
        },
      ]),
    ];
    const out = recalculateSheet(sheet);

    expect(out.defesa - base.defesa).toBe(2);
    expect(
      skillOthers(out, Skill.REFLEXOS) - skillOthers(base, Skill.REFLEXOS)
    ).toBe(2);
    expect(out.atributos[Atributo.DESTREZA].value).toBe(1);
  });
});

describe('Bug 2 — ataque+dano de efeito ativo em arma com aprimoramento', () => {
  // Arma "Espada" 1d8 com modificações Atroz (+2 dano) e Certeira (+1 ataque).
  const enhancedSheet = (bonuses: ActiveEffectBonus[]): CharacterSheet => {
    const sheet = createMockCharacterSheet();
    sheet.bag = new Bag({
      Arma: [
        {
          id: WID,
          nome: 'Espada',
          group: 'Arma',
          dano: '1d8',
          modifications: [{ mod: 'Atroz' }, { mod: 'Certeira' }],
        },
      ],
    });
    sheet.activeEffects = [mkEffect(bonuses)];
    return sheet;
  };

  it('soma ataque E dano por cima do aprimoramento (não sobrescreve)', () => {
    const out = recalculateSheet(
      enhancedSheet([
        {
          target: { type: 'WeaponDamage' },
          modifier: { type: 'Fixed', value: 3 },
        },
        {
          target: { type: 'WeaponAttack' },
          modifier: { type: 'Fixed', value: 2 },
        },
      ])
    );
    // 1d8 + Atroz(2) + efeito(3) = 1d8+5 ; atk = Certeira(1) + efeito(2) = 3
    expect(weapon(out)?.dano).toBe('1d8+5');
    expect(weapon(out)?.atkBonus).toBe(3);
  });

  it('é idempotente em recálculos sucessivos', () => {
    const once = recalculateSheet(
      enhancedSheet([
        {
          target: { type: 'WeaponDamage' },
          modifier: { type: 'Fixed', value: 3 },
        },
        {
          target: { type: 'WeaponAttack' },
          modifier: { type: 'Fixed', value: 2 },
        },
      ])
    );
    const twice = recalculateSheet(once);
    expect(weapon(twice)?.dano).toBe('1d8+5');
    expect(weapon(twice)?.atkBonus).toBe(3);
  });

  it('arma de dano duplo recebe o bônus em cada modo', () => {
    const sheet = createMockCharacterSheet();
    sheet.bag = new Bag({
      Arma: [{ id: WID, nome: 'Bordão', group: 'Arma', dano: '1d6/1d6' }],
    });
    sheet.activeEffects = [
      mkEffect([
        {
          target: { type: 'WeaponDamage' },
          modifier: { type: 'Fixed', value: 3 },
        },
      ]),
    ];
    const out = recalculateSheet(sheet);
    // cada modo: 1d6 + efeito(3) = 1d6+3
    expect(weapon(out)?.dano).toBe('1d6+3/1d6+3');
  });

  it('arma comum (sem aprimoramento) continua recebendo dano e ataque', () => {
    const sheet = createMockCharacterSheet();
    sheet.bag = new Bag({
      Arma: [{ id: WID, nome: 'Adaga', group: 'Arma', dano: '1d4' }],
    });
    sheet.activeEffects = [
      mkEffect([
        {
          target: { type: 'WeaponDamage' },
          modifier: { type: 'Fixed', value: 3 },
        },
        {
          target: { type: 'WeaponAttack' },
          modifier: { type: 'Fixed', value: 2 },
        },
      ]),
    ];
    const out = recalculateSheet(sheet);
    expect(weapon(out)?.dano).toBe('1d4+3');
    expect(weapon(out)?.atkBonus).toBe(2);
  });

  it('arma editada manualmente NÃO recebe bônus automáticos', () => {
    const sheet = createMockCharacterSheet();
    sheet.bag = new Bag({
      Arma: [
        {
          id: WID,
          nome: 'Espada custom',
          group: 'Arma',
          dano: '1d8',
          atkBonus: 7,
          hasManualEdits: true,
        },
      ],
    });
    sheet.activeEffects = [
      mkEffect([
        {
          target: { type: 'WeaponDamage' },
          modifier: { type: 'Fixed', value: 3 },
        },
        {
          target: { type: 'WeaponAttack' },
          modifier: { type: 'Fixed', value: 2 },
        },
      ]),
    ];
    const out = recalculateSheet(sheet);
    expect(weapon(out)?.dano).toBe('1d8');
    expect(weapon(out)?.atkBonus).toBe(7);
  });
});

describe('Bug 1 + 2 — boost de Força em arma melee com aprimoramento', () => {
  it('o dano derivado de Força sobrevive em arma mágica', () => {
    const sheet = createMockCharacterSheet();
    sheet.bag = new Bag({
      Arma: [
        {
          id: WID,
          nome: 'Espada',
          group: 'Arma',
          dano: '1d8',
          modifications: [{ mod: 'Atroz' }], // +2 dano
        },
      ],
    });
    sheet.activeEffects = [
      mkEffect([
        {
          target: { type: 'Attribute', attribute: Atributo.FORCA },
          modifier: { type: 'Fixed', value: 2 },
        },
      ]),
    ];
    const out = recalculateSheet(sheet);
    // 1d8 + Atroz(2) + Força via WeaponDamage melee(2) = 1d8+4
    expect(weapon(out)?.dano).toBe('1d8+4');
  });
});
