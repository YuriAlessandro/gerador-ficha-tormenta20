import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import Origin, { OriginBenefits } from '@/interfaces/Origin';
import Divindade from '@/interfaces/Divindade';
import { SupplementId } from '@/types/supplement.types';
import { applyGolemDespertoCustomization } from '@/data/systems/tormenta20/ameacas-de-arton/races/golem-desperto';
import { applyDuendeCustomization } from '@/data/systems/tormenta20/herois-de-arton/races/duende';
import { applyMoreauCustomization } from '@/data/systems/tormenta20/ameacas-de-arton/races/moreau';
import { MoreauHeritageName } from '@/data/systems/tormenta20/ameacas-de-arton/races/moreau-heritages';

// Import step components
import { getPowerSelectionRequirements } from '@/functions/powers/manualPowerSelection';
import { getInitialMoneyWithDetails } from '@/functions/general';
import {
  getClassBaseSkillsWithChoices,
  expandOficioInBasicas,
} from '@/data/systems/tormenta20/pericias';
import Skill, { ALL_SPECIFIC_OFICIOS } from '@/interfaces/Skills';
import { BagEquipments, DefenseEquipment } from '@/interfaces/Equipment';
import { Armaduras, Escudos } from '@/data/systems/tormenta20/equipamentos';
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
import QareenElementSelectionStep from './steps/QareenElementSelectionStep';

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

const CharacterCreationWizardModal: React.FC<
  CharacterCreationWizardModalProps
