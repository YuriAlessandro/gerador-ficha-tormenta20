/**
 * Data Registry - Sistema Central de Gerenciamento Multi-Sistema
 *
 * Este registry é responsável por combinar dados de múltiplos suplementos
 * de diferentes sistemas de RPG de acordo com as preferências do usuário.
 */
import _ from 'lodash';
import { SystemId } from '../types/system.types';
import { SupplementId, SUPPLEMENT_METADATA } from '../types/supplement.types';
import {
  TORMENTA20_SYSTEM,
  SystemData,
  SupplementData,
} from './systems/tormenta20';
import Race from '../interfaces/Race';
import { ClassDescription, ClassNames, ClassPower } from '../interfaces/Class';
import {
  GeneralPower,
  GeneralPowers,
  RequirementType,
} from '../interfaces/Poderes';
import Origin from '../interfaces/Origin';
import {
  GOLPE_PESSOAL_EFFECTS,
  GolpePessoalEffect,
} from './systems/tormenta20/golpePessoal';
import { MarketEquipment } from '../interfaces/MarketEquipment';
import Equipment, { DefenseEquipment } from '../interfaces/Equipment';
import { Armas, Armaduras, Escudos } from './systems/tormenta20/equipamentos';
import {
  esotericos,
  animais,
  generalItems as coreGeneralItems,
  clothingItems as coreClothingItems,
  alchemyItems as coreAlchemyItems,
  foodItems as coreFoodItems,
} from './systems/tormenta20/equipamentos-gerais';
import { Spell, SpellCircle, spellsCircles } from '../interfaces/Spells';
import {
  arcaneSpellsCircle1,
  arcaneSpellsCircle2,
  arcaneSpellsCircle3,
  arcaneSpellsCircle4,
  arcaneSpellsCircle5,
} from './systems/tormenta20/magias/arcane';
import {
  divineSpellsCircle1,
  divineSpellsCircle2,
  divineSpellsCircle3,
  divineSpellsCircle4,
  divineSpellsCircle5,
} from './systems/tormenta20/magias/divine';
import Divindade from '../interfaces/Divindade';
import { Sincretismo } from '../interfaces/Sincretismo';
import { DIVINDADES } from './systems/tormenta20/divindades';
import { ItemE, ItemMod } from '../interfaces/Rewards';
import { SpecialMaterial } from '../interfaces/SpecialMaterials';
import {
  weaponsModifications,
  armorsModifications,
  weaponsEnchantments,
  armorEnchantments,
} from './rewards/items';
import { specialMaterials as coreSpecialMaterials } from './systems/tormenta20/specialMaterials';

/**
 * Tipos para dados com informação de origem do suplemento
 */
export interface RaceWithSupplement extends Race {
  supplementId: SupplementId;
  supplementName: string;
}

export interface ClassWithSupplement extends ClassDescription {
  supplementId: SupplementId;
  supplementName: string;
}

export interface OriginWithSupplement extends Origin {
  supplementId: SupplementId;
  supplementName: string;
}

export interface GeneralPowerWithSupplement extends GeneralPower {
  supplementId: SupplementId;
  supplementName: string;
}

export interface GeneralPowersWithSupplement {
  COMBATE: GeneralPowerWithSupplement[];
  CONCEDIDOS: GeneralPowerWithSupplement[];
  DESTINO: GeneralPowerWithSupplement[];
  MAGIA: GeneralPowerWithSupplement[];
  TORMENTA: GeneralPowerWithSupplement[];
  RACA: GeneralPowerWithSupplement[];
}

export interface GolpePessoalEffectWithSupplement extends GolpePessoalEffect {
  supplementId?: SupplementId;
  supplementName?: string;
}

/** Melhorias (modificações) de item combinadas de core + suplementos ativos */
export interface ResolvedImprovements {
  weapons: ItemMod[];
  armors: ItemMod[];
}

/** Encantos mágicos combinados de core + suplementos ativos */
export interface ResolvedEnchantments {
  weapons: ItemE[];
  armors: ItemE[];
}

/**
 * Mapa de todos os sistemas disponíveis
 */
const SYSTEMS_MAP: Record<SystemId, SystemData> = {
  [SystemId.TORMENTA20]: TORMENTA20_SYSTEM,
  // Future systems will be added here
};

/**
 * Cache para evitar recalcular combinações
 */
interface CacheEntry<T> {
  system: SystemId;
  supplements: SupplementId[];
  data: T;
}

class DataRegistry {
  private racesCache: CacheEntry<Race[]> | null = null;

  private classesCache: CacheEntry<ClassDescription[]> | null = null;

  private powersCache: CacheEntry<GeneralPowers> | null = null;

  private equipmentCache: CacheEntry<MarketEquipment> | null = null;

  private improvementsCache: CacheEntry<ResolvedImprovements> | null = null;

  private enchantmentsCache: CacheEntry<ResolvedEnchantments> | null = null;

  private specialMaterialsCache: CacheEntry<SpecialMaterial[]> | null = null;

  private sincretismosCache: CacheEntry<Sincretismo[]> | null = null;

  private currentSystem: SystemId = SystemId.TORMENTA20;

  /**
   * Suplementos registrados em runtime, indexados por um id string dinâmico.
   * Ponto de extensão genérico: permite a outros módulos injetar conteúdo
   * (compilado para `SupplementData`) que os métodos `*BySupplements` passam a
   * resolver como um suplemento oficial — sem mudança nos consumidores. São
   * mesclados em `getResolvedSystemData`.
   */
  private runtimeSupplements: Map<string, SupplementData> = new Map();

  /**
   * Contador incrementado a cada mudança no conjunto de suplementos runtime.
   * Serve de snapshot para quem assina o registry — hooks que derivam a lista
   * de suplementos ativos precisam recalcular quando homebrews são
   * registrados/removidos, e não há nenhum estado do Redux que mude nesse
   * momento.
   */
  private runtimeVersion = 0;

  private runtimeListeners = new Set<() => void>();

  private bumpRuntimeVersion(): void {
    this.runtimeVersion += 1;
    this.runtimeListeners.forEach((listener) => listener());
  }

