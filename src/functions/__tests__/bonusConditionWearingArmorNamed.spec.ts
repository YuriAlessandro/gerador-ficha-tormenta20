import { evaluateBonusCondition } from '../bonusConditions';
import { WORN_ARMOR_NONE } from '../../components/SheetResult/BackpackModal/wielding';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet, {
  BonusCondition,
} from '../../interfaces/CharacterSheet';
import { DefenseEquipment } from '../../interfaces/Equipment';

const armor = (nome: string, id: string): DefenseEquipment => ({
  nome,
  id,
  group: 'Armadura',
  defenseBonus: 1,
  armorPenalty: 0,
  spaces: 2,
  preco: 55,
});

const condition = (value: string): BonusCondition => ({
  combinator: 'AND',
  clauses: [{ kind: 'wearingArmorNamed', value }],
});

const buildSheet = (
  armors: DefenseEquipment[],
  wornArmorId?: string
): CharacterSheet => {
  const sheet = createMockCharacterSheet();
  sheet.bag.equipments.Armadura = armors;
  sheet.wornArmorId = wornArmorId;
  return sheet;
};

describe("cláusula 'wearingArmorNamed'", () => {
  const SENSUAL = 'Armadura sensual';

  it('verdadeira quando a armadura vestida é a nomeada', () => {
    const sheet = buildSheet(
      [armor(SENSUAL, 'a1'), armor('Brigantina', 'a2')],
      'a1'
    );
    expect(evaluateBonusCondition(sheet, condition(SENSUAL))).toBe(true);
  });

  it('falsa quando está na mochila mas outra armadura está vestida', () => {
    const sheet = buildSheet(
      [armor(SENSUAL, 'a1'), armor('Brigantina', 'a2')],
      'a2'
    );
    expect(evaluateBonusCondition(sheet, condition(SENSUAL))).toBe(false);
  });

  it('falsa quando o jogador escolheu explicitamente não vestir nada', () => {
    const sheet = buildSheet([armor(SENSUAL, 'a1')], WORN_ARMOR_NONE);
    expect(evaluateBonusCondition(sheet, condition(SENSUAL))).toBe(false);
  });

  it('verdadeira em ficha legada: armadura única e sem wornArmorId', () => {
    const sheet = buildSheet([armor(SENSUAL, 'a1')], undefined);
    expect(evaluateBonusCondition(sheet, condition(SENSUAL))).toBe(true);
  });

  it('falsa com 2 armaduras e nenhuma escolhida (ambíguo)', () => {
    const sheet = buildSheet(
      [armor(SENSUAL, 'a1'), armor('Brigantina', 'a2')],
      undefined
    );
    expect(evaluateBonusCondition(sheet, condition(SENSUAL))).toBe(false);
  });

  it('falsa sem nenhuma armadura na mochila', () => {
    const sheet = buildSheet([], undefined);
    expect(evaluateBonusCondition(sheet, condition(SENSUAL))).toBe(false);
  });

  it('negate inverte o resultado', () => {
    const sheet = buildSheet([armor(SENSUAL, 'a1')], 'a1');
    expect(
      evaluateBonusCondition(sheet, {
        combinator: 'AND',
        clauses: [{ kind: 'wearingArmorNamed', value: SENSUAL, negate: true }],
      })
    ).toBe(false);
  });
});
