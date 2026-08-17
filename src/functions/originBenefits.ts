import CharacterSheet, {
  SheetActionHistoryEntry,
} from '@/interfaces/CharacterSheet';
import Origin from '@/interfaces/Origin';
import { OriginBenefit } from '@/interfaces/WizardSelections';
import { GeneralPower, OriginPower } from '@/interfaces/Poderes';
import Skill from '@/interfaces/Skills';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import {
  grantOriginItemsToBag,
  OriginItemChoices,
  removeGrantedOriginItems,
} from './originItems';

/**
 * Mantém as escolhas de item quando o jogador só editou os benefícios da MESMA
 * origem; ao trocar de origem, as escolhas antigas não fazem mais sentido.
 */
function carryOverItemChoices(
  sheet: CharacterSheet,
  origin: Origin
): OriginItemChoices | undefined {
  return sheet.origin?.name === origin.name
    ? sheet.origin?.itemChoices
    : undefined;
}

/**
 * Removes origin benefits from the character sheet
 * This includes skills, powers, sheetBonuses, sheetActionHistory and the items
 * granted by the origin (rastreados por id em `origin.grantedItemIds`).
 */
export function removeOriginBenefits(sheet: CharacterSheet): CharacterSheet {
  const updatedSheet = removeGrantedOriginItems(sheet);

  // Get origin power names for filtering
  const originPowerNames = sheet.origin?.powers?.map((p) => p.name) || [];

  // Predicado único: uma entrada veio da origem se a `source` diz `origin`, ou
  // se é `power` com o nome de um poder DESTA origem. O segundo ramo é
  // indispensável — nem todo poder de origem carimba `type: 'origin'` (o Duplo
  // Feérico gravava `power`), e fichas antigas já têm o histórico persistido
  // com o valor errado. Se a entrada sobreviver à troca de origem, o
  // `isActionAlreadyApplied` de `applyPower` continua verdadeiro e o poder vira
  // um no-op silencioso ao ser reaplicado.
  const isFromOrigin = (entry: SheetActionHistoryEntry) =>
    entry.source?.type === 'origin' ||
    (entry.source?.type === 'power' &&
      originPowerNames.includes(entry.source.name));

  // If we have selectedBenefits, remove those skills
  if (sheet.origin?.selectedBenefits) {
    const skillsToRemove = sheet.origin.selectedBenefits
      .filter((b) => b.type === 'skill')
      .map((b) => b.name);

    updatedSheet.skills = sheet.skills.filter(
      (skill) => !skillsToRemove.includes(skill)
    );
  }

  // Remove sheetBonuses that came from origin or from origin powers
  if (sheet.sheetBonuses) {
    updatedSheet.sheetBonuses = sheet.sheetBonuses.filter((bonus) => {
      // Remove bonuses from origin source
      if (bonus.source?.type === 'origin') {
        return false;
      }
      // Remove bonuses from origin powers
      if (
        bonus.source?.type === 'power' &&
        originPowerNames.includes(bonus.source.name)
      ) {
        return false;
      }
      return true;
    });
  }

  // Remove class powers that were granted by origin sheetActions
  // (ex.: Futura Lenda via ClassPowerAdded, Duplo Feérico via ClassAbilityLearned)
  const classPowersFromOrigin = (sheet.sheetActionHistory || [])
    .filter(isFromOrigin)
    .flatMap((entry) => entry.changes)
    .map((change) => {
      if (change.type === 'ClassAbilityLearned') {
        // Mesmo formato composto usado ao inserir em classPowers (general.ts)
        return `${change.abilityName} (${change.className})`;
      }
      if (change.type === 'ClassPowerAdded' || change.type === 'PowerAdded') {
        return change.powerName;
      }
      return undefined;
    })
    .filter((name): name is string => name !== undefined);

  if (sheet.sheetActionHistory && classPowersFromOrigin.length > 0) {
    updatedSheet.classPowers = (sheet.classPowers || []).filter(
      (p) => !classPowersFromOrigin.includes(p.name)
    );
  }

  // Desfaz os `ModifyAttribute` que a origem aplicou (ex.: o +1 Constituição de
  // "Cria da Favela"). Tem que ser AQUI, antes do filtro abaixo: as entradas do
  // histórico são descartadas na sequência, e o recibo grava o valor ABSOLUTO
  // pós-aplicação — o delta só sai do DADO do poder. Gateado pelo histórico:
  // só desfaz o que de fato chegou a ser aplicado.
  const attributeDeltas = new Map<Atributo, number>();
  (sheet.origin?.powers ?? []).forEach((power) => {
    const wasApplied = (sheet.sheetActionHistory ?? []).some(
      (entry) =>
        entry.powerName === power.name &&
        entry.changes.some((change) => change.type === 'Attribute')
    );
    if (!wasApplied) return;
    (power.sheetActions ?? []).forEach((sheetAction) => {
      if (sheetAction.action.type !== 'ModifyAttribute') return;
      const { attribute, value } = sheetAction.action;
      attributeDeltas.set(
        attribute,
        (attributeDeltas.get(attribute) ?? 0) + value
      );
    });
  });
  if (attributeDeltas.size > 0) {
    // Cópia: `updatedSheet` é spread raso de `sheet`; mutar `atributos` in
    // place alteraria também a ficha de entrada.
    updatedSheet.atributos = { ...updatedSheet.atributos };
    attributeDeltas.forEach((delta, attribute) => {
      updatedSheet.atributos[attribute] = {
        ...updatedSheet.atributos[attribute],
        value: updatedSheet.atributos[attribute].value - delta,
      };
    });
  }

  // Remove sheetActionHistory entries that came from origin. Inclui as ações
  // ANINHADAS do que a origem concedeu — a escolha da Especialista aprendida
  // pelo Duplo Feérico é carimbada com o nome composto do poder, não com o da
  // origem, e sobreviver aqui faria o `isActionAlreadyApplied` congelar a
  // escolha antiga na próxima vez que a origem fosse aplicada.
  if (sheet.sheetActionHistory) {
    updatedSheet.sheetActionHistory = sheet.sheetActionHistory.filter(
      (entry) =>
        !isFromOrigin(entry) &&
        !(entry.powerName && classPowersFromOrigin.includes(entry.powerName))
    );
  }

  // Remove general powers that came from origin benefits
  if (sheet.origin?.selectedBenefits) {
    const powerBenefitNames = sheet.origin.selectedBenefits
      .filter((b) => b.type === 'power')
      .map((b) => b.name);

    // General powers from origin = power benefits NOT in origin.powers
    const generalPowerNamesFromOrigin = powerBenefitNames.filter(
      (name) => !originPowerNames.includes(name)
    );

    if (generalPowerNamesFromOrigin.length > 0) {
      updatedSheet.generalPowers = (sheet.generalPowers || []).filter(
        (p) => !generalPowerNamesFromOrigin.includes(p.name)
      );
    }
  }

  // Remove origin powers
  updatedSheet.origin = undefined;

  return updatedSheet;
}

