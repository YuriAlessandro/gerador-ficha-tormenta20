import Equipment from '../../interfaces/Equipment';
import { CharacterAttributes } from '../../interfaces/Character';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import {
  evaluateSimpleModifier,
  isModeScopedForWeapon,
  weaponMatchesScope,
} from '../weaponBonusScope';
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
