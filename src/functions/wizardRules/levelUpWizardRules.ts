/**
 * Regras do assistente de subir de nível em funções puras: que passos cada
 * nível tem e quando cada um tem a escolha completa.
 *
 * Moravam dentro do `LevelUpWizardModal` (`getSteps`/`isStepComplete`).
 * Saíram para cá para que o assistente e o motor sem sorteio (Builds v2)
 * usem a MESMA regra. O que depende de interface (lista de poderes para
 * escolher, ficha com as habilidades do nível projetadas) ficou no componente.
 */
import CharacterSheet from '@/interfaces/CharacterSheet';
import {
  LevelUpSelections,
  ClassSetupSelection,
} from '@/interfaces/WizardSelections';
import {
  ClassAbility,
  ClassDescription,
  ClassPower,
  ClassPowerGrant,
} from '@/interfaces/Class';
import {
  GeneralPower,
  OriginPower,
  RequirementType,
} from '@/interfaces/Poderes';
import { Spell } from '@/interfaces/Spells';
import { CompanionSheet } from '@/interfaces/Companion';
import { ManualPowerSelections } from '@/interfaces/PowerSelections';
import {
  getAllowedClassPowers,
  getCharacterPowerNames,
  getForeignClassPowers,
  getOwnedGeneralPowers,
  getWaivedClassPowers,
  isPowerAvailable,
  resolveClassPowerCatalog,
} from '@/functions/powers';
import { getActiveWaivers } from '@/functions/powers/prerequisiteWaivers';
import { applyPower } from '@/functions/general';
import { dataRegistry } from '@/data/registry';
import { SupplementId } from '@/types/supplement.types';
import {
  getPowerSelectionRequirements,
  getFilteredAvailableOptions,
  countRequirementSelections,
  isRequirementApplicable,
  resolvePowerRequirements,
  resolveLearnSkillRemainingPick,
  ResolvedRequirement,
} from '@/functions/powers/manualPowerSelection';
import {
  getCurrentPlateau,
  getPlateauByLevel,
  getDeityMaxSpellCircleFor,
} from '@/functions/powers/general';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import { getEffectiveAttributeModifier } from '@/functions/effectiveAttributes';
import {
  getClassLevel,
  findClassDescription,
  buildSpellPathFromSetup,
  serializeSpellPath,
  applySerializedOverrides,
  getClassSetupAbilities,
  getBaseAbilitiesForLevelUp,
  resolveClassSetup,
  classSetupNeedsRecovery,
  classNeedsFirstLevelSetup,
} from '@/functions/multiclass';
import {
  partitionCrossTraditionByCircle,
  buildSpellPool,
  countTowardsCrossMinimum,
  getSchoolChoiceConfig,
} from '@/functions/spellPathUtils';
import { getPendingAppendedSchools } from '@/functions/spells/spellSchoolEditing';
import {
  countNaturalWeapons,
  getCompanionTrickDefinition,
  getTrickAvailability,
  isTrickChoiceComplete,
} from '@/data/systems/tormenta20/herois-de-arton/companion';
import {
  ENGENHOQUEIRO_POWER,
  buildEngenhocaSpellPool,
  countEngenhocas,
  getEngenhocaLimit,
  getMaxEngenhocaCircle,
  hasEngenhoqueiro,
} from '@/functions/spells/engenhoca';
import { WizardStepGap } from './types';

export interface LevelUpWizardInput {
  /** Ficha ANTES deste nível (o `simulatedSheet` do assistente). */
  sheet: CharacterSheet;
  /** Ficha em que o assistente abriu (devoção: teto de círculo). */
  initialSheet: CharacterSheet;
  /** Nível sendo montado. */
  level: number;
  selection: LevelUpSelections;
  supplements: SupplementId[];
  /** Flag de multiclasse ligada (mostra o passo "Escolha de Classe"). */
  multiclassEnabled: boolean;
}

export interface LevelUpWizardContext extends LevelUpWizardInput {
  selectedClassName: string;
  selectedClassSubname?: string;
  /** Nível da classe escolhida DEPOIS deste nível. */
  selectedClassLevel: number;
  selectedClassDesc?: ClassDescription;
  /** `sheet` com `nivel` já no nível sendo montado. */
  sheetForCurrentLevel: CharacterSheet;
  resolvedClassSetup?: ClassSetupSelection;
  /** Multiclasse: 1º nível numa classe nova (não concede poder). */
  isFirstLevelInNewClass: boolean;
  recoveringLinhagemDeus: boolean;
  classNeedsUserSetup: boolean;
}

/** Uma opção de uma ação `chooseFromOptions`. */
export interface RaceLevelUpPickOption {
  name: string;
  text: string;
  repeatable?: boolean;
}

/** Uma habilidade de raça que concede novas escolhas ao subir de nível. */
export interface RaceLevelUpPick {
  optionKey: string;
  abilityName: string;
  options: RaceLevelUpPickOption[];
  pickPerLevelUp: number;
}

export interface LevelUpSpellInfo {
  shouldLearnSpells: boolean;
  spellCount: number;
  spellCircle: number;
  availableSpells: Spell[];
  crossTraditionSpellNames: Set<string>;
  sharedTraditionSpellNames: Set<string>;
  crossTraditionLabel: string;
  crossTraditionLimit?: number;
  minCrossTraditionSpells: number;
}

export interface LevelUpEngenhocaInfo {
  availableSpells: Spell[];
  maxCircle: number;
  slots: number;
  money: number;
  maxAprimoramentoPm: number;
}

// Treinador nível 5: escolha de Treino Especializado
export const TREINO_ESPECIALIZADO = 'Treino Especializado';
export const CONQUISTAR_PELOS_NUMEROS = 'Conquistar pelos Números';
export const TREINO_INTENSIVO = 'Treino Intensivo';

