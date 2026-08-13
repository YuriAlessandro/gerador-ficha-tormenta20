import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Box,
} from '@mui/material';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import { dataRegistry } from '@/data/registry';
import { DivindadeEnum } from '@/data/systems/tormenta20/divindades';
import SelectedOptions from '@/interfaces/SelectedOptions';
import { WizardSelections } from '@/interfaces/WizardSelections';
import Race, { AttributeVariant } from '@/interfaces/Race';
import { ClassDescription, SpellPath } from '@/interfaces/Class';
import { allSpellSchools, SpellSchool } from '@/interfaces/Spells';
import Origin, { Items, OriginBenefits } from '@/interfaces/Origin';
import Divindade from '@/interfaces/Divindade';
import { SupplementId } from '@/types/supplement.types';
import { applyGolemDespertoCustomization } from '@/data/systems/tormenta20/ameacas-de-arton/races/golem-desperto';
import { applyDuendeCustomization } from '@/data/systems/tormenta20/herois-de-arton/races/duende';
import { applyMoreauCustomization } from '@/data/systems/tormenta20/ameacas-de-arton/races/moreau';
import { MoreauHeritageName } from '@/data/systems/tormenta20/ameacas-de-arton/races/moreau-heritages';
import { applySuragelAlternativeAbility } from '@/data/systems/tormenta20/deuses-de-arton/races/suragelAbilities';
import {
  ArcanistaSubtypes,
  applyLinhagemAbencoadaToSpellPath,
  getArcanistaSpellPath,
} from '@/data/systems/tormenta20/classes/arcanista';
import { buildSpellPool } from '@/functions/spellPathUtils';

// Import step components
import {
  getPowerSelectionRequirements,
  getChosenOptionNestedRequirements,
  countRequirementSelections,
} from '@/functions/powers/manualPowerSelection';
import { PowerSelectionRequirement } from '@/interfaces/PowerSelections';
import {
  applyAttributeVariant,
  buildClassEquipmentsFromChoices,
  computeFinalAttributeModifiers,
  getEffectiveRaceAttrs,
  getInitialMoneyWithDetails,
  isClassOrVariantOf,
  raceHasSexDimorphism,
  resolveSexForAttributes,
} from '@/functions/general';
import { getOriginBagEquipments } from '@/functions/originItems';
import PROFICIENCIAS from '@/data/systems/tormenta20/proficiencias';
import { rollAttributePool } from '@/functions/attributeMethods';
import {
  getClassBaseSkillsWithChoices,
  expandOficioInBasicas,
} from '@/data/systems/tormenta20/pericias';
import Skill, {
  ALL_SPECIFIC_OFICIOS,
  isOficioSkill,
} from '@/interfaces/Skills';
import Equipment, { BagEquipments } from '@/interfaces/Equipment';
import cloneDeep from 'lodash/cloneDeep';
import { MarketSelections } from '@/interfaces/MarketEquipment';
import { ensureIds } from '@/interfaces/Bag';
import { raceHasOrigin } from '@/data/systems/tormenta20/origins';
import {
  ComplicationSelectionStep,
  ComplicationPowerStep,
} from '@/premium/components/Complications';
import { isComplicationPowerSelectionComplete } from '@/premium/functions/complications';
import {
  applyOpenRace,
  hasOpenableAttributes,
} from '@/premium/functions/openRaces';
import {
  getVariedAttributeMethod,
  resolveVariedAttributeMethod,
  VARIED_ATTRIBUTE_METHODS,
} from '@/premium/data/attributeMethods';
import { AgeComplicationsStep } from '@/premium/components/Ages';
import { getAgeBracket } from '@/premium/data/ageBrackets';
import {
  getAgeOriginBenefits,
  getRequiredAgeComplications,
  isAgeSelectionComplete,
} from '@/premium/functions/ages';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { useOptionalRulesAvailable } from '@/hooks/useOptionalRules';
import type { GeneralPower } from '@/interfaces/Poderes';
import CharacterBasicInfoStep from './steps/CharacterBasicInfoStep';
import AttributeBaseValuesStep from './steps/AttributeBaseValuesStep';
import RaceAttributeStep from './steps/RaceAttributeStep';
import ClassSkillStep from './steps/ClassSkillStep';
import IntelligenceSkillStep from './steps/IntelligenceSkillStep';
import ClassPowerStep from './steps/ClassPowerStep';
import OriginSelectionStep from './steps/OriginSelectionStep';
import OriginPowerStep from './steps/OriginPowerStep';
import DeityPowerStep from './steps/DeityPowerStep';
import PowerEffectSelectionStep from './steps/PowerEffectSelectionStep';
import SpellSchoolSelectionStep from './steps/SpellSchoolSelectionStep';
import InitialSpellSelectionStep from './steps/InitialSpellSelectionStep';
import ArcanistSubtypeSelectionStep from './steps/ArcanistSubtypeSelectionStep';
import FeiticeiroLinhagemSelectionStep from './steps/FeiticeiroLinhagemSelectionStep';
import SuragelAbilitySelectionStep from './steps/SuragelAbilitySelectionStep';
import { RaceAttributeVariantStep } from './steps/RaceAttributeVariantStep';
import MarketStep from './steps/MarketStep';
import ClassEquipmentStep from './steps/ClassEquipmentStep';
import OriginItemStep from './steps/OriginItemStep';
import QareenElementSelectionStep from './steps/QareenElementSelectionStep';
import MoreauSapienciaSpellStep from './steps/MoreauSapienciaSpellStep';
import AlchemyItemSelectionStep from './steps/AlchemyItemSelectionStep';
import PropositoCriacaoStep from './steps/PropositoCriacaoStep';
import CompanionCreationStep from './steps/CompanionCreationStep';

interface RaceCustomization {
  // Golem Desperto
  golemChassis?: string;
  golemEnergySource?: string;
  golemSize?: string;
  // Duende
  duendeNature?: string;
  duendeSize?: string;
  duendeBonusAttributes?: Atributo[];
  duendePresentes?: string[];
  duendeTabuSkill?: Skill;
  // Moreau
  moreauHeritage?: string;
  moreauBonusAttributes?: Atributo[];
}

interface CharacterCreationWizardModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (selections: WizardSelections) => void;
  selectedOptions: SelectedOptions;
  raceCustomization?: RaceCustomization;
}

/**
 * Khalmyr (Atributos Variados) distribui um arranjo FIXO — não há o que rolar,
 * então o pool precisa já existir no instante em que a variante é escolhida.
 * Para todas as outras, o jogador ainda vai clicar em "Rolar".
 */
function buildInitialPoolState(
  methodId: string,
  attributeCount: number
): Partial<WizardSelections> {
  const method = getVariedAttributeMethod(methodId);
  if (method?.id !== 'khalmyr' || !method.rollPool) return {};

  const pool = method.rollPool();
  return {
    attributeDicePool: pool.mods,
    attributeDicePoolLabels: pool.labels,
    attributeDiceAssignment: Array.from({ length: attributeCount }, () => null),
  };
}

const CharacterCreationWizardModal: React.FC<
  CharacterCreationWizardModalProps
