/**
 * Avaliação genérica de condições de aplicação de bônus (`SheetBonus.condition`).
 *
 * Primitivo neutro do motor: qualquer fonte de conteúdo pode marcar um bônus
 * como condicional, e o recálculo só o aplica quando a condição é satisfeita.
 * Reaproveita os mesmos checks que o motor já faz para automações nativas
 * (armadura pesada, empunhadura, nível de classe, etc.).
 *
 * Observação: as condições inspecionam estado ESTÁVEL da ficha (equipamento
 * empunhado, classe, nível, raça, devoção, poderes). Condições de atributo usam
 * o valor do atributo antes de bônus concedidos por outros `SheetBonus`.
 */
import CharacterSheet, {
  BonusCondition,
  BonusConditionClause,
  BonusConditionOp,
  SheetBonus,
} from '../interfaces/CharacterSheet';
import Equipment, { DefenseEquipment } from '../interfaces/Equipment';
import { isHeavyArmor } from '../data/systems/tormenta20/equipamentos';
import { isWeaponMelee } from './weaponSkill';
import {
  isTwoHanded,
  getWornArmor,
} from '../components/SheetResult/BackpackModal/wielding';
import { getClassLevel } from './multiclass';

function compare(actual: number, op: BonusConditionOp, value: number): boolean {
  if (op === 'gte') return actual >= value;
  if (op === 'lte') return actual <= value;
  return actual === value;
}

/** Itens empunhados (mão principal/secundária) — armas, escudos, alquímicos. */
function getWieldedItems(sheet: CharacterSheet): Equipment[] {
  const ids = [sheet.mainHandItemId, sheet.offHandItemId].filter(
    Boolean
  ) as string[];
  if (ids.length === 0) return [];
  const eq = sheet.bag.equipments;
  const pool: Equipment[] = [
    ...(eq.Arma || []),
    ...(eq.Escudo || []),
    ...(eq.Alquimía || []),
  ];
  return pool.filter((i) => i.id && ids.includes(i.id));
}

function characterHasPower(sheet: CharacterSheet, name: string): boolean {
  const names = [
    ...(sheet.generalPowers || []).map((p) => p.name),
    ...(sheet.classPowers || []).map((p) => p.name),
    ...((sheet.origin?.powers as { name: string }[] | undefined) || []).map(
      (p) => p.name
    ),
    ...((sheet.raca?.abilities as { name: string }[] | undefined) || []).map(
      (a) => a.name
    ),
  ];
  return names.includes(name);
}

function evaluateClause(
  sheet: CharacterSheet,
  clause: BonusConditionClause
): boolean {
  switch (clause.kind) {
    case 'wearingHeavyArmor': {
      const armor = getWornArmor(
        sheet.bag.equipments.Armadura || [],
        sheet.wornArmorId
      );
      return !!armor && isHeavyArmor(armor as DefenseEquipment);
    }
    case 'wearingArmor':
      return !!getWornArmor(
        sheet.bag.equipments.Armadura || [],
        sheet.wornArmorId
      );
    case 'wieldingShield':
      return (sheet.bag.equipments.Escudo || []).some(
        (s) =>
          s.id &&
          (s.id === sheet.mainHandItemId || s.id === sheet.offHandItemId)
      );
    case 'wieldingItemNamed':
      return getWieldedItems(sheet).some((i) => i.nome === clause.value);
    case 'wieldingTwoHandedWeapon':
      return getWieldedItems(sheet).some(isTwoHanded);
    case 'wieldingMeleeWeapon':
      return getWieldedItems(sheet).some(
        (i) => i.group === 'Arma' && isWeaponMelee(i)
      );
    case 'wieldingRangedWeapon':
      return getWieldedItems(sheet).some(
        (i) => i.group === 'Arma' && !isWeaponMelee(i)
      );
    case 'dualWielding':
      return (
        !!sheet.mainHandItemId &&
        !!sheet.offHandItemId &&
        sheet.mainHandItemId !== sheet.offHandItemId
      );
    case 'level':
      return compare(sheet.nivel, clause.op, clause.value);
    case 'attribute':
      return compare(
        sheet.atributos[clause.attribute]?.value ?? 0,
        clause.op,
        clause.value
      );
    case 'isClass':
      return (
        sheet.classe.name === clause.value ||
        getClassLevel(sheet, clause.value) > 0
      );
    case 'hasPower':
      return characterHasPower(sheet, clause.value);
    case 'hasProficiency':
      return (sheet.classe.proficiencias || []).includes(clause.value);
    case 'hasSkill':
      return (sheet.skills || []).includes(clause.value);
    case 'devoteOf':
      return sheet.devoto?.divindade?.name === clause.value;
    case 'isRace':
      return sheet.raca?.name === clause.value;
    default:
      return false;
  }
}

/** Avalia a condição completa (cláusulas combinadas por AND/OR, com negação). */
export function evaluateBonusCondition(
  sheet: CharacterSheet,
  condition: BonusCondition
): boolean {
  if (!condition || !condition.clauses || condition.clauses.length === 0) {
    return true;
  }
  const results = condition.clauses.map((clause) => {
    const met = evaluateClause(sheet, clause);
    return clause.negate ? !met : met;
  });
  return condition.combinator === 'OR'
    ? results.some(Boolean)
    : results.every(Boolean);
}

/** Indica se um bônus deve ser aplicado (sem condição = sempre). */
export function isBonusActive(
  sheet: CharacterSheet,
  bonus: SheetBonus
): boolean {
  return !bonus.condition || evaluateBonusCondition(sheet, bonus.condition);
}
