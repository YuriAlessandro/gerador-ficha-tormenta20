import {
  GOLPE_PESSOAL_EFFECTS,
  GolpePessoalBuild,
  GolpePessoalEffect,
  GolpePessoalEffectInstance,
  ELEMENTAL_DAMAGE_TYPES,
} from '../../data/systems/tormenta20/golpePessoal';
import { getRandomItemFromArray } from '../randomUtils';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { dataRegistry } from '../../data/registry';
import { Spell, SpellCircle, spellsCircles } from '../../interfaces/Spells';
import { SupplementId } from '../../types/supplement.types';

/**
 * Retorna as magias que podem ser escolhidas pelo efeito "Conjurador" do Golpe
 * Pessoal. Pela regra oficial (RAW), a magia deve ser de 1º ou 2º círculo e ter
 * como alvo uma criatura ou afetar uma área.
 *
 * A lista é montada dinamicamente a partir das magias reais (arcanas + divinas)
 * do core e dos suplementos ativos, garantindo que os nomes correspondam aos
 * dados do jogo (ex.: "Bola de Fogo" aparece; buffs pessoais como "Armadura
 * Elemental" não).
 */
export function getConjuradorSpellOptions(
  activeSupplements: SupplementId[]
): Spell[] {
  const flattenCircle = (circle: {
    arcane: SpellCircle;
    divine: SpellCircle;
  }): Spell[] => [
    ...Object.values(circle.arcane).flat(),
    ...Object.values(circle.divine).flat(),
  ];

  const circle1 = dataRegistry.getSpellsByCircleAndSupplements(
    1,
    activeSupplements
  );
  const circle2 = dataRegistry.getSpellsByCircleAndSupplements(
    2,
    activeSupplements
  );

  const spells = [...flattenCircle(circle1), ...flattenCircle(circle2)].filter(
    (spell) =>
      spell.alvo?.toLowerCase().includes('criatura') || Boolean(spell.area)
  );

  // Dedup por nome (magias universais aparecem em arcana e divina) e ordena.
  const byName = new Map<string, Spell>();
  spells.forEach((spell) => {
    if (!byName.has(spell.nome)) byName.set(spell.nome, spell);
  });

  return Array.from(byName.values()).sort((a, b) =>
    a.nome.localeCompare(b.nome)
  );
}

/**
 * Custo em PM do efeito "Conjurador" conforme o círculo da magia escolhida:
 * 1º círculo = 2 PM, 2º círculo = 4 PM (custo da magia + 1). Retorna 2 (mínimo)
 * quando nenhuma magia foi escolhida ou não é encontrada nas opções.
 */
export function getConjuradorCost(
  spellName: string | undefined,
  options: Spell[]
): number {
  if (!spellName) return 2;
  const spell = options.find((s) => s.nome === spellName);
  return spell?.spellCircle === spellsCircles.c2 ? 4 : 2;
}

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
      case 'spell': {
        // Geração aleatória: escolhe apenas magias de 1º círculo (custo 2 PM),
        // mantendo o custo consistente com getEffectCost.
        const firstCircleSpells = getConjuradorSpellOptions([]).filter(
          (spell) => spell.spellCircle === spellsCircles.c1
        );
        if (firstCircleSpells.length > 0) {
          instance.choices = [getRandomItemFromArray(firstCircleSpells).nome];
        }
        break;
      }
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
  const conjuradorOptions = getConjuradorSpellOptions([]);

  return effects.reduce((total, instance) => {
    let cost = instance.effect.cost * instance.count;

    // Custo variável do Conjurador conforme o círculo da magia escolhida.
    if (instance.effect.variableCost && instance.effect.name === 'Conjurador') {
      cost =
        getConjuradorCost(instance.choices?.[0], conjuradorOptions) *
        instance.count;
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
export function validateGolpePessoalBuild(
  build: GolpePessoalBuild,
  effectsMap: Record<string, GolpePessoalEffect> = GOLPE_PESSOAL_EFFECTS
): {
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
    const effect = effectsMap[effectData.effectName];
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