/** Escolha (pendente) de Treino Especializado feita em 'Efeitos de Habilidades'. */
export const getTreinoEspecializadoChoice = (
  sel: LevelUpSelections
): string | undefined =>
  sel.abilityEffectSelections?.[TREINO_ESPECIALIZADO]?.chosenOption?.[0];

/**
 * A concessão de poder da classe neste nível.
 *
 * `powerGrants` ausente = padrão de T20 (todo nível a partir do 2º concede um
 * poder da própria classe), representado por `undefined` aqui e tratado como
 * "concede, da própria classe" por quem chama.
 */
export function findPowerGrant(
  classDesc: ClassDescription | undefined,
  level: number
): ClassPowerGrant | undefined {
  return classDesc?.powerGrants?.find((grant) => grant.level === level);
}

/** A classe concede escolha de poder neste nível? */
export function classGrantsPowerAtLevel(
  classDesc: ClassDescription | undefined,
  level: number
): boolean {
  if (!classDesc?.powerGrants) return true;
  return !!findPowerGrant(classDesc, level);
}

/** O poder escolhido no nível, conforme o tipo de escolha. */
export function getSelectedLevelUpPower(
  sel: LevelUpSelections
): ClassPower | GeneralPower | undefined {
  if (sel.powerChoice === 'class') return sel.selectedClassPower;
  if (sel.powerChoice === 'almaLivre') return sel.selectedAlmaLivrePower;
  return sel.selectedGeneralPower;
}

export function buildLevelUpWizardContext(
  input: LevelUpWizardInput
): LevelUpWizardContext {
  const { sheet, level, selection, supplements } = input;
  const selectedClassName = selection.selectedClassName || sheet.classe.name;
  const { selectedClassSubname } = selection;
  const selectedClassLevel = getClassLevel(sheet, selectedClassName) + 1; // +1 because we're adding this level
  const selectedClassDesc = findClassDescription(
    selectedClassName,
    selectedClassSubname,
    supplements
  );
  const isFirstLevelInNewClass =
    selectedClassLevel === 1 && selectedClassName !== sheet.classe.name;
  // Classes that require user choices during first-level setup (variant-aware)
  const recoveringLinhagemDeus = classSetupNeedsRecovery(
    sheet,
    selectedClassName,
    selectedClassLevel
  );

  return {
    ...input,
    selectedClassName,
    selectedClassSubname,
    selectedClassLevel,
    selectedClassDesc,
    // simulatedSheet.nivel lags behind on the first level-up of each session
    sheetForCurrentLevel: { ...sheet, nivel: level },
    // Setup da classe secundária: o do nível corrente ou o gravado na ficha
    // no 1º nível dela (o poder concedido da Linhagem Abençoada sai no 2º).
    resolvedClassSetup: resolveClassSetup(
      sheet,
      selectedClassName,
      selection.classSetup
    ),
    isFirstLevelInNewClass,
    recoveringLinhagemDeus,
    classNeedsUserSetup:
      (isFirstLevelInNewClass &&
        !!selectedClassDesc &&
        classNeedsFirstLevelSetup(selectedClassDesc)) ||
      recoveringLinhagemDeus,
  };
}

/**
 * Habilidades da classe que está subindo de nível. As injetadas no setup
 * (linhagens do Feiticeiro) vivem na FICHA, não na entrada do registry.
 */
export function getLevelUpMergedAbilities(
  ctx: LevelUpWizardContext
): ClassAbility[] {
  return [
    ...getBaseAbilitiesForLevelUp(
      ctx.sheet.classe,
      ctx.selectedClassDesc,
      ctx.selectedClassName
    ),
    ...getClassSetupAbilities(ctx.selectedClassName, ctx.resolvedClassSetup),
  ];
}

/** Só as que estreiam neste nível de CLASSE (importa na multiclasse). */
export function getLevelUpAbilitiesForLevel(
  ctx: LevelUpWizardContext
): ClassAbility[] {
  return getLevelUpMergedAbilities(ctx).filter(
    (ability) => ability.nivel === ctx.selectedClassLevel
  );
}

/**
 * O poder tem algum grupo de pré-requisitos cuja exigência de NÍVEL já está
 * cumprida?
 *
 * Usado para decidir quais poderes de classe reprovados ainda vale a pena
 * listar como "Indisponível": os travados só pelo nível ficam de fora, senão a
 * lista de um personagem de 2º nível viraria o catálogo inteiro da classe até
 * o 20º. Grupo sem requisito de NÍVEL conta como alcançável.
 */
const hasReachableLevelRequirement = (
  power: ClassPower,
  classLevel: number
): boolean => {
  const groups = power.requirements;
  if (!groups || groups.length === 0) return true;

  return groups.some((group) =>
    group.every(
      (rule) =>
        rule.type !== RequirementType.NIVEL || (rule.value ?? 0) <= classLevel
    )
  );
};

/**
 * A ficha do nível com as habilidades que estreiam nele já aplicadas (as sem
 * escolha) ou projetadas: é contra ela que o passo "Escolha de Poder" avalia
 * os pré-requisitos.
 */
