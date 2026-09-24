import { recalculateSheet } from '../recalculateSheet';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import Bag from '../../interfaces/Bag';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Equipment from '../../interfaces/Equipment';
import Skill from '../../interfaces/Skills';

/**
 * Gate de "peça de Vestuário guardada não aplica bônus"
 * (`applyEquipmentBonuses`, Step 7.3 do `recalculateSheet`).
 *
 * A regra travada aqui: `unwornClothingIds` é um conjunto de OPT-OUT — ausente
 * significa "tudo vestido". É isso que garante que nenhuma ficha criada antes
 * da feature mude de número, e que peça que entra na mochila por fora do modal
 * (recompensa, item de origem, homebrew, geração aleatória) nasça vestida.
 *
 * O gate vale SÓ para o grupo Vestuário: os outros 10 grupos seguem aplicando
 * por estarem na mochila.
 */

const camisaBufante = (over: Partial<Equipment> = {}): Equipment => ({
  id: 'camisa-1',
  nome: 'Camisa bufante',
  group: 'Vestuário',
  spaces: 1,
  preco: 25,
  sheetBonuses: [
    {
      source: { type: 'equipment', equipmentName: 'Camisa bufante' },
      target: { type: 'Skill', name: Skill.ATUACAO },
      modifier: { type: 'Fixed', value: 1 },
    },
  ],
  ...over,
});

/** Peça condicional: a condição é satisfeita pela classe da ficha de teste. */
const trajeDaClasse = (className: string): Equipment => ({
  id: 'traje-1',
  nome: 'Traje condicional de teste',
  group: 'Vestuário',
  spaces: 1,
  conditionalBonuses: [
    {
      condition: { type: 'isClass', value: className },
      bonuses: [
        {
          source: {
            type: 'equipment',
            equipmentName: 'Traje condicional de teste',
          },
          target: { type: 'Skill', name: Skill.DIPLOMACIA },
          modifier: { type: 'Fixed', value: 2 },
        },
      ],
    },
  ],
});

const colecaoDeLivros = (): Equipment => ({
  id: 'livros-1',
  nome: 'Coleção de livros',
  group: 'Vestuário',
  spaces: 1,
  selectableBonus: {
    availableSkills: [Skill.MISTICISMO],
    bonusValue: 1,
    pick: 1,
  },
  selectedBonusSkill: Skill.MISTICISMO,
});

/** Item Geral com bônus — o grupo que o gate NÃO deve tocar. */
const simboloSagrado = (): Equipment => ({
  id: 'simbolo-1',
  nome: 'Símbolo sagrado',
  group: 'Item Geral',
  spaces: 0.5,
  sheetBonuses: [
    {
      source: { type: 'equipment', equipmentName: 'Símbolo sagrado' },
      target: { type: 'Skill', name: Skill.FORTITUDE },
      modifier: { type: 'Fixed', value: 1 },
    },
  ],
});

function makeSheet(
  items: Equipment[],
  unwornClothingIds?: string[]
): CharacterSheet {
  const sheet = createMockCharacterSheet();
  const equipments = sheet.bag.getEquipments();
  items.forEach((item) => {
    (equipments[item.group] as Equipment[]).push(item);
  });
  sheet.bag = new Bag(equipments, true);
  sheet.unwornClothingIds = unwornClothingIds;
  return sheet;
}

/** Total de bônus de perícia vindos de equipamento, por nome do item. */
function equipmentSkillBonus(sheet: CharacterSheet, skill: Skill): number {
  return sheet.sheetBonuses
    .filter(
      (bonus) =>
        bonus.source.type === 'equipment' &&
        bonus.target.type === 'Skill' &&
        bonus.target.name === skill &&
        bonus.modifier.type === 'Fixed'
    )
    .reduce(
      (acc, bonus) =>
        acc + (bonus.modifier as { type: 'Fixed'; value: number }).value,
      0
    );
}

function skillOthers(sheet: CharacterSheet, skill: Skill): number {
  return sheet.completeSkills?.find((s) => s.name === skill)?.others ?? 0;
}

