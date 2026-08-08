import Equipment from '../../interfaces/Equipment';
import { CharacterAttributes } from '../../interfaces/Character';
import type { SheetBonus } from '../../interfaces/CharacterSheet';
import Bag from '../../interfaces/Bag';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import {
  evaluateSimpleModifier,
  isLiveWeaponBonus,
  isModeScopedForWeapon,
  sumLiveWeaponBonuses,
  weaponMatchesScope,
} from '../weaponBonusScope';
import { recalculateSheet } from '../recalculateSheet';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import { isFiringWeapon, isLightOrAgileMeleeWeapon } from '../weaponTraits';

const arcoLongo: Equipment = {
  nome: 'Arco Longo',
  group: 'Arma',
  dano: '1d8',
  critico: 'x3',
  alcance: 'Longo',
};
const funda: Equipment = {
  nome: 'Funda',
  group: 'Arma',
  dano: '1d4',
  critico: 'x2',
  alcance: 'Médio',
};
const adaga: Equipment = {
  nome: 'Adaga',
  group: 'Arma',
  dano: '1d4',
  critico: '19/x2',
  alcance: 'Curto',
  arremesso: true,
};
const azagaia: Equipment = {
  nome: 'Azagaia',
  group: 'Arma',
  dano: '1d6',
  critico: 'x2',
  alcance: 'Médio',
  arremesso: true,
};
const espadaCurta: Equipment = {
  nome: 'Espada Curta',
  group: 'Arma',
  dano: '1d6',
  critico: '19/x2',
  alcance: '-',
};
const espadaLonga: Equipment = {
  nome: 'Espada Longa',
  group: 'Arma',
  dano: '1d8',
  critico: 'x2',
  alcance: '-',
};

describe('weaponTraits', () => {
  it('isFiringWeapon: arma à distância NÃO de arremesso', () => {
    expect(isFiringWeapon(arcoLongo)).toBe(true);
    expect(isFiringWeapon(funda)).toBe(true);
    expect(isFiringWeapon(adaga)).toBe(false); // arremesso
    expect(isFiringWeapon(espadaLonga)).toBe(false); // corpo a corpo
  });

  it('isLightOrAgileMeleeWeapon: por nome (leve/ágil)', () => {
    expect(isLightOrAgileMeleeWeapon(adaga)).toBe(true);
    expect(isLightOrAgileMeleeWeapon(espadaCurta)).toBe(true);
    expect(isLightOrAgileMeleeWeapon(espadaLonga)).toBe(false);
    expect(isLightOrAgileMeleeWeapon(arcoLongo)).toBe(false);
  });
});

describe('weaponMatchesScope', () => {
  it('rangedOnly casa armas à distância (inclui arremesso), não corpo a corpo', () => {
    expect(weaponMatchesScope(arcoLongo, { rangedOnly: true })).toBe(true);
    expect(weaponMatchesScope(adaga, { rangedOnly: true })).toBe(true);
    expect(weaponMatchesScope(espadaLonga, { rangedOnly: true })).toBe(false);
  });

  it('firingOnly casa só armas de disparo (exclui arremesso e corpo a corpo)', () => {
    expect(weaponMatchesScope(arcoLongo, { firingOnly: true })).toBe(true);
    expect(weaponMatchesScope(funda, { firingOnly: true })).toBe(true);
    expect(weaponMatchesScope(adaga, { firingOnly: true })).toBe(false);
    expect(weaponMatchesScope(espadaLonga, { firingOnly: true })).toBe(false);
  });

  it('meleeOnly casa corpo a corpo (inclui híbrida de arremesso), não à distância pura', () => {
    expect(weaponMatchesScope(espadaLonga, { meleeOnly: true })).toBe(true);
    expect(weaponMatchesScope(adaga, { meleeOnly: true })).toBe(true);
    expect(weaponMatchesScope(arcoLongo, { meleeOnly: true })).toBe(false);
  });

  it('meleeOnly + lightOrAgileOnly casa só leves/ágeis corpo a corpo', () => {
    const scope = { meleeOnly: true, lightOrAgileOnly: true };
    expect(weaponMatchesScope(adaga, scope)).toBe(true);
    expect(weaponMatchesScope(espadaCurta, scope)).toBe(true);
    expect(weaponMatchesScope(espadaLonga, scope)).toBe(false);
    expect(weaponMatchesScope(arcoLongo, scope)).toBe(false);
  });

  it('thrownOnly casa só armas de arremesso', () => {
    expect(weaponMatchesScope(adaga, { thrownOnly: true })).toBe(true);
    expect(weaponMatchesScope(azagaia, { thrownOnly: true })).toBe(true);
    expect(weaponMatchesScope(arcoLongo, { thrownOnly: true })).toBe(false);
  });
});