> = ({ open, onClose, onConfirm, selectedOptions, raceCustomization }) => {
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

    return baseRace;
  }, [
    selectedOptions.raca,
    supplements,
    raceCustomization,
    memoriaPostumaOldRace,
  ]);

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

  // Memoize origin to prevent infinite re-renders (used as useEffect dependency)
  const origin: Origin | undefined = useMemo(() => {
    const allOrigins = dataRegistry.getOriginsBySupplements(supplements);
    return allOrigins.find((o: Origin) => o.name === selectedOptions.origin);
  }, [supplements, selectedOptions.origin]);

  // Memoize deity to prevent infinite re-renders (used as useEffect dependency)
  // Use registry to get deity with supplement powers merged
  const deity: Divindade | null = useMemo(() => {
    if (!selectedOptions.devocao?.value) return null;

    // First try to get deity name from DivindadeEnum
    const baseDeity =
      DivindadeEnum[
        selectedOptions.devocao.value as keyof typeof DivindadeEnum
      ];

    if (!baseDeity) return null;

    // Get the deity with supplement powers from registry
    const deityWithPowers = dataRegistry.getDeityByName(
      baseDeity.name,
      supplements
    );

    return deityWithPowers || baseDeity;
  }, [selectedOptions.devocao?.value, supplements]);

  // Helper to calculate intelligence modifier (including racial modifiers)
  const getIntelligenceModifier = (): number => {
    if (!selections.baseAttributes || !race) return 0;
    // baseAttributes now contains the modifier directly
    const baseModifier = selections.baseAttributes[Atributo.INTELIGENCIA];

    // Add racial modifier for Intelligence
    let racialModifier = 0;

    // Count fixed modifiers for INT
    race.attributes.attrs.forEach((attr) => {
      if (attr.attr === Atributo.INTELIGENCIA) {
        racialModifier += attr.mod;
      }
    });

    // For 'any' attributes: add the bonus only if INT was selected
    // and only once (using the mod from the first 'any' found)
    if (selections.raceAttributes?.includes(Atributo.INTELIGENCIA)) {
      const anyAttr = race.attributes.attrs.find((attr) => attr.attr === 'any');
      if (anyAttr) {
        racialModifier += anyAttr.mod;
      }
    }

    return baseModifier + racialModifier;
  };

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
    if (!race) return false;
    // If variant is selected, use variant's attrs, otherwise use race's attrs
    const attrs = selections.attributeVariant?.attrs || race.attributes.attrs;
    return attrs.some((attr) => attr.attr === 'any');
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
    return classe.name === 'Bardo' || classe.name === 'Druida';
  };

  const needsInitialSpellSelection = (): boolean => {
    if (!classe) return false;
    // Classes que lançam magias: Arcanista, Bardo, Druida, Clérigo
    return (
      classe.spellPath !== undefined ||
      classe.name === 'Arcanista' ||
      classe.name === 'Bardo' ||
      classe.name === 'Druida' ||
      classe.name === 'Clérigo' ||
      classe.name === 'Frade'
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

  const needsQareenElementSelection = (): boolean => {
    if (!race) return false;
    return race.name === 'Qareen';
  };

  // Helper to get spell info for classes without spellPath defined initially
  const getSpellInfo = (): Pick<
    SpellPath,
    'spellType' | 'initialSpells' | 'excludeSchools' | 'includeDivineSchools'
  > | null => {
    if (!classe) return null;

    // For classes with spellPath already defined
    if (classe.spellPath) {
      return {
        spellType: classe.spellPath.spellType,
        initialSpells: classe.spellPath.initialSpells,
        excludeSchools: classe.spellPath.excludeSchools,
        includeDivineSchools: classe.spellPath.includeDivineSchools,
      };
    }

    // For Arcanista with wizard subtype selection
    if (classe.name === 'Arcanista' && selections.arcanistaSubtype) {
      const initialSpellsBySubtype = {
        Bruxo: 3,
        Mago: 4,
        Feiticeiro: 3,
      };
      return {
        spellType: 'Arcane',
        initialSpells: initialSpellsBySubtype[selections.arcanistaSubtype],
      };
    }

    // For Bardo/Druida/Clérigo, hardcode their spell info
    if (classe.name === 'Bardo') {
      return { spellType: 'Arcane', initialSpells: 2 };
    }
    if (classe.name === 'Druida') {
      return { spellType: 'Divine', initialSpells: 2 };
    }
    if (classe.name === 'Clérigo') {
      return { spellType: 'Divine', initialSpells: 3 };
    }
    if (classe.name === 'Frade') {
      return { spellType: 'Divine', initialSpells: 3 };
    }

    return null;
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
    if (needsClassSkills()) stepsArray.push('Perícias da Classe');
    if (needsIntelligenceSkills()) stepsArray.push('Perícias por Inteligência');
    if (needsDeityPowers()) stepsArray.push('Poderes da Divindade');
    if (needsArcanistaSubtypeSelection())
      stepsArray.push('Caminho do Arcanista');
    if (needsFeiticeiroLinhagemSelection())
      stepsArray.push('Linhagem do Feiticeiro');
    if (needsSpellSchoolSelection()) stepsArray.push('Escolas de Magia');
    if (needsInitialSpellSelection()) stepsArray.push('Magias Iniciais');
    if (origin) stepsArray.push('Benefícios da Origem'); // Always show if origin exists
    if (needsPowerEffectSelections()) stepsArray.push('Efeitos de Poderes');
    if (needsClassPowers()) stepsArray.push('Poderes da Classe');
    if (needsOriginPowers()) stepsArray.push('Poderes da Origem');
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
  useEffect(() => {
    if (open && stepsInitialized) {
      setSteps(getSteps());
    }
  }, [race, classe, origin, deity]);

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

    // Add origin items (for regional origins)
    if (currentOrigin?.isRegional) {
      const originItems = currentOrigin.getItems();
      originItems?.forEach((equip) => {
        if (typeof equip.equipment === 'string') {
          bag['Item Geral'].push({
            nome: `${equip.qtd ? `${equip.qtd}x ` : ''}${equip.equipment}`,
            group: 'Item Geral',
          });
        } else if (equip.equipment) {
          const equipValue = equip.equipment;
          // Check if it's an armor
          if (
            Object.values(Armaduras).find(
              (armor) => armor.nome === equipValue.nome
            )
          ) {
            bag.Armadura.push(equipValue as DefenseEquipment);
          }
          // Check if it's a shield
          else if (
            Object.values(Escudos).find(
              (shield) => shield.nome === equipValue.nome
            )
          ) {
            bag.Escudo.push(equipValue as DefenseEquipment);
          }
          // Otherwise it's a weapon or general item
          else if (equipValue.group === 'Arma') {
            bag.Arma.push(equipValue);
          } else {
            bag['Item Geral'].push(equipValue);
          }
        }
      });
    }

    // Add items from non-regional origin benefits if selected as 'item' type
    if (
      currentSelections.originBenefits &&
      currentOrigin &&
      !currentOrigin.isRegional
    ) {
      const originItems = currentOrigin.getItems();
      currentSelections.originBenefits
        .filter((b) => b.type === 'item')
        .forEach((benefit) => {
          const item = originItems.find((i) => {
            const itemName =
              typeof i.equipment === 'string' ? i.equipment : i.equipment.nome;
            return itemName === benefit.name;
          });
          if (item) {
            if (typeof item.equipment === 'string') {
              bag['Item Geral'].push({
                nome: `${item.qtd ? `${item.qtd}x ` : ''}${item.equipment}`,
                group: 'Item Geral',
              });
            } else {
              bag['Item Geral'].push(item.equipment);
            }
          }
        });
    }

    return bag;
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
            }}
            onChange={(info) =>
              setSelections({
                ...selections,
                characterName: info.name,
                characterGender: info.gender,
              })
            }
          />
        );

      case 'Valores dos Atributos': {
        if (!race) return null;
        return (
          <AttributeBaseValuesStep
            race={race}
            baseAttributes={
              selections.baseAttributes || {
                [Atributo.FORCA]: 0,
                [Atributo.DESTREZA]: 0,
                [Atributo.CONSTITUICAO]: 0,
                [Atributo.INTELIGENCIA]: 0,
                [Atributo.SABEDORIA]: 0,
                [Atributo.CARISMA]: 0,
              }
            }
            raceAttributeChoices={selections.raceAttributes}
            onChange={(attrs) =>
              setSelections({ ...selections, baseAttributes: attrs })
            }
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
        if (!race) return null;
        // Use variant's attrs if selected, otherwise use race's default attrs
        const attrSource = selections.attributeVariant || race.attributes;
        const { attrs } = attrSource;
        const attrCount = attrs.filter((a) => a.attr === 'any').length;
        const excludedAttributes = attrSource.excludeFromAny || [];
        return (
          <RaceAttributeStep
            selectedAttributes={selections.raceAttributes || []}
            onChange={(raceAttrs) =>
              setSelections({ ...selections, raceAttributes: raceAttrs })
            }
            requiredCount={attrCount}
            excludedAttributes={excludedAttributes}
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
            baseAttributes={selections.baseAttributes}
            raceAttributes={selections.raceAttributes}
            race={race}
            classe={classe}
          />
        );

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
        return (
          <SpellSchoolSelectionStep
            selectedSchools={selections.spellSchools || []}
            onChange={(schools) =>
              setSelections({ ...selections, spellSchools: schools })
            }
            requiredCount={3}
            className={classe?.name || ''}
            spellType={spellInfo.spellType}
          />
        );
      }

      case 'Magias Iniciais': {
        const spellInfo = getSpellInfo();
        if (!spellInfo) return null;
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

        // Get all available equipment from supplements
        const availableEquipment =
          dataRegistry.getEquipmentBySupplements(supplements);

        return (
          <MarketStep
            initialMoney={currentMarketSelections.initialMoney}
            bagEquipments={currentMarketSelections.bagEquipments}
            availableEquipment={availableEquipment}
            onChange={(marketData) =>
              setSelections({ ...selections, marketSelections: marketData })
            }
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
        // Require at least a name
        return (
          !!selections.characterName &&
          selections.characterName.trim().length > 0
        );

      case 'Valores dos Atributos':
        // Always allow - player can set any values
        return true;

      case 'Variante de Atributos':
        // Must have selected a variant
        return selections.attributeVariant !== undefined;

      case 'Atributos da Raça': {
        if (!race) return false;
        // Use variant's attrs if selected, otherwise use race's default attrs
        const attrs =
          selections.attributeVariant?.attrs || race.attributes.attrs;
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

      case 'Poderes da Classe':
        // For now, always allow (placeholder)
        return true;

      case 'Benefícios da Origem':
        // If regional origin, always allow (no selection needed)
        if (!origin) return false;
        if (origin.isRegional) return true;
        // Otherwise, require 2 selections
        return selections.originBenefits?.length === 2;

      case 'Poderes da Origem':
        // For now, always allow (placeholder)
        return true;

      case 'Poderes da Divindade': {
        if (!classe || !deity) return false;
        const qtd = classe.qtdPoderesConcedidos;

        // If 'all', always allow
        if (qtd === 'all') return true;

        // Otherwise check selection count (default to 1 if undefined)
        const requiredCount = (qtd as number) ?? 1;
        return selections.deityPowers?.length === requiredCount;
      }

      case 'Caminho do Arcanista':
        return selections.arcanistaSubtype !== undefined;

      case 'Linhagem do Feiticeiro':
        if (selections.feiticeiroLinhagem === 'Linhagem Abençoada') {
          return !!selections.linhagemAbencoada?.deus;
        }
        return selections.feiticeiroLinhagem !== undefined;

      case 'Escolas de Magia':
        return selections.spellSchools?.length === 3;

      case 'Magias Iniciais': {
        const spellInfo = getSpellInfo();
        if (!spellInfo) return false;
        return selections.initialSpells?.length === spellInfo.initialSpells;
      }

      case 'Efeitos de Poderes': {
        if (!race || !classe) return false;

        // Collect all requirements from race, class, origin, and deity powers
        // Each requirement is tied to its power name for per-power validation
        const allRequirements: Array<{
          powerName: string;
          type: string;
          pick: number;
        }> = [];

        // Check race abilities
        race.abilities.forEach((ability) => {
          const reqs = getPowerSelectionRequirements(ability);
          if (reqs) {
            reqs.requirements.forEach((req) => {
              allRequirements.push({ powerName: ability.name, ...req });
            });
          }
        });

        // Check class abilities
        classe.abilities?.forEach((ability) => {
          const reqs = getPowerSelectionRequirements(ability);
          if (reqs) {
            reqs.requirements.forEach((req) => {
              allRequirements.push({ powerName: ability.name, ...req });
            });
          }
        });

        // Check origin powers
        if (origin) {
          const originBenefits = origin.getPowersAndSkills
            ? origin.getPowersAndSkills([], origin, true)
            : { powers: { origin: [], general: [] }, skills: [] };

          originBenefits.powers.origin.forEach((power) => {
            const reqs = getPowerSelectionRequirements(power);
            if (reqs) {
              reqs.requirements.forEach((req) => {
                allRequirements.push({ powerName: power.name, ...req });
              });
            }
          });
        }

        // Check deity granted powers (selected in previous step)
        if (
          deity &&
          selections.deityPowers &&
          selections.deityPowers.length > 0
        ) {
          const selectedDeityPowers = deity.poderes.filter((p) =>
            selections.deityPowers?.includes(p.name)
          );
          selectedDeityPowers.forEach((power) => {
            const reqs = getPowerSelectionRequirements(power);
            if (reqs) {
              reqs.requirements.forEach((req) => {
                allRequirements.push({ powerName: power.name, ...req });
              });
            }
          });
        }

        // Helper to count selections for a specific power and type
        const effectSelections = selections.powerEffectSelections || {};
        const getSelectionCount = (powerName: string, type: string): number => {
          const powerSelections = effectSelections[powerName] || {};
          switch (type) {
            case 'learnSkill':
              return powerSelections.skills?.length || 0;
            case 'addProficiency':
              return powerSelections.proficiencies?.length || 0;
            case 'getGeneralPower':
              return powerSelections.powers?.length || 0;
            case 'learnSpell':
            case 'learnAnySpellFromHighestCircle':
              return powerSelections.spells?.length || 0;
            case 'increaseAttribute':
              return powerSelections.attributes?.length || 0;
            case 'selectWeaponSpecialization':
              return powerSelections.weapons?.length || 0;
            case 'selectFamiliar':
              return powerSelections.familiars?.length || 0;
            case 'selectAnimalTotem':
              return powerSelections.animalTotems?.length || 0;
            case 'humanoVersatil': {
              // For Versátil: need 1 skill + (1 skill OR 1 power)
              const skillCount = powerSelections.skills?.length || 0;
              const powerCount = powerSelections.powers?.length || 0;
              // Must have at least 1 skill, and either 2 skills or 1 skill + 1 power
              if (skillCount >= 2) return 2; // 2 skills selected
              if (skillCount >= 1 && powerCount >= 1) return 2; // 1 skill + 1 power
              return skillCount; // Incomplete
            }
            case 'lefouDeformidade': {
              // For Deformidade: need 1 skill + (1 skill OR 1 tormenta power)
              const deformSkillCount = powerSelections.skills?.length || 0;
              const deformPowerCount = powerSelections.powers?.length || 0;
              if (deformSkillCount >= 2) return 2;
              if (deformSkillCount >= 1 && deformPowerCount >= 1) return 2;
              return deformSkillCount;
            }
            case 'osteonMemoriaPostuma': {
              // For Memória Póstuma: need 1 skill OR 1 power OR 1 race ability
              const mpSkillCount = powerSelections.skills?.length || 0;
              const mpPowerCount = powerSelections.powers?.length || 0;
              const mpAbilityCount = powerSelections.raceAbilities?.length || 0;
              if (mpSkillCount >= 1 || mpPowerCount >= 1 || mpAbilityCount >= 1)
                return 1;
              return 0;
            }
            default:
              return 0;
          }
        };

        // Validate all requirements are met
        return allRequirements.every((req) => {
          const { powerName, type, pick } = req;
          const count = getSelectionCount(powerName, type);

          // For getGeneralPower, also check if nested power requirements are met
          if (type === 'getGeneralPower' && count >= pick) {
            const powerSelections = effectSelections[powerName] || {};
            const selectedPower = powerSelections.powers?.[0] as
              | { name?: string; sheetActions?: unknown[] }
              | undefined;
            if (selectedPower?.name && selectedPower.sheetActions) {
              const nestedReqs = getPowerSelectionRequirements(
                selectedPower as Parameters<
                  typeof getPowerSelectionRequirements
                >[0]
              );
              if (nestedReqs) {
                // Check nested requirements under the nested power's name
                return nestedReqs.requirements.every((nestedReq) => {
                  const nestedCount = getSelectionCount(
                    selectedPower.name!,
                    nestedReq.type
                  );
                  return nestedCount >= nestedReq.pick;
                });
              }
            }
          }

          return count >= pick;
        });
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
                origin:
                  origin.poderes as import('@/interfaces/Poderes').OriginPower[],
                general: [],
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
        PaperProps={{
          sx: {
            borderRadius: 2,
            minHeight: '500px',
          },
        }}
      >
        <DialogTitle>
          <Typography variant='h5' component='div' fontWeight='bold'>
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
