import cloneDeep from 'lodash/cloneDeep';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import { recalculateSheet } from '../recalculateSheet';
import Bag from '../../interfaces/Bag';
import { DefenseEquipment } from '../../interfaces/Equipment';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';
import { buildEquipmentCatalog } from '../../components/SheetResult/BackpackModal/equipmentCatalog';
import {
  compileItem,
  compileItemPackContent,
  compileItemPackHomebrew,
} from '../../premium/functions/compileItemPackage';
import { validateHomebrew } from '../../premium/functions/homebrewValidation';
import {
  HOMEBREW_SCHEMA_VERSION,
  HomebrewItemPackContent,
} from '../../premium/interfaces/Homebrew';
import Skill from '../../interfaces/Skills';

/**
 * Cobre o Pacote de Itens homebrew de ponta a ponta: compilação para
 * `SupplementEquipment`, injeção no registry (Mercado/Mochila leem
 * `getEquipmentBySupplements`), carimbo de origem, não-mutação do catálogo
 * compartilhado e chegada dos bônus do item na ficha.
 */
describe('homebrew item package', () => {
  const SOURCE_ID = 'homebrew:test-items';
  const PACK_NAME = 'Arsenal de Teste';

  const content: HomebrewItemPackContent = {
    items: [
      {
        category: 'weapon',
        name: 'Lâmina do Testador',
        description: 'Uma espada forjada para validar compiladores.',
        price: 120,
        spaces: 1,
        damage: '1d8',
        critMultiplier: 3,
        threatMargin: 19,
        damageType: 'Corte',
        weaponCategory: 'martial',
        range: '-',
        weaponTags: ['teste'],
        atkBonus: 1,
      },
      {
        category: 'armor',
        name: 'Cota de Provas',
        price: 200,
        spaces: 5,
        defenseBonus: 6,
        armorPenalty: -2,
        isHeavyArmor: true,
      },
      {
        category: 'shield',
        name: 'Broquel de Regressão',
        price: 30,
        spaces: 2,
        defenseBonus: 2,
        armorPenalty: -1,
      },
      {
        category: 'generalItem',
        name: 'Kit do Depurador',
        description: 'Ferramentas finas para achar bugs.',
        price: 50,
        spaces: 2,
        sheetBonuses: [
          {
            // O compilador reescreve o source; aqui usamos um placeholder para
            // provar que a normalização acontece.
            source: { type: 'manualEdit' },
            target: { type: 'Skill', name: Skill.OFICIO },
            modifier: { type: 'Fixed', value: 2 },
          },
        ],
        rolls: [{ label: 'Teste de Depuração', dice: '1d20' }],
      },
    ],
  };

  const activeSupplements = [
    SupplementId.TORMENTA20_CORE,
    SOURCE_ID as SupplementId,
  ];

  beforeAll(() => {
    dataRegistry.registerRuntimeSupplement(
      SOURCE_ID,
      compileItemPackHomebrew(content, PACK_NAME, SOURCE_ID)
    );
  });

  afterAll(() => {
    dataRegistry.unregisterRuntimeSupplement(SOURCE_ID);
  });

  it('compiles items into the right SupplementEquipment buckets', () => {
    const equipment = compileItemPackContent(content);

    expect(Object.keys(equipment.weapons ?? {})).toEqual([
      'Lâmina do Testador',
    ]);
    // Escudo e armadura compartilham o bucket `armors`; o registry os separa
    // depois pelo `group`.
    expect(Object.keys(equipment.armors ?? {}).sort()).toEqual([
      'Broquel de Regressão',
      'Cota de Provas',
    ]);
    expect(equipment.generalItems).toHaveLength(1);

    expect(equipment.armors?.['Broquel de Regressão'].group).toBe('Escudo');
    expect(equipment.armors?.['Cota de Provas'].group).toBe('Armadura');
  });

  it('builds the critico string from multiplier and threat margin', () => {
    const weapon = compileItem(content.items[0]);
    expect(weapon.critico).toBe('19/x3');

    const plain = compileItem({
      ...content.items[0],
      critMultiplier: 2,
      threatMargin: 20,
    });
    expect(plain.critico).toBe('x2');
  });

  it('gives a thrown weapon both attack modes', () => {
    // `arremesso` sozinho só classifica a arma (e força Luta em
    // getWeaponSkill); é `specialActions` que abre o seletor de modo.
    const weapon = compileItem({ ...content.items[0], thrown: true });

    expect(weapon.arremesso).toBe(true);
    expect(weapon.specialActions).toEqual([
      { id: 'corpo-a-corpo', label: 'Corpo a corpo', skill: 'Luta' },
      {
        id: 'arremessar',
        label: 'Arremessar',
        skill: 'Pontaria',
        damageAttribute: 'Força',
      },
    ]);
  });

  it('keeps the authored damage attribute on the thrown mode', () => {
    const weapon = compileItem({
      ...content.items[0],
      thrown: true,
      damageAttribute: 'Destreza',
    });
    expect(weapon.specialActions?.[1].damageAttribute).toBe('Destreza');
  });

  it('does not add attack modes to a plain weapon', () => {
    const weapon = compileItem(content.items[0]);
    expect('specialActions' in weapon).toBe(false);
    expect('arremesso' in weapon).toBe(false);
  });

  it('passes versatile damage through untouched', () => {
    // "1d8/1d10" é lido por parseDualModeDamage na hora de rolar.
    const weapon = compileItem({ ...content.items[0], damage: '1d8/1d10' });
    expect(weapon.dano).toBe('1d8/1d10');
  });

  it('omits absent optional fields instead of writing undefined', () => {
    const shield = compileItem(content.items[2]);
    // Uma chave presente com valor `undefined` sobrescreveria valores
    // derivados nos vários spreads do motor.
    expect('dano' in shield).toBe(false);
    expect('descricao' in shield).toBe(false);
    expect('weaponCategory' in shield).toBe(false);
  });

  it('normalizes item sheetBonuses to source equipment', () => {
    const item = compileItem(content.items[3]);
    expect(item.sheetBonuses?.[0].source).toEqual({
      type: 'equipment',
      equipmentName: 'Kit do Depurador',
    });
    // Rolagens ganham id gerado.
    expect(item.rolls?.[0].id).toBeTruthy();
  });

  it('exposes items through getEquipmentBySupplements with origin stamped', () => {
    const market = dataRegistry.getEquipmentBySupplements(activeSupplements);

    const weapon = market.weapons.find((w) => w.nome === 'Lâmina do Testador');
    expect(weapon).toBeDefined();
    expect(weapon?.supplementId).toBe(SOURCE_ID);
    // displayName do pacote, não o id cru `homebrew:test-items`.
    expect(weapon?.supplementName).toBe(PACK_NAME);

    // O escudo tem que sair em `shields`, não em `armors`.
    expect(market.shields.some((s) => s.nome === 'Broquel de Regressão')).toBe(
      true
    );
    expect(market.armors.some((a) => a.nome === 'Broquel de Regressão')).toBe(
      false
    );
    expect(market.armors.some((a) => a.nome === 'Cota de Provas')).toBe(true);

    // O core continua presente.
    expect(market.weapons.some((w) => w.nome === 'Espada Longa')).toBe(true);
  });

  it('labels the backpack catalog subgroup with the pack name', () => {
    const catalog = buildEquipmentCatalog(activeSupplements);
    const armas = catalog.find((c) => c.group === 'Arma');
    const subgroup = armas?.subgroups.find((sg) =>
      sg.items.some((i) => i.nome === 'Lâmina do Testador')
    );

    expect(subgroup?.label).toBe(PACK_NAME);
    expect(subgroup?.label).not.toContain('homebrew:');
  });

  it('does not let bagging an item contaminate the shared catalog', () => {
    const market = dataRegistry.getEquipmentBySupplements(activeSupplements);
    const catalogWeapon = market.weapons.find(
      (w) => w.nome === 'Lâmina do Testador'
    );
    expect(catalogWeapon).toBeDefined();

    const sheet = createMockCharacterSheet();
    sheet.bag = new Bag({ Arma: [cloneDeep(catalogWeapon!)] }, true);
    recalculateSheet(sheet);

    // `ensureIds` grava `id` no objeto que recebe — o clone é o que protege o
    // catálogo compartilhado.
    const afterUse = dataRegistry
      .getEquipmentBySupplements(activeSupplements)
      .weapons.find((w) => w.nome === 'Lâmina do Testador');
    expect(afterUse?.id).toBeUndefined();
  });

  it('applies an item sheetBonus to the sheet on recalculation', () => {
    const market = dataRegistry.getEquipmentBySupplements(activeSupplements);
    const kit = market.generalItems.find((i) => i.nome === 'Kit do Depurador');
    expect(kit).toBeDefined();

    const sheet = createMockCharacterSheet();
    sheet.bag = new Bag({ 'Item Geral': [cloneDeep(kit!)] }, true);
    const recalculated = recalculateSheet(sheet);

    const bonus = recalculated.sheetBonuses?.find(
      (b) =>
        b.source.type === 'equipment' &&
        b.source.equipmentName === 'Kit do Depurador'
    );
    expect(bonus).toBeDefined();
    expect(bonus?.target).toEqual({ type: 'Skill', name: Skill.OFICIO });
  });

  it('keeps defense stats on the compiled armor', () => {
    const market = dataRegistry.getEquipmentBySupplements(activeSupplements);
    const armor = market.armors.find(
      (a) => a.nome === 'Cota de Provas'
    ) as DefenseEquipment;

    expect(armor.defenseBonus).toBe(6);
    expect(armor.armorPenalty).toBe(-2);
    expect(armor.isHeavyArmor).toBe(true);
  });

  it('removes the items once the supplement is unregistered', () => {
    dataRegistry.unregisterRuntimeSupplement(SOURCE_ID);

    const market = dataRegistry.getEquipmentBySupplements(activeSupplements);
    expect(market.weapons.some((w) => w.nome === 'Lâmina do Testador')).toBe(
      false
    );
    expect(market.weapons.some((w) => w.nome === 'Espada Longa')).toBe(true);

    dataRegistry.registerRuntimeSupplement(
      SOURCE_ID,
      compileItemPackHomebrew(content, PACK_NAME, SOURCE_ID)
    );
  });

  describe('validation', () => {
    const validate = (data: HomebrewItemPackContent) =>
      validateHomebrew({
        type: 'itemPackage',
        editorMode: 'advanced',
        schemaVersion: HOMEBREW_SCHEMA_VERSION,
        name: PACK_NAME,
        description: 'Pacote de teste',
        content: { type: 'itemPackage', data },
      });

    it('accepts the reference pack', () => {
      expect(validate(content)).toEqual({ valid: true, errors: [] });
    });

    it('rejects duplicate item names within the pack', () => {
      // `Bag.addEquipment` deduplica por `nome`: dois homônimos colapsariam.
      const result = validate({
        items: [content.items[0], { ...content.items[0], price: 999 }],
      });
      expect(result.valid).toBe(false);
      expect(result.errors.join(' ')).toContain('duplicado');
    });

    it('rejects weapon fields on a non-weapon category', () => {
      const result = validate({
        items: [{ ...content.items[3], damage: '1d6' }],
      });
      expect(result.valid).toBe(false);
      expect(result.errors.join(' ')).toContain('não se aplicam');
    });

    it('accepts versatile damage notation', () => {
      expect(
        validate({ items: [{ ...content.items[0], damage: '1d8/1d10' }] })
      ).toEqual({ valid: true, errors: [] });
      expect(
        validate({ items: [{ ...content.items[0], damage: '2d6+1' }] })
      ).toEqual({ valid: true, errors: [] });
    });

    it('rejects malformed damage', () => {
      ['1d8/', 'abc', '1d8//1d10', '1d8/1d10/1d12/2d6'].forEach((damage) => {
        const result = validate({ items: [{ ...content.items[0], damage }] });
        expect(result.valid).toBe(false);
        expect(result.errors.join(' ')).toContain('Dano da arma inválido');
      });
    });

    it('rejects an out-of-range attack bonus', () => {
      const result = validate({
        items: [{ ...content.items[0], atkBonus: 99 }],
      });
      expect(result.valid).toBe(false);
      expect(result.errors.join(' ')).toContain('Bônus de ataque');
    });

    it('rejects an empty pack', () => {
      const result = validate({ items: [] });
      expect(result.valid).toBe(false);
    });
  });
});
