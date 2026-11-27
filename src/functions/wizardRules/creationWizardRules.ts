/**
 * Regras do assistente de criação em funções puras: que passos existem e
 * quando cada um tem a escolha completa.
 *
 * Moravam dentro do `CharacterCreationWizardModal` (`getSteps`/`canProceed`).
 * Saíram para cá para que o assistente e o motor sem sorteio (Builds v2)
 * usem a MESMA regra: uma build "completa" é exatamente uma em que o
 * assistente deixaria avançar em todos os passos.
 *
 * Os resolvedores (`resolveCreation*`) são os corpos dos `useMemo` do
 * componente; ele continua memoizando com as mesmas dependências de antes.
 */
import { Atributo } from '@/data/systems/tormenta20/atributos';
import { dataRegistry } from '@/data/registry';
import { getGrantedPowerPool } from '@/functions/powers/grantedPowerPool';
import { DivindadeEnum } from '@/data/systems/tormenta20/divindades';
import SelectedOptions from '@/interfaces/SelectedOptions';
import { WizardSelections } from '@/interfaces/WizardSelections';
import Race from '@/interfaces/Race';
import {
  BasicExpertise,
  ClassDescription,
  SpellPath,
} from '@/interfaces/Class';
import { allSpellSchools } from '@/interfaces/Spells';
import Origin, { Items } from '@/interfaces/Origin';
import Divindade from '@/interfaces/Divindade';
import { GeneralPower } from '@/interfaces/Poderes';
import { PowerSelectionRequirement } from '@/interfaces/PowerSelections';
import Skill from '@/interfaces/Skills';
import { SupplementId } from '@/types/supplement.types';
import { applyGolemDespertoCustomization } from '@/data/systems/tormenta20/ameacas-de-arton/races/golem-desperto';
import { applyDuendeCustomization } from '@/data/systems/tormenta20/herois-de-arton/races/duende';
import { applyMoreauCustomization } from '@/data/systems/tormenta20/ameacas-de-arton/races/moreau';
import { MoreauHeritageName } from '@/data/systems/tormenta20/ameacas-de-arton/races/moreau-heritages';
import { applySuragelAlternativeAbility } from '@/data/systems/tormenta20/deuses-de-arton/races/suragelAbilities';
import { getClassSetupAbilities } from '@/functions/multiclass';
import {
  ArcanistaSubtypes,
  applyLinhagemAbencoadaToSpellPath,
  getArcanistaSpellPath,
} from '@/data/systems/tormenta20/classes/arcanista';
import {
  buildSpellPool,
  countTowardsCrossMinimum,
  getSchoolChoiceConfig,
} from '@/functions/spellPathUtils';
import {
  getPowerSelectionRequirements,
  isLearnSkillOptionAvailable,
  countRequirementSelections,
  resolvePowerRequirements,
  resolveLearnSkillPick,
  ResolvedRequirement,
} from '@/functions/powers/manualPowerSelection';
import { getAgeAttributeTotalsForSelection } from '@/functions/ages';
import {
  applyAttributeVariant,
  computeFinalAttributeModifiers,
  getEffectiveRaceAttrs,
  isClassOrVariantOf,
  isRaceAttributeSelectionComplete,
  raceHasSexDimorphism,
  RaceCustomization,
  resolveSexForAttributes,
} from '@/functions/general';
import { getPlateauByLevel } from '@/functions/powers/general';
import PROFICIENCIAS from '@/data/systems/tormenta20/proficiencias';
import {
  expandOficioInBasicas,
  getClassBaseSkillsWithChoices,
} from '@/data/systems/tormenta20/pericias';
import { raceHasOrigin } from '@/data/systems/tormenta20/origins';
import { isComplicationPowerSelectionComplete } from '@/premium/functions/complications';
import {
  applyOpenRace,
  hasOpenableAttributes,
} from '@/premium/functions/openRaces';
import { resolveVariedAttributeMethod } from '@/premium/data/attributeMethods';
import type { VariedAttributeMethod } from '@/premium/data/attributeMethods';
import { getAgeBracket } from '@/premium/data/ageBrackets';
import {
  getAgeOriginBenefits,
  getRequiredAgeComplications,
  isAgeSelectionComplete,
} from '@/premium/functions/ages';
import { isTrickChoiceComplete } from '@/data/systems/tormenta20/herois-de-arton/companion/companionTricks';
import {
  applyDeityClassVariant,
  DeityClassVariant,
  getDeityClassVariant,
} from '@/data/systems/tormenta20/deuses-de-arton/classes/deityClassVariants';
import { WizardAccess, WizardStepGap } from './types';

export interface CreationWizardInput {
  selectedOptions: SelectedOptions;
  selections: WizardSelections;
  raceCustomization?: RaceCustomization;
  access: WizardAccess;
}

/** Tudo o que o assistente deriva das entradas para decidir os passos. */
export interface CreationWizardContext extends CreationWizardInput {
  supplements: SupplementId[];
  race?: Race;
  raceWithVariant?: Race;
  raceForAttributes?: Race;
  sexForAttributes: 'Masculino' | 'Feminino' | undefined;
  catalogClasse?: ClassDescription;
  deityClassVariant?: DeityClassVariant;
  /** Rótulo do passo da variante por divindade ("Paladino de Marah"). */
  deityClassVariantStepLabel?: string;
  classe?: ClassDescription;
  expandedBasicas: BasicExpertise[];
  origin?: Origin;
  deity: Divindade | null;
  secondaryDeity: Divindade | null;
  grantedPowerPool: GeneralPower[];
  variedAttributeMethod?: VariedAttributeMethod;
  variedAges: boolean;
  ageOriginBenefits: number;
  tookAgeOptionalPower: boolean;
  canOpenRace: boolean;
  finalAttributeModifiers: Record<Atributo, number>;
  schoolChoiceConfig: ReturnType<typeof getSchoolChoiceConfig>;
}

export type CreationSpellInfo = Pick<
  SpellPath,
  | 'spellType'
  | 'initialSpells'
  | 'excludeSchools'
  | 'includeDivineSchools'
  | 'includeArcaneSchools'
  | 'crossTraditionLimit'
  | 'crossTraditionRules'
