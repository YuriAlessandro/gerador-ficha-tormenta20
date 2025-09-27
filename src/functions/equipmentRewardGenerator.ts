import { LEVELS, ItemReward, ITEM_TYPE } from '../interfaces/Rewards';
import { rewardGenerator } from './rewards/rewardsGenerator';
import {
  miscellaneousItems,
  weapons,
  armors,
  potions,
  minorAccessories,
  mediumAccessories,
  majorAccessories,
  weaponsModifications,
  armorsModifications,
} from '../data/rewards/items';
import Equipment, {
  DefenseEquipment,
  BagEquipments,
} from '../interfaces/Equipment';

import { rollDice } from './randomUtils';
import Bag from '../interfaces/Bag';

/**
 * Mapeia o nível do personagem para o ND (Nível de Desafio) apropriado para geração de recompensas
 *
 * Lógica:
 * - Nível 1: Sem recompensas (apenas equipamentos iniciais)
 * - Nível 2: ND 1/4 (S4)
 * - Nível 3: ND 1/3 (S3)
 * - Nível 4: ND 1/2 (S2)
 * - Nível 5+: ND = nível - 4 (F1, F2, F3, etc.)
 *
 * @param characterLevel - Nível do personagem (1-20)
 * @returns LEVELS enum ou null se não deve gerar recompensas
 */
export function getLevelToNDMapping(characterLevel: number): LEVELS | null {
  if (characterLevel <= 1) {
    return null; // Nível 1 não recebe recompensas
  }

  const mapping: Record<number, LEVELS> = {
    2: LEVELS.S4, // ND 1/4
    3: LEVELS.S3, // ND 1/3
    4: LEVELS.S2, // ND 1/2
    5: LEVELS.F1, // ND 1
    6: LEVELS.F2, // ND 2
    7: LEVELS.F3, // ND 3
    8: LEVELS.F4, // ND 4
    9: LEVELS.F5, // ND 5
    10: LEVELS.F6, // ND 6
    11: LEVELS.F7, // ND 7
    12: LEVELS.F8, // ND 8
    13: LEVELS.F9, // ND 9
    14: LEVELS.F10, // ND 10
    15: LEVELS.F11, // ND 11
    16: LEVELS.F12, // ND 12
    17: LEVELS.F13, // ND 13
    18: LEVELS.F14, // ND 14
    19: LEVELS.F15, // ND 15
    20: LEVELS.F16, // ND 16
  };

  return mapping[characterLevel] || null;
}

export interface GeneratedEquipmentResult {
  equipments: Partial<BagEquipments>;
  totalCost: number;
  generationDetails: string;
  itemsForSteps: { name?: string; value: string }[];
}

/**
 * Gera um item diverso baseado na tabela miscellaneousItems
 */
function generateMiscellaneousEquipment(diceRoll: number): Equipment | null {
  const rolledItem = miscellaneousItems.find(
    (i) => diceRoll >= i.min && diceRoll <= i.max
  );

  if (rolledItem) {
    let quantity = 1;
    let itemName = rolledItem.item;

    // Se tem efeito de quantidade, aplicar
    if (rolledItem.effect) {
      quantity = rollDice(rolledItem.effect.qtd, rolledItem.effect.dice);
      itemName = `${quantity} ${rolledItem.item}`;
    }

    // Preço base para itens diversos (pode ser refinado depois)
    const basePrice = getBasePriceForMiscellaneous(rolledItem.item);

    return {
      nome: itemName,
      group: 'Item Geral',
      preco: basePrice * quantity,
      spaces: 1,
    };
  }

  return null;
}

/**
 * Calcula preço base para itens diversos baseado no tipo
 */
