import _ from 'lodash';
import { describe, expect, it } from 'vitest';
import generateRandomSheet, { applyManualLevelUp } from '../general';
import { recalculateSheet } from '../recalculateSheet';
import { revertLastLevel } from '../revertLevel';
import tormentaPowers from '../../data/systems/tormenta20/powers/tormentaPowers';
import combatPowers from '../../data/systems/tormenta20/powers/combatPowers';
import { findClassDescription } from '../multiclass';
import { findSchoolTargetByFamily } from '../spells/spellSchoolEditing';
import DRUIDA_POWERS from '../../data/systems/tormenta20/herois-de-arton/classPowers/druida';
import { SCHOOL_LABELS } from '../../components/SpellPicker/schoolLabels';
import { SpellSchool } from '../../interfaces/Spells';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { ClassPower } from '../../interfaces/Class';
import { GeneralPower } from '../../interfaces/Poderes';
import Skill from '../../interfaces/Skills';
import { SupplementId } from '../../types/supplement.types';

/**
 * "Desfazer" (remover poder no editor / reverter último nível) precisa tirar
 * tudo o que a ação do poder colocou fora de `sheetBonuses`: arma natural na
 * mochila (`EquipmentAdded`), magia do animal totêmico (`AnimalTotemSelected`)
 * e perícia treinada por `trainSkillOrBonus` (`SkillTrainedOrBonused`).
 */

const generate = (
  raca: string,
  classe: string,
  supplements: SupplementId[] = [SupplementId.TORMENTA20_CORE]
): CharacterSheet =>
  recalculateSheet(
    generateRandomSheet({
      nivel: 1,
      raca,
      classe,
      origin: 'Aleatório',
      devocao: { label: '--', value: '--' },
      supplements,
    })
  );

const bagNames = (sheet: CharacterSheet) =>
  sheet.bag.getOrderedEquipments().map((item) => item.nome);

// Mesmo caminho do editor de poderes: tira o poder da lista e recalcula com a
// ficha original como referência.
const removeGeneralPower = (sheet: CharacterSheet, name: string) => {
  const edited = _.cloneDeep(sheet);
  edited.generalPowers = edited.generalPowers.filter((p) => p.name !== name);
  return recalculateSheet(edited, sheet);
};

const withGeneralPower = (sheet: CharacterSheet, power: GeneralPower) => {
  const edited = _.cloneDeep(sheet);
  edited.generalPowers = [...edited.generalPowers, power];
  return recalculateSheet(edited, sheet);
};

const classPower = (className: string, name: string): ClassPower => {
  const power = findClassDescription(className)!.powers.find(
    (p) => p.name === name
  );
  if (!power) throw new Error(`Poder não encontrado: ${name}`);
  return power;
};

describe('remover poder desfaz a arma natural (EquipmentAdded)', () => {
  it('remover Dentes Afiados tira a Mordida da mochila', () => {
    const sheet = withGeneralPower(
      generate('Anão', 'Guerreiro'),
      tormentaPowers.DENTES_AFIADOS
    );
    expect(bagNames(sheet)).toContain('Mordida');

    const removed = removeGeneralPower(sheet, 'Dentes Afiados');
    expect(bagNames(removed)).not.toContain('Mordida');
  });

  it('remover Estilo Desarmado tira o Ataque Desarmado da mochila', () => {
    const sheet = withGeneralPower(
      generate('Anão', 'Guerreiro'),
      combatPowers.ESTILO_DESARMADO
    );
    expect(bagNames(sheet)).toContain('Ataque Desarmado');

    const removed = removeGeneralPower(sheet, 'Estilo Desarmado');
    expect(bagNames(removed)).not.toContain('Ataque Desarmado');
  });

  it('mantém o item quando outra fonte viva também o concedeu (Briga do Lutador)', () => {
    const lutador = generate('Anão', 'Lutador');
    expect(bagNames(lutador)).toContain('Ataque Desarmado');

    const sheet = withGeneralPower(lutador, combatPowers.ESTILO_DESARMADO);
    const removed = removeGeneralPower(sheet, 'Estilo Desarmado');
    expect(bagNames(removed)).toContain('Ataque Desarmado');
  });
});

describe('remover Totem Espiritual desfaz a magia do totem (AnimalTotemSelected)', () => {
  it('a magia do animal totêmico sai junto com o poder', () => {
    const base = generate('Anão', 'Bárbaro');
    const edited = _.cloneDeep(base);
    edited.classPowers = [
      ...(edited.classPowers ?? []),
      classPower('Bárbaro', 'Totem Espiritual'),
    ];
    const sheet = recalculateSheet(edited, base);

    const totem = sheet.sheetActionHistory
      .flatMap((entry) => entry.changes)
      .find((change) => change.type === 'AnimalTotemSelected');
    if (totem?.type !== 'AnimalTotemSelected') throw new Error('sem totem');
    expect(sheet.spells.map((s) => s.nome)).toContain(totem.spellName);

    const without = _.cloneDeep(sheet);
    without.classPowers = (without.classPowers ?? []).filter(
      (p) => p.name !== 'Totem Espiritual'
    );
    const removed = recalculateSheet(without, sheet);
    expect(removed.spells.map((s) => s.nome)).not.toContain(totem.spellName);
  });
});

