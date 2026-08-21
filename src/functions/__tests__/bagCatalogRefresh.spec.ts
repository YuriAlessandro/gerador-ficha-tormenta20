import _ from 'lodash';
import { refreshBagItemsFromCatalog } from '../bagCatalogRefresh';
import { recalculateSheet } from '../recalculateSheet';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Bag from '../../interfaces/Bag';
import Equipment, { DefenseEquipment } from '../../interfaces/Equipment';
import Skill from '../../interfaces/Skills';

/**
 * A mochila é persistida por inteiro, então o item salvo é um snapshot do
 * catálogo no momento da compra. Sem este refresh, cadastrar a regra da
 * Armadura sensual só alcançaria fichas NOVAS — quem já tinha a armadura
 * continuaria sem o bônus até removê-la e comprá-la de novo.
 */
const SENSUAL = 'Armadura sensual';

/** Como o item estava salvo ANTES da regra ser cadastrada. */
const legacySensual = (): DefenseEquipment => ({
  nome: SENSUAL,
  id: 'sensual-1',
  group: 'Armadura',
  defenseBonus: 1,
  armorPenalty: 0,
  spaces: 2,
  preco: 55,
});

const buildSheet = (armor: DefenseEquipment): CharacterSheet => {
  const sheet = createMockCharacterSheet();
  sheet.bag = new Bag({ Armadura: [armor] });
  sheet.wornArmorId = armor.id;
  return sheet;
};

const others = (sheet: CharacterSheet, skill: Skill): number =>
  sheet.completeSkills?.find((s) => s.name === skill)?.others ?? 0;

describe('refreshBagItemsFromCatalog', () => {
  it('cura uma ficha antiga: a armadura passa a conceder o bônus', () => {
    const sheet = buildSheet(legacySensual());
    const armor = sheet.bag.equipments.Armadura[0];
    expect(armor.sheetBonuses).toBeUndefined();
    expect(armor.descricao).toBeUndefined();

    refreshBagItemsFromCatalog(sheet);

    expect(armor.sheetBonuses?.length).toBeGreaterThan(0);
    expect(armor.descricao).toContain('Atraente');

    const recalculated = recalculateSheet(sheet);
    expect(others(recalculated, Skill.DIPLOMACIA)).toBe(2);
  });

  it('não sobrescreve a descrição escrita pelo usuário', () => {
    const armor = { ...legacySensual(), descricao: 'Presente da minha mãe.' };
    const sheet = buildSheet(armor);

    refreshBagItemsFromCatalog(sheet);

    expect(sheet.bag.equipments.Armadura[0].descricao).toBe(
      'Presente da minha mãe.'
    );
    // Os bônus, esses, entram normalmente.
    expect(
      sheet.bag.equipments.Armadura[0].sheetBonuses?.length
    ).toBeGreaterThan(0);
  });

  it('não toca em item custom de mesmo nome', () => {
    const armor = { ...legacySensual(), isCustom: true };
    const sheet = buildSheet(armor);

    refreshBagItemsFromCatalog(sheet);

    expect(sheet.bag.equipments.Armadura[0].sheetBonuses).toBeUndefined();
    expect(sheet.bag.equipments.Armadura[0].descricao).toBeUndefined();
  });

  it('não desmonta item que o pipeline de aprimoramentos já possui', () => {
    const enhanced: DefenseEquipment = {
      ...legacySensual(),
      baseSheetBonuses: [],
      sheetBonuses: [
        {
          source: { type: 'equipment', equipmentName: SENSUAL },
          target: { type: 'Skill', name: Skill.ENGANACAO },
          modifier: { type: 'Fixed', value: 2 },
        },
      ],
    };
    const sheet = buildSheet(enhanced);

    refreshBagItemsFromCatalog(sheet);

    // Os bônus da melhoria continuam intactos.
    expect(sheet.bag.equipments.Armadura[0].sheetBonuses).toHaveLength(1);
    // Mas a descrição de catálogo, que ninguém disputa, entra.
    expect(sheet.bag.equipments.Armadura[0].descricao).toContain('Atraente');
  });

  it('é idempotente', () => {
    const sheet = buildSheet(legacySensual());
    refreshBagItemsFromCatalog(sheet);
    const first = _.cloneDeep(sheet.bag.equipments.Armadura[0]);
    refreshBagItemsFromCatalog(sheet);
    expect(sheet.bag.equipments.Armadura[0]).toEqual(first);
  });

  it('NÃO muta o objeto do catálogo (cache compartilhado)', () => {
    const catalogArmor = dataRegistry
      .getEquipmentBySupplements([
        SupplementId.TORMENTA20_CORE,
        SupplementId.TORMENTA20_HEROIS_ARTON,
      ])
      .armors.find((a) => a.nome === SENSUAL);
    if (!catalogArmor) throw new Error('Armadura sensual ausente do catálogo');

    const before = _.cloneDeep(catalogArmor);

    const sheet = buildSheet(legacySensual());
    refreshBagItemsFromCatalog(sheet);

    expect(catalogArmor).toEqual(before);
    // E o item da mochila não compartilha referência com o catálogo.
    const bagged = sheet.bag.equipments.Armadura[0];
    expect(bagged.sheetBonuses).not.toBe(catalogArmor.sheetBonuses);
    expect(bagged.sheetBonuses?.[0]).not.toBe(catalogArmor.sheetBonuses?.[0]);
  });

  it('ignora ficha com mochila vazia sem explodir', () => {
    const sheet = createMockCharacterSheet();
    sheet.bag = new Bag({});
    expect(() => refreshBagItemsFromCatalog(sheet)).not.toThrow();
  });

  it('deixa item que não existe no catálogo intacto', () => {
    const homebrew: Equipment = {
      nome: 'Espada do Vovô Zé',
      id: 'hb-1',
      group: 'Arma',
      spaces: 1,
    };
    const sheet = createMockCharacterSheet();
    sheet.bag = new Bag({ Arma: [homebrew] });

    refreshBagItemsFromCatalog(sheet);

    expect(sheet.bag.equipments.Arma[0].sheetBonuses).toBeUndefined();
  });
});
