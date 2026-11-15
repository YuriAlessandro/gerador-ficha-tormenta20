/**
 * Acuidade com Arma (Jogo do Ano p. 124): "Quando usa uma arma corpo a corpo
 * leve ou uma arma de arremesso, você pode usar sua Destreza em vez de Força nos
 * testes de ataque e rolagens de dano." Também vale para arma ágil ("pode ser
 * usada com Acuidade com Arma, mesmo não sendo uma arma leve") e para armas
 * naturais e ataque desarmado, que são armas leves corpo a corpo (JdA p. 143).
 *
 * Antes, só o ajuste manual no modal da arma trocava o atributo: a ficha "Jão"
 * (For 0 / Des 4) saía com Porrete +4 e 1d6+1 (Cruel) em vez de +8 e 1d6+5.
 * Porrete: arma simples corpo a corpo LEVE (Ameaças de Arton p. 394).
 */
import { describe, it, expect } from 'vitest';
import _ from 'lodash';
import { buildJao, porreteCruel } from './fixtures/fichaJao';
import { recalculateSheet } from '../recalculateSheet';
import { normalizeSheet } from '../sheetNormalizer';
import {
  getWeaponAttackSkillBonus,
  getWeaponDisplayDamage,
  resolveDamageAttribute,
  resolveEffectiveDamageAttribute,
} from '../weaponSkill';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Equipment, { WeaponAction } from '../../interfaces/Equipment';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import { Armas } from '../../data/systems/tormenta20/equipamentos';
import { AMEACAS_ARTON_WEAPONS } from '../../data/systems/tormenta20/ameacas-de-arton/equipment/weapons';

const weapon = (sheet: CharacterSheet, nome: string, index = 0): Equipment => {
  const found = sheet.bag.equipments.Arma.filter((arma) => arma.nome === nome)[
    index
  ];
  if (!found) throw new Error(`Arma ${nome} não está na ficha`);
  return found;
};

const attack = (
  sheet: CharacterSheet,
  arma: Equipment,
  action?: WeaponAction
) =>
  getWeaponAttackSkillBonus(
    arma,
    sheet.completeSkills,
    sheet.atributos,
    action
  );

const damage = (sheet: CharacterSheet, arma: Equipment) =>
  getWeaponDisplayDamage(arma, sheet.atributos);

const action = (arma: Equipment, id: string): WeaponAction => {
  const found = arma.specialActions?.find((a) => a.id === id);
  if (!found) throw new Error(`Modo ${id} não existe em ${arma.nome}`);
  return found;
};

const jaoCom = (armas: Equipment[]) => buildJao({ armas });

