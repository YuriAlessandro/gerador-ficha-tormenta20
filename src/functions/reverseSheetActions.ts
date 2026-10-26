import _ from 'lodash';
import CharacterSheet, {
  SheetActionHistoryEntry,
  SheetActionReceipt,
} from '@/interfaces/CharacterSheet';
import Equipment, { BagEquipments } from '@/interfaces/Equipment';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import { GeneralPower } from '@/interfaces/Poderes';
import { ClassPower } from '@/interfaces/Class';
import {
  buildRemoveAppendedSpellSchoolUpdates,
  spellSchoolFromLabel,
} from './spells/spellSchoolEditing';

/**
 * Reverses attribute modifications. Recibos novos trazem o `delta`; nos
 * antigos o valor somado é deduzido da primeira entrada do poder.
 */
function reverseAttributeChange(
  sheet: CharacterSheet,
  change: Extract<SheetActionReceipt, { type: 'Attribute' }>,
  powerName: string
): void {
  const { attribute } = change;
  if (change.delta !== undefined) {
    sheet.atributos[attribute].value -= change.delta;
    return;
  }

  const relevantHistory = sheet.sheetActionHistory.find(
    (entry) =>
      entry.powerName === powerName &&
      entry.changes.some(
        (c) => c.type === 'Attribute' && c.attribute === attribute
      )
  );
  const attributeChange = relevantHistory?.changes.find(
    (c) => c.type === 'Attribute' && c.attribute === attribute
  );
  if (attributeChange?.type !== 'Attribute') return;

  if (attributeChange.delta !== undefined) {
    sheet.atributos[attribute].value -= attributeChange.delta;
  } else {
    const originalValue = sheet.atributos[attribute].value;
    const modificationValue = attributeChange.value - originalValue;
    sheet.atributos[attribute].value -= modificationValue;
  }
}

function removeFirst<T>(
  list: T[] | undefined,
  predicate: (item: T) => boolean
) {
  if (!list) return;
  const index = list.findIndex(predicate);
  if (index > -1) list.splice(index, 1);
}

/**
 * Tira da mochila os itens concedidos pela ação (arma natural de Dentes
 * Afiados, Ataque Desarmado do Estilo Desarmado...). O `addEquipment` da
 * mochila funde itens de mesmo nome, então um item que outra entrada VIVA do
 * histórico também concedeu fica — e volta à versão dessa fonte (ex.: a
 * Mordida 1d6 do Gnoll, que a 1d4 de Dentes Afiados tinha sobrescrito).
 */
function reverseEquipmentAdded(
  sheet: CharacterSheet,
  equipment: Partial<BagEquipments>,
  reverting: SheetActionHistoryEntry[]
): void {
  if (!sheet.bag?.equipments) return;

  const grantedElsewhere = (group: string, nome: string) =>
    sheet.sheetActionHistory
      .filter((entry) => !reverting.includes(entry))
      .flatMap((entry) => entry.changes)
      .flatMap((c) =>
        c.type === 'EquipmentAdded'
          ? (c.equipment as Record<string, Equipment[] | undefined>)[group] ??
            []
          : []
      )
      .find((item) => item?.nome === nome);

  const equipments = {
    ...sheet.bag.equipments,
  } as unknown as Record<string, Equipment[]>;
  const restored: Record<string, Equipment[]> = {};
  let changed = false;
  Object.entries(equipment as Record<string, Equipment[] | undefined>).forEach(
    ([group, items]) => {
      const current = equipments[group];
      if (!Array.isArray(current) || !items) return;
      const names: string[] = [];
      items.forEach((item) => {
        if (!item?.nome) return;
        const survivor = grantedElsewhere(group, item.nome);
        const inBag = current.find((eq) => eq?.nome === item.nome);
        if (!survivor) names.push(item.nome);
        else if (inBag && !_.isMatch(inBag, survivor)) {
          restored[group] = [...(restored[group] ?? []), survivor];
        }
      });
      const kept = current.filter((eq) => !names.includes(eq?.nome));
      if (kept.length !== current.length) {
        equipments[group] = kept;
        changed = true;
      }
    }
  );
  const hasRestored = Object.keys(restored).length > 0;
  if (!changed && !hasRestored) return;

  const next = equipments as unknown as BagEquipments;
  if (typeof sheet.bag.setEquipments === 'function') {
    sheet.bag.setEquipments(next);
    if (hasRestored) {
      sheet.bag.addEquipment(restored as unknown as Partial<BagEquipments>);
    }
  } else {
    sheet.bag.equipments = next;
  }
}

