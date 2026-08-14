import { recalculateSheet } from '../recalculateSheet';
import { calculateMaxSpaces } from '../general';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import { GeneralPowerType } from '../../interfaces/Poderes';
import KOBOLDS_TALENTS from '../../data/systems/tormenta20/ameacas-de-arton/powers/koboldsTalents';
import DEITY_POWERS from '../../data/systems/tormenta20/deuses-de-arton/powers';

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
});
