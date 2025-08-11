import { Atributo } from '../data/atributos';
import { COMBAT_TABLES } from '../data/threats/combatTables';
import {
  ChallengeLevel,
  ChallengeTier,
  ThreatRole,
  ThreatCombatStats,
  AbilityRecommendation,
  ThreatAttributes,
  ThreatSkill,
  ThreatSheet,
  ResistanceAssignments,
  ResistanceType,
} from '../interfaces/ThreatSheet';
import { SkillsAttrs } from '../interfaces/Skills';

/**
 * Converte o enum ChallengeLevel para valor numérico
 */
export function parseNDValue(challengeLevel: ChallengeLevel): number {
  switch (challengeLevel) {
    case ChallengeLevel.QUARTER:
      return 0.25;
    case ChallengeLevel.THIRD:
      return 0.33;
    case ChallengeLevel.HALF:
      return 0.5;
    case ChallengeLevel.S:
      return 20; // Assume ND 20 como base
    case ChallengeLevel.S_PLUS:
      return 21; // Assume ND 21 como base
    default:
      return parseInt(challengeLevel, 10);
  }
}

/**
 * Calcula pontos de mana baseado no nível de desafio (3 × ND)
 */
export function calculateManaPoints(challengeLevel: ChallengeLevel): number {
  const ndValue = parseNDValue(challengeLevel);
  return Math.ceil(ndValue * 3);
}

/**
 * Calcula as estatísticas de combate baseadas no papel e nível de desafio
 */
export function calculateCombatStats(
  role: ThreatRole,
  challengeLevel: ChallengeLevel,
  hasManaPoints: boolean = false
): ThreatCombatStats {
  const table = COMBAT_TABLES[role];
  const entry = table.find((e) => e.nd === challengeLevel);

  if (!entry) {
    throw new Error(
      `Estatísticas não encontradas para papel ${role} e ND ${challengeLevel}`
    );
  }

  const manaPoints = hasManaPoints
    ? calculateManaPoints(challengeLevel)
    : undefined;

  return {
    attackValue: entry.attackValue,
    averageDamage: entry.averageDamage,
    defense: entry.defense,
    strongSave: entry.strongSave,
    mediumSave: entry.mediumSave,
    weakSave: entry.weakSave,
    hitPoints: entry.hitPoints,
    standardEffectDC: entry.standardEffectDC,
    manaPoints,
  };
}

/**
 * Calcula o bônus de treinamento baseado no ND
 */
export function getTrainingBonus(challengeLevel: ChallengeLevel): number {
  const ndValue = parseNDValue(challengeLevel);

  if (ndValue <= 6) return 2;
  if (ndValue >= 7 && ndValue <= 14) return 4;
  return 6; // ND 15+
}

/**
 * Calcula o valor de uma perícia baseado no ND, modificador do atributo e bônus
 */
export function calculateSkillValue(
  challengeLevel: ChallengeLevel,
  attributeModifier: number,
  trained: boolean,
  customBonus: number
): number {
  const ndValue = parseNDValue(challengeLevel);
  const halfND = Math.floor(ndValue / 2);
  const trainingBonus = trained ? getTrainingBonus(challengeLevel) : 0;

  // Ensure all values are valid numbers
  const safeAttributeModifier = Number.isNaN(attributeModifier)
    ? 0
    : attributeModifier;
  const safeCustomBonus = Number.isNaN(customBonus) ? 0 : customBonus;

  return halfND + safeAttributeModifier + trainingBonus + safeCustomBonus;
}

/**
 * Calcula o modificador de um atributo
 */
export function calculateAttributeModifier(attributeValue: number): number {
  if (
    Number.isNaN(attributeValue) ||
    attributeValue === undefined ||
    attributeValue === null
  ) {
    return 0; // Default to 0 modifier for invalid values
  }
  return Math.floor((attributeValue - 10) / 2);
}

/**
 * Calcula todas as perícias baseadas nos atributos e ND
 */