/**
 * Desfaz UMA mudança registrada no histórico. Único ponto de reversão: usado
 * por `reverseHistoryEntries` (remover poder no editor, reverter nível,
 * reconfigurar raça) e por `reversePowerActions`.
 *
 * `reverting` são as entradas que estão sendo desfeitas juntas — ainda
 * presentes em `sheet.sheetActionHistory` (quem chama remove depois).
 *
 * Sem reversão, de propósito: `TrainedSkillsMarked` (só registro),
 * `FamiliarSelected` e `WeaponSpecializationSelected` (só vivem no histórico e
 * em `sheetBonuses`, que o recálculo refaz), `MoneySpent` e
 * `CompanionTrickLearned` (o `revertLastLevel` trata à parte) e
 * `MaxSpacesAttributeSet`.
 */
export function reverseSheetActionChange(
  sheet: CharacterSheet,
  change: SheetActionReceipt,
  powerName: string,
  reverting: SheetActionHistoryEntry[] = []
): void {
  switch (change.type) {
    case 'Attribute':
      reverseAttributeChange(sheet, change, powerName);
      break;

    case 'ProficiencyAdded':
      removeFirst(sheet.classe.proficiencias, (p) => p === change.proficiency);
      break;

    case 'SkillsAdded':
      change.skills.forEach((skill) =>
        removeFirst(sheet.skills, (s) => s === skill)
      );
      break;

    // Perícia que já era treinada recebeu só +2, que vive em `sheetBonuses`
    // e o recálculo não reaplica sem a entrada do histórico.
    case 'SkillTrainedOrBonused':
      if (!change.alreadyTrained) {
        removeFirst(sheet.skills, (s) => s === change.skill);
      }
      break;

    case 'SenseAdded':
      removeFirst(sheet.sentidos, (s) => s === change.sense);
      break;

    case 'EquipmentAdded':
      reverseEquipmentAdded(sheet, change.equipment, reverting);
      break;

    case 'PowerAdded':
      removeFirst(sheet.generalPowers, (p) => p.name === change.powerName);
      break;

    case 'ClassPowerAdded':
      removeFirst(sheet.classPowers, (p) => p.name === change.powerName);
      break;

    // Habilidade de outra classe aprendida (ex.: origem "Duplo Feérico").
    // Sem isso a entrada fica órfã em classPowers e o applyClassPowers
    // reaplica os sheetBonuses dela em todo recálculo, para sempre.
    case 'ClassAbilityLearned': {
      const composedName = `${change.abilityName} (${change.className})`;
      removeFirst(sheet.classPowers, (p) => p.name === composedName);
      // Ações ANINHADAS da habilidade aprendida (ex.: as perícias da
      // Especialista) são carimbadas com o nome composto — se sobreviverem,
      // o `isActionAlreadyApplied` congela a escolha antiga.
      sheet.sheetActionHistory = sheet.sheetActionHistory.filter(
        (entry) => entry.powerName !== composedName
      );
      break;
    }

    case 'SpellsLearned':
      change.spellNames.forEach((spellName) =>
        removeFirst(sheet.spells, (spell) => spell.nome === spellName)
      );
      break;

    // A magia do animal totêmico entra com atributo-chave Sabedoria; prefere
    // essa cópia caso a mesma magia também tenha sido aprendida por outra via.
    case 'AnimalTotemSelected': {
      if (!change.spellName || !sheet.spells) break;
      const totemIndex = _.findLastIndex(
        sheet.spells,
        (spell) =>
          spell.nome === change.spellName &&
          spell.customKeyAttr === Atributo.SABEDORIA
      );
      const index =
        totemIndex > -1
          ? totemIndex
          : _.findLastIndex(
              sheet.spells,
              (spell) => spell.nome === change.spellName
            );
      if (index > -1) sheet.spells.splice(index, 1);
      break;
    }

    case 'AttributeIncreasedByAumentoDeAtributo':
      sheet.atributos[change.attribute].value -= 1;
      break;

    // O texto e os bônus da opção vêm do histórico, que sai junto; só a escola
    // acrescentada às da classe (Xamã Místico) fica gravada no `spellPath`.
    case 'OptionChosen': {
      const school = change.appendedSpellSchoolTo
        ? spellSchoolFromLabel(change.chosenName)
        : undefined;
      if (change.appendedSpellSchoolTo && school) {
        Object.assign(
          sheet,
          buildRemoveAppendedSpellSchoolUpdates(
            sheet,
            change.appendedSpellSchoolTo,
            school
          )
        );
      }
      break;
    }

    default:
      break;
  }
}

