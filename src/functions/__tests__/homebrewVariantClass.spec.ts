import generateRandomSheet from '../general';
import { computeUsedRuntimeSupplements } from '../contentSources';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';
import {
  compileVariantClassContent,
  compileVariantClassHomebrew,
} from '../../premium/functions/compileVariantClass';
import { validateHomebrew } from '../../premium/functions/homebrewValidation';
import {
  HOMEBREW_SCHEMA_VERSION,
  HomebrewVariantClassContent,
} from '../../premium/interfaces/Homebrew';
import Skill from '../../interfaces/Skills';

/**
 * Cobre a Classe Variante homebrew: compilação para `VariantClassOverrides`,
 * herança pelo registry e detecção em `usedSupplements`.
 *
 * O invariante mais importante está no primeiro teste: o merge do registry é
 * `{ ...base, ...variante }`, então uma chave PRESENTE com valor `undefined`
 * apagaria o campo da base. O compilador precisa OMITIR o que o autor não
 * preencheu.
 */
describe('homebrew variant class', () => {
  const SOURCE_ID = 'homebrew:test-variant';
  const VARIANT_NAME = 'Guerreiro Sentinela';
  const BASE_NAME = 'Guerreiro';

  const content: HomebrewVariantClassContent = {
    baseClassName: BASE_NAME,
    pm: 4,
    addpm: 4,
    powers: [
      {
        name: 'Vigília Constante',
        description: 'Você não pode ser surpreendido.',
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
      compileVariantClassHomebrew(content, VARIANT_NAME, SOURCE_ID)
    );
  });

  afterAll(() => {
    dataRegistry.unregisterRuntimeSupplement(SOURCE_ID);
  });

  it('omits keys the author did not fill instead of emitting undefined', () => {
    const overrides = compileVariantClassContent(content, VARIANT_NAME);

    expect(overrides.name).toBe(VARIANT_NAME);
    expect(overrides.isVariant).toBe(true);
    expect(overrides.baseClassName).toBe(BASE_NAME);

    // Preenchidos → presentes.
    expect(overrides.pm).toBe(4);
    expect(overrides.addpm).toBe(4);

    // Não preenchidos → AUSENTES. Se estivessem presentes como `undefined`,
    // o spread do registry apagaria o valor da classe base.
    expect('pv' in overrides).toBe(false);
    expect('addpv' in overrides).toBe(false);
    expect('proficiencias' in overrides).toBe(false);
    expect('abilities' in overrides).toBe(false);
    expect('periciasbasicas' in overrides).toBe(false);
    expect('spellPath' in overrides).toBe(false);
  });

  it('emits spellPath as an intentional undefined when removing spellcasting', () => {
    const overrides = compileVariantClassContent(
      { baseClassName: 'Arcanista', removeSpellcasting: true },
      'Arcanista Mundano'
    );
    // Aqui a chave PRECISA existir: é ela que apaga a conjuração herdada.
    expect('spellPath' in overrides).toBe(true);
    expect(overrides.spellPath).toBeUndefined();
  });

  it('inherits base stats it did not override', () => {
    const classes = dataRegistry.getClassesBySupplements(activeSupplements);
    const base = classes.find((c) => c.name === BASE_NAME);
    const variant = classes.find((c) => c.name === VARIANT_NAME);

    expect(base).toBeDefined();
    expect(variant).toBeDefined();

    // Sobrescritos.
    expect(variant?.pm).toBe(4);
    expect(variant?.addpm).toBe(4);
    // Herdados.
    expect(variant?.pv).toBe(base?.pv);
    expect(variant?.addpv).toBe(base?.addpv);
    expect(variant?.proficiencias).toEqual(base?.proficiencias);
    expect(variant?.abilities).toEqual(base?.abilities);
  });

  it('appends its own powers to the inherited ones', () => {
    const variant = dataRegistry
      .getClassesBySupplements(activeSupplements)
      .find((c) => c.name === VARIANT_NAME);
    const base = dataRegistry
      .getClassesBySupplements(activeSupplements)
      .find((c) => c.name === BASE_NAME);

    expect(variant?.powers.some((p) => p.name === 'Vigília Constante')).toBe(
      true
    );
    expect(variant?.powers.length).toBe((base?.powers.length ?? 0) + 1);
  });

  it('honors excludedPowers and excludeAllBasePowers', () => {
    const base = dataRegistry
      .getClassesBySupplements(activeSupplements)
      .find((c) => c.name === BASE_NAME);
    const excluded = base!.powers[0].name;

    const EXCL_ID = 'homebrew:test-variant-excl';
    dataRegistry.registerRuntimeSupplement(
      EXCL_ID,
      compileVariantClassHomebrew(
        { baseClassName: BASE_NAME, excludedPowers: [excluded] },
        'Guerreiro Podado',
        EXCL_ID
      )
    );
    const ALL_ID = 'homebrew:test-variant-all';
    dataRegistry.registerRuntimeSupplement(
      ALL_ID,
      compileVariantClassHomebrew(
        { baseClassName: BASE_NAME, excludeAllBasePowers: true },
        'Guerreiro Nu',
        ALL_ID
      )
    );

    const classes = dataRegistry.getClassesBySupplements([
      ...activeSupplements,
      EXCL_ID as SupplementId,
      ALL_ID as SupplementId,
    ]);

    const podado = classes.find((c) => c.name === 'Guerreiro Podado');
    expect(podado?.powers.some((p) => p.name === excluded)).toBe(false);
    expect(podado?.powers.length).toBe(base!.powers.length - 1);

    const nu = classes.find((c) => c.name === 'Guerreiro Nu');
    expect(nu?.powers).toHaveLength(0);

    dataRegistry.unregisterRuntimeSupplement(EXCL_ID);
    dataRegistry.unregisterRuntimeSupplement(ALL_ID);
  });

  it('exposes the variant with its homebrew supplement id', () => {
    const withInfo = dataRegistry
      .getClassesWithSupplementInfo(activeSupplements)
      .find((c) => c.name === VARIANT_NAME);

    expect(withInfo?.supplementId).toBe(SOURCE_ID);
    expect(withInfo?.supplementName).toBe(VARIANT_NAME);
  });

  it('generates a sheet with the variant', () => {
    const sheet = generateRandomSheet({
      nivel: 3,
      raca: 'Elfo',
      classe: VARIANT_NAME,
      origin: '',
      devocao: { label: '', value: '' },
      supplements: activeSupplements,
    });

    expect(sheet.classe.name).toBe(VARIANT_NAME);
    expect(sheet.classe.pm).toBe(4);
    expect(sheet.classe.addpm).toBe(4);
  });

  it('detects the variant in computeUsedRuntimeSupplements', () => {
    // Regressão: passar só os ids runtime fazia a resolução de variante não
    // achar a classe base (que está no core) e pular a variante inteira.
    const sheet = generateRandomSheet({
      nivel: 1,
      raca: 'Elfo',
      classe: VARIANT_NAME,
      origin: '',
      devocao: { label: '', value: '' },
      supplements: activeSupplements,
    });

    expect(computeUsedRuntimeSupplements(sheet)).toContain(SOURCE_ID);
  });

  it('does not stamp official classes as runtime sources', () => {
    const sheet = generateRandomSheet({
      nivel: 1,
      raca: 'Elfo',
      classe: BASE_NAME,
      origin: '',
      devocao: { label: '', value: '' },
      supplements: activeSupplements,
    });

    expect(computeUsedRuntimeSupplements(sheet)).toEqual([]);
  });

  describe('validation', () => {
    const validate = (data: HomebrewVariantClassContent) =>
      validateHomebrew({
        type: 'variantClass',
        editorMode: 'advanced',
        schemaVersion: HOMEBREW_SCHEMA_VERSION,
        name: VARIANT_NAME,
        description: 'Variante de teste',
        content: { type: 'variantClass', data },
      });

    it('accepts the reference variant', () => {
      expect(validate(content)).toEqual({ valid: true, errors: [] });
    });

    it('accepts a skills-only override', () => {
      const result = validate({
        baseClassName: BASE_NAME,
        skills: {
          basic: [{ mode: 'and', skills: [Skill.LUTA] }],
          remaining: { qtd: 3, list: [Skill.PERCEPCAO, Skill.ATLETISMO] },
        },
      });
      expect(result.valid).toBe(true);
    });

    it('rejects a variant with no overrides at all', () => {
      const result = validate({ baseClassName: BASE_NAME });
      expect(result.valid).toBe(false);
      expect(result.errors.join(' ')).toContain('ao menos uma coisa');
    });

    it('rejects a missing base class name', () => {
      const result = validate({
        baseClassName: '',
        pv: 20,
      } as HomebrewVariantClassContent);
      expect(result.valid).toBe(false);
    });

    it('rejects defining and removing spellcasting at once', () => {
      const result = validate({
        baseClassName: BASE_NAME,
        removeSpellcasting: true,
        spellcasting: {
          keyAttribute: 'Inteligência' as never,
          spellType: 'Arcane',
          initialSpells: 3,
          circleProgression: { preset: 'full' },
          spellsPerLevel: { base: 1 },
        },
      });
      expect(result.valid).toBe(false);
      expect(result.errors.join(' ')).toContain('ao mesmo tempo');
    });

    it('rejects out-of-range vitals', () => {
      const result = validate({ baseClassName: BASE_NAME, pv: 999 });
      expect(result.valid).toBe(false);
      expect(result.errors.join(' ')).toContain('PV base');
    });
  });
});
