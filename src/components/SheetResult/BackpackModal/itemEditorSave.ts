import Equipment, {
  AppliedEnchantment,
  AppliedModification,
  ManualStatField,
  AttackAttribute,
  DamageAttribute,
  DamageType,
  DefenseEquipment,
  ExtraDamage,
  WeaponAction,
  WeaponCategory,
} from '../../../interfaces/Equipment';
import Skill from '../../../interfaces/Skills';
import { DiceRoll } from '../../../interfaces/DiceRoll';
import { ItemE, ItemMod } from '../../../interfaces/Rewards';
import { dataRegistry } from '../../../data/registry';
import {
  MaterialContext,
  toAppliedEnchantment,
  toAppliedModification,
  withMaterialSnapshot,
} from '../../../functions/itemEnhancements/snapshot';
import { isDefenseGroup } from './equipmentCatalog';
import { formatDamageTypes } from './damageTypeSelect';
import { getManualStatFields } from '../../../functions/manualStats';

/**
 * Campos que o jogador pode sobrescrever à mão no editor, congelando o
 * recálculo automático a partir dos snapshots `base*`.
 *
 * `spaces` faz parte do conjunto mas NÃO do grupo de stats de combate: ele tem
 * a sua própria flag persistida (`hasManualSpaces`), para uma edição de espaço
 * não congelar `dano`/`atkBonus`/`critico` junto.
 */
export type StatField =
  | 'dano'
  | 'atkBonus'
  | 'critico'
  | 'defenseBonus'
  | 'armorPenalty'
  | 'spaces';

/**
 * Shape of the ItemEditorDialog form state. Kept here (not in the dialog) so the
 * pure `buildSavedItem` composition can be unit-tested without React.
 */
export interface ItemEditorFormState {
  customDisplayName: string;
  quantityText: string;
  spacesText: string;
  descricao: string;
  rolls: DiceRoll[];
  danoText: string;
  atkBonusText: string;
  criticoText: string;
  customSkill: Skill | '';
  damageAttribute: DamageAttribute;
  // '' = usa o atributo da própria perícia rolada (comportamento padrão).
  // Diferente de `damageAttribute`, que sempre carrega um atributo concreto.
  attackAttribute: AttackAttribute | '';
  // '' = herda a categoria do catálogo (via getEffectiveWeaponCategory);
  // para itens custom, '' = sem categoria = sempre proficiente.
  weaponCategory: WeaponCategory | '';
  damageTypes: DamageType[];
  // Só grava `tipo` a partir de `damageTypes` quando o jogador de fato mexeu
  // no seletor — o parser de `tipo` legado (string livre) pode não reconhecer
  // todos os tokens, e sobrescrever sem essa guarda perderia dado ao salvar
  // uma edição que nem tocou no tipo (ex.: só mudou o Dano).
  damageTypesTouched: boolean;
  weaponTags: string[];
  actionDamageAttributes: Record<string, DamageAttribute>;
  actionAttackAttributes: Record<string, AttackAttribute | ''>;
  defenseBonusText: string;
  armorPenaltyText: string;
  isHeavyArmor: boolean;
  selectedModifications: ItemMod[];
  selectedMaterial: string;
  selectedEnchantments: ItemE[];
  selectedConjuradoraSpell: string;
  userExtraDamage: {
    id: string;
    dice: string;
    damageType: DamageType;
    source: 'user';
  }[];
}

/**
 * Builds the persisted Equipment from the editor form, BEFORE running the
 * enhancement pipeline (`applyItemEnhancements`). Pure — no React, no side
 * effects — so the save composition is directly testable.
 *
 * Stat fields (`dano`/`atkBonus`/`critico` for weapons, `defenseBonus`/
 * `armorPenalty` for armor & shields) are written from the form ONLY when the
 * user manually edited that stat group. When untouched, the fields inherit the
 * item's current values and the enhancement pipeline recomputes them from the
 * `base*` snapshots. Writing the form's (preview) values on an untouched item
 * would let `captureBaseValues` snapshot an already base+delta value as the new
 * base, double-applying the modification (e.g. Reforçada +2/+2 instead of +1/+1).
 *
 * `spaces` segue a mesma lógica por outra via: o valor sempre é gravado, mas a
 * flag `hasManualSpaces` (que faz `applyDelta` parar de reescrever o espaço a
 * partir de `baseSpaces`) só é ligada quando o jogador mexeu no campo.
 */
/**
 * Lista de estatísticas editadas à mão depois deste save: o que já estava
 * marcado no item mais o que o jogador digitou agora.
 */
function mergeManualStatFields(
  item: Equipment,
  group: ManualStatField[],
  touchedFields: Set<StatField>
): ManualStatField[] {
  const previous = getManualStatFields(item);
  return group.filter(
    (field) => previous.has(field) || touchedFields.has(field)
  );
}