  /**
   * Inscreve um callback nas mudanças do conjunto de suplementos runtime.
   * Devolve a função de cancelamento. Arrow function para poder ser passada
   * direto a um `useEffect` sem re-bind.
   */
  subscribeRuntimeSupplements = (listener: () => void): (() => void) => {
    this.runtimeListeners.add(listener);
    return () => {
      this.runtimeListeners.delete(listener);
    };
  };

  /**
   * Snapshot do conjunto de suplementos runtime (muda a cada
   * registro/remoção). Arrow function pelo mesmo motivo acima.
   */
  getRuntimeSupplementsVersion = (): number => this.runtimeVersion;

  /**
   * Define o sistema atual
   */
  setCurrentSystem(systemId: SystemId): void {
    if (this.currentSystem !== systemId) {
      this.currentSystem = systemId;
      this.clearCache();
    }
  }

  /**
   * Retorna o sistema atual
   */
  getCurrentSystem(): SystemId {
    return this.currentSystem;
  }

  /**
   * Retorna dados de um sistema específico
   */
  // eslint-disable-next-line class-methods-use-this
  getSystemData(systemId: SystemId): SystemData | undefined {
    return SYSTEMS_MAP[systemId];
  }

  /**
   * Registra um suplemento em runtime para que os métodos `*BySupplements` o
   * resolvam como um suplemento oficial. Invalida o cache.
   *
   * @param id   id string dinâmico do suplemento runtime
   * @param data SupplementData a ser exposto sob esse id
   */
  registerRuntimeSupplement(id: string, data: SupplementData): void {
    this.runtimeSupplements.set(id, data);
    this.clearCache();
    this.bumpRuntimeVersion();
  }

  /**
   * Remove um suplemento runtime previamente registrado e invalida o cache.
   */
  unregisterRuntimeSupplement(id: string): void {
    if (this.runtimeSupplements.delete(id)) {
      this.clearCache();
      this.bumpRuntimeVersion();
    }
  }

  /**
   * Remove todos os suplementos runtime registrados (ex: logout) e invalida o
   * cache.
   */
  clearRuntimeSupplements(): void {
    if (this.runtimeSupplements.size > 0) {
      this.runtimeSupplements.clear();
      this.clearCache();
      this.bumpRuntimeVersion();
    }
  }

  /**
   * Ids dos suplementos atualmente registrados em runtime. Permite a um
   * consumidor incluí-los no array passado aos métodos `*BySupplements`.
   */
  getRuntimeSupplementIds(): string[] {
    return Array.from(this.runtimeSupplements.keys());
  }

  /**
   * Dados de um suplemento registrado em runtime, por id. Permite a um
   * consumidor ler o conteúdo (ex.: magias) de suplementos runtime sem
   * acoplar-se ao sistema estático.
   */
  getRuntimeSupplement(id: string): SupplementData | undefined {
    return this.runtimeSupplements.get(id);
  }

  /**
   * Nome de exibição de um suplemento, oficial ou runtime.
   *
   * Suplementos runtime (ex.: `homebrew:<id>`) não estão em
   * `SUPPLEMENT_METADATA`, então o fallback antigo (`?.name || id`) vazava o id
   * cru para a UI. Aqui caímos primeiro no `displayName` que o próprio
   * `SupplementData` carrega, e só depois no id.
   */
  private supplementNameOf(id: string): string {
    return (
      SUPPLEMENT_METADATA[id as SupplementId]?.name ||
      this.runtimeSupplements.get(id)?.displayName ||
      id
    );
  }

  /**
   * Nome e abreviação de exibição de um suplemento, oficial ou runtime. Ponto
   * único para componentes que hoje leem `SUPPLEMENT_METADATA` direto e
   * mostrariam `homebrew:<id>` como rótulo.
   */
  getSupplementLabel(id: string): { name: string; abbreviation: string } {
    const meta = SUPPLEMENT_METADATA[id as SupplementId];
    if (meta) return { name: meta.name, abbreviation: meta.abbreviation || '' };

    const displayName = this.runtimeSupplements.get(id)?.displayName;
    return {
      name: displayName || id,
      abbreviation: displayName || 'Homebrew',
    };
  }

  /**
   * Retorna os dados do sistema com os suplementos runtime mesclados em
   * `supplements`. Indexar por um id runtime (string dinâmica) resolve para o
   * `SupplementData` registrado. Sem suplementos runtime, retorna o sistema
   * oficial sem cópia.
   */
  private getResolvedSystemData(systemId: SystemId): SystemData | undefined {
    const base = SYSTEMS_MAP[systemId];
    if (!base || this.runtimeSupplements.size === 0) return base;

    return {
      ...base,
      supplements: {
        ...base.supplements,
        ...Object.fromEntries(this.runtimeSupplements),
      } as typeof base.supplements,
    };
  }

  /**
   * Retorna raças de todos os suplementos ativos
   */
  getRacesBySupplements(
    supplementIds: SupplementId[],
    systemId: SystemId = this.currentSystem
  ): Race[] {
    // Garante que CORE está sempre incluído
    const supplements = this.ensureCore(supplementIds, systemId);

    // Verifica cache
    if (this.isCacheValid(this.racesCache, supplements, systemId)) {
      return this.racesCache!.data;
    }

    const systemData = this.getResolvedSystemData(systemId);
    if (!systemData) return [];

    // Combina raças de todos os suplementos (exclui deprecated)
    const races = supplements
      .flatMap((id) => systemData.supplements[id]?.races || [])
      .filter((race) => !race.deprecated);

    // Atualiza cache
    this.racesCache = { system: systemId, supplements, data: races };
    return races;
  }

  /**
   * Retorna raças com informação do suplemento de origem
   * Nota: Não força CORE para permitir filtragem na enciclopédia
   */
  getRacesWithSupplementInfo(
    supplementIds: SupplementId[],
    systemId: SystemId = this.currentSystem
  ): RaceWithSupplement[] {
    const systemData = this.getResolvedSystemData(systemId);
    if (!systemData) return [];

    // Combina raças com informação de origem
    const racesWithInfo: RaceWithSupplement[] = [];

    supplementIds.forEach((supplementId) => {
      const races = systemData.supplements[supplementId]?.races || [];
      const supplementName = this.supplementNameOf(supplementId);

      races
        .filter((race) => !race.deprecated)
        .forEach((race) => {
          racesWithInfo.push({
            ...race,
            supplementId,
            supplementName,
          });
        });
    });

    return racesWithInfo;
  }