describe('isModeScopedForWeapon', () => {
  it('thrownOnly é sempre por modo', () => {
    expect(isModeScopedForWeapon(adaga, { thrownOnly: true })).toBe(true);
  });

  it('melee/ranged em arma HÍBRIDA de arremesso é por modo', () => {
    expect(isModeScopedForWeapon(adaga, { meleeOnly: true })).toBe(true);
    expect(isModeScopedForWeapon(adaga, { rangedOnly: true })).toBe(true);
  });

  it('melee/ranged em arma PURA é bakeado (não por modo)', () => {
    expect(isModeScopedForWeapon(arcoLongo, { rangedOnly: true })).toBe(false);
    expect(isModeScopedForWeapon(espadaLonga, { meleeOnly: true })).toBe(false);
    expect(isModeScopedForWeapon(arcoLongo, { firingOnly: true })).toBe(false);
  });
});

describe('evaluateSimpleModifier', () => {
  const atributos: CharacterAttributes = {
    [Atributo.FORCA]: { name: Atributo.FORCA, value: 2 },
    [Atributo.DESTREZA]: { name: Atributo.DESTREZA, value: 4 },
    [Atributo.CONSTITUICAO]: { name: Atributo.CONSTITUICAO, value: 1 },
    [Atributo.INTELIGENCIA]: { name: Atributo.INTELIGENCIA, value: 3 },
    [Atributo.SABEDORIA]: { name: Atributo.SABEDORIA, value: 3 },
    [Atributo.CARISMA]: { name: Atributo.CARISMA, value: 0 },
  };

  it('Fixed retorna o valor', () => {
    expect(
      evaluateSimpleModifier({ type: 'Fixed', value: 5 }, atributos, 3)
    ).toBe(5);
  });

  it('Attribute retorna o valor do atributo (sem cap)', () => {
    expect(
      evaluateSimpleModifier(
        { type: 'Attribute', attribute: Atributo.DESTREZA },
        atributos,
        1
      )
    ).toBe(4);
  });

  it('CappedAttribute limita pelo nível', () => {
    expect(
      evaluateSimpleModifier(
        {
          type: 'CappedAttribute',
          attribute: Atributo.SABEDORIA,
          capBy: 'level',
        },
        atributos,
        1
      )
    ).toBe(1);
    expect(
      evaluateSimpleModifier(
        {
          type: 'CappedAttribute',
          attribute: Atributo.SABEDORIA,
          capBy: 'level',
        },
        atributos,
        5
      )
    ).toBe(3);
  });

  it('CappedAttribute com capBy classLevel limita pelo nível de classe', () => {
    expect(
      evaluateSimpleModifier(
        {
          type: 'CappedAttribute',
          attribute: Atributo.SABEDORIA,
          capBy: 'classLevel',
        },
        atributos,
        6,
        {
          classLevels: new Map([
            ['Bárbaro', 2],
            ['Guerreiro', 4],
          ]),
          source: { type: 'power', name: 'X', className: 'Bárbaro' },
        }
      )
    ).toBe(2);
  });

  it('modificadores não suportados retornam 0', () => {
    expect(
      evaluateSimpleModifier(
        {
          type: 'LevelBreakpoints',
          breakpoints: [{ fromLevel: 1, value: 3 }],
        },
        atributos,
        5
      )
    ).toBe(0);
  });
});

