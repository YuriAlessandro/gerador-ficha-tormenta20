import {
  GOLPE_PESSOAL_EFFECTS,
  GolpePessoalBuild,
  GolpePessoalEffect,
  GolpePessoalEffectInstance,
  ELEMENTAL_DAMAGE_TYPES,
  BASIC_SPELLS_1ST_2ND_CIRCLE,
} from '../../data/systems/tormenta20/golpePessoal';
import { getRandomItemFromArray } from '../randomUtils';
import CharacterSheet from '../../interfaces/CharacterSheet';

/**
 * Gets available weapons for the character from their inventory
 */
function getAvailableWeapons(sheet: CharacterSheet): string[] {
  // Get weapons from character's inventory
  const inventoryWeapons =
    sheet.bag?.equipments?.Arma?.map((arma) => arma.nome) || [];

  // If no weapons in inventory, use a default weapon
  if (inventoryWeapons.length === 0) {
    // Try to find a simple weapon the character would likely have
    return ['Adaga']; // Most basic weapon
  }

  return inventoryWeapons;
}

/**
 * Gets the cost of an effect (handles variable costs)
 */
function getEffectCost(effect: GolpePessoalEffect): number {
  if (effect.variableCost && effect.name === 'Conjurador') {
    // For random generation, assume a 1st circle spell (cost 1 + 1 = 2)
    return 2;
  }
  return effect.cost;
}

/**
 * Creates an effect instance with random choices if needed
 */
function createEffectInstance(
  effect: GolpePessoalEffect
): GolpePessoalEffectInstance {
  const instance: GolpePessoalEffectInstance = {
    effect,
    count: 1,
  };

  // Handle choices
  if (effect.requiresChoice) {
    switch (effect.requiresChoice) {
      case 'element':
        instance.choices = [
          getRandomItemFromArray([...ELEMENTAL_DAMAGE_TYPES]),
        ];
        break;
      case 'spell':
        instance.choices = [
          getRandomItemFromArray([...BASIC_SPELLS_1ST_2ND_CIRCLE]),
        ];
        break;
      default:
        break;
    }
  }

  return instance;
}

/**
 * Gets effects that can be afforded with remaining cost
 */
function getAvailableEffectsForCost(
  remainingCost: number,
  currentEffects: GolpePessoalEffectInstance[]
): GolpePessoalEffect[] {
  return Object.values(GOLPE_PESSOAL_EFFECTS).filter((effect) => {
    // Check cost
    const effectCost = getEffectCost(effect);
    if (effectCost > remainingCost) return false;

    // Check if already selected and can't repeat
    const existing = currentEffects.find((e) => e.effect.name === effect.name);
    if (existing && !effect.canRepeat) return false;

    // Check max repeats
    if (existing && effect.maxRepeats && existing.count >= effect.maxRepeats) {
      return false;
    }

    return true;
  });
}

/**
 * Generates random effects within the cost limit
 */
function generateRandomEffects(maxCost: number): GolpePessoalEffectInstance[] {
  const effects: GolpePessoalEffectInstance[] = [];
  let remainingCost = maxCost;

  // Ensure minimum cost of 1 PM
  if (maxCost < 1) {
    // Add a drawback to make it possible
    const drawbacks = Object.values(GOLPE_PESSOAL_EFFECTS).filter(
      (effect) => effect.category === 'drawback'
    );
    if (drawbacks.length > 0) {
      const drawback = getRandomItemFromArray(drawbacks);
      effects.push({
        effect: drawback,
        count: 1,
      });
      remainingCost -= drawback.cost; // Drawbacks have negative cost
    }
  }

  // Add positive effects
  while (remainingCost > 0) {
    const availableEffects = getAvailableEffectsForCost(remainingCost, effects);

    if (availableEffects.length === 0) break;

    const selectedEffect = getRandomItemFromArray(availableEffects);
    const effectCost = getEffectCost(selectedEffect);

    if (effectCost <= remainingCost) {
      const instance = createEffectInstance(selectedEffect);
      effects.push(instance);
      remainingCost -= effectCost;
    } else {
      break;
    }
  }

  // Ensure we have at least one positive effect
  if (effects.every((e) => e.effect.category === 'drawback')) {
    const positiveEffects = Object.values(GOLPE_PESSOAL_EFFECTS).filter(
      (effect) => effect.category !== 'drawback' && effect.cost <= maxCost + 2 // Allow some drawback compensation
    );
    if (positiveEffects.length > 0) {
      const positiveEffect = getRandomItemFromArray(positiveEffects);
      effects.push(createEffectInstance(positiveEffect));
    }
  }

  return effects;
}

