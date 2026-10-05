import _ from 'lodash';
import { recalculateSheet } from '../recalculateSheet';
import { normalizeSheet } from '../sheetNormalizer';
import { refreshBagItemsFromCatalog } from '../bagCatalogRefresh';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';
import racePowers from '../../data/systems/tormenta20/herois-de-arton/powers/racePowers';
import combatPowers from '../../data/systems/tormenta20/powers/combatPowers';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Bag from '../../interfaces/Bag';
import Equipment from '../../interfaces/Equipment';
import { GeneralPower } from '../../interfaces/Poderes';

/**
 * Estilos de combate condicionados à empunhadura, exercitados pelo recálculo
 * completo com itens do catálogo.
 */
const SUPPLEMENTS = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_HEROIS_ARTON,
  SupplementId.TORMENTA20_AMEACAS_ARTON,
];

const fromCatalog = (nome: string, id: string): Equipment => {
  const catalog = dataRegistry.getEquipmentBySupplements(SUPPLEMENTS);
  const found = [...catalog.weapons, ...catalog.shields].find(
    (item) => item.nome === nome
  );
  if (!found) throw new Error(`${nome} não está no catálogo`);
  // O catálogo do registry é cache compartilhado — nunca usar a referência.
  return { ..._.cloneDeep(found), id };
};

const buildSheet = (
  powers: GeneralPower[],
  items: Equipment[],
  mainHand?: string,
  offHand?: string
): CharacterSheet => {
  const sheet = createMockCharacterSheet();
  sheet.generalPowers = powers;
  sheet.classPowers = [];
  sheet.sheetBonuses = [];
  sheet.sheetActionHistory = [];
  sheet.bag = new Bag({
    Arma: items.filter((i) => i.group === 'Arma'),
    Escudo: items.filter((i) => i.group === 'Escudo'),
  });
  // Sem a flag, `migrateEquipState` equipa sozinho o que estiver na mochila.
  sheet.equipStateMigrated = true;
  sheet.mainHandItemId = mainHand;
  sheet.offHandItemId = offHand;
  return sheet;
};

const damageOf = (sheet: CharacterSheet, id: string): string =>
  sheet.bag.equipments.Arma.find((w) => w.id === id)?.dano ?? '';

const atkOf = (sheet: CharacterSheet, id: string): number =>
  sheet.bag.equipments.Arma.find((w) => w.id === id)?.atkBonus ?? 0;

const hasActiveBonus = (sheet: CharacterSheet, power: string, type: string) =>
  sheet.sheetBonuses.some(
    (b) =>
      b.source.type === 'power' &&
      b.source.name === power &&
      b.target.type === type
  );

describe('Estilo Clássico', () => {
  const espada = () => fromCatalog('Espada Longa', 'esp');
  const machado = () => fromCatalog('Machado de Batalha', 'mac');
  const escudo = () => fromCatalog('Escudo Pesado', 'esc');
  const items = () => [espada(), machado(), escudo()];
  const power = [racePowers.ESTILO_CLASSICO];

  it('dá +2 na Defesa e +2 no dano da espada com espada e escudo empunhados', () => {
    const base = recalculateSheet(buildSheet([], items(), 'esp', 'esc'));
    const result = recalculateSheet(buildSheet(power, items(), 'esp', 'esc'));

    expect(result.defesa).toBe(base.defesa + 2);
    expect(damageOf(base, 'esp')).toBe('1d8');
    expect(damageOf(result, 'esp')).toBe('1d8+2');
    // "com sua arma": o machado guardado não recebe o bônus.
    expect(damageOf(result, 'mac')).toBe('1d8');
  });

  it('não se aplica sem o escudo empunhado', () => {
    const base = recalculateSheet(buildSheet([], items(), 'esp'));
    const result = recalculateSheet(buildSheet(power, items(), 'esp'));

    expect(result.defesa).toBe(base.defesa);
    expect(damageOf(result, 'esp')).toBe('1d8');
  });

  it('não se aplica com escudo e uma arma que não é espada', () => {
    const base = recalculateSheet(buildSheet([], items(), 'mac', 'esc'));
    const result = recalculateSheet(buildSheet(power, items(), 'mac', 'esc'));

    expect(result.defesa).toBe(base.defesa);
    expect(damageOf(result, 'mac')).toBe('1d8');
  });
});

describe('Estilo de Arma e Escudo', () => {
  const power = [combatPowers.ESTILO_DE_ARMA_E_ESCUDO];
  const items = () => [
    fromCatalog('Espada Longa', 'esp'),
    fromCatalog('Escudo Pesado', 'esc'),
  ];

  it('soma +2 à Defesa do escudo empunhado', () => {
    const base = recalculateSheet(buildSheet([], items(), 'esp', 'esc'));
    const result = recalculateSheet(buildSheet(power, items(), 'esp', 'esc'));
    expect(result.defesa).toBe(base.defesa + 2);
  });

  it('não soma com o escudo só na mochila', () => {
    const base = recalculateSheet(buildSheet([], items(), 'esp'));
    const result = recalculateSheet(buildSheet(power, items(), 'esp'));
    expect(result.defesa).toBe(base.defesa);
  });
});