export function getLevelUpSheetWithAbilities(
  ctx: LevelUpWizardContext,
  baseSheet: CharacterSheet = ctx.sheetForCurrentLevel
): CharacterSheet {
  const abilitiesThisLevel = getLevelUpAbilitiesForLevel(ctx);
  if (abilitiesThisLevel.length === 0) return baseSheet;

  let nextSheet = baseSheet;

  abilitiesThisLevel.forEach((ability) => {
    const requirements = getPowerSelectionRequirements(ability);
    if (requirements !== null) return;

    const [abilitySheet] = applyPower(nextSheet, {
      ...ability,
      sourceClassName: ctx.selectedClassName,
    });
    if (abilitySheet) {
      nextSheet = {
        ...abilitySheet,
        classe: {
          ...abilitySheet.classe,
          abilities: nextSheet.classe.abilities,
        },
      };
    }
  });

  const knownAbilityNames = new Set(
    (nextSheet.classe.abilities || []).map((ability) => ability.name)
  );
  const projectedAbilities = abilitiesThisLevel.filter(
    (ability) => !knownAbilityNames.has(ability.name)
  );

  if (projectedAbilities.length === 0) return nextSheet;

  return {
    ...nextSheet,
    classe: {
      ...nextSheet.classe,
      abilities: [...nextSheet.classe.abilities, ...projectedAbilities],
    },
  };
}

/** Poderes de classe e gerais que o passo "Escolha de Poder" lista. */
export interface LevelUpPowerOptions {
  classPowers: ClassPower[];
  generalPowers: GeneralPower[];
  unavailableClassPowers: string[];
  unavailableGeneralPowers: string[];
  /**
   * A ficha contra a qual os poderes foram filtrados. Sai junto para o passo
   * reavaliar os requisitos com ela: em multiclasse ela difere da ficha de
   * seleção (leva a classe escolhida e suas proficiências), e avaliar com a
   * outra faria as duas pontas discordarem sobre o mesmo poder.
   */
  sheetForFiltering: CharacterSheet;
}

/**
 * Poderes do passo "Escolha de Poder": os disponíveis e, desabilitados, os
 * reprovados por pré-requisito. `allowAll` é o interruptor "fora dos
 * requisitos" do passo.
 */
export function getLevelUpPowerOptions(
  ctx: LevelUpWizardContext,
  sheetForPowerSelection: CharacterSheet,
  { allowAll = false }: { allowAll?: boolean } = {}
): LevelUpPowerOptions {
  const {
    selectedClassName,
    selectedClassDesc,
    selectedClassLevel,
    supplements,
  } = ctx;
  // Get class with merged supplement powers from registry
  // Use the SELECTED class for power filtering (multiclass support)
  const classNameForPowers = selectedClassName;
  const classWithSupplementPowers = dataRegistry.getClassByName(
    classNameForPowers,
    supplements
  );

  // Create a sheet with the selected class powers for filtering
  const classForFiltering = classWithSupplementPowers || selectedClassDesc;
  const sheetForFiltering: CharacterSheet = classForFiltering
    ? {
        ...sheetForPowerSelection,
        classe: {
          ...sheetForPowerSelection.classe,
          name: classNameForPowers,
          powers: classForFiltering.powers,
          proficiencias:
            sheetForPowerSelection.classe.proficiencias ||
            classForFiltering.proficiencias ||
            [],
        },
      }
    : sheetForPowerSelection;

  // Get class powers using the selected class's powers.
  // Sempre usar getAllowedClassPowers na lista manual: a ponderação do
  // Inventor (getWeightedInventorClassPowers) expande a lista com entradas
  // duplicadas, o que só faz sentido em sorteio aleatório — numa seleção
  // manual geraria poderes repetidos. Cobre Inventor e suas variantes
  // (ex.: Alquimista) via sheetForFiltering.classe.powers.
  // Concessão declarada pela classe (Vassalo): os poderes vêm do catálogo de
  // OUTRA classe, avaliados no nível do personagem. Sem declaração, vale o
  // catálogo da própria classe, como em toda classe padrão.
  const grant = findPowerGrant(selectedClassDesc, selectedClassLevel);
  const classPowers = grant
    ? getForeignClassPowers(
        sheetForFiltering,
        grant.fromClasses,
        sheetForPowerSelection.nivel,
        grant.excludePowers
      )
    : getAllowedClassPowers(sheetForFiltering, {
        classLevel: selectedClassLevel,
      });

  // Poder de classe reprovado por pré-requisito continua na lista, apenas
  // desabilitado e com o requisito à mostra — igual ao tratamento dos poderes
  // gerais logo abaixo. Antes ele simplesmente sumia, sem nenhum sinal do
  // motivo: foi assim que a substituição de Ofício do Artesão Criativo
  // falhando em silêncio chegou como "não dá pra pegar, tem que pôr manual".
  const allowedClassPowerNames = new Set(classPowers.map((p) => p.name));
  const knownClassPowerNames = new Set(
    (sheetForFiltering.classPowers || []).map((p) => p.name)
  );
  const unavailableClassPowers: string[] = [];
  const fullClassCatalog: ClassPower[] = grant
    ? // Numa concessão emprestada o catálogo completo é o das classes de
      // origem, avaliado no nível do PERSONAGEM; avaliar contra o da ficha
      // listaria poder de outra classe. `className` carimbado aqui também, e
      // não só nos disponíveis: sem ele o agrupamento cai no nome da classe
      // da FICHA, e um poder de Cavaleiro que o Vassalo não alcança aparecia
      // sob "Poder de Vassalo".
      grant.fromClasses.flatMap((className) =>
        (
          findClassDescription(className, undefined, supplements)?.powers ?? []
        ).map((power) => ({ ...power, className }))
      )
    : // Entram na varredura também os poderes de OUTRA classe alcançados por
      // um waiver (ex.: Domínio do Medo), que não estão no catálogo da classe.
      [
        ...resolveClassPowerCatalog(sheetForFiltering),
        ...getWaivedClassPowers(
          sheetForFiltering,
          getActiveWaivers(sheetForFiltering)
        ),
      ];
  const levelForCut = grant ? sheetForPowerSelection.nivel : selectedClassLevel;
  const blockedClassPowers = fullClassCatalog.filter((power) => {
    if (allowedClassPowerNames.has(power.name)) return false;
    // Já conhecido e não repetível some, como sempre — quem sinaliza isso é
    // o chip "Já Conhecido" dos poderes que continuam na lista.
    if (knownClassPowerNames.has(power.name) && !power.canRepeat) {
      return false;
    }
    // Com o filtro desligado o corte de nível sai também: meio-quebrar a regra
    // (liberar atributo/perícia mas não nível) confunde mais que quebrar
    // inteiro. Desligado, segue escondendo o catálogo até o 20º nível.
    if (!allowAll && !hasReachableLevelRequirement(power, levelForCut)) {
      return false;
    }
    unavailableClassPowers.push(power.name);
    return true;
  });

  // Use dataRegistry to get powers from all active supplements.
  // Inclui os 5 tipos de poderes gerais, mais os poderes de raça (ex.: Glamour)
  // que o personagem qualifica — poderes de raça só aparecem para quem atende
  // ao requisito de raça, evitando poluir a lista com poderes de outras raças.
  const allPowers = dataRegistry.getPowersBySupplements(supplements);
  const allGeneralPowers = [
    ...allPowers.COMBATE,
    ...allPowers.CONCEDIDOS,
    ...allPowers.DESTINO,
    ...allPowers.MAGIA,
    ...allPowers.TORMENTA,
    ...allPowers.RACA.filter((power) =>
      isPowerAvailable(sheetForFiltering, power)
    ),
  ];

  // Track which powers are unavailable (requirements not met)
  const existingGeneralPowers = getOwnedGeneralPowers(sheetForFiltering);
  const unavailableGeneralPowers: string[] = [];
  const generalPowers = allGeneralPowers.filter((power) => {
    const isRepeatedPower = existingGeneralPowers.find(
      (existingPower) => existingPower.name === power.name
    );

    if (isRepeatedPower && !power.allowSeveralPicks) {
      return true; // Keep in list; isPowerKnown handles disable in UI
    }

    if (!isPowerAvailable(sheetForFiltering, power)) {
      unavailableGeneralPowers.push(power.name);
    }
    return true; // Always include
  });

  // Sort powers alphabetically
  const sortedClassPowers = [...classPowers, ...blockedClassPowers].sort(
    (a, b) => a.name.localeCompare(b.name, 'pt-BR')
  );
  const sortedGeneralPowers = [...generalPowers].sort((a, b) =>
    a.name.localeCompare(b.name, 'pt-BR')
  );

  return {
    classPowers: sortedClassPowers,
    generalPowers: sortedGeneralPowers,
    unavailableClassPowers,
    unavailableGeneralPowers,
    sheetForFiltering,
  };
}