/**
 * Applies origin benefits to the character sheet based on selected benefits
 *
 * NOTE: Items are NOT added to the bag because Bag uses a complex BagEquipments structure
 * that requires proper grouping by category (Arma, Armadura, etc.). This would require
 * significant refactoring. For now, origin items should be manually added by the user.
 */
export function applyOriginBenefits(
  sheet: CharacterSheet,
  origin: Origin,
  selectedBenefits: OriginBenefit[]
): CharacterSheet {
  const updatedSheet = { ...sheet };

  // Get used skills for origin.getPowersAndSkills
  const usedSkills: Skill[] = sheet.skills;

  // Get all available benefits (returnAllOptions = true to get full list for matching)
  const originBenefits = origin.getPowersAndSkills
    ? origin.getPowersAndSkills(usedSkills, origin, true)
    : {
        powers: {
          origin: origin.poderes.filter(
            (p) => p.type === 'ORIGEM'
          ) as OriginPower[],
          general: [],
          generalPowers: origin.poderes.filter(
            (p) => p.type !== 'ORIGEM'
          ) as GeneralPower[],
        },
        skills: origin.pericias,
      };

  // Initialize origin object
  const originPowers: OriginPower[] = [];

  // Apply selected benefits
  selectedBenefits.forEach((benefit) => {
    switch (benefit.type) {
      case 'skill': {
        // Add skill if not already present
        const skillExists = updatedSheet.skills.some((s) => s === benefit.name);
        if (!skillExists) {
          updatedSheet.skills = [...updatedSheet.skills, benefit.name as Skill];
        }
        break;
      }

      // `item` não é mais um benefício: itens de origem são concedidos de graça
      // por `applyOriginItemChoices`, sem consumir um dos 2 slots. Fichas antigas
      // ainda podem trazer entradas 'item' em selectedBenefits — caem no default.

      case 'power': {
        // Check if it's an origin power
        const power = originBenefits.powers.origin.find(
          (p) => p.name === benefit.name
        );
        if (power) {
          originPowers.push(power);
        } else {
          // It's a general power selected as an origin benefit
          const generalPower = (originBenefits.powers.generalPowers || []).find(
            (p) => p.name === benefit.name
          );
          if (
            generalPower &&
            !updatedSheet.generalPowers.some(
              (p) => p.name === generalPower.name
            )
          ) {
            updatedSheet.generalPowers = [
              ...updatedSheet.generalPowers,
              generalPower,
            ];
          }
        }
        break;
      }

      default:
        break;
    }
  });

  // Itens da origem: concedidos de graça, sem consumir slot de benefício.
  const itemChoices = carryOverItemChoices(sheet, origin);
  const grantedItemIds = grantOriginItemsToBag(updatedSheet.bag, origin, {
    choices: itemChoices,
  });

  // Update origin with powers and selected benefits
  updatedSheet.origin = {
    name: origin.name,
    powers: originPowers,
    selectedBenefits,
    itemChoices,
    grantedItemIds,
  };

  return updatedSheet;
}

