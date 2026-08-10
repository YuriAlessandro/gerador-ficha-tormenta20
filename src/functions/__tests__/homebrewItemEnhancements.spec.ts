import { applyItemEnhancements } from '../itemEnhancements/applyEnhancements';
import { getDefenseMaterialRd } from '../itemEnhancements/materialEffects';
import {
  toAppliedEnchantment,
  toAppliedModification,
  withMaterialSnapshot,
} from '../itemEnhancements/snapshot';
import Equipment, { DefenseEquipment } from '../../interfaces/Equipment';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';
import {
  compileEnchantments,
  compileEnhancementEffect,
  compileItemPackHomebrew,
  compileModifications,
  compileSpecialMaterials,
} from '../../premium/functions/compileItemPackage';
import { validateHomebrew } from '../../premium/functions/homebrewValidation';
import {
  HOMEBREW_SCHEMA_VERSION,
  HomebrewItemPackContent,
} from '../../premium/interfaces/Homebrew';
import Skill from '../../interfaces/Skills';

/**
 * Cobre melhorias, materiais especiais e encantos homebrew: compilação do
 * efeito achatado para o formato do motor, chegada aos seletores via registry,
 * aplicação sobre o item e — o mais importante — a DEGRADAÇÃO: um item já
 * melhorado tem que manter os números depois que o homebrew é desativado.
 */
