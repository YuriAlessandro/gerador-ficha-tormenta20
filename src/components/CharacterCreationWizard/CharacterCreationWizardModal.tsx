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
import { useIsMobile } from '@/hooks/useIsMobile';
import CompactStepProgress from '@/components/common/CompactStepProgress';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import { dataRegistry } from '@/data/registry';

import { resolveFundamentalistChoice } from '@/functions/powers/fundamentalista';

import SelectedOptions from '@/interfaces/SelectedOptions';
import { WizardSelections } from '@/interfaces/WizardSelections';
import Race, { AttributeVariant } from '@/interfaces/Race';
import { ClassDescription } from '@/interfaces/Class';

import Origin, { Items, OriginBenefits } from '@/interfaces/Origin';
import Divindade from '@/interfaces/Divindade';
import { SupplementId } from '@/types/supplement.types';

import { getSchoolChoiceConfig } from '@/functions/spellPathUtils';

// Import step components

import { getAgeAttributeTotalsForSelection } from '@/functions/ages';
import {
  applyAttributeVariant,
  buildClassEquipmentsFromChoices,
  getAnySlotExcludedAttributes,
  getEffectiveRaceAttrs,
  getInitialMoneyWithDetails,
  resolveSexForAttributes,
} from '@/functions/general';
import { getOriginBagEquipments } from '@/functions/originItems';
import { getPlateauByLevel } from '@/functions/powers/general';

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
import { ensureIds, stackByName } from '@/interfaces/Bag';

import {
  ComplicationSelectionStep,
  ComplicationPowerStep,
} from '@/premium/components/Complications';

import {
  getVariedAttributeMethod,
  VARIED_ATTRIBUTE_METHODS,
} from '@/premium/data/attributeMethods';
import { AgeComplicationsStep } from '@/premium/components/Ages';

import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { useOptionalRulesAvailable } from '@/hooks/useOptionalRules';
import type { GeneralPower } from '@/interfaces/Poderes';