describe('evaluateSimpleModifier — LevelCalc', () => {
  const atributos: CharacterAttributes = {
    [Atributo.FORCA]: { name: Atributo.FORCA, value: 2 },
    [Atributo.DESTREZA]: { name: Atributo.DESTREZA, value: 4 },
    [Atributo.CONSTITUICAO]: { name: Atributo.CONSTITUICAO, value: 1 },
    [Atributo.INTELIGENCIA]: { name: Atributo.INTELIGENCIA, value: 3 },
    [Atributo.SABEDORIA]: { name: Atributo.SABEDORIA, value: 3 },
    [Atributo.CARISMA]: { name: Atributo.CARISMA, value: 0 },
  };

  // Instinto Selvagem (Bárbaro): +1 no 3º, +2 no 9º, +3 no 15º.
  const INSTINTO = 'Math.floor(({classLevel} + 3) / 6)';

  it('usa o nível total quando não há contexto', () => {
    expect(
      evaluateSimpleModifier(
        { type: 'LevelCalc', formula: '{level}' },
        atributos,
        5
      )
    ).toBe(5);
    expect(
      evaluateSimpleModifier(
        { type: 'LevelCalc', formula: INSTINTO },
        atributos,
        9
      )
    ).toBe(2);
  });

  // Bárbaro 3 + Guerreiro 6 = nível 9: pelo nível de classe vale +1, pelo total
  // valeria +2. Os números são escolhidos para discriminar os dois caminhos.
  const multiclasse = new Map([
    ['Bárbaro', 3],
    ['Guerreiro', 6],
  ]);

  it('multiclasse: usa o nível da CLASSE da fonte, não o total', () => {
    expect(
      evaluateSimpleModifier(
        { type: 'LevelCalc', formula: INSTINTO },
        atributos,
        9,
        {
          classLevels: multiclasse,
          source: {
            type: 'power',
            name: 'Instinto Selvagem',
            className: 'Bárbaro',
          },
        }
      )
    ).toBe(1);
  });

  it('fonte sem className cai no nível total', () => {
    expect(
      evaluateSimpleModifier(
        { type: 'LevelCalc', formula: INSTINTO },
        atributos,
        9,
        {
          classLevels: multiclasse,
          source: { type: 'power', name: 'Instinto Selvagem' },
        }
      )
    ).toBe(2);
  });

  it('fórmula reprovada pela whitelist retorna 0 sem lançar', () => {
    // Ternário oficial de "Resistência a Dano" (Bárbaro) — fora da whitelist.
    const resistenciaDano =
      '{classLevel} >= 5 ? Math.min(10, 2 + 2 * Math.floor(({classLevel} - 5) / 3)) : 0';
    expect(() =>
      evaluateSimpleModifier(
        { type: 'LevelCalc', formula: resistenciaDano },
        atributos,
        10
      )
    ).not.toThrow();
    expect(
      evaluateSimpleModifier(
        { type: 'LevelCalc', formula: resistenciaDano },
        atributos,
        10
      )
    ).toBe(0);
  });
});

/**
 * Regressão do bug relatado em ago/2026: a Fúria (e Ataque Poderoso, e Estilo
 * de Duas Mãos) gastava PM mas não mexia nos números da arma na ficha — só em
 * armas do CATÁLOGO. Armas personalizadas funcionavam.
 *
 * Causa: bônus `meleeOnly` numa arma com `arremesso: true` (Adaga, Lança,
 * Machadinha, Azagaia, Tridente) não é bakeado em `dano`/`atkBonus` pelo
 * `applyWeaponBonuses` (bakear vazaria para o modo de arremesso), e a linha da
 * arma em `Weapon.tsx` só lia os campos bakeados. Arma criada pelo
 * `CustomItemForm` nunca tem `arremesso`, então sempre era bakeada.
 */
