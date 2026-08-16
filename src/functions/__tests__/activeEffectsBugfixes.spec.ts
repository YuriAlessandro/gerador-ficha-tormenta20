import { recalculateSheet } from '../recalculateSheet';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Skill from '../../interfaces/Skills';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import Bag from '../../interfaces/Bag';
import {
  getEffectiveAttributeModifier,
  getEffectiveAttributes,
} from '../effectiveAttributes';
import { getWeaponDisplayDamage } from '../weaponSkill';
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

/**
 * Total EXIBIDO da perícia — mesma fórmula da `SkillTable`. É o que importa
 * agora: o delta de atributo entra pela parcela do atributo (efetivo), não mais
 * por "Outros".
 */
const skillTotal = (sheet: CharacterSheet, name: Skill): number => {
  const skill = sheet.completeSkills?.find((s) => s.name === name);
  if (!skill) return 0;
  const attr = skill.modAttr
    ? getEffectiveAttributeModifier(sheet, skill.modAttr)
    : 0;
  return (
    (skill.halfLevel ?? 0) + attr + (skill.others ?? 0) + (skill.training ?? 0)
  );
};

const weapon = (sheet: CharacterSheet) =>
  sheet.bag.equipments.Arma.find((w) => w.id === WID);

/** Dano como a ficha mostra: string bakeada + atributo efetivo do dano. */
const displayDamage = (sheet: CharacterSheet): string => {
  const w = weapon(sheet);
  if (!w) return '';
  return getWeaponDisplayDamage(w, getEffectiveAttributes(sheet));
};

describe('Bug 1 — efeito ativo de atributo alimenta o atributo EFETIVO', () => {
  it('FORCA +2 sobe as perícias de Força e o dano melee UMA vez, pelo atributo', () => {
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

    // O delta vive no atributo, não em "Outros" de cada perícia.
    expect(out.atributosTemporarios?.[Atributo.FORCA]).toBe(2);
    expect(skillOthers(out, Skill.LUTA) - skillOthers(base, Skill.LUTA)).toBe(
      0
    );
    // ...mas o TOTAL da perícia sobe 2 — e só 2 (guarda de contagem dupla).
    expect(skillTotal(out, Skill.LUTA) - skillTotal(base, Skill.LUTA)).toBe(2);
    expect(
      skillTotal(out, Skill.ATLETISMO) - skillTotal(base, Skill.ATLETISMO)
    ).toBe(2);

    // Dano melee: a Força NÃO é bakeada na string (ela entra na exibição, via
    // `getWeaponDisplayDamage`, a partir do atributo efetivo). Bakear aqui E
    // somar lá contaria em dobro.
    expect(weapon(out)?.dano).toBe('1d8');
    expect(displayDamage(out)).toBe(`1d8+${2 + 2}`); // FOR base 2 + efeito 2

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

    expect(out.atributosTemporarios?.[Atributo.DESTREZA]).toBe(2);
    expect(out.defesa - base.defesa).toBe(2);
    expect(
      skillTotal(out, Skill.REFLEXOS) - skillTotal(base, Skill.REFLEXOS)
    ).toBe(2);
    expect(out.atributos[Atributo.DESTREZA].value).toBe(1);
  });

  it('não acumula entre recálculos sucessivos', () => {
    const sheet = createMockCharacterSheet();
    sheet.activeEffects = [
      mkEffect([
        {
          target: { type: 'Attribute', attribute: Atributo.FORCA },
          modifier: { type: 'Fixed', value: 2 },
        },
      ]),
    ];
    const once = recalculateSheet(sheet);
    const twice = recalculateSheet(recalculateSheet(once));
    expect(twice.atributosTemporarios?.[Atributo.FORCA]).toBe(2);
  });

  it('efeito no formato ANTIGO (bônus Skill congelados) não conta em dobro', () => {
    const base = recalculateSheet(createMockCharacterSheet());

    // Instância salva antes da unificação: os bônus foram congelados já
    // expandidos, então não há alvo `Attribute` nenhum.
    const sheet = createMockCharacterSheet();
    sheet.activeEffects = [
      mkEffect([
        {
          target: { type: 'Skill', name: Skill.LUTA },
          modifier: { type: 'Fixed', value: 2 },
        },
        {
          target: { type: 'Skill', name: Skill.ATLETISMO },
          modifier: { type: 'Fixed', value: 2 },
        },
      ]),
    ];
    const out = recalculateSheet(sheet);

    // Continua valendo como bônus de perícia comum...
    expect(skillTotal(out, Skill.LUTA) - skillTotal(base, Skill.LUTA)).toBe(2);
    // ...e contribui ZERO para o atributo efetivo (é o que impede a dobra).
    expect(out.atributosTemporarios).toBeUndefined();
  });

  it('o campo manual `bonusAtributos` compõe com o efeito ativo', () => {
    const base = recalculateSheet(createMockCharacterSheet());

    const sheet = createMockCharacterSheet();
    sheet.bonusAtributos = { [Atributo.FORCA]: 1 };
    sheet.activeEffects = [
      mkEffect([
        {
          target: { type: 'Attribute', attribute: Atributo.FORCA },
          modifier: { type: 'Fixed', value: 2 },
        },
      ]),
    ];
    const out = recalculateSheet(sheet);

    expect(out.atributosTemporarios?.[Atributo.FORCA]).toBe(3);
    expect(skillTotal(out, Skill.LUTA) - skillTotal(base, Skill.LUTA)).toBe(3);
  });

  it('RAW: boost temporário NÃO retroage em PV nem PM máximo', () => {
    const base = recalculateSheet(createMockCharacterSheet());

    const sheet = createMockCharacterSheet();
    sheet.bonusAtributos = {
      [Atributo.CONSTITUICAO]: 4,
      [Atributo.INTELIGENCIA]: 4,
      [Atributo.SABEDORIA]: 4,
      [Atributo.CARISMA]: 4,
    };
    const out = recalculateSheet(sheet);

    expect(out.pv).toBe(base.pv);
    expect(out.pm).toBe(base.pm);
  });

  it('capacidade de carga acompanha a escala NÃO-LINEAR da Força', () => {
    // Força base −1 → 10 + (−1) = 9. Com +2, Força efetiva 1 → 10 + 2·1 = 12.
    // O delta real é +3, não 2·2=4 nem +2: prova que tem que passar pelo
    // `calculateMaxSpaces` em vez de somar o modificador.
    const sheet = createMockCharacterSheet();
    sheet.atributos[Atributo.FORCA].value = -1;
    expect(recalculateSheet(sheet).maxSpaces).toBe(9);

    sheet.bonusAtributos = { [Atributo.FORCA]: 2 };
    expect(recalculateSheet(sheet).maxSpaces).toBe(12);
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
    // A Força NÃO é bakeada: a string carrega só o aprimoramento (Atroz +2).
    expect(weapon(out)?.dano).toBe('1d8+2');
    // Na exibição entra a Força EFETIVA (base 2 + efeito 2) por cima: 1d8+6.
    expect(displayDamage(out)).toBe('1d8+6');
  });
});
