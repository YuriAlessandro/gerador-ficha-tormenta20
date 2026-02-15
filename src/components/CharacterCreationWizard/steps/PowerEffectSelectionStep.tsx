import React, { useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
  Paper,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import Race from '@/interfaces/Race';
import { ClassDescription, ClassPower } from '@/interfaces/Class';
import Origin from '@/interfaces/Origin';
import CharacterSheet from '@/interfaces/CharacterSheet';
import {
  PowerSelectionRequirement,
  ManualPowerSelections,
} from '@/interfaces/PowerSelections';
import { GeneralPower } from '@/interfaces/Poderes';
import { Spell } from '@/interfaces/Spells';
import Divindade from '@/interfaces/Divindade';
import {
  getPowerSelectionRequirements,
  getFilteredAvailableOptions,
} from '@/functions/powers/manualPowerSelection';
import { FAMILIARS } from '@/data/systems/tormenta20/familiars';
import { ANIMAL_TOTEMS } from '@/data/systems/tormenta20/animalTotems';
import { isPowerAvailable } from '@/functions/powers';
import Skill from '@/interfaces/Skills';
import { dataRegistry } from '@/data/registry';
import { SupplementId } from '@/types/supplement.types';
import tormentaPowers from '@/data/systems/tormenta20/powers/tormentaPowers';
import VersatilSelectionField from './VersatilSelectionField';
import DeformidadeSelectionField from './DeformidadeSelectionField';
import MemoriaPostumaSelectionField from './MemoriaPostumaSelectionField';
import AlmaLivreSelectionField from './AlmaLivreSelectionField';

interface PowerEffectSelectionStepProps {
  race: Race;
  classe: ClassDescription;
  origin?: Origin;
  deity?: Divindade | null;
  selectedDeityPowers?: string[];
  // Each power has its own SelectionOptions keyed by power name
  selections: ManualPowerSelections;
  onChange: (selections: ManualPowerSelections) => void;
  // Optional selected power for level-up wizard
  selectedPower?: ClassPower | GeneralPower;
  powerSource?: 'class' | 'general';
  // Optional actual sheet for better filtering in level-up context
  actualSheet?: CharacterSheet;
  // Optional arcanista subtype for requirement checking
  arcanistaSubtype?: string;
  // Skip race abilities (useful for level-up where race abilities are already applied)
  skipRaceAbilities?: boolean;
  // Only show class abilities for this specific level (useful for level-up)
  classAbilityLevel?: number;
  // Active supplements for power filtering
  supplements?: SupplementId[];
  // Skills already selected in wizard (for requirement checking)
  usedSkills?: Skill[];
}

const PowerEffectSelectionStep: React.FC<PowerEffectSelectionStepProps> = ({
  race,
  classe,
  origin,
  deity,
  selectedDeityPowers,
  selections,
  onChange,
  selectedPower,
  powerSource,
  actualSheet,
  arcanistaSubtype,
  skipRaceAbilities = false,
  classAbilityLevel,
  supplements = [SupplementId.TORMENTA20_CORE],
  usedSkills = [],
}) => {
  // Search query state for each requirement (keyed by requirement index)
  const [searchQueries, setSearchQueries] = useState<Record<number, string>>(
    {}
  );

  // Helper to update search query for a specific requirement
  const updateSearchQuery = (requirementIndex: number, query: string) => {
    setSearchQueries((prev) => ({
      ...prev,
      [requirementIndex]: query,
    }));
  };

  // Collect all powers that need manual selection
  const allRequirements: Array<{
    powerName: string;
    source: 'race' | 'class' | 'origin';
    requirements: Array<{
      type:
        | 'learnSkill'
        | 'addProficiency'
        | 'getGeneralPower'
        | 'learnSpell'
        | 'learnAnySpellFromHighestCircle'
        | 'increaseAttribute'
        | 'selectWeaponSpecialization'
        | 'selectFamiliar'
        | 'selectAnimalTotem'
        | 'buildGolpePessoal'
        | 'learnClassAbility'
        | 'getClassPower'
        | 'humanoVersatil'
        | 'lefouDeformidade'
        | 'osteonMemoriaPostuma'
        | 'chooseFromOptions'
        | 'almaLivreSelectClass';
      pick: number;
      label: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      availableOptions: any[];
      metadata?: {
        allowedType?: 'Arcane' | 'Divine' | 'Both';
        schools?: string[];
        optionKey?: string;
        linkedTo?: string;
      };
    }>;
  }> = [];

  // Check selected power first (for level-up wizard)
  if (selectedPower) {
    const reqs = getPowerSelectionRequirements(selectedPower);
    if (reqs) {
      allRequirements.push({
        powerName: selectedPower.name,
        source: powerSource === 'general' ? 'origin' : 'class', // Map to existing source types
        requirements: reqs.requirements,
      });
    }
  }

  // Check race abilities (skip during level-up since they're already applied at level 1)
  if (!skipRaceAbilities) {
    race.abilities.forEach((ability) => {
      const reqs = getPowerSelectionRequirements(ability);
      if (reqs) {
        allRequirements.push({
          powerName: ability.name,
          source: 'race',
          requirements: reqs.requirements,
        });
      }
    });
  }

  // Check class abilities: use originalAbilities for level-up (has all levels), or abilities for initial creation
  const allClassAbilities = classe.originalAbilities || classe.abilities || [];
  const classAbilitiesToCheck = classAbilityLevel
    ? allClassAbilities.filter((ability) => ability.nivel === classAbilityLevel)
    : (classe.abilities || []).filter((ability) => ability.nivel <= 1);

  classAbilitiesToCheck?.forEach((ability) => {
    const reqs = getPowerSelectionRequirements(ability);
    if (reqs) {
      allRequirements.push({
        powerName: ability.name,
        source: 'class',
        requirements: reqs.requirements,
      });
    }
  });

  // Check origin powers (if exists)
  if (origin) {
    // Get origin powers - for regional origins this will be all of them
    const originBenefits = origin.getPowersAndSkills
      ? origin.getPowersAndSkills([], origin, true)
      : { powers: { origin: [], general: [] }, skills: [] };

    // Check origin-specific powers
    originBenefits.powers.origin.forEach((power) => {
      const reqs = getPowerSelectionRequirements(power);
      if (reqs) {
        allRequirements.push({
          powerName: power.name,
          source: 'origin',
          requirements: reqs.requirements,
        });
      }
    });
  }

  // Check deity granted powers (if selected)
  if (deity && selectedDeityPowers && selectedDeityPowers.length > 0) {
    const deityPowers = deity.poderes.filter((p) =>
      selectedDeityPowers.includes(p.name)
    );
    deityPowers.forEach((power) => {
      const reqs = getPowerSelectionRequirements(power);
      if (reqs) {
        allRequirements.push({
          powerName: power.name,
          source: 'origin', // Use 'origin' as source type for deity powers (closest match)
          requirements: reqs.requirements,
        });
      }
    });
  }

  // If no requirements, show message
  if (allRequirements.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant='body1' color='text.secondary'>
          Nenhum dos seus poderes requer seleção manual de efeitos neste nível.
        </Typography>
        <Alert severity='success'>
          Você pode continuar para o próximo passo.
        </Alert>
      </Box>
    );
  }

  // Use actual sheet if provided, otherwise create mock sheet
  const sheetForFiltering =
    actualSheet ||
    ({
      skills: usedSkills,
      completeSkills: usedSkills,
      classe: {
        name: classe.name,
        subname: arcanistaSubtype,
        proficiencias: classe.proficiencias || [],
        abilities: classe.abilities || [],
        spellPath: classe.spellPath,
      },
      raca: {
        name: race.name,
      },
      generalPowers: [],
      classPowers: [],
      origin: undefined,
      spells: [],
      nivel: 1,
      atributos: {
        Força: { value: 10 },
        Destreza: { value: 10 },
        Constituição: { value: 10 },
        Inteligência: { value: 10 },
        Sabedoria: { value: 10 },
        Carisma: { value: 10 },
      },
      sheetActionHistory: [],
    } as unknown as CharacterSheet);

  // Helper to get name from item (string or object)
  const getItemName = (item: string | object): string => {
    if (typeof item === 'string') {
      return item;
    }
    if ('name' in item) {
      return (item as { name: string }).name;
    }
    if ('nome' in item) {
      return (item as { nome: string }).nome;
    }
    return '';
  };

  // Helper to filter options based on search query
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filterOptions = (options: any[], searchQuery: string): any[] => {
    if (!searchQuery) return options;

    const lowerQuery = searchQuery.toLowerCase();
    return options.filter((option) => {
      const name = getItemName(option).toLowerCase();
      let description = '';

      // Only check for description if option is an object (not a string or primitive)
      if (typeof option === 'object' && option !== null) {
        if ('description' in option) {
          description = option.description.toLowerCase();
        } else if ('descricao' in option) {
          description = option.descricao.toLowerCase();
        }
      }

      return name.includes(lowerQuery) || description.includes(lowerQuery);
    });
  };

  // Helper to handle single/multiple selection for a specific power
  const handleSelection = (
    powerName: string,
    selectionType: string,
    item: string | object,
    isChecked: boolean,
    pick: number
  ) => {
    // Get current selections for this power
    const powerSelections = selections[powerName] || {};
    let currentItems: Array<string | object> = [];
    let newItems: Array<string | object> = [];
    let updateKey = '';

    // Determine which selection array to update
    switch (selectionType) {
      case 'learnSkill':
        currentItems = powerSelections.skills || [];
        updateKey = 'skills';
        break;
      case 'addProficiency':
        currentItems = powerSelections.proficiencies || [];
        updateKey = 'proficiencies';
        break;
      case 'getGeneralPower':
        currentItems = powerSelections.powers || [];
        updateKey = 'powers';
        break;
      case 'learnSpell':
      case 'learnAnySpellFromHighestCircle':
        currentItems = powerSelections.spells || [];
        updateKey = 'spells';
        break;
      case 'increaseAttribute':
        currentItems = powerSelections.attributes || [];
        updateKey = 'attributes';
        break;
      case 'selectWeaponSpecialization':
        currentItems = powerSelections.weapons || [];
        updateKey = 'weapons';
        break;
      case 'selectFamiliar':
        currentItems = powerSelections.familiars || [];
        updateKey = 'familiars';
        break;
      case 'selectAnimalTotem':
        currentItems = powerSelections.animalTotems || [];
        updateKey = 'animalTotems';
        break;
      case 'chooseFromOptions':
        currentItems = powerSelections.chosenOption || [];
        updateKey = 'chosenOption';
        break;
      default:
        return;
    }

    // Handle selection logic
    if (pick === 1) {
      // Single selection - replace
      newItems = isChecked ? [item] : [];
    } else if (isChecked) {
      // Multiple selection - add if under limit
      if (currentItems.length < pick) {
        newItems = [...currentItems, item];
      } else {
        newItems = currentItems;
      }
    } else {
      // Remove item
      newItems = currentItems.filter((existing) => {
        const existingName = getItemName(existing);
        const itemName = getItemName(item);
        return existingName !== itemName;
      });
    }

    // Update selections for this specific power
    onChange({
      ...selections,
      [powerName]: {
        ...powerSelections,
        [updateKey]: newItems,
      },
    });
  };

  // Helper to check if item is selected for a specific power
  const isItemSelected = (
    powerName: string,
    selectionType: string,
    item: string | object
  ): boolean => {
    const powerSelections = selections[powerName] || {};
    let currentItems: Array<string | object> = [];

    switch (selectionType) {
      case 'learnSkill':
        currentItems = powerSelections.skills || [];
        break;
      case 'addProficiency':
        currentItems = powerSelections.proficiencies || [];
        break;
      case 'getGeneralPower':
        currentItems = powerSelections.powers || [];
        break;
      case 'learnSpell':
      case 'learnAnySpellFromHighestCircle':
        currentItems = powerSelections.spells || [];
        break;
      case 'increaseAttribute':
        currentItems = powerSelections.attributes || [];
        break;
      case 'selectWeaponSpecialization':
        currentItems = powerSelections.weapons || [];
        break;
      case 'selectFamiliar':
        currentItems = powerSelections.familiars || [];
        break;
      case 'selectAnimalTotem':
        currentItems = powerSelections.animalTotems || [];
        break;
      case 'chooseFromOptions':
        currentItems = powerSelections.chosenOption || [];
        break;
      default:
        return false;
    }

    const itemName = getItemName(item);

    return currentItems.some((existing) => {
      const existingName = getItemName(existing);
      return existingName === itemName;
    });
  };

  // Helper to count current selections for a specific power
  const getSelectionCount = (
    powerName: string,
    selectionType: string
  ): number => {
    const powerSelections = selections[powerName] || {};
    switch (selectionType) {
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
      case 'chooseFromOptions':
        return powerSelections.chosenOption?.length || 0;
      default:
        return 0;
    }
  };

  // Render a single requirement for a specific power
  const renderRequirement = (
    powerName: string,
    requirement: {
      type:
        | 'learnSkill'
        | 'addProficiency'
        | 'getGeneralPower'
        | 'learnSpell'
        | 'learnAnySpellFromHighestCircle'
        | 'increaseAttribute'
        | 'selectWeaponSpecialization'
        | 'selectFamiliar'
        | 'selectAnimalTotem'
        | 'buildGolpePessoal'
        | 'learnClassAbility'
        | 'getClassPower'
        | 'humanoVersatil'
        | 'lefouDeformidade'
        | 'osteonMemoriaPostuma'
        | 'chooseFromOptions'
        | 'almaLivreSelectClass';
      pick: number;
      label: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      availableOptions: any[];
      metadata?: {
        allowedType?: 'Arcane' | 'Divine' | 'Both';
        schools?: string[];
        optionKey?: string;
        linkedTo?: string;
      };
    },
    requirementIndex: number
  ) => {
    const { type, pick, label } = requirement;
    const allAvailableOptions = getFilteredAvailableOptions(
      requirement,
      sheetForFiltering,
      supplements
    );

    // Get search query for this requirement
    const searchQuery = searchQueries[requirementIndex] || '';

    // Filter options if search query exists
    const availableOptions = filterOptions(allAvailableOptions, searchQuery);

    // Determine if we should show search (>15 options)
    const shouldShowSearch = allAvailableOptions.length > 15;

    const isSingleSelection = pick === 1;
    const currentCount = getSelectionCount(powerName, type);
    const powerSelections = selections[powerName] || {};

    if (allAvailableOptions.length === 0) {
      return (
        <Box key={requirementIndex} mb={2}>
          <Typography variant='subtitle1' gutterBottom>
            {label}
          </Typography>
          <Alert severity='info'>
            Você já possui todas as opções disponíveis deste poder. Nenhuma
            seleção necessária.
          </Alert>
        </Box>
      );
    }

    // Render familiar selection specially with descriptions
    if (type === 'selectFamiliar') {
      return (
        <Box key={requirementIndex} mb={2}>
          <Typography variant='subtitle1' gutterBottom>
            {label}
          </Typography>
          <Typography variant='caption' color='text.secondary' display='block'>
            Selecionados: {currentCount} / {pick}
          </Typography>
          <FormControl component='fieldset' fullWidth>
            <RadioGroup
              value={powerSelections.familiars?.[0] || ''}
              onChange={(e) =>
                handleSelection(powerName, type, e.target.value, true, pick)
              }
            >
              {availableOptions.map((familiarKey) => {
                const familiar = FAMILIARS[familiarKey];
                const isSelected =
                  powerSelections.familiars?.[0] === familiarKey;
                return (
                  <FormControlLabel
                    key={familiarKey}
                    value={familiarKey}
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant='body1'>{familiar.name}</Typography>
                        <Typography variant='body2' color='text.secondary'>
                          {familiar.description}
                        </Typography>
                      </Box>
                    }
                    sx={{
                      ml: 0,
                      py: 1,
                      px: 1,
                      borderRadius: 1,
                      transition: 'background-color 0.2s',
                      ...(isSelected && {
                        bgcolor: 'action.selected',
                        borderLeft: 3,
                        borderColor: 'primary.main',
                      }),
                    }}
                  />
                );
              })}
            </RadioGroup>
          </FormControl>
        </Box>
      );
    }

    // Render animal totem selection specially with descriptions
    if (type === 'selectAnimalTotem') {
      return (
        <Box key={requirementIndex} mb={2}>
          <Typography variant='subtitle1' gutterBottom>
            {label}
          </Typography>
          <Typography variant='caption' color='text.secondary' display='block'>
            Selecionados: {currentCount} / {pick}
          </Typography>
          <FormControl component='fieldset' fullWidth>
            <RadioGroup
              value={powerSelections.animalTotems?.[0] || ''}
              onChange={(e) =>
                handleSelection(powerName, type, e.target.value, true, pick)
              }
            >
              {availableOptions.map((totemKey) => {
                const totem = ANIMAL_TOTEMS[totemKey];
                const isSelected =
                  powerSelections.animalTotems?.[0] === totemKey;
                return (
                  <FormControlLabel
                    key={totemKey}
                    value={totemKey}
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant='body1'>{totem.name}</Typography>
                        <Typography variant='body2' color='text.secondary'>
                          {totem.description}
                        </Typography>
                      </Box>
                    }
                    sx={{
                      ml: 0,
                      py: 1,
                      px: 1,
                      borderRadius: 1,
                      transition: 'background-color 0.2s',
                      ...(isSelected && {
                        bgcolor: 'action.selected',
                        borderLeft: 3,
                        borderColor: 'primary.main',
                      }),
                    }}
                  />
                );
              })}
            </RadioGroup>
          </FormControl>
        </Box>
      );
    }

    // Render chooseFromOptions with radio buttons (name + description)
    if (type === 'chooseFromOptions') {
      const options = availableOptions as Array<{ name: string; text: string }>;
      return (
        <Box key={requirementIndex} mb={2}>
          <Typography variant='subtitle1' gutterBottom>
            {label}
          </Typography>
          <FormControl component='fieldset' fullWidth>
            <RadioGroup
              value={powerSelections.chosenOption?.[0] || ''}
              onChange={(e) =>
                handleSelection(powerName, type, e.target.value, true, pick)
              }
            >
              {options.map((option) => {
                const isSelected =
                  powerSelections.chosenOption?.[0] === option.name;
                return (
                  <FormControlLabel
                    key={option.name}
                    value={option.name}
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant='body1' fontWeight='bold'>
                          {option.name}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          {option.text}
                        </Typography>
                      </Box>
                    }
                    sx={{
                      ml: 0,
                      py: 1,
                      px: 1,
                      borderRadius: 1,
                      transition: 'background-color 0.2s',
                      ...(isSelected && {
                        bgcolor: 'action.selected',
                        borderLeft: 3,
                        borderColor: 'primary.main',
                      }),
                    }}
                  />
                );
              })}
            </RadioGroup>
          </FormControl>
        </Box>
      );
    }

    // Render Versátil (Humano) selection with custom component
    if (type === 'humanoVersatil') {
      // Get available skills from the filtered options
      const availableSkillsForVersatil =
        allAvailableOptions as unknown as Skill[];

      // Get available powers for Versátil using dataRegistry
      const allPowers = dataRegistry.getPowersBySupplements(supplements);
      const allGeneralPowers = Object.values(allPowers).flat();
      const existingGeneralPowers = sheetForFiltering.generalPowers || [];
      const availablePowersForVersatil = allGeneralPowers.filter((power) => {
        const isRepeatedPower = existingGeneralPowers.find(
          (existingPower) => existingPower.name === power.name
        );
        if (isRepeatedPower) {
          return power.allowSeveralPicks;
        }
        return isPowerAvailable(sheetForFiltering, power);
      });

      return (
        <Box key={requirementIndex} mb={2}>
          <VersatilSelectionField
            availableSkills={availableSkillsForVersatil}
            availablePowers={availablePowersForVersatil}
            selections={powerSelections}
            onChange={(newSelections) => {
              onChange({
                ...selections,
                [powerName]: newSelections,
              });
            }}
          />
        </Box>
      );
    }

    // Render Deformidade (Lefou) selection with custom component
    if (type === 'lefouDeformidade') {
      const availableSkillsForDeformidade =
        allAvailableOptions as unknown as Skill[];

      // Get tormenta powers available for Deformidade
      const allTormentaPowers = Object.values(tormentaPowers);
      const existingPowers = sheetForFiltering.generalPowers || [];
      const availableTormentaPowers = allTormentaPowers.filter((power) => {
        const isRepeatedPower = existingPowers.find(
          (existingPower) => existingPower.name === power.name
        );
        if (isRepeatedPower) {
          return power.allowSeveralPicks;
        }
        return isPowerAvailable(sheetForFiltering, power);
      });

      return (
        <Box key={requirementIndex} mb={2}>
          <DeformidadeSelectionField
            availableSkills={availableSkillsForDeformidade}
            availablePowers={availableTormentaPowers}
            selections={powerSelections}
            onChange={(newSelections) => {
              onChange({
                ...selections,
                [powerName]: newSelections,
              });
            }}
          />
        </Box>
      );
    }

    // Render Memória Póstuma (Osteon/Soterrado) selection with custom component
    if (type === 'osteonMemoriaPostuma') {
      const availableSkillsForMP = allAvailableOptions as unknown as Skill[];

      // Get available general powers
      const allPowersForMP = dataRegistry.getPowersBySupplements(supplements);
      const allGeneralPowersForMP = Object.values(allPowersForMP).flat();
      const existingGeneralPowersForMP = sheetForFiltering.generalPowers || [];
      const availablePowersForMP = allGeneralPowersForMP.filter((power) => {
        const isRepeatedPower = existingGeneralPowersForMP.find(
          (existingPower) => existingPower.name === power.name
        );
        if (isRepeatedPower) {
          return power.allowSeveralPicks;
        }
        return isPowerAvailable(sheetForFiltering, power);
      });

      // Get available races (exclude Golem, Golem Desperto, Osteon, Soterrado)
      const allRacesForMP = dataRegistry.getRacesBySupplements(supplements);
      const excludedRaceNames = [
        'Golem',
        'Golem Desperto',
        'Osteon',
        'Soterrado',
      ];
      const availableRacesForMP = allRacesForMP.filter(
        (r) => !excludedRaceNames.includes(r.name)
      );

      return (
        <Box key={requirementIndex} mb={2}>
          <MemoriaPostumaSelectionField
            availableRaces={availableRacesForMP}
            availableSkills={availableSkillsForMP}
            availablePowers={availablePowersForMP}
            selections={powerSelections}
            onChange={(newSelections) => {
              onChange({
                ...selections,
                [powerName]: newSelections,
              });
            }}
          />
        </Box>
      );
    }

    // Render Alma Livre class + power selection
    if (type === 'almaLivreSelectClass') {
      const allClassesForAL = dataRegistry.getClassesBySupplements(supplements);
      const availableClassesForAL = allClassesForAL.filter(
        (c) => c.name !== sheetForFiltering.classe.name
      );

      return (
        <Box key={requirementIndex} mb={2}>
          <AlmaLivreSelectionField
            availableClasses={availableClassesForAL}
            supplements={supplements}
            selections={powerSelections}
            onChange={(newSelections) => {
              onChange({
                ...selections,
                [powerName]: newSelections,
              });
            }}
          />
        </Box>
      );
    }

    // For items with descriptions (powers, spells)
    const hasDescriptions = availableOptions.some(
      (opt) =>
        typeof opt === 'object' &&
        opt !== null &&
        ('description' in opt || 'descricao' in opt)
    );

    // Helper to get nested requirements from a selected power
    const getNestedRequirements = (
      selectedPowerObj: GeneralPower | null
    ): PowerSelectionRequirement[] => {
      if (!selectedPowerObj) return [];
      const nestedReqs = getPowerSelectionRequirements(selectedPowerObj);
      return nestedReqs?.requirements || [];
    };

    // Render nested spell selection for powers with learnSpell
    // Nested powers (e.g., "Prática Arcana" selected via "Bênção de Kallyadranoch")
    // store their selections under their own name
    const renderNestedSpellSelection = (
      nestedPower: GeneralPower,
      nestedReq: PowerSelectionRequirement
    ) => {
      // Filter available spells (exclude already known)
      const filteredSpells = getFilteredAvailableOptions(
        nestedReq,
        sheetForFiltering,
        supplements
      ) as Spell[];

      const nestedSearchKey = `nested-${nestedPower.name}-spell`;
      const nestedSearchQuery =
        searchQueries[nestedSearchKey as unknown as number] || '';
      const displayedSpells = filterOptions(filteredSpells, nestedSearchQuery);

      // Get selections for the nested power (stored under the nested power's name)
      const nestedPowerSelections = selections[nestedPower.name] || {};
      const selectedSpellName =
        nestedPowerSelections.spells && nestedPowerSelections.spells.length > 0
          ? getItemName(nestedPowerSelections.spells[0])
          : '';

      return (
        <Paper
          key={`nested-${nestedPower.name}-learnSpell`}
          elevation={0}
          sx={{
            mt: 2,
            p: 2,
            bgcolor: 'action.hover',
            borderLeft: 3,
            borderColor: 'secondary.main',
          }}
        >
          <Typography variant='subtitle2' color='secondary' gutterBottom>
            ✨ O poder selecionado requer escolha adicional:
          </Typography>
          <Typography variant='subtitle1' gutterBottom>
            {nestedReq.label} (de {nestedPower.name})
          </Typography>

          {filteredSpells.length > 15 && (
            <TextField
              fullWidth
              size='small'
              placeholder='Buscar magia por nome...'
              value={nestedSearchQuery}
              onChange={(e) =>
                setSearchQueries((prev) => ({
                  ...prev,
                  [nestedSearchKey]: e.target.value,
                }))
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
          )}

          {displayedSpells.length === 0 ? (
            <Alert severity='info' sx={{ mt: 1 }}>
              {nestedSearchQuery
                ? `Nenhuma magia encontrada para "${nestedSearchQuery}"`
                : 'Você já conhece todas as magias disponíveis.'}
            </Alert>
          ) : (
            <FormControl component='fieldset' fullWidth>
              <RadioGroup
                value={selectedSpellName}
                onChange={(e) => {
                  const spell = displayedSpells.find(
                    (s) => getItemName(s) === e.target.value
                  );
                  if (spell) {
                    // Store under the nested power's name, not the parent power
                    handleSelection(
                      nestedPower.name,
                      'learnSpell',
                      spell,
                      true,
                      nestedReq.pick
                    );
                  }
                }}
              >
                {displayedSpells.map((spell) => {
                  const spellName = getItemName(spell);
                  const isSelected = selectedSpellName === spellName;
                  return (
                    <FormControlLabel
                      key={spellName}
                      value={spellName}
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant='body1'>{spellName}</Typography>
                          {spell.description && (
                            <Typography variant='body2' color='text.secondary'>
                              {spell.description.length > 150
                                ? `${spell.description.substring(0, 150)}...`
                                : spell.description}
                            </Typography>
                          )}
                        </Box>
                      }
                      sx={{
                        ml: 0,
                        py: 1,
                        px: 1,
                        borderRadius: 1,
                        transition: 'background-color 0.2s',
                        ...(isSelected && {
                          bgcolor: 'action.selected',
                          borderLeft: 3,
                          borderColor: 'secondary.main',
                        }),
                      }}
                    />
                  );
                })}
              </RadioGroup>
            </FormControl>
          )}
        </Paper>
      );
    };

    if (isSingleSelection) {
      // Single selection - use radio buttons
      const getValue = () => {
        let firstItem: string | object | undefined;

        switch (type) {
          case 'learnSkill':
            firstItem = powerSelections.skills?.[0];
            break;
          case 'addProficiency':
            firstItem = powerSelections.proficiencies?.[0];
            break;
          case 'getGeneralPower':
            firstItem = powerSelections.powers?.[0];
            break;
          case 'learnSpell':
          case 'learnAnySpellFromHighestCircle':
            firstItem = powerSelections.spells?.[0];
            break;
          case 'increaseAttribute':
            firstItem = powerSelections.attributes?.[0];
            break;
          case 'selectWeaponSpecialization':
            firstItem = powerSelections.weapons?.[0];
            break;
          default:
            firstItem = undefined;
        }

        if (!firstItem) return '';
        return getItemName(firstItem);
      };

      // For getGeneralPower, check if selected power has nested requirements
      const selectedPowerForNested =
        type === 'getGeneralPower' && powerSelections.powers?.[0]
          ? (availableOptions.find(
              (opt) =>
                getItemName(opt) === getItemName(powerSelections.powers![0])
            ) as GeneralPower | undefined)
          : null;

      const nestedRequirements = selectedPowerForNested
        ? getNestedRequirements(selectedPowerForNested)
        : [];

      // Filter for learnSpell requirements
      const nestedSpellReqs = nestedRequirements.filter(
        (req) => req.type === 'learnSpell'
      );

      return (
        <Box key={requirementIndex} mb={2}>
          <Typography variant='subtitle1' gutterBottom>
            {label}
          </Typography>

          {shouldShowSearch && (
            <>
              <TextField
                fullWidth
                size='small'
                placeholder='Buscar por nome ou descrição...'
                value={searchQuery}
                onChange={(e) =>
                  updateSearchQuery(requirementIndex, e.target.value)
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              {availableOptions.length === 0 && searchQuery && (
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mb: 2 }}
                >
                  Nenhuma opção encontrada para &quot;{searchQuery}&quot;
                </Typography>
              )}

              {searchQuery && availableOptions.length > 0 && (
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mb: 2 }}
                >
                  {availableOptions.length}{' '}
                  {availableOptions.length === 1
                    ? 'opção encontrada'
                    : 'opções encontradas'}
                </Typography>
              )}
            </>
          )}

          <FormControl component='fieldset' fullWidth>
            <RadioGroup
              value={getValue()}
              onChange={(e) => {
                const selectedOption = availableOptions.find((opt) => {
                  const optName = getItemName(opt);
                  return optName === e.target.value;
                });
                if (selectedOption) {
                  handleSelection(powerName, type, selectedOption, true, pick);
                  // Clear nested power's spell selection when power changes (nested requirement may change)
                  if (type === 'getGeneralPower') {
                    // Get the old selected power to clear its nested selections
                    const oldSelectedPower = powerSelections.powers?.[0];
                    if (oldSelectedPower) {
                      const oldPowerName = getItemName(oldSelectedPower);
                      // Clear the old nested power's selections if it exists
                      if (selections[oldPowerName]) {
                        onChange({
                          ...selections,
                          [powerName]: {
                            ...powerSelections,
                            powers: [selectedOption],
                          },
                          [oldPowerName]: {}, // Reset old nested power selections
                        });
                        return;
                      }
                    }
                    // Just update this power's selection
                    onChange({
                      ...selections,
                      [powerName]: {
                        ...powerSelections,
                        powers: [selectedOption],
                      },
                    });
                  }
                }
              }}
            >
              {availableOptions.map((option) => {
                const optionName = getItemName(option);
                const isSelected = getValue() === optionName;

                let optionDescription: string | null = null;
                if (typeof option !== 'string') {
                  if ('description' in option) {
                    optionDescription = (option as { description: string })
                      .description;
                  } else if ('descricao' in option) {
                    optionDescription = (option as { descricao: string })
                      .descricao;
                  }
                }

                return (
                  <FormControlLabel
                    key={optionName}
                    value={optionName}
                    control={<Radio />}
                    label={
                      hasDescriptions ? (
                        <Box>
                          <Typography variant='body1'>{optionName}</Typography>
                          {optionDescription && (
                            <Typography variant='body2' color='text.secondary'>
                              {optionDescription}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        optionName
                      )
                    }
                    sx={{
                      ml: 0,
                      py: 1,
                      px: 1,
                      borderRadius: 1,
                      transition: 'background-color 0.2s',
                      ...(isSelected && {
                        bgcolor: 'action.selected',
                        borderLeft: 3,
                        borderColor: 'primary.main',
                      }),
                    }}
                  />
                );
              })}
            </RadioGroup>
          </FormControl>

          {/* Render nested spell requirements if selected power has them */}
          {selectedPowerForNested &&
            nestedSpellReqs.map((nestedReq) =>
              renderNestedSpellSelection(selectedPowerForNested, nestedReq)
            )}
        </Box>
      );
    }

    // Multiple selection - use checkboxes
    return (
      <Box key={requirementIndex} mb={2}>
        <Typography variant='subtitle1' gutterBottom>
          {label}
        </Typography>
        <Typography variant='caption' color='text.secondary' display='block'>
          Selecionados: {currentCount} / {pick}
        </Typography>

        {shouldShowSearch && (
          <>
            <TextField
              fullWidth
              size='small'
              placeholder='Buscar por nome ou descrição...'
              value={searchQuery}
              onChange={(e) =>
                updateSearchQuery(requirementIndex, e.target.value)
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mt: 1, mb: 2 }}
            />

            {availableOptions.length === 0 && searchQuery && (
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                Nenhuma opção encontrada para &quot;{searchQuery}&quot;
              </Typography>
            )}

            {searchQuery && availableOptions.length > 0 && (
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                {availableOptions.length}{' '}
                {availableOptions.length === 1
                  ? 'opção encontrada'
                  : 'opções encontradas'}
              </Typography>
            )}
          </>
        )}

        <FormControl component='fieldset' fullWidth>
          <FormGroup>
            {availableOptions.map((option) => {
              const optionName = getItemName(option);

              let optionDescription: string | null = null;
              if (typeof option !== 'string') {
                if ('description' in option) {
                  optionDescription = (option as { description: string })
                    .description;
                } else if ('descricao' in option) {
                  optionDescription = (option as { descricao: string })
                    .descricao;
                }
              }

              const isSelected = isItemSelected(powerName, type, option);
              const isDisabled = !isSelected && currentCount >= pick;

              return (
                <FormControlLabel
                  key={optionName}
                  control={
                    <Checkbox
                      checked={isSelected}
                      onChange={(e) =>
                        handleSelection(
                          powerName,
                          type,
                          option,
                          e.target.checked,
                          pick
                        )
                      }
                      disabled={isDisabled}
                    />
                  }
                  label={
                    hasDescriptions ? (
                      <Box>
                        <Typography variant='body1'>{optionName}</Typography>
                        {optionDescription && (
                          <Typography variant='body2' color='text.secondary'>
                            {optionDescription}
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      optionName
                    )
                  }
                  sx={{
                    ml: 0,
                    py: 1,
                    px: 1,
                    borderRadius: 1,
                    transition: 'background-color 0.2s',
                    ...(isSelected && {
                      bgcolor: 'action.selected',
                      borderLeft: 3,
                      borderColor: 'primary.main',
                    }),
                  }}
                />
              );
            })}
          </FormGroup>
        </FormControl>
      </Box>
    );
  };

  const getSourceLabel = (source: 'race' | 'class' | 'origin'): string => {
    switch (source) {
      case 'race':
        return 'Raça';
      case 'class':
        return 'Classe';
      case 'origin':
        return 'Origem';
      default:
        return '';
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant='body1' color='text.secondary'>
        Alguns dos seus poderes requerem seleções manuais. Escolha as opções
        abaixo para cada poder:
      </Typography>

      {allRequirements.map((powerReq) => (
        <Accordion
          key={`${powerReq.source}-${powerReq.powerName}`}
          defaultExpanded={allRequirements.length === 1}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant='h6'>{powerReq.powerName}</Typography>
              <Typography variant='caption' color='text.secondary'>
                {getSourceLabel(powerReq.source)} •{' '}
                {powerReq.requirements.length} seleç
                {powerReq.requirements.length > 1 ? 'ões' : 'ão'} necessária
                {powerReq.requirements.length > 1 ? 's' : ''}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {powerReq.requirements.map((requirement, reqIndex) => (
              <React.Fragment
                key={`${powerReq.powerName}-req-${requirement.type}-${requirement.label}`}
              >
                {renderRequirement(powerReq.powerName, requirement, reqIndex)}
                {reqIndex < powerReq.requirements.length - 1 && (
                  <Divider sx={{ my: 2 }} />
                )}
              </React.Fragment>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default PowerEffectSelectionStep;
