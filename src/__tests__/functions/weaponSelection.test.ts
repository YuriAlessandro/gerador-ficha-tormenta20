import { describe, it, expect } from 'vitest';
import _ from 'lodash';
import { recalculateSheet } from '../../functions/recalculateSheet';
import { applyPower } from '../../functions/general';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { CharacterAttributes } from '../../interfaces/Character';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import Bag from '../../interfaces/Bag';
import { Armas } from '../../data/systems/tormenta20/equipamentos';
import PODERES_COMBATE from '../../data/systems/tormenta20/powers/combatPowers';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';

const ESPADA_LONGA = _.cloneDeep(Armas.ESPADA_LONGA); // 1d8
const ADAGA = _.cloneDeep(Armas.ADAGA); // 1d4

const buildBaseSheet = (): CharacterSheet => {
  const coreClasses = dataRegistry.getClassesBySupplements([
    SupplementId.TORMENTA20_CORE,
  ]);
  const coreRaces = dataRegistry.getRacesBySupplements([
    SupplementId.TORMENTA20_CORE,
  ]);
  const guerreiro = coreClasses.find((c) => c.name === 'Guerreiro');
  const humano = coreRaces.find((r) => r.name === 'Humano');
  if (!guerreiro || !humano) throw new Error('class/race not found');

  const attributes: CharacterAttributes = {
    [Atributo.FORCA]: { name: Atributo.FORCA, value: 3 },
    [Atributo.DESTREZA]: { name: Atributo.DESTREZA, value: 1 },
    [Atributo.CONSTITUICAO]: { name: Atributo.CONSTITUICAO, value: 2 },
    [Atributo.INTELIGENCIA]: { name: Atributo.INTELIGENCIA, value: 0 },
    [Atributo.SABEDORIA]: { name: Atributo.SABEDORIA, value: 0 },
    [Atributo.CARISMA]: { name: Atributo.CARISMA, value: 0 },
  };

  const bag = new Bag();
  bag.equipments.Arma = [_.cloneDeep(ESPADA_LONGA), _.cloneDeep(ADAGA)];

  return {
    id: 'test-warrior-1',
    nome: 'Test Warrior',
    sexo: 'Masculino',
    nivel: 4,
    atributos: attributes,
    raca: humano,
    classe: guerreiro,
    skills: [],
    pv: 30,
    pm: 20,
    sheetBonuses: [],
    sheetActionHistory: [],
    defesa: 10,
    bag,
    devoto: undefined,
    origin: undefined,
    spells: [],
    displacement: 9,
    size: humano.size!,
    maxSpaces: 10,
    generalPowers: [],
    classPowers: [],
    steps: [],
  };
};

const findWeapon = (sheet: CharacterSheet, nome: string) =>
  sheet.bag.equipments.Arma.find((w) => w.nome === nome);