function getBasePriceForMiscellaneous(itemName: string): number {
  // Mapeamento básico de preços para itens diversos
  const priceMap: Record<string, number> = {
    Ácido: 10,
    'Água benta': 25,
    'Alaúde élfico': 100,
    Algemas: 15,
    'Baga-de-fogo': 5,
    'Bálsamo restaurador': 20,
    Bandana: 1,
    'Bandoleira de poções': 15,
    Bomba: 30,
    'Botas reforçadas': 10,
    'Camisa bufante': 5,
    'Capa esvoaçante': 8,
    'Capa pesada': 12,
    'Casaco longo': 10,
    'Chapéu arcano': 25,
    'Coleção de livros': 50,
    Cosmético: 5,
    'Dente-de-dragão': 100,
    'Enfeite de elmo': 20,
    'Elixir do amor': 150,
    'Equipamento de viagem': 25,
    'Essência de mana': 50,
    'Estojo de disfarces': 30,
    'Farrapos de ermitão': 1,
    'Flauta mística': 75,
    'Fogo alquímico': 20,
    'Gorro de ervas': 5,
    'Líquen lilás': 25,
    Luneta: 100,
    'Luva de pelica': 10,
    'Maleta de medicamentos': 40,
    Manopla: 8,
    'Manto eclesiástico': 15,
    'Mochila de aventureiro': 25,
    'Musgo púrpura': 30,
    'Organizador de pergaminhos': 20,
    'Ossos de monstro': 15,
    'Pó de cristal': 40,
    'Pó de giz': 2,
    'Pó do desaparecimento': 300,
    'Robe de mago': 25,
    'Saco de sal': 5,
    'Sapatos de camurça': 12,
    'Seixo de âmbar': 20,
    Sela: 30,
    Tabardo: 15,
    'Terra de cemitério': 10,
    'Veste de seda': 50,
    'Veste da corte': 100,
  };

  return priceMap[itemName] || 10; // Preço padrão
}

/**
 * Gera uma arma ou armadura baseado nas tabelas com modificações
 */
function generateWeaponOrArmor(
  diceRoll: number,
  mods: number
): Equipment | DefenseEquipment | null {
  const typeRoll = rollDice(1, 6);

  if (typeRoll >= 1 && typeRoll <= 4) {
    // É uma arma
    const rolledItem = weapons.find(
      (i) => diceRoll >= i.min && diceRoll <= i.max
    );

    if (rolledItem) {
      let finalWeapon = { ...rolledItem.item };
      let priceMultiplier = 1;
      let modsList: string[] = [];

      // Aplicar modificações se necessário
      if (mods > 0) {
        const modsResult = applyWeaponModifications(finalWeapon, mods);
        finalWeapon = modsResult.modifiedWeapon;
        modsList = modsResult.modsList;
        priceMultiplier = modsResult.priceMultiplier;

        // Atualizar nome com modificações
        if (modsList.length > 0) {
          finalWeapon.nome = `${finalWeapon.nome} (${modsList.join(', ')})`;
        }
      }

      return {
        ...finalWeapon,
        preco: Math.round((finalWeapon.preco || 0) * priceMultiplier),
      };
    }
  } else if (typeRoll >= 5 && typeRoll <= 6) {
    // É uma armadura ou escudo
    const rolledItem = armors.find(
      (i) => diceRoll >= i.min && diceRoll <= i.max
    );

    if (rolledItem) {
      let finalArmor = { ...rolledItem.item } as DefenseEquipment;
      let priceMultiplier = 1;
      let modsList: string[] = [];

      // Aplicar modificações se necessário
      if (mods > 0) {
        const modsResult = applyArmorModifications(finalArmor, mods);
        finalArmor = modsResult.modifiedArmor;
        modsList = modsResult.modsList;
        priceMultiplier = modsResult.priceMultiplier;

        // Atualizar nome com modificações
        if (modsList.length > 0) {
          finalArmor.nome = `${finalArmor.nome} (${modsList.join(', ')})`;
        }
      }

      return {
        ...finalArmor,
        preco: Math.round((finalArmor.preco || 0) * priceMultiplier),
      };
    }
  }

  return null;
}

/**
 * Aplica modificações de armas e calcula multiplicador de preço
 */