  /**
   * Retorna classes de todos os suplementos ativos
   * Mescla poderes de classe adicionais de suplementos nas classes base
   */
  getClassesBySupplements(
    supplementIds: SupplementId[],
    systemId: SystemId = this.currentSystem
  ): ClassDescription[] {
    const supplements = this.ensureCore(supplementIds, systemId);

    if (this.isCacheValid(this.classesCache, supplements, systemId)) {
      return this.classesCache!.data;
    }

    const systemData = this.getResolvedSystemData(systemId);
    if (!systemData) return [];

    // Coleta todas as classes
    const classes = supplements.flatMap(
      (id) => systemData.supplements[id]?.classes || []
    );

    // Coleta todos os poderes de classe adicionais dos suplementos (com informação de origem)
    const additionalClassPowers: Partial<Record<ClassNames, ClassPower[]>> = {};
    supplements.forEach((id) => {
      // Pula o suplemento core para não marcar poderes do livro básico
      if (id === SupplementId.TORMENTA20_CORE) return;

      const supplementClassPowers = systemData.supplements[id]?.classPowers;
      if (supplementClassPowers) {
        const supplementName = this.supplementNameOf(id);
        Object.entries(supplementClassPowers).forEach(([className, powers]) => {
          const key = className as ClassNames;
          if (!additionalClassPowers[key]) {
            additionalClassPowers[key] = [];
          }
          // Adiciona informação do suplemento em cada poder
          const powersWithSupplementInfo = powers.map((power) => ({
            ...power,
            supplementId: id,
            supplementName,
          }));
          additionalClassPowers[key]!.push(...powersWithSupplementInfo);
        });
      }
    });

    // Mescla poderes adicionais nas classes correspondentes
    const mergedClasses = classes.map((classDesc) => {
      const additionalPowers =
        additionalClassPowers[classDesc.name as ClassNames];
      if (additionalPowers && additionalPowers.length > 0) {
        return {
          ...classDesc,
          powers: [...classDesc.powers, ...additionalPowers],
        };
      }
      return classDesc;
    });

    // Coleta classes variantes e herda propriedades da classe base
    // A variante só define overrides — o resto é herdado automaticamente
    const variantClasses: ClassDescription[] = [];
    supplements.forEach((id) => {
      const supplementVariants = systemData.supplements[id]?.variantClasses;
      if (supplementVariants) {
        supplementVariants.forEach((variant) => {
          const baseClass = mergedClasses.find(
            (c) => c.name === variant.baseClassName
          );
          if (baseClass) {
            const inheritedPowers = variant.excludeAllBasePowers
              ? []
              : baseClass.powers.filter(
                  (p) => !(variant.excludedPowers || []).includes(p.name)
                );
            variantClasses.push({
              ...baseClass,
              ...variant,
              powers: [...inheritedPowers, ...(variant.powers || [])],
            });
          }
        });
      }
    });

    const allClasses = [...mergedClasses, ...variantClasses];
    this.classesCache = { system: systemId, supplements, data: allClasses };
    return allClasses;
  }

  /**
   * Retorna classes com informação do suplemento de origem
   * Mescla poderes de classe adicionais de suplementos nas classes base
   * Nota: Não força CORE para permitir filtragem na enciclopédia
   */
  getClassesWithSupplementInfo(
    supplementIds: SupplementId[],
    systemId: SystemId = this.currentSystem
  ): ClassWithSupplement[] {
    const systemData = this.getResolvedSystemData(systemId);
    if (!systemData) return [];

    // Coleta todos os poderes de classe adicionais dos suplementos (com informação de origem)
    const additionalClassPowers: Partial<Record<ClassNames, ClassPower[]>> = {};
    supplementIds.forEach((id) => {
      // Pula o suplemento core para não marcar poderes do livro básico
      if (id === SupplementId.TORMENTA20_CORE) return;

      const supplementClassPowers = systemData.supplements[id]?.classPowers;
      if (supplementClassPowers) {
        const supName = this.supplementNameOf(id);
        Object.entries(supplementClassPowers).forEach(([className, powers]) => {
          const key = className as ClassNames;
          if (!additionalClassPowers[key]) {
            additionalClassPowers[key] = [];
          }
          // Adiciona informação do suplemento em cada poder
          const powersWithSupplementInfo = (powers as ClassPower[]).map(
            (power) => ({
              ...power,
              supplementId: id,
              supplementName: supName,
            })
          );
          additionalClassPowers[key]!.push(...powersWithSupplementInfo);
        });
      }
    });

    // Combina classes com informação de origem
    const classesWithInfo: ClassWithSupplement[] = [];

    supplementIds.forEach((supplementId) => {
      const classes = systemData.supplements[supplementId]?.classes || [];
      const supplementName = this.supplementNameOf(supplementId);

      classes.forEach((classDesc) => {
        // Mescla poderes adicionais na classe
        const additionalPowers =
          additionalClassPowers[classDesc.name as ClassNames];
        const mergedClass =
          additionalPowers && additionalPowers.length > 0
            ? {
                ...classDesc,
                powers: [...classDesc.powers, ...additionalPowers],
              }
            : classDesc;

        classesWithInfo.push({
          ...mergedClass,
          supplementId,
          supplementName,
        });
      });
    });

    // Adiciona classes variantes com herança de propriedades da classe base
    // A variante só define overrides — o resto é herdado automaticamente
    supplementIds.forEach((supplementId) => {
      const variants =
        systemData.supplements[supplementId]?.variantClasses || [];
      const supplementName = this.supplementNameOf(supplementId);

      variants.forEach((variant) => {
        const baseClass = classesWithInfo.find(
          (c) => c.name === variant.baseClassName
        );
        if (baseClass) {
          const inheritedPowers = variant.excludeAllBasePowers
            ? []
            : baseClass.powers.filter(
                (p) => !(variant.excludedPowers || []).includes(p.name)
              );
          classesWithInfo.push({
            ...baseClass,
            ...variant,
            powers: [...inheritedPowers, ...(variant.powers || [])],
            supplementId,
            supplementName,
          });
        }
      });
    });

    return classesWithInfo;
  }