/**
 * Companheiro com os truques pendentes da OUTRA razão (auto/power) deste
 * nível projetados sobre os truques já na ficha — evita escolher o mesmo
 * truque não-repetível nos dois passos do mesmo nível.
 */
export function getProjectedCompanion(
  ctx: LevelUpWizardContext,
  reason: 'auto' | 'power',
  companionIndex: number
): CompanionSheet | undefined {
  const base = ctx.sheet.companions?.[companionIndex];
  if (!base) return undefined;
  const pendingFromOtherStep = (ctx.selection.companionTrickSelections || [])
    .filter((e) => e.reason !== reason && e.companionIndex === companionIndex)
    .map((e) => e.trick);
  if (pendingFromOtherStep.length === 0) return base;
  return { ...base, tricks: [...base.tricks, ...pendingFromOtherStep] };
}

/** Magias aprendidas neste nível (usa o spellPath da classe escolhida). */
export function getLevelUpSpellInfo(
  ctx: LevelUpWizardContext
): LevelUpSpellInfo | null {
  const {
    sheet,
    initialSheet,
    selection,
    supplements,
    selectedClassName,
    selectedClassSubname,
    selectedClassLevel,
    selectedClassDesc,
    resolvedClassSetup,
    isFirstLevelInNewClass,
  } = ctx;
  // For first level in new class, build spellPath from setup choices
  let spellPath;
  if (isFirstLevelInNewClass) {
    spellPath = buildSpellPathFromSetup(
      selectedClassName,
      selectedClassSubname,
      selection.classSetup,
      supplements
    );
  } else {
    const activeClassDesc = selectedClassDesc || sheet.classe;
    // Check multiclassSpellPaths for secondary caster classes (spellPath stored from setup)
    const storedPath = sheet.multiclassSpellPaths?.[selectedClassName];
    if (storedPath && activeClassDesc.name !== sheet.classe.name) {
      // Rebuild full SpellPath with functions from the stored serializable data
      // O subtipo do Arcanista vem do setup gravado: sem ele o registry
      // cai no setup() aleatório e sorteia Mago/Bruxo/Feiticeiro.
      spellPath = buildSpellPathFromSetup(
        storedPath.className,
        storedPath.classSubname,
        { ...resolvedClassSetup, spellSchools: storedPath.schools },
        supplements
      );
      if (spellPath) applySerializedOverrides(spellPath, storedPath);
    } else {
      // sheet.classe.spellPath has setup() applied (at creation and
      // rehydrated on load); selectedClassDesc from dataRegistry does not.
      const isLevelingMainClass = activeClassDesc.name === sheet.classe.name;
      spellPath = isLevelingMainClass
        ? sheet.classe.spellPath || activeClassDesc.spellPath || null
        : activeClassDesc.spellPath || null;
    }
  }
  if (!spellPath) {
    return null;
  }

  // Defesa: uma ficha carregada quando a classe não estava disponível chega
  // com o spellPath sem as funções. Tenta reconstruir pelo registry (todos os
  // suplementos) preservando os campos gravados; se não der, pula o passo.
  if (typeof spellPath.qtySpellsLearnAtLevel !== 'function') {
    const rebuilt = buildSpellPathFromSetup(
      selectedClassName,
      selectedClassSubname,
      { spellSchools: spellPath.schools },
      undefined
    );
    if (rebuilt) {
      applySerializedOverrides(
        rebuilt,
        serializeSpellPath(spellPath, selectedClassName, selectedClassSubname)
      );
    }
    spellPath = rebuilt;
  }
  if (
    !spellPath ||
    typeof spellPath.qtySpellsLearnAtLevel !== 'function' ||
    typeof spellPath.spellCircleAvailableAtLevel !== 'function'
  ) {
    return null;
  }

  // Use CLASS level for spell progression, not character level
  // For first level in new class via multiclass, use initialSpells
  let spellCount;
  if (isFirstLevelInNewClass && spellPath.initialSpells > 0) {
    spellCount = spellPath.initialSpells;
  } else {
    spellCount = spellPath.qtySpellsLearnAtLevel(selectedClassLevel);
  }

  if (spellCount === 0) {
    return null; // No spells this level
  }

  // Devoto de deus menor: a divindade limita o círculo, mesmo que o nível já
  // desse acesso a círculos superiores.
  const levelCircle = spellPath.spellCircleAvailableAtLevel(selectedClassLevel);
  const deityMaxCircle = getDeityMaxSpellCircleFor(
    initialSheet.devoto?.divindade?.statusDivino,
    spellPath.spellType
  );
  const spellCircle =
    deityMaxCircle === null
      ? levelCircle
      : Math.min(levelCircle, deityMaxCircle);

  // Poderes que destravam círculos da tradição oposta (Herança
  // Aprimorada/Superior). Inclui a escolha PENDENTE deste nível.
  const pendingPowerName =
    selection.powerChoice === 'class'
      ? selection.selectedClassPower?.name
      : selection.selectedGeneralPower?.name;
  const ownedPowerNames = [
    ...getCharacterPowerNames(sheet),
    ...(pendingPowerName ? [pendingPowerName] : []),
  ];

  // Escola adicional escolhida NESTE nível (Xamã Místico): as magias dela já
  // entram no pool. Sem `schools`, a classe aprende de todas.
  const pendingSchools = getPendingAppendedSchools(
    getSelectedLevelUpPower(selection),
    selection.powerEffectSelections,
    selectedClassDesc || sheet.classe
  );
  if (pendingSchools.length > 0 && spellPath.schools) {
    spellPath = {
      ...spellPath,
      schools: Array.from(new Set([...spellPath.schools, ...pendingSchools])),
    };
  }

  const pool = buildSpellPool({
    spellPath,
    maxCircle: spellCircle,
    supplements,
    ownedPowerNames,
  });
  let poolSpells = pool.spells;
  const { crossNamesByCircle } = pool;

  // Teurgista Místico: aplica o limite POR CÍRCULO.
  let { crossNames } = pool;
  if (spellPath.crossTraditionLimit && crossNamesByCircle.size > 0) {
    const { removeNames, keepNames } = partitionCrossTraditionByCircle(
      crossNamesByCircle,
      sheet.spells.map((s) => s.nome),
      spellPath.crossTraditionLimit
    );
    if (removeNames.size > 0) {
      poolSpells = poolSpells.filter((s) => !removeNames.has(s.nome));
    }
    crossNames = keepNames;
  }

  // Filter out spells already known
  const knownSpellNames = sheet.spells.map((s) => s.nome);
  const availableSpells = poolSpells.filter(
    (s) => !knownSpellNames.includes(s.nome)
  );

  return {
    shouldLearnSpells: true,
    spellCount,
    spellCircle,
    availableSpells,
    crossTraditionSpellNames: crossNames,
    sharedTraditionSpellNames: pool.sharedNames,
    crossTraditionLabel: spellPath.spellType === 'Arcane' ? 'Divina' : 'Arcana',
    crossTraditionLimit: spellPath.crossTraditionLimit,
    // Linhagem Abençoada: uma das magias iniciais tem que ser divina. Só no
    // 1º nível da classe, como na criação.
    minCrossTraditionSpells: isFirstLevelInNewClass
      ? spellPath.crossTraditionRules?.minInitialSpells ?? 0
      : 0,
  };
}

