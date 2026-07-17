import Equipment, {
  DamageAttribute,
  WeaponAction,
} from '../interfaces/Equipment';
import Skill, { CompleteSkill } from '../interfaces/Skills';
import { CharacterAttributes } from '../interfaces/Character';
import { Atributo } from '../data/systems/tormenta20/atributos';
import { parseDualModeDamage } from './diceRoller';

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

/**
 * Dano exibido na ficha para a linha principal da arma. Replica exatamente a
 * lógica de `Weapon.tsx`: para armas melee não-dual, anexa o modificador de
 * atributo (normalmente Força) ao `dano`; armas à distância e de modo duplo
 * mantêm o `dano` cru. O modificador de atributo NÃO está embutido em
 * `weapon.dano` (só bônus fixos de poder/encantamento), então anexar aqui não
 * duplica. Usado tanto na exibição quanto na exportação do PDF para garantir
 * que os dois mostrem o mesmo valor.
 */
export function getWeaponDisplayDamage(
  weapon: Equipment,
  atributos: CharacterAttributes
): string {
  const dano = weapon.dano ?? '';
  if (!dano) return dano;

  const dualMode = parseDualModeDamage(dano);
  if (!isWeaponMelee(weapon) || dualMode) return dano;

  const attr = resolveDamageAttribute(weapon);
  let mod = 0;
  if (attr !== 'Nenhum') {
    const value = atributos[attr as Atributo]?.value;
    mod = typeof value === 'number' ? value : atributos.Força.value;
  }
  const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
  return `${dano}${modStr}`;
}