>;

export interface CreationAlchemyAction {
  budget: number;
  count: number;
  abilityName: string;
}

// ---------------------------------------------------------------------------
// Resolvedores (corpos dos useMemo do componente)
// ---------------------------------------------------------------------------

/** Suplementos ativos; sem nenhum, só o livro básico. */
export function resolveCreationSupplements(
  selectedOptions: SelectedOptions
): SupplementId[] {
  return selectedOptions.supplements || [SupplementId.TORMENTA20_CORE];
}

/** Escolhas de raça que mudam a própria raça (raça antiga, herança). */
export interface CreationRaceChoices {
  memoriaPostumaOldRace?: string;
  yidishanNaturezaOldRace?: string;
  suragelAbility?: string;
}

export function getCreationRaceChoices(
  selections: WizardSelections
): CreationRaceChoices {
  return {
    memoriaPostumaOldRace:
      selections.powerEffectSelections?.['Memória Póstuma']?.osteonOldRace,
    yidishanNaturezaOldRace:
      selections.powerEffectSelections?.['Natureza Orgânica']?.yidishanOldRace,
    suragelAbility: selections.suragelAbility,
  };
}

/** Raça do assistente com as customizações do modal anterior aplicadas. */
export function resolveCreationRace(
  raceName: string,
  supplements: SupplementId[],
  raceCustomization: RaceCustomization | undefined,
  choices: CreationRaceChoices
): Race | undefined {
  let baseRace = dataRegistry.getRaceByName(raceName, supplements);
  if (!baseRace) return undefined;

  // Apply race customization if provided (from pre-wizard modal)
  if (raceCustomization) {
    // Golem Desperto customization
    if (
      baseRace.name === 'Golem Desperto' &&
      raceCustomization.golemChassis &&
      raceCustomization.golemEnergySource &&
      raceCustomization.golemSize
    ) {
      baseRace = applyGolemDespertoCustomization(
        baseRace,
        raceCustomization.golemChassis,
        raceCustomization.golemEnergySource,
        raceCustomization.golemSize
      );
    }

    // Duende customization
    if (
      baseRace.name === 'Duende' &&
      raceCustomization.duendeNature &&
      raceCustomization.duendeSize &&
      raceCustomization.duendeBonusAttributes &&
      raceCustomization.duendePresentes &&
      raceCustomization.duendeTabuSkill
    ) {
      baseRace = applyDuendeCustomization(
        baseRace,
        raceCustomization.duendeNature,
        raceCustomization.duendeSize,
        raceCustomization.duendeBonusAttributes,
        raceCustomization.duendePresentes,
        raceCustomization.duendeTabuSkill
      );
    }

    // Moreau customization
    if (
      baseRace.name === 'Moreau' &&
      raceCustomization.moreauHeritage &&
      raceCustomization.moreauBonusAttributes
    ) {
      baseRace = applyMoreauCustomization(
        baseRace,
        raceCustomization.moreauHeritage as MoreauHeritageName,
        raceCustomization.moreauBonusAttributes
      );
    }
  }

  // Apply Osteon/Soterrado old race from Memória Póstuma selections
  if (
    choices.memoriaPostumaOldRace &&
    (baseRace.name === 'Osteon' || baseRace.name === 'Soterrado')
  ) {
    const allRaces = dataRegistry.getRacesBySupplements(supplements);
    const oldRaceObj = allRaces.find(
      (r) => r.name === choices.memoriaPostumaOldRace
    );
    if (oldRaceObj) {
      baseRace = { ...baseRace, oldRace: { ...oldRaceObj } };
    }
  }

  // Herança alternativa de Suraggel (Deuses de Arton): substitui Luz Sagrada /
  // Sombras Profanas. Precisa acontecer AQUI porque `needsPowerEffectSelections`,
  // o passo "Efeitos de Poderes" e sua validação derivam as escolhas pendentes
  // de `race.abilities` — sem isso o assistente pede as seleções da habilidade
  // padrão e nunca as da herança escolhida.
  baseRace = applySuragelAlternativeAbility(baseRace, choices.suragelAbility);

  // Apply Yidishan old race from Natureza Orgânica selections
  if (choices.yidishanNaturezaOldRace && baseRace.name === 'Yidishan') {
    const allRaces = dataRegistry.getRacesBySupplements(supplements);
    const oldRaceObj = allRaces.find(
      (r) => r.name === choices.yidishanNaturezaOldRace
    );
    if (oldRaceObj) {
      baseRace = { ...baseRace, oldRace: { ...oldRaceObj } };
    }
  }

  return baseRace;
}

/**
 * Divindades escolhidas no formulário, antes do assistente abrir. Alimentam a
 * variante de classe por divindade (Deuses de Arton).
 */
export function resolveDeityChoiceNames(
  selectedOptions: SelectedOptions
): string[] {
  return [
    selectedOptions.devocao?.value,
    selectedOptions.dualDevotion
      ? selectedOptions.devocaoSecundaria?.value
      : undefined,
  ].filter((name): name is string => !!name && name !== '--');
}

export function resolveCatalogClass(
  className: string,
  supplements: SupplementId[]
): ClassDescription | undefined {
  const classes = dataRegistry.getClassesBySupplements(supplements);
  return classes.find((c) => c.name === className);
}

/** Escolhas de criação que mudam a própria classe. */
export interface CreationClassChoices {
  deityClassChoices?: WizardSelections['deityClassChoices'];
  arcanistaSubtype?: WizardSelections['arcanistaSubtype'];
  feiticeiroLinhagem?: WizardSelections['feiticeiroLinhagem'];
  linhagemAbencoadaDeus?: string;
}

export function getCreationClassChoices(
  selections: WizardSelections
): CreationClassChoices {
  return {
    deityClassChoices: selections.deityClassChoices,
    arcanistaSubtype: selections.arcanistaSubtype,
    feiticeiroLinhagem: selections.feiticeiroLinhagem,
    linhagemAbencoadaDeus: selections.linhagemAbencoada?.deus,
  };
}