describe('Acuidade com Arma — automática', () => {
  it('Jão: Porrete com Cruel = +8 (2 + Des 4 + 2), 1d6+5 (1 + Des 4)', () => {
    const jao = buildJao();
    const porrete = weapon(jao, 'Porrete');

    expect(attack(jao, porrete)).toBe(8);
    expect(damage(jao, porrete)).toBe('1d6+5');
  });

  it('Jão: Porrete sem melhoria = +8, 1d6+4', () => {
    const jao = jaoCom([_.cloneDeep(AMEACAS_ARTON_WEAPONS.PORRETE)]);
    const porrete = weapon(jao, 'Porrete');

    expect(attack(jao, porrete)).toBe(8);
    expect(damage(jao, porrete)).toBe('1d6+4');
  });

  it('Jão: Marrada (arma natural = leve) = +8, 1d6+4', () => {
    const jao = buildJao();
    const marrada = weapon(jao, 'Marrada');

    expect(attack(jao, marrada)).toBe(8);
    expect(damage(jao, marrada)).toBe('1d6+4');
  });

  it('sem o poder, volta a Força: +4, 1d6+1', () => {
    const jao = buildJao();
    const semPoder = recalculateSheet({
      ...jao,
      generalPowers: jao.generalPowers.filter(
        (p) => p.name !== 'Acuidade com Arma'
      ),
    });
    const porrete = weapon(semPoder, 'Porrete');

    expect(porrete.strengthReplacement).toBeUndefined();
    expect(attack(semPoder, porrete)).toBe(4);
    expect(damage(semPoder, porrete)).toBe('1d6+1');
  });

  it('Força maior que Destreza: fica com Força', () => {
    const jao = _.cloneDeep(buildJao());
    jao.atributos[Atributo.FORCA].value = 5;
    const forte = recalculateSheet(jao);
    const porrete = weapon(forte, 'Porrete');

    expect(attack(forte, porrete)).toBe(2 + 5 + 2);
    expect(damage(forte, porrete)).toBe('1d6+6');
  });

  it('arma de uma mão que não é leve nem ágil (espada longa) usa Força', () => {
    const jao = jaoCom([_.cloneDeep(Armas.ESPADA_LONGA)]);
    const espada = weapon(jao, 'Espada Longa');

    expect(attack(jao, espada)).toBe(4);
    expect(damage(jao, espada)).toBe('1d8');
  });

  it('arma ágil (florete) usa Destreza', () => {
    const jao = jaoCom([_.cloneDeep(Armas.FLORETE)]);
    const florete = weapon(jao, 'Florete');

    expect(attack(jao, florete)).toBe(8);
    expect(damage(jao, florete)).toBe('1d6+4');
  });

  it('arma de arremesso que não é leve (lança): Destreza só ao arremessar', () => {
    const jao = jaoCom([_.cloneDeep(Armas.LANCA)]);
    const lanca = weapon(jao, 'Lança');
    const corpoACorpo = action(lanca, 'corpo-a-corpo');
    const arremessar = action(lanca, 'arremessar');

    // Linha principal e modo corpo a corpo: Luta + Força.
    expect(attack(jao, lanca)).toBe(4);
    expect(attack(jao, lanca, corpoACorpo)).toBe(4);
    expect(damage(jao, lanca)).toBe('1d6');
    expect(resolveEffectiveDamageAttribute(lanca, corpoACorpo)).toBe('Força');
    // Arremesso: dano com Destreza (o ataque já é Pontaria/Destreza).
    expect(resolveEffectiveDamageAttribute(lanca, arremessar)).toBe('Destreza');
  });

  it('arma leve de arremesso (adaga): Destreza nos dois modos', () => {
    const jao = jaoCom([_.cloneDeep(Armas.ADAGA)]);
    const adaga = weapon(jao, 'Adaga');

    expect(attack(jao, adaga, action(adaga, 'corpo-a-corpo'))).toBe(8);
    expect(
      resolveEffectiveDamageAttribute(adaga, action(adaga, 'corpo-a-corpo'))
    ).toBe('Destreza');
    expect(
      resolveEffectiveDamageAttribute(adaga, action(adaga, 'arremessar'))
    ).toBe('Destreza');
  });

  it('escolha manual do jogador diferente de Força continua valendo', () => {
    const porrete: Equipment = {
      ...porreteCruel(),
      attackAttribute: 'Sabedoria',
      damageAttribute: 'Nenhum',
    };
    const jao = jaoCom([porrete]);
    const arma = weapon(jao, 'Porrete');

    expect(attack(jao, arma)).toBe(2 - 2 + 2);
    expect(damage(jao, arma)).toBe('1d6+1');
  });

  it('o atributo cru da arma (o que os diálogos editam) não muda', () => {
    const jao = buildJao();

    expect(resolveDamageAttribute(weapon(jao, 'Porrete'))).toBe('Força');
  });

  it('ficha salva sem o carimbo abre certa (normalizeSheet)', () => {
    const salva = _.cloneDeep(buildJao());
    salva.bag.equipments.Arma.forEach((arma) => {
      // eslint-disable-next-line no-param-reassign
      delete arma.strengthReplacement;
    });
    expect(attack(salva, weapon(salva, 'Porrete'))).toBe(4);

    normalizeSheet(salva);

    expect(attack(salva, weapon(salva, 'Porrete'))).toBe(8);
    expect(damage(salva, weapon(salva, 'Porrete'))).toBe('1d6+5');
  });
});
