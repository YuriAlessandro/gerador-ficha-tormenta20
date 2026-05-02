import { resolveDamageAttribute } from '../weaponSkill';
import Equipment from '../../interfaces/Equipment';
import { Armas } from '../../data/systems/tormenta20/equipamentos';
import { HEROIS_ARTON_WEAPONS } from '../../data/systems/tormenta20/herois-de-arton/equipment/weapons';
import { AMEACAS_ARTON_WEAPONS } from '../../data/systems/tormenta20/ameacas-de-arton/equipment/weapons';

describe('resolveDamageAttribute', () => {
  test('arma corpo-a-corpo padrão soma Força', () => {
    const espada: Equipment = {
      nome: 'Espada Longa',
      group: 'Arma',
      alcance: '-',
    };
    expect(resolveDamageAttribute(espada)).toBe('Força');
  });

  test('arma a distância padrão não soma atributo', () => {
    const arcoCurto = Armas.ARCOCURTO;
    expect(resolveDamageAttribute(arcoCurto)).toBe('Nenhum');
  });

  test('Funda soma Força (override do catálogo)', () => {
    expect(resolveDamageAttribute(Armas.FUNDA)).toBe('Força');
  });

  test('Arco Longo soma Força (override do catálogo)', () => {
    expect(resolveDamageAttribute(Armas.ARCO_LONGO)).toBe('Força');
  });

  test('Arco de Guerra (HdA) soma Força', () => {
    expect(resolveDamageAttribute(HEROIS_ARTON_WEAPONS.ARCO_DE_GUERRA)).toBe(
      'Força'
    );
  });

  test('Balestra (HdA) soma Força', () => {
    expect(resolveDamageAttribute(HEROIS_ARTON_WEAPONS.BALESTRA)).toBe('Força');
  });

  test('Adaga corpo-a-corpo soma Força; arremessar não soma', () => {
    const adaga = Armas.ADAGA;
    const corpoACorpo = adaga.specialActions?.find(
      (a) => a.id === 'corpo-a-corpo'
    );
    const arremessar = adaga.specialActions?.find((a) => a.id === 'arremessar');
    expect(resolveDamageAttribute(adaga, corpoACorpo)).toBe('Força');
    expect(resolveDamageAttribute(adaga, arremessar)).toBe('Nenhum');
  });

  test('Lança de Fogo: corpo-a-corpo soma Força, tiro não soma', () => {
    const lf = AMEACAS_ARTON_WEAPONS.LANCA_DE_FOGO;
    const melee = lf.specialActions?.find((a) => a.id === 'corpo-a-corpo');
    const tiro = lf.specialActions?.find((a) => a.id === 'tiro');
    expect(resolveDamageAttribute(lf, melee)).toBe('Força');
    expect(resolveDamageAttribute(lf, tiro)).toBe('Nenhum');
  });

  test('override em weapon level prevalece sobre default', () => {
    const customRanged: Equipment = {
      nome: 'Arco custom',
      group: 'Arma',
      alcance: 'Médio',
      damageAttribute: 'Força',
    };
    expect(resolveDamageAttribute(customRanged)).toBe('Força');
  });

  test('override em action prevalece sobre weapon-level', () => {
    const weapon: Equipment = {
      nome: 'Test',
      group: 'Arma',
      damageAttribute: 'Força',
    };
    const action = { id: 'a', label: 'A', damageAttribute: 'Nenhum' as const };
    expect(resolveDamageAttribute(weapon, action)).toBe('Nenhum');
  });

  test('aceita Destreza, Constituição e demais atributos', () => {
    const weapon: Equipment = {
      nome: 'Adaga finesse',
      group: 'Arma',
      damageAttribute: 'Destreza',
    };
    expect(resolveDamageAttribute(weapon)).toBe('Destreza');

    const carisma: Equipment = {
      nome: 'Foco arcano',
      group: 'Arma',
      damageAttribute: 'Carisma',
    };
    expect(resolveDamageAttribute(carisma)).toBe('Carisma');
  });
});