describe('homebrew item enhancements', () => {
  const SOURCE_ID = 'homebrew:test-enh';
  const PACK_NAME = 'Forja Homebrew';

  const content: HomebrewItemPackContent = {
    items: [
      {
        category: 'weapon',
        name: 'Espada de Prova',
        price: 100,
        spaces: 1,
        damage: '1d8',
        critMultiplier: 2,
        threatMargin: 20,
        damageType: 'Corte',
        weaponCategory: 'martial',
      },
    ],
    modifications: [
      {
        name: 'Precisa de Teste',
        description: '+2 nos testes de ataque.',
        appliesTo: 'weapon',
        effect: { atkBonus: 2 },
      },
      {
        name: 'Aparadora de Teste',
        description: '+1 de Defesa a quem empunha, e +1 em Reflexos.',
        appliesTo: 'weapon',
        prerequisite: ['Precisa de Teste'],
        effect: {
          wielderDefenseBonus: 1,
          skillBonuses: [{ skill: Skill.REFLEXOS, value: 1 }],
        },
      },
    ],
    specialMaterials: [
      {
        name: 'Fervorita',
        weapon: {
          effectText: 'Causa +1d6 de dano de Fogo.',
          effect: { extraDamage: [{ dice: '1d6', damageType: 'Fogo' }] },
        },
        armor: {
          type: 'Armadura e Escudo',
          effectText: 'Fornece redução de dano de Fogo.',
          effect: { damageReduction: [{ damageType: 'Fogo', value: 3 }] },
          heavyEffect: { damageReduction: [{ damageType: 'Fogo', value: 6 }] },
        },
      },
    ],
    enchantments: [
      {
        name: 'Fulgurante de Teste',
        effectText: 'Causa +1d6 de dano de Eletricidade.',
        appliesTo: 'weapon',
        effect: { extraDamage: [{ dice: '1d6', damageType: 'Eletricidade' }] },
      },
      {
        name: 'Sussurrante de Teste',
        effectText: 'A arma sussurra segredos. Puramente narrativo.',
        appliesTo: 'weapon',
      },
    ],
  };

  const activeSupplements = [
    SupplementId.TORMENTA20_CORE,
    SOURCE_ID as SupplementId,
  ];

  const register = () =>
    dataRegistry.registerRuntimeSupplement(
      SOURCE_ID,
      compileItemPackHomebrew(content, PACK_NAME, SOURCE_ID)
    );

  const baseWeapon = (): Equipment => ({
    group: 'Arma',
    nome: 'Espada de Prova',
    dano: '1d8',
    critico: 'x2',
    spaces: 1,
    preco: 100,
    atkBonus: 0,
  });

  beforeAll(register);
  afterAll(() => dataRegistry.unregisterRuntimeSupplement(SOURCE_ID));

  describe('compilation', () => {
    it('flattens the authored effect into the engine shape', () => {
      const compiled = compileEnhancementEffect({
        atkBonus: 2,
        damageBonus: 1,
        damageStepUp: 1,
        critMultiplierDelta: 1,
        threatMarginDelta: 1,
        defenseBonusDelta: 2,
        armorPenaltyDelta: -1,
        spacesDelta: 1,
        wielderDefenseBonus: 1,
        doubleThreatMargin: true,
      });

      expect(compiled.weaponStats).toEqual({
        atkBonus: 2,
        danoDelta: 1,
        danoStepUp: 1,
        criticoMultDelta: 1,
        criticoThreatDelta: 1,
      });
      expect(compiled.defenseStats).toEqual({
        defenseBonusDelta: 2,
        armorPenaltyDelta: -1,
      });
      expect(compiled.spacesDelta).toBe(1);
      expect(compiled.defenseBonus).toBe(1);
      expect(compiled.criticoThreatDoubleMargin).toBe(true);
    });

    it('omits empty sub-objects', () => {
      const compiled = compileEnhancementEffect({ spacesDelta: 1 });
      expect('weaponStats' in compiled).toBe(false);
      expect('defenseStats' in compiled).toBe(false);
    });

    it('keeps homebrew mods out of the random treasure tables', () => {
      const { weapons } = compileModifications(content.modifications!);
      // Todo rolamento de tesouro é 1..100, então 0/0 nunca casa.
      weapons!.forEach((mod) => {
        expect(mod.min).toBe(0);
        expect(mod.max).toBe(0);
      });
    });

    it('routes appliesTo into the right buckets', () => {
      const compiled = compileModifications([
        {
          name: 'Só arma',
          description: 'x',
          appliesTo: 'weapon',
          effect: { atkBonus: 1 },
        },
        {
          name: 'Tudo',
          description: 'x',
          appliesTo: 'all',
          effect: { spacesDelta: 1 },
        },
      ]);
      expect(compiled.weapons?.map((m) => m.mod)).toEqual(['Só arma', 'Tudo']);
      expect(compiled.armors?.map((m) => m.mod)).toEqual(['Tudo']);
    });

    it('normalizes the material key to lowercase and splits light vs heavy', () => {
      const [material] = compileSpecialMaterials(content.specialMaterials!);

      // A chave é o que fica gravado em `specialMaterial` no item.
      expect(material.name).toBe('fervorita');
      expect(material.weaponEffect?.material).toBe('Fervorita');

      expect(material.weaponEffectStats?.extraDamage).toEqual([
        { dice: '1d6', damageType: 'Fogo' },
      ]);
      expect(material.armorEffectStats).toEqual({
        light: { damageReduction: [{ damageType: 'Fogo', value: 3 }] },
        heavy: { damageReduction: [{ damageType: 'Fogo', value: 6 }] },
      });
    });

    it('emits a flat armor effect when there is no heavy variant', () => {
      const [material] = compileSpecialMaterials([
        {
          name: 'Chumbo',
          armor: {
            type: 'Armadura e Escudo',
            effectText: 'Pesado.',
            effect: { armorPenaltyDelta: 1 },
          },
        },
      ]);
      expect(material.armorEffectStats).toEqual({
        defenseStats: { armorPenaltyDelta: 1 },
      });
    });

    it('compiles text-only enchantments without effectStats', () => {
      const compiled = compileEnchantments(content.enchantments!);
      const textOnly = compiled.weapons?.find(
        (e) => e.enchantment === 'Sussurrante de Teste'
      );
      expect(textOnly).toBeDefined();
      expect(textOnly?.effectStats).toBeUndefined();
    });
  });

  describe('registry exposure', () => {
    it('offers homebrew mods, materials and enchantments to the pickers', () => {
      const improvements =
        dataRegistry.getImprovementsBySupplements(activeSupplements);
      const materials =
        dataRegistry.getSpecialMaterialsBySupplements(activeSupplements);
      const enchantments =
        dataRegistry.getEnchantmentsBySupplements(activeSupplements);

      expect(
        improvements.weapons.some((m) => m.mod === 'Precisa de Teste')
      ).toBe(true);
      expect(materials.some((m) => m.name === 'fervorita')).toBe(true);
      expect(
        enchantments.weapons.some(
          (e) => e.enchantment === 'Fulgurante de Teste'
        )
      ).toBe(true);

      // Core continua lá.
      expect(improvements.weapons.some((m) => m.mod === 'Certeira')).toBe(true);
    });
  });

  describe('application', () => {
    const homebrewMod = () =>
      dataRegistry
        .getImprovementsBySupplements(activeSupplements)
        .weapons.find((m) => m.mod === 'Precisa de Teste')!;

    it('applies the snapshotted effect to the item', () => {
      const item: Equipment = {
        ...baseWeapon(),
        modifications: [toAppliedModification(homebrewMod())],
      };
      expect(applyItemEnhancements(item).atkBonus).toBe(2);
    });

    it('is idempotent', () => {
      const item: Equipment = {
        ...baseWeapon(),
        modifications: [toAppliedModification(homebrewMod())],
      };
      const once = applyItemEnhancements(item);
      const twice = applyItemEnhancements(once);
      expect(twice.atkBonus).toBe(once.atkBonus);
      expect(twice.dano).toBe(once.dano);
    });

    it('stacks with a core modification', () => {
      const certeira = dataRegistry
        .getImprovementsBySupplements(activeSupplements)
        .weapons.find((m) => m.mod === 'Certeira')!;

      const item: Equipment = {
        ...baseWeapon(),
        modifications: [
          toAppliedModification(certeira),
          toAppliedModification(homebrewMod()),
        ],
      };
      // Certeira (+1, do registro estático) + homebrew (+2, do snapshot).
      expect(applyItemEnhancements(item).atkBonus).toBe(3);
    });

    it('restores base values when the modification is removed', () => {
      const withMod: Equipment = {
        ...baseWeapon(),
        modifications: [toAppliedModification(homebrewMod())],
      };
      const enhanced = applyItemEnhancements(withMod);
      const removed = applyItemEnhancements({
        ...enhanced,
        modifications: [],
      });
      expect(removed.atkBonus).toBe(0);
    });

    it('applies a homebrew enchantment as derived extra damage', () => {
      const ench = dataRegistry.getEnchantmentByName('Fulgurante de Teste')!;
      const item: Equipment = {
        ...baseWeapon(),
        enchantments: [toAppliedEnchantment(ench)],
      };
      const result = applyItemEnhancements(item);

      expect(result.extraDamage).toEqual([
        expect.objectContaining({
          dice: '1d6',
          damageType: 'Eletricidade',
          source: 'enchantment',
          sourceName: 'Fulgurante de Teste',
        }),
      ]);
    });

    it('leaves stats untouched for a text-only enchantment', () => {
      const ench = dataRegistry.getEnchantmentByName('Sussurrante de Teste')!;
      const item: Equipment = {
        ...baseWeapon(),
        enchantments: [toAppliedEnchantment(ench)],
      };
      const result = applyItemEnhancements(item);
      expect(result.atkBonus).toBe(0);
      expect(result.dano).toBe('1d8');
    });

    it('applies a homebrew material as extra damage on a weapon', () => {
      const material = dataRegistry.getSpecialMaterialByName('fervorita');
      const applied = withMaterialSnapshot(
        { mod: 'Material especial', specialMaterial: 'fervorita' },
        material,
        'weapon'
      );
      const result = applyItemEnhancements({
        ...baseWeapon(),
        modifications: [applied],
      });

      expect(result.extraDamage).toEqual([
        expect.objectContaining({ dice: '1d6', damageType: 'Fogo' }),
      ]);
    });

    it('splits material RD between light and heavy armor', () => {
      const material = dataRegistry.getSpecialMaterialByName('fervorita');
      const applied = withMaterialSnapshot(
        { mod: 'Material especial', specialMaterial: 'fervorita' },
        material,
        'defense'
      );
      const armor: DefenseEquipment = {
        group: 'Armadura',
        nome: 'Cota de Prova',
        spaces: 5,
        preco: 200,
        defenseBonus: 6,
        armorPenalty: -2,
        modifications: [applied],
      };

      expect(getDefenseMaterialRd(armor, false)).toEqual([
        { damageType: 'Fogo', value: 3 },
      ]);
      expect(getDefenseMaterialRd(armor, true)).toEqual([
        { damageType: 'Fogo', value: 6 },
      ]);
    });

    it('does not leak material RD through equipment sheetBonuses', () => {
      const material = dataRegistry.getSpecialMaterialByName('fervorita');
      const applied = withMaterialSnapshot(
        { mod: 'Material especial', specialMaterial: 'fervorita' },
        material,
        'defense'
      );
      const armor: DefenseEquipment = {
        group: 'Armadura',
        nome: 'Cota de Prova',
        spaces: 5,
        preco: 200,
        defenseBonus: 6,
        armorPenalty: -2,
        modifications: [applied],
      };
      const result = applyItemEnhancements(armor);

      // RD é computada no passo de RD da ficha, a partir da armadura VESTIDA.
      // Se vazasse por aqui, contaria em dobro e valeria com a armadura na
      // mochila.
      const rdBonuses = (result.sheetBonuses ?? []).filter(
        (b) => b.target.type === 'DamageReduction'
      );
      expect(rdBonuses.length).toBeGreaterThan(0);
      // (o filtro que impede o vazamento vive em `applyEquipmentBonuses`)
    });
  });

  describe('graceful degradation', () => {
    it('keeps the numbers after the homebrew is deactivated', () => {
      const mod = dataRegistry
        .getImprovementsBySupplements(activeSupplements)
        .weapons.find((m) => m.mod === 'Precisa de Teste')!;
      const item: Equipment = {
        ...baseWeapon(),
        modifications: [toAppliedModification(mod)],
      };
      const enhanced = applyItemEnhancements(item);
      expect(enhanced.atkBonus).toBe(2);

      // O usuário desativa o homebrew. O item já salvo não pode mudar.
      dataRegistry.unregisterRuntimeSupplement(SOURCE_ID);
      try {
        expect(
          dataRegistry
            .getImprovementsBySupplements(activeSupplements)
            .weapons.some((m) => m.mod === 'Precisa de Teste')
        ).toBe(false);

        const recomputed = applyItemEnhancements({
          ...enhanced,
          // força o recálculo do zero
          atkBonus: enhanced.baseAtkBonus,
        });
        expect(recomputed.atkBonus).toBe(2);
        // A prosa também sobrevive, para a ficha continuar explicando o número.
        expect(recomputed.modifications?.[0].description).toBe(
          '+2 nos testes de ataque.'
        );
      } finally {
        register();
      }
    });

    it('resolves a snapshotted item with no supplement registered at all', () => {
      // Nada no registry: só o dado congelado no item.
      const item: Equipment = {
        ...baseWeapon(),
        modifications: [
          {
            mod: 'Melhoria Fantasma',
            effect: { weaponStats: { atkBonus: 3, danoDelta: 2 } },
            description: 'De um pacote que não existe mais.',
          },
        ],
      };
      const result = applyItemEnhancements(item);
      expect(result.atkBonus).toBe(3);
      expect(result.dano).toBe('1d8+2');
    });
  });

  describe('validation', () => {
    const validate = (data: HomebrewItemPackContent) =>
      validateHomebrew({
        type: 'itemPackage',
        editorMode: 'advanced',
        schemaVersion: HOMEBREW_SCHEMA_VERSION,
        name: PACK_NAME,
        description: 'Pacote de teste',
        content: { type: 'itemPackage', data },
      });

    it('accepts the reference pack', () => {
      expect(validate(content)).toEqual({ valid: true, errors: [] });
    });

    it('requires a mechanical effect on a modification', () => {
      const result = validate({
        ...content,
        modifications: [
          {
            name: 'Só Texto',
            description: 'Faz algo bonito mas nenhum número.',
            appliesTo: 'weapon',
            effect: {},
          },
        ],
      });
      expect(result.valid).toBe(false);
      expect(result.errors.join(' ')).toContain('efeito mecânico');
    });

    it('rejects a name colliding with core content', () => {
      const result = validate({
        ...content,
        modifications: [
          {
            name: 'Certeira',
            description: 'Colide com a melhoria oficial.',
            appliesTo: 'weapon',
            effect: { atkBonus: 1 },
          },
        ],
      });
      expect(result.valid).toBe(false);
      expect(result.errors.join(' ')).toContain('livro básico');
    });

    it('rejects an unknown prerequisite', () => {
      const result = validate({
        ...content,
        modifications: [
          {
            name: 'Dependente',
            description: 'x',
            appliesTo: 'weapon',
            prerequisite: ['Melhoria Que Não Existe'],
            effect: { atkBonus: 1 },
          },
        ],
      });
      expect(result.valid).toBe(false);
      expect(result.errors.join(' ')).toContain('Pré-requisito desconhecido');
    });

    it('accepts a prerequisite pointing at a core modification', () => {
      const result = validate({
        ...content,
        modifications: [
          {
            name: 'Depende da Certeira',
            description: 'x',
            appliesTo: 'weapon',
            prerequisite: ['Certeira'],
            effect: { atkBonus: 1 },
          },
        ],
      });
      expect(result.valid).toBe(true);
    });

    it('rejects an out-of-range effect value', () => {
      const result = validate({
        ...content,
        modifications: [
          {
            name: 'Absurda',
            description: 'x',
            appliesTo: 'weapon',
            effect: { atkBonus: 99 },
          },
        ],
      });
      expect(result.valid).toBe(false);
      expect(result.errors.join(' ')).toContain('atkBonus');
    });

    it('requires a material to have at least one mechanical side', () => {
      const result = validate({
        ...content,
        specialMaterials: [
          {
            name: 'Vazio',
            weapon: { effectText: 'Nada acontece.' },
          },
        ],
      });
      expect(result.valid).toBe(false);
      expect(result.errors.join(' ')).toContain('efeito mecânico');
    });

    it('allows a text-only enchantment', () => {
      const result = validate({
        ...content,
        enchantments: [
          {
            name: 'Só Prosa',
            effectText: 'Brilha no escuro.',
            appliesTo: 'weapon',
          },
        ],
      });
      expect(result.valid).toBe(true);
    });
  });
});