function applyWeaponModifications(
  weapon: Equipment,
  mods: number
): {
  modifiedWeapon: Equipment;
  modsList: string[];
  priceMultiplier: number;
} {
  const modifiedWeapon = { ...weapon };
  let priceMultiplier = 1;
  const appliedMods: string[] = [];
  const takenMods: string[] = [];

  // Aplicar número específico de modificações
  for (let i = 0; i < mods; i++) {
    // Filtrar modificações disponíveis (que não foram usadas e atendem pré-requisitos)
    const availableMods = weaponsModifications.filter((mod) => {
      if (takenMods.includes(mod.mod)) return false;
      if (mod.prerequisite && !appliedMods.includes(mod.prerequisite))
        return false;
      return true;
    });

    if (availableMods.length === 0) break;

    // Selecionar modificação aleatória
    const rollResult = rollDice(1, 100);
    const selectedMod = availableMods.find(
      (mod) => rollResult >= mod.min && rollResult <= mod.max
    );

    if (selectedMod) {
      appliedMods.push(selectedMod.mod);
      takenMods.push(selectedMod.mod);

      // Aplicar efeitos da modificação
      switch (selectedMod.mod) {
        case 'Cruel':
          // +1 nas rolagens de dano
          modifiedWeapon.dano = increaseDamage(modifiedWeapon.dano || '1d4', 1);
          priceMultiplier += 0.5;
          break;

        case 'Atroz':
          // +2 nas rolagens de dano (requer Cruel)
          modifiedWeapon.dano = increaseDamage(modifiedWeapon.dano || '1d4', 2);
          priceMultiplier += 1.0;
          break;

        case 'Certeira':
          // +1 nos testes de ataque
          modifiedWeapon.atkBonus = (modifiedWeapon.atkBonus || 0) + 1;
          priceMultiplier += 0.4;
          break;

        case 'Pungente':
          // +2 nos testes de ataque (requer Certeira)
          modifiedWeapon.atkBonus = (modifiedWeapon.atkBonus || 0) + 2;
          priceMultiplier += 0.8;
          break;

        case 'Precisa':
          // +1 na margem de ameaça
          modifiedWeapon.critico = improveCriticalThreat(
            modifiedWeapon.critico || 'x2'
          );
          priceMultiplier += 0.6;
          break;

        case 'Maciça':
          // +1 no multiplicador de crítico
          modifiedWeapon.critico = improveCriticalMultiplier(
            modifiedWeapon.critico || 'x2'
          );
          priceMultiplier += 0.7;
          break;

        case 'Discreta':
          // -1 espaço
          modifiedWeapon.spaces = Math.max(0, (modifiedWeapon.spaces || 1) - 1);
          priceMultiplier += 0.3;
          break;

        case 'Material especial':
          // Material especial - aumenta preço significativamente
          priceMultiplier += 2.0;
          break;

        default:
          // Modificações genéricas
          priceMultiplier += 0.3;
          break;
      }

      // Se é modificação dupla, contar como 2
      if (selectedMod.double) {
        i++; // Pula a próxima iteração
      }
    }
  }

  return {
    modifiedWeapon,
    modsList: appliedMods,
    priceMultiplier,
  };
}

/**
 * Aumenta o dano de uma arma
 */
function increaseDamage(currentDamage: string, bonus: number): string {
  // Se já tem um bônus, extrair e somar
  const bonusMatch = currentDamage.match(/([^+]+)\+(\d+)/);
  if (bonusMatch) {
    const baseDamage = bonusMatch[1];
    const existingBonus = parseInt(bonusMatch[2], 10);
    return `${baseDamage}+${existingBonus + bonus}`;
  }

  // Senão, adicionar bônus
  return `${currentDamage}+${bonus}`;
}

/**
 * Melhora a margem de ameaça crítica
 */