/** O poder escolhido precisa de escolhas de efeito? */
export function levelUpNeedsPowerEffectSelections(
  ctx: LevelUpWizardContext
): boolean {
  const power =
    ctx.selection.powerChoice === 'class'
      ? ctx.selection.selectedClassPower
      : ctx.selection.selectedGeneralPower;

  if (!power) return false;

  const requirements = getPowerSelectionRequirements(power);
  return requirements !== null && requirements.requirements.length > 0;
}

/** As habilidades de classe deste nível precisam de escolhas de efeito? */
export function levelUpNeedsAbilityEffectSelections(
  ctx: LevelUpWizardContext
): boolean {
  return getLevelUpAbilitiesForLevel(ctx).some((ability) => {
    const requirements = getPowerSelectionRequirements(ability);
    // Requisitos de outro caminho (Vassalo Soldado x Governante) não pedem
    // nada — sem o filtro o passo aparecia vazio.
    return (requirements?.requirements ?? []).some((requirement) =>
      isRequirementApplicable(requirement, ctx.sheetForCurrentLevel)
    );
  });
}

/**
 * Habilidades de raça que concedem novas escolhas ao subir de nível (config
 * `levelUp` na ação `chooseFromOptions`). Só o caso ADITIVO
 * (`substitutes === 'none'`).
 */
