import Equipment, {
  DamageAttribute,
  WeaponAction,
} from '../interfaces/Equipment';
import Skill, { CompleteSkill } from '../interfaces/Skills';
import { CharacterAttributes } from '../interfaces/Character';

export function getWeaponSkill(weapon: Equipment): Skill {
  if (weapon.customSkill) return weapon.customSkill;
  const isRange = weapon.alcance && weapon.alcance !== '-' && !weapon.arremesso;
  return isRange ? Skill.PONTARIA : Skill.LUTA;
}

export function getSkillAttackBonus(
  skillName: Skill,
  completeSkills: CompleteSkill[] | undefined,
  atributos: CharacterAttributes
): number {
  const skill = completeSkills?.find((s) => s.name === skillName);
  if (!skill) return 0;
  const attrBonus = skill.modAttr ? atributos[skill.modAttr].value : 0;
  return (
    (skill.halfLevel ?? 0) +
    attrBonus +
    (skill.others ?? 0) +
    (skill.training ?? 0)
  );
}

export function isWeaponMelee(weapon: Equipment): boolean {
  return !weapon.alcance || weapon.alcance === '-' || !!weapon.arremesso;
}

/**
 * Resolves the damage attribute (Força ou Nenhum) for an attack.
 * Priority: action-level override > weapon-level override > default.
 * Default: melee weapons (incluindo arremessáveis em corpo-a-corpo) somam
 * Força; armas a distância somam Nenhum.
 */
export function resolveDamageAttribute(
  weapon: Equipment,
  action?: WeaponAction
): DamageAttribute {
  if (action?.damageAttribute) return action.damageAttribute;
  if (weapon.damageAttribute) return weapon.damageAttribute;
  return isWeaponMelee(weapon) ? 'Força' : 'Nenhum';
}