/**
 * Removes all sheet bonuses that were applied by a specific power
 */
function removeSheetBonusesFromPower(
  sheet: CharacterSheet,
  powerName: string
): void {
  // Remove all sheet bonuses that came from this power
  sheet.sheetBonuses = sheet.sheetBonuses.filter(
    (bonus) => bonus.source.type !== 'power' || bonus.source.name !== powerName
  );
}

/**
 * Reverses all sheet actions that were applied by a specific power
 */
export function reversePowerActions(
  sheet: CharacterSheet,
  powerName: string
): CharacterSheet {
  const updatedSheet = _.cloneDeep(sheet);

  // 1. Remove sheet bonuses from this power first
  removeSheetBonusesFromPower(updatedSheet, powerName);

  // 2. Find all history entries for this power
  const powerHistoryEntries = updatedSheet.sheetActionHistory.filter(
    (entry) => entry.powerName === powerName
  );

  // 3. Reverse each action in reverse order (LIFO)
  [...powerHistoryEntries].reverse().forEach((historyEntry) => {
    historyEntry.changes.forEach((change) => {
      reverseSheetActionChange(
        updatedSheet,
        change,
        powerName,
        powerHistoryEntries
      );
    });
  });

  // 4. Remove history entries for this power
  updatedSheet.sheetActionHistory = updatedSheet.sheetActionHistory.filter(
    (entry) => entry.powerName !== powerName
  );

  return updatedSheet;
}

/**
 * Reverses multiple powers at once
 */
export function reverseMultiplePowerActions(
  sheet: CharacterSheet,
  powerNames: string[]
): CharacterSheet {
  return powerNames.reduce(
    (acc, powerName) => reversePowerActions(acc, powerName),
    sheet
  );
}

/**
 * Gets a list of powers that were removed from the sheet
 */
export function getRemovedPowers(
  originalPowers: (GeneralPower | ClassPower)[],
  newPowers: (GeneralPower | ClassPower)[]
): string[] {
  const originalNames = originalPowers.map((p) => p.name);
  const newNames = newPowers.map((p) => p.name);

  return originalNames.filter((name) => !newNames.includes(name));
}

/**
 * Gets a list of powers that were added to the sheet
 */
export function getAddedPowers(
  originalPowers: (GeneralPower | ClassPower)[],
  newPowers: (GeneralPower | ClassPower)[]
): string[] {
  const originalNames = originalPowers.map((p) => p.name);
  const newNames = newPowers.map((p) => p.name);

  return newNames.filter((name) => !originalNames.includes(name));
}