describe('isLiveWeaponBonus / sumLiveWeaponBonuses', () => {
  const atributos: CharacterAttributes = {
    [Atributo.FORCA]: { name: Atributo.FORCA, value: 4 },
    [Atributo.DESTREZA]: { name: Atributo.DESTREZA, value: 2 },
    [Atributo.CONSTITUICAO]: { name: Atributo.CONSTITUICAO, value: 2 },
    [Atributo.INTELIGENCIA]: { name: Atributo.INTELIGENCIA, value: 0 },
    [Atributo.SABEDORIA]: { name: Atributo.SABEDORIA, value: 1 },
    [Atributo.CARISMA]: { name: Atributo.CARISMA, value: 0 },
  };
  const ctx = { atributos, nivel: 5 };

  // Lança do catálogo: corpo a corpo E arremesso.
  const lanca: Equipment = {
    nome: 'Lança',
    group: 'Arma',
    dano: '1d6',
    critico: 'x2',
    alcance: 'Curto',
    arremesso: true,
  };
  // Arma criada pelo CustomItemForm: sem `alcance`, sem `arremesso`.
  const armaCustom: Equipment = {
    nome: 'Espada do Fulano',
    group: 'Arma',
    dano: '1d8',
    critico: 'x2',
    isCustom: true,
  };

  const mkBonus = (
    target: SheetBonus['target'],
    value: number,
    source: SheetBonus['source'] = {
      type: 'activeEffect',
      powerKey: 'barbaro:furia',
      name: 'Fúria',
    }
  ): SheetBonus => ({
    source,
    target,
    modifier: { type: 'Fixed', value },
  });

  // Fúria: +2 ataque e +2 dano, corpo a corpo.
  const furia: SheetBonus[] = [
    mkBonus({ type: 'WeaponAttack', meleeOnly: true }, 2),
    mkBonus({ type: 'WeaponDamage', meleeOnly: true }, 2),
  ];

  it('arma de arremesso do catálogo: bônus é VIVO (não foi bakeado)', () => {
    expect(isLiveWeaponBonus(lanca, { meleeOnly: true }, 'activeEffect')).toBe(
      true
    );
    expect(sumLiveWeaponBonuses(lanca, furia, 'WeaponAttack', ctx)).toBe(2);
    expect(sumLiveWeaponBonuses(lanca, furia, 'WeaponDamage', ctx)).toBe(2);
  });

  it('arma de arremesso: no modo arremesso o bônus corpo a corpo não vale', () => {
    const thrown = { ...ctx, thrownMode: true };
    expect(sumLiveWeaponBonuses(lanca, furia, 'WeaponAttack', thrown)).toBe(0);
    expect(sumLiveWeaponBonuses(lanca, furia, 'WeaponDamage', thrown)).toBe(0);
  });

  it('arma corpo a corpo pura: bônus é bakeado, a linha NÃO pode somar de novo', () => {
    expect(
      isLiveWeaponBonus(espadaLonga, { meleeOnly: true }, 'activeEffect')
    ).toBe(false);
    expect(sumLiveWeaponBonuses(espadaLonga, furia, 'WeaponAttack', ctx)).toBe(
      0
    );
    expect(sumLiveWeaponBonuses(armaCustom, furia, 'WeaponDamage', ctx)).toBe(
      0
    );
  });

  it('Ataque Poderoso: a penalidade negativa também é somada ao vivo', () => {
    const ataquePoderoso = [
      mkBonus({ type: 'WeaponAttack', meleeOnly: true }, -2, {
        type: 'activeEffect',
        powerKey: 'general:ataque-poderoso',
        name: 'Ataque Poderoso',
      }),
      mkBonus({ type: 'WeaponDamage', meleeOnly: true }, 5, {
        type: 'activeEffect',
        powerKey: 'general:ataque-poderoso',
        name: 'Ataque Poderoso',
      }),
    ];
    expect(
      sumLiveWeaponBonuses(lanca, ataquePoderoso, 'WeaponAttack', ctx)
    ).toBe(-2);
    expect(
      sumLiveWeaponBonuses(lanca, ataquePoderoso, 'WeaponDamage', ctx)
    ).toBe(5);
  });

  it('arma editada manualmente: efeito ativo soma por cima, poder permanente não', () => {
    const editada: Equipment = { ...espadaLonga, hasManualEdits: true };
    const doPoder = mkBonus({ type: 'WeaponDamage' }, 3, {
      type: 'power',
      name: 'Poder Permanente',
    });

    expect(isLiveWeaponBonus(editada, {}, 'activeEffect')).toBe(true);
    expect(isLiveWeaponBonus(editada, {}, 'power')).toBe(false);
    expect(sumLiveWeaponBonuses(editada, furia, 'WeaponDamage', ctx)).toBe(2);
    expect(sumLiveWeaponBonuses(editada, [doPoder], 'WeaponDamage', ctx)).toBe(
      0
    );
  });

  it('escopo que não casa com a arma continua fora, mesmo sendo vivo', () => {
    // Estilo de Duas Mãos: `twoHandedOnly` — a Lança não é de duas mãos.
    const estiloDuasMaos = [
      mkBonus(
        { type: 'WeaponDamage', meleeOnly: true, twoHandedOnly: true },
        5,
        {
          type: 'activeEffect',
          powerKey: 'general:estilo-de-duas-maos',
          name: 'Estilo de Duas Mãos',
        }
      ),
    ];
    expect(
      sumLiveWeaponBonuses(lanca, estiloDuasMaos, 'WeaponDamage', ctx)
    ).toBe(0);
    expect(
      sumLiveWeaponBonuses(
        { ...lanca, twoHanded: true },
        estiloDuasMaos,
        'WeaponDamage',
        ctx
      )
    ).toBe(5);
  });
});