/**
 * For regional origins, automatically grants all benefits (skills, powers e itens)
 */
export function applyRegionalOriginBenefits(
  sheet: CharacterSheet,
  origin: Origin
): CharacterSheet {
  if (!origin.isRegional) {
    throw new Error(
      'applyRegionalOriginBenefits should only be called for regional origins'
    );
  }

  const updatedSheet = { ...sheet };

  // Get used skills
  const usedSkills: Skill[] = sheet.skills;

  // Get all benefits
  const originBenefits = origin.getPowersAndSkills
    ? origin.getPowersAndSkills(usedSkills, origin)
    : {
        powers: { origin: origin.poderes as OriginPower[], general: [] },
        skills: origin.pericias,
      };

  // Add all skills
  originBenefits.skills.forEach((skill) => {
    const skillExists = updatedSheet.skills.some((s) => s === skill);
    if (!skillExists) {
      updatedSheet.skills = [...updatedSheet.skills, skill as Skill];
    }
  });

  // NOTE: Items are not added to bag (see note in applyOriginBenefits)

  // Poderes gerais concedidos automaticamente (ex.: origem homebrew "receber
  // tudo" com poderes gerais no pool).
  (originBenefits.powers.generalPowers || []).forEach((generalPower) => {
    if (!updatedSheet.generalPowers.some((p) => p.name === generalPower.name)) {
      updatedSheet.generalPowers = [
        ...updatedSheet.generalPowers,
        generalPower,
      ];
    }
  });

  // Itens da origem regional (podem incluir escolhas, ex.: Escudeiro da Luz)
  const itemChoices = carryOverItemChoices(sheet, origin);
  const grantedItemIds = grantOriginItemsToBag(updatedSheet.bag, origin, {
    choices: itemChoices,
  });

  // Set origin with all powers
  updatedSheet.origin = {
    name: origin.name,
    powers: originBenefits.powers.origin,
    // Regional origins don't need selectedBenefits since all are granted
    itemChoices,
    grantedItemIds,
  };

  return updatedSheet;
}
