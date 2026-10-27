import _ from 'lodash';
import { describe, expect, it } from 'vitest';
import generateRandomSheet, { applyManualLevelUp } from '../general';
import {
  recalculateSheet,
  reverseSheetActionsForPower,
} from '../recalculateSheet';
import { applyRaceCustomizationToSheet } from '../applyRaceCustomizationToSheet';
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
import Equipment from '../../interfaces/Equipment';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import MOREAU, {
  applyMoreauCustomization,
} from '../../data/systems/tormenta20/ameacas-de-arton/races/moreau';
import { MoreauHeritageName } from '../../data/systems/tormenta20/ameacas-de-arton/races/moreau-heritages';

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

describe('itens editados pelo jogador', () => {
  const editMordida = (sheet: CharacterSheet, patch: Partial<Equipment>) => {
    const edited = _.cloneDeep(sheet);
    const equipments = _.cloneDeep(edited.bag.getEquipments());
    equipments.Arma = equipments.Arma.map((item) =>
      item.nome === 'Mordida' ? { ...item, ...patch } : item
    );
    edited.bag.setEquipments(equipments);
    return recalculateSheet(edited, sheet);
  };

  // A arma natural só existe por causa do poder (JdA p. 137): sem ele, sai
  // mesmo encantada.
  it('Mordida encantada sai junto com Dentes Afiados', () => {
    const sheet = editMordida(
      withGeneralPower(
        generate('Anão', 'Guerreiro'),
        tormentaPowers.DENTES_AFIADOS
      ),
      { enchantments: [{ enchantment: 'Formidável' }] }
    );
    expect(bagNames(sheet)).toContain('Mordida');

    const removed = removeGeneralPower(sheet, 'Dentes Afiados');
    expect(bagNames(removed)).not.toContain('Mordida');
  });

  it('Gnoll: a Mordida racial volta no mesmo lugar, com o mesmo id e as edições do jogador', () => {
    const gnoll = generate('Gnoll', 'Guerreiro', [
      SupplementId.TORMENTA20_CORE,
      SupplementId.TORMENTA20_AMEACAS_ARTON,
    ]);
    const sheet = editMordida(
      withGeneralPower(gnoll, tormentaPowers.DENTES_AFIADOS),
      { customDisplayName: 'Mandíbula' }
    );
    const before = sheet.bag
      .getOrderedEquipments()
      .find((item) => item.nome === 'Mordida');

    const removed = removeGeneralPower(sheet, 'Dentes Afiados');
    const after = removed.bag
      .getOrderedEquipments()
      .filter((item) => item.nome === 'Mordida');
    expect(after).toHaveLength(1);
    expect(after[0]).toMatchObject({
      id: before?.id,
      dano: '1d6',
      tipo: 'Perf.',
      customDisplayName: 'Mandíbula',
    });
  });
});

describe('pilhas e fontes repetidas (reversão direta)', () => {
  const POWER = 'Poder de Teste';
  const acido: Equipment = { nome: 'Ácido', group: 'Alquimía', spaces: 0.5 };

  const sheetWithStack = (inBag: number, granted: number) => {
    const sheet = generate('Anão', 'Guerreiro');
    sheet.bag.addEquipment({ Alquimía: [{ ...acido, quantity: inBag }] });
    sheet.sheetActionHistory.push({
      source: { type: 'power', name: POWER },
      powerName: POWER,
      changes: [
        {
          type: 'EquipmentAdded',
          equipment: { Alquimía: [{ ...acido, quantity: granted }] },
        },
      ],
    });
    return sheet;
  };
  const acidos = (sheet: CharacterSheet) =>
    sheet.bag.getOrderedEquipments().filter((item) => item.nome === 'Ácido');

  it('pilha maior que o concedido perde só as unidades concedidas', () => {
    const sheet = sheetWithStack(5, 2);
    reverseSheetActionsForPower(sheet, POWER);
    expect(acidos(sheet).map((item) => item.quantity)).toEqual([3]);
  });

  it('pilha igual ou menor que o concedido sai inteira', () => {
    const sheet = sheetWithStack(1, 2);
    reverseSheetActionsForPower(sheet, POWER);
    expect(acidos(sheet)).toEqual([]);
  });

  it('perícia do Valete que outra fonte viva também treinou continua treinada', () => {
    const sheet = generate('Anão', 'Guerreiro');
    sheet.skills = [
      ...sheet.skills.filter((s) => s !== Skill.NOBREZA),
      Skill.NOBREZA,
    ];
    sheet.sheetActionHistory.push(
      {
        source: { type: 'power', name: 'Valete' },
        powerName: 'Valete',
        changes: [
          {
            type: 'SkillTrainedOrBonused',
            skill: Skill.NOBREZA,
            alreadyTrained: false,
          },
        ],
      },
      {
        source: { type: 'power', name: POWER },
        powerName: POWER,
        changes: [{ type: 'SkillsAdded', skills: [Skill.NOBREZA] }],
      }
    );

    reverseSheetActionsForPower(sheet, 'Valete');
    expect(sheet.skills).toContain(Skill.NOBREZA);
  });
});

describe('fichas antigas e raça customizável', () => {
  it('Lutador sem o recibo da Briga (ficha antiga) mantém o Ataque Desarmado', () => {
    const sheet = withGeneralPower(
      generate('Anão', 'Lutador'),
      combatPowers.ESTILO_DESARMADO
    );
    sheet.sheetActionHistory = sheet.sheetActionHistory.filter(
      (entry) => entry.powerName !== 'Briga'
    );

    const removed = removeGeneralPower(sheet, 'Estilo Desarmado');
    expect(bagNames(removed)).toContain('Ataque Desarmado');
  });

  it('trocar a herança Moreau tira a arma natural da herança antiga', () => {
    const base = generate('Moreau', 'Guerreiro', [
      SupplementId.TORMENTA20_CORE,
      SupplementId.TORMENTA20_AMEACAS_ARTON,
    ]);
    const heritage = (name: MoreauHeritageName) =>
      applyMoreauCustomization(MOREAU, name, [
        Atributo.FORCA,
        Atributo.CONSTITUICAO,
      ]);
    const garras = (sheet: CharacterSheet) =>
      bagNames(sheet).filter((nome) => nome === 'Garra');

    const coruja = applyRaceCustomizationToSheet(base, heritage('Coruja'));
    expect(garras(coruja)).toEqual(['Garra']);

    // Gato também tem Garras: continua com uma só.
    const gato = applyRaceCustomizationToSheet(coruja, heritage('Gato'));
    expect(garras(gato)).toEqual(['Garra']);

    const coelho = applyRaceCustomizationToSheet(gato, heritage('Coelho'));
    expect(garras(coelho)).toEqual([]);
  });
});