/**
 * Complementaridade com o motor: o que `applyWeaponBonuses` bakeia e o que a
 * exibição soma ao vivo têm que ser conjuntos DISJUNTOS e completos — senão o
 * bônus some da ficha ou entra duas vezes.
 */
describe('bônus vivo × baking do recalculateSheet', () => {
  const LANCA_ID = 'live-bonus-lanca';
  const ESPADA_ID = 'live-bonus-espada';

  const mkSheet = () => {
    const sheet = createMockCharacterSheet();
    sheet.bag = new Bag({
      Arma: [
        {
          id: LANCA_ID,
          nome: 'Lança',
          group: 'Arma',
          dano: '1d6',
          critico: 'x2',
          alcance: 'Curto',
          arremesso: true,
        },
        {
          id: ESPADA_ID,
          nome: 'Espada Longa',
          group: 'Arma',
          dano: '1d8',
          critico: 'x2',
          alcance: '-',
        },
      ],
    });
    sheet.activeEffects = [
      {
        instanceId: 'furia-instance',
        powerKey: 'barbaro:furia',
        name: 'Fúria',
        sourceLabel: 'Bárbaro · Fúria',
        optionId: 'furia-2',
        optionLabel: '+2 ataque e dano',
        bonuses: [
          {
            target: { type: 'WeaponAttack', meleeOnly: true },
            modifier: { type: 'Fixed', value: 2 },
          },
          {
            target: { type: 'WeaponDamage', meleeOnly: true },
            modifier: { type: 'Fixed', value: 2 },
          },
        ],
        appliedAt: '2026-01-01T00:00:00.000Z',
      },
    ];
    return sheet;
  };

  it('a Lança NÃO é bakeada, mas a soma viva devolve o bônus', () => {
    const out = recalculateSheet(mkSheet());
    const lanca = out.bag.equipments.Arma.find((w) => w.id === LANCA_ID)!;

    // Nada bakeado (o modo de arremesso não pode herdar o bônus)...
    expect(lanca.dano).toBe('1d6');
    expect(lanca.atkBonus ?? 0).toBe(0);
    // ...e é exatamente por isso que a exibição precisa somar ao vivo.
    const ctx = { atributos: out.atributos, nivel: out.nivel };
    expect(
      sumLiveWeaponBonuses(lanca, out.sheetBonuses, 'WeaponAttack', ctx)
    ).toBe(2);
    expect(
      sumLiveWeaponBonuses(lanca, out.sheetBonuses, 'WeaponDamage', ctx)
    ).toBe(2);
  });

  it('a Espada Longa é bakeada e a soma viva devolve 0 (sem dupla contagem)', () => {
    const out = recalculateSheet(mkSheet());
    const espada = out.bag.equipments.Arma.find((w) => w.id === ESPADA_ID)!;

    expect(espada.dano).toBe('1d8+2');
    expect(espada.atkBonus).toBe(2);
    const ctx = { atributos: out.atributos, nivel: out.nivel };
    expect(
      sumLiveWeaponBonuses(espada, out.sheetBonuses, 'WeaponAttack', ctx)
    ).toBe(0);
    expect(
      sumLiveWeaponBonuses(espada, out.sheetBonuses, 'WeaponDamage', ctx)
    ).toBe(0);
  });
});
