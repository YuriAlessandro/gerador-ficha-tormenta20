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

  /**
   * Um arco comprado antes dos campos de classificação existirem fica com
   * `alcance`/`ammoType` ausentes — e aí rola Luta, soma Força no dano e não
   * tem contador de munição. Como a mochila é snapshot congelado, corrigir o
   * catálogo não bastava; a cura precisa acontecer na carga da ficha.
   */
  describe('classificação de arma (alcance / arremesso / munição)', () => {
    const baggedWeapon = (weapon: Equipment): CharacterSheet => {
      const sheet = createMockCharacterSheet();
      sheet.bag = new Bag({ Arma: [weapon] });
      return sheet;
    };

    it('carimba alcance e munição num arco antigo sem os campos', () => {
      const sheet = baggedWeapon({
        nome: 'Arco Curto',
        id: 'arco-1',
        group: 'Arma',
        dano: '1d6',
        spaces: 2,
      });

      refreshBagItemsFromCatalog(sheet);

      const bow = sheet.bag.equipments.Arma[0];
      expect(bow.alcance).toBe('Médio');
      expect(bow.ammoType).toBe('Flechas');
    });

    it('carimba arremesso numa adaga antiga', () => {
      const sheet = baggedWeapon({
        nome: 'Adaga',
        id: 'adaga-1',
        group: 'Arma',
        dano: '1d4',
        spaces: 1,
      });

      refreshBagItemsFromCatalog(sheet);

      expect(sheet.bag.equipments.Arma[0].alcance).toBe('Curto');
      expect(sheet.bag.equipments.Arma[0].arremesso).toBe(true);
    });

    it('NÃO altera arma que já tem alcance "-" explícito', () => {
      // '-' é escolha do autor (ou do catálogo), não campo faltando.
      const sheet = baggedWeapon({
        nome: 'Arco Curto',
        id: 'arco-2',
        group: 'Arma',
        dano: '1d6',
        spaces: 2,
        alcance: '-',
      });

      refreshBagItemsFromCatalog(sheet);

      expect(sheet.bag.equipments.Arma[0].alcance).toBe('-');
      expect(sheet.bag.equipments.Arma[0].arremesso).toBeUndefined();
    });

    it('NÃO altera munição que o jogador já escolheu', () => {
      const sheet = baggedWeapon({
        nome: 'Arco Curto',
        id: 'arco-3',
        group: 'Arma',
        dano: '1d6',
        spaces: 2,
        ammoType: 'Virotes',
      });

      refreshBagItemsFromCatalog(sheet);

      expect(sheet.bag.equipments.Arma[0].ammoType).toBe('Virotes');
    });

    it('cura também arma que o pipeline de aprimoramentos já possui', () => {
      // Classificação não é bônus: uma arma encantada precisa da cura tanto
      // quanto uma limpa, então roda antes do early-return de ownership.
      const sheet = baggedWeapon({
        nome: 'Arco Curto',
        id: 'arco-4',
        group: 'Arma',
        dano: '1d6',
        spaces: 2,
        baseSheetBonuses: [],
      });

      refreshBagItemsFromCatalog(sheet);

      expect(sheet.bag.equipments.Arma[0].alcance).toBe('Médio');
      expect(sheet.bag.equipments.Arma[0].ammoType).toBe('Flechas');
    });

    it('não toca em arma custom de mesmo nome', () => {
      const sheet = baggedWeapon({
        nome: 'Arco Curto',
        id: 'arco-5',
        group: 'Arma',
        dano: '1d6',
        spaces: 2,
        isCustom: true,
      });

      refreshBagItemsFromCatalog(sheet);

      expect(sheet.bag.equipments.Arma[0].alcance).toBeUndefined();
      // `ammoType` aqui NÃO vem deste refresh: o construtor do `Bag` chama
      // `seedAmmoUnits`, cujo retrofit por nome exato
      // (`WEAPON_AMMO_BY_LEGACY_NAME`) roda antes e de propósito não olha
      // `isCustom` — quem batiza a própria arma de "Arco Curto" ganha o
      // vínculo com Flechas, o que é o comportamento útil.
      expect(sheet.bag.equipments.Arma[0].ammoType).toBe('Flechas');
    });
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

describe('refreshBagItemsFromCatalog — empunhadura da Lança Montada', () => {
  /** Como a lança estava salva antes da regra de uma mão ser cadastrada. */
  const legacyLance = (): Equipment => ({
    nome: 'Lança Montada',
    id: 'lan-1',
    group: 'Arma',
    dano: '1d8',
    critico: 'x3',
    spaces: 2,
    weaponTags: ['alongada'],
    twoHanded: true,
  });

  const sheetWith = (weapon: Equipment): CharacterSheet => {
    const sheet = createMockCharacterSheet();
    sheet.bag = new Bag({ Arma: [weapon] });
    return sheet;
  };

  it('a lança salva ganha a opção de uma mão e a descrição', () => {
    const sheet = sheetWith(legacyLance());

    refreshBagItemsFromCatalog(sheet);

    const lance = sheet.bag.equipments.Arma[0];
    expect(lance.oneHandedWhenMounted).toBe(true);
    expect(lance.twoHanded).toBe(true);
    expect(lance.descricao).toContain('apenas uma mão');
  });

  it('alcança também a lança já encantada', () => {
    const sheet = sheetWith({ ...legacyLance(), baseSheetBonuses: [] });

    refreshBagItemsFromCatalog(sheet);

    expect(sheet.bag.equipments.Arma[0].oneHandedWhenMounted).toBe(true);
  });

  it('respeita o false explícito do item', () => {
    const sheet = sheetWith({ ...legacyLance(), oneHandedWhenMounted: false });

    refreshBagItemsFromCatalog(sheet);

    expect(sheet.bag.equipments.Arma[0].oneHandedWhenMounted).toBe(false);
  });

  it('não marca armas de duas mãos comuns', () => {
    const sheet = sheetWith({
      nome: 'Alabarda',
      id: 'ala-1',
      group: 'Arma',
      twoHanded: true,
    });

    refreshBagItemsFromCatalog(sheet);

    expect(sheet.bag.equipments.Arma[0].oneHandedWhenMounted).toBeUndefined();
  });

  it('a Lança de Justa salva ganha a opção e a tag alongada', () => {
    const sheet = sheetWith({
      nome: 'Lança de justa',
      id: 'jus-1',
      group: 'Arma',
      descricao: 'Texto antigo.',
      alcance: '-',
      twoHanded: true,
    });

    refreshBagItemsFromCatalog(sheet);

    const justa = sheet.bag.equipments.Arma[0];
    expect(justa.oneHandedWhenMounted).toBe(true);
    expect(justa.weaponTags).toEqual(['alongada']);
    // Descrição existente nunca é sobrescrita.
    expect(justa.descricao).toBe('Texto antigo.');
  });
});

/**
 * A Besta Leve chegou a ser cadastrada como arma de duas mãos (regressão de
 * 09/10; o livro a lista em "Ataque à Distância — Uma Mão", JdA p. 144). Corrigir
 * o catálogo não alcançava a cópia já gravada na mochila: ela seguia
 * `twoHanded: true` e ocupava as duas mãos para sempre. A empunhadura de um
 * item de catálogo não é editável pelo jogador (só o item custom tem o campo no
 * formulário, e item custom é pulado), então o refresh espelha o catálogo.
 */
describe('refreshBagItemsFromCatalog — empunhadura (twoHanded)', () => {
  const catalogWeapon = (nome: string): Equipment => {
    const weapon = dataRegistry
      .getEquipmentBySupplements(Object.values(SupplementId))
      .weapons.find((w) => w.nome === nome);
    if (!weapon) throw new Error(`${nome} ausente do catálogo`);
    return weapon;
  };

  const sheetWith = (weapon: Equipment): CharacterSheet => {
    const sheet = createMockCharacterSheet();
    sheet.bag = new Bag({ Arma: [weapon] });
    return sheet;
  };

  it('arma de uma mão gravada como duas mãos volta a uma mão', () => {
    expect(catalogWeapon('Espada Longa').twoHanded).toBeFalsy();
    const sheet = sheetWith({
      nome: 'Espada Longa',
      id: 'esp-1',
      group: 'Arma',
      twoHanded: true,
    });

    refreshBagItemsFromCatalog(sheet);

    expect(sheet.bag.equipments.Arma[0].twoHanded).toBeUndefined();
  });

  it('a Besta Leve gravada segue o que o catálogo diz hoje', () => {
    const sheet = sheetWith({
      nome: 'Besta Leve',
      id: 'bes-1',
      group: 'Arma',
      twoHanded: !catalogWeapon('Besta Leve').twoHanded,
    });

    refreshBagItemsFromCatalog(sheet);

    expect(Boolean(sheet.bag.equipments.Arma[0].twoHanded)).toBe(
      Boolean(catalogWeapon('Besta Leve').twoHanded)
    );
  });

  it('arma de duas mãos gravada sem a flag passa a ocupar as duas mãos', () => {
    const sheet = sheetWith({ nome: 'Montante', id: 'mon-1', group: 'Arma' });

    refreshBagItemsFromCatalog(sheet);

    expect(sheet.bag.equipments.Arma[0].twoHanded).toBe(true);
  });

  it('vale também para a arma encantada', () => {
    const sheet = sheetWith({
      nome: 'Espada Longa',
      id: 'esp-2',
      group: 'Arma',
      twoHanded: true,
      baseSheetBonuses: [],
    });

    refreshBagItemsFromCatalog(sheet);

    expect(sheet.bag.equipments.Arma[0].twoHanded).toBeUndefined();
  });

  it('não toca na empunhadura do item custom', () => {
    const sheet = sheetWith({
      nome: 'Espada Longa',
      id: 'esp-3',
      group: 'Arma',
      twoHanded: true,
      isCustom: true,
    });

    refreshBagItemsFromCatalog(sheet);

    expect(sheet.bag.equipments.Arma[0].twoHanded).toBe(true);
  });
});

/**
 * Quando o refresh muda a empunhadura de uma arma que a ficha salva já estava
 * empunhando, as mãos são ajustadas só no que não muda número nenhum. Arma que
 * virou de duas mãos com outro item na outra mão (ex.: Arco Longo antigo +
 * escudo) fica como está: tirar o escudo em silêncio baixaria a Defesa.
 */
describe('refreshBagItemsFromCatalog — mãos após mudar a empunhadura', () => {
  type Hands = { main?: string; off?: string };

  const sheetWith = (items: Equipment[], hands: Hands): CharacterSheet => {
    const sheet = createMockCharacterSheet();
    sheet.bag = new Bag({
      Arma: items.filter((i) => i.group === 'Arma'),
      Escudo: items.filter((i) => i.group === 'Escudo'),
    } as never);
    sheet.mainHandItemId = hands.main;
    sheet.offHandItemId = hands.off;
    return sheet;
  };

  const hands = (sheet: CharacterSheet): Hands => ({
    main: sheet.mainHandItemId,
    off: sheet.offHandItemId,
  });

  const escudo: DefenseEquipment = {
    nome: 'Escudo Leve',
    id: 'esc-1',
    group: 'Escudo',
    defenseBonus: 1,
    armorPenalty: 1,
    spaces: 1,
  };

  it('virou uma mão e ocupava as duas: fica na principal e solta a outra', () => {
    const sheet = sheetWith(
      [{ nome: 'Espada Longa', id: 'esp-1', group: 'Arma', twoHanded: true }],
      { main: 'esp-1', off: 'esp-1' }
    );

    refreshBagItemsFromCatalog(sheet);

    expect(hands(sheet)).toEqual({ main: 'esp-1', off: undefined });
  });

  it('virou duas mãos numa mão só, com a outra livre: ocupa as duas', () => {
    const sheet = sheetWith(
      [{ nome: 'Montante', id: 'mon-1', group: 'Arma' }],
      { main: 'mon-1' }
    );

    refreshBagItemsFromCatalog(sheet);

    expect(hands(sheet)).toEqual({ main: 'mon-1', off: 'mon-1' });
  });

  it('o mesmo quando estava só na mão secundária', () => {
    const sheet = sheetWith(
      [{ nome: 'Montante', id: 'mon-2', group: 'Arma' }],
      { off: 'mon-2' }
    );

    refreshBagItemsFromCatalog(sheet);

    expect(hands(sheet)).toEqual({ main: 'mon-2', off: 'mon-2' });
  });

  it('virou duas mãos com escudo na outra mão: nada muda, nem a Defesa', () => {
    const build = () =>
      sheetWith(
        [{ nome: 'Montante', id: 'mon-3', group: 'Arma' }, _.cloneDeep(escudo)],
        { main: 'mon-3', off: 'esc-1' }
      );
    const defesaAntes = recalculateSheet(build()).defesa;

    const sheet = build();
    refreshBagItemsFromCatalog(sheet);

    expect(hands(sheet)).toEqual({ main: 'mon-3', off: 'esc-1' });
    expect(recalculateSheet(sheet).defesa).toBe(defesaAntes);
  });

  it('não mexe nas mãos de arma cuja empunhadura não mudou', () => {
    // Espada Longa (uma mão) segurada nas duas, sem a flag: o refresh não muda
    // a empunhadura, então o slot escolhido pelo jogador fica.
    const sheet = sheetWith(
      [{ nome: 'Espada Longa', id: 'esp-2', group: 'Arma' }],
      { main: 'esp-2', off: 'esp-2' }
    );

    refreshBagItemsFromCatalog(sheet);

    expect(hands(sheet)).toEqual({ main: 'esp-2', off: 'esp-2' });
  });

  it('Lança Montada numa mão só fica onde está (aceita uma mão montado)', () => {
    const sheet = sheetWith(
      [{ nome: 'Lança Montada', id: 'lan-2', group: 'Arma' }],
      { main: 'lan-2' }
    );

    refreshBagItemsFromCatalog(sheet);

    expect(sheet.bag.equipments.Arma[0].twoHanded).toBe(true);
    expect(hands(sheet)).toEqual({ main: 'lan-2', off: undefined });
  });
});
