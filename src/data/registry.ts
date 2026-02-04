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
import { DIVINDADES } from './systems/tormenta20/divindades';

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
   * Nota: Não força CORE para permitir filtragem na enciclopédia
   */
  getRacesWithSupplementInfo(
    supplementIds: SupplementId[],
    systemId: SystemId = this.currentSystem
  ): RaceWithSupplement[] {
    const systemData = SYSTEMS_MAP[systemId];
    if (!systemData) return [];

    // Combina raças com informação de origem
    const racesWithInfo: RaceWithSupplement[] = [];

    supplementIds.forEach((supplementId) => {
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

    const systemData = SYSTEMS_MAP[systemId];
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
        const supplementName = SUPPLEMENT_METADATA[id]?.name || id;
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

    this.classesCache = { system: systemId, supplements, data: mergedClasses };
    return mergedClasses;
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
    const systemData = SYSTEMS_MAP[systemId];
    if (!systemData) return [];

    // Coleta todos os poderes de classe adicionais dos suplementos (com informação de origem)
    const additionalClassPowers: Partial<Record<ClassNames, ClassPower[]>> = {};
    supplementIds.forEach((id) => {
      // Pula o suplemento core para não marcar poderes do livro básico
      if (id === SupplementId.TORMENTA20_CORE) return;

      const supplementClassPowers = systemData.supplements[id]?.classPowers;
      if (supplementClassPowers) {
        const supName = SUPPLEMENT_METADATA[id]?.name || id;
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
      const supplementName =
        SUPPLEMENT_METADATA[supplementId]?.name || supplementId;

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
    const systemData = SYSTEMS_MAP[systemId];

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
    const systemData = SYSTEMS_MAP[systemId];
    if (!systemData) return [];

    const origins: OriginWithSupplement[] = [];

    supplementIds.forEach((supplementId) => {
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
    const systemData = SYSTEMS_MAP[systemId];

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
        const supplementName = SUPPLEMENT_METADATA[id]?.name || id;
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
   */
  // eslint-disable-next-line class-methods-use-this
  getEquipmentBySupplements(
    supplementIds: SupplementId[],
    systemId: SystemId = SystemId.TORMENTA20
  ): MarketEquipment {
    const result: MarketEquipment = {
      weapons: [],
      armors: [],
      shields: [],
      generalItems: [],
      clothing: [],
      alchemy: [],
      food: [],
    };

    const systemData = SYSTEMS_MAP[systemId];
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

    // Add equipment from supplements
    supplementIds.forEach((id) => {
      const supplementEquipment = systemData.supplements[id]?.equipment;
      if (supplementEquipment) {
        const supplementMeta = SUPPLEMENT_METADATA[id];
        const supplementName = supplementMeta?.name || id;

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
      }
    });

    return result;
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
    const systemData = SYSTEMS_MAP[systemId];

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
    const systemData = SYSTEMS_MAP[systemId];

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
              // Encontra a divindade correspondente
              const deity = deitiesWithPowers.find(
                (d) => d.name === deityName || d.name.includes(deityName)
              );
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

    return deitiesWithPowers;
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
