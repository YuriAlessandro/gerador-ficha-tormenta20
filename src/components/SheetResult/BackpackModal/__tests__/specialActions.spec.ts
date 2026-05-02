import { Armas } from '../../../../data/systems/tormenta20/equipamentos';
import { HEROIS_ARTON_WEAPONS } from '../../../../data/systems/tormenta20/herois-de-arton/equipment/weapons';
import { AMEACAS_ARTON_WEAPONS } from '../../../../data/systems/tormenta20/ameacas-de-arton/equipment/weapons';
import { stepUpDamage } from '../../../../functions/weaponDamageStep';

describe('Catálogo: specialActions tagging', () => {
  test.each([
    ['ADAGA', ['corpo-a-corpo', 'arremessar']],
    ['LANCA', ['corpo-a-corpo', 'arremessar']],
    ['MACHADINHA', ['corpo-a-corpo', 'arremessar']],
    ['TRIDENTE', ['corpo-a-corpo', 'arremessar']],
  ])('%s expõe modos corpo-a-corpo + arremessar', (key, expected) => {
    const weapon = Armas[key];
    expect(weapon.specialActions).toBeDefined();
    expect(weapon.specialActions?.map((a) => a.id).sort()).toEqual(
      expected.sort()
    );
  });

  test('Azagaia possui penalidade -5 ao corpo a corpo', () => {
    const azagaia = Armas.AZAGAIA;
    const meleeAction = azagaia.specialActions?.find(
      (a) => a.id === 'corpo-a-corpo'
    );
    expect(meleeAction?.atkBonusDelta).toBe(-5);
    expect(meleeAction?.skill).toBe('Luta');
  });

  test('Funda fallback de pedra improvisada reduz 1 passo de dano e ignora munição', () => {
    const funda = Armas.FUNDA;
    const fallback = funda.specialActions?.find(
      (a) => a.id === 'pedra-improvisada'
    );
    expect(fallback?.damageStepDelta).toBe(-1);
    expect(fallback?.skipAmmo).toBe(true);
  });

  test('Lança de Fogo: modo corpo-a-corpo aciona +2d8 (consome Bala)', () => {
    const lancaFogo = AMEACAS_ARTON_WEAPONS.LANCA_DE_FOGO;
    const melee = lancaFogo.specialActions?.find(
      (a) => a.id === 'corpo-a-corpo'
    );
    expect(melee?.trigger?.extraDamage).toBe('2d8');
    expect(melee?.trigger?.consumesAmmo).toBe('Balas');
    expect(melee?.skipAmmo).toBe(true);

    const tiro = lancaFogo.specialActions?.find((a) => a.id === 'tiro');
    expect(tiro?.dano).toBe('2d8');
    expect(tiro?.skill).toBe('Pontaria');
  });

  test('Pistola-Punhal: modo corpo-a-corpo aciona +2d6', () => {
    const pp = AMEACAS_ARTON_WEAPONS.PISTOLA_PUNHAL;
    const melee = pp.specialActions?.find((a) => a.id === 'corpo-a-corpo');
    expect(melee?.trigger?.extraDamage).toBe('2d6');
    expect(melee?.trigger?.consumesAmmo).toBe('Balas');
  });

  test('Martelo Leve (HdA) é arremessável', () => {
    const ml = HEROIS_ARTON_WEAPONS.MARTELO_LEVE;
    expect(ml.specialActions?.map((a) => a.id).sort()).toEqual(
      ['arremessar', 'corpo-a-corpo'].sort()
    );
  });
});

describe('stepUpDamage com damageStepDelta negativo', () => {
  test('Funda 1d4 -1 passo vira 1d3', () => {
    expect(stepUpDamage('1d4', -1)).toBe('1d3');
  });

  test('1d8 -2 passos vira 1d4', () => {
    expect(stepUpDamage('1d8', -2)).toBe('1d4');
  });

  test('clampa no mínimo da escala', () => {
    expect(stepUpDamage('1d2', -10)).toBe('1');
  });
});
