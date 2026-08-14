import { recalculateSheet } from '../recalculateSheet';
import { calculateMaxSpaces } from '../general';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import { GeneralPowerType } from '../../interfaces/Poderes';
import KOBOLDS_TALENTS from '../../data/systems/tormenta20/ameacas-de-arton/powers/koboldsTalents';
import DEITY_POWERS from '../../data/systems/tormenta20/deuses-de-arton/powers';
import { getPowerSelectionRequirements } from '../powers/manualPowerSelection';

describe('max spaces attribute', () => {
  it('uses the selected attribute and replays it after recalculation', () => {
    const sheet = createMockCharacterSheet();
    const power = {
      name: 'Teste de carga por Destreza',
      description: '',
      type: GeneralPowerType.DESTINO,
      requirements: [],
      sheetActions: [
        {
          source: {
            type: 'power' as const,
            name: 'Teste de carga por Destreza',
          },
          action: {
            type: 'setMaxSpacesAttribute' as const,
            attribute: Atributo.DESTREZA,
          },
        },
      ],
    };
    sheet.generalPowers = [power];
    sheet.atributos[Atributo.FORCA].value = 1;
    sheet.atributos[Atributo.DESTREZA].value = 4;

    const first = recalculateSheet(sheet);
    expect(first.maxSpacesAttribute).toBe(Atributo.DESTREZA);
    expect(first.maxSpaces).toBe(18);

    const second = recalculateSheet(first);
    expect(second.maxSpacesAttribute).toBe(Atributo.DESTREZA);
    expect(second.maxSpaces).toBe(18);
    expect(
      second.sheetActionHistory.filter(
        (entry) => entry.powerName === power.name
      )
    ).toHaveLength(1);

    second.generalPowers = [];
    const removed = recalculateSheet(second);
    expect(removed.maxSpacesAttribute).toBeUndefined();
    expect(removed.maxSpaces).toBe(12);
  });

  it('applies the special negative attribute rule universally', () => {
    expect(calculateMaxSpaces(-1)).toBe(9);
  });

  it('persists a manual load attribute through recalculation', () => {
    const sheet = createMockCharacterSheet();
    sheet.manualMaxSpacesAttribute = Atributo.DESTREZA;
    sheet.atributos[Atributo.FORCA].value = 1;
    sheet.atributos[Atributo.DESTREZA].value = 4;

    const result = recalculateSheet(sheet);

    expect(result.maxSpacesAttribute).toBe(Atributo.DESTREZA);
    expect(result.maxSpaces).toBe(18);
  });

  it('lets the manual choice override Organizadinhos', () => {
    const sheet = createMockCharacterSheet();
    const organizadinhos = KOBOLDS_TALENTS.find(
      (power) => power.name === 'Organizadinhos (Kobolds)'
    );
    if (!organizadinhos) throw new Error('Organizadinhos não encontrado');

    sheet.generalPowers = [organizadinhos];
    sheet.manualMaxSpacesAttribute = Atributo.SABEDORIA;
    sheet.atributos[Atributo.DESTREZA].value = 4;
    sheet.atributos[Atributo.SABEDORIA].value = 2;

    const result = recalculateSheet(sheet);

    expect(result.maxSpacesAttribute).toBe(Atributo.SABEDORIA);
    expect(result.manualMaxSpacesAttribute).toBe(Atributo.SABEDORIA);
    expect(result.maxSpaces).toBe(14);
  });

  it('configures Organizadinhos and Andarilho Carregado with the action', () => {
    const organizadinhos = KOBOLDS_TALENTS.find(
      (power) => power.name === 'Organizadinhos (Kobolds)'
    );
    const andarilho = Object.values(DEITY_POWERS)
      .flat()
      .find((power) => power.name === 'Andarilho Carregado');

    expect(organizadinhos?.sheetActions?.[0].action).toEqual({
      type: 'setMaxSpacesAttribute',
      attribute: Atributo.DESTREZA,
    });
    expect(andarilho?.sheetActions?.[0].action).toEqual({
      type: 'setMaxSpacesAttribute',
      attribute: Atributo.SABEDORIA,
    });
  });

  it('configures Ex-Familiar with the familiar selection step', () => {
    const exFamiliar = KOBOLDS_TALENTS.find(
      (power) => power.name === 'Ex-Familiar (Kobolds)'
    );

    expect(exFamiliar?.sheetActions?.[0].action).toEqual({
      type: 'selectFamiliar',
    });

    const requirements = exFamiliar
      ? getPowerSelectionRequirements(exFamiliar)
      : undefined;
    expect(
      requirements?.requirements.some(
        (requirement) => requirement.type === 'selectFamiliar'
      )
    ).toBe(true);
  });

  it('applies the selected familiar from Ex-Familiar to the sheet', () => {
    const sheet = createMockCharacterSheet();
    const exFamiliar = KOBOLDS_TALENTS.find(
      (power) => power.name === 'Ex-Familiar (Kobolds)'
    );
    if (!exFamiliar) throw new Error('Ex-Familiar não encontrado');

    sheet.generalPowers = [exFamiliar];
    const result = recalculateSheet(sheet, undefined, {
      'Ex-Familiar (Kobolds)': { familiars: ['GATO'] },
    });

    const familiarChange = result.sheetActionHistory
      .flatMap((entry) => entry.changes)
      .find((change) => change.type === 'FamiliarSelected');
    expect(familiarChange).toEqual({
      type: 'FamiliarSelected',
      familiarKey: 'GATO',
    });
    expect(result.pm).toBe(8);
    expect(
      result.sheetBonuses.some(
        (bonus) =>
          bonus.target.type === 'Skill' &&
          bonus.target.name === 'Furtividade' &&
          bonus.modifier.type === 'Fixed' &&
          bonus.modifier.value === 2
      )
    ).toBe(true);
  });
});
