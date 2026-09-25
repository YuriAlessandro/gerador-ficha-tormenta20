import _ from 'lodash';
import CharacterSheet, {
  SheetActionHistoryEntry,
  SheetActionReceipt,
} from '@/interfaces/CharacterSheet';
import { ClassAbility } from '@/interfaces/Class';
import {
  findClassDescription,
  getClassLevel,
  getClassLevelsMap,
  initializeClassLevels,
  reconcileClassLevels,
} from './multiclass';
import {
  recalculateSheet,
  reverseHistoryEntries,
  reverseSheetActionsForPower,
} from './recalculateSheet';
import { getPlateauByLevel } from './powers/general';

/**
 * Níveis de Treinador em que o Melhor Amigo aprende um truque. Espelha o
 * `COMPANION_TRICK_LEVELS` do assistente de subida de nível.
 */
const COMPANION_TRICK_LEVELS = [4, 7, 10, 13, 16, 19];
const TREINO_INTENSIVO_TRICK_LEVELS = [5, 11];

/**
 * Rótulos dos passos que a subida de nível grava depois do passo "Nível N".
 * Só esses saem ao desfazer: passos de edição manual gravados depois da subida
 * continuam no passo-a-passo.
 */
const LEVEL_UP_STEP_PREFIXES = [
  'Novo poder de ',
  'Novo poder Geral',
  'Poder de Alma Livre',
  'Novas habilidades de ',
];

export interface LastLevelSummary {
  level: number;
  className: string;
  classLevel: number;
  powers: string[];
  abilities: string[];
  spells: string[];
}

const isMarkerOf =
  (level: number) =>
  (entry: SheetActionHistoryEntry): boolean =>
    entry.source.type === 'levelUp' && entry.source.level === level;

/**
 * `classLevels` com exatamente `nivel` entradas. Fichas mono-classe antigas não
 * têm o campo; fichas cujo nível foi editado à mão podem estar dessincronizadas.
 */
function normalizedClassLevels(sheet: CharacterSheet) {
  if (!sheet.classLevels || sheet.classLevels.length === 0) {
    return initializeClassLevels(sheet);
  }
  if (sheet.classLevels.length !== sheet.nivel) {
    return reconcileClassLevels(
      sheet.classLevels,
      sheet.nivel,
      sheet.classe.name,
      sheet.classe.subname
    );
  }
  return sheet.classLevels;
}

const hasPower = (sheet: CharacterSheet, name: string) =>
  sheet.generalPowers.some((p) => p.name === name) ||
  (sheet.classPowers ?? []).some((p) => p.name === name);

export function canRevertLastLevel(sheet: CharacterSheet): boolean {
  return sheet.nivel > 1;
}

/**
 * O que o último nível concedeu, lido dos registros `levelUp` do histórico.
 * Alimenta o diálogo de confirmação. Poder e habilidade de classe são gravados
 * com o mesmo `PowerAdded`; a diferença é estar ou não numa lista de poderes.
 */
export function getLastLevelSummary(sheet: CharacterSheet): LastLevelSummary {
  const classLevels = normalizedClassLevels(sheet);
  const last = classLevels[classLevels.length - 1];
  const summary: LastLevelSummary = {
    level: sheet.nivel,
    className: last.className,
    classLevel: classLevels.filter((cl) => cl.className === last.className)
      .length,
    powers: [],
    abilities: [],
    spells: [],
  };

  sheet.sheetActionHistory.filter(isMarkerOf(sheet.nivel)).forEach((entry) =>
    entry.changes.forEach((change) => {
      if (change.type === 'PowerAdded') {
        if (hasPower(sheet, change.powerName)) {
          summary.powers.push(change.powerName);
        } else {
          summary.abilities.push(change.powerName);
        }
      } else if (change.type === 'SpellsLearned') {
        summary.spells.push(...change.spellNames);
      }
    })
  );

  return summary;
}

/**
 * Entradas do histórico gravadas pela instância de `powerName` concedida no
 * registro `markerIndex`. A subida de nível aplica o poder e só depois grava o
 * registro `levelUp`, então as entradas da instância ficam logo antes dele —
 * até o registro `levelUp` anterior.
 */
function collectInstanceEntries(
  history: SheetActionHistoryEntry[],
  markerIndex: number,
  powerName: string
): SheetActionHistoryEntry[] {
  const entries: SheetActionHistoryEntry[] = [];
  for (let i = markerIndex - 1; i >= 0; i -= 1) {
    const entry = history[i];
    if (entry.source.type === 'levelUp') break;
    if (entry.powerName === powerName) entries.unshift(entry);
  }
  return entries;
}