function improveCriticalThreat(currentCritical: string): string {
  if (currentCritical === 'x2') return '19/x2';
  if (currentCritical === '19/x2') return '18/x2';
  if (currentCritical === '18/x2') return '17/x2';
  if (currentCritical === 'x3') return '19/x3';
  if (currentCritical === '19/x3') return '18/x3';
  if (currentCritical === 'x4') return '19/x4';

  return currentCritical; // Não pode melhorar mais
}

/**
 * Melhora o multiplicador crítico
 */
function improveCriticalMultiplier(currentCritical: string): string {
  if (currentCritical.includes('x2'))
    return currentCritical.replace('x2', 'x3');
  if (currentCritical.includes('x3'))
    return currentCritical.replace('x3', 'x4');
  if (currentCritical.includes('x4'))
    return currentCritical.replace('x4', 'x5');

  return currentCritical; // Já é x5 ou formato não reconhecido
}

/**
 * Aplica modificações de armaduras e calcula multiplicador de preço
 */
function applyArmorModifications(
  armor: DefenseEquipment,
  mods: number
): {
  modifiedArmor: DefenseEquipment;
  modsList: string[];
  priceMultiplier: number;
} {
  const modifiedArmor = { ...armor };
  let priceMultiplier = 1;
  const appliedMods: string[] = [];
  const takenMods: string[] = [];

  // Aplicar número específico de modificações
  for (let i = 0; i < mods; i++) {
    // Filtrar modificações disponíveis
    const availableMods = armorsModifications.filter((mod) => {
      if (takenMods.includes(mod.mod)) return false;
      if (mod.prerequisite && !appliedMods.includes(mod.prerequisite))
        return false;
      return true;
    });

    if (availableMods.length === 0) break;

    // Selecionar modificação aleatória
    const rollResult = rollDice(1, 100);
    const selectedMod = availableMods.find(
      (mod) => rollResult >= mod.min && rollResult <= mod.max
    );

    if (selectedMod) {
      appliedMods.push(selectedMod.mod);
      takenMods.push(selectedMod.mod);

      // Aplicar efeitos da modificação
      switch (selectedMod.mod) {
        case 'Ajustada':
          // -1 na penalidade de armadura
          modifiedArmor.armorPenalty = Math.max(
            0,
            modifiedArmor.armorPenalty - 1
          );
          priceMultiplier += 0.4;
          break;

        case 'Reforçada':
          // +1 na Defesa
          modifiedArmor.defenseBonus += 1;
          priceMultiplier += 0.6;
          break;

        case 'Leve':
          // -1 espaço
          modifiedArmor.spaces = Math.max(1, (modifiedArmor.spaces || 2) - 1);
          priceMultiplier += 0.3;
          break;

        case 'Material especial':
          // Material especial - aumenta defesa e preço
          modifiedArmor.defenseBonus += 1;
          priceMultiplier += 2.0;
          break;

        default:
          // Modificações genéricas
          priceMultiplier += 0.3;
          break;
      }

      // Se é modificação dupla, contar como 2
      if (selectedMod.double) {
        i++;
      }
    }
  }

  return {
    modifiedArmor,
    modsList: appliedMods,
    priceMultiplier,
  };
}

/**
 * Gera equipamentos de poção baseado na quantidade e dados
 */
function generatePotionEquipment(
  qty: number,
  dice: number,
  som: number,
  applyRollBonus?: boolean
): Equipment[] {
  const qtd = rollDice(qty, dice) + som;
  const results: Equipment[] = [];

  for (let i = 0; i < qtd; i += 1) {
    let potionRoll = rollDice(1, 100);

    if (applyRollBonus) {
      // Recebe +20% na rolagem de riqueza (máximo 100%)
      potionRoll = Math.min(100, potionRoll + 20);
    }

    const rolledPotion = potions.find(
      (p) => potionRoll >= p.min && potionRoll <= p.max
    );

    if (rolledPotion) {
      const basePrice = getPotionPrice(rolledPotion.item);

      results.push({
        nome: rolledPotion.item,
        group: 'Alquimía',
        preco: basePrice,
        spaces: 1,
      });
    }
  }

  return results;
}

