import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';
import { SupplementData } from '../../data/systems/tormenta20';
import { ItemE, ItemMod } from '../../interfaces/Rewards';
import { SpecialMaterial } from '../../interfaces/SpecialMaterials';
import { GeneralPowers, GeneralPowerType } from '../../interfaces/Poderes';

/**
 * Cobre os getters de melhorias, encantos e materiais especiais do registry.
 *
 * Antes deles, as telas de melhoria/encanto liam `TORMENTA20_SYSTEM.supplements`
 * direto, o que tornava conteúdo registrado em runtime (homebrew) invisível.
 * Estes testes travam três garantias: o core sempre entra, o conteúdo runtime
 * é somado e carimbado, e o cache é invalidado ao registrar/desregistrar.
 */
describe('registry enhancement getters', () => {
  const SOURCE_ID = 'homebrew:test-enhancements';
  const DISPLAY_NAME = 'Forja de Teste';

  const weaponMod: ItemMod = {
    min: 0,
    max: 0,
    mod: 'Teste Certeiro',
    description: '+1 nos testes de ataque (teste)',
    appliesTo: 'weapon',
  };

  const armorMod: ItemMod = {
    min: 0,
    max: 0,
    mod: 'Teste Reforçado',
    description: '+1 de Defesa (teste)',
    appliesTo: 'armor',
  };

  const weaponEnchantment: ItemE = {
    min: 0,
    max: 0,
    enchantment: 'Teste Flamejante',
    effect: 'Causa +1d6 de dano de fogo (teste)',
  };

  const material: SpecialMaterial = {
    name: 'liga de teste',
    weaponEffect: {
      material: 'Liga de Teste',
      type: 'Arma',
      effect: 'Aumenta o dano em um passo (teste)',
    },
    armorEffect: {
      material: 'Liga de Teste',
      type: 'Armadura e Escudo',
      effect: 'Fornece RD 2 (teste)',
    },
  };

  const emptyPowers = (): GeneralPowers =>
    Object.values(GeneralPowerType).reduce(
      (acc, type) => ({ ...acc, [type]: [] }),
      {} as GeneralPowers
    );

  const supplement: SupplementData = {
    id: SOURCE_ID as SupplementId,
    displayName: DISPLAY_NAME,
    races: [],
    classes: [],
    powers: emptyPowers(),
    improvements: { weapons: [weaponMod], armors: [armorMod] },
    enchantments: { weapons: [weaponEnchantment] },
    specialMaterials: [material],
  };

  const activeSupplements = [
    SupplementId.TORMENTA20_CORE,
    SOURCE_ID as SupplementId,
  ];

  beforeAll(() => {
    dataRegistry.registerRuntimeSupplement(SOURCE_ID, supplement);
  });

  afterAll(() => {
    dataRegistry.unregisterRuntimeSupplement(SOURCE_ID);
  });

  it('includes core improvements alongside runtime ones', () => {
    const improvements =
      dataRegistry.getImprovementsBySupplements(activeSupplements);

    // Core continua presente — o getter não substitui, soma.
    expect(improvements.weapons.some((m) => m.mod === 'Certeira')).toBe(true);
    expect(improvements.armors.some((m) => m.mod === 'Reforçada')).toBe(true);

    expect(improvements.weapons.some((m) => m.mod === weaponMod.mod)).toBe(
      true
    );
    expect(improvements.armors.some((m) => m.mod === armorMod.mod)).toBe(true);
  });

  it('stamps supplementId and supplementName on runtime improvements', () => {
    const improvements =
      dataRegistry.getImprovementsBySupplements(activeSupplements);
    const found = improvements.weapons.find((m) => m.mod === weaponMod.mod);

    expect(found?.supplementId).toBe(SOURCE_ID);
    // displayName do SupplementData, não o id cru.
    expect(found?.supplementName).toBe(DISPLAY_NAME);
  });

  it('does not mutate the source data when stamping', () => {
    dataRegistry.getImprovementsBySupplements(activeSupplements);
    expect(weaponMod.supplementId).toBeUndefined();
    expect(weaponMod.supplementName).toBeUndefined();
  });

  it('includes core enchantments alongside runtime ones', () => {
    const enchantments =
      dataRegistry.getEnchantmentsBySupplements(activeSupplements);

    expect(
      enchantments.weapons.some((e) => e.enchantment === 'Flamejante')
    ).toBe(true);
    const found = enchantments.weapons.find(
      (e) => e.enchantment === weaponEnchantment.enchantment
    );
    expect(found?.supplementName).toBe(DISPLAY_NAME);
  });

  it('includes core special materials alongside runtime ones', () => {
    const materials =
      dataRegistry.getSpecialMaterialsBySupplements(activeSupplements);

    expect(materials.some((m) => m.name === 'adamante')).toBe(true);
    const found = materials.find((m) => m.name === material.name);
    expect(found?.supplementName).toBe(DISPLAY_NAME);
  });

  it('resolves runtime materials and enchantments by name regardless of activation', () => {
    // Estes lookups ignoram a lista de ativos de propósito: um item salvo
    // guarda só o nome e precisa continuar exibindo o efeito.
    expect(dataRegistry.getSpecialMaterialByName(material.name)?.name).toBe(
      material.name
    );
    expect(
      dataRegistry.getEnchantmentByName(weaponEnchantment.enchantment)?.effect
    ).toBe(weaponEnchantment.effect);

    // E o core continua resolvendo.
    expect(dataRegistry.getSpecialMaterialByName('mitral')).toBeDefined();
    expect(dataRegistry.getEnchantmentByName('Flamejante')).toBeDefined();
  });

  it('returns core-only content once the runtime supplement is unregistered', () => {
    dataRegistry.unregisterRuntimeSupplement(SOURCE_ID);

    const improvements =
      dataRegistry.getImprovementsBySupplements(activeSupplements);
    const enchantments =
      dataRegistry.getEnchantmentsBySupplements(activeSupplements);
    const materials =
      dataRegistry.getSpecialMaterialsBySupplements(activeSupplements);

    // Se o cache não fosse invalidado, o conteúdo antigo continuaria aqui.
    expect(improvements.weapons.some((m) => m.mod === weaponMod.mod)).toBe(
      false
    );
    expect(
      enchantments.weapons.some(
        (e) => e.enchantment === weaponEnchantment.enchantment
      )
    ).toBe(false);
    expect(materials.some((m) => m.name === material.name)).toBe(false);

    // Core intacto.
    expect(improvements.weapons.some((m) => m.mod === 'Certeira')).toBe(true);

    dataRegistry.registerRuntimeSupplement(SOURCE_ID, supplement);
  });

  it('bumps the runtime version on register and unregister', () => {
    const before = dataRegistry.getRuntimeSupplementsVersion();
    dataRegistry.unregisterRuntimeSupplement(SOURCE_ID);
    const afterUnregister = dataRegistry.getRuntimeSupplementsVersion();
    dataRegistry.registerRuntimeSupplement(SOURCE_ID, supplement);
    const afterRegister = dataRegistry.getRuntimeSupplementsVersion();

    expect(afterUnregister).toBeGreaterThan(before);
    expect(afterRegister).toBeGreaterThan(afterUnregister);
  });

  it('notifies subscribers when the runtime set changes', () => {
    let calls = 0;
    const unsubscribe = dataRegistry.subscribeRuntimeSupplements(() => {
      calls += 1;
    });

    dataRegistry.unregisterRuntimeSupplement(SOURCE_ID);
    dataRegistry.registerRuntimeSupplement(SOURCE_ID, supplement);
    expect(calls).toBe(2);

    unsubscribe();
    dataRegistry.unregisterRuntimeSupplement(SOURCE_ID);
    dataRegistry.registerRuntimeSupplement(SOURCE_ID, supplement);
    expect(calls).toBe(2);
  });
});