function removeLastByName<T extends { name: string }>(
  list: T[] | undefined,
  name: string
): boolean {
  if (!list) return false;
  const index = _.findLastIndex(list, (item) => item.name === name);
  if (index < 0) return false;
  list.splice(index, 1);
  return true;
}

/**
 * Habilidades que continuam valendo depois de desfazer o nível: as da
 * definição de cada classe até o nível que ela ainda tem, mais as que algum
 * nível anterior registrou (cobre habilidades de configuração, como a
 * linhagem do Feiticeiro, que não estão na definição da classe).
 */
function getRemainingAbilityNames(
  sheet: CharacterSheet,
  revertedLevel: number
): Set<string> {
  const names = new Set<string>();

  getClassLevelsMap(sheet).forEach((classLevel, className) => {
    const subname = sheet.classLevels?.find(
      (cl) => cl.className === className
    )?.classSubname;
    const abilities: ClassAbility[] =
      className === sheet.classe.name
        ? sheet.classe.originalAbilities ??
          findClassDescription(className, subname, sheet.supplements)
            ?.abilities ??
          []
        : findClassDescription(className, subname, sheet.supplements)
            ?.abilities ?? [];
    abilities
      .filter((ability) => ability.nivel <= classLevel)
      .forEach((ability) => names.add(ability.name));
  });

  sheet.sheetActionHistory.forEach((entry) => {
    if (entry.source.type !== 'levelUp' || entry.source.level >= revertedLevel)
      return;
    entry.changes.forEach((change) => {
      if (change.type === 'PowerAdded') names.add(change.powerName);
    });
  });

  return names;
}

type TrickReceipt = Extract<
  SheetActionReceipt,
  { type: 'CompanionTrickLearned' }
>;

const getTrickReceipt = (entry: SheetActionHistoryEntry) =>
  entry.changes.find(
    (change): change is TrickReceipt => change.type === 'CompanionTrickLearned'
  );

/**
 * Tira do Melhor Amigo o último truque registrado por `powerName`, preferindo
 * o que foi marcado com o nível desfeito. Registros antigos não têm o nível;
 * para eles vale o mais recente.
 */
function removeLastTrick(
  sheet: CharacterSheet,
  powerName: string,
  level: number
): void {
  const history = sheet.sheetActionHistory;
  const candidates = history
    .map((entry, index) => ({ index, receipt: getTrickReceipt(entry) }))
    .filter(
      ({ index, receipt }) => receipt && history[index].powerName === powerName
    );
  const tagged = candidates.filter(({ receipt }) => receipt!.level === level);
  const target = _.last(tagged.length > 0 ? tagged : candidates);
  if (!target) return;

  const receipt = target.receipt!;
  const companion = sheet.companions?.[receipt.companionIndex];
  if (companion) {
    const trickIndex = _.findLastIndex(
      companion.tricks,
      (trick) =>
        trick.name === receipt.trickName &&
        (trick.level === undefined || trick.level === level)
    );
    const tricks = [...companion.tricks];
    if (trickIndex >= 0) tricks.splice(trickIndex, 1);

    const spells = [...(companion.spells ?? [])];
    if (receipt.spellName) {
      const spellIndex = _.findLastIndex(
        spells,
        (spell) => spell.nome === receipt.spellName
      );
      if (spellIndex >= 0) spells.splice(spellIndex, 1);
    }

    sheet.companions![receipt.companionIndex] = {
      ...companion,
      tricks,
      spells,
    };
  }

  history.splice(target.index, 1);
}

/**
 * Perícias por patamar (Biblioteca Divina): ao voltar para um patamar abaixo,
 * sai a perícia concedida mais recente de cada poder que passou do total.
 */