export function getLevelUpRacePicks(
  ctx: LevelUpWizardContext
): RaceLevelUpPick[] {
  const abilities = ctx.sheet.raca?.abilities || [];
  const result: RaceLevelUpPick[] = [];
  abilities.forEach((ability) => {
    (ability.sheetActions || []).forEach((sheetAction) => {
      const { action } = sheetAction;
      if (
        action.type === 'chooseFromOptions' &&
        action.levelUp &&
        action.levelUp.substitutes === 'none' &&
        action.levelUp.pickPerLevelUp > 0 &&
        action.options.length > 0
      ) {
        result.push({
          optionKey: action.optionKey,
          abilityName: ability.name,
          pickPerLevelUp: action.levelUp.pickPerLevelUp,
          options: action.options.map((o) => ({
            name: o.name,
            text: o.text,
            repeatable: o.repeatable,
          })),
        });
      }
    });
  });
  return result;
}

/**
 * Poderes concedidos já na ficha que ganham mais perícias por patamar (ex.:
 * Biblioteca Divina). Só quando ESTE nível cruza um patamar.
 */
export function getLevelUpScalingPowers(
  ctx: LevelUpWizardContext
): GeneralPower[] {
  const oldPlateau = getPlateauByLevel(ctx.sheet.nivel);
  const newPlateau = getCurrentPlateau(ctx.sheetForCurrentLevel);
  if (newPlateau <= oldPlateau) return [];

  // Poderes concedidos por divindade (ex.: Biblioteca Divina) NÃO ficam em
  // `generalPowers` — moram em `devoto.poderes`, um campo separado.
  return [
    ...(ctx.sheet.generalPowers || []),
    ...(ctx.sheet.devoto?.poderes || []),
  ].filter((power) =>
    power.sheetActions?.some(
      (sa) => sa.action.type === 'learnSkill' && sa.action.perTierAboveIniciante
    )
  );
}

/**
 * Poderes de origem cujo texto prevê trocar o poder escolhido entre
 * aventuras (Cosmopolita, Citadino Abastado).
 */
export function getLevelUpSwappableOriginPowers(
  ctx: LevelUpWizardContext
): OriginPower[] {
  return (ctx.sheet.origin?.powers ?? []).filter(
    (power) =>
      power.swappableAtLevelUp && getPowerSelectionRequirements(power) !== null
  );
}

/**
 * Fabricação de engenhocas neste nível (JdA p. 70), ou `null` quando o passo
 * não se aplica: sem Engenhoqueiro (na ficha ou escolhido agora), sem vaga
 * no limite ou sem magia para fabricar.
 */
export function getLevelUpEngenhocaInfo(
  ctx: LevelUpWizardContext
): LevelUpEngenhocaInfo | null {
  const {
    sheet,
    selection,
    supplements,
    selectedClassName,
    selectedClassLevel,
    sheetForCurrentLevel,
  } = ctx;
  const pendingPower = getSelectedLevelUpPower(selection);
  const pendingNames = pendingPower ? [pendingPower.name] : [];
  if (!hasEngenhoqueiro(sheet) && !pendingNames.includes(ENGENHOQUEIRO_POWER)) {
    return null;
  }

  const inventorLevel =
    selectedClassName === 'Inventor'
      ? selectedClassLevel
      : getClassLevel(sheet, 'Inventor');
  const maxCircle = getMaxEngenhocaCircle(inventorLevel);
  const slots =
    getEngenhocaLimit(sheetForCurrentLevel, pendingNames) -
    countEngenhocas(sheet.spells ?? []);
  if (slots <= 0) return null;

  // Magia aprendida neste mesmo nível também já é "da ficha".
  const learnedNow = new Set(
    (selection.spellsLearned ?? []).map((s) => s.nome)
  );
  const availableSpells = buildEngenhocaSpellPool(sheet, maxCircle, supplements)
    .filter((spell) => !learnedNow.has(spell.nome))
    .sort((a, b) => a.nome.localeCompare(b.nome));
  if (availableSpells.length === 0) return null;

  return {
    availableSpells,
    maxCircle,
    slots,
    money: sheet.dinheiro ?? 0,
    maxAprimoramentoPm: Math.max(
      0,
      getEffectiveAttributeModifier(sheetForCurrentLevel, Atributo.INTELIGENCIA)
    ),
  };
}

// Treinador: truque do parceiro nos níveis 4, 7, 10, 13, 16, 19
const COMPANION_TRICK_LEVELS = [4, 7, 10, 13, 16, 19];