describe('applyPower with selectWeaponSpecialization — single instance', () => {
  it('applies +2 damage bonus from Especialização em Arma', () => {
    const sheet = buildBaseSheet();
    const power = {
      name: 'Especialização em Arma',
      sheetActions: [
        {
          source: { type: 'power' as const, name: 'Especialização em Arma' },
          action: {
            type: 'selectWeaponSpecialization' as const,
            bonuses: [{ kind: 'damage' as const, value: 2 }],
            onlyFromSheet: true,
            optional: true,
          },
        },
      ],
    };

    const [updated] = applyPower(sheet, power, {
      weapons: ['Espada Longa'],
    });

    const damageBonus = updated.sheetBonuses.find(
      (b) =>
        b.target.type === 'WeaponDamage' &&
        'weaponName' in b.target &&
        b.target.weaponName === 'Espada Longa'
    );
    expect(damageBonus).toBeDefined();
    expect(damageBonus?.modifier).toEqual({ type: 'Fixed', value: 2 });

    const historyEntry = updated.sheetActionHistory.find(
      (e) => e.powerName === 'Especialização em Arma'
    );
    expect(historyEntry?.changes[0]).toEqual({
      type: 'WeaponSpecializationSelected',
      weaponName: 'Espada Longa',
    });
  });

  it('skips bonus and history when optional and no weapon is provided', () => {
    const sheet = buildBaseSheet();
    const power = {
      name: 'Foco em Arma',
      sheetActions: [
        {
          source: { type: 'power' as const, name: 'Foco em Arma' },
          action: {
            type: 'selectWeaponSpecialization' as const,
            bonuses: [{ kind: 'attack' as const, value: 2 }],
            onlyFromSheet: true,
            optional: true,
          },
        },
      ],
    };

    const [updated] = applyPower(sheet, power, { weapons: [] });

    expect(updated.sheetBonuses).toHaveLength(0);
    expect(
      updated.sheetActionHistory.filter((e) => e.powerName === 'Foco em Arma')
    ).toHaveLength(0);
  });

  it('emits a WeaponDamageStep bonus for damageStep kind', () => {
    const sheet = buildBaseSheet();
    const power = {
      name: 'Mestre em Arma',
      sheetActions: [
        {
          source: { type: 'power' as const, name: 'Mestre em Arma' },
          action: {
            type: 'selectWeaponSpecialization' as const,
            bonuses: [{ kind: 'damageStep' as const, steps: 1 }],
            onlyFromSheet: true,
            optional: true,
          },
        },
      ],
    };

    const [updated] = applyPower(sheet, power, {
      weapons: ['Espada Longa'],
    });

    const stepBonus = updated.sheetBonuses.find(
      (b) => b.target.type === 'WeaponDamageStep'
    );
    expect(stepBonus).toBeDefined();
    expect(stepBonus?.modifier).toEqual({ type: 'Fixed', value: 1 });
  });
});

describe('applyPower with selectWeaponSpecialization — multiple instances', () => {
  it('assigns weapons[0] and weapons[1] to two successive instances of Foco em Arma', () => {
    const baseSheet = buildBaseSheet();
    const focoEmArma = PODERES_COMBATE.FOCO_EM_ARMA;

    let sheet = baseSheet;
    [sheet] = applyPower(sheet, focoEmArma, {
      weapons: ['Espada Longa', 'Adaga'],
    });
    [sheet] = applyPower(sheet, focoEmArma, {
      weapons: ['Espada Longa', 'Adaga'],
    });

    const espadaBonus = sheet.sheetBonuses.find(
      (b) =>
        b.target.type === 'WeaponAttack' &&
        'weaponName' in b.target &&
        b.target.weaponName === 'Espada Longa'
    );
    const adagaBonus = sheet.sheetBonuses.find(
      (b) =>
        b.target.type === 'WeaponAttack' &&
        'weaponName' in b.target &&
        b.target.weaponName === 'Adaga'
    );

    expect(espadaBonus?.modifier).toEqual({ type: 'Fixed', value: 2 });
    expect(adagaBonus?.modifier).toEqual({ type: 'Fixed', value: 2 });

    const historyEntries = sheet.sheetActionHistory.filter(
      (e) => e.powerName === 'Foco em Arma'
    );
    expect(historyEntries).toHaveLength(2);
    expect(
      historyEntries.flatMap((e) =>
        e.changes
          .filter((c) => c.type === 'WeaponSpecializationSelected')
          .map((c) =>
            c.type === 'WeaponSpecializationSelected' ? c.weaponName : ''
          )
      )
    ).toEqual(['Espada Longa', 'Adaga']);
  });

  it('only the first instance is applied when the user picked one weapon', () => {
    const baseSheet = buildBaseSheet();
    const focoEmArma = PODERES_COMBATE.FOCO_EM_ARMA;

    let sheet = baseSheet;
    [sheet] = applyPower(sheet, focoEmArma, { weapons: ['Espada Longa'] });
    [sheet] = applyPower(sheet, focoEmArma, { weapons: ['Espada Longa'] });

    const espadaBonus = sheet.sheetBonuses.filter(
      (b) =>
        b.target.type === 'WeaponAttack' &&
        'weaponName' in b.target &&
        b.target.weaponName === 'Espada Longa'
    );
    expect(espadaBonus).toHaveLength(1);

    const historyEntries = sheet.sheetActionHistory.filter(
      (e) => e.powerName === 'Foco em Arma'
    );
    expect(historyEntries).toHaveLength(1);
  });
});