function revertScalingSkills(sheet: CharacterSheet): void {
  const plateau = getPlateauByLevel(sheet.nivel);
  const powers = [...sheet.generalPowers, ...(sheet.devoto?.poderes ?? [])];

  powers.forEach((power) => {
    const action = power.sheetActions?.find(
      (sa) => sa.action.type === 'learnSkill' && sa.action.perTierAboveIniciante
    )?.action;
    if (!action || action.type !== 'learnSkill') return;

    const totalPick =
      action.pick + (action.perTierAboveIniciante ?? 0) * (plateau - 1);
    const entries = sheet.sheetActionHistory.filter(
      (entry) =>
        entry.powerName === power.name &&
        entry.changes.some((change) => change.type === 'SkillsAdded')
    );
    const granted = entries.flatMap((entry) =>
      entry.changes.flatMap((change) =>
        change.type === 'SkillsAdded' ? change.skills : []
      )
    );

    let excess = granted.length - totalPick;
    for (let i = entries.length - 1; i >= 0 && excess > 0; i -= 1) {
      const entry = entries[i];
      const changes = [...entry.changes];
      for (let c = changes.length - 1; c >= 0 && excess > 0; c -= 1) {
        const change = changes[c];
        if (change.type === 'SkillsAdded') {
          const skills = [...change.skills];
          while (skills.length > 0 && excess > 0) {
            const skill = skills.pop()!;
            const index = sheet.skills.lastIndexOf(skill);
            if (index >= 0) sheet.skills.splice(index, 1);
            excess -= 1;
          }
          changes[c] = { ...change, skills };
        }
      }
      entry.changes = changes;
    }
  });

  // Entradas que ficaram só com perícias vazias não registram mais nada.
  sheet.sheetActionHistory = sheet.sheetActionHistory.filter(
    (entry) =>
      entry.changes.length === 0 ||
      !entry.changes.every(
        (change) => change.type === 'SkillsAdded' && change.skills.length === 0
      )
  );
}

/**
 * Escolhas extras de habilidade racial feitas a cada subida (`chooseFromOptions`
 * com `levelUp`). São anexadas no fim de `optionChoices`, então as do último
 * nível são as últimas `pickPerLevelUp` — nunca abaixo da escolha da criação.
 */
function revertLevelUpOptionPicks(sheet: CharacterSheet): void {
  (sheet.raca.abilities ?? []).forEach((ability) =>
    (ability.sheetActions ?? []).forEach(({ action }) => {
      if (
        action.type !== 'chooseFromOptions' ||
        !action.levelUp ||
        action.levelUp.substitutes !== 'none'
      )
        return;
      const chosen = sheet.optionChoices?.[action.optionKey];
      if (!chosen) return;
      const removable = Math.min(
        action.levelUp.pickPerLevelUp,
        chosen.length - (action.pick ?? 1)
      );
      if (removable <= 0) return;
      sheet.optionChoices = {
        ...sheet.optionChoices,
        [action.optionKey]: chosen.slice(0, chosen.length - removable),
      };
    })
  );
}

function removeLevelSteps(
  sheet: CharacterSheet,
  level: number,
  className: string,
  classLevel: number
): void {
  const levelStepIndex = sheet.steps.findIndex(
    (step) => step.label === `Nível ${level}`
  );
  const abilityLabels = [
    `Novas habilidades de ${className} (Nível ${classLevel})`,
    `Novas habilidades de classe (Nível ${level})`,
  ];
  sheet.steps = sheet.steps.filter((step, index) => {
    if (index === levelStepIndex) return false;
    if (abilityLabels.includes(step.label)) return false;
    return !(
      levelStepIndex >= 0 &&
      index > levelStepIndex &&
      LEVEL_UP_STEP_PREFIXES.some((prefix) => step.label.startsWith(prefix))
    );
  });
}

/**
 * Desfaz o último nível da ficha: tira os poderes, habilidades e magias que ele
 * concedeu (lidos dos registros `levelUp` do histórico), devolve o que os
 * efeitos deles mudaram e recalcula a ficha no nível anterior.
 *
 * Fica de fora, de propósito: troca de poder de origem (Cosmopolita) — o
 * jogador corrige à mão — e itens concedidos por opções de homebrew.
 */