describe('reverter nível do Vassalo desfaz o Valete (SkillTrainedOrBonused)', () => {
  const VALETE_SKILLS = [Skill.DIPLOMACIA, Skill.NOBREZA];

  const vassaloNv1 = (skillsTrained: boolean): CharacterSheet => {
    const base = generate('Anão', 'Vassalo', [
      SupplementId.TORMENTA20_CORE,
      SupplementId.TORMENTA20_HEROIS_ARTON,
    ]);
    expect(base.classe.name).toBe('Vassalo');
    const edited = _.cloneDeep(base);
    edited.skills = edited.skills.filter((s) => !VALETE_SKILLS.includes(s));
    if (skillsTrained) edited.skills.push(...VALETE_SKILLS);
    return recalculateSheet(edited, base);
  };

  const levelUpToTwo = (sheet: CharacterSheet) =>
    recalculateSheet(
      applyManualLevelUp(sheet, {
        level: 2,
        powerChoice: 'class',
        selectedClassPower: classPower('Cavaleiro', 'Desprezar os Covardes'),
      })
    );

  const valeteChange = (sheet: CharacterSheet) => {
    const change = sheet.sheetActionHistory
      .filter((entry) => entry.powerName === 'Valete')
      .flatMap((entry) => entry.changes)
      .find((c) => c.type === 'SkillTrainedOrBonused');
    if (change?.type !== 'SkillTrainedOrBonused') throw new Error('sem Valete');
    return change;
  };

  it('a perícia treinada pelo Valete deixa de ser treinada', () => {
    const lv2 = levelUpToTwo(vassaloNv1(false));
    const { skill, alreadyTrained } = valeteChange(lv2);
    expect(alreadyTrained).toBe(false);
    expect(lv2.skills).toContain(skill);

    const reverted = revertLastLevel(lv2);
    expect(reverted.nivel).toBe(1);
    expect(reverted.skills).not.toContain(skill);
    expect(
      reverted.completeSkills?.find((s) => s.name === skill)?.training ?? 0
    ).toBe(0);
  });

  it('perícia que já era treinada antes continua treinada', () => {
    const lv2 = levelUpToTwo(vassaloNv1(true));
    const { skill, alreadyTrained } = valeteChange(lv2);
    expect(alreadyTrained).toBe(true);

    const reverted = revertLastLevel(lv2);
    expect(reverted.nivel).toBe(1);
    expect(reverted.skills).toContain(skill);
  });
});

describe('remover Xamã Místico tira a escola acrescentada (OptionChosen)', () => {
  const HEROIS = [
    SupplementId.TORMENTA20_CORE,
    SupplementId.TORMENTA20_HEROIS_ARTON,
  ];
  const xama = () => {
    const power = DRUIDA_POWERS.find((p) => p.name === 'Xamã Místico');
    if (!power) throw new Error('Xamã Místico ausente');
    return power;
  };
  const schools = (sheet: CharacterSheet) =>
    findSchoolTargetByFamily(sheet, 'Druida')?.schools ?? [];
  const missingSchool = (sheet: CharacterSheet) => {
    const school = (Object.keys(SCHOOL_LABELS) as SpellSchool[]).find(
      (s) => !schools(sheet).includes(s)
    );
    if (!school) throw new Error('Druida já tem todas as escolas');
    return SCHOOL_LABELS[school];
  };

  it('no editor de poderes', () => {
    const base = generate('Anão', 'Druida', HEROIS);
    const edited = _.cloneDeep(base);
    edited.classPowers = [...(edited.classPowers ?? []), xama()];
    const sheet = recalculateSheet(edited, base);
    expect(schools(sheet)).toHaveLength(schools(base).length + 1);

    const without = _.cloneDeep(sheet);
    without.classPowers = (without.classPowers ?? []).filter(
      (p) => p.name !== 'Xamã Místico'
    );
    const removed = recalculateSheet(without, sheet);
    expect(schools(removed)).toEqual(schools(base));
  });

  it('ao reverter o nível em que o poder foi escolhido', () => {
    const base = generate('Anão', 'Druida', HEROIS);
    const label = missingSchool(base);
    const lv2 = recalculateSheet(
      applyManualLevelUp(base, {
        level: 2,
        powerChoice: 'class',
        selectedClassPower: xama(),
        powerEffectSelections: { 'Xamã Místico': { chosenOption: [label] } },
      })
    );
    expect(schools(lv2)).toHaveLength(schools(base).length + 1);

    const reverted = revertLastLevel(lv2);
    expect(reverted.nivel).toBe(1);
    expect(schools(reverted)).toEqual(schools(base));
  });
});

describe('item que outra fonte também concede volta à versão dela', () => {
  it('Gnoll mantém a Mordida racial (1d6) ao remover Dentes Afiados (1d4)', () => {
    const gnoll = generate('Gnoll', 'Guerreiro', [
      SupplementId.TORMENTA20_CORE,
      SupplementId.TORMENTA20_AMEACAS_ARTON,
    ]);
    const mordida = (sheet: CharacterSheet) =>
      sheet.bag
        .getOrderedEquipments()
        .filter((item) => item.nome === 'Mordida');
    expect(mordida(gnoll).map((item) => item.dano)).toEqual(['1d6']);

    const sheet = withGeneralPower(gnoll, tormentaPowers.DENTES_AFIADOS);
    expect(mordida(sheet).map((item) => item.dano)).toEqual(['1d4']);

    const removed = removeGeneralPower(sheet, 'Dentes Afiados');
    expect(mordida(removed).map((item) => item.dano)).toEqual(['1d6']);
  });
});