describe('Estilo de Duas Mãos', () => {
  const power = [combatPowers.ESTILO_DE_DUAS_MAOS];
  const items = () => [
    fromCatalog('Montante', 'mon'),
    fromCatalog('Espada Longa', 'esp'),
  ];

  it('dá +5 no dano da arma de duas mãos empunhada', () => {
    const result = recalculateSheet(buildSheet(power, items(), 'mon', 'mon'));
    expect(damageOf(result, 'mon')).toBe('2d6+5');
    // Arma de uma mão nunca recebe o bônus.
    expect(damageOf(result, 'esp')).toBe('1d8');
  });

  it('não se aplica empunhando uma arma de uma mão', () => {
    const result = recalculateSheet(buildSheet(power, items(), 'esp'));
    expect(damageOf(result, 'mon')).toBe('2d6');
    expect(damageOf(result, 'esp')).toBe('1d8');
  });
});

describe('Estilo de Arremesso', () => {
  const items = () => [fromCatalog('Adaga', 'adg')];

  it('só soma +2 no ataque de arremesso com Saque Rápido', () => {
    const sem = recalculateSheet(
      buildSheet([combatPowers.ESTILO_DE_ARREMESO], items(), 'adg')
    );
    expect(hasActiveBonus(sem, 'Estilo de Arremesso', 'WeaponDamage')).toBe(
      true
    );
    expect(hasActiveBonus(sem, 'Estilo de Arremesso', 'WeaponAttack')).toBe(
      false
    );

    const com = recalculateSheet(
      buildSheet(
        [combatPowers.ESTILO_DE_ARREMESO, combatPowers.SAQUE_RAPIDO],
        items(),
        'adg'
      )
    );
    expect(hasActiveBonus(com, 'Estilo de Arremesso', 'WeaponAttack')).toBe(
      true
    );
  });
});

describe('Estilo de Arma Longa', () => {
  it('vale para armas alongadas de Heróis de Arton', () => {
    ['Martelo longo', 'Desmontador', 'Machado de haste'].forEach((nome) => {
      const weapon = fromCatalog(nome, 'w');
      const result = recalculateSheet(
        buildSheet([combatPowers.ESTILO_DE_ARMA_LONGA], [weapon], 'w', 'w')
      );
      expect(atkOf(result, 'w')).toBe(2);
    });
  });

  it('a mochila salva recebe a tag alongada do catálogo', () => {
    const legacy = fromCatalog('Martelo longo', 'w');
    legacy.weaponTags = ['heredrimm'];
    const sheet = buildSheet([], [legacy]);

    refreshBagItemsFromCatalog(sheet);

    expect(sheet.bag.equipments.Arma[0].weaponTags).toEqual([
      'heredrimm',
      'alongada',
    ]);
  });
});

describe('fichas salvas antes da automação', () => {
  it('normalizeSheet recoloca os bônus na cópia embutida do poder', () => {
    const sheet = createMockCharacterSheet();
    sheet.generalPowers = [
      { ...racePowers.ESTILO_CLASSICO, sheetBonuses: undefined },
      { ...combatPowers.ESTILO_DE_DUAS_MAOS, sheetBonuses: undefined },
    ];

    normalizeSheet(sheet);

    expect(sheet.generalPowers[0].sheetBonuses).toHaveLength(2);
    expect(sheet.generalPowers[1].sheetBonuses).toHaveLength(1);
  });
});

describe('Estilo de Uma Arma', () => {
  const power = [combatPowers.ESTILO_DE_UMA_ARMA];

  it('dá +2 na Defesa e no ataque com uma arma corpo a corpo e a outra mão livre', () => {
    const items = () => [fromCatalog('Espada Longa', 'esp')];
    const base = recalculateSheet(buildSheet([], items(), 'esp'));
    const result = recalculateSheet(buildSheet(power, items(), 'esp'));
    expect(result.defesa).toBe(base.defesa + 2);
    expect(atkOf(result, 'esp')).toBe(atkOf(base, 'esp') + 2);
  });

  it('não vale para ataques desarmados', () => {
    const items = () => [fromCatalog('Ataque Desarmado', 'des')];
    const base = recalculateSheet(buildSheet([], items(), 'des'));
    const result = recalculateSheet(buildSheet(power, items(), 'des'));
    expect(result.defesa).toBe(base.defesa);
    expect(atkOf(result, 'des')).toBe(atkOf(base, 'des'));
  });
});
