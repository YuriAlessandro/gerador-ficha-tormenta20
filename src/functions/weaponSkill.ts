import Equipment, {
  AttackAttribute,
  DamageAttribute,
  WeaponAction,
  WeaponAttribute,
} from '../interfaces/Equipment';
import Skill, { CompleteSkill } from '../interfaces/Skills';
import { CharacterAttributes } from '../interfaces/Character';
import { Atributo } from '../data/systems/tormenta20/atributos';
import { addFlatDamageBonus } from './weaponDamageStep';

export function getWeaponSkill(weapon: Equipment): Skill {
  if (weapon.customSkill) return weapon.customSkill;
  const isRange = weapon.alcance && weapon.alcance !== '-' && !weapon.arremesso;
  return isRange ? Skill.PONTARIA : Skill.LUTA;
}

/**
 * Leitor único do modificador de um atributo de arma. Ponto de verdade tanto da
 * exibição quanto da rolagem — antes cada lado tinha seu próprio fallback
 * (`atributos.Força.value` na ficha, `modDano` na rolagem) e eles coincidiam por
 * acidente.
 *
 * Atributo ausente/'Nenhum' → 0. Atributo inválido também → 0: é dado
 * corrompido, e somar Força silenciosamente esconde o problema.
 */
export function weaponAttributeModifier(
  attr: WeaponAttribute | undefined,
  atributos: CharacterAttributes
): number {
  if (!attr || attr === 'Nenhum') return 0;
  const value = atributos[attr as Atributo]?.value;
  return typeof value === 'number' ? value : 0;
}

/**
 * Atributo que substitui o da perícia no teste de ataque.
 * Prioridade: override do modo > override da arma > `undefined`.
 *
 * Devolve `undefined` (e não um atributo concreto) quando não há override —
 * é o que preserva a semântica "usa o atributo da própria perícia".
 */
export function resolveAttackAttribute(
  weapon: Equipment,
  action?: WeaponAction
): AttackAttribute | undefined {
  return action?.attackAttribute ?? weapon.attackAttribute;
}

/**
 * Perícia efetivamente rolada no ataque.
 * Prioridade: `customSkill` da arma > perícia forçada pelo modo > regra padrão
 * de alcance/arremesso.
 */
export function resolveAttackSkill(
  weapon: Equipment,
  action?: WeaponAction
): Skill {
  if (weapon.customSkill) return weapon.customSkill;
  if (action?.skill === 'Luta') return Skill.LUTA;
  if (action?.skill === 'Pontaria') return Skill.PONTARIA;
  return getWeaponSkill(weapon);
}

/**
 * Bônus total da perícia num teste de ataque.
 *
 * `attackAttributeOverride` troca APENAS a parcela de atributo — metade do
 * nível, treinamento e outros bônus continuam vindo da perícia escolhida.
 *
 * `manualOthers` é ignorado de propósito: `recalculateSheet` já o soma dentro de
 * `others`.
 */
export function getSkillAttackBonus(
  skillName: Skill,
  completeSkills: CompleteSkill[] | undefined,
  atributos: CharacterAttributes,
  attackAttributeOverride?: AttackAttribute
): number {
  const skill = completeSkills?.find((s) => s.name === skillName);
  if (!skill) return 0;
  const effectiveAttr = attackAttributeOverride ?? skill.modAttr;
  return (
    (skill.halfLevel ?? 0) +
    weaponAttributeModifier(effectiveAttr, atributos) +
    (skill.others ?? 0) +
    (skill.training ?? 0)
  );
}

/**
 * Ponto único de "quanto a perícia soma no ataque desta arma neste modo".
 * Resolve perícia e override de atributo juntos — use este em vez de compor
 * `getWeaponSkill` + `getSkillAttackBonus` à mão.
 */
export function getWeaponAttackSkillBonus(
  weapon: Equipment,
  completeSkills: CompleteSkill[] | undefined,
  atributos: CharacterAttributes,
  action?: WeaponAction
): number {
  return getSkillAttackBonus(
    resolveAttackSkill(weapon, action),
    completeSkills,
    atributos,
    resolveAttackAttribute(weapon, action)
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
 * Dano exibido na ficha para a linha principal da arma, e no PDF. O modificador
 * de atributo NÃO está embutido em `weapon.dano` (só bônus fixos de poder ou
 * encantamento), então somá-lo aqui não duplica.
 *
 * `extraFlatBonus` são os bônus de dano que não foram bakeados em `weapon.dano`
 * e precisam ser somados ao vivo (ver `sumLiveWeaponBonuses`). O PDF não passa
 * esse parâmetro: efeito ativo é estado transitório de combate e não deve ser
 * congelado na exportação.
 *
 * A soma é feita num ponto só via `addFlatDamageBonus`, que MESCLA um `+N` já
 * presente (`1d8+2` + 3 → `1d8+5`, não `1d8+2+3`) e aplica o bônus aos dois
 * lados do dano duplo (`1d8/1d10` → `1d8+3/1d10+3`) — exatamente o que a
 * rolagem faz, que escolhe um modo e soma o modificador uma vez. Antes daqui
 * havia um early-return para arma à distância que fazia Arco Longo e Funda
 * (que somam Força por `damageAttribute`) exibirem um valor menor que o rolado.
 */
export function getWeaponDisplayDamage(
  weapon: Equipment,
  atributos: CharacterAttributes,
  extraFlatBonus = 0
): string {
  const baseDano = weapon.dano ?? '';
  if (!baseDano) return baseDano;

  const attrMod = weaponAttributeModifier(
    resolveDamageAttribute(weapon),
    atributos
  );
  return addFlatDamageBonus(baseDano, extraFlatBonus + attrMod);
}