export function calculateAllSkills(
  challengeLevel: ChallengeLevel,
  attributes: ThreatAttributes,
  existingSkills: ThreatSkill[] = [],
  resistanceAssignments?: ResistanceAssignments,
  combatStats?: ThreatCombatStats
): ThreatSkill[] {
  const skills: ThreatSkill[] = [];

  // Use the SkillsAttrs mapping from the Skills interface
  const skillsAttrs = SkillsAttrs as unknown as Record<string, Atributo>;

  // Calculate skills for all entries in SkillsAttrs
  Object.entries(skillsAttrs).forEach(([skillName, attribute]) => {
    const existingSkill = existingSkills.find((s) => s.name === skillName);
    const trained = existingSkill?.trained || false;
    let customBonus = existingSkill?.customBonus || 0;
    const attributeValue = attributes[attribute] || 10;
    const attributeModifier = calculateAttributeModifier(attributeValue);

    // Apply resistance bonuses for Fortitude, Reflexos, Vontade
    if (resistanceAssignments && combatStats) {
      const resistanceSkills = ['Fortitude', 'Reflexos', 'Vontade'];
      if (resistanceSkills.includes(skillName)) {
        const resistanceType =
          resistanceAssignments[skillName as keyof ResistanceAssignments];
        let resistanceBonus = 0;

        switch (resistanceType) {
          case ResistanceType.STRONG:
            resistanceBonus = combatStats.weakSave; // Strong resistance = lowest bonus
            break;
          case ResistanceType.MEDIUM:
            resistanceBonus = combatStats.mediumSave; // Medium resistance = medium bonus
            break;
          case ResistanceType.WEAK:
            resistanceBonus = combatStats.strongSave; // Weak resistance = highest bonus
            break;
          default:
            resistanceBonus = 0;
        }

        // Apply the resistance bonus as a custom bonus
        customBonus += resistanceBonus;
      }
    }

    const total = calculateSkillValue(
      challengeLevel,
      attributeModifier,
      trained,
      customBonus
    );

    skills.push({
      name: skillName,
      attribute,
      trained,
      customBonus,
      total,
    });
  });

  return skills.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Determina o patamar (tier) baseado no nível de desafio
 */
export function getTierByChallengeLevel(
  challengeLevel: ChallengeLevel
): ChallengeTier {
  const ndValue = parseNDValue(challengeLevel);

  if (ndValue >= 0.25 && ndValue <= 4) return ChallengeTier.INICIANTE;
  if (ndValue >= 5 && ndValue <= 10) return ChallengeTier.VETERANO;
  if (ndValue >= 11 && ndValue <= 16) return ChallengeTier.CAMPEAO;
  if (ndValue >= 17 && ndValue <= 20) return ChallengeTier.LENDA;
  return ChallengeTier.L_PLUS; // S e S+
}

/**
 * Calcula a recomendação de quantidade de habilidades baseada no papel e ND
 */
export function getRecommendedAbilityCount(
  role: ThreatRole,
  challengeLevel: ChallengeLevel
): AbilityRecommendation {
  const tier = getTierByChallengeLevel(challengeLevel);
  const ndValue = parseNDValue(challengeLevel);

  // Calcular multiplicador baseado no patamar
  let tierMultiplier = 1;
  if (ndValue >= 0.25 && ndValue <= 4) {
    tierMultiplier = 1; // Iniciante
  } else if (ndValue >= 5 && ndValue <= 10) {
    tierMultiplier = 2; // Veterano
  } else if (ndValue >= 11 && ndValue <= 16) {
    tierMultiplier = 3; // Campeão
  } else if (ndValue >= 17 && ndValue <= 20) {
    tierMultiplier = 4; // Lenda
  } else {
    tierMultiplier = 5; // L+
  }

  if (role === ThreatRole.ESPECIAL) {
    return {
      min: tierMultiplier * 2,
      max: tierMultiplier * 3,
      tier,
    };
  }

  return {
    min: tierMultiplier * 1,
    max: tierMultiplier * 2,
    tier,
  };
}

/**
 * Cria atributos padrão para uma ameaça
 */
export function createDefaultAttributes(): ThreatAttributes {
  return {
    [Atributo.FORCA]: 10,
    [Atributo.DESTREZA]: 10,
    [Atributo.CONSTITUICAO]: 10,
    [Atributo.INTELIGENCIA]: 10,
    [Atributo.SABEDORIA]: 10,
    [Atributo.CARISMA]: 10,
  };
}

/**
 * Calcula o dano médio de dados (ex: "2d6+3" = 10)
 */
export function calculateDiceAverage(
  diceString: string,
  bonusDamage: number = 0
): number {
  // Regex para capturar padrões como "1d8", "2d6", "3d10+2", etc.
  const diceRegex = /^(\d+)d(\d+)$/i;
  const match = diceString.trim().match(diceRegex);

  if (!match) {
    return bonusDamage; // Se não conseguir parsear, retorna só o bônus
  }

  const numDice = parseInt(match[1], 10);
  const dieSize = parseInt(match[2], 10);

  // Dano médio de um dado = (1 + tamanho do dado) / 2
  const averagePerDie = (1 + dieSize) / 2;
  const totalDiceAverage = numDice * averagePerDie;

  return Math.round(totalDiceAverage + bonusDamage);
}

/**
 * Valida se uma string de dados é válida (ex: "1d8", "2d6")
 */
export function validateDiceString(diceString: string): boolean {
  const diceRegex = /^(\d+)d(\d+)$/i;
  return diceRegex.test(diceString.trim());
}

/**
 * Gera um ID único para ameaças
 */
export function generateThreatId(): string {
  return `threat_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Traduz os nomes dos patamares para exibição
 */
export function getTierDisplayName(tier: ChallengeTier): string {
  const tierNames = {
    [ChallengeTier.INICIANTE]: 'Iniciante',
    [ChallengeTier.VETERANO]: 'Veterano',
    [ChallengeTier.CAMPEAO]: 'Campeão',
    [ChallengeTier.LENDA]: 'Lenda',
    [ChallengeTier.L_PLUS]: 'Lenda+',
  };

  return tierNames[tier];
}

/**
 * Valida se uma ameaça está completa para finalização
 */
export function validateThreat(threat: Partial<ThreatSheet>): string[] {
  const errors: string[] = [];

  if (!threat.name?.trim()) {
    errors.push('Nome é obrigatório');
  }

  if (!threat.type) {
    errors.push('Tipo é obrigatório');
  }

  if (!threat.size) {
    errors.push('Tamanho é obrigatório');
  }

  if (!threat.role) {
    errors.push('Papel é obrigatório');
  }

  if (!threat.challengeLevel) {
    errors.push('Nível de Desafio é obrigatório');
  }

  if (!threat.displacement?.trim()) {
    errors.push('Deslocamento é obrigatório');
  }

  return errors;
}