  /**
   * Retorna poderes combinados de todos os suplementos ativos
   */
  getPowersBySupplements(
    supplementIds: SupplementId[],
    systemId: SystemId = this.currentSystem
  ): GeneralPowers {
    const supplements = this.ensureCore(supplementIds, systemId);

    if (this.isCacheValid(this.powersCache, supplements, systemId)) {
      return this.powersCache!.data;
    }

    const systemData = this.getResolvedSystemData(systemId);
    if (!systemData) {
      return {
        COMBATE: [],
        CONCEDIDOS: [],
        DESTINO: [],
        MAGIA: [],
        TORMENTA: [],
        RACA: [],
      };
    }

    // Combina poderes por categoria
    const combinedPowers: GeneralPowers = {
      COMBATE: [],
      CONCEDIDOS: [],
      DESTINO: [],
      MAGIA: [],
      TORMENTA: [],
      RACA: [],
    };

    supplements.forEach((id) => {
      const supplementPowers = systemData.supplements[id]?.powers;
      if (supplementPowers) {
        combinedPowers.COMBATE.push(...supplementPowers.COMBATE);
        combinedPowers.CONCEDIDOS.push(...supplementPowers.CONCEDIDOS);
        combinedPowers.DESTINO.push(...supplementPowers.DESTINO);
        combinedPowers.MAGIA.push(...supplementPowers.MAGIA);
        combinedPowers.TORMENTA.push(...supplementPowers.TORMENTA);
        combinedPowers.RACA.push(...supplementPowers.RACA);
      }
    });

    this.powersCache = { system: systemId, supplements, data: combinedPowers };
    return combinedPowers;
  }

  /**
   * Retorna todos os poderes como array flat
   */
  getAllPowersBySupplements(
    supplementIds: SupplementId[],
    systemId: SystemId = this.currentSystem
  ): GeneralPower[] {
    const powers = this.getPowersBySupplements(supplementIds, systemId);
    return Object.values(powers).flat();
  }

  /**
   * Retorna poderes com informação do suplemento de origem
   * Nota: Não força CORE para permitir filtragem na enciclopédia
   */
  getPowersWithSupplementInfo(
    supplementIds: SupplementId[],
    systemId: SystemId = this.currentSystem
  ): GeneralPowersWithSupplement {
    const systemData = this.getResolvedSystemData(systemId);

    const result: GeneralPowersWithSupplement = {
      COMBATE: [],
      CONCEDIDOS: [],
      DESTINO: [],
      MAGIA: [],
      TORMENTA: [],
      RACA: [],
    };

    if (!systemData) return result;

    supplementIds.forEach((supplementId) => {
      const supplementPowers = systemData.supplements[supplementId]?.powers;
      const supplementName = this.supplementNameOf(supplementId);

      if (supplementPowers) {
        result.COMBATE.push(
          ...supplementPowers.COMBATE.map((p) => ({
            ...p,
            supplementId,
            supplementName,
          }))
        );
        result.CONCEDIDOS.push(
          ...supplementPowers.CONCEDIDOS.map((p) => ({
            ...p,
            supplementId,
            supplementName,
          }))
        );
        result.DESTINO.push(
          ...supplementPowers.DESTINO.map((p) => ({
            ...p,
            supplementId,
            supplementName,
          }))
        );
        result.MAGIA.push(
          ...supplementPowers.MAGIA.map((p) => ({
            ...p,
            supplementId,
            supplementName,
          }))
        );
        result.TORMENTA.push(
          ...supplementPowers.TORMENTA.map((p) => ({
            ...p,
            supplementId,
            supplementName,
          }))
        );
        result.RACA.push(
          ...supplementPowers.RACA.map((p) => ({
            ...p,
            supplementId,
            supplementName,
          }))
        );
      }
    });

    return result;
  }

  /**
   * Retorna origens de todos os suplementos ativos
   * Nota: Não força CORE para permitir filtragem na enciclopédia
   */
  getOriginsBySupplements(
    supplementIds: SupplementId[],
    systemId: SystemId = this.currentSystem
  ): OriginWithSupplement[] {
    const systemData = this.getResolvedSystemData(systemId);
    if (!systemData) return [];

    const origins: OriginWithSupplement[] = [];

    supplementIds.forEach((supplementId) => {
      const supplementOrigins =
        systemData.supplements[supplementId]?.origins || [];
      const supplementName = this.supplementNameOf(supplementId);

      supplementOrigins.forEach((origin) => {
        origins.push({
          ...origin,
          supplementId,
          supplementName,
        });
      });
    });

    return origins;
  }

  /**
   * Busca uma raça por nome em todos os suplementos ativos
   */
  getRaceByName(
    name: string,
    supplementIds: SupplementId[],
    systemId: SystemId = this.currentSystem
  ): Race | undefined {
    const races = this.getRacesBySupplements(supplementIds, systemId);
    const race = races.find((r) => r.name === name);

    if (race && race.setup) {
      return race.setup(_.cloneDeep(race), races);
    }

    return _.cloneDeep(race);
  }

  /**
   * Busca uma classe por nome em todos os suplementos ativos
   * Retorna a classe com poderes mesclados de suplementos
   */
  getClassByName(
    name: string,
    supplementIds: SupplementId[],
    systemId: SystemId = this.currentSystem
  ): ClassDescription | undefined {
    const classes = this.getClassesBySupplements(supplementIds, systemId);
    const foundClass = classes.find((c) => c.name === name);
    return foundClass ? _.cloneDeep(foundClass) : undefined;
  }