/**
 * Calculates total cost of all effects
 */
function calculateTotalCost(effects: GolpePessoalEffectInstance[]): number {
  return effects.reduce((total, instance) => {
    let cost = instance.effect.cost * instance.count;

    // Handle variable costs
    if (instance.effect.variableCost && instance.effect.name === 'Conjurador') {
      // Assume 1st circle spell cost (1) + base cost (1) = 2 per instance
      cost = 2 * instance.count;
    }

    return total + cost;
  }, 0);
}

/**
 * Generates a description for the Golpe Pessoal
 */
function generateDescription(
  weapon: string,
  effects: GolpePessoalEffectInstance[],
  totalCost: number
): string {
  const effectDescriptions = effects.map((instance) => {
    let desc = instance.effect.name;

    if (instance.count > 1) {
      desc += ` (${instance.count}x)`;
    }

    if (instance.choices && instance.choices.length > 0) {
      desc += ` (${instance.choices.join(', ')})`;
    }

    return desc;
  });

  return `Golpe Pessoal (${weapon}) - ${effectDescriptions.join(
    ', '
  )} [${totalCost} PM]`;
}

/**
 * Generates a random Golpe Pessoal build for automatic character generation
 * Respects level-based PM limitations
 */
export function generateRandomGolpePessoal(
  sheet: CharacterSheet
): GolpePessoalBuild {
  const maxCost = sheet.nivel; // PM limit based on character level
  const availableWeapons = getAvailableWeapons(sheet);

  // Select random weapon
  const weapon = getRandomItemFromArray(availableWeapons);

  // Generate effects within cost limit
  const effects = generateRandomEffects(maxCost);

  // Calculate total cost
  const totalCost = calculateTotalCost(effects);

  // Generate description
  const description = generateDescription(weapon, effects, totalCost);

  return {
    weapon,
    effects: effects.map((instance) => {
      // Find the key for this effect in GOLPE_PESSOAL_EFFECTS
      const effectKey = Object.entries(GOLPE_PESSOAL_EFFECTS).find(
        ([, effect]) => effect === instance.effect
      )?.[0];

      return {
        effectName: effectKey || instance.effect.name, // Use the key if found
        repeats: instance.count,
        choices: instance.choices,
      };
    }),
    totalCost,
    description,
  };
}

/**
 * Validates a Golpe Pessoal build
 */
export function validateGolpePessoalBuild(build: GolpePessoalBuild): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check minimum cost
  if (build.totalCost < 1) {
    errors.push('Golpe Pessoal deve custar pelo menos 1 PM');
  }

  // Check weapon
  if (!build.weapon || build.weapon.trim() === '') {
    errors.push('Arma deve ser especificada');
  }

  // Check effects
  if (build.effects.length === 0) {
    errors.push('Pelo menos um efeito deve ser selecionado');
  }

  // Validate individual effects
  build.effects.forEach((effectData) => {
    const effect = GOLPE_PESSOAL_EFFECTS[effectData.effectName];
    if (!effect) {
      errors.push(`Efeito inválido: ${effectData.effectName}`);
      return;
    }

    // Check repeats
    if (effect.maxRepeats && effectData.repeats > effect.maxRepeats) {
      errors.push(
        `${effect.name} pode ser selecionado no máximo ${effect.maxRepeats} vezes`
      );
    }

    if (!effect.canRepeat && effectData.repeats > 1) {
      errors.push(`${effect.name} não pode ser repetido`);
    }

    // Check required choices
    if (
      effect.requiresChoice &&
      (!effectData.choices || effectData.choices.length === 0)
    ) {
      errors.push(`${effect.name} requer uma escolha`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}
