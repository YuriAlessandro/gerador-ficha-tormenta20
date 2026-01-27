import React, { useState, useEffect } from 'react';
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
import Race from '@/interfaces/Race';
import { ClassDescription } from '@/interfaces/Class';
import Origin from '@/interfaces/Origin';
import Divindade from '@/interfaces/Divindade';
import { SupplementId } from '@/types/supplement.types';

// Import step components
import { getPowerSelectionRequirements } from '@/functions/powers/manualPowerSelection';
import Skill from '@/interfaces/Skills';
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

interface CharacterCreationWizardModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (selections: WizardSelections) => void;
  selectedOptions: SelectedOptions;
}

const CharacterCreationWizardModal: React.FC<
  CharacterCreationWizardModalProps
> = ({ open, onClose, onConfirm, selectedOptions }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [steps, setSteps] = useState<string[]>([]);
  const [stepsInitialized, setStepsInitialized] = useState(false);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const [selections, setSelections] = useState<WizardSelections>({
    // Initialize with default attribute values
    baseAttributes: {
      [Atributo.FORCA]: 10,
      [Atributo.DESTREZA]: 10,
      [Atributo.CONSTITUICAO]: 10,
      [Atributo.INTELIGENCIA]: 10,
      [Atributo.SABEDORIA]: 10,
      [Atributo.CARISMA]: 10,
    },
  });

  // Get race, class, origin, deity from selected options
  // Default to TORMENTA20_CORE for non-authenticated users
  const supplements = selectedOptions.supplements || [
    SupplementId.TORMENTA20_CORE,
  ];
  const race: Race | undefined = dataRegistry.getRaceByName(
    selectedOptions.raca,
    supplements
  );
  const classes = dataRegistry.getClassesBySupplements(supplements);
  const classe: ClassDescription | undefined = classes.find(
    (c) => c.name === selectedOptions.classe
  );
  const allOrigins = dataRegistry.getOriginsBySupplements(supplements);
  const origin: Origin | undefined = allOrigins.find(
    (o: Origin) => o.name === selectedOptions.origin
  );
  const deity: Divindade | null = selectedOptions.devocao?.value
    ? DivindadeEnum[
        selectedOptions.devocao.value as keyof typeof DivindadeEnum
      ] || null
    : null;

  // Helper to calculate intelligence modifier (including racial modifiers)
  const getIntelligenceModifier = (): number => {
    if (!selections.baseAttributes || !race) return 0;
    const baseValue = selections.baseAttributes[Atributo.INTELIGENCIA];

    // Calculate base modifier from attribute value
    const baseModifier = Math.floor((baseValue - 10) / 2);

    // Calculate racial modifier for Intelligence (applied directly to modifier, not value)
    let racialModifier = 0;
    race.attributes.attrs.forEach((attr) => {
      if (attr.attr === Atributo.INTELIGENCIA) {
        racialModifier += attr.mod;
      } else if (
        attr.attr === 'any' &&
        selections.raceAttributes?.includes(Atributo.INTELIGENCIA)
      ) {
        racialModifier += attr.mod;
      }
    });

    // Racial modifiers are added directly to the modifier, not to the attribute value
    return baseModifier + racialModifier;
  };

  // Helper to get intelligence skills count
  const getIntelligenceSkillsCount = (): number => {
    const intMod = getIntelligenceModifier();
    return intMod > 0 ? intMod : 0;
  };

  // Determine which steps are needed
  const needsRaceAttributes = (): boolean => {
    if (!race) return false;
    return race.attributes.attrs.some((attr) => attr.attr === 'any');
  };

  const needsClassSkills = (): boolean => {
    if (!classe) return false;
    return classe.periciasrestantes.qtd > 0;
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

    // Check class abilities
    const hasClassRequirements = classe.abilities?.some((ability) => {
      const reqs = getPowerSelectionRequirements(ability);
      return reqs !== null;
    });
    if (hasClassRequirements) return true;

    // Check origin powers
    if (origin) {
      const originBenefits = origin.getPowersAndSkills
        ? origin.getPowersAndSkills([], origin)
        : { powers: { origin: [], general: [] }, skills: [] };

      const hasOriginRequirements = originBenefits.powers.origin.some(
        (power) => {
          const reqs = getPowerSelectionRequirements(power);
          return reqs !== null;
        }
      );
      if (hasOriginRequirements) return true;
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
      classe.name === 'Clérigo'
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

  // Helper to get spell info for classes without spellPath defined initially
  const getSpellInfo = (): {
    spellType: 'Arcane' | 'Divine' | 'Both';
    initialSpells: number;
  } | null => {
    if (!classe) return null;

    // For classes with spellPath already defined
    if (classe.spellPath) {
      return {
        spellType: classe.spellPath.spellType,
        initialSpells: classe.spellPath.initialSpells,
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

    return null;
  };

  // Build steps array
  const getSteps = (): string[] => {
    const stepsArray: string[] = [];
    stepsArray.push('Informações Básicas'); // Always first step
    stepsArray.push('Valores dos Atributos');
    if (needsRaceAttributes()) stepsArray.push('Atributos da Raça');
    if (needsSuragelAbilitySelection()) stepsArray.push('Habilidade Suraggel');
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
        // Reset with default attribute values
        baseAttributes: {
          [Atributo.FORCA]: 10,
          [Atributo.DESTREZA]: 10,
          [Atributo.CONSTITUICAO]: 10,
          [Atributo.INTELIGENCIA]: 10,
          [Atributo.SABEDORIA]: 10,
          [Atributo.CARISMA]: 10,
        },
      });
      // Initialize steps array
      setSteps(getSteps());
      setStepsInitialized(true); // Mark as initialized
    }
  }, [open]);

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
                [Atributo.FORCA]: 10,
                [Atributo.DESTREZA]: 10,
                [Atributo.CONSTITUICAO]: 10,
                [Atributo.INTELIGENCIA]: 10,
                [Atributo.SABEDORIA]: 10,
                [Atributo.CARISMA]: 10,
              }
            }
            raceAttributeChoices={selections.raceAttributes}
            onChange={(attrs) =>
              setSelections({ ...selections, baseAttributes: attrs })
            }
          />
        );
      }

      case 'Atributos da Raça': {
        if (!race) return null;
        const attrCount = race.attributes.attrs.filter(
          (a) => a.attr === 'any'
        ).length;
        return (
          <RaceAttributeStep
            selectedAttributes={selections.raceAttributes || []}
            onChange={(attrs) =>
              setSelections({ ...selections, raceAttributes: attrs })
            }
            requiredCount={attrCount}
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

      case 'Perícias da Classe':
        if (!classe) return null;
        return (
          <ClassSkillStep
            availableSkills={classe.periciasrestantes.list}
            selectedSkills={selections.classSkills || []}
            onChange={(skills) =>
              setSelections({ ...selections, classSkills: skills })
            }
            requiredCount={classe.periciasrestantes.qtd}
            className={classe.name}
          />
        );

      case 'Perícias por Inteligência': {
        // Get all skills except those already selected
        const allSkills = Object.values(Skill);
        const usedSkills = [
          ...(selections.classSkills || []),
          // TODO: Add skills from race, origin, etc. when available
        ];
        const availableSkills = allSkills.filter(
          (skill) => !usedSkills.includes(skill)
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
            usedSkills={selections.classSkills || []}
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
            selections={selections.powerEffectSelections || {}}
            onChange={(effectSelections) =>
              setSelections({
                ...selections,
                powerEffectSelections: effectSelections,
              })
            }
          />
        );

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

      case 'Atributos da Raça': {
        if (!race) return false;
        const attrCount = race.attributes.attrs.filter(
          (a) => a.attr === 'any'
        ).length;
        return (
          selections.raceAttributes?.length === attrCount &&
          new Set(selections.raceAttributes).size === attrCount
        );
      }

      case 'Habilidade Suraggel':
        // Always valid - either default ability or selected alternative
        return true;

      case 'Perícias da Classe':
        if (!classe) return false;
        return selections.classSkills?.length === classe.periciasrestantes.qtd;

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

        // Collect all requirements from race, class, and origin
        const allRequirements: Array<{
          type: string;
          pick: number;
        }> = [];

        // Check race abilities
        race.abilities.forEach((ability) => {
          const reqs = getPowerSelectionRequirements(ability);
          if (reqs) {
            allRequirements.push(...reqs.requirements);
          }
        });

        // Check class abilities
        classe.abilities?.forEach((ability) => {
          const reqs = getPowerSelectionRequirements(ability);
          if (reqs) {
            allRequirements.push(...reqs.requirements);
          }
        });

        // Check origin powers
        if (origin) {
          const originBenefits = origin.getPowersAndSkills
            ? origin.getPowersAndSkills([], origin)
            : { powers: { origin: [], general: [] }, skills: [] };

          originBenefits.powers.origin.forEach((power) => {
            const reqs = getPowerSelectionRequirements(power);
            if (reqs) {
              allRequirements.push(...reqs.requirements);
            }
          });
        }

        // Validate all requirements are met
        const effectSelections = selections.powerEffectSelections || {};
        return allRequirements.every((req) => {
          const { type, pick } = req;
          let count = 0;

          switch (type) {
            case 'learnSkill':
              count = effectSelections.skills?.length || 0;
              break;
            case 'addProficiency':
              count = effectSelections.proficiencies?.length || 0;
              break;
            case 'getGeneralPower':
              count = effectSelections.powers?.length || 0;
              break;
            case 'learnSpell':
            case 'learnAnySpellFromHighestCircle':
              count = effectSelections.spells?.length || 0;
              break;
            case 'increaseAttribute':
              count = effectSelections.attributes?.length || 0;
              break;
            case 'selectWeaponSpecialization':
              count = effectSelections.weapons?.length || 0;
              break;
            case 'selectFamiliar':
              count = effectSelections.familiars?.length || 0;
              break;
            case 'selectAnimalTotem':
              count = effectSelections.animalTotems?.length || 0;
              break;
            default:
              break;
          }

          return count >= pick;
        });
      }

      default:
        return false;
    }
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Last step - confirm
      onConfirm(selections);
    } else {
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
            <Stepper activeStep={activeStep}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

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