  /**
   * Retorna efeitos de Golpe Pessoal combinados de todos os suplementos ativos
   * Os efeitos base do livro são sempre incluídos, e suplementos podem adicionar novos efeitos
   * Cada efeito inclui informação sobre o suplemento de origem (se não for do livro básico)
   */
  getGolpePessoalEffectsBySupplements(
    supplementIds: SupplementId[],
    systemId: SystemId = this.currentSystem
  ): Record<string, GolpePessoalEffectWithSupplement> {
    const supplements = this.ensureCore(supplementIds, systemId);
    const systemData = this.getResolvedSystemData(systemId);

    // Começa com os efeitos base (sem informação de suplemento - são do livro básico)
    const combinedEffects: Record<string, GolpePessoalEffectWithSupplement> =
      {};
    Object.entries(GOLPE_PESSOAL_EFFECTS).forEach(([key, effect]) => {
      combinedEffects[key] = { ...effect };
    });

    if (!systemData) return combinedEffects;

    // Adiciona efeitos de cada suplemento ativo (exceto CORE que já está incluído)
    supplements.forEach((id) => {
      if (id === SupplementId.TORMENTA20_CORE) return;

      const supplementEffects = systemData.supplements[id]?.golpePessoalEffects;
      if (supplementEffects) {
        const supplementName = this.supplementNameOf(id);
        Object.entries(supplementEffects).forEach(([key, effect]) => {
          combinedEffects[key] = {
            ...effect,
            supplementId: id,
            supplementName,
          };
        });
      }
    });

    return combinedEffects;
  }

  /**
   * Retorna equipamentos combinados de todos os suplementos ativos
   * Inclui armas, armaduras, escudos e itens gerais do core e suplementos
   *
   * O resultado é cacheado por combinação de suplementos: montá-lo clona ~230
   * itens de suplemento, e chamá-lo dentro de um render (como o wizard fazia)
   * refazia esse trabalho a cada tecla digitada.
   *
   * IMPORTANTE: o objeto retornado é COMPARTILHADO entre os consumidores. Não
   * mute os arrays nem os itens. Para colocar um item numa mochila, clone-o
   * antes — `ensureIds` grava `id` no objeto e contaminaria o catálogo.
   */
  getEquipmentBySupplements(
    supplementIds: SupplementId[],
    systemId: SystemId = SystemId.TORMENTA20
  ): MarketEquipment {
    if (this.isCacheValid(this.equipmentCache, supplementIds, systemId)) {
      return this.equipmentCache!.data;
    }

    const result: MarketEquipment = {
      weapons: [],
      armors: [],
      shields: [],
      generalItems: [],
      esoteric: [],
      clothing: [],
      alchemy: [],
      food: [],
      animals: [],
    };

    const systemData = this.getResolvedSystemData(systemId);
    if (!systemData) return result;

    // Add core weapons from equipamentos.ts
    result.weapons.push(...Object.values(Armas));

    // Add core armors (separating armors and shields)
    Object.values(Armaduras).forEach((armor) => {
      result.armors.push(armor);
    });

    // Add core shields
    Object.values(Escudos).forEach((shield) => {
      result.shields.push(shield);
    });

    // Add core general items
    result.generalItems.push(...coreGeneralItems);

    // Add core esoteric items
    result.esoteric.push(...esotericos);

    // Add core clothing
    result.clothing.push(...coreClothingItems);

    // Add core alchemy
    result.alchemy.push(...coreAlchemyItems);

    // Add core food
    result.food.push(...coreFoodItems);

    // Add core animal items
    result.animals.push(...animais);

    // Add equipment from supplements
    supplementIds.forEach((id) => {
      const supplementEquipment = systemData.supplements[id]?.equipment;
      if (supplementEquipment) {
        const supplementName = this.supplementNameOf(id);

        // Helper to add supplement info to item
        const addSupplementInfo = <T extends Equipment>(item: T): T => ({
          ...item,
          supplementId: id,
          supplementName,
        });

        // Add supplement weapons
        if (supplementEquipment.weapons) {
          result.weapons.push(
            ...Object.values(
              supplementEquipment.weapons as Record<string, Equipment>
            ).map(addSupplementInfo)
          );
        }

        // Add supplement armors (separating armors and shields by group)
        if (supplementEquipment.armors) {
          Object.values(
            supplementEquipment.armors as Record<string, DefenseEquipment>
          ).forEach((item) => {
            const itemWithSupplement = addSupplementInfo(item);
            if (item.group === 'Escudo') {
              result.shields.push(itemWithSupplement);
            } else {
              result.armors.push(itemWithSupplement);
            }
          });
        }

        // Add supplement general items
        if (supplementEquipment.generalItems) {
          result.generalItems.push(
            ...supplementEquipment.generalItems.map(addSupplementInfo)
          );
        }

        // Add supplement esoteric items
        if (supplementEquipment.esoteric) {
          result.esoteric.push(
            ...supplementEquipment.esoteric.map(addSupplementInfo)
          );
        }

        // Add supplement clothing
        if (supplementEquipment.clothing) {
          result.clothing.push(
            ...supplementEquipment.clothing.map(addSupplementInfo)
          );
        }

        // Add supplement alchemy
        if (supplementEquipment.alchemy) {
          result.alchemy.push(
            ...supplementEquipment.alchemy.map(addSupplementInfo)
          );
        }

        // Add supplement food
        if (supplementEquipment.food) {
          result.food.push(...supplementEquipment.food.map(addSupplementInfo));
        }

        // Add supplement animals
        if (supplementEquipment.animals) {
          result.animals.push(
            ...supplementEquipment.animals.map(addSupplementInfo)
          );
        }
      }
    });

    this.equipmentCache = {
      system: systemId,
      supplements: [...supplementIds],
      data: result,
    };
    return result;
  }

  /**
   * Melhorias (modificações) de item do livro básico somadas às dos suplementos
   * ativos, incluindo suplementos registrados em runtime.
   *
   * Antes deste getter, as telas de melhoria liam `TORMENTA20_SYSTEM.supplements`
   * direto — o que tornava conteúdo runtime invisível para elas.
   *
   * IMPORTANTE: como em `getEquipmentBySupplements`, o resultado é cacheado e
   * COMPARTILHADO. Não mute os arrays nem as entradas.
   */
  getImprovementsBySupplements(
    supplementIds: SupplementId[],
    systemId: SystemId = SystemId.TORMENTA20
  ): ResolvedImprovements {
    if (this.isCacheValid(this.improvementsCache, supplementIds, systemId)) {
      return this.improvementsCache!.data;
    }

    const result: ResolvedImprovements = {
      weapons: [...weaponsModifications],
      armors: [...armorsModifications],
    };

    const systemData = this.getResolvedSystemData(systemId);
    if (systemData) {
      supplementIds.forEach((id) => {
        const improvements = systemData.supplements[id]?.improvements;
        if (!improvements) return;

        const supplementName = this.supplementNameOf(id);
        const stamp = (mod: ItemMod): ItemMod => ({
          ...mod,
          supplementId: id,
          supplementName,
        });

        if (improvements.weapons) {
          result.weapons.push(...improvements.weapons.map(stamp));
        }
        if (improvements.armors) {
          result.armors.push(...improvements.armors.map(stamp));
        }
      });
    }

    this.improvementsCache = {
      system: systemId,
      supplements: [...supplementIds],
      data: result,
    };
    return result;
  }