/**
 * Classe do assistente: a variante por divindade e as habilidades de SETUP
 * (linhagem do Feiticeiro) entram aqui. Elas não estão na classe do catálogo,
 * e sem isso o passo "Efeitos de Poderes" nunca via a magia da Linhagem
 * Feérica nem o poder da Linhagem Rubra, que saíam sorteados.
 */
export function resolveCreationClass(
  catalogClasse: ClassDescription | undefined,
  deityClassVariant: DeityClassVariant | undefined,
  choices: CreationClassChoices
): ClassDescription | undefined {
  if (!catalogClasse) return undefined;
  const withVariant = applyDeityClassVariant(
    catalogClasse,
    deityClassVariant,
    choices.deityClassChoices
  );
  const setupAbilities = getClassSetupAbilities(withVariant.name, {
    arcanistaSubtype: choices.arcanistaSubtype,
    feiticeiroLinhagem: choices.feiticeiroLinhagem,
    linhagemAbencoadaDeus: choices.linhagemAbencoadaDeus,
  });
  if (setupAbilities.length === 0) return withVariant;
  return {
    ...withVariant,
    abilities: [...(withVariant.abilities ?? []), ...setupAbilities],
  };
}

export function resolveCreationOrigin(
  originName: string,
  supplements: SupplementId[]
): Origin | undefined {
  const allOrigins = dataRegistry.getOriginsBySupplements(supplements);
  return allOrigins.find((o: Origin) => o.name === originName);
}

/** Divindade principal, com os poderes dos suplementos ativos. */
export function resolveCreationDeity(
  deityValue: string | undefined,
  supplements: SupplementId[]
): Divindade | null {
  if (!deityValue) return null;

  // First try to get deity name from DivindadeEnum
  const baseDeity = DivindadeEnum[deityValue as keyof typeof DivindadeEnum];

  if (!baseDeity) {
    // Divindade homebrew: o value é o NOME (não há chave no enum).
    return dataRegistry.getDeityByName(deityValue, supplements) || null;
  }

  // Get the deity with supplement powers from registry
  const deityWithPowers = dataRegistry.getDeityByName(
    baseDeity.name,
    supplements
  );

  return deityWithPowers || baseDeity;
}

/** Devoção Dupla: a segunda divindade escolhida no formulário. */
export function resolveSecondaryDeity(
  dualDevotion: boolean | undefined,
  secondaryValue: string | undefined,
  supplements: SupplementId[],
  deity: Divindade | null
): Divindade | null {
  if (!dualDevotion) return null;
  if (!secondaryValue) return null;
  const base =
    DivindadeEnum[secondaryValue as keyof typeof DivindadeEnum]?.name ??
    secondaryValue;
  const resolved = dataRegistry.getDeityByName(base, supplements);
  return resolved && resolved.name !== deity?.name ? resolved : null;
}

/**
 * Piscina de poderes concedidos: a união das listas dos deuses da devoção,
 * mais o poder único do sincretismo.
 */
export function resolveGrantedPowerPool(
  deity: Divindade | null,
  secondaryDeity: Divindade | null,
  supplements: SupplementId[]
): GeneralPower[] {
  if (!deity) return [];
  const names = [deity.name];
  if (secondaryDeity) names.push(secondaryDeity.name);
  return getGrantedPowerPool(names, supplements);
}

/** Raças Abertas (Heróis de Arton) roda POR CIMA da variante escolhida. */
export function resolveRaceForAttributes(
  raceWithVariant: Race | undefined,
  openRaces: boolean | undefined,
  sexForAttributes: 'Masculino' | 'Feminino' | undefined
): Race | undefined {
  return raceWithVariant && openRaces
    ? applyOpenRace(
        raceWithVariant,
        getEffectiveRaceAttrs(raceWithVariant, sexForAttributes)
      )
    : raceWithVariant;
}

/**
 * Derivados que o componente recalcula a cada render (sem memo): método de
 * atributos, idade, Raças Abertas e modificadores finais.
 */
export function resolveCreationAttributeState(
  selections: WizardSelections,
  raceWithVariant: Race | undefined,
  raceForAttributes: Race | undefined,
  sexForAttributes: 'Masculino' | 'Feminino' | undefined,
  optionalRulesAvailable: boolean
): Pick<
  CreationWizardContext,
  | 'variedAttributeMethod'
  | 'variedAges'
  | 'ageOriginBenefits'
  | 'tookAgeOptionalPower'
  | 'canOpenRace'
  | 'finalAttributeModifiers'
> {
  // Atributos Variados (Heróis de Arton). Sem a regra o passo de atributos se
  // comporta exatamente como antes: os métodos do livro básico.
  const attributeMethod = selections.attributeMethod || 'free';
  const variedAttributeMethod =
    optionalRulesAvailable && attributeMethod !== 'free'
      ? resolveVariedAttributeMethod(
          attributeMethod,
          selections.attributeMethodVariant
        )
      : undefined;

  // Idades Variadas ligadas nesta ficha? A idade em si existe sempre, mas só a
  // regra de Heróis de Arton mexe em benefícios de origem, complicações e
  // níveis extras.
  const variedAges =
    optionalRulesAvailable &&
    !!selections.variedAges &&
    !!selections.ageBracket;

  // Quantos benefícios de origem a faixa etária concede: Criança 0 ("Sem
  // Origem"), Adolescente 1 ("Origem em Construção"), demais 2.
  const ageOriginBenefits = variedAges
    ? getAgeOriginBenefits(selections.ageBracket)
    : 2;

  // "Já Vi Coisas" só existe no Adulto.
  const tookAgeOptionalPower =
    variedAges &&
    !!selections.ageOptionalPowerTaken &&
    !!getAgeBracket(selections.ageBracket)?.optionalGeneralPower;

  // A raça TEM modificadores para redistribuir? Lê sempre a raça fechada.
  const canOpenRace =
    optionalRulesAvailable &&
    hasOpenableAttributes(
      raceWithVariant
        ? getEffectiveRaceAttrs(raceWithVariant, sexForAttributes)
        : undefined
    );

  const ageAttributeModifiers = getAgeAttributeTotalsForSelection(
    {
      years: selections.ageYears,
      variedAges: selections.variedAges,
      bracket: selections.ageBracket,
    },
    raceForAttributes?.name
  );

  // Modificadores finais dos seis atributos (base + raciais + idade).
  const finalAttributeModifiers = computeFinalAttributeModifiers(
    raceForAttributes,
    sexForAttributes,
    selections.baseAttributes,
    selections.raceAttributes,
    ageAttributeModifiers
  );

  return {
    variedAttributeMethod,
    variedAges,
    ageOriginBenefits,
    tookAgeOptionalPower,
    canOpenRace,
    finalAttributeModifiers,
  };
}

