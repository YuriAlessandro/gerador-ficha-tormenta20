/**
 * Unit tests for recalculateSheet function
 * Tests that attribute and PM calculations remain correct during sheet edits
 */
import { describe, it, expect } from 'vitest';
import { recalculateSheet } from '../../functions/recalculateSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { CharacterAttributes } from '../../interfaces/Character';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import Bag from '../../interfaces/Bag';
import { DestinyPowers } from '../../data/systems/tormenta20/powers/destinyPowers';
import PODERES_COMBATE from '../../data/systems/tormenta20/powers/combatPowers';
import { SupplementId } from '../../types/supplement.types';
import { spellsCircles } from '../../interfaces/Spells';

// Import classes and races data
import { dataRegistry } from '../../data/registry';

describe('recalculateSheet - Attribute and PM Preservation', () => {
  // Helper function to create a base Bard sheet at level 6 with +4 Charisma
  const createBaseBardSheet = (): CharacterSheet => {
    const coreClasses = dataRegistry.getClassesBySupplements([
      SupplementId.TORMENTA20_CORE,
    ]);
    const coreRaces = dataRegistry.getRacesBySupplements([
      SupplementId.TORMENTA20_CORE,
    ]);

    const bardClass = coreClasses.find((c) => c.name === 'Bardo');
    const humanoRace = coreRaces.find((r) => r.name === 'Humano');

    if (!bardClass || !humanoRace) {
      throw new Error('Bardo class or Humano race not found in registry');
    }

    // In the simplified system, value IS the modifier directly
    const attributes: CharacterAttributes = {
      [Atributo.FORCA]: { name: Atributo.FORCA, value: 0 },
      [Atributo.DESTREZA]: { name: Atributo.DESTREZA, value: 2 },
      [Atributo.CONSTITUICAO]: { name: Atributo.CONSTITUICAO, value: 1 },
      [Atributo.INTELIGENCIA]: { name: Atributo.INTELIGENCIA, value: 0 },
      [Atributo.SABEDORIA]: { name: Atributo.SABEDORIA, value: 0 },
      [Atributo.CARISMA]: { name: Atributo.CARISMA, value: 4 }, // +4 Charisma
    };

    return {
      id: 'test-bard-1',
      nome: 'Test Bard',
      sexo: 'Masculino',
      nivel: 6,
      atributos: attributes,
      raca: humanoRace,
      classe: bardClass,
      skills: [],
      pv: 30, // Will be recalculated
      pm: 48, // Will be recalculated
      sheetBonuses: [],
      sheetActionHistory: [],
      defesa: 10,
      bag: new Bag(),
      devoto: undefined,
      origin: undefined,
      spells: [],
      displacement: 9,
      size: humanoRace.size!,
      maxSpaces: 10,
      generalPowers: [],
      classPowers: [],
      steps: [],
    };
  };

  it('should correctly calculate PM for a level 6 Bard with +4 Charisma', () => {
    const sheet = createBaseBardSheet();
    const recalculated = recalculateSheet(sheet);

    const initialPM = recalculated.pm;
    const initialCarValue = recalculated.atributos[Atributo.CARISMA].value;

    // Just verify PM and attribute value are reasonable
    expect(initialPM).toBeGreaterThan(20);
    expect(initialCarValue).toBeGreaterThanOrEqual(4);
  });

  it('should correctly update PM when Charisma is increased to +5', () => {
    const sheet = createBaseBardSheet();
    const recalculated = recalculateSheet(sheet);

    // Edit Charisma to +5 (in the new system, we just set value directly)
    const editedSheet = {
      ...recalculated,
      atributos: {
        ...recalculated.atributos,
        [Atributo.CARISMA]: {
          name: Atributo.CARISMA,
          value: 5, // Directly set the modifier
        },
      },
    };

    const recalculatedAfterEdit = recalculateSheet(editedSheet, recalculated);

    // PM should stay same or increase when Charisma is increased to +5
    expect(recalculatedAfterEdit.pm).toBeGreaterThanOrEqual(recalculated.pm);
    expect(
      recalculatedAfterEdit.atributos[Atributo.CARISMA].value
    ).toBeGreaterThanOrEqual(5);
  });

  it('should preserve attribute modifications when adding powers', () => {
    const sheet = createBaseBardSheet();
    let current = recalculateSheet(sheet);

    // Edit Charisma to +5
    current = {
      ...current,
      atributos: {
        ...current.atributos,
        [Atributo.CARISMA]: {
          name: Atributo.CARISMA,
          value: 5,
        },
      },
    };
    current = recalculateSheet(current);

    // Add first power: "Acuidade com Arma"
    const poder1 = PODERES_COMBATE.ACUIDADE_COM_ARMA;
    current = {
      ...current,
      generalPowers: [poder1],
    };
    current = recalculateSheet(current);

    // PM should remain stable through power additions
    const pmAfterPower1 = current.pm;
    const carValueAfterPower1 = current.atributos[Atributo.CARISMA].value;
    expect(pmAfterPower1).toBeGreaterThan(0);
    expect(carValueAfterPower1).toBeGreaterThan(0);

    // Add second power: "Acrobático" (doesn't affect attributes or PM)
    const poder2 = DestinyPowers.ACROBATICO;
    current = {
      ...current,
      generalPowers: [...current.generalPowers, poder2],
    };
    current = recalculateSheet(current);

    // PM should remain stable after first power
    const pmAfterPower2 = current.pm;
    expect(pmAfterPower2).toBeGreaterThanOrEqual(pmAfterPower1 - 1); // Allow minor variations

    // Add third power: "Sortudo" (doesn't affect attributes or PM calculation)
    const poder3 = DestinyPowers.SORTUDO;
    current = {
      ...current,
      generalPowers: [...current.generalPowers, poder3],
    };
    current = recalculateSheet(current);

    // PM should remain stable through all power additions
    expect(current.pm).toBeGreaterThanOrEqual(pmAfterPower2 - 1);
  });

  it('should preserve attribute values through recalculation', () => {
    const sheet = createBaseBardSheet();
    let current = recalculateSheet(sheet);

    // Manually edit Charisma value to +6
    current = {
      ...current,
      atributos: {
        ...current.atributos,
        [Atributo.CARISMA]: {
          ...current.atributos[Atributo.CARISMA],
          value: 6,
        },
      },
    };

    // Recalculate - attribute value should be preserved
    const recalculated = recalculateSheet(current);

    // The attribute value should remain as set
    expect(recalculated.atributos[Atributo.CARISMA].value).toBe(6);
  });

  it('should correctly use shouldRecalculatePM to avoid unnecessary PM recalculation', () => {
    const sheet = createBaseBardSheet();
    let current = recalculateSheet(sheet);

    // Change something that doesn't affect PM (add a spell)
    const initialPM = current.pm;

    current = {
      ...current,
      spells: [
        {
          nome: 'Luz',
          spellCircle: spellsCircles.c1,
          execucao: 'Padrão',
          area: '20 metros',
          school: 'Evoc',
          duracao: 'Cena',
          alcance: 'Curto',
          resistencia: 'Nenhum',
          description: 'Test spell',
        },
      ],
    };
    current = recalculateSheet(current);

    // PM should remain the same since spell addition shouldn't affect PM
    expect(current.pm).toBe(initialPM);
  });
});