  /**
   * Encantos mágicos do livro básico somados aos dos suplementos ativos,
   * incluindo suplementos registrados em runtime. Resultado cacheado e
   * compartilhado — não mutar.
   */
  getEnchantmentsBySupplements(
    supplementIds: SupplementId[],
    systemId: SystemId = SystemId.TORMENTA20
  ): ResolvedEnchantments {
    if (this.isCacheValid(this.enchantmentsCache, supplementIds, systemId)) {
      return this.enchantmentsCache!.data;
    }

    const result: ResolvedEnchantments = {
      weapons: [...weaponsEnchantments],
      armors: [...armorEnchantments],
    };

    const systemData = this.getResolvedSystemData(systemId);
    if (systemData) {
      supplementIds.forEach((id) => {
        const enchantments = systemData.supplements[id]?.enchantments;
        if (!enchantments) return;

        const supplementName = this.supplementNameOf(id);
        const stamp = (ench: ItemE): ItemE => ({
          ...ench,
          supplementId: id,
          supplementName,
        });

        if (enchantments.weapons) {
          result.weapons.push(...enchantments.weapons.map(stamp));
        }
        if (enchantments.armors) {
          result.armors.push(...enchantments.armors.map(stamp));
        }
      });
    }

    this.enchantmentsCache = {
      system: systemId,
      supplements: [...supplementIds],
      data: result,
    };
    return result;
  }

  /**
   * Materiais especiais do livro básico somados aos dos suplementos ativos,
   * incluindo suplementos registrados em runtime. Resultado cacheado e
   * compartilhado — não mutar.
   */
  getSpecialMaterialsBySupplements(
    supplementIds: SupplementId[],
    systemId: SystemId = SystemId.TORMENTA20
  ): SpecialMaterial[] {
    if (
      this.isCacheValid(this.specialMaterialsCache, supplementIds, systemId)
    ) {
      return this.specialMaterialsCache!.data;
    }

    const result: SpecialMaterial[] = [...coreSpecialMaterials];

    const systemData = this.getResolvedSystemData(systemId);
    if (systemData) {
      supplementIds.forEach((id) => {
        const materials = systemData.supplements[id]?.specialMaterials;
        if (!materials) return;

        const supplementName = this.supplementNameOf(id);
        result.push(
          ...materials.map((material) => ({
            ...material,
            supplementId: id,
            supplementName,
          }))
        );
      });
    }

    this.specialMaterialsCache = {
      system: systemId,
      supplements: [...supplementIds],
      data: result,
    };
    return result;
  }

  /**
   * Busca um encanto por NOME em core + TODOS os suplementos (oficiais e
   * runtime), independente de estarem ativos.
   *
   * Mesma razão de `getSpecialMaterialByName`: o item guarda só o nome do
   * encanto aplicado, e precisa continuar exibindo o efeito mesmo com o
   * suplemento de origem desativado.
   */
  getEnchantmentByName(name: string): ItemE | undefined {
    const systemData = this.getResolvedSystemData(this.currentSystem);
    const fromSupplements = systemData
      ? Object.values(systemData.supplements).flatMap((supplement) => [
          ...(supplement?.enchantments?.weapons ?? []),
          ...(supplement?.enchantments?.armors ?? []),
        ])
      : [];

    return [
      ...weaponsEnchantments,
      ...armorEnchantments,
      ...fromSupplements,
    ].find((ench) => ench.enchantment === name);
  }

  /**
   * Busca um material especial por NOME em core + TODOS os suplementos
   * (oficiais e runtime), independente de estarem ativos.
   *
   * A ficha guarda apenas o nome do material aplicado, então um item pode
   * carregar um material de suplemento desativado e ainda precisar exibir o
   * efeito. Por isso este lookup ignora a lista de ativos — ao contrário de
   * `getSpecialMaterialsBySupplements`, que alimenta os seletores.
   */
  getSpecialMaterialByName(name: string): SpecialMaterial | undefined {
    const systemData = this.getResolvedSystemData(this.currentSystem);
    const fromSupplements = systemData
      ? Object.values(systemData.supplements).flatMap(
          (supplement) => supplement?.specialMaterials ?? []
        )
      : [];

    return [...coreSpecialMaterials, ...fromSupplements].find(
      (material) => material.name === name
    );
  }

  /**
   * Retorna magias de 1º círculo combinadas de todos os suplementos ativos
   * Organiza por tipo (arcano/divino) e escola
   */
  getSpellsCircle1BySupplements(
    supplementIds: SupplementId[],
    systemId: SystemId = this.currentSystem
  ): { arcane: SpellCircle; divine: SpellCircle } {
    return this.getSpellsByCircleAndSupplements(1, supplementIds, systemId);
  }