/** Monta o contexto completo a partir das entradas, sem React. */
export function buildCreationWizardContext(
  input: CreationWizardInput
): CreationWizardContext {
  const { selectedOptions, selections, raceCustomization, access } = input;
  const supplements = resolveCreationSupplements(selectedOptions);
  const race = resolveCreationRace(
    selectedOptions.raca,
    supplements,
    raceCustomization,
    getCreationRaceChoices(selections)
  );
  const raceWithVariant =
    race && selections.attributeVariant
      ? applyAttributeVariant(race, selections.attributeVariant)
      : race;
  const catalogClasse = resolveCatalogClass(
    selectedOptions.classe,
    supplements
  );
  const deityClassVariant = getDeityClassVariant(
    resolveDeityChoiceNames(selectedOptions),
    catalogClasse,
    supplements
  );
  const classe = resolveCreationClass(
    catalogClasse,
    deityClassVariant,
    getCreationClassChoices(selections)
  );
  const deity = resolveCreationDeity(
    selectedOptions.devocao?.value,
    supplements
  );
  const secondaryDeity = resolveSecondaryDeity(
    selectedOptions.dualDevotion,
    selectedOptions.devocaoSecundaria?.value,
    supplements,
    deity
  );
  const sexForAttributes = resolveSexForAttributes(
    selections.characterGender,
    selections.dimorphismChoice
  );
  const raceForAttributes = resolveRaceForAttributes(
    raceWithVariant,
    selections.openRaces,
    sexForAttributes
  );

  return {
    selectedOptions,
    selections,
    raceCustomization,
    access,
    supplements,
    race,
    raceWithVariant,
    raceForAttributes,
    sexForAttributes,
    catalogClasse,
    deityClassVariant,
    deityClassVariantStepLabel: deityClassVariant
      ? `${deityClassVariant.className} de ${deityClassVariant.deity}`
      : undefined,
    classe,
    expandedBasicas: classe
      ? expandOficioInBasicas(classe.periciasbasicas)
      : [],
    origin: resolveCreationOrigin(selectedOptions.origin, supplements),
    deity,
    secondaryDeity,
    grantedPowerPool: resolveGrantedPowerPool(
      deity,
      secondaryDeity,
      supplements
    ),
    ...resolveCreationAttributeState(
      selections,
      raceWithVariant,
      raceForAttributes,
      sexForAttributes,
      access.optionalRules
    ),
    schoolChoiceConfig: classe ? getSchoolChoiceConfig(classe) : null,
  };
}

// ---------------------------------------------------------------------------
// Derivados usados pelos passos
// ---------------------------------------------------------------------------

export function getCreationIntelligenceSkillsCount(
  ctx: CreationWizardContext
): number {
  const intMod = ctx.finalAttributeModifiers[Atributo.INTELIGENCIA];
  return intMod > 0 ? intMod : 0;
}

/** Perícias já escolhidas nos passos anteriores (classe e Inteligência). */
export function getCreationUsedSkills(ctx: CreationWizardContext): Skill[] {
  const { classe, selections, expandedBasicas } = ctx;
  const skills: Skill[] = [];
  // Add resolved base skills (and + chosen or)
  if (classe) {
    const baseSkills = getClassBaseSkillsWithChoices(
      classe,
      selections.baseSkillChoices || [],
      expandedBasicas
    );
    skills.push(...baseSkills);
  }
  if (selections.classSkills) {
    skills.push(...selections.classSkills);
  }
  if (selections.intelligenceSkills) {
    skills.push(...selections.intelligenceSkills);
  }
  return skills;
}

/**
 * Quantidade esperada de escolhas. Quase sempre é o `pick` declarado, mas
 * `markTrainedSkills` (Especialista do Ladino) é dinâmico: o modificador do
 * atributo, com piso `minPick`.
 */
export function resolveCreationRequirementPick(
  ctx: CreationWizardContext,
  req: PowerSelectionRequirement
): number {
  if (req.type === 'learnSkill' && req.metadata?.perTierAboveIniciante) {
    // Biblioteca Divina e similares: `pick` declarado é o piso (patamar
    // Iniciante); o restante escala com o patamar do nível-alvo da ficha.
    return resolveLearnSkillPick(
      req,
      getPlateauByLevel(ctx.selectedOptions.nivel || 1)
    );
  }
  if (req.type !== 'markTrainedSkills') return req.pick;
  const attributeMod =
    req.metadata?.pickByAttribute === Atributo.INTELIGENCIA
      ? ctx.finalAttributeModifiers[Atributo.INTELIGENCIA]
      : 0;
  return Math.min(
    Math.max(req.metadata?.minPick ?? req.pick, attributeMod),
    getCreationUsedSkills(ctx).length
  );
}

/** Itens da origem; usa os congelados quando existem. */
export function getCreationOriginItems(ctx: CreationWizardContext): Items[] {
  return ctx.selections.cachedOriginItems || ctx.origin?.getItems() || [];
}

/** Ação `addAlchemyItems` de 1º nível da classe (Laboratório Pessoal). */
export function getCreationAlchemyAction(
  ctx: CreationWizardContext
): CreationAlchemyAction | null {
  const { classe } = ctx;
  if (!classe) return null;
  const abilities = (classe.abilities || []).filter((a) => a.nivel <= 1);
  let result: CreationAlchemyAction | null = null;
  abilities.some((ability) =>
    (ability.sheetActions || []).some((sa) => {
      if (sa.action.type === 'addAlchemyItems') {
        result = {
          budget: sa.action.budget,
          count: sa.action.count,
          abilityName: ability.name,
        };
        return true;
      }
      return false;
    })
  );
  return result;
}

