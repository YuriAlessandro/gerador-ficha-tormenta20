import Skill from '../../interfaces/Skills';

/**
 * Effect of a single superior-item modification.
 *
 * Numeric deltas (atkBonus, danoDelta, etc.) are applied additively to the item's
 * base stats. Skill bonuses are converted into SheetBonus entries on the equipment.
 *
 * Stacking: when two modifications target the same stat (e.g. Certeira +1 atk and
 * Pungente +2 atk), the deltas sum (+3 total). This is the adopted interpretation
 * — official rules are ambiguous on whether prerequisite mods stack.
 *
 * Mods with purely textual effects (Harmonizada, Mira telescópica, Injeção alquímica,
 * Material especial) are intentionally absent from this registry — they are persisted
 * on the item and shown in the description, but do not auto-modify numeric stats.
 */
export interface ModificationEffect {
  weaponStats?: {
    atkBonus?: number;
    danoDelta?: number;
    criticoMultDelta?: number;
    criticoThreatDelta?: number;
  };
  defenseStats?: {
    defenseBonusDelta?: number;
    armorPenaltyDelta?: number;
  };
  spacesDelta?: number;
  skillBonuses?: { skill: Skill; value: number }[];
}

export const modificationEffects: Record<string, ModificationEffect> = {
  // Weapons — numeric mods
  Atroz: { weaponStats: { danoDelta: 2 } },
  Certeira: { weaponStats: { atkBonus: 1 } },
  Cruel: { weaponStats: { danoDelta: 1 } },
  Maciça: { weaponStats: { criticoMultDelta: 1 } },
  Precisa: { weaponStats: { criticoThreatDelta: 1 } },
  Pungente: { weaponStats: { atkBonus: 2 } },

  // Armor / shields — numeric mods
  Ajustada: { defenseStats: { armorPenaltyDelta: -1 } },
  'Sob medida': { defenseStats: { armorPenaltyDelta: -2 } },
  Reforçada: {
    defenseStats: { defenseBonusDelta: 1, armorPenaltyDelta: 1 },
  },

  // Cross-cutting (apply to weapons or armor/shields)
  Discreta: {
    spacesDelta: -1,
    skillBonuses: [{ skill: Skill.FURTIVIDADE, value: 5 }],
  },
  Equilibrada: {
    skillBonuses: [{ skill: Skill.ATLETISMO, value: 2 }],
  },
  'Banhada a ouro': {
    skillBonuses: [{ skill: Skill.DIPLOMACIA, value: 2 }],
  },
  'Cravejada de gemas': {
    skillBonuses: [{ skill: Skill.ENGANACAO, value: 2 }],
  },
  Luxuosa: {
    skillBonuses: [
      { skill: Skill.INTIMIDACAO, value: 2 },
      { skill: Skill.DIPLOMACIA, value: 2 },
    ],
  },
};

/**
 * Mods recognized by the catalog but with no numeric effect — kept here purely
 * for documentation purposes (TODO: future iterations may model these).
 *
 * As entradas de Heróis de Arton (Farpada, Fósforo, Guarda, Incendiária,
 * Pressurizada, Balístico, Deslumbrante, Injetora, Prudente) ficam aqui porque
 * têm efeitos condicionais (ativação por ação, dano de tipo específico,
 * limites por subtipo de item) que não são representáveis pelos deltas
 * numéricos suportados por aplicação automática.
 */
export const TEXT_ONLY_MODIFICATIONS: ReadonlySet<string> = new Set([
  'Harmonizada',
  'Mira telescópica',
  'Injeção alquímica',
  'Material especial',
  'Polida',
  'Selada',
  'Delicada',
  'Espinhosa',
  // Heróis de Arton
  'Balístico',
  'Deslumbrante',
  'Farpada',
  'Fósforo',
  'Guarda',
  'Incendiária',
  'Injetora',
  'Pressurizada',
  'Prudente',
]);