  /**
   * Retorna magias de um círculo específico combinadas de todos os suplementos ativos
   * @param circle - O círculo de magia (1-5)
   * @param supplementIds - IDs dos suplementos ativos
   * @param systemId - ID do sistema
   */
  getSpellsByCircleAndSupplements(
    circle: number,
    supplementIds: SupplementId[],
    systemId: SystemId = this.currentSystem
  ): { arcane: SpellCircle; divine: SpellCircle } {
    const supplements = this.ensureCore(supplementIds, systemId);
    const systemData = this.getResolvedSystemData(systemId);

    // Começa com as magias do core baseado no círculo
    const coreArcane = this.getCoreArcaneSpellsByCircle(circle);
    const coreDivine = this.getCoreDivineSpellsByCircle(circle);

    const result = {
      arcane: { ...coreArcane },
      divine: { ...coreDivine },
    };

    if (!systemData) return result;

    // Adiciona magias de suplementos
    supplements.forEach((id) => {
      if (id === SupplementId.TORMENTA20_CORE) return; // Core já foi adicionado

      const supplementSpells = systemData.supplements[id]?.spells;
      if (!supplementSpells) return;

      // Mapeia círculo para enum
      const circleEnum = this.getCircleEnum(circle);

      // Adiciona magias arcanas do suplemento
      if (supplementSpells.arcane) {
        supplementSpells.arcane
          .filter((spell) => spell.spellCircle === circleEnum)
          .forEach((spell) => {
            if (spell.school in result.arcane) {
              result.arcane[spell.school].push(spell);
            }
          });
      }

      // Adiciona magias divinas do suplemento
      if (supplementSpells.divine) {
        supplementSpells.divine
          .filter((spell) => spell.spellCircle === circleEnum)
          .forEach((spell) => {
            if (spell.school in result.divine) {
              result.divine[spell.school].push(spell);
            }
          });
      }

      // Magias universais vão para ambos os tipos
      if (supplementSpells.universal) {
        supplementSpells.universal
          .filter((spell) => spell.spellCircle === circleEnum)
          .forEach((spell) => {
            if (spell.school in result.arcane) {
              result.arcane[spell.school].push(spell);
            }
            if (spell.school in result.divine) {
              result.divine[spell.school].push(spell);
            }
          });
      }
    });

    return result;
  }

  /**
   * Retorna todas as magias arcanas de um círculo específico combinadas de suplementos
   */
  getArcaneSpellsByCircleAndSupplements(
    circle: number,
    supplementIds: SupplementId[],
    systemId: SystemId = this.currentSystem
  ): Spell[] {
    const spells = this.getSpellsByCircleAndSupplements(
      circle,
      supplementIds,
      systemId
    );
    return Object.values(spells.arcane).flat();
  }

  /**
   * Retorna todas as magias divinas de um círculo específico combinadas de suplementos
   */
  getDivineSpellsByCircleAndSupplements(
    circle: number,
    supplementIds: SupplementId[],
    systemId: SystemId = this.currentSystem
  ): Spell[] {
    const spells = this.getSpellsByCircleAndSupplements(
      circle,
      supplementIds,
      systemId
    );
    return Object.values(spells.divine).flat();
  }

  /**
   * Retorna divindades com poderes concedidos de suplementos mesclados
   * Encontra poderes concedidos que têm requisito DEVOTO para uma divindade específica
   * e os adiciona ao array de poderes da divindade
   */
  getDeitiesWithSupplementPowers(
    supplementIds: SupplementId[],
    systemId: SystemId = this.currentSystem
  ): Divindade[] {
    const supplements = this.ensureCore(supplementIds, systemId);
    const systemData = this.getResolvedSystemData(systemId);

    // Clona as divindades base
    const deitiesWithPowers: Divindade[] = DIVINDADES.map((deity) => ({
      ...deity,
      poderes: [...deity.poderes],
    }));

    if (!systemData) return deitiesWithPowers;

    // Para cada suplemento, encontra poderes concedidos e os vincula às divindades
    supplements.forEach((id) => {
      if (id === SupplementId.TORMENTA20_CORE) return; // Core já está nas divindades base

      const supplementPowers = systemData.supplements[id]?.powers?.CONCEDIDOS;
      if (!supplementPowers || supplementPowers.length === 0) return;

      // Para cada poder concedido do suplemento
      supplementPowers.forEach((power) => {
        // Verifica se o poder tem requisitos de DEVOTO
        if (!power.requirements || power.requirements.length === 0) return;

        // Encontra todas as divindades que satisfazem os requisitos
        power.requirements.forEach((reqGroup) => {
          reqGroup.forEach((req) => {
            if (req.type === RequirementType.DEVOTO && req.name) {
              const deityName = req.name;
              // Encontra a divindade correspondente. O match exato tem
              // precedência sobre o parcial em TODA a lista: nomes curtos são
              // substring de nomes maiores (ex.: 'Ur' em 'O Deus Cristal de
              // Urielka') e o parcial anexaria o poder ao deus errado.
              const deity =
                deitiesWithPowers.find((d) => d.name === deityName) ??
                deitiesWithPowers.find((d) => d.name.includes(deityName));
              if (deity) {
                // Verifica se o poder já não está na lista
                const alreadyHas = deity.poderes.some(
                  (p) => p.name === power.name
                );
                if (!alreadyHas) {
                  deity.poderes.push(power);
                }
              }
            }
          });
        });
      });
    });

    // Divindades NOVAS de suplementos (ex.: homebrew) — adicionadas à lista.
    supplements.forEach((id) => {
      const supplementDeities = systemData.supplements[id]?.divindades;
      if (!supplementDeities) return;
      supplementDeities.forEach((deity) => {
        if (!deitiesWithPowers.some((d) => d.name === deity.name)) {
          deitiesWithPowers.push({ ...deity, poderes: [...deity.poderes] });
        }
      });
    });

    return deitiesWithPowers;
  }

  /**
   * Divindades vindas de suplementos (não-core), ex.: homebrews ativados.
   * Útil para os formulários listarem opções de devoção além do enum estático.
   */
  getSupplementDeities(
    supplementIds: SupplementId[],
    systemId: SystemId = this.currentSystem
  ): Divindade[] {
    const supplements = this.ensureCore(supplementIds, systemId);
    const systemData = this.getResolvedSystemData(systemId);
    if (!systemData) return [];
    const result: Divindade[] = [];
    supplements.forEach((id) => {
      if (id === SupplementId.TORMENTA20_CORE) return;
      const supplementDeities = systemData.supplements[id]?.divindades;
      if (supplementDeities) result.push(...supplementDeities);
    });
    return result;
  }

  /**
   * Busca uma divindade por nome com poderes de suplementos mesclados
   */
  getDeityByName(
    name: string,
    supplementIds: SupplementId[],
    systemId: SystemId = this.currentSystem
  ): Divindade | undefined {
    const deities = this.getDeitiesWithSupplementPowers(
      supplementIds,
      systemId
    );
    return deities.find((d) => d.name === name);
  }