/** Passos do nível, na ordem em que o assistente os mostra. */
export function getLevelUpSteps(ctx: LevelUpWizardContext): string[] {
  const {
    sheet,
    selection,
    multiclassEnabled,
    classNeedsUserSetup,
    isFirstLevelInNewClass,
    selectedClassName,
    selectedClassLevel,
    selectedClassDesc,
  } = ctx;
  const steps: string[] = [];
  // Multiclass: add class selection step if feature is enabled (even for non-supporters)
  if (multiclassEnabled) {
    steps.push('Escolha de Classe');
  }
  // Multiclass: class setup step for classes needing user choices (Arcanista, Bardo, Druida)
  if (classNeedsUserSetup) {
    steps.push('Configuração da Classe');
  }
  steps.push('Ganhos do Nível');

  // Multiclasse: primeiro nível de Treinador exige criação do Melhor Amigo
  if (
    isFirstLevelInNewClass &&
    selectedClassName === 'Treinador' &&
    !sheet.companions?.length
  ) {
    steps.push('Melhor Amigo');
  }

  // First level in a new class (multiclass) grants no power.
  // Classes com `powerGrants` (Vassalo) só concedem poder em certos níveis.
  if (
    !isFirstLevelInNewClass &&
    classGrantsPowerAtLevel(selectedClassDesc, selectedClassLevel)
  ) {
    steps.push('Escolha de Poder');

    if (levelUpNeedsPowerEffectSelections(ctx)) {
      steps.push('Efeitos do Poder');
    }
  }

  if (levelUpNeedsAbilityEffectSelections(ctx)) {
    steps.push('Efeitos de Habilidades');
  }

  // Treinador 5: Conquistar pelos Números concede um segundo melhor amigo
  const treinoChoice = getTreinoEspecializadoChoice(selection);
  if (
    selectedClassName === 'Treinador' &&
    selectedClassLevel === 5 &&
    sheet.companions?.length &&
    treinoChoice === CONQUISTAR_PELOS_NUMEROS
  ) {
    steps.push('Segundo Melhor Amigo');
  }

  if (getLevelUpRacePicks(ctx).length > 0) {
    steps.push('Escolhas de Raça');
  }

  if (getLevelUpScalingPowers(ctx).length > 0) {
    steps.push('Perícias por Patamar');
  }

  if (getLevelUpSwappableOriginPowers(ctx).length > 0) {
    steps.push('Benefício da Origem');
  }

  const spellInfo = getLevelUpSpellInfo(ctx);
  if (spellInfo && spellInfo.shouldLearnSpells) {
    steps.push('Seleção de Magias');
  }

  if (getLevelUpEngenhocaInfo(ctx)) {
    steps.push('Engenhocas');
  }

  // Treino Intensivo: truque extra nos níveis 5 e 11 (a escolha pendente do
  // próprio nível 5 também conta, antes de ser refletida na ficha)
  const hasTreinoIntensivo =
    sheet.companions?.[0]?.treinoIntensivo ||
    (selectedClassName === 'Treinador' &&
      selectedClassLevel === 5 &&
      treinoChoice === TREINO_INTENSIVO);
  const allTrickLevels = hasTreinoIntensivo
    ? [...COMPANION_TRICK_LEVELS, 5, 11]
    : COMPANION_TRICK_LEVELS;
  if (
    selectedClassName === 'Treinador' &&
    allTrickLevels.includes(selectedClassLevel) &&
    sheet.companions?.length
  ) {
    steps.push('Truque do Melhor Amigo');
  }

  // Treinador: poder "Ensinar Truque" concede um truque adicional
  if (
    selection.powerChoice === 'class' &&
    selection.selectedClassPower?.name === 'Ensinar Truque' &&
    sheet.companions?.length
  ) {
    steps.push('Truque do Melhor Amigo (Ensinar Truque)');
  }

  return steps;
}

/**
 * Toda escolha exigida foi feita? Compartilhado pelos passos "Efeitos do
 * Poder", "Perícias por Patamar" e "Efeitos de Habilidades", que derivam os
 * requisitos do MESMO `resolvePowerRequirements` que o
 * `PowerEffectSelectionStep` usa para desenhar os seletores.
 */
export function areLevelUpRequirementsSatisfied(
  ctx: LevelUpWizardContext,
  requirements: ResolvedRequirement[],
  allSelections: ManualPowerSelections
): boolean {
  const { sheetForCurrentLevel } = ctx;
  return requirements.every(({ selectionKey, ownerName, requirement: req }) => {
    const { type } = req;
    const effectSelections = allSelections[selectionKey] || {};

    // Requisição declarada opcional (ex.: Arma Amada) nunca bloqueia
    if (req.optional) return true;

    // Golpe Pessoal usa um construtor próprio e tem availableOptions vazio
    // por design — exige que um build tenha sido montado pelo usuário.
    if (type === 'buildGolpePessoal') {
      return !!effectSelections.golpePessoalBuild;
    }

    // Check available options - if none available, consider requirement satisfied
    const availableOptions = getFilteredAvailableOptions(
      req,
      sheetForCurrentLevel
    );
    if (availableOptions.length === 0) return true;

    // If fewer options than required, adjust the effective pick count.
    // `resolveLearnSkillRemainingPick` escala o piso declarado pelo patamar
    // atual e subtrai o que o histórico já concedeu (Biblioteca Divina e
    // similares); para os demais tipos devolve `pick`.
    const effectivePick = Math.min(
      resolveLearnSkillRemainingPick(
        req,
        getCurrentPlateau(sheetForCurrentLevel),
        sheetForCurrentLevel,
        ownerName
      ),
      availableOptions.length
    );

    const count = countRequirementSelections(
      req,
      effectSelections,
      sheetForCurrentLevel.atributos[Atributo.INTELIGENCIA]?.value ?? 0
    );
    // Tipo não contável: não bloquear o assistente
    if (count === null) return true;

    return count >= effectivePick;
  });
}