import { getDeityClassVariant } from '@/data/systems/tormenta20/deuses-de-arton/classes/deityClassVariants';
import {
  CreationWizardContext,
  getCreationAlchemyAction,
  getCreationIntelligenceSkillsCount,
  getCreationOriginItems,
  getCreationRaceChoices,
  getCreationSpellInfo,
  getCreationSteps,
  getCreationUsedSkills,
  isCreationStepComplete,
  resolveCatalogClass,
  resolveCreationAttributeState,
  resolveCreationClass,
  resolveCreationDeity,
  resolveCreationOrigin,
  resolveCreationRace,
  resolveDeityChoiceNames,
  resolveGrantedPowerPool,
  resolveRaceForAttributes,
  resolveSecondaryDeity,
} from '@/functions/wizardRules/creationWizardRules';
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
import DeityClassVariantStep from './steps/DeityClassVariantStep';
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
  const isMobile = useIsMobile();
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

  // Raça antiga (Memória Póstuma, Natureza Orgânica) e herança de Suraggel
  // mudam a própria raça; extraídas para servirem de dependência.
  const { memoriaPostumaOldRace, yidishanNaturezaOldRace } =
    getCreationRaceChoices(selections);

  // Get race and apply customization if provided
  const race: Race | undefined = useMemo(
    () =>
      resolveCreationRace(
        selectedOptions.raca,
        supplements,
        raceCustomization,
        {
          memoriaPostumaOldRace,
          yidishanNaturezaOldRace,
          suragelAbility: selections.suragelAbility,
        }
      ),
    [
      selectedOptions.raca,
      supplements,
      raceCustomization,
      memoriaPostumaOldRace,
      yidishanNaturezaOldRace,
      selections.suragelAbility,
    ]
  );

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

  /**
   * Divindades escolhidas no formulário, antes do assistente abrir. Alimentam a
   * variante de classe por divindade (Deuses de Arton).
   */
  const deityChoiceNames = useMemo(
    () => resolveDeityChoiceNames(selectedOptions),
    [
      selectedOptions.devocao?.value,
      selectedOptions.dualDevotion,
      selectedOptions.devocaoSecundaria?.value,
    ]
  );

  const catalogClasse: ClassDescription | undefined = useMemo(
    () => resolveCatalogClass(selectedOptions.classe, supplements),
    [supplements, selectedOptions.classe]
  );

  /**
   * Variante de classe por divindade — hoje só "Paladino de Marah". Define o
   * passo e o que ele oferece; `undefined` = o passo não existe nesta ficha.
   */
  const deityClassVariant = useMemo(
    () => getDeityClassVariant(deityChoiceNames, catalogClasse, supplements),
    [deityChoiceNames, catalogClasse, supplements]
  );

  /** Rótulo do passo. Dinâmico, então getStepContent/canProceed o comparam fora do switch. */
  const deityClassVariantStepLabel = deityClassVariant
    ? `${deityClassVariant.className} de ${deityClassVariant.deity}`
    : undefined;

  // Memoize classe to prevent infinite re-renders (used as useEffect dependency)
  //
  // A variante entra AQUI para que todos os passos abaixo (Perícias da Classe,
  // Efeitos de Poderes, Equipamento) já vejam a classe customizada — mesmo
  // padrão do `applySuragelAlternativeAbility` no memo de `race`.
  //
  // As habilidades de SETUP (linhagem do Feiticeiro) também entram aqui: elas
  // não estão na classe do catálogo, e sem isso o passo "Efeitos de Poderes"
  // nunca via a magia da Linhagem Feérica nem o poder da Linhagem Rubra, que
  // saíam sorteados.
  const classe: ClassDescription | undefined = useMemo(
    () =>
      resolveCreationClass(catalogClasse, deityClassVariant, {
        deityClassChoices: selections.deityClassChoices,
        arcanistaSubtype: selections.arcanistaSubtype,
        feiticeiroLinhagem: selections.feiticeiroLinhagem,
        linhagemAbencoadaDeus: selections.linhagemAbencoada?.deus,
      }),
    [
      catalogClasse,
      deityClassVariant,
      selections.deityClassChoices,
      selections.arcanistaSubtype,
      selections.feiticeiroLinhagem,
      selections.linhagemAbencoada?.deus,
    ]
  );

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
  const origin: Origin | undefined = useMemo(
    () => resolveCreationOrigin(selectedOptions.origin, supplements),
    [supplements, selectedOptions.origin]
  );

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
  const deity: Divindade | null = useMemo(
    () => resolveCreationDeity(selectedOptions.devocao?.value, supplements),
    [selectedOptions.devocao?.value, supplements]
  );

  /**
   * Devoção Dupla: a segunda divindade escolhida no formulário. Guardada por
   * nome, resolvida aqui pelo registry como a primária.
   */
  const secondaryDeity: Divindade | null = useMemo(
    () =>
      resolveSecondaryDeity(
        selectedOptions.dualDevotion,
        selectedOptions.devocaoSecundaria?.value,
        supplements,
        deity
      ),
    [
      selectedOptions.dualDevotion,
      selectedOptions.devocaoSecundaria?.value,
      supplements,
      deity,
    ]
  );

  /**
   * Piscina de poderes concedidos: a união das listas dos deuses da devoção,
   * mais o poder único do sincretismo. A QUANTIDADE que o personagem escolhe
   * não muda — segue saindo de `classe.qtdPoderesConcedidos`.
   */
  const grantedPowerPool = useMemo(
    () => resolveGrantedPowerPool(deity, secondaryDeity, supplements),
    [deity, secondaryDeity, supplements]
  );

  /**
   * Fundamentalista (Deuses de Arton): escolhido no formulário, revalidado
   * aqui (suplemento, deus maior, sem devoção dupla).
   */
  const isFundamentalist = useMemo(
    () =>
      !!classe &&
      !!resolveFundamentalistChoice(selectedOptions, classe, deity?.name),
    [selectedOptions, classe, deity]
  );

  /**
   * Poderes concedidos já escolhidos no passo "Poderes da Divindade". Entram na
   * ficha-mock dos passos de poder (complicação / idade) para que o requisito
   * DEVOTO e os requisitos do tipo PODER enxerguem a devoção já montada.
   */
  const chosenDeityPowers = useMemo(() => {
    if (!deity || !selections.deityPowers?.length) return [];
    return grantedPowerPool.filter((p) =>
      selections.deityPowers?.includes(p.name)
    );
  }, [deity, grantedPowerPool, selections.deityPowers]);

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
      resolveRaceForAttributes(
        raceWithVariant,
        selections.openRaces,
        sexForAttributes
      ),
    [raceWithVariant, selections.openRaces, sexForAttributes]
  );

  // Atributos Variados (Heróis de Arton). Sem a regra a lista fica vazia e o
  // passo de atributos se comporta exatamente como antes: três botões, os
  // métodos do livro básico.
  const variedAttributeMethods = optionalRulesAvailable
    ? VARIED_ATTRIBUTE_METHODS
    : [];
  const {
    variedAttributeMethod,
    variedAges,
    ageOriginBenefits,
    tookAgeOptionalPower,
    canOpenRace,
    finalAttributeModifiers,
  } = resolveCreationAttributeState(
    selections,
    raceWithVariant,
    raceForAttributes,
    sexForAttributes,
    optionalRulesAvailable
  );

  /**
   * Modificadores que a idade aplica com a raça e a regra escolhidas AGORA
   * (mostrados no passo de atributos).
   */
  const ageAttributeModifiers = getAgeAttributeTotalsForSelection(
    {
      years: selections.ageYears,
      variedAges: selections.variedAges,
      bracket: selections.ageBracket,
    },
    raceForAttributes?.name
  );

  // Bardo, Druida (e variantes) e homebrews com spellPath.schoolChoice
  // escolhem escolas. O setup() deles sorteia, mas no wizard a escolha é manual.
  const schoolChoiceConfig = classe ? getSchoolChoiceConfig(classe) : null;

  /**
   * Tudo o que as regras do assistente (`creationWizardRules`) precisam. As
   * mesmas regras rodam fora do React no motor sem sorteio (Builds v2).
   */
  const wizardCtx: CreationWizardContext = {
    selectedOptions,
    selections,
    raceCustomization,
    access: {
      optionalRules: optionalRulesAvailable,
      complications: complicationsFeature.hasAccess,
      multiclass: false,
    },
    supplements,
    race,
    raceWithVariant,
    raceForAttributes,
    sexForAttributes,
    catalogClasse,
    deityClassVariant,
    deityClassVariantStepLabel,
    classe,
    expandedBasicas,
    origin,
    deity,
    secondaryDeity,
    grantedPowerPool,
    variedAttributeMethod,
    variedAges,
    ageOriginBenefits,
    tookAgeOptionalPower,
    canOpenRace,
    finalAttributeModifiers,
    schoolChoiceConfig,
  };

  // Helper to calculate intelligence modifier (including racial modifiers)
  const getIntelligenceModifier = (): number =>
    finalAttributeModifiers[Atributo.INTELIGENCIA];

  const getIntelligenceSkillsCount = (): number =>
    getCreationIntelligenceSkillsCount(wizardCtx);

  // Itens da origem; lê do cache quando já congelado.
  const originItems = (): Items[] => getCreationOriginItems(wizardCtx);

  const getAlchemyItemsAction = () => getCreationAlchemyAction(wizardCtx);

  const getSpellInfo = () => getCreationSpellInfo(wizardCtx);

  const getSteps = (): string[] => getCreationSteps(wizardCtx);

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
        // Rolado uma vez por sessão: re-renderizar ou voltar e avançar não
        // rola de novo, e a ficha recebe o mesmo valor que o Mercado mostrou.
        initialMoneyRoll: getInitialMoneyWithDetails(
          selectedOptions.nivel || 1
        ),
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
    selections.variedAges,
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

  // Dinheiro da origem rolado uma vez por origem. Declarado depois do reset de
  // `open`, então roda depois dele ao abrir o assistente.
  useEffect(() => {
    if (open) {
      setSelections((prev) => ({
        ...prev,
        originMoneyRoll: origin?.getMoney?.(),
      }));
    }
  }, [open, origin?.name]);

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
  const getAllUsedSkills = (): Skill[] => getCreationUsedSkills(wizardCtx);

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
        bag.Alquimía.push(...stackByName(alchemySelection));
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

    // Rótulo dinâmico ("Paladino de Marah"), portanto fora do switch.
    if (
      deityClassVariantStepLabel &&
      stepName === deityClassVariantStepLabel &&
      deityClassVariant &&
      catalogClasse
    ) {
      return (
        <DeityClassVariantStep
          variant={deityClassVariant}
          classAbilities={catalogClasse.abilities}
          choices={selections.deityClassChoices}
          onChange={(deityClassChoices) =>
            setSelections({ ...selections, deityClassChoices })
          }
        />
      );
    }

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
            classDescription={classe}
            variedAgesAvailable={optionalRulesAvailable}
            ageSelection={{
              years: selections.ageYears,
              stage: selections.ageStage,
              variedAges: selections.variedAges,
              bracket: selections.ageBracket,
              deathByOldAge: selections.deathByOldAge,
            }}
            onAgeChange={(age) =>
              setSelections({
                ...selections,
                ageYears: age.years,
                ageStage: age.stage,
                variedAges: age.variedAges,
                ageBracket: age.bracket,
                deathByOldAge: age.deathByOldAge,
                // Mudar de faixa muda quantas complicações são exigidas e se o
                // poder opcional existe — as escolhas antigas não sobrevivem à
                // troca. Desligar a regra as descarta pelo mesmo motivo.
                ageComplications: [],
                agePower: undefined,
                ageOptionalPowerTaken: undefined,
              })
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
            ageModifiers={ageAttributeModifiers}
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
        const excludedAttributes = getAnySlotExcludedAttributes(
          raceForAttributes,
          attrs
        );
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
            deity={deity}
            secondaryDeityName={secondaryDeity?.name}
            deityPowers={chosenDeityPowers}
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
        knownPowers.push(...chosenDeityPowers);

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
            deity={deity}
            secondaryDeityName={secondaryDeity?.name}
            deityPowers={chosenDeityPowers}
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
                ageComplications: took ? selections.ageComplications : [],
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
        knownPowers.push(...chosenDeityPowers);
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
            deity={deity}
            secondaryDeityName={secondaryDeity?.name}
            deityPowers={chosenDeityPowers}
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
            secondaryDeity={secondaryDeity}
            fundamentalista={isFundamentalist}
            powerPool={grantedPowerPool}
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
            selectedDamageType={selections.draconicaDamageType}
            onDamageTypeChange={(damageType) =>
              setSelections({
                ...selections,
                draconicaDamageType: damageType,
              })
            }
            selectedRubraAtributo={selections.linhagemRubraAtributo}
            onRubraAtributoChange={(atributo) =>
              setSelections({
                ...selections,
                linhagemRubraAtributo: atributo,
              })
            }
          />
        );

      case 'Escolas de Magia': {
        const spellInfo = getSpellInfo();
        if (!spellInfo || !schoolChoiceConfig) return null;
        return (
          <SpellSchoolSelectionStep
            selectedSchools={selections.spellSchools || []}
            onChange={(schools) =>
              setSelections({ ...selections, spellSchools: schools })
            }
            requiredCount={schoolChoiceConfig.count}
            availableSchools={schoolChoiceConfig.available}
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
            deityPowerPool={grantedPowerPool}
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
            targetPlateau={getPlateauByLevel(selectedOptions.nivel || 1)}
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
        const moneyInfo =
          selections.initialMoneyRoll ??
          getInitialMoneyWithDetails(selectedOptions.nivel || 1);
        let baseMoney = moneyInfo.amount;

        // Dinheiro da origem, rolado uma vez (efeito abaixo de `open`)
        if (origin?.getMoney) {
          baseMoney += selections.originMoneyRoll ?? 0;
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
  const canProceed = (): boolean =>
    isCreationStepComplete(wizardCtx, steps[activeStep]);

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
        fullScreen={isMobile}
        slotProps={{
          paper: {
            sx: isMobile
              ? undefined
              : {
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
            sx={(theme) => ({
              fontWeight: 'bold',
              [theme.breakpoints.down('md')]: { fontSize: '1.25rem' },
            })}
          >
            Criação Manual de Personagem
          </Typography>
        </DialogTitle>

        {isMobile && (
          <Box sx={{ px: 3, pb: 2 }}>
            <CompactStepProgress activeStep={activeStep} steps={steps} />
          </Box>
        )}

        {/* O MUI zera o padding-top do DialogContent quando ele vem logo após o
            DialogTitle; o progresso compacto entre os dois quebra essa
            adjacência, então o zero é explícito no mobile. */}
        <DialogContent sx={isMobile ? { pt: 0 } : undefined}>
          <Box sx={{ width: '100%', mt: isMobile ? 0 : 2 }}>
            {!isMobile && (
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
            )}

            <Box sx={{ mt: isMobile ? 1 : 4, mb: 2 }}>
              {getStepContent(activeStep)}
            </Box>
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