/**
 * Calcula preço de poções baseado no tipo
 */
function getPotionPrice(potionName: string): number {
  const potionPrices: Record<string, number> = {
    'Poção de Cura Leve': 50,
    'Poção de Cura Moderada': 200,
    'Poção de Cura Grave': 750,
    'Poção de Cura Completa': 3000,
    'Poção de Atributo': 300,
    'Poção de Resistência': 150,
    'Poção de Velocidade': 400,
    'Poção de Força': 300,
    'Poção de Invisibilidade': 500,
    Antídoto: 100,
    'Óleo Escorregadio': 75,
    'Fogo Alquímico': 20,
  };

  return potionPrices[potionName] || 100; // Preço padrão
}

/**
 * Gera equipamentos mágicos (acessórios)
 */
function generateMagicalEquipment(level: number): Equipment | null {
  const typeRoll = rollDice(1, 6);

  if (typeRoll <= 2) {
    // Arma mágica - por enquanto retorna item genérico
    return {
      nome: 'Arma Mágica',
      group: 'Item Geral',
      preco: 1000 * level,
      spaces: 1,
    };
  }
  if (typeRoll === 3) {
    // Armadura mágica - por enquanto retorna item genérico
    return {
      nome: 'Armadura Mágica',
      group: 'Item Geral',
      preco: 1500 * level,
      spaces: 2,
    };
  }
  // Acessório mágico
  let accessoryTable;
  let basePrice;

  switch (level) {
    case 1: // Menor
      accessoryTable = minorAccessories;
      basePrice = 500;
      break;
    case 3: // Médio
      accessoryTable = mediumAccessories;
      basePrice = 2000;
      break;
    case 4: // Maior
      accessoryTable = majorAccessories;
      basePrice = 8000;
      break;
    default:
      accessoryTable = minorAccessories;
      basePrice = 500;
  }

  const roll = rollDice(1, 100);
  const accessory = accessoryTable.find((a) => roll >= a.min && roll <= a.max);

  if (accessory) {
    return {
      nome: accessory.item,
      group: 'Item Geral',
      preco: basePrice,
      spaces: 1,
    };
  }

  return null;
}

/**
 * Gera equipamentos baseado no nível do personagem usando o sistema de recompensas
 *
 * @param characterLevel - Nível do personagem
 * @param existingBag - Bag existente para verificar armaduras
 * @returns Resultado da geração com equipamentos e informações
 */