/** Magias iniciais da classe, inclusive das que só têm spellPath após o setup. */
export function getCreationSpellInfo(
  ctx: CreationWizardContext
): CreationSpellInfo | null {
  const { classe, selections } = ctx;
  if (!classe) return null;

  const hasTeurgistaMistico =
    selections.deityPowers?.includes('Teurgista Místico');

  let result: CreationSpellInfo | null = null;

  // For classes with spellPath already defined
  if (classe.spellPath) {
    result = {
      spellType: classe.spellPath.spellType,
      initialSpells: classe.spellPath.initialSpells,
      excludeSchools: classe.spellPath.excludeSchools,
      includeDivineSchools: classe.spellPath.includeDivineSchools,
      includeArcaneSchools: classe.spellPath.includeArcaneSchools,
      crossTraditionLimit: classe.spellPath.crossTraditionLimit,
      crossTraditionRules: classe.spellPath.crossTraditionRules,
    };
  } else if (classe.name === 'Arcanista' && selections.arcanistaSubtype) {
    // Arcanista: o spellPath só existe depois do setup(), então lemos a
    // definição da classe (fonte única) em vez de repetir os números aqui.
    const isFeiticeiroAbencoado =
      selections.arcanistaSubtype === 'Feiticeiro' &&
      selections.feiticeiroLinhagem === 'Linhagem Abençoada';
    const subtypePath = getArcanistaSpellPath(
      selections.arcanistaSubtype as ArcanistaSubtypes
    );
    const resolvedPath = isFeiticeiroAbencoado
      ? applyLinhagemAbencoadaToSpellPath(subtypePath)
      : subtypePath;

    result = {
      spellType: resolvedPath.spellType,
      initialSpells: resolvedPath.initialSpells,
      excludeSchools: resolvedPath.excludeSchools,
      includeDivineSchools: resolvedPath.includeDivineSchools,
      crossTraditionRules: resolvedPath.crossTraditionRules,
    };
  } else if (isClassOrVariantOf(classe, 'Bardo')) {
    result = { spellType: 'Arcane', initialSpells: 2 };
  } else if (isClassOrVariantOf(classe, 'Druida')) {
    result = { spellType: 'Divine', initialSpells: 2 };
  } else if (isClassOrVariantOf(classe, 'Clérigo')) {
    result = { spellType: 'Divine', initialSpells: 3 };
  } else if (isClassOrVariantOf(classe, 'Frade')) {
    result = { spellType: 'Divine', initialSpells: 3 };
  }

  // Apply Teurgista Místico cross-tradition expansion
  if (result && hasTeurgistaMistico) {
    if (result.spellType === 'Arcane' && !result.includeDivineSchools) {
      result.includeDivineSchools = allSpellSchools;
      result.crossTraditionLimit = 1;
    } else if (result.spellType === 'Divine') {
      result.includeArcaneSchools = allSpellSchools;
      result.crossTraditionLimit = 1;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Quais passos existem
// ---------------------------------------------------------------------------

const needsRaceAttributeVariant = ({ race }: CreationWizardContext): boolean =>
  !!race &&
  race.attributeVariants !== undefined &&
  race.attributeVariants.length > 1;

const needsRaceAttributes = (ctx: CreationWizardContext): boolean => {
  const { raceForAttributes, canOpenRace, sexForAttributes } = ctx;
  if (!raceForAttributes) return false;
  // Com Raças Abertas disponível o passo aparece sempre: é lá que mora o
  // toggle da regra.
  if (canOpenRace) return true;
  return getEffectiveRaceAttrs(raceForAttributes, sexForAttributes).some(
    (attr) => attr.attr === 'any'
  );
};

const needsOriginItemChoice = (ctx: CreationWizardContext): boolean =>
  !!ctx.origin && getCreationOriginItems(ctx).some((item) => item.choice);

// Treinador, ou Melhor Amigo aprendido por outra classe (Duplo Feérico).
const needsCompanionCreation = ({
  classe,
  selections,
}: CreationWizardContext): boolean =>
  classe?.name === 'Treinador' ||
  Object.values(selections.powerEffectSelections ?? {}).some((sel) =>
    (sel.classAbilities ?? []).some(
      (pick) =>
        pick.className === 'Treinador' && pick.abilityName === 'Melhor Amigo'
    )
  );

/** Poderes de origem oferecidos na criação (todas as opções). */
const getCreationOriginPowers = (origin: Origin) => {
  const originBenefits = origin.getPowersAndSkills
    ? origin.getPowersAndSkills([], origin, true)
    : { powers: { origin: [], general: [] }, skills: [] };
  return originBenefits.powers.origin;
};

/** Poderes concedidos já escolhidos no passo "Poderes da Divindade". */
const getChosenGrantedPowers = ({
  deity,
  selections,
  grantedPowerPool,
}: CreationWizardContext): GeneralPower[] =>
  deity && selections.deityPowers && selections.deityPowers.length > 0
    ? grantedPowerPool.filter((p) => selections.deityPowers?.includes(p.name))
    : [];

const needsPowerEffectSelections = (ctx: CreationWizardContext): boolean => {
  const { race, classe, origin } = ctx;
  if (!race || !classe) return false;

  const hasRequirements = (
    power: Parameters<typeof getPowerSelectionRequirements>[0]
  ) => getPowerSelectionRequirements(power) !== null;

  if (race.abilities.some(hasRequirements)) return true;
  // Class abilities (only level 1 for initial creation)
  if (
    classe.abilities
      ?.filter((ability) => ability.nivel <= 1)
      .some(hasRequirements)
  ) {
    return true;
  }
  if (origin && getCreationOriginPowers(origin).some(hasRequirements)) {
    return true;
  }
  return getChosenGrantedPowers(ctx).some(hasRequirements);
};

const needsInitialSpellSelection = ({
  classe,
}: CreationWizardContext): boolean => {
  if (!classe) return false;
  // Classes com spellPath: só mostrar se tiver magias iniciais > 0
  if (classe.spellPath) {
    return classe.spellPath.initialSpells > 0;
  }
  // Classes que lançam magias sem spellPath explícito (ciente de variantes)
  return (
    isClassOrVariantOf(classe, 'Arcanista') ||
    isClassOrVariantOf(classe, 'Bardo') ||
    isClassOrVariantOf(classe, 'Druida') ||
    isClassOrVariantOf(classe, 'Clérigo') ||
    isClassOrVariantOf(classe, 'Frade')
  );
};

const needsSuragelAbilitySelection = ({
  race,
  supplements,
}: CreationWizardContext): boolean =>
  !!race &&
  race.name.startsWith('Suraggel') &&
  supplements.includes(SupplementId.TORMENTA20_DEUSES_ARTON);

const needsComplicationSelection = ({
  access,
  classe,
  supplements,
}: CreationWizardContext): boolean =>
  access.complications &&
  !!classe &&
  supplements.includes(SupplementId.TORMENTA20_HEROIS_ARTON);

const needsComplicationPower = (ctx: CreationWizardContext): boolean =>
  needsComplicationSelection(ctx) &&
  !!ctx.selections.complication &&
  ctx.selections.complication !== 'declined';

// Idades Variadas: o passo só existe a partir de Adulto.
const needsAgeComplications = ({
  variedAges,
  selections,
}: CreationWizardContext): boolean =>
  variedAges && getRequiredAgeComplications(selections.ageBracket) > 0;

/** Passos do assistente de criação, na ordem em que aparecem. */
export function getCreationSteps(ctx: CreationWizardContext): string[] {
  const {
    race,
    classe,
    origin,
    deity,
    selections,
    raceCustomization,
    deityClassVariantStepLabel,
    schoolChoiceConfig,
    ageOriginBenefits,
    tookAgeOptionalPower,
  } = ctx;
  const stepsArray: string[] = [];
  stepsArray.push('Informações Básicas'); // Always first step
  if (needsRaceAttributeVariant(ctx)) stepsArray.push('Variante de Atributos');
  if (needsRaceAttributes(ctx)) stepsArray.push('Atributos da Raça');
  stepsArray.push('Valores dos Atributos');
  if (needsSuragelAbilitySelection(ctx)) stepsArray.push('Habilidade Suraggel');
  if (race?.name === 'Qareen') stepsArray.push('Elemento do Qareen');
  if (
    race?.name === 'Moreau' &&
    raceCustomization?.moreauHeritage === 'Coruja'
  ) {
    stepsArray.push('Magia da Sapiência');
  }
  // Antes de 'Perícias da Classe': a troca Luta → Diplomacia precisa estar
  // decidida quando o jogador escolhe as perícias restantes.
  if (deityClassVariantStepLabel) stepsArray.push(deityClassVariantStepLabel);
  if (classe) stepsArray.push('Perícias da Classe');
  if (getCreationIntelligenceSkillsCount(ctx) > 0)
    stepsArray.push('Perícias por Inteligência');
  if (getCreationAlchemyAction(ctx) !== null)
    stepsArray.push('Itens Alquímicos');
  if (deity) stepsArray.push('Poderes da Divindade');
  if (classe?.name === 'Arcanista') stepsArray.push('Caminho do Arcanista');
  if (selections.arcanistaSubtype === 'Feiticeiro')
    stepsArray.push('Linhagem do Feiticeiro');
  if (schoolChoiceConfig) stepsArray.push('Escolas de Magia');
  if (needsInitialSpellSelection(ctx)) stepsArray.push('Magias Iniciais');
  // Criança não recebe benefícios de origem ("Sem Origem", p. 288), então o
  // passo some por inteiro.
  if (origin && ageOriginBenefits > 0) stepsArray.push('Benefícios da Origem');
  else if (race && !raceHasOrigin(race.name))
    stepsArray.push('Propósito de Criação');
  if (needsAgeComplications(ctx)) stepsArray.push('Complicações de Idade');
  if (needsAgeComplications(ctx) && tookAgeOptionalPower)
    stepsArray.push('Poder da Idade');
  if (needsComplicationSelection(ctx)) stepsArray.push('Complicação');
  if (needsComplicationPower(ctx)) stepsArray.push('Poder da Complicação');
  if (needsPowerEffectSelections(ctx)) stepsArray.push('Efeitos de Poderes');
  // 'Poderes da Classe' e 'Poderes da Origem' existem no switch do
  // assistente, mas nunca entram na lista (placeholders).
  if (needsCompanionCreation(ctx)) stepsArray.push('Melhor Amigo');
  if (needsOriginItemChoice(ctx)) stepsArray.push('Itens da Origem');
  if (classe) stepsArray.push('Equipamento Inicial');
  stepsArray.push('Mercado'); // Always show as final step
  return stepsArray;
}

// ---------------------------------------------------------------------------
// Quando cada passo está completo
// ---------------------------------------------------------------------------

const isPowerEffectStepComplete = (ctx: CreationWizardContext): boolean => {
  const { race, classe, origin, selections, supplements } = ctx;
  if (!race || !classe) return false;

  const effectSelections = selections.powerEffectSelections || {};

  // Mesma coleta que o `PowerEffectSelectionStep` usa para desenhar os
  // seletores: requisitos do poder + os que só existem depois de uma escolha
  // (`chooseFromOptions`) + os dos poderes concedidos.
  const allRequirements: ResolvedRequirement[] = [];
  const collectRequirements = (
    powerOrAbility: Parameters<typeof resolvePowerRequirements>[0]
  ) => {
    allRequirements.push(
      ...resolvePowerRequirements(powerOrAbility, effectSelections)
    );
  };

  race.abilities.forEach(collectRequirements);
  // Class abilities (nivel <= 1, como o PowerEffectSelectionStep mostra)
  (classe.abilities || [])
    .filter((a) => a.nivel <= 1)
    .forEach(collectRequirements);
  if (origin) getCreationOriginPowers(origin).forEach(collectRequirements);
  getChosenGrantedPowers(ctx).forEach(collectRequirements);

  return allRequirements.every(({ selectionKey, requirement: req }) => {
    const { type, pick } = req;

    // Requisição declarada opcional (ex.: Arma Amada) nunca bloqueia
    if (req.optional) return true;

    const ownSelections = effectSelections[selectionKey];
    const count = countRequirementSelections(
      req,
      ownSelections,
      ctx.finalAttributeModifiers[Atributo.INTELIGENCIA]
    );
    // Tipo não contável: não bloquear o assistente
    if (count === null) return true;

    // Adjust pick for proficiencies already owned by the class
    let effectivePick = resolveCreationRequirementPick(ctx, req);
    if (type === 'addProficiency' && req.availableOptions) {
      const filteredCount = (req.availableOptions as string[]).filter(
        (prof) => !classe.proficiencias.includes(prof)
      ).length;
      effectivePick = Math.min(pick, filteredCount);
    }

    // Mesmo ajuste para perícias: o passo remove as perícias que o personagem
    // JÁ treinou nos passos anteriores; sem este clamp o "Próximo" travava sem
    // nada para clicar (Hobgoblin com Arte da Guerra). Bônus (`PickSkill`)
    // inverte a conta: a perícia treinada é que é elegível.
    if (type === 'learnSkill' && req.availableOptions) {
      const used = new Set(getCreationUsedSkills(ctx));
      const filteredCount = (req.availableOptions as Skill[]).filter((skill) =>
        isLearnSkillOptionAvailable(req, skill, used.has(skill))
      ).length;
      effectivePick = Math.min(effectivePick, filteredCount);
    }

    // A habilidade aprendida (Duplo Feérico) pode ter escolha própria — ex.:
    // Especialista do Ladino pede perícias. As sub-escolhas ficam na MESMA
    // entrada de seleções do poder de origem.
    if (type === 'learnClassAbility' && count >= effectivePick) {
      const powerSelections = ownSelections || {};
      const chosen = powerSelections.classAbilities?.[0];
      const chosenAbility = chosen?.abilityName
        ? dataRegistry
            .getClassesBySupplements(supplements)
            .find((c) => c.name === chosen.className)
            ?.abilities.find((a) => a.name === chosen.abilityName)
        : undefined;
      const nestedReqs = chosenAbility
        ? getPowerSelectionRequirements(
            chosenAbility as Parameters<typeof getPowerSelectionRequirements>[0]
          )
        : null;
      const hasUnmetNested = (nestedReqs?.requirements ?? []).some(
        (nestedReq) => {
          if (nestedReq.optional) return false;
          const nestedCount = countRequirementSelections(
            nestedReq,
            powerSelections
          );
          if (nestedCount === null) return false;
          return nestedCount < resolveCreationRequirementPick(ctx, nestedReq);
        }
      );
      if (hasUnmetNested) return false;
    }

    return count >= effectivePick;
  });
};

/** O passo `stepName` tem a escolha completa? (o "Próximo" do assistente) */
export function isCreationStepComplete(
  ctx: CreationWizardContext,
  stepName: string
): boolean {
  const {
    selections,
    race,
    classe,
    origin,
    deity,
    supplements,
    variedAttributeMethod,
    raceForAttributes,
    sexForAttributes,
    expandedBasicas,
    variedAges,
    ageOriginBenefits,
    tookAgeOptionalPower,
    schoolChoiceConfig,
    deityClassVariantStepLabel,
  } = ctx;

  // Variante de classe por divindade: sempre válido — o padrão do livro
  // básico já é uma resposta completa, as duas trocas são opcionais.
  if (deityClassVariantStepLabel && stepName === deityClassVariantStepLabel) {
    return true;
  }

  switch (stepName) {
    case 'Informações Básicas':
      // Require at least a name (and the racial attribute set choice for
      // sex-dimorphic races when gender is 'Outro')
      return (
        !!selections.characterName &&
        selections.characterName.trim().length > 0 &&
        (!race ||
          !raceHasSexDimorphism(race) ||
          selections.characterGender !== 'Outro' ||
          !!selections.dimorphismChoice)
      );

    case 'Valores dos Atributos': {
      // Métodos em valor bruto (Valkaria) exigem que TODOS os dados sejam
      // aplicados — um dado sobrando é atributo jogado fora.
      if (variedAttributeMethod?.kind === 'raw') {
        const dice = selections.attributeRawDice;
        const assignment = selections.attributeRawAssignment;
        if (!dice || dice.length === 0 || !assignment) return false;
        return dice.every(
          (_die, index) =>
            assignment[index] !== null && assignment[index] !== undefined
        );
      }

      // Métodos de pool exigem que todos os 6 valores rolados sejam
      // distribuídos. Khalmyr entra aqui mesmo estando na coluna "Pontos";
      // já a compra de pontos e o método Livre não têm pool nenhum.
      const usesPool =
        selections.attributeMethod === 'dice'
          ? true
          : variedAttributeMethod?.kind === 'pool';
      if (selections.attributeMethod !== 'free' && usesPool) {
        const assignment = selections.attributeDiceAssignment;
        const pool = selections.attributeDicePool;
        if (!pool || pool.length === 0 || !assignment) return false;
        return assignment.every((idx) => idx !== null && idx !== undefined);
      }

      // 'free' e compra de pontos liberam o avanço sempre (a UI de pontos
      // impede saldo negativo).
      return true;
    }

    case 'Complicações de Idade':
      return isAgeSelectionComplete(
        variedAges ? selections.ageBracket : undefined,
        (selections.ageComplications ?? []).length,
        tookAgeOptionalPower
      );

    case 'Poder da Idade':
      return !!selections.agePower;

    case 'Variante de Atributos':
      return selections.attributeVariant !== undefined;

    case 'Atributos da Raça':
      return isRaceAttributeSelectionComplete(
        raceForAttributes,
        sexForAttributes,
        selections.raceAttributes
      );

    case 'Habilidade Suraggel':
      // Always valid - either default ability or selected alternative
      return true;

    case 'Elemento do Qareen':
      return selections.qareenElement !== undefined;

    case 'Magia da Sapiência':
      return !!selections.moreauSapienciaSpell;

    case 'Perícias da Classe': {
      if (!classe) return false;
      const orGroupCount = expandedBasicas.filter(
        (be) => be.type === 'or'
      ).length;
      const baseChoicesValid =
        orGroupCount === 0 ||
        (selections.baseSkillChoices?.length || 0) === orGroupCount;
      const remainingValid =
        classe.periciasrestantes.qtd === 0 ||
        selections.classSkills?.length === classe.periciasrestantes.qtd;
      return baseChoicesValid && remainingValid;
    }

    case 'Perícias por Inteligência': {
      const requiredCount = getCreationIntelligenceSkillsCount(ctx);
      if (requiredCount === 0) return true; // No skills needed
      return selections.intelligenceSkills?.length === requiredCount;
    }

    case 'Itens Alquímicos': {
      const alchemyAction = getCreationAlchemyAction(ctx);
      if (!alchemyAction) return false;
      const alchemySelections =
        selections.powerEffectSelections?.[alchemyAction.abilityName]
          ?.alchemyItems || [];
      const alchemyTotalCost = alchemySelections.reduce(
        (sum, item) => sum + (item.preco || 0),
        0
      );
      return (
        alchemySelections.length === alchemyAction.count &&
        alchemyTotalCost <= alchemyAction.budget
      );
    }

    case 'Poderes da Classe':
      // For now, always allow (placeholder)
      return true;

    case 'Benefícios da Origem':
      // If regional origin, always allow (no selection needed)
      if (!origin) return false;
      if (origin.isRegional) return true;
      // Otherwise, require as many selections as the age bracket grants
      // (Adolescente escolhe só 1 — "Origem em Construção")
      return selections.originBenefits?.length === ageOriginBenefits;

    case 'Propósito de Criação':
      return !!selections.propositoCriacaoPower;

    case 'Complicação':
      // Exige decisão explícita: recusar ou escolher uma complicação
      return selections.complication !== undefined;

    case 'Poder da Complicação':
      return (
        !!selections.complicationPower &&
        isComplicationPowerSelectionComplete(
          selections.complicationPower,
          selections.powerEffectSelections?.[selections.complicationPower.name]
        )
      );

    case 'Poderes da Origem':
      // For now, always allow (placeholder)
      return true;

    case 'Poderes da Divindade':
      // Step is always completable - deity powers are optional
      // The 'all' case is handled by DeityPowerStep auto-selecting
      return !!classe && !!deity;

    case 'Caminho do Arcanista':
      return selections.arcanistaSubtype !== undefined;

    case 'Linhagem do Feiticeiro':
      if (selections.feiticeiroLinhagem === 'Linhagem Abençoada') {
        return !!selections.linhagemAbencoada?.deus;
      }
      if (selections.feiticeiroLinhagem === 'Linhagem Dracônica') {
        return !!selections.draconicaDamageType;
      }
      return selections.feiticeiroLinhagem !== undefined;

    case 'Escolas de Magia':
      return selections.spellSchools?.length === schoolChoiceConfig?.count;

    case 'Magias Iniciais': {
      const spellInfo = getCreationSpellInfo(ctx);
      if (!spellInfo || spellInfo.initialSpells === 0) return true;
      const chosenSpells = selections.initialSpells ?? [];
      if (chosenSpells.length !== spellInfo.initialSpells) return false;

      // Linhagem Abençoada: uma das magias tem que ser divina. Os nomes cross
      // vêm do MESMO builder que o passo usa — computá-los de outro jeito
      // faria o botão e os checkboxes discordarem.
      const minCross = spellInfo.crossTraditionRules?.minInitialSpells ?? 0;
      if (minCross <= 0) return true;
      const { crossNames, sharedNames } = buildSpellPool({
        spellPath: {
          spellType: spellInfo.spellType,
          schools: selections.spellSchools,
          excludeSchools: spellInfo.excludeSchools,
          includeDivineSchools: spellInfo.includeDivineSchools,
          includeArcaneSchools: spellInfo.includeArcaneSchools,
          crossTraditionLimit: spellInfo.crossTraditionLimit,
          crossTraditionRules: spellInfo.crossTraditionRules,
        },
        maxCircle: 1,
        supplements,
      });
      return (
        countTowardsCrossMinimum(
          chosenSpells,
          crossNames,
          sharedNames,
          spellInfo.initialSpells,
          minCross
        ) >= minCross
      );
    }

    case 'Efeitos de Poderes':
      return isPowerEffectStepComplete(ctx);

    case 'Melhor Amigo': {
      const hasType = !!selections.companionType;
      const hasSize = !!selections.companionSize;
      const hasDamageType = !!selections.companionWeaponDamageType;
      const hasSkills = selections.companionSkills?.length === 3;
      const tricks = selections.companionTricks || [];
      const hasTricks =
        tricks.length === 2 &&
        // Sub-escolhas do truque (atributos, deslocamento, Magia Inata)
        tricks.every(isTrickChoiceComplete);
      const hasSpiritEnergy =
        selections.companionType !== 'Espírito' ||
        !!selections.companionSpiritEnergyType;
      return (
        hasType &&
        hasSize &&
        hasDamageType &&
        hasSkills &&
        hasTricks &&
        hasSpiritEnergy
      );
    }

    case 'Itens da Origem': {
      const chosen = selections.originItemChoices || {};
      return getCreationOriginItems(ctx)
        .filter((item) => item.choice)
        .every((item) => !!item.choice && !!chosen[item.choice.key]);
    }

    case 'Equipamento Inicial': {
      if (!classe) return true;
      const eq = selections.classEquipment;
      if (!eq?.simpleWeapon) return false;
      if (
        classe.proficiencias.includes(PROFICIENCIAS.MARCIAIS) &&
        !eq.martialWeapon
      ) {
        return false;
      }
      // Espelha o `needsArmor` do `ClassEquipmentStep`: todos escolhem
      // armadura, menos Arcanista e variantes.
      const needsArmor = !isClassOrVariantOf(classe, 'Arcanista');
      if (needsArmor && !eq.armor) return false;
      if (isClassOrVariantOf(classe, 'Bardo') && !eq.instrument) return false;
      return true;
    }

    case 'Mercado':
      // Always allow proceeding from market step
      return true;

    default:
      return false;
  }
}

/** Passos da criação sem a escolha completa, na ordem do assistente. */
export function getCreationGaps(ctx: CreationWizardContext): WizardStepGap[] {
  return getCreationSteps(ctx)
    .filter((step) => !isCreationStepComplete(ctx, step))
    .map((step) => ({ level: 1, step }));
}
