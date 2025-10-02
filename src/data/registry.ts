/**
 * Data Registry - Sistema Central de Gerenciamento de Suplementos
 *
 * Este registry é responsável por combinar dados de múltiplos suplementos
 * de acordo com as preferências do usuário.
 */
import _ from 'lodash';
import { SupplementId } from '../types/supplement.types';
import { SupplementData } from './supplements/core';
import CORE_SUPPLEMENT from './supplements/core';
import AMEACAS_ARTON_SUPPLEMENT from './supplements/ameacas-de-arton';
import Race from '../interfaces/Race';
import { ClassDescription } from '../interfaces/Class';
import { GeneralPower, GeneralPowers } from '../interfaces/Poderes';

/**
 * Mapa de todos os suplementos disponíveis
 */
const SUPPLEMENTS_MAP: Record<SupplementId, SupplementData> = {
  [SupplementId.CORE]: CORE_SUPPLEMENT,
  [SupplementId.AMEACAS_ARTON]: AMEACAS_ARTON_SUPPLEMENT,
};

/**
 * Cache para evitar recalcular combinações
 */
interface CacheEntry<T> {
  supplements: SupplementId[];
  data: T;
}

class DataRegistry {
  private racesCache: CacheEntry<Race[]> | null = null;
  private classesCache: CacheEntry<ClassDescription[]> | null = null;
  private powersCache: CacheEntry<GeneralPowers> | null = null;

  /**
   * Retorna raças de todos os suplementos ativos
   */
  getRacesBySupplements(supplementIds: SupplementId[]): Race[] {
    // Garante que CORE está sempre incluído
    const supplements = this.ensureCore(supplementIds);

    // Verifica cache
    if (this.isCacheValid(this.racesCache, supplements)) {
      return this.racesCache!.data;
    }

    // Combina raças de todos os suplementos
    const races = supplements.flatMap((id) => SUPPLEMENTS_MAP[id]?.races || []);

    // Atualiza cache
    this.racesCache = { supplements, data: races };
    return races;
  }

  /**
   * Retorna classes de todos os suplementos ativos
   */
  getClassesBySupplements(supplementIds: SupplementId[]): ClassDescription[] {
    const supplements = this.ensureCore(supplementIds);

    if (this.isCacheValid(this.classesCache, supplements)) {
      return this.classesCache!.data;
    }

    const classes = supplements.flatMap(
      (id) => SUPPLEMENTS_MAP[id]?.classes || []
    );

    this.classesCache = { supplements, data: classes };
    return classes;
  }

  /**
   * Retorna poderes combinados de todos os suplementos ativos
   */
  getPowersBySupplements(supplementIds: SupplementId[]): GeneralPowers {
    const supplements = this.ensureCore(supplementIds);

    if (this.isCacheValid(this.powersCache, supplements)) {
      return this.powersCache!.data;
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
      const supplementPowers = SUPPLEMENTS_MAP[id]?.powers;
      if (supplementPowers) {
        combinedPowers.COMBATE.push(...supplementPowers.COMBATE);
        combinedPowers.CONCEDIDOS.push(...supplementPowers.CONCEDIDOS);
        combinedPowers.DESTINO.push(...supplementPowers.DESTINO);
        combinedPowers.MAGIA.push(...supplementPowers.MAGIA);
        combinedPowers.TORMENTA.push(...supplementPowers.TORMENTA);
      }
    });

    this.powersCache = { supplements, data: combinedPowers };
    return combinedPowers;
  }

  /**
   * Retorna todos os poderes como array flat
   */
  getAllPowersBySupplements(supplementIds: SupplementId[]): GeneralPower[] {
    const powers = this.getPowersBySupplements(supplementIds);
    return Object.values(powers).flat();
  }

  /**
   * Busca uma raça por nome em todos os suplementos ativos
   */
  getRaceByName(name: string, supplementIds: SupplementId[]): Race | undefined {
    const races = this.getRacesBySupplements(supplementIds);
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
    supplementIds: SupplementId[]
  ): ClassDescription | undefined {
    const classes = this.getClassesBySupplements(supplementIds);
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
   * Garante que CORE está sempre nos suplementos ativos
   */
  private ensureCore(supplementIds: SupplementId[]): SupplementId[] {
    const supplements = [...supplementIds];
    if (!supplements.includes(SupplementId.CORE)) {
      supplements.unshift(SupplementId.CORE);
    }
    return supplements;
  }

  /**
   * Verifica se o cache é válido para a combinação de suplementos
   */
  private isCacheValid<T>(
    cache: CacheEntry<T> | null,
    supplements: SupplementId[]
  ): boolean {
    if (!cache) return false;

    return (
      cache.supplements.length === supplements.length &&
      cache.supplements.every((id) => supplements.includes(id))
    );
  }
}

// Exporta instância singleton
export const dataRegistry = new DataRegistry();

// Exporta classe para testes
export default DataRegistry;