export function buildSavedItem(
  item: Equipment,
  form: ItemEditorFormState,
  manualEditedFields: Set<StatField>,
  // Campos digitados nesta sessão do editor. Só eles ENTRAM na lista
  // `manualStatFields` (o que a ficha marca); `manualEditedFields` inclui o
  // grupo restaurado ao reabrir um item já congelado. Sem argumento, os dois
  // são a mesma coisa — é o caso de quem chama fora do editor.
  touchedFields: Set<StatField> = manualEditedFields
): Equipment {
  const isWeapon = item.group === 'Arma';
  const isDefense = isDefenseGroup(item.group);

  const quantity = Math.max(1, parseInt(form.quantityText, 10) || 1);

  // Campo de texto livre: sem a guarda de NaN, um "abc" gravaria `spaces: NaN`,
  // que vira `null` no JSON do histórico e quebra o total da mochila.
  const spacesManual = manualEditedFields.has('spaces');
  const parsedSpaces = parseFloat(form.spacesText.replace(',', '.'));
  const spaces =
    form.spacesText === '' || Number.isNaN(parsedSpaces)
      ? item.spaces
      : Math.max(0, parsedSpaces);

  // Melhorias e encantos de conteúdo não-core carregam o efeito no próprio
  // dado; ele é congelado aqui para o item sobreviver à desativação da fonte.
  const materialContext: MaterialContext | undefined =
    (isWeapon && 'weapon') || (isDefense && 'defense') || undefined;
  const material = form.selectedMaterial
    ? dataRegistry.getSpecialMaterialByName(form.selectedMaterial)
    : undefined;

  const persistedMods: AppliedModification[] = form.selectedModifications.map(
    (m) => {
      const applied = toAppliedModification(
        m,
        m.mod === 'Material especial' ? form.selectedMaterial : undefined
      );
      if (m.mod !== 'Material especial' || !materialContext) return applied;
      return withMaterialSnapshot(applied, material, materialContext);
    }
  );

  const persistedEnchantments: AppliedEnchantment[] =
    form.selectedEnchantments.map((e) =>
      toAppliedEnchantment(
        e,
        e.enchantment === 'Conjuradora' && form.selectedConjuradoraSpell
          ? form.selectedConjuradoraSpell
          : undefined
      )
    );

  const persistedUserExtraDamage: ExtraDamage[] = form.userExtraDamage
    .filter((e) => e.dice.trim().length > 0)
    .map((e) => ({
      id: e.id,
      dice: e.dice.trim(),
      damageType: e.damageType,
      source: 'user' as const,
    }));

  const next: Equipment = {
    ...item,
    customDisplayName: form.customDisplayName.trim() || undefined,
    quantity,
    spaces,
    // Independente de `hasManualEdits`: só congela o espaço, não os stats.
    hasManualSpaces: spacesManual ? true : undefined,
    descricao: form.descricao.trim() || undefined,
    rolls: form.rolls.length > 0 ? form.rolls : undefined,
    modifications: persistedMods.length > 0 ? persistedMods : undefined,
    enchantments:
      persistedEnchantments.length > 0 ? persistedEnchantments : undefined,
    // Replace user extra damage; derived entries are regenerated by
    // applyItemEnhancements downstream.
    extraDamage:
      persistedUserExtraDamage.length > 0
        ? persistedUserExtraDamage
        : undefined,
  };

  const weaponStatTouched =
    manualEditedFields.has('dano') ||
    manualEditedFields.has('atkBonus') ||
    manualEditedFields.has('critico');
  const defenseStatTouched =
    manualEditedFields.has('defenseBonus') ||
    manualEditedFields.has('armorPenalty');

  if (isWeapon) {
    if (weaponStatTouched) {
      const atkBonus = parseInt(form.atkBonusText, 10);
      next.dano = form.danoText.trim() || item.dano;
      next.atkBonus = Number.isNaN(atkBonus) ? item.atkBonus : atkBonus;
      next.critico = form.criticoText.trim() || item.critico;
    }
    next.customSkill = (form.customSkill || undefined) as Skill | undefined;
    next.damageAttribute = form.damageAttribute;
    // Campos semânticos (como customSkill): gravados sempre, sem marcar
    // hasManualEdits — não congelam os bônus automáticos da arma.
    next.attackAttribute = form.attackAttribute || undefined;
    next.weaponCategory =
      form.weaponCategory === '' ? undefined : form.weaponCategory;
    if (form.damageTypesTouched) {
      next.tipo = formatDamageTypes(form.damageTypes);
    }
    next.weaponTags = form.weaponTags.length > 0 ? form.weaponTags : undefined;
    if (item.specialActions && item.specialActions.length > 0) {
      next.specialActions = item.specialActions.map((action) => {
        const damageOverride = form.actionDamageAttributes[action.id];
        const attackOverride = form.actionAttackAttributes?.[action.id];
        const nextAction: WeaponAction = { ...action };
        // Strip from the action when it matches the resolved-from-weapon
        // default — keeps the saved object clean.
        if (damageOverride) nextAction.damageAttribute = damageOverride;
        nextAction.attackAttribute = attackOverride || undefined;
        return nextAction;
      });
    }
    next.hasManualEdits = weaponStatTouched ? true : undefined;
    // A flag congela o grupo inteiro, mas a ficha marca só o campo digitado —
    // por isso a lista é gravada além dela.
    next.manualStatFields = weaponStatTouched
      ? mergeManualStatFields(
          item,
          ['dano', 'atkBonus', 'critico'],
          touchedFields
        )
      : undefined;
  }

  let finalItem: Equipment = next;

  if (isDefense) {
    const defenseNext: DefenseEquipment = {
      ...(next as DefenseEquipment),
      isHeavyArmor: item.group === 'Armadura' ? form.isHeavyArmor : undefined,
    };
    if (defenseStatTouched) {
      const defenseBonus = parseInt(form.defenseBonusText, 10);
      const armorPenalty = parseInt(form.armorPenaltyText, 10);
      defenseNext.defenseBonus = Number.isNaN(defenseBonus)
        ? (item as DefenseEquipment).defenseBonus
        : defenseBonus;
      defenseNext.armorPenalty = Number.isNaN(armorPenalty)
        ? (item as DefenseEquipment).armorPenalty
        : armorPenalty;
    }
    defenseNext.hasManualEdits = defenseStatTouched ? true : undefined;
    defenseNext.manualStatFields = defenseStatTouched
      ? mergeManualStatFields(
          item,
          ['defenseBonus', 'armorPenalty'],
          touchedFields
        )
      : undefined;
    finalItem = defenseNext;
  }

  return finalItem;
}