/** O passo `stepName` do nível tem a escolha completa? */
export function isLevelUpStepComplete(
  ctx: LevelUpWizardContext,
  stepName: string
): boolean {
  const {
    selection,
    selectedClassName,
    selectedClassLevel,
    selectedClassDesc,
  } = ctx;

  switch (stepName) {
    case 'Escolha de Classe':
      return !!selection.selectedClassName;

    case 'Configuração da Classe': {
      const setup = selection.classSetup;
      if (!setup) return false;
      if (selectedClassName === 'Arcanista') {
        if (!setup.arcanistaSubtype) return false;
        if (setup.arcanistaSubtype === 'Feiticeiro') {
          if (!setup.feiticeiroLinhagem) return false;
          if (
            setup.feiticeiroLinhagem === 'Linhagem Dracônica' &&
            !setup.draconicaDamageType
          )
            return false;
          if (
            setup.feiticeiroLinhagem === 'Linhagem Abençoada' &&
            !setup.linhagemAbencoadaDeus
          )
            return false;
        }
        return true;
      }
      const schoolChoice = selectedClassDesc
        ? getSchoolChoiceConfig(selectedClassDesc)
        : null;
      if (schoolChoice) {
        return setup.spellSchools?.length === schoolChoice.count;
      }
      return true;
    }

    case 'Ganhos do Nível':
      return true;

    case 'Escolha de Poder':
      return (
        (selection.powerChoice === 'class' &&
          selection.selectedClassPower !== undefined) ||
        (selection.powerChoice === 'general' &&
          selection.selectedGeneralPower !== undefined) ||
        (selection.powerChoice === 'almaLivre' &&
          selection.selectedAlmaLivrePower !== undefined)
      );

    case 'Efeitos do Poder': {
      const power = getSelectedLevelUpPower(selection);
      if (!power) return false;

      // Get selections keyed by power name
      const allEffectSelections = selection.powerEffectSelections || {};

      // Mesma coleta que o `PowerEffectSelectionStep` usa para desenhar os
      // seletores — inclui as escolhas exigidas pelos poderes concedidos.
      const requirements = resolvePowerRequirements(power, allEffectSelections);

      return areLevelUpRequirementsSatisfied(
        ctx,
        requirements,
        allEffectSelections
      );
    }

    // Passo opcional: quem não quer trocar segue direto. Uma troca começada
    // pela metade é descartada no apply (exige `powers` preenchido).
    case 'Benefício da Origem':
      return true;

    case 'Perícias por Patamar': {
      const allEffectSelections = selection.powerEffectSelections || {};
      return getLevelUpScalingPowers(ctx).every((power) =>
        areLevelUpRequirementsSatisfied(
          ctx,
          resolvePowerRequirements(power, allEffectSelections),
          allEffectSelections
        )
      );
    }

    case 'Efeitos de Habilidades': {
      // Treinador 5: a escolha de Treino Especializado é obrigatória — sem
      // ela, o chooseFromOptions sorteia uma opção aleatória no apply.
      if (
        selectedClassName === 'Treinador' &&
        selectedClassLevel === 5 &&
        !getTreinoEspecializadoChoice(selection)
      ) {
        return false;
      }

      // Mesmas habilidades que o passo desenha. Sem isso, pular o passo fazia
      // o `applyPower` SORTEAR a escolha em silêncio.
      const allEffectSelections = selection.abilityEffectSelections || {};

      return getLevelUpAbilitiesForLevel(ctx).every((ability) =>
        areLevelUpRequirementsSatisfied(
          ctx,
          resolvePowerRequirements(ability, allEffectSelections),
          allEffectSelections
        )
      );
    }

    case 'Escolhas de Raça': {
      const chosen = selection.levelUpOptionPicks || {};
      return getLevelUpRacePicks(ctx).every(
        (pick) => (chosen[pick.optionKey] || []).length === pick.pickPerLevelUp
      );
    }

    case 'Seleção de Magias': {
      const spellInfo = getLevelUpSpellInfo(ctx);
      if (!spellInfo) return true;

      const learned = selection.spellsLearned || [];
      const crossCount = countTowardsCrossMinimum(
        learned,
        spellInfo.crossTraditionSpellNames,
        spellInfo.sharedTraditionSpellNames,
        spellInfo.spellCount,
        spellInfo.minCrossTraditionSpells
      );
      return (
        learned.length === spellInfo.spellCount &&
        crossCount >= spellInfo.minCrossTraditionSpells
      );
    }

    // Opcional: zero engenhocas é válido. Só trava acima do limite ou sem T$.
    case 'Engenhocas': {
      const info = getLevelUpEngenhocaInfo(ctx);
      if (!info) return true;
      const fabricadas = selection.engenhocasFabricadas ?? [];
      return (
        fabricadas.length <= info.slots &&
        (selection.engenhocasCost ?? 0) <= info.money
      );
    }

    case 'Truque do Melhor Amigo':
    case 'Truque do Melhor Amigo (Ensinar Truque)': {
      const reason: 'auto' | 'power' =
        stepName === 'Truque do Melhor Amigo (Ensinar Truque)'
          ? 'power'
          : 'auto';
      const entry = selection.companionTrickSelections?.find(
        (e) => e.reason === reason
      );
      if (!entry) return false;
      const companion = getProjectedCompanion(
        ctx,
        reason,
        entry.companionIndex
      );
      if (!companion) return false;
      const trickDef = getCompanionTrickDefinition(entry.trick.name);
      if (!trickDef) return false;
      const { available } = getTrickAvailability(
        trickDef,
        selectedClassLevel,
        companion.companionType,
        companion.size,
        companion.tricks,
        countNaturalWeapons(companion.companionType, companion.tricks),
        false
      );
      if (!available) return false;
      if (trickDef.subChoiceType === 'spell') return !!entry.spell;
      return isTrickChoiceComplete(entry.trick);
    }

    case 'Melhor Amigo':
    case 'Segundo Melhor Amigo': {
      const {
        companionType,
        companionSize,
        companionWeaponDamageType,
        companionSpiritEnergyType,
        companionSkills,
        companionTricks,
      } = selection;
      if (!companionType || !companionSize || !companionWeaponDamageType)
        return false;
      if (companionType === 'Espírito' && !companionSpiritEnergyType)
        return false;
      if (!companionSkills || companionSkills.length !== 3) return false;
      if (!companionTricks || companionTricks.length !== 2) return false;
      return companionTricks.every(isTrickChoiceComplete);
    }

    default:
      return false;
  }
}

/** Passos do nível sem a escolha completa, na ordem do assistente. */
export function getLevelUpGaps(ctx: LevelUpWizardContext): WizardStepGap[] {
  return getLevelUpSteps(ctx)
    .filter((step) => !isLevelUpStepComplete(ctx, step))
    .map((step) => ({ level: ctx.level, step }));
}
