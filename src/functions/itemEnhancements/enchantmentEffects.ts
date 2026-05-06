import Skill from '../../interfaces/Skills';
import { EnhancementEffect } from './core';

/**
 * Numeric effects of magical enchantments. Mirrors `modificationEffects` for
 * superior-item modifications: catalog entries with clear, simple numeric
 * impact are mapped here; the rest are listed in `TEXT_ONLY_ENCHANTMENTS` and
 * persisted on the item without modifying stats.
 *
 * Stacking with modifications is intentional: an item with both Certeira (+1 atk
 * mod) and Formidável (+2 atk/+2 dmg ench) gets +3 atk and +2 dmg total. Pipeline
 * is in `applyEnhancements.ts`.
 */
const magnificaEffect: EnhancementEffect = {
  weaponStats: { atkBonus: 4, danoDelta: 4 },
};

export const enchantmentEffects: Record<string, EnhancementEffect> = {
  // Weapons — clear numeric effects
  Ameaçadora: { criticoThreatDoubleMargin: true },
  Defensora: { defenseBonus: 2 }, // +2 Defesa do empunhador
  Energética: { weaponStats: { atkBonus: 4 } },
  Formidável: { weaponStats: { atkBonus: 2, danoDelta: 2 } },
  Magnífica: magnificaEffect,
  // Legacy alias kept for migration: items saved before the asterisk was
  // dropped from the canonical name still resolve to the same effect.
  'Magnífica*': magnificaEffect,

  // Arremesso — adds melee + throw special actions and sets the arremesso flag.
  // Uses prefixed IDs so the pipeline doesn't confuse them with base actions.
  Arremesso: {
    setArremesso: true,
    specialActions: [
      { id: 'ench-arremesso-melee', label: 'Corpo a corpo', skill: 'Luta' },
      {
        id: 'ench-arremesso-throw',
        label: 'Arremessar',
        skill: 'Pontaria',
        damageAttribute: 'Nenhum',
      },
    ],
  },

  // Weapons — extra damage on hit (does not crit)
  Flamejante: { extraDamage: [{ dice: '1d6', damageType: 'Fogo' }] },
  Congelante: { extraDamage: [{ dice: '1d6', damageType: 'Frio' }] },
  Corrosiva: { extraDamage: [{ dice: '1d6', damageType: 'Ácido' }] },
  Elétrica: { extraDamage: [{ dice: '1d6', damageType: 'Eletricidade' }] },
  Piedosa: { extraDamage: [{ dice: '1d8', damageType: 'Impacto' }] },
  Tumular: { extraDamage: [{ dice: '1d8', damageType: 'Trevas' }] },

  // Armor / shields — clear numeric effects
  Defensor: { defenseStats: { defenseBonusDelta: 2 } },
  Guardião: { defenseStats: { defenseBonusDelta: 4 } },
  Acrobático: { skillBonuses: [{ skill: Skill.ACROBACIA, value: 2 }] },
  Sombrio: { skillBonuses: [{ skill: Skill.FURTIVIDADE, value: 2 }] },
  Escorregadio: { skillBonuses: [{ skill: Skill.ATLETISMO, value: 2 }] },
};

/**
 * Enchantments recognized by the catalog but with effects that aren't representable
 * as simple numeric deltas (conditional damage, resistances, special actions, granted
 * spells). They persist on the item and surface in the visual indicator/tooltip,
 * but `applyItemEnhancements` skips them.
 */
export const TEXT_ONLY_ENCHANTMENTS: ReadonlySet<string> = new Set([
  // Weapons
  'Anticriatura',
  'Assassina',
  'Caçadora',
  'Dançarina',
  'Destruidora',
  'Dilacerante',
  'Drenante',
  'Excruciante',
  'Lancinante*',
  'Profana',
  'Sagrada',
  'Sanguinária',
  'Trovejante',
  'Veloz',
  'Venenosa',
  // Armors / shields
  'Abascanto',
  'Abençoado',
  'Alado',
  'Animado',
  'Assustador',
  'Cáustica',
  'Esmagador',
  'Fantasmagórico',
  'Fortificado',
  'Gélido',
  'Hipnótico',
  'Ilusório',
  'Incandescente',
  'Invulnerável',
  'Opaco',
  'Protetor',
  'Refletor',
  'Relampejante',
  'Reluzente',
  'Zeloso',
]);
