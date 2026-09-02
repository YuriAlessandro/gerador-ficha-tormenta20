import { Atributo } from '../../data/systems/tormenta20/atributos';
import atlasOriginPowers from '../../data/systems/tormenta20/atlas-de-arton/powers/originPowers';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { getAttributeIncreasesInSamePlateau } from '../powers/general';
import {
  getFilteredAvailableOptions,
  getPowerSelectionRequirements,
} from '../powers/manualPowerSelection';

/**
 * Aspirante a Herói (Atlas de Arton) concede +1 em um atributo, mas NÃO é o
 * poder Aumento de Atributo — logo não está sujeito à regra de "um atributo
 * diferente por patamar" nem consome o atributo do Aumento de Atributo.
 */
describe('Aspirante a Herói x Aumento de Atributo', () => {
  const sheetWith = (
    increases: { attribute: Atributo; oncePerTier?: boolean; power?: string }[]
  ): CharacterSheet =>
    ({
      nivel: 2,
      sheetActionHistory: increases.map((inc) => ({
        source: { type: 'power' as const, name: inc.power ?? 'x' },
        powerName: inc.power ?? 'x',
        changes: [
          {
            type: 'AttributeIncreasedByAumentoDeAtributo' as const,
            attribute: inc.attribute,
            plateau: 1,
            ...(inc.oncePerTier === undefined
              ? {}
              : { oncePerTier: inc.oncePerTier }),
          },
        ],
      })),
    } as unknown as CharacterSheet);

  it('marca o aumento do poder como sem restrição de patamar', () => {
    const [action] = atlasOriginPowers.ASPIRANTE_A_HEROI.sheetActions ?? [];
    expect(action.action).toMatchObject({
      type: 'increaseAttribute',
      oncePerTier: false,
    });
  });

  it('não conta no limite do patamar um aumento sem a restrição', () => {
    expect(
      getAttributeIncreasesInSamePlateau(
        sheetWith([{ attribute: Atributo.FORCA, oncePerTier: false }])
      )
    ).toEqual([]);

    // Fichas antigas (sem o campo) e o próprio Aumento de Atributo continuam
    // bloqueando o atributo no patamar.
    expect(
      getAttributeIncreasesInSamePlateau(
        sheetWith([{ attribute: Atributo.FORCA }])
      )
    ).toEqual([Atributo.FORCA]);
  });

  it('ignora o bloqueio gravado em fichas antigas (sem o campo)', () => {
    expect(
      getAttributeIncreasesInSamePlateau(
        sheetWith([{ attribute: Atributo.FORCA, power: 'Aspirante a Herói' }])
      )
    ).toEqual([]);
  });

  it('oferece todos os atributos mesmo com o aumento do patamar já usado', () => {
    const requirements = getPowerSelectionRequirements(
      atlasOriginPowers.ASPIRANTE_A_HEROI
    );
    const requirement = requirements?.requirements.find(
      (req) => req.type === 'increaseAttribute'
    );
    expect(requirement?.metadata?.oncePerTier).toBe(false);

    const sheet = sheetWith([{ attribute: Atributo.FORCA }]);
    const options = getFilteredAvailableOptions(requirement!, sheet);
    expect(options).toContain(Atributo.FORCA);
    expect(options).toHaveLength(Object.values(Atributo).length);
  });
});