describe('vestuário vestido vs guardado', () => {
  test('ficha legada (sem o campo) aplica o bônus — nenhum número muda', () => {
    const sheet = recalculateSheet(makeSheet([camisaBufante()]));
    expect(equipmentSkillBonus(sheet, Skill.ATUACAO)).toBe(1);
    expect(skillOthers(sheet, Skill.ATUACAO)).toBe(1);
  });

  test('peça guardada não aplica o bônus, nem em completeSkills', () => {
    const sheet = recalculateSheet(makeSheet([camisaBufante()], ['camisa-1']));
    expect(equipmentSkillBonus(sheet, Skill.ATUACAO)).toBe(0);
    expect(skillOthers(sheet, Skill.ATUACAO)).toBe(0);
  });

  test('vestir de volta restaura o bônus', () => {
    const guardada = recalculateSheet(
      makeSheet([camisaBufante()], ['camisa-1'])
    );
    guardada.unwornClothingIds = undefined;
    const vestida = recalculateSheet(guardada);
    expect(equipmentSkillBonus(vestida, Skill.ATUACAO)).toBe(1);
  });

  test('guardar uma peça não afeta as outras vestidas', () => {
    const sheet = recalculateSheet(
      makeSheet(
        [camisaBufante(), camisaBufante({ id: 'camisa-2' })],
        ['camisa-1']
      )
    );
    expect(equipmentSkillBonus(sheet, Skill.ATUACAO)).toBe(1);
  });

  test('conditionalBonuses de peça guardada não entram', () => {
    const className = createMockCharacterSheet().classe.name;
    const vestido = recalculateSheet(makeSheet([trajeDaClasse(className)]));
    expect(equipmentSkillBonus(vestido, Skill.DIPLOMACIA)).toBe(2);

    const guardado = recalculateSheet(
      makeSheet([trajeDaClasse(className)], ['traje-1'])
    );
    expect(equipmentSkillBonus(guardado, Skill.DIPLOMACIA)).toBe(0);
  });

  test('selectableBonus de peça guardada não entra', () => {
    const vestida = recalculateSheet(makeSheet([colecaoDeLivros()]));
    expect(equipmentSkillBonus(vestida, Skill.MISTICISMO)).toBe(1);

    const guardada = recalculateSheet(
      makeSheet([colecaoDeLivros()], ['livros-1'])
    );
    expect(equipmentSkillBonus(guardada, Skill.MISTICISMO)).toBe(0);
  });

  test('peça de Vestuário SEM id sempre aplica (nunca some por acidente)', () => {
    const semId = camisaBufante({ id: undefined });
    const sheet = makeSheet([semId], ['camisa-1']);
    // O Bag carimba um id no construtor; forçar a ausência reproduz o dado
    // corrompido que o gate precisa tolerar.
    (sheet.bag.equipments.Vestuário as Equipment[]).forEach((item) => {
      // eslint-disable-next-line no-param-reassign
      delete item.id;
    });
    const result = recalculateSheet(sheet);
    expect(equipmentSkillBonus(result, Skill.ATUACAO)).toBe(1);
  });

  test('o gate NÃO alcança os outros grupos (Item Geral segue aplicando)', () => {
    const sheet = recalculateSheet(
      makeSheet([simboloSagrado()], ['simbolo-1'])
    );
    expect(equipmentSkillBonus(sheet, Skill.FORTITUDE)).toBe(1);
  });

  test('DamageReduction de equipamento continua filtrado no Step 7.3', () => {
    const capaRd = camisaBufante({
      id: 'capa-rd',
      nome: 'Capa de teste com RD',
      sheetBonuses: [
        {
          source: { type: 'equipment', equipmentName: 'Capa de teste com RD' },
          target: { type: 'DamageReduction', damageType: 'Geral' },
          modifier: { type: 'Fixed', value: 5 },
        },
      ],
    });
    const sheet = recalculateSheet(makeSheet([capaRd]));
    const rdBonuses = sheet.sheetBonuses.filter(
      (bonus) =>
        bonus.source.type === 'equipment' &&
        bonus.target.type === 'DamageReduction'
    );
    expect(rdBonuses).toHaveLength(0);
  });
});