export function generateEquipmentRewards(
  characterLevel: number,
  existingBag?: Bag
): GeneratedEquipmentResult {
  const rewardND = getLevelToNDMapping(characterLevel);

  if (!rewardND) {
    return {
      equipments: {},
      totalCost: 0,
      generationDetails: 'Nenhum item gerado (nível 1)',
      itemsForSteps: [],
    };
  }

  try {
    // Calcular quantidade de tentativas: entre 1 e 3 + nível/5
    const minAttempts = 1;
    const maxAttempts = Math.max(2, 3 + Math.floor(characterLevel / 5));
    const numberOfAttempts =
      rollDice(1, maxAttempts - minAttempts + 1) + minAttempts - 1;

    const allGeneratedEquipments: Equipment[] = [];
    const attemptDetails: string[] = [];
    const minimumItems = Math.floor(characterLevel / 2);
    let hasGeneratedArmor = false; // Track if we've already generated armor

    // Check if there's already armor in existing bag
    if (
      existingBag?.equipments?.Armadura &&
      existingBag.equipments.Armadura.length > 0
    ) {
      hasGeneratedArmor = true;
    }

    // Fazer múltiplas tentativas de geração
    for (let attempt = 0; attempt < numberOfAttempts; attempt++) {
      const reward = rewardGenerator(rewardND);

      // Se há item para gerar, processar
      if (reward.item) {
        const equipments = generateEquipmentsByType(reward.item);
        if (equipments.length > 0) {
          // Filter out armors if we already have one
          const filteredEquipments = equipments.filter((eq) => {
            if (eq.group === 'Armadura' && hasGeneratedArmor) {
              return false; // Skip this armor
            }
            if (eq.group === 'Armadura') {
              hasGeneratedArmor = true; // Mark that we now have armor
            }
            return true;
          });

          if (filteredEquipments.length > 0) {
            allGeneratedEquipments.push(...filteredEquipments);
            attemptDetails.push(
              `Tentativa ${attempt + 1}: ${filteredEquipments.length} item(s)`
            );
          }
        }
      }
    }

    // Se não atingiu o mínimo de itens, fazer tentativas extras até conseguir
    let extraAttempts = 0;
    while (allGeneratedEquipments.length < minimumItems && extraAttempts < 20) {
      const reward = rewardGenerator(rewardND);

      if (reward.item) {
        const equipments = generateEquipmentsByType(reward.item);
        if (equipments.length > 0) {
          // Filter out armors if we already have one
          const filteredEquipments = equipments.filter((equipment) => {
            if (equipment.group === 'Armadura' && hasGeneratedArmor) {
              return false;
            }
            // Update flag if this is an armor
            if (equipment.group === 'Armadura') {
              hasGeneratedArmor = true;
            }
            return true;
          });

          if (filteredEquipments.length > 0) {
            allGeneratedEquipments.push(...filteredEquipments);
            extraAttempts++;
            attemptDetails.push(
              `Tentativa extra ${extraAttempts}: ${filteredEquipments.length} item(s)`
            );
          } else {
            // If all items were filtered out, still increment attempts to avoid infinite loop
            extraAttempts++;
          }
        }
      } else {
        // Se não conseguiu gerar via recompensas, gerar itens genéricos
        const genericItem: Equipment = {
          nome: `Item Genérico ${extraAttempts + 1}`,
          group: 'Item Geral',
          preco: 5 + rollDice(1, 10),
          spaces: 1,
        };
        allGeneratedEquipments.push(genericItem);
        extraAttempts++;
        attemptDetails.push(`Tentativa extra ${extraAttempts}: Item genérico`);
      }
    }

    // Organizar equipamentos por grupo
    const equipmentsByGroup: Partial<BagEquipments> = {};
    let totalCost = 0;
    const itemDetails: string[] = [];
    const itemsForSteps: { name?: string; value: string }[] = [];

    allGeneratedEquipments.forEach((equipment) => {
      const group = equipment.group as keyof BagEquipments;

      if (!equipmentsByGroup[group]) {
        equipmentsByGroup[group] = [] as any;
      }

      (equipmentsByGroup[group] as any).push(equipment);
      totalCost += equipment.preco || 0;
      itemDetails.push(`${equipment.nome} (${equipment.preco || 0} T$)`);

      // Adicionar item para os steps com preço
      itemsForSteps.push({
        value: `${equipment.nome} - ${equipment.preco || 0} T$`,
      });
    });

    const totalItemsGenerated = allGeneratedEquipments.length;
    const totalAttempts = numberOfAttempts + extraAttempts;
    const detailsMessage =
      totalItemsGenerated > 0
        ? `ND ${rewardND} - ${totalAttempts} tentativas, ${totalItemsGenerated}/${minimumItems} itens (mín. garantido)`
        : `ND ${rewardND} - ${totalAttempts} tentativas, nenhum item gerado`;

    return {
      equipments: equipmentsByGroup,
      totalCost,
      generationDetails: detailsMessage,
      itemsForSteps,
    };
  } catch (error) {
    // console.error('Erro ao gerar equipamentos:', error);
    return {
      equipments: {},
      totalCost: 0,
      generationDetails: `Erro ao gerar itens para ND ${rewardND}`,
      itemsForSteps: [],
    };
  }
}

/**
 * Gera equipamentos baseado no tipo da recompensa
 * Faz múltiplas tentativas para garantir que sempre gere algo
 */