> = ({ open, onClose, onConfirm, selectedOptions, raceCustomization }) => {
  const complicationsFeature = useFeatureAccess('complications');
  const optionalRulesAvailable = useOptionalRulesAvailable();
  const [activeStep, setActiveStep] = useState(0);
  const [steps, setSteps] = useState<string[]>([]);
  const [stepsInitialized, setStepsInitialized] = useState(false);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const stepperScrollRef = useRef<HTMLDivElement>(null);
  const [selections, setSelections] = useState<WizardSelections>({
    // Initialize with default attribute modifiers (0 = average)
    baseAttributes: {
      [Atributo.FORCA]: 0,
      [Atributo.DESTREZA]: 0,
      [Atributo.CONSTITUICAO]: 0,
      [Atributo.INTELIGENCIA]: 0,
      [Atributo.SABEDORIA]: 0,
      [Atributo.CARISMA]: 0,
    },
  });

  // Get race, class, origin, deity from selected options
  // Default to TORMENTA20_CORE for non-authenticated users
  // Memoize to prevent creating new array on every render (which would cause infinite loop)
  const supplements = useMemo(
    () => selectedOptions.supplements || [SupplementId.TORMENTA20_CORE],
    [selectedOptions.supplements]
  );

  // Extract old race name for Osteon/Soterrado Memória Póstuma (used as dependency)
  const memoriaPostumaOldRace =
    selections.powerEffectSelections?.['Memória Póstuma']?.osteonOldRace;

  // Extract old race name for Yidishan Natureza Orgânica (used as dependency)
  const yidishanNaturezaOldRace =
    selections.powerEffectSelections?.['Natureza Orgânica']?.yidishanOldRace;

  // Get race and apply customization if provided
  const race: Race | undefined = useMemo(() => {
    let baseRace = dataRegistry.getRaceByName(
      selectedOptions.raca,
      supplements
    );
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
      memoriaPostumaOldRace &&
      (baseRace.name === 'Osteon' || baseRace.name === 'Soterrado')
    ) {
      const allRaces = dataRegistry.getRacesBySupplements(supplements);
      const oldRaceObj = allRaces.find((r) => r.name === memoriaPostumaOldRace);
      if (oldRaceObj) {
        baseRace = { ...baseRace, oldRace: { ...oldRaceObj } };
      }
    }

    // Herança alternativa de Suraggel (Deuses de Arton): substitui Luz Sagrada /
    // Sombras Profanas. Precisa acontecer AQUI porque `needsPowerEffectSelections`,
    // o passo "Efeitos de Poderes" e sua validação derivam as escolhas pendentes
    // de `race.abilities` — sem isso o assistente pede as seleções da habilidade
    // padrão e nunca as da herança escolhida.
    baseRace = applySuragelAlternativeAbility(
      baseRace,
      selections.suragelAbility
    );

    // Apply Yidishan old race from Natureza Orgânica selections
    if (yidishanNaturezaOldRace && baseRace.name === 'Yidishan') {
      const allRaces = dataRegistry.getRacesBySupplements(supplements);
      const oldRaceObj = allRaces.find(
        (r) => r.name === yidishanNaturezaOldRace
      );
      if (oldRaceObj) {
        baseRace = { ...baseRace, oldRace: { ...oldRaceObj } };
      }
    }

    return baseRace;
  }, [
    selectedOptions.raca,
    supplements,
    raceCustomization,
    memoriaPostumaOldRace,
    yidishanNaturezaOldRace,
    selections.suragelAbility,
  ]);

  // Para raças com attributeVariants (Kallyanach), `race.attributes` é só o
  // fallback do catálogo — a escolha do jogador no passo "Variante de Atributos"
  // é a fonte da verdade. Todo cálculo de atributo usa esta versão.
  const raceWithVariant: Race | undefined = useMemo(
    () =>
      race && selections.attributeVariant
        ? applyAttributeVariant(race, selections.attributeVariant)
        : race,
    [race, selections.attributeVariant]
  );

  // Memoize classe to prevent infinite re-renders (used as useEffect dependency)
  const classe: ClassDescription | undefined = useMemo(() => {
    const classes = dataRegistry.getClassesBySupplements(supplements);
    return classes.find((c) => c.name === selectedOptions.classe);
  }, [supplements, selectedOptions.classe]);

  // Expand Ofício (Qualquer) in base skills to specific Ofício variants
  const expandedBasicas = useMemo(
    () => (classe ? expandOficioInBasicas(classe.periciasbasicas) : []),
    [classe]
  );

  // Catálogo do mercado. Montá-lo clona ~230 itens de suplemento, então precisa
  // de identidade estável — chamá-lo dentro de `getStepContent` refazia o
  // trabalho a cada render e invalidava a memoização do passo Mercado.
  const marketEquipment = useMemo(
    () => dataRegistry.getEquipmentBySupplements(supplements),
    [supplements]
  );

  // Proficiências efetivas até aqui: as da classe mais as concedidas por
  // poderes já escolhidos. Usadas só para avisar (sem bloquear) que o
  // personagem não sabe usar um item no mercado.
  const proficiencias = useMemo(
    () => [
      ...(classe?.proficiencias ?? []),
      ...Object.values(selections.powerEffectSelections ?? {}).flatMap(
        (sel) => sel.proficiencies ?? []
      ),
    ],
    [classe, selections.powerEffectSelections]
  );

  const handleMarketChange = useCallback(
    (marketSelections: MarketSelections) => {
      setSelections((prev) => ({ ...prev, marketSelections }));
    },
    []
  );

  // Memoize origin to prevent infinite re-renders (used as useEffect dependency)
  const origin: Origin | undefined = useMemo(() => {
    const allOrigins = dataRegistry.getOriginsBySupplements(supplements);
    return allOrigins.find((o: Origin) => o.name === selectedOptions.origin);
  }, [supplements, selectedOptions.origin]);

  // Congela os itens da origem assim que ela é escolhida. `getItems()` sorteia a
  // cada chamada, então sem isso a lista exibida no passo de benefícios, a do
  // passo de itens, a do Mercado e a que vai pra ficha seriam todas diferentes.
  // Trocar de origem descarta o cache e as escolhas antigas.
  useEffect(() => {
    setSelections((prev) => ({
      ...prev,
      cachedOriginItems: origin?.getItems(),
      originItemChoices: undefined,
    }));
  }, [origin]);

  // Memoize deity to prevent infinite re-renders (used as useEffect dependency)
  // Use registry to get deity with supplement powers merged
  const deity: Divindade | null = useMemo(() => {
    if (!selectedOptions.devocao?.value) return null;

    // First try to get deity name from DivindadeEnum
    const baseDeity =
      DivindadeEnum[
        selectedOptions.devocao.value as keyof typeof DivindadeEnum
      ];

    if (!baseDeity) {
      // Divindade homebrew: o value é o NOME (não há chave no enum).
      return (
        dataRegistry.getDeityByName(
          selectedOptions.devocao.value,
          supplements
        ) || null
      );
    }

    // Get the deity with supplement powers from registry
    const deityWithPowers = dataRegistry.getDeityByName(
      baseDeity.name,
      supplements
    );

    return deityWithPowers || baseDeity;
  }, [selectedOptions.devocao?.value, supplements]);

  // Sexo efetivo para atributos raciais (dimorfismo sexual, ex: Nagah)
  const sexForAttributes = resolveSexForAttributes(
    selections.characterGender,
    selections.dimorphismChoice
  );

  // Raças Abertas (Heróis de Arton) roda POR CIMA da variante escolhida: abrir a
  // raça é a última transformação dos modificadores raciais, nunca a primeira.
  // Daqui pra baixo, todo cálculo de atributo usa `raceForAttributes` —
  // `raceWithVariant` só sobrevive onde a identidade da raça importa mais que os
  // atributos (ex.: a lista de variantes do catálogo).
  const raceForAttributes: Race | undefined = useMemo(
    () =>
      raceWithVariant && selections.openRaces
        ? applyOpenRace(
            raceWithVariant,
            getEffectiveRaceAttrs(raceWithVariant, sexForAttributes)
          )
        : raceWithVariant,
    [raceWithVariant, selections.openRaces, sexForAttributes]
  );

  // Atributos Variados (Heróis de Arton). Sem a regra a lista fica vazia e o
  // passo de atributos se comporta exatamente como antes: três botões, os
  // métodos do livro básico.
  const variedAttributeMethods = optionalRulesAvailable
    ? VARIED_ATTRIBUTE_METHODS
    : [];
  const attributeMethod = selections.attributeMethod || 'free';
  const variedAttributeMethod =
    optionalRulesAvailable && attributeMethod !== 'free'
      ? resolveVariedAttributeMethod(
          attributeMethod,
          selections.attributeMethodVariant
        )
      : undefined;

  // Quantos benefícios de origem a faixa etária concede: Criança 0 ("Sem
  // Origem"), Adolescente 1 ("Origem em Construção"), demais 2.
  const ageOriginBenefits = optionalRulesAvailable
    ? getAgeOriginBenefits(selections.ageBracket)
    : 2;

  // "Já Vi Coisas" só existe no Adulto; nas demais faixas o poder não é opcional
  // (não existe), então o toggle nunca vale.
  const tookAgeOptionalPower =
    !!selections.ageOptionalPowerTaken &&
    !!getAgeBracket(selections.ageBracket)?.optionalGeneralPower;

  // A raça TEM modificadores para redistribuir? Lê sempre a raça fechada — a
  // aberta já é o resultado da transformação.
  const canOpenRace =
    optionalRulesAvailable &&
    hasOpenableAttributes(
      raceWithVariant
        ? getEffectiveRaceAttrs(raceWithVariant, sexForAttributes)
        : undefined
    );

  // Modificadores finais dos seis atributos (base + raciais). Necessários pelos
  // passos que filtram poderes antes de a ficha existir — sem eles a ficha-mock
  // usa valores falsos e todo pré-requisito de atributo passa de graça.
  const finalAttributeModifiers = computeFinalAttributeModifiers(
    raceForAttributes,
    sexForAttributes,
    selections.baseAttributes,
    selections.raceAttributes
  );

  // Helper to calculate intelligence modifier (including racial modifiers)
  const getIntelligenceModifier = (): number =>
    finalAttributeModifiers[Atributo.INTELIGENCIA];

  // Helper to get intelligence skills count
  const getIntelligenceSkillsCount = (): number => {
    const intMod = getIntelligenceModifier();
    return intMod > 0 ? intMod : 0;
  };

  // Determine which steps are needed
  const needsRaceAttributeVariant = (): boolean => {
    if (!race) return false;
    return (
      race.attributeVariants !== undefined && race.attributeVariants.length > 1
    );
  };

  const needsRaceAttributes = (): boolean => {
    if (!raceForAttributes) return false;
    // Com Raças Abertas disponível o passo aparece sempre: é lá que mora o
    // toggle da regra, então ele precisa existir mesmo antes de o jogador
    // decidir (e mesmo em raças sem nenhum slot `any` no catálogo).
    if (canOpenRace) return true;
    return getEffectiveRaceAttrs(raceForAttributes, sexForAttributes).some(
      (attr) => attr.attr === 'any'
    );
  };

  const needsClassSkills = (): boolean => {
    if (!classe) return false;
    return true;
  };

  const needsIntelligenceSkills = (): boolean =>
    getIntelligenceSkillsCount() > 0;

  const needsClassPowers = (): boolean =>
    // For now, always skip (placeholder implementation)
    false;

  const needsOriginPowers = (): boolean =>
    // For now, always skip (placeholder implementation)
    false;

  // Itens da origem que o jogador escolhe (ex.: Gladiador, "uma arma marcial ou
  // exótica"). Lê do cache quando já congelado — `getItems()` re-sorteia a cada
  // chamada, mas a existência de escolhas é estável entre sorteios.
  const originItems = (): Items[] =>
    selections.cachedOriginItems || origin?.getItems() || [];

  const needsOriginItemChoice = (): boolean =>
    !!origin && originItems().some((item) => item.choice);

  const needsCompanionCreation = (): boolean => classe?.name === 'Treinador';

  const needsPowerEffectSelections = (): boolean => {
    if (!race || !classe) return false;

    // Check race abilities
    const hasRaceRequirements = race.abilities.some((ability) => {
      const reqs = getPowerSelectionRequirements(ability);
      return reqs !== null;
    });
    if (hasRaceRequirements) return true;

    // Check class abilities (only level 1 for initial creation)
    const hasClassRequirements = classe.abilities
      ?.filter((ability) => ability.nivel <= 1)
      .some((ability) => {
        const reqs = getPowerSelectionRequirements(ability);
        return reqs !== null;
      });
    if (hasClassRequirements) return true;

    // Check origin powers
    if (origin) {
      const originBenefits = origin.getPowersAndSkills
        ? origin.getPowersAndSkills([], origin, true)
        : { powers: { origin: [], general: [] }, skills: [] };

      const hasOriginRequirements = originBenefits.powers.origin.some(
        (power) => {
          const reqs = getPowerSelectionRequirements(power);
          return reqs !== null;
        }
      );
      if (hasOriginRequirements) return true;
    }

    // Check deity granted powers (selected in previous step)
    if (deity && selections.deityPowers && selections.deityPowers.length > 0) {
      const selectedDeityPowers = deity.poderes.filter((p) =>
        selections.deityPowers?.includes(p.name)
      );
      const hasDeityRequirements = selectedDeityPowers.some((power) => {
        const reqs = getPowerSelectionRequirements(power);
        return reqs !== null;
      });
      if (hasDeityRequirements) return true;
    }

    return false;
  };

  const needsDeityPowers = (): boolean =>
    // Show step if there's a deity selected
    // Classes without qtdPoderesConcedidos defined select 1 power (default)
    // Classes with qtdPoderesConcedidos = 'all' show info message
    // Classes with qtdPoderesConcedidos = number select that many powers
    !!deity;
  const needsSpellSchoolSelection = (): boolean => {
    if (!classe) return false;
    // Bardo e Druida precisam escolher 3 escolas de magia
    // Eles têm setup() que randomiza as escolas, mas no wizard queremos escolha manual
    // Ciente de variantes: Magimarcialista (variante de Bardo) etc. herdam o comportamento
    // Classes homebrew declaram a escolha via spellPath.schoolChoice
    return (
      isClassOrVariantOf(classe, 'Bardo') ||
      isClassOrVariantOf(classe, 'Druida') ||
      !!classe.spellPath?.schoolChoice
    );
  };

  // Configuração da escolha de escolas: declarada no spellPath (homebrew) ou
  // o padrão de Bardo/Druida (3 escolas dentre todas)
  const getSchoolChoiceConfig = (): {
    count: number;
    available: SpellSchool[];
  } => {
    const choice = classe?.spellPath?.schoolChoice;
    if (choice) {
      const available = choice.available ?? allSpellSchools;
      return { count: Math.min(choice.count, available.length), available };
    }
    return { count: 3, available: allSpellSchools };
  };

  const needsInitialSpellSelection = (): boolean => {
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

  const needsArcanistaSubtypeSelection = (): boolean =>
    classe?.name === 'Arcanista';

  const needsFeiticeiroLinhagemSelection = (): boolean =>
    selections.arcanistaSubtype === 'Feiticeiro';

  const needsSuragelAbilitySelection = (): boolean => {
    if (!race) return false;
    const isSuragel = race.name.startsWith('Suraggel');
    const hasDeusesArton = supplements.includes(
      SupplementId.TORMENTA20_DEUSES_ARTON
    );
    return isSuragel && hasDeusesArton;
  };

  const needsComplicationSelection = (): boolean =>
    complicationsFeature.hasAccess &&
    !!classe &&
    supplements.includes(SupplementId.TORMENTA20_HEROIS_ARTON);

  const needsComplicationPower = (): boolean =>
    needsComplicationSelection() &&
    !!selections.complication &&
    selections.complication !== 'declined';

  // Idades Variadas: o passo só existe a partir de Adulto (as faixas mais novas
  // não têm complicação de idade). Para o Adulto ele aparece mesmo assim,
  // porque é lá que mora o toggle de "Já Vi Coisas".
  const needsAgeComplications = (): boolean =>
    optionalRulesAvailable &&
    getRequiredAgeComplications(selections.ageBracket) > 0;

  const needsAgePower = (): boolean =>
    needsAgeComplications() && tookAgeOptionalPower;

  const needsQareenElementSelection = (): boolean => {
    if (!race) return false;
    return race.name === 'Qareen';
  };

  const needsMoreauSapienciaSelection = (): boolean => {
    if (!race) return false;
    return (
      race.name === 'Moreau' && raceCustomization?.moreauHeritage === 'Coruja'
    );
  };

  // Check if the class has an addAlchemyItems action at level 1
  const getAlchemyItemsAction = (): {
    budget: number;
    count: number;
    abilityName: string;
  } | null => {
    if (!classe) return null;
    const abilities = (classe.abilities || []).filter((a) => a.nivel <= 1);
    let result: { budget: number; count: number; abilityName: string } | null =
      null;
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
  };

  const needsAlchemyItemSelection = (): boolean =>
    getAlchemyItemsAction() !== null;

  // Helper to get spell info for classes without spellPath defined initially
  const getSpellInfo = (): Pick<
    SpellPath,
    | 'spellType'
    | 'initialSpells'
    | 'excludeSchools'
    | 'includeDivineSchools'
    | 'includeArcaneSchools'
    | 'crossTraditionLimit'
    | 'crossTraditionRules'
  > | null => {
    if (!classe) return null;

    const hasTeurgistaMistico =
      selections.deityPowers?.includes('Teurgista Místico');

    let result: Pick<
      SpellPath,
      | 'spellType'
      | 'initialSpells'
      | 'excludeSchools'
      | 'includeDivineSchools'
      | 'includeArcaneSchools'
      | 'crossTraditionLimit'
      | 'crossTraditionRules'
    > | null = null;

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
  };

  // Build steps array
  const getSteps = (): string[] => {
    const stepsArray: string[] = [];
    stepsArray.push('Informações Básicas'); // Always first step
    if (needsRaceAttributeVariant()) stepsArray.push('Variante de Atributos');
    if (needsRaceAttributes()) stepsArray.push('Atributos da Raça');
    stepsArray.push('Valores dos Atributos');
    if (needsSuragelAbilitySelection()) stepsArray.push('Habilidade Suraggel');
    if (needsQareenElementSelection()) stepsArray.push('Elemento do Qareen');
    if (needsMoreauSapienciaSelection()) stepsArray.push('Magia da Sapiência');
    if (needsClassSkills()) stepsArray.push('Perícias da Classe');
    if (needsIntelligenceSkills()) stepsArray.push('Perícias por Inteligência');
    if (needsAlchemyItemSelection()) stepsArray.push('Itens Alquímicos');
    if (needsDeityPowers()) stepsArray.push('Poderes da Divindade');
    if (needsArcanistaSubtypeSelection())
      stepsArray.push('Caminho do Arcanista');
    if (needsFeiticeiroLinhagemSelection())
      stepsArray.push('Linhagem do Feiticeiro');
    if (needsSpellSchoolSelection()) stepsArray.push('Escolas de Magia');
    if (needsInitialSpellSelection()) stepsArray.push('Magias Iniciais');
    // Criança não recebe benefícios de origem ("Sem Origem", p. 288), então o
    // passo some por inteiro.
    if (origin && ageOriginBenefits > 0)
      stepsArray.push('Benefícios da Origem');
    else if (race && !raceHasOrigin(race.name))
      stepsArray.push('Propósito de Criação');
    if (needsAgeComplications()) stepsArray.push('Complicações de Idade');
    if (needsAgePower()) stepsArray.push('Poder da Idade');
    if (needsComplicationSelection()) stepsArray.push('Complicação');
    if (needsComplicationPower()) stepsArray.push('Poder da Complicação');
    if (needsPowerEffectSelections()) stepsArray.push('Efeitos de Poderes');
    if (needsClassPowers()) stepsArray.push('Poderes da Classe');
    if (needsOriginPowers()) stepsArray.push('Poderes da Origem');
    if (needsCompanionCreation()) stepsArray.push('Melhor Amigo');
    if (needsOriginItemChoice()) stepsArray.push('Itens da Origem');
    if (classe) stepsArray.push('Equipamento Inicial');
    stepsArray.push('Mercado'); // Always show as final step
    return stepsArray;
  };

  // If no steps needed, auto-confirm with empty selections
  // Only check after steps have been initialized to avoid premature auto-confirm
  useEffect(() => {
    if (open && stepsInitialized && steps.length === 0) {
      onConfirm({});
      onClose();
    }
  }, [open, stepsInitialized, steps.length]);

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setActiveStep(0);
      setStepsInitialized(false); // Mark as not initialized yet
      setSelections({
        // Reset with default attribute modifiers (0 = average)
        baseAttributes: {
          [Atributo.FORCA]: 0,
          [Atributo.DESTREZA]: 0,
          [Atributo.CONSTITUICAO]: 0,
          [Atributo.INTELIGENCIA]: 0,
          [Atributo.SABEDORIA]: 0,
          [Atributo.CARISMA]: 0,
        },
      });
      // Initialize steps array
      setSteps(getSteps());
      setStepsInitialized(true); // Mark as initialized
    }
  }, [open]);

  // Recalculate steps when race, class, or origin change (fixes bug where origin benefits don't show on first load)
  //
  // A faixa etária entra na lista porque muda quais passos existem: Criança
  // remove "Benefícios da Origem", Adulto em diante acrescenta "Complicações de
  // Idade", e aceitar "Já Vi Coisas" acrescenta "Poder da Idade".
  useEffect(() => {
    if (open && stepsInitialized) {
      setSteps(getSteps());
    }
  }, [
    race,
    classe,
    origin,
    deity,
    selections.ageBracket,
    selections.ageOptionalPowerTaken,
  ]);

  useEffect(() => {
    if (stepperScrollRef.current) {
      const activeEl =
        stepperScrollRef.current.querySelector<HTMLElement>('.Mui-active');
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [activeStep]);

  // Clear cached origin benefits when origin changes (so new random benefits are generated)
  useEffect(() => {
    if (selections.cachedOriginBenefits) {
      setSelections((prev) => ({
        ...prev,
        cachedOriginBenefits: undefined,
        originBenefits: [],
      }));
    }
  }, [origin?.name]);

  // Clear class equipment and market selections when class changes
  // (avoids stale equipment from the previous class)
  useEffect(() => {
    if (selections.classEquipment || selections.marketSelections) {
      setSelections((prev) => ({
        ...prev,
        classEquipment: undefined,
        marketSelections: undefined,
      }));
    }
  }, [classe?.name]);

  // Helper function to get all skills already selected in previous steps
  const getAllUsedSkills = (): Skill[] => {
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
  };

  /**
   * Quantidade esperada de escolhas. Quase sempre é o `pick` declarado, mas
   * `markTrainedSkills` (Especialista do Ladino) é dinâmico: o modificador do
   * atributo, com piso `minPick`. `getPowerSelectionRequirements` não conhece a
   * ficha, então declara só o piso e deixa o atributo no metadata.
   */
  const resolveRequirementPick = (req: PowerSelectionRequirement): number => {
    if (req.type !== 'markTrainedSkills') return req.pick;
    const attributeMod =
      req.metadata?.pickByAttribute === Atributo.INTELIGENCIA
        ? getIntelligenceModifier()
        : 0;
    return Math.min(
      Math.max(req.metadata?.minPick ?? req.pick, attributeMod),
      getAllUsedSkills().length
    );
  };

  // Helper function to build pre-populated bag from origin and selections
  const buildPrePopulatedBag = (
    currentOrigin: Origin | undefined,
    currentSelections: WizardSelections
  ): BagEquipments => {
    const bag: BagEquipments = {
      Arma: [],
      Armadura: [],
      Escudo: [],
      'Item Geral': [
        { nome: 'Mochila', group: 'Item Geral', spaces: 0 },
        { nome: 'Saco de dormir', group: 'Item Geral', spaces: 1 },
        { nome: 'Traje de viajante', group: 'Item Geral', spaces: 0 },
      ],
      Alquimía: [],
      Esotérico: [],
      Vestuário: [],
      Hospedagem: [],
      Alimentação: [],
      Animal: [],
      Veículo: [],
      Serviço: [],
    };

    const mergeIntoBag = (partial: Partial<BagEquipments>) => {
      Object.entries(partial).forEach(([group, items]) => {
        if (items) {
          (bag[group as keyof BagEquipments] as Equipment[]).push(
            ...(items as Equipment[])
          );
        }
      });
    };

    // Itens da origem: gratuitos e automáticos para TODAS as origens (JDA).
    // Usa os itens congelados + as escolhas do passo "Itens da Origem".
    mergeIntoBag(
      getOriginBagEquipments(currentOrigin, {
        choices: currentSelections.originItemChoices,
        cachedItems: currentSelections.cachedOriginItems,
      })
    );

    // Add class starting equipment chosen in the "Equipamento Inicial" step
    if (classe && currentSelections.classEquipment) {
      const classEquipments = buildClassEquipmentsFromChoices(
        classe,
        currentSelections.classEquipment
      );
      mergeIntoBag({
        ...classEquipments,
        // Se a origem já concedeu armadura, não adicionar outra (mesmo dedup
        // de getArmors no fluxo aleatório)
        Armadura: bag.Armadura.length > 0 ? [] : classEquipments.Armadura,
      });
    }

    // Add alchemy items from Laboratório Pessoal if selected
    const alchemyAction = getAlchemyItemsAction();
    if (alchemyAction) {
      const alchemySelection =
        currentSelections.powerEffectSelections?.[alchemyAction.abilityName]
          ?.alchemyItems;
      if (alchemySelection && alchemySelection.length > 0) {
        bag.Alquimía.push(...alchemySelection);
      }
      // Add Instrumentos de Alquimista Aprimorados
      bag['Item Geral'].push({
        nome: 'Instrumentos de Alquimista Aprimorados',
        group: 'Item Geral',
        spaces: 1,
      });
    }

    // Vários itens acima vêm por referência de catálogos que são singletons de
    // módulo (equipamentos.ts, suplementos). `ensureIds` grava `id` no objeto,
    // então sem o clone duas fichas passariam a compartilhar o mesmo item.
    const ownedBag = cloneDeep(bag);
    ensureIds(ownedBag);
    return ownedBag;
  };

  // Get current step content
  const getStepContent = (stepIndex: number): React.ReactNode => {
    const stepName = steps[stepIndex];

    switch (stepName) {
      case 'Informações Básicas':
        return (
          <CharacterBasicInfoStep
            basicInfo={{
              name: selections.characterName,
              gender: selections.characterGender,
              imageUrl: selections.characterImageUrl,
              dimorphismChoice: selections.dimorphismChoice,
            }}
            onChange={(info) =>
              setSelections({
                ...selections,
                characterName: info.name,
                characterGender: info.gender,
                characterImageUrl: info.imageUrl,
                dimorphismChoice: info.dimorphismChoice,
              })
            }
            raceName={selectedOptions.raca}
            race={race}
            supplements={supplements}
            ageSelection={
              optionalRulesAvailable
                ? {
                    bracket: selections.ageBracket ?? 'jovem',
                    years: selections.ageYears,
                    deathByOldAge: selections.deathByOldAge,
                  }
                : undefined
            }
            onAgeChange={
              optionalRulesAvailable
                ? (age) =>
                    setSelections({
                      ...selections,
                      ageBracket: age.bracket,
                      ageYears: age.years,
                      deathByOldAge: age.deathByOldAge,
                      // Trocar de faixa muda quantas complicações são exigidas e
                      // se o poder opcional existe — as escolhas antigas não
                      // sobrevivem à troca.
                      ageComplications: [],
                      agePower: undefined,
                    })
                : undefined
            }
          />
        );

      case 'Valores dos Atributos': {
        if (!raceForAttributes) return null;
        const zeroedAttributes: Record<Atributo, number> = {
          [Atributo.FORCA]: 0,
          [Atributo.DESTREZA]: 0,
          [Atributo.CONSTITUICAO]: 0,
          [Atributo.INTELIGENCIA]: 0,
          [Atributo.SABEDORIA]: 0,
          [Atributo.CARISMA]: 0,
        };
        const attributeOrder = Object.values(Atributo);
        // Reset comum a toda troca de método/variante/rolagem: os valores
        // anteriores não têm significado no método novo.
        const clearedAttributeState = {
          baseAttributes: { ...zeroedAttributes },
          attributeDicePool: undefined,
          attributeDicePoolLabels: undefined,
          attributeDiceAssignment: undefined,
          attributeRawDice: undefined,
          attributeRawAssignment: undefined,
        };
        return (
          <AttributeBaseValuesStep
            race={raceForAttributes}
            sexForAttributes={sexForAttributes}
            baseAttributes={selections.baseAttributes || zeroedAttributes}
            raceAttributeChoices={selections.raceAttributes}
            method={selections.attributeMethod || 'free'}
            dicePool={selections.attributeDicePool}
            dicePoolLabels={selections.attributeDicePoolLabels}
            diceAssignment={selections.attributeDiceAssignment}
            variedMethods={variedAttributeMethods}
            variedMethod={variedAttributeMethod}
            rawDice={selections.attributeRawDice}
            rawAssignment={selections.attributeRawAssignment}
            onChange={(attrs) =>
              setSelections({ ...selections, baseAttributes: attrs })
            }
            onMethodChange={(method) =>
              setSelections({
                ...selections,
                attributeMethod: method,
                // A variante volta ao padrão do livro básico ao trocar de
                // coluna — um id de "Pontos" não faz sentido em "Dados".
                attributeMethodVariant: undefined,
                ...clearedAttributeState,
              })
            }
            onVariedMethodChange={(methodId) =>
              setSelections({
                ...selections,
                attributeMethodVariant: methodId,
                ...clearedAttributeState,
                // Khalmyr não tem botão de rolar: o arranjo fixo já entra
                // pronto ao selecionar a variante.
                ...buildInitialPoolState(methodId, attributeOrder.length),
              })
            }
            onRoll={() => {
              const method = variedAttributeMethod;
              if (method?.kind === 'raw' && method.raw) {
                setSelections({
                  ...selections,
                  ...clearedAttributeState,
                  attributeRawDice: method.raw.rollDicePool(),
                });
                return;
              }
              const pool = method?.rollPool?.() ?? {
                mods: rollAttributePool(),
              };
              setSelections({
                ...selections,
                ...clearedAttributeState,
                attributeDicePool: pool.mods,
                attributeDicePoolLabels: pool.labels,
                attributeDiceAssignment: attributeOrder.map(() => null),
              });
            }}
            onDiceAssignmentChange={(assignment) => {
              const newBase: Record<Atributo, number> = { ...zeroedAttributes };
              attributeOrder.forEach((attr, i) => {
                const poolIndex = assignment[i];
                newBase[attr] =
                  poolIndex !== null && poolIndex !== undefined
                    ? selections.attributeDicePool?.[poolIndex] ?? 0
                    : 0;
              });
              setSelections({
                ...selections,
                attributeDiceAssignment: assignment,
                baseAttributes: newBase,
              });
            }}
            onRawAssignmentChange={(assignment) => {
              const raw = variedAttributeMethod?.raw;
              if (!raw) return;
              const newBase: Record<Atributo, number> = { ...zeroedAttributes };
              attributeOrder.forEach((attr, attrIndex) => {
                const total = assignment.reduce<number>(
                  (acc, target, dieIndex) =>
                    target === attrIndex
                      ? acc + (selections.attributeRawDice?.[dieIndex] ?? 0)
                      : acc,
                  raw.startingValue
                );
                newBase[attr] = raw.convert(total);
              });
              setSelections({
                ...selections,
                attributeRawAssignment: assignment,
                baseAttributes: newBase,
              });
            }}
          />
        );
      }

      case 'Variante de Atributos': {
        if (!race || !race.attributeVariants) return null;
        return (
          <RaceAttributeVariantStep
            variants={race.attributeVariants}
            selectedVariant={selections.attributeVariant || null}
            onChange={(variant: AttributeVariant) =>
              setSelections({
                ...selections,
                attributeVariant: variant,
                raceAttributes: [], // Reset race attributes when variant changes
              })
            }
          />
        );
      }

      case 'Atributos da Raça': {
        if (!raceForAttributes) return null;
        const attrs = getEffectiveRaceAttrs(
          raceForAttributes,
          sexForAttributes
        );
        const anySlots = attrs.filter((a) => a.attr === 'any');
        const excludedAttributes =
          raceForAttributes.attributes.excludeFromAny || [];
        return (
          <RaceAttributeStep
            selectedAttributes={selections.raceAttributes || []}
            onChange={(raceAttrs) =>
              setSelections({ ...selections, raceAttributes: raceAttrs })
            }
            requiredCount={anySlots.length}
            slotModifiers={anySlots.map((a) => a.mod)}
            excludedAttributes={excludedAttributes}
            openRacesAvailable={canOpenRace}
            openRaces={!!selections.openRaces}
            onOpenRacesChange={(openRaces) =>
              setSelections({
                ...selections,
                openRaces,
                // Os slots mudam de quantidade e de significado ao ligar/desligar
                // a regra — manter as escolhas antigas pareadas por índice
                // colocaria o modificador errado no atributo errado.
                raceAttributes: [],
              })
            }
            raceName={raceForAttributes.name}
          />
        );
      }

      case 'Habilidade Suraggel':
        if (!race) return null;
        return (
          <SuragelAbilitySelectionStep
            raceName={race.name}
            selectedAbility={selections.suragelAbility}
            onChange={(ability) =>
              setSelections({ ...selections, suragelAbility: ability })
            }
          />
        );

      case 'Elemento do Qareen':
        return (
          <QareenElementSelectionStep
            selectedElement={selections.qareenElement}
            onChange={(element) =>
              setSelections({ ...selections, qareenElement: element })
            }
          />
        );

      case 'Magia da Sapiência':
        return (
          <MoreauSapienciaSpellStep
            selectedSpell={selections.moreauSapienciaSpell}
            onChange={(spellName) =>
              setSelections({ ...selections, moreauSapienciaSpell: spellName })
            }
          />
        );

      case 'Perícias da Classe': {
        if (!classe) return null;

        // Resolve base skills using expanded basicas (specific Ofício choices recognized)
        const resolvedBaseSkills = getClassBaseSkillsWithChoices(
          classe,
          selections.baseSkillChoices || [],
          expandedBasicas
        );

        // Expand Ofício (Qualquer) into all specific variants for all classes
        const availableSkills = classe.periciasrestantes.list
          .flatMap((skill) =>
            skill === Skill.OFICIO ? ALL_SPECIFIC_OFICIOS : [skill]
          )
          .filter((skill) => !resolvedBaseSkills.includes(skill));

        return (
          <ClassSkillStep
            periciasbasicas={expandedBasicas}
            baseSkillChoices={selections.baseSkillChoices || []}
            onBaseSkillChange={(choices) =>
              setSelections({
                ...selections,
                baseSkillChoices: choices,
                classSkills: [],
                intelligenceSkills: [],
              })
            }
            availableSkills={availableSkills}
            selectedSkills={selections.classSkills || []}
            onChange={(skills) =>
              setSelections({ ...selections, classSkills: skills })
            }
            requiredCount={classe.periciasrestantes.qtd}
            className={classe.name}
          />
        );
      }

      case 'Perícias por Inteligência': {
        // Get all skills except base + class remaining (exclude intelligenceSkills
        // from usedSkills so they stay visible as selected in this step)
        const allSkills = Object.values(Skill).filter(
          (s) => s !== Skill.OFICIO
        );
        const usedSkillsForInt: Skill[] = [
          ...(classe
            ? getClassBaseSkillsWithChoices(
                classe,
                selections.baseSkillChoices || [],
                expandedBasicas
              )
            : []),
          ...(selections.classSkills || []),
        ];
        const availableSkills = allSkills.filter(
          (skill) => !usedSkillsForInt.includes(skill)
        );

        return (
          <IntelligenceSkillStep
            availableSkills={availableSkills}
            selectedSkills={selections.intelligenceSkills || []}
            onChange={(skills) =>
              setSelections({ ...selections, intelligenceSkills: skills })
            }
            requiredCount={getIntelligenceSkillsCount()}
            intelligenceModifier={getIntelligenceModifier()}
            // Ofícios customizados criados nos passos anteriores não estão em
            // `availableSkills` (derivado do enum): sem isto o usuário poderia
            // recriar aqui o mesmo Ofício que já escolheu na classe.
            unavailableOficios={usedSkillsForInt.filter(isOficioSkill)}
          />
        );
      }

      case 'Poderes da Classe':
        if (!classe) return null;
        return (
          <ClassPowerStep
            classe={classe}
            selections={selections.classPowerSelections || {}}
            onChange={(sel) =>
              setSelections({ ...selections, classPowerSelections: sel })
            }
          />
        );

      case 'Benefícios da Origem':
        if (!origin) return null;
        return (
          <OriginSelectionStep
            origin={origin}
            selectedBenefits={selections.originBenefits || []}
            onChange={(benefits) =>
              setSelections({ ...selections, originBenefits: benefits })
            }
            usedSkills={getAllUsedSkills()}
            cachedBenefits={selections.cachedOriginBenefits}
            cachedItems={selections.cachedOriginItems}
            baseAttributes={selections.baseAttributes}
            raceAttributes={selections.raceAttributes}
            race={raceForAttributes}
            sexForAttributes={sexForAttributes}
            classe={classe}
            requiredSelections={ageOriginBenefits}
          />
        );

      case 'Propósito de Criação':
        return (
          <PropositoCriacaoStep
            selectedPower={selections.propositoCriacaoPower}
            onChange={(power) =>
              setSelections({ ...selections, propositoCriacaoPower: power })
            }
            baseAttributes={selections.baseAttributes}
            raceAttributes={selections.raceAttributes}
            race={raceForAttributes}
            sexForAttributes={sexForAttributes}
            classe={classe}
            usedSkills={getAllUsedSkills()}
            supplements={supplements}
          />
        );

      case 'Complicação':
        return (
          <ComplicationSelectionStep
            firstClass={classe}
            value={selections.complication}
            onChange={(value) => {
              const next: WizardSelections = {
                ...selections,
                complication: value,
              };
              if (value === 'declined' || value === undefined) {
                // Recusa: descarta o poder escolhido e suas seleções
                if (selections.complicationPower) {
                  const rest = { ...(selections.powerEffectSelections || {}) };
                  delete rest[selections.complicationPower.name];
                  next.powerEffectSelections = rest;
                }
                next.complicationPower = undefined;
              }
              setSelections(next);
            }}
          />
        );

      case 'Poder da Complicação': {
        if (!selections.complication || selections.complication === 'declined')
          return null;

        // Poderes gerais já ganhos (exclusão da lista + requisitos PODER)
        const allGeneralPowers =
          dataRegistry.getAllPowersBySupplements(supplements);
        const knownPowers: GeneralPower[] = [];
        (selections.originBenefits || []).forEach((benefit) => {
          if (benefit.type === 'power') {
            const known = allGeneralPowers.find((p) => p.name === benefit.name);
            if (known) knownPowers.push(known);
          }
        });
        if (selections.propositoCriacaoPower) {
          knownPowers.push(selections.propositoCriacaoPower);
        }

        const complicationPowerName = selections.complicationPower?.name;
        return (
          <ComplicationPowerStep
            complication={selections.complication}
            selectedPower={selections.complicationPower}
            onChange={(power) => {
              const next: WizardSelections = {
                ...selections,
                complicationPower: power,
              };
              // Escolhas do poder anterior não valem para o novo
              if (
                complicationPowerName &&
                complicationPowerName !== power?.name
              ) {
                const rest = { ...(selections.powerEffectSelections || {}) };
                delete rest[complicationPowerName];
                next.powerEffectSelections = rest;
              }
              setSelections(next);
            }}
            pickSelections={
              complicationPowerName
                ? selections.powerEffectSelections?.[complicationPowerName]
                : undefined
            }
            onPickChange={(sel) => {
              if (!complicationPowerName) return;
              const rest = { ...(selections.powerEffectSelections || {}) };
              if (sel === undefined) {
                delete rest[complicationPowerName];
              } else {
                rest[complicationPowerName] = sel;
              }
              setSelections({ ...selections, powerEffectSelections: rest });
            }}
            knownPowers={knownPowers}
            baseAttributes={selections.baseAttributes}
            raceAttributes={selections.raceAttributes}
            race={raceForAttributes}
            sexForAttributes={sexForAttributes}
            classe={classe}
            usedSkills={getAllUsedSkills()}
            supplements={supplements}
          />
        );
      }

      case 'Complicações de Idade': {
        if (!selections.ageBracket) return null;
        return (
          <AgeComplicationsStep
            bracket={selections.ageBracket}
            selected={selections.ageComplications ?? []}
            onChange={(ageComplications) =>
              setSelections({ ...selections, ageComplications })
            }
            tookOptionalPower={tookAgeOptionalPower}
            onOptionalPowerChange={(took) =>
              setSelections({
                ...selections,
                // O toggle vira o gatilho do passo do poder; recusar descarta o
                // poder já escolhido junto com a complicação que vinha com ele.
                agePower: took ? selections.agePower : undefined,
                ageOptionalPowerTaken: took,
              })
            }
          />
        );
      }

      case 'Poder da Idade': {
        const allGeneralPowers =
          dataRegistry.getAllPowersBySupplements(supplements);
        const knownPowers: GeneralPower[] = [];
        (selections.originBenefits || []).forEach((benefit) => {
          if (benefit.type === 'power') {
            const known = allGeneralPowers.find((p) => p.name === benefit.name);
            if (known) knownPowers.push(known);
          }
        });
        if (selections.propositoCriacaoPower) {
          knownPowers.push(selections.propositoCriacaoPower);
        }
        if (selections.complicationPower) {
          knownPowers.push(selections.complicationPower);
        }

        const agePowerName = selections.agePower?.name;
        return (
          <ComplicationPowerStep
            intro={
              <>
                Por <strong>Já Vi Coisas</strong>, seu personagem adulto recebe
                um poder geral. Escolha livremente, desde que preencha os
                pré-requisitos.
              </>
            }
            selectedPower={selections.agePower}
            onChange={(power) => {
              const next: WizardSelections = { ...selections, agePower: power };
              if (agePowerName && agePowerName !== power?.name) {
                const rest = { ...(selections.powerEffectSelections || {}) };
                delete rest[agePowerName];
                next.powerEffectSelections = rest;
              }
              setSelections(next);
            }}
            pickSelections={
              agePowerName
                ? selections.powerEffectSelections?.[agePowerName]
                : undefined
            }
            onPickChange={(sel) => {
              if (!agePowerName) return;
              const rest = { ...(selections.powerEffectSelections || {}) };
              if (sel === undefined) {
                delete rest[agePowerName];
              } else {
                rest[agePowerName] = sel;
              }
              setSelections({ ...selections, powerEffectSelections: rest });
            }}
            knownPowers={knownPowers}
            baseAttributes={selections.baseAttributes}
            raceAttributes={selections.raceAttributes}
            race={raceForAttributes}
            sexForAttributes={sexForAttributes}
            classe={classe}
            usedSkills={getAllUsedSkills()}
            supplements={supplements}
          />
        );
      }

      case 'Poderes da Origem':
        if (!origin) return null;
        return (
          <OriginPowerStep
            origin={origin}
            selections={selections.originPowerSelections || {}}
            onChange={(sel) =>
              setSelections({ ...selections, originPowerSelections: sel })
            }
          />
        );

      case 'Itens Alquímicos': {
        const alchemyAction = getAlchemyItemsAction();
        if (!alchemyAction) return null;

        // `marketEquipment.alchemy` já traz os alquímicos do core + suplementos
        // (registry.ts), então não há o que concatenar aqui — fazer isso
        // duplicava cada item do core na lista.
        const allAlchemyItems = marketEquipment.alchemy;

        // Get current selections from powerEffectSelections
        const currentAlchemySelections =
          selections.powerEffectSelections?.[alchemyAction.abilityName]
            ?.alchemyItems || [];

        return (
          <AlchemyItemSelectionStep
            availableItems={allAlchemyItems}
            selectedItems={currentAlchemySelections}
            onChange={(items) =>
              setSelections({
                ...selections,
                powerEffectSelections: {
                  ...selections.powerEffectSelections,
                  [alchemyAction.abilityName]: {
                    ...(selections.powerEffectSelections?.[
                      alchemyAction.abilityName
                    ] || {}),
                    alchemyItems: items,
                  },
                },
              })
            }
            budget={alchemyAction.budget}
            maxItems={alchemyAction.count}
          />
        );
      }

      case 'Poderes da Divindade':
        if (!classe || !deity) return null;
        return (
          <DeityPowerStep
            classe={classe}
            deity={deity}
            selectedPowers={selections.deityPowers || []}
            onChange={(powers) =>
              setSelections({ ...selections, deityPowers: powers })
            }
          />
        );

      case 'Caminho do Arcanista':
        return (
          <ArcanistSubtypeSelectionStep
            selectedSubtype={selections.arcanistaSubtype || null}
            onChange={(subtype) =>
              setSelections({ ...selections, arcanistaSubtype: subtype })
            }
          />
        );

      case 'Linhagem do Feiticeiro':
        return (
          <FeiticeiroLinhagemSelectionStep
            selectedLinhagem={selections.feiticeiroLinhagem || null}
            onChange={(linhagem) =>
              setSelections({ ...selections, feiticeiroLinhagem: linhagem })
            }
            activeSupplements={supplements}
            selectedDeus={selections.linhagemAbencoada?.deus}
            onDeusChange={(deus) =>
              setSelections({
                ...selections,
                linhagemAbencoada: { deus },
              })
            }
          />
        );

      case 'Escolas de Magia': {
        const spellInfo = getSpellInfo();
        if (!spellInfo) return null;
        const schoolConfig = getSchoolChoiceConfig();
        return (
          <SpellSchoolSelectionStep
            selectedSchools={selections.spellSchools || []}
            onChange={(schools) =>
              setSelections({ ...selections, spellSchools: schools })
            }
            requiredCount={schoolConfig.count}
            availableSchools={schoolConfig.available}
            className={classe?.name || ''}
            spellType={spellInfo.spellType}
          />
        );
      }

      case 'Magias Iniciais': {
        const spellInfo = getSpellInfo();
        if (!spellInfo || spellInfo.initialSpells === 0) {
          return (
            <Typography>
              Esta classe não precisa selecionar magias iniciais.
            </Typography>
          );
        }
        return (
          <InitialSpellSelectionStep
            selectedSpells={selections.initialSpells || []}
            onChange={(spells) =>
              setSelections({ ...selections, initialSpells: spells })
            }
            requiredCount={spellInfo.initialSpells}
            className={classe?.name || ''}
            spellType={spellInfo.spellType}
            schools={selections.spellSchools}
            excludeSchools={spellInfo.excludeSchools}
            includeDivineSchools={spellInfo.includeDivineSchools}
            includeArcaneSchools={spellInfo.includeArcaneSchools}
            crossTraditionLimit={spellInfo.crossTraditionLimit}
            crossTraditionRules={spellInfo.crossTraditionRules}
            minCrossTraditionSpells={
              spellInfo.crossTraditionRules?.minInitialSpells ?? 0
            }
            supplements={supplements}
          />
        );
      }

      case 'Efeitos de Poderes':
        if (!race || !classe) return null;
        return (
          <PowerEffectSelectionStep
            race={race}
            classe={classe}
            origin={origin}
            deity={deity}
            selectedDeityPowers={selections.deityPowers}
            selections={selections.powerEffectSelections || {}}
            onChange={(effectSelections) =>
              setSelections({
                ...selections,
                powerEffectSelections: effectSelections,
              })
            }
            arcanistaSubtype={selections.arcanistaSubtype}
            supplements={supplements}
            usedSkills={getAllUsedSkills()}
            attributeModifiers={finalAttributeModifiers}
          />
        );

      case 'Melhor Amigo':
        return (
          <CompanionCreationStep
            companionName={selections.companionName}
            companionType={selections.companionType}
            companionSize={selections.companionSize}
            companionWeaponDamageType={selections.companionWeaponDamageType}
            companionSpiritEnergyType={selections.companionSpiritEnergyType}
            companionSkills={selections.companionSkills || []}
            companionTricks={selections.companionTricks || []}
            onNameChange={(name) =>
              setSelections((prev) => ({ ...prev, companionName: name }))
            }
            onTypeChange={(type) =>
              setSelections((prev) => ({ ...prev, companionType: type }))
            }
            onSizeChange={(size) =>
              setSelections((prev) => ({ ...prev, companionSize: size }))
            }
            onWeaponDamageTypeChange={(damageType) =>
              setSelections((prev) => ({
                ...prev,
                companionWeaponDamageType: damageType,
              }))
            }
            onSpiritEnergyTypeChange={(energyType) =>
              setSelections((prev) => ({
                ...prev,
                companionSpiritEnergyType: energyType,
              }))
            }
            onSkillsChange={(skills) =>
              setSelections((prev) => ({ ...prev, companionSkills: skills }))
            }
            onTricksChange={(tricks) =>
              setSelections((prev) => ({ ...prev, companionTricks: tricks }))
            }
          />
        );

      case 'Itens da Origem':
        if (!origin) return null;
        return (
          <OriginItemStep
            origin={origin}
            items={originItems()}
            choices={selections.originItemChoices}
            onChange={(originItemChoices) =>
              setSelections((prev) => ({ ...prev, originItemChoices }))
            }
          />
        );

      case 'Equipamento Inicial':
        if (!classe) return null;
        return (
          <ClassEquipmentStep
            classe={classe}
            selections={selections.classEquipment}
            onChange={(classEquipment) =>
              setSelections((prev) => ({ ...prev, classEquipment }))
            }
          />
        );

      case 'Mercado': {
        // Calculate initial money
        const moneyInfo = getInitialMoneyWithDetails(
          selectedOptions.nivel || 1
        );
        let baseMoney = moneyInfo.amount;

        // Add origin bonus money if regional
        if (origin?.isRegional && origin?.getMoney) {
          baseMoney += origin.getMoney();
        }

        // Build pre-populated bag
        const prePopulatedBag = buildPrePopulatedBag(origin, selections);

        // Use existing market selections if available, otherwise use defaults
        const currentMarketSelections = selections.marketSelections || {
          initialMoney: baseMoney,
          remainingMoney: baseMoney,
          bagEquipments: prePopulatedBag,
        };

        return (
          <MarketStep
            initialMoney={currentMarketSelections.initialMoney}
            remainingMoney={currentMarketSelections.remainingMoney}
            bagEquipments={currentMarketSelections.bagEquipments}
            purchasedIds={currentMarketSelections.purchasedIds}
            availableEquipment={marketEquipment}
            proficiencias={proficiencias}
            onChange={handleMarketChange}
          />
        );
      }

      default:
        return null;
    }
  };

  // Validation for each step
  const canProceed = (): boolean => {
    const stepName = steps[activeStep];

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
          selections.ageBracket,
          (selections.ageComplications ?? []).length,
          tookAgeOptionalPower
        );

      case 'Poder da Idade':
        return !!selections.agePower;

      case 'Variante de Atributos':
        // Must have selected a variant
        return selections.attributeVariant !== undefined;

      case 'Atributos da Raça': {
        if (!raceForAttributes) return false;
        const attrs = getEffectiveRaceAttrs(
          raceForAttributes,
          sexForAttributes
        );
        const attrCount = attrs.filter((a) => a.attr === 'any').length;
        return (
          selections.raceAttributes?.length === attrCount &&
          new Set(selections.raceAttributes).size === attrCount
        );
      }

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
        const requiredCount = getIntelligenceSkillsCount();
        if (requiredCount === 0) return true; // No skills needed
        return selections.intelligenceSkills?.length === requiredCount;
      }

      case 'Itens Alquímicos': {
        const alchemyActionForValidation = getAlchemyItemsAction();
        if (!alchemyActionForValidation) return false;
        const alchemySelections =
          selections.powerEffectSelections?.[
            alchemyActionForValidation.abilityName
          ]?.alchemyItems || [];
        const alchemyTotalCost = alchemySelections.reduce(
          (sum, item) => sum + (item.preco || 0),
          0
        );
        return (
          alchemySelections.length === alchemyActionForValidation.count &&
          alchemyTotalCost <= alchemyActionForValidation.budget
        );
      }

      case 'Poderes da Classe':
        // For now, always allow (placeholder)
        return true;

      case 'Benefícios da Origem':
        // If regional origin, always allow (no selection needed)
        if (!origin) return false;
        if (origin.isRegional) return true;
        // Otherwise, require 2 selections
        return selections.originBenefits?.length === 2;

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
            selections.powerEffectSelections?.[
              selections.complicationPower.name
            ]
          )
        );

      case 'Poderes da Origem':
        // For now, always allow (placeholder)
        return true;

      case 'Poderes da Divindade': {
        if (!classe || !deity) return false;
        // Step is always completable - deity powers are optional
        // The 'all' case is handled by DeityPowerStep auto-selecting
        return true;
      }

      case 'Caminho do Arcanista':
        return selections.arcanistaSubtype !== undefined;

      case 'Linhagem do Feiticeiro':
        if (selections.feiticeiroLinhagem === 'Linhagem Abençoada') {
          return !!selections.linhagemAbencoada?.deus;
        }
        return selections.feiticeiroLinhagem !== undefined;

      case 'Escolas de Magia':
        return (
          selections.spellSchools?.length === getSchoolChoiceConfig().count
        );

      case 'Magias Iniciais': {
        const spellInfo = getSpellInfo();
        if (!spellInfo || spellInfo.initialSpells === 0) return true;
        const chosenSpells = selections.initialSpells ?? [];
        if (chosenSpells.length !== spellInfo.initialSpells) return false;

        // Linhagem Abençoada: uma das magias tem que ser divina. Os nomes cross
        // vêm do MESMO builder que o passo usa — computá-los de outro jeito
        // faria o botão e os checkboxes discordarem.
        const minCross = spellInfo.crossTraditionRules?.minInitialSpells ?? 0;
        if (minCross <= 0) return true;
        const { crossNames } = buildSpellPool({
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
          chosenSpells.filter((spell) => crossNames.has(spell.nome)).length >=
          minCross
        );
      }

      case 'Efeitos de Poderes': {
        if (!race || !classe) return false;

        // Collect all requirements from race, class, origin, and deity powers
        // Each requirement is tied to its power name for per-power validation
        const allRequirements: Array<
          PowerSelectionRequirement & { powerName: string }
        > = [];

        const effectSelections = selections.powerEffectSelections || {};

        // Mesma coleta do PowerEffectSelectionStep: requisitos fixos + os que só
        // aparecem depois de uma escolha de `chooseFromOptions`.
        const collectRequirements = (
          powerOrAbility: Parameters<typeof getPowerSelectionRequirements>[0]
        ) => {
          const reqs = getPowerSelectionRequirements(powerOrAbility);
          const nested = getChosenOptionNestedRequirements(
            powerOrAbility,
            effectSelections[powerOrAbility.name]
          );
          [...(reqs?.requirements ?? []), ...nested].forEach((req) => {
            allRequirements.push({ powerName: powerOrAbility.name, ...req });
          });
        };

        // Check race abilities
        race.abilities.forEach(collectRequirements);

        // Check class abilities (filter to nivel <= 1 to match what PowerEffectSelectionStep displays)
        (classe.abilities || [])
          .filter((a) => a.nivel <= 1)
          .forEach(collectRequirements);

        // Check origin powers
        if (origin) {
          const originBenefits = origin.getPowersAndSkills
            ? origin.getPowersAndSkills([], origin, true)
            : { powers: { origin: [], general: [] }, skills: [] };

          originBenefits.powers.origin.forEach(collectRequirements);
        }

        // Check deity granted powers (selected in previous step)
        if (
          deity &&
          selections.deityPowers &&
          selections.deityPowers.length > 0
        ) {
          deity.poderes
            .filter((p) => selections.deityPowers?.includes(p.name))
            .forEach(collectRequirements);
        }

        // Validate all requirements are met
        return allRequirements.every((req) => {
          const { powerName, type, pick } = req;

          // Requisição declarada opcional (ex.: Arma Amada) nunca bloqueia
          if (req.optional) return true;

          const count = countRequirementSelections(
            req,
            effectSelections[powerName]
          );
          // Tipo não contável: não bloquear o assistente
          if (count === null) return true;

          // Adjust pick for proficiencies already owned by the class
          let effectivePick = resolveRequirementPick(req);
          if (type === 'addProficiency' && req.availableOptions && classe) {
            const filteredCount = (req.availableOptions as string[]).filter(
              (prof) => !classe.proficiencias.includes(prof)
            ).length;
            effectivePick = Math.min(pick, filteredCount);
          }

          // For getGeneralPower, also check if nested power requirements are met
          if (type === 'getGeneralPower' && count >= effectivePick) {
            const powerSelections = effectSelections[powerName] || {};
            const allSelectedPowers = (powerSelections.powers || []) as Array<{
              name?: string;
              sheetActions?: unknown[];
            }>;
            const hasUnmetNested = allSelectedPowers.some((selPower) => {
              if (!selPower?.name || !selPower.sheetActions) return false;
              const nestedReqs = getPowerSelectionRequirements(
                selPower as Parameters<typeof getPowerSelectionRequirements>[0]
              );
              if (!nestedReqs) return false;
              return nestedReqs.requirements.some((nestedReq) => {
                if (nestedReq.optional) return false;
                const nestedCount = countRequirementSelections(
                  nestedReq,
                  effectSelections[selPower.name!]
                );
                if (nestedCount === null) return false;
                return nestedCount < nestedReq.pick;
              });
            });
            if (hasUnmetNested) return false;
          }

          // A habilidade aprendida (Duplo Feérico) pode ter escolha própria —
          // ex.: Especialista do Ladino pede perícias. As sub-escolhas ficam na
          // MESMA entrada de seleções do poder de origem.
          if (type === 'learnClassAbility' && count >= effectivePick) {
            const powerSelections = effectSelections[powerName] || {};
            const chosen = powerSelections.classAbilities?.[0];
            const chosenAbility = chosen?.abilityName
              ? dataRegistry
                  .getClassesBySupplements(supplements)
                  .find((c) => c.name === chosen.className)
                  ?.abilities.find((a) => a.name === chosen.abilityName)
              : undefined;
            const nestedReqs = chosenAbility
              ? getPowerSelectionRequirements(
                  chosenAbility as Parameters<
                    typeof getPowerSelectionRequirements
                  >[0]
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
                return nestedCount < resolveRequirementPick(nestedReq);
              }
            );
            if (hasUnmetNested) return false;
          }

          return count >= effectivePick;
        });
      }

      case 'Melhor Amigo': {
        const hasType = !!selections.companionType;
        const hasSize = !!selections.companionSize;
        const hasDamageType = !!selections.companionWeaponDamageType;
        const hasSkills = selections.companionSkills?.length === 3;
        const hasTricks = selections.companionTricks?.length === 2;
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
        return originItems()
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
        const needsLightArmor =
          !classe.proficiencias.includes(PROFICIENCIAS.PESADAS) &&
          classe.name !== 'Arcanista';
        if (needsLightArmor && !eq.armor) return false;
        if (isClassOrVariantOf(classe, 'Bardo') && !eq.instrument) return false;
        return true;
      }

      case 'Mercado':
        // Always allow proceeding from market step
        return true;

      default:
        return false;
    }
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Last step - confirm
      onConfirm(selections);
    } else {
      const nextStepName = steps[activeStep + 1];

      // Cache origin benefits when entering origin step for the first time
      // This prevents random re-selection when navigating back and forth
      if (
        nextStepName === 'Benefícios da Origem' &&
        origin &&
        !selections.cachedOriginBenefits
      ) {
        const allUsedSkills = getAllUsedSkills();
        // Pass true to get ALL available options for manual selection
        const benefits: OriginBenefits = origin.getPowersAndSkills
          ? origin.getPowersAndSkills(allUsedSkills, origin, true)
          : {
              powers: {
                origin: origin.poderes.filter(
                  (p) => p.type === 'ORIGEM'
                ) as import('@/interfaces/Poderes').OriginPower[],
                general: [],
                generalPowers: origin.poderes.filter(
                  (p) => p.type !== 'ORIGEM'
                ) as import('@/interfaces/Poderes').GeneralPower[],
              },
              skills: origin.pericias,
            };

        setSelections((prev) => ({
          ...prev,
          cachedOriginBenefits: benefits,
        }));
      }

      setActiveStep((prev) => prev + 1);
      // Recalculate steps after advancing (allows conditional steps to appear)
      setSteps(getSteps());
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    // Recalculate steps after going back (in case steps changed)
    setSteps(getSteps());
  };

  // Handle close attempt - show confirmation dialog
  const handleCloseAttempt = () => {
    setConfirmCloseOpen(true);
  };

  // Handle confirmed close
  const handleConfirmClose = () => {
    setConfirmCloseOpen(false);
    onClose();
  };

  // Handle cancel close (stay in wizard)
  const handleCancelClose = () => {
    setConfirmCloseOpen(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleCloseAttempt}
        maxWidth='md'
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2,
              minHeight: '500px',
            },
          },
        }}
      >
        <DialogTitle>
          <Typography
            variant='h5'
            component='div'
            sx={{
              fontWeight: 'bold',
            }}
          >
            Criação Manual de Personagem
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ width: '100%', mt: 2 }}>
            <Box
              ref={stepperScrollRef}
              sx={{
                overflowX: 'auto',
                pb: 1,
                '&::-webkit-scrollbar': {
                  height: 6,
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  borderRadius: 3,
                },
              }}
            >
              <Stepper
                activeStep={activeStep}
                sx={{
                  minWidth: 'max-content',
                }}
              >
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel
                      sx={{
                        '& .MuiStepLabel-label': {
                          whiteSpace: 'nowrap',
                        },
                      }}
                    >
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

            <Box sx={{ mt: 4, mb: 2 }}>{getStepContent(activeStep)}</Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseAttempt} color='inherit'>
            Cancelar
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          <Button disabled={activeStep === 0} onClick={handleBack}>
            Voltar
          </Button>
          <Button
            variant='contained'
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {activeStep === steps.length - 1 ? 'Confirmar' : 'Próximo'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmCloseOpen}
        onClose={handleCancelClose}
        maxWidth='xs'
        fullWidth
      >
        <DialogTitle>Cancelar criação de personagem?</DialogTitle>
        <DialogContent>
          <Typography variant='body1'>
            Tem certeza que deseja cancelar? Todas as informações preenchidas
            serão perdidas.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelClose} color='inherit'>
            Continuar editando
          </Button>
          <Button
            onClick={handleConfirmClose}
            variant='contained'
            color='error'
          >
            Sim, cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CharacterCreationWizardModal;