describe('end-to-end via recalculateSheet', () => {
  it('Especialização em Arma: produces +2 damage on the chosen weapon', () => {
    const sheet = buildBaseSheet();
    const guerreiroPowers = sheet.classe.powers || [];
    const especializacaoPower = guerreiroPowers.find(
      (p) => p.name === 'Especialização em Arma'
    );
    if (!especializacaoPower) {
      throw new Error('Especialização em Arma not found on Guerreiro powers');
    }
    sheet.classPowers = [especializacaoPower];

    const recalculated = recalculateSheet(sheet, undefined, {
      'Especialização em Arma': { weapons: ['Espada Longa'] },
    });

    const espada = findWeapon(recalculated, 'Espada Longa');
    const adaga = findWeapon(recalculated, 'Adaga');
    expect(espada?.dano).toContain('+2');
    expect(adaga?.dano).toBe('1d4');
  });

  it('Mestre em Arma: bumps the chosen weapon damage one step (1d8 → 1d10)', () => {
    const sheet = buildBaseSheet();
    const guerreiroPowers = sheet.classe.powers || [];
    const mestrePower = guerreiroPowers.find(
      (p) => p.name === 'Mestre em Arma'
    );
    if (!mestrePower) {
      throw new Error('Mestre em Arma not found on Guerreiro powers');
    }
    sheet.classPowers = [mestrePower];

    const recalculated = recalculateSheet(sheet, undefined, {
      'Mestre em Arma': { weapons: ['Espada Longa'] },
    });

    const espada = findWeapon(recalculated, 'Espada Longa');
    const adaga = findWeapon(recalculated, 'Adaga');
    expect(espada?.dano).toBe('1d10');
    expect(adaga?.dano).toBe('1d4');
  });

  it('Foco em Arma 1x: applies +2 attack to a single chosen weapon', () => {
    const sheet = buildBaseSheet();
    const focoEmArma = PODERES_COMBATE.FOCO_EM_ARMA;
    sheet.generalPowers = [focoEmArma];

    const recalculated = recalculateSheet(sheet, undefined, {
      'Foco em Arma': { weapons: ['Espada Longa'] },
    });

    const espada = findWeapon(recalculated, 'Espada Longa');
    const adaga = findWeapon(recalculated, 'Adaga');
    expect(espada?.atkBonus).toBe(2);
    expect(adaga?.atkBonus ?? 0).toBe(0);
  });

  it('Foco em Arma 2x: applies +2 attack to two distinct weapons', () => {
    const sheet = buildBaseSheet();
    const focoEmArma = PODERES_COMBATE.FOCO_EM_ARMA;
    sheet.generalPowers = [focoEmArma, focoEmArma];

    const recalculated = recalculateSheet(sheet, undefined, {
      'Foco em Arma': { weapons: ['Espada Longa', 'Adaga'] },
    });

    const espada = findWeapon(recalculated, 'Espada Longa');
    const adaga = findWeapon(recalculated, 'Adaga');
    expect(espada?.atkBonus).toBe(2);
    expect(adaga?.atkBonus).toBe(2);
  });

  it('Foco em Arma + Especialização em Arma stack on the same weapon', () => {
    const sheet = buildBaseSheet();
    const focoEmArma = PODERES_COMBATE.FOCO_EM_ARMA;
    const guerreiroPowers = sheet.classe.powers || [];
    const especializacaoPower = guerreiroPowers.find(
      (p) => p.name === 'Especialização em Arma'
    );
    if (!especializacaoPower) {
      throw new Error('Especialização em Arma not found on Guerreiro powers');
    }
    sheet.generalPowers = [focoEmArma];
    sheet.classPowers = [especializacaoPower];

    const recalculated = recalculateSheet(sheet, undefined, {
      'Foco em Arma': { weapons: ['Espada Longa'] },
      'Especialização em Arma': { weapons: ['Espada Longa'] },
    });

    const espada = findWeapon(recalculated, 'Espada Longa');
    expect(espada?.atkBonus).toBe(2);
    expect(espada?.dano).toContain('+2');
  });

  it('selecting "no weapon" (empty array) leaves all weapons unchanged', () => {
    const sheet = buildBaseSheet();
    const focoEmArma = PODERES_COMBATE.FOCO_EM_ARMA;
    sheet.generalPowers = [focoEmArma];

    const recalculated = recalculateSheet(sheet, undefined, {
      'Foco em Arma': { weapons: [] },
    });

    const espada = findWeapon(recalculated, 'Espada Longa');
    const adaga = findWeapon(recalculated, 'Adaga');
    expect(espada?.atkBonus ?? 0).toBe(0);
    expect(adaga?.atkBonus ?? 0).toBe(0);
  });

  it('Foco em Arma added without weapon, then weapon picked later (accordion flow)', () => {
    const sheet = buildBaseSheet();
    const focoEmArma = PODERES_COMBATE.FOCO_EM_ARMA;
    sheet.generalPowers = [focoEmArma];

    // Step 1: power added without selecting any weapon (e.g. user skipped or
    // closed the dialog).
    const noSelection = recalculateSheet(sheet, undefined, {
      'Foco em Arma': { weapons: [] },
    });
    expect(findWeapon(noSelection, 'Espada Longa')?.atkBonus ?? 0).toBe(0);

    // Step 2: user later opens the accordion action and picks Espada Longa.
    // The accordion handler clears prior weapon-specialization history (none
    // exists yet) and recalculates with the new selection.
    const cleared: CharacterSheet = {
      ...noSelection,
      sheetActionHistory: noSelection.sheetActionHistory.filter(
        (entry) =>
          !(
            entry.powerName === 'Foco em Arma' &&
            entry.changes.some((c) => c.type === 'WeaponSpecializationSelected')
          )
      ),
    };
    const withSelection = recalculateSheet(cleared, noSelection, {
      'Foco em Arma': { weapons: ['Espada Longa'] },
    });

    expect(findWeapon(withSelection, 'Espada Longa')?.atkBonus).toBe(2);
    const historyEntries = withSelection.sheetActionHistory.filter(
      (e) =>
        e.powerName === 'Foco em Arma' &&
        e.changes.some((c) => c.type === 'WeaponSpecializationSelected')
    );
    expect(historyEntries).toHaveLength(1);
  });

  it('changing the chosen weapon (after history reset) migrates the bonus', () => {
    const sheet = buildBaseSheet();
    const focoEmArma = PODERES_COMBATE.FOCO_EM_ARMA;
    sheet.generalPowers = [focoEmArma];

    const firstPass = recalculateSheet(sheet, undefined, {
      'Foco em Arma': { weapons: ['Adaga'] },
    });
    expect(findWeapon(firstPass, 'Adaga')?.atkBonus).toBe(2);

    // Simulate the UI flow: drop the existing weapon-specialization history,
    // then recalculate with the new selection.
    const cleared: CharacterSheet = {
      ...firstPass,
      sheetActionHistory: firstPass.sheetActionHistory.filter(
        (entry) =>
          !(
            entry.powerName === 'Foco em Arma' &&
            entry.changes.some((c) => c.type === 'WeaponSpecializationSelected')
          )
      ),
    };

    const secondPass = recalculateSheet(cleared, firstPass, {
      'Foco em Arma': { weapons: ['Espada Longa'] },
    });

    expect(findWeapon(secondPass, 'Adaga')?.atkBonus ?? 0).toBe(0);
    expect(findWeapon(secondPass, 'Espada Longa')?.atkBonus).toBe(2);
  });
});