export function revertLastLevel(sheet: CharacterSheet): CharacterSheet {
  if (!canRevertLastLevel(sheet)) return sheet;

  const s = _.cloneDeep(sheet);
  s.classLevels = normalizedClassLevels(s);

  const level = s.nivel;
  const lastEntry = s.classLevels[s.classLevels.length - 1];
  const { className } = lastEntry;
  const classLevel = getClassLevel(s, className);
  const skillsBefore = [...s.skills];

  // 1. Poderes e magias do nível. Poder repetível com outras instâncias perde
  //    só a instância deste nível; o resto sai por inteiro.
  const history = s.sheetActionHistory;
  const markers = history.filter(isMarkerOf(level));
  const toDrop = new Set<SheetActionHistoryEntry>(markers);
  const fullyRemovedPowers: string[] = [];
  const abilityNames: string[] = [];

  markers.forEach((marker) => {
    const markerIndex = history.indexOf(marker);
    marker.changes.forEach((change) => {
      if (change.type === 'SpellsLearned') {
        change.spellNames.forEach((spellName) => {
          const index = _.findLastIndex(
            s.spells,
            (spell) => spell.nome === spellName
          );
          if (index >= 0) s.spells.splice(index, 1);
        });
        return;
      }
      if (change.type !== 'PowerAdded') return;

      const name = change.powerName;
      const removed =
        removeLastByName(s.generalPowers, name) ||
        removeLastByName(s.classPowers, name);
      if (!removed) {
        abilityNames.push(name);
        return;
      }
      if (hasPower(s, name)) {
        const instanceEntries = collectInstanceEntries(
          history,
          markerIndex,
          name
        );
        reverseHistoryEntries(s, instanceEntries, name);
        instanceEntries.forEach((entry) => toDrop.add(entry));
      } else {
        fullyRemovedPowers.push(name);
      }
    });
  });

  s.sheetActionHistory = s.sheetActionHistory.filter(
    (entry) => !toDrop.has(entry)
  );
  fullyRemovedPowers.forEach((name) => reverseSheetActionsForPower(s, name));

  // 2. Truques do Melhor Amigo ganhos no nível.
  if (className === 'Treinador') {
    const trickLevels = s.companions?.[0]?.treinoIntensivo
      ? [...COMPANION_TRICK_LEVELS, ...TREINO_INTENSIVO_TRICK_LEVELS]
      : COMPANION_TRICK_LEVELS;
    if (trickLevels.includes(classLevel)) {
      removeLastTrick(s, 'Truque do Melhor Amigo', level);
    }
  }
  const markerPowerNames = markers.flatMap((marker) =>
    marker.changes.flatMap((change) =>
      change.type === 'PowerAdded' ? [change.powerName] : []
    )
  );
  markerPowerNames
    .filter((name) => name === 'Ensinar Truque' && !abilityNames.includes(name))
    .forEach(() => removeLastTrick(s, 'Ensinar Truque', level));

  // 3. O nível sai de `classLevels`, e com ele as habilidades de classe.
  s.classLevels = s.classLevels.slice(0, -1);
  s.nivel = level - 1;

  const classStillPresent = s.classLevels.some(
    (cl) => cl.className === className
  );
  if (!classStillPresent && s.multiclassSpellPaths?.[className]) {
    s.multiclassSpellPaths = _.omit(s.multiclassSpellPaths, className);
  }

  const remainingAbilities = getRemainingAbilityNames(s, level);
  abilityNames
    .filter((name) => !remainingAbilities.has(name))
    .forEach((name) => {
      reverseSheetActionsForPower(s, name);
      if (name === 'Treino Especializado' && s.companions?.length) {
        s.companions = s.companions.slice(0, 1).map((companion) => ({
          ...companion,
          treinoIntensivo: false,
        }));
      }
    });

  // Melhor Amigo criado pelo 1º nível de Treinador numa multiclasse.
  if (className === 'Treinador' && !classStillPresent) {
    s.companions = [];
  }

  // 4. Escolhas extras de raça e perícias por patamar.
  revertLevelUpOptionPicks(s);
  if (getPlateauByLevel(s.nivel) < getPlateauByLevel(level)) {
    revertScalingSkills(s);
  }

  // 5. Passo-a-passo.
  removeLevelSteps(s, level, className, classLevel);

  // Perícia que saiu de `skills` mas ficou com treino em `completeSkills` seria
  // tratada pelo recálculo como treinada à mão.
  const removedSkills = skillsBefore.filter(
    (skill) => !s.skills.includes(skill)
  );
  if (removedSkills.length > 0 && s.completeSkills) {
    s.completeSkills = s.completeSkills.map((skill) =>
      removedSkills.includes(skill.name) ? { ...skill, training: 0 } : skill
    );
  }

  const recalculated = recalculateSheet(s, sheet);

  return {
    ...recalculated,
    currentPV:
      recalculated.currentPV === undefined
        ? undefined
        : Math.min(recalculated.currentPV, recalculated.pv),
    currentPM:
      recalculated.currentPM === undefined
        ? undefined
        : Math.min(recalculated.currentPM, recalculated.pm),
  };
}
