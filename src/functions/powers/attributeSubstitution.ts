import CharacterSheet, {
  SheetBonus,
  SheetChangeSource,
} from '../../interfaces/CharacterSheet';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import GRANTED_POWERS from '../../data/systems/tormenta20/powers/grantedPowers';

/**
 * Substituição de atributo em escopo de ficha.
 *
 * Hoje só o Usurpador usa isso, pela habilidade "Poder de Clérigo":
 * "Você substitui Sabedoria por Carisma em todos os poderes de clérigo e
 * concedidos com efeito baseado nesse atributo."
 *
 * COBERTURA — o passe reescreve os `sheetBonuses` das fontes no escopo. Poderes
 * que leem o atributo direto no código (em vez de declará-lo num `sheetBonuses`)
 * ficam de fora: hoje são `activePowers/clerigo.ts` (sabSkillsBonus),
 * `activePowers/generalGranted.ts` (Percepção Temporal) e
 * `activePowers/divineSpellsCircle2.ts`, todos no submódulo premium. Cobri-los
 * exigiria expor um helper e alterar aquele submódulo — follow-up registrado.
 *
 * O grosso do "SAB→CAR" do Usurpador, porém, já vem de graça do
 * `spellPath.keyAttribute = CARISMA`: `SpecialAttribute: 'spellKeyAttr'` e a CD
 * de magia já resolvem para Carisma sem passar por aqui.
 */

export interface AttributeSubstitutionRule {
  from: Atributo;
  to: Atributo;
  /** Só reescreve bônus cuja fonte passar por aqui. */
  appliesTo: (source: SheetChangeSource) => boolean;
}

/** Nomes de todos os poderes concedidos do core, para escopar o passe. */
const GRANTED_POWER_NAMES = new Set(
  Object.values(GRANTED_POWERS).map((power) => power.name)
);

/**
 * Regra ativa da ficha, ou `null`.
 *
 * O gate é `classe.abilities`, que `applyClassAbilities` reconstrói filtrado por
 * nível a cada recálculo — evita a armadilha do `getClassLevel`, que devolve o
 * nível TOTAL do personagem em fichas mono-classe.
 */
export function getSheetAttributeSubstitution(
  sheet: CharacterSheet
): AttributeSubstitutionRule | null {
  const hasPoderDeClerigo = !!sheet?.classe?.abilities?.some(
    (ability) => ability.name === 'Poder de Clérigo'
  );
  if (!hasPoderDeClerigo) return null;

  // Poderes de clérigo = o catálogo da classe. Para o Usurpador esse catálogo
  // JÁ é o do Clérigo, herdado pela mesclagem de classe variante no registry.
  const classPowerNames = new Set(
    (sheet.classe.powers ?? []).map((power) => power.name)
  );
  // Poderes concedidos de suplemento chegam pela própria devoção/captura da
  // ficha, então são coletados dela em vez do catálogo estático.
  const sheetGrantedNames = new Set([
    ...(sheet.devoto?.poderes ?? []).map((power) => power.name),
    ...(sheet.poderesCapturados ?? []).map((choice) => choice.poder),
  ]);

  return {
    from: Atributo.SABEDORIA,
    to: Atributo.CARISMA,
    appliesTo: (source) => {
      if (source.type === 'divinity') return true;
      if (source.type !== 'power') return false;
      return (
        classPowerNames.has(source.name) ||
        GRANTED_POWER_NAMES.has(source.name) ||
        sheetGrantedNames.has(source.name)
      );
    },
  };
}

/** Reescreve um bônus in place. Devolve `true` se mudou algo. */
function substituteInBonus(
  bonus: SheetBonus,
  rule: AttributeSubstitutionRule
): boolean {
  let changed = false;

  const { modifier, target } = bonus;

  if (
    (modifier.type === 'Attribute' || modifier.type === 'CappedAttribute') &&
    modifier.attribute === rule.from
  ) {
    modifier.attribute = rule.to;
    changed = true;
  }

  if (
    target.type === 'HPAttributeReplacement' &&
    target.newAttribute === rule.from
  ) {
    target.newAttribute = rule.to;
    changed = true;
  }

  if (
    target.type === 'ModifySkillAttribute' &&
    target.attribute === rule.from
  ) {
    target.attribute = rule.to;
    changed = true;
  }

  // `target.type === 'Attribute'` NÃO entra: isso é "+2 em Sabedoria", um bônus
  // AO atributo, não um efeito BASEADO nele. Trocar viraria "+2 em Carisma".

  return changed;
}

/**
 * Aplica a substituição sobre `sheet.sheetBonuses`, in place.
 *
 * Precisa rodar nos DOIS motores de derivação (`recalculateSheet` e
 * `applyStatModifiers`), depois de todos os bônus estarem coletados e antes de
 * eles serem consumidos.
 */
export function applyAttributeSubstitution(sheet: CharacterSheet): void {
  const rule = getSheetAttributeSubstitution(sheet);
  if (!rule) return;

  (sheet.sheetBonuses ?? []).forEach((bonus) => {
    if (!rule.appliesTo(bonus.source)) return;
    substituteInBonus(bonus, rule);
  });
}
