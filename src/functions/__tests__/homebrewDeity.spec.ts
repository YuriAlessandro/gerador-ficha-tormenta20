import generateRandomSheet from '../general';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';
import { GeneralPowerType, RequirementType } from '../../interfaces/Poderes';
import { compileDeityHomebrew } from '../../premium/functions/compileDeity';
import { HomebrewDeityContent } from '../../premium/interfaces/Homebrew';

/**
 * Cobre a compilação de uma Divindade homebrew (poderes concedidos CONCEDIDOS
 * com requisito DEVOTO), a injeção via SupplementData.divindades no registry
 * (getDeityByName/getSupplementDeities) e a concessão de poderes a um devoto na
 * geração de ficha (resolução da divindade pelo NOME).
 */
describe('homebrew deity', () => {
  const DEITY_NAME = 'Vexpo, o Testador';
  const SOURCE_ID = 'homebrew:test-deity';

  const content: HomebrewDeityContent = {
    energy: 'positiva',
    beliefs: 'Testar antes de publicar.',
    allowedRaces: ['Humano'],
    allowedClasses: ['Clérigo'],
    grantedPowers: [
      {
        name: 'Bênção do Teste',
        description: '+2 em Defesa para os devotos.',
        sheetBonuses: [
          {
            source: { type: 'divinity', divinityName: 'x' },
            target: { type: 'Defense' },
            modifier: { type: 'Fixed', value: 2 },
          },
        ],
      },
    ],
  };

  beforeAll(() => {
    dataRegistry.registerRuntimeSupplement(
      SOURCE_ID,
      compileDeityHomebrew(content, DEITY_NAME, SOURCE_ID)
    );
  });

  afterAll(() => {
    dataRegistry.unregisterRuntimeSupplement(SOURCE_ID);
  });

  it('compiles granted powers as CONCEDIDOS with a DEVOTO requirement', () => {
    const supplement = compileDeityHomebrew(content, DEITY_NAME, SOURCE_ID);
    const deity = supplement.divindades?.[0];
    expect(deity?.name).toBe(DEITY_NAME);
    expect(deity?.energy).toBe('positiva');

    const power = deity?.poderes[0];
    expect(power?.type).toBe(GeneralPowerType.CONCEDIDOS);
    expect(power?.requirements?.[0]?.[0]).toMatchObject({
      type: RequirementType.DEVOTO,
      name: DEITY_NAME,
    });
    expect(
      (power?.sheetBonuses || []).some((b) => b.target.type === 'Defense')
    ).toBe(true);
  });

  it('is injected into the registry (getDeityByName / getSupplementDeities)', () => {
    const supplements = [
      SupplementId.TORMENTA20_CORE,
      SOURCE_ID as SupplementId,
    ];
    const found = dataRegistry.getDeityByName(DEITY_NAME, supplements);
    expect(found?.name).toBe(DEITY_NAME);

    const supDeities = dataRegistry.getSupplementDeities(supplements);
    expect(supDeities.some((d) => d.name === DEITY_NAME)).toBe(true);
  });

  it('grants the deity powers to a devoted character (resolved by name)', () => {
    const sheet = generateRandomSheet({
      nivel: 1,
      raca: 'Humano',
      classe: 'Clérigo',
      origin: '',
      devocao: { label: DEITY_NAME, value: DEITY_NAME },
      supplements: [SupplementId.TORMENTA20_CORE, SOURCE_ID as SupplementId],
    });

    expect(sheet.devoto?.divindade.name).toBe(DEITY_NAME);
    expect((sheet.devoto?.poderes || []).length).toBeGreaterThan(0);
    expect(
      (sheet.devoto?.poderes || []).every((p) => p.name === 'Bênção do Teste')
    ).toBe(true);
  });
});
