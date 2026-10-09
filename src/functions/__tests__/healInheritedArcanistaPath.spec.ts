import { restoreSpellPath } from '../general';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { ClassAbility } from '../../interfaces/Class';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import { GeneralPowers, GeneralPowerType } from '../../interfaces/Poderes';

/**
 * Variantes de Arcanista com conjuração própria herdavam o `setup()` da base,
 * que sorteava um caminho (Bruxo/Mago/Feiticeiro) e o gravava na ficha. As
 * fichas criadas assim são curadas na carga (`restoreSpellPath`); as variantes
 * que de fato herdam o caminho passam a usar o subtipo SALVO em vez de
 * re-sortear.
 */
describe('healInheritedArcanistaPath', () => {
  const OWN_ID = 'homebrew:heal-own';
  const INHERIT_ID = 'homebrew:heal-inherit';
  const OWN_NAME = 'Arcanista Sábio';
  const INHERIT_NAME = 'Arcanista Robusto';

  const emptyGeneralPowers = (): GeneralPowers => ({
    [GeneralPowerType.COMBATE]: [],
    [GeneralPowerType.DESTINO]: [],
    [GeneralPowerType.MAGIA]: [],
    [GeneralPowerType.CONCEDIDOS]: [],
    [GeneralPowerType.TORMENTA]: [],
    [GeneralPowerType.RACA]: [],
  });

  const supplements = [
    SupplementId.TORMENTA20_CORE,
    SupplementId.TORMENTA20_HEROIS_ARTON,
    OWN_ID as SupplementId,
    INHERIT_ID as SupplementId,
  ];

  beforeAll(() => {
    dataRegistry.registerRuntimeSupplement(OWN_ID, {
      id: OWN_ID as SupplementId,
      displayName: OWN_NAME,
      races: [],
      classes: [],
      powers: emptyGeneralPowers(),
      variantClasses: [
        {
          name: OWN_NAME,
          isVariant: true,
          baseClassName: 'Arcanista',
          setup: undefined,
          spellPath: {
            initialSpells: 2,
            spellType: 'Arcane',
            keyAttribute: Atributo.SABEDORIA,
            qtySpellsLearnAtLevel: () => 1,
            spellCircleAvailableAtLevel: () => 1,
          },
        },
      ],
    });
    dataRegistry.registerRuntimeSupplement(INHERIT_ID, {
      id: INHERIT_ID as SupplementId,
      displayName: INHERIT_NAME,
      races: [],
      classes: [],
      powers: emptyGeneralPowers(),
      variantClasses: [
        {
          name: INHERIT_NAME,
          isVariant: true,
          baseClassName: 'Arcanista',
          pv: 10,
        },
      ],
    });
  });

  afterAll(() => {
    dataRegistry.unregisterRuntimeSupplement(OWN_ID);
    dataRegistry.unregisterRuntimeSupplement(INHERIT_ID);
  });

  const serialized = <T>(value: T): T => JSON.parse(JSON.stringify(value));
  const ability = (name: string): ClassAbility => ({
    name,
    text: '',
    nivel: 1,
  });
  const pathAbilities = () => [
    ability('Magias'),
    ability('Caminho do Arcanista'),
    ability('Linhagem Dracônica'),
  ];
  const classes = () => dataRegistry.getClassesBySupplements(supplements);

  /** Ficha como o bug a deixava: caminho de Feiticeiro sorteado e gravado. */
  const contaminated = (name: string): CharacterSheet =>
    ({
      nivel: 3,
      classe: serialized({
        name,
        subname: 'Feiticeiro',
        isVariant: true,
        baseClassName: 'Arcanista',
        abilities: pathAbilities(),
        originalAbilities: pathAbilities(),
        spellPath: {
          initialSpells: 3,
          spellType: 'Arcane',
          keyAttribute: Atributo.CARISMA,
          qtySpellsLearnAtLevel: () => 1,
          spellCircleAvailableAtLevel: () => 1,
        },
      }),
    } as unknown as CharacterSheet);

  it('remove o caminho sorteado de uma variante com conjuração própria', () => {
    const sheet = contaminated(OWN_NAME);

    restoreSpellPath(sheet, classes());

    expect(sheet.classe.subname).toBeUndefined();
    expect(sheet.classe.abilities.map((a) => a.name)).toEqual(['Magias']);
    expect(sheet.classe.originalAbilities?.map((a) => a.name)).toEqual([
      'Magias',
    ]);
    // Atributo-chave e magias iniciais voltam a ser os da variante, não os do
    // Feiticeiro que estavam serializados.
    expect(sheet.classe.spellPath?.keyAttribute).toBe(Atributo.SABEDORIA);
    expect(sheet.classe.spellPath?.initialSpells).toBe(2);
    expect(typeof sheet.classe.spellPath?.qtySpellsLearnAtLevel).toBe(
      'function'
    );
  });

  it('é idempotente e respeita o que o jogador mudar depois da cura', () => {
    const sheet = contaminated(OWN_NAME);
    restoreSpellPath(sheet, classes());

    // Depois de curada, o atributo-chave editado à mão volta a ser preservado.
    sheet.classe.spellPath!.keyAttribute = Atributo.INTELIGENCIA;
    restoreSpellPath(sheet, classes());

    expect(sheet.classe.subname).toBeUndefined();
    expect(sheet.classe.abilities.map((a) => a.name)).toEqual(['Magias']);
    expect(sheet.classe.spellPath?.keyAttribute).toBe(Atributo.INTELIGENCIA);
  });

  it('não toca na ficha quando a variante não está no catálogo', () => {
    const sheet = contaminated('Homebrew Desativada');

    restoreSpellPath(sheet, classes());

    expect(sheet.classe.subname).toBe('Feiticeiro');
    expect(sheet.classe.abilities).toHaveLength(3);
    expect(sheet.classe.spellPath?.keyAttribute).toBe(Atributo.CARISMA);
  });

  it('não toca no Arcanista oficial', () => {
    const sheet = contaminated('Arcanista');
    delete sheet.classe.isVariant;
    delete sheet.classe.baseClassName;

    restoreSpellPath(sheet, classes());

    expect(sheet.classe.subname).toBe('Feiticeiro');
    expect(sheet.classe.abilities).toHaveLength(3);
    expect(sheet.classe.originalAbilities).toHaveLength(3);
    expect(sheet.classe.spellPath?.keyAttribute).toBe(Atributo.CARISMA);
  });

  it('mantém o subtipo salvo de uma variante que herda o caminho', () => {
    // Feiticeiro só aprende magia em nível ímpar; Mago aprende em todo nível.
    // Antes, o setup() herdado sorteava um caminho a cada carga.
    for (let i = 0; i < 8; i += 1) {
      const sheet = contaminated(INHERIT_NAME);

      restoreSpellPath(sheet, classes());

      expect(sheet.classe.subname).toBe('Feiticeiro');
      expect(sheet.classe.abilities).toHaveLength(3);
      expect(sheet.classe.spellPath?.keyAttribute).toBe(Atributo.CARISMA);
      expect(sheet.classe.spellPath?.qtySpellsLearnAtLevel(2)).toBe(0);
      expect(sheet.classe.spellPath?.qtySpellsLearnAtLevel(3)).toBe(1);
    }
  });
});