function generateEquipmentsByType(itemReward: ItemReward): Equipment[] {
  const results: Equipment[] = [];

  if (!itemReward.reward) return results;

  const { reward } = itemReward;

  switch (reward.type) {
    case ITEM_TYPE.DIVERSO: {
      const equipment = generateMiscellaneousEquipmentWithRetries();
      if (equipment) results.push(equipment);
      break;
    }

    case ITEM_TYPE.ARMA_ARMADURA:
    case ITEM_TYPE.SUPERIOR: {
      const equipment = generateWeaponOrArmorWithRetries(reward.mods || 0);
      if (equipment) results.push(equipment);
      break;
    }

    case ITEM_TYPE.POCAO: {
      const potionEquipments = generatePotionEquipment(
        reward.qty || 1,
        reward.dice || 1,
        reward.som || 0,
        reward.applyRollBonus
      );
      results.push(...potionEquipments);
      break;
    }

    case ITEM_TYPE.MAGICO_MENOR: {
      const equipment = generateMagicalEquipmentWithRetries(1);
      if (equipment) results.push(equipment);
      break;
    }

    case ITEM_TYPE.MAGICO_MEDIO: {
      const equipment = generateMagicalEquipmentWithRetries(3);
      if (equipment) results.push(equipment);
      break;
    }

    case ITEM_TYPE.MAGICO_MAIOR: {
      const equipment = generateMagicalEquipmentWithRetries(4);
      if (equipment) results.push(equipment);
      break;
    }

    default: {
      // Tipo de item não reconhecido - gerar item genérico
      results.push({
        nome: 'Item Misterioso',
        group: 'Item Geral',
        preco: 10,
        spaces: 1,
      });
      break;
    }
  }

  return results;
}

/**
 * Gera item diverso com tentativas até conseguir
 */
function generateMiscellaneousEquipmentWithRetries(
  maxRetries: number = 5
): Equipment | null {
  for (let i = 0; i < maxRetries; i++) {
    const diceRoll = rollDice(1, 100);
    const equipment = generateMiscellaneousEquipment(diceRoll);
    if (equipment) return equipment;
  }

  // Se não conseguiu gerar, retorna item genérico
  return {
    nome: 'Item Genérico',
    group: 'Item Geral',
    preco: 5,
    spaces: 1,
  };
}

/**
 * Gera arma/armadura com tentativas até conseguir
 */
function generateWeaponOrArmorWithRetries(
  mods: number,
  maxRetries: number = 5
): Equipment | DefenseEquipment | null {
  for (let i = 0; i < maxRetries; i++) {
    const diceRoll = rollDice(1, 100);
    const equipment = generateWeaponOrArmor(diceRoll, mods);
    if (equipment) return equipment;
  }

  // Se não conseguiu gerar, retorna arma genérica
  return {
    nome: 'Arma Genérica',
    group: 'Arma',
    dano: '1d6',
    critico: 'x2',
    tipo: 'Corte',
    preco: 15,
    spaces: 1,
  };
}

/**
 * Gera item mágico com tentativas até conseguir
 */
function generateMagicalEquipmentWithRetries(
  level: number,
  maxRetries: number = 5
): Equipment | null {
  for (let i = 0; i < maxRetries; i++) {
    const equipment = generateMagicalEquipment(level);
    if (equipment) return equipment;
  }

  // Se não conseguiu gerar, retorna acessório genérico
  return {
    nome: `Acessório Mágico Nível ${level}`,
    group: 'Item Geral',
    preco: 500 * level,
    spaces: 1,
  };
}

/**
 * Calcula o custo total de equipamentos
 *
 * @param equipments - Equipamentos gerados
 * @returns Custo total em T$
 */
export function calculateEquipmentCost(
  equipments: Partial<BagEquipments>
): number {
  let totalCost = 0;

  Object.values(equipments).forEach((equipmentArray) => {
    if (equipmentArray) {
      equipmentArray.forEach((equipment) => {
        totalCost += equipment.preco || 0;
      });
    }
  });

  return totalCost;
}
