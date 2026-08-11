import {
  getWeaponDisplayDamage,
  resolveDamageAttribute,
  weaponAttributeModifier,
} from '../weaponSkill';
import { addFlatDamageBonus } from '../weaponDamageStep';
import Equipment from '../../interfaces/Equipment';
import { CharacterAttributes } from '../../interfaces/Character';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import { Armas } from '../../data/systems/tormenta20/equipamentos';

const mkAtributos = (forca: number): CharacterAttributes => ({
  [Atributo.FORCA]: { name: Atributo.FORCA, value: forca },
  [Atributo.DESTREZA]: { name: Atributo.DESTREZA, value: 4 },
  [Atributo.CONSTITUICAO]: { name: Atributo.CONSTITUICAO, value: 0 },
  [Atributo.INTELIGENCIA]: { name: Atributo.INTELIGENCIA, value: 0 },
  [Atributo.SABEDORIA]: { name: Atributo.SABEDORIA, value: 0 },
  [Atributo.CARISMA]: { name: Atributo.CARISMA, value: 0 },
});

const atributos = mkAtributos(3);

describe('getWeaponDisplayDamage', () => {
  test('melee simples anexa o modificador de Força', () => {
    const espada: Equipment = {
      nome: 'Espada Longa',
      group: 'Arma',
      dano: '1d8',
    };
    expect(getWeaponDisplayDamage(espada, atributos)).toBe('1d8+3');
  });

  // Regressão: o early-return de arma à distância escondia o override do
  // catálogo, então a ficha mostrava menos do que a rolagem somava.
  test('Arco Longo (damageAttribute Força) exibe o modificador', () => {
    expect(getWeaponDisplayDamage(Armas.ARCO_LONGO, atributos)).toContain('+3');
  });

  test('Funda (damageAttribute Força) exibe o modificador', () => {
    expect(getWeaponDisplayDamage(Armas.FUNDA, atributos)).toContain('+3');
  });

  test('arco comum continua sem modificador', () => {
    expect(getWeaponDisplayDamage(Armas.ARCOCURTO, atributos)).toBe(
      Armas.ARCOCURTO.dano
    );
  });

  test('dano duplo recebe o modificador nos dois lados', () => {
    const versatil: Equipment = {
      nome: 'Arma versátil',
      group: 'Arma',
      dano: '1d8/1d10',
    };
    expect(getWeaponDisplayDamage(versatil, atributos)).toBe('1d8+3/1d10+3');
  });

  test('bônus já bakeado é mesclado, não concatenado', () => {
    const encantada: Equipment = {
      nome: 'Espada +2',
      group: 'Arma',
      dano: '1d8+2',
    };
    expect(getWeaponDisplayDamage(encantada, atributos)).toBe('1d8+5');
  });

  test('modificador zero não deixa "+0" pendurado', () => {
    const espada: Equipment = {
      nome: 'Espada Longa',
      group: 'Arma',
      dano: '1d8',
    };
    expect(getWeaponDisplayDamage(espada, mkAtributos(0))).toBe('1d8');
  });

  test('extraFlatBonus (efeito ativo) soma junto no mesmo termo', () => {
    const espada: Equipment = {
      nome: 'Espada Longa',
      group: 'Arma',
      dano: '1d8',
    };
    expect(getWeaponDisplayDamage(espada, atributos, 4)).toBe('1d8+7');
  });

  test('dano vazio ou "-" passa intacto', () => {
    expect(
      getWeaponDisplayDamage({ nome: 'Corda', group: 'Arma' }, atributos)
    ).toBe('');
    expect(
      getWeaponDisplayDamage(
        { nome: 'Munição', group: 'Arma', dano: '-' },
        atributos
      )
    ).toBe('-');
  });
});

/**
 * Paridade exibição × rolagem. A rolagem monta `dano + modificador` em
 * `performWeaponRoll`; a ficha e o PDF usam `getWeaponDisplayDamage`. Os dois
 * têm que chegar na MESMA string — foi a divergência entre eles que fez Arco
 * Longo e Funda mostrarem um número e rolarem outro.
 */
describe('paridade entre o dano exibido e o rolado', () => {
  const rolledDamage = (weapon: Equipment): string => {
    const attr = resolveDamageAttribute(weapon);
    const mod = weaponAttributeModifier(attr, atributos);
    return addFlatDamageBonus(weapon.dano ?? '', mod);
  };

  const cases: Equipment[] = [
    Armas.ARCO_LONGO,
    Armas.FUNDA,
    Armas.ARCOCURTO,
    { nome: 'Espada Longa', group: 'Arma', dano: '1d8' },
    { nome: 'Arma versátil', group: 'Arma', dano: '1d8/1d10' },
    { nome: 'Espada +2', group: 'Arma', dano: '1d8+2' },
  ];

  test.each(cases.map((w) => [w.nome, w] as const))(
    '%s exibe o mesmo dano que rola',
    (_nome, weapon) => {
      expect(getWeaponDisplayDamage(weapon, atributos)).toBe(
        rolledDamage(weapon)
      );
    }
  );
});