  /**
   * Sincretismos (pares de deuses maiores para a Devoção Dupla) trazidos pelos
   * suplementos ativos. O core não tem nenhum: a regra só existe quando um
   * suplemento a traz, e é essa lista vazia/não-vazia que serve de gate na UI.
   */
  getSincretismosBySupplements(
    supplementIds: SupplementId[],
    systemId: SystemId = this.currentSystem
  ): Sincretismo[] {
    const supplements = this.ensureCore(supplementIds, systemId);

    if (this.isCacheValid(this.sincretismosCache, supplements, systemId)) {
      return this.sincretismosCache!.data;
    }

    const systemData = this.getResolvedSystemData(systemId);
    const result: Sincretismo[] = [];
    if (systemData) {
      supplements.forEach((id) => {
        const list = systemData.supplements[id]?.sincretismos;
        if (!list) return;
        list.forEach((sincretismo) => {
          if (!result.some((s) => s.name === sincretismo.name)) {
            result.push(sincretismo);
          }
        });
      });
    }

    this.sincretismosCache = { system: systemId, supplements, data: result };
    return result;
  }

  getSincretismoByName(
    name: string,
    supplementIds: SupplementId[],
    systemId: SystemId = this.currentSystem
  ): Sincretismo | undefined {
    return this.getSincretismosBySupplements(supplementIds, systemId).find(
      (s) => s.name === name
    );
  }

  /**
   * Sincretismo que corresponde a um par de deuses. O par é NÃO-ORDENADO: a
   * UI deixa o jogador escolher as duas divindades em qualquer ordem, e o
   * mesmo sincretismo tem que ser encontrado nos dois sentidos.
   */
  getSincretismoForDeities(
    deityA: string,
    deityB: string,
    supplementIds: SupplementId[],
    systemId: SystemId = this.currentSystem
  ): Sincretismo | undefined {
    return this.getSincretismosBySupplements(supplementIds, systemId).find(
      (sincretismo) =>
        (sincretismo.deities[0] === deityA &&
          sincretismo.deities[1] === deityB) ||
        (sincretismo.deities[0] === deityB && sincretismo.deities[1] === deityA)
    );
  }

  /**
   * Helper: Retorna magias arcanas do core por círculo
   * Usa cloneDeep para evitar mutação dos arrays originais
   */
  // eslint-disable-next-line class-methods-use-this
  private getCoreArcaneSpellsByCircle(circle: number): SpellCircle {
    switch (circle) {
      case 1:
        return _.cloneDeep(arcaneSpellsCircle1);
      case 2:
        return _.cloneDeep(arcaneSpellsCircle2);
      case 3:
        return _.cloneDeep(arcaneSpellsCircle3);
      case 4:
        return _.cloneDeep(arcaneSpellsCircle4);
      case 5:
        return _.cloneDeep(arcaneSpellsCircle5);
      default:
        return {
          Abjur: [],
          Adiv: [],
          Conv: [],
          Encan: [],
          Evoc: [],
          Ilusão: [],
          Necro: [],
          Trans: [],
        };
    }
  }

  /**
   * Helper: Retorna magias divinas do core por círculo
   * Usa cloneDeep para evitar mutação dos arrays originais
   */
  // eslint-disable-next-line class-methods-use-this
  private getCoreDivineSpellsByCircle(circle: number): SpellCircle {
    switch (circle) {
      case 1:
        return _.cloneDeep(divineSpellsCircle1);
      case 2:
        return _.cloneDeep(divineSpellsCircle2);
      case 3:
        return _.cloneDeep(divineSpellsCircle3);
      case 4:
        return _.cloneDeep(divineSpellsCircle4);
      case 5:
        return _.cloneDeep(divineSpellsCircle5);
      default:
        return {
          Abjur: [],
          Adiv: [],
          Conv: [],
          Encan: [],
          Evoc: [],
          Ilusão: [],
          Necro: [],
          Trans: [],
        };
    }
  }

  /**
   * Helper: Converte número do círculo para enum
   */
  // eslint-disable-next-line class-methods-use-this
  private getCircleEnum(circle: number): spellsCircles {
    switch (circle) {
      case 1:
        return spellsCircles.c1;
      case 2:
        return spellsCircles.c2;
      case 3:
        return spellsCircles.c3;
      case 4:
        return spellsCircles.c4;
      case 5:
        return spellsCircles.c5;
      default:
        return spellsCircles.c1;
    }
  }

  /**
   * Limpa o cache (útil quando suplementos mudam)
   */
  clearCache(): void {
    this.racesCache = null;
    this.classesCache = null;
    this.powersCache = null;
    this.equipmentCache = null;
    this.improvementsCache = null;
    this.enchantmentsCache = null;
    this.specialMaterialsCache = null;
    this.sincretismosCache = null;
  }

  /**
   * Garante que CORE está sempre nos suplementos ativos (para cada sistema)
   */
  // eslint-disable-next-line class-methods-use-this
  private ensureCore(
    supplementIds: SupplementId[],
    systemId: SystemId
  ): SupplementId[] {
    const supplements = [...supplementIds];

    // Define o ID do core baseado no sistema
    const coreId =
      systemId === SystemId.TORMENTA20
        ? SupplementId.TORMENTA20_CORE
        : SupplementId.TORMENTA20_CORE; // Default to Tormenta20

    // Garante que o core está incluído
    if (!supplements.includes(coreId)) {
      supplements.unshift(coreId);
    }

    return supplements;
  }

  /**
   * Verifica se o cache é válido para a combinação de suplementos e sistema
   */
  // eslint-disable-next-line class-methods-use-this
  private isCacheValid<T>(
    cache: CacheEntry<T> | null,
    supplements: SupplementId[],
    system: SystemId
  ): boolean {
    if (!cache) return false;

    return (
      cache.system === system &&
      cache.supplements.length === supplements.length &&
      cache.supplements.every((id) => supplements.includes(id))
    );
  }
}

// Exporta instância singleton
export const dataRegistry = new DataRegistry();

// Exporta classe para testes
export default DataRegistry;
