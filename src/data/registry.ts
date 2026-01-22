/**
 * Data Registry - Sistema Central de Gerenciamento Multi-Sistema
 *
 * Este registry é responsável por combinar dados de múltiplos suplementos
 * de diferentes sistemas de RPG de acordo com as preferências do usuário.
 */
import _ from 'lodash';
import { SystemId } from '../types/system.types';
import { SupplementId, SUPPLEMENT_METADATA } from '../types/supplement.types';
import { TORMENTA20_SYSTEM, SystemData } from './systems/tormenta20';
import Race from '../interfaces/Race';
import { ClassDescription } from '../interfaces/Class';
import { GeneralPower, GeneralPowers } from '../interfaces/Poderes';
import Origin from '../interfaces/Origin';

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

  private currentSystem: SystemId = SystemId.TORMENTA20;

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

    const systemData = SYSTEMS_MAP[systemId];
    if (!systemData) return [];

    // Combina raças de todos os suplementos
    const races = supplements.flatMap(
      (id) => systemData.supplements[id]?.races || []
    );

    // Atualiza cache
    this.racesCache = { system: systemId, supplements, data: races };
    return races;
  }

  /**
   * Retorna raças com informação do suplemento de origem
   */
  getRacesWithSupplementInfo(
    supplementIds: SupplementId[],
    systemId: SystemId = this.currentSystem
  ): RaceWithSupplement[] {
    const supplements = this.ensureCore(supplementIds, systemId);
    const systemData = SYSTEMS_MAP[systemId];
    if (!systemData) return [];

    // Combina raças com informação de origem
    const racesWithInfo: RaceWithSupplement[] = [];

    supplements.forEach((supplementId) => {
      const races = systemData.supplements[supplementId]?.races || [];
      const supplementName =
        SUPPLEMENT_METADATA[supplementId]?.name || supplementId;

      races.forEach((race) => {
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
   */
  getClassesBySupplements(
    supplementIds: SupplementId[],
    systemId: SystemId = this.currentSystem
  ): ClassDescription[] {
    const supplements = this.ensureCore(supplementIds, systemId);

    if (this.isCacheValid(this.classesCache, supplements, systemId)) {
      return this.classesCache!.data;
    }

    const systemData = SYSTEMS_MAP[systemId];
    if (!systemData) return [];

    const classes = supplements.flatMap(
      (id) => systemData.supplements[id]?.classes || []
    );

    this.classesCache = { system: systemId, supplements, data: classes };
    return classes;
  }

  /**
   * Retorna classes com informação do suplemento de origem
   */
  getClassesWithSupplementInfo(
    supplementIds: SupplementId[],
    systemId: SystemId = this.currentSystem
  ): ClassWithSupplement[] {
    const supplements = this.ensureCore(supplementIds, systemId);
    const systemData = SYSTEMS_MAP[systemId];
    if (!systemData) return [];

    // Combina classes com informação de origem
    const classesWithInfo: ClassWithSupplement[] = [];

    supplements.forEach((supplementId) => {
      const classes = systemData.supplements[supplementId]?.classes || [];
      const supplementName =
        SUPPLEMENT_METADATA[supplementId]?.name || supplementId;

      classes.forEach((classDesc) => {
        classesWithInfo.push({
          ...classDesc,
          supplementId,
          supplementName,
        });
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

    const systemData = SYSTEMS_MAP[systemId];
    if (!systemData) {
      return {
        COMBATE: [],
        CONCEDIDOS: [],
        DESTINO: [],
        MAGIA: [],
        TORMENTA: [],
      };
    }

    // Combina poderes por categoria
    const combinedPowers: GeneralPowers = {
      COMBATE: [],
      CONCEDIDOS: [],
      DESTINO: [],
      MAGIA: [],
      TORMENTA: [],
    };

    supplements.forEach((id) => {
      const supplementPowers = systemData.supplements[id]?.powers;
      if (supplementPowers) {
        combinedPowers.COMBATE.push(...supplementPowers.COMBATE);
        combinedPowers.CONCEDIDOS.push(...supplementPowers.CONCEDIDOS);
        combinedPowers.DESTINO.push(...supplementPowers.DESTINO);
        combinedPowers.MAGIA.push(...supplementPowers.MAGIA);
        combinedPowers.TORMENTA.push(...supplementPowers.TORMENTA);
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
   */
  getPowersWithSupplementInfo(
    supplementIds: SupplementId[],
    systemId: SystemId = this.currentSystem
  ): GeneralPowersWithSupplement {
    const supplements = this.ensureCore(supplementIds, systemId);
    const systemData = SYSTEMS_MAP[systemId];

    const result: GeneralPowersWithSupplement = {
      COMBATE: [],
      CONCEDIDOS: [],
      DESTINO: [],
      MAGIA: [],
      TORMENTA: [],
    };

    if (!systemData) return result;

    supplements.forEach((supplementId) => {
      const supplementPowers = systemData.supplements[supplementId]?.powers;
      const supplementName =
        SUPPLEMENT_METADATA[supplementId]?.name || supplementId;

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
      }
    });

    return result;
  }

  /**
   * Retorna origens de todos os suplementos ativos
   */
  getOriginsBySupplements(
    supplementIds: SupplementId[],
    systemId: SystemId = this.currentSystem
  ): OriginWithSupplement[] {
    const supplements = this.ensureCore(supplementIds, systemId);
    const systemData = SYSTEMS_MAP[systemId];
    if (!systemData) return [];

    const origins: OriginWithSupplement[] = [];

    supplements.forEach((supplementId) => {
      const supplementOrigins =
        systemData.supplements[supplementId]?.origins || [];
      const supplementMeta = SUPPLEMENT_METADATA[supplementId];

      supplementOrigins.forEach((origin) => {
        origins.push({
          ...origin,
          supplementId,
          supplementName: supplementMeta?.name || '',
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
   */
  getClassByName(
    name: string,
    supplementIds: SupplementId[],
    systemId: SystemId = this.currentSystem
  ): ClassDescription | undefined {
    const classes = this.getClassesBySupplements(supplementIds, systemId);
    return classes.find((c) => c.name === name);
  }

  /**
   * Limpa o cache (útil quando suplementos mudam)
   */
  clearCache(): void {
    this.racesCache = null;
    this.classesCache = null;
    this.powersCache = null;
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
