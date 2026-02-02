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
  SelectionOptions,
  PowerSelectionRequirement,
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

interface PowerEffectSelectionStepProps {
  race: Race;
  classe: ClassDescription;
  origin?: Origin;
  deity?: Divindade | null;
  selectedDeityPowers?: string[];
  selections: SelectionOptions;
  onChange: (selections: SelectionOptions) => void;
  // Optional selected power for level-up wizard
  selectedPower?: ClassPower | GeneralPower;
  powerSource?: 'class' | 'general';
  // Optional actual sheet for better filtering in level-up context
  actualSheet?: CharacterSheet;
  // Optional arcanista subtype for requirement checking
  arcanistaSubtype?: string;
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
        | 'getClassPower';
      pick: number;
      label: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      availableOptions: any[];
      metadata?: {
        allowedType?: 'Arcane' | 'Divine' | 'Both';
        schools?: string[];
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

  // Check race abilities
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

  // Check class abilities
  classe.abilities?.forEach((ability) => {
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
      skills: [],
      completeSkills: [],
      classe: {
        name: classe.name,
        subname: arcanistaSubtype,
        proficiencias: [],
        spellPath: classe.spellPath,
      },
      raca: {
        name: race.name,
      },
      generalPowers: [],
      spells: [],
      nivel: 1,
      atributos: {
        Força: 10,
        Destreza: 10,
        Constituição: 10,
        Inteligência: 10,
        Sabedoria: 10,
        Carisma: 10,
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

  // Helper to handle single/multiple selection
  const handleSelection = (
    selectionType: string,
    item: string | object,
    isChecked: boolean,
    pick: number
  ) => {
    let currentItems: Array<string | object> = [];
    let newItems: Array<string | object> = [];
    let updateKey = '';

    // Determine which selection array to update
    switch (selectionType) {
      case 'learnSkill':
        currentItems = selections.skills || [];
        updateKey = 'skills';
        break;
      case 'addProficiency':
        currentItems = selections.proficiencies || [];
        updateKey = 'proficiencies';
        break;
      case 'getGeneralPower':
        currentItems = selections.powers || [];
        updateKey = 'powers';
        break;
      case 'learnSpell':
      case 'learnAnySpellFromHighestCircle':
        currentItems = selections.spells || [];
        updateKey = 'spells';
        break;
      case 'increaseAttribute':
        currentItems = selections.attributes || [];
        updateKey = 'attributes';
        break;
      case 'selectWeaponSpecialization':
        currentItems = selections.weapons || [];
        updateKey = 'weapons';
        break;
      case 'selectFamiliar':
        currentItems = selections.familiars || [];
        updateKey = 'familiars';
        break;
      case 'selectAnimalTotem':
        currentItems = selections.animalTotems || [];
        updateKey = 'animalTotems';
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

    // Update selections
    onChange({
      ...selections,
      [updateKey]: newItems,
    });
  };

  // Helper to check if item is selected
  const isItemSelected = (
    selectionType: string,
    item: string | object
  ): boolean => {
    let currentItems: Array<string | object> = [];

    switch (selectionType) {
      case 'learnSkill':
        currentItems = selections.skills || [];
        break;
      case 'addProficiency':
        currentItems = selections.proficiencies || [];
        break;
      case 'getGeneralPower':
        currentItems = selections.powers || [];
        break;
      case 'learnSpell':
      case 'learnAnySpellFromHighestCircle':
        currentItems = selections.spells || [];
        break;
      case 'increaseAttribute':
        currentItems = selections.attributes || [];
        break;
      case 'selectWeaponSpecialization':
        currentItems = selections.weapons || [];
        break;
      case 'selectFamiliar':
        currentItems = selections.familiars || [];
        break;
      case 'selectAnimalTotem':
        currentItems = selections.animalTotems || [];
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

  // Helper to count current selections
  const getSelectionCount = (selectionType: string): number => {
    switch (selectionType) {
      case 'learnSkill':
        return selections.skills?.length || 0;
      case 'addProficiency':
        return selections.proficiencies?.length || 0;
      case 'getGeneralPower':
        return selections.powers?.length || 0;
      case 'learnSpell':
      case 'learnAnySpellFromHighestCircle':
        return selections.spells?.length || 0;
      case 'increaseAttribute':
        return selections.attributes?.length || 0;
      case 'selectWeaponSpecialization':
        return selections.weapons?.length || 0;
      case 'selectFamiliar':
        return selections.familiars?.length || 0;
      case 'selectAnimalTotem':
        return selections.animalTotems?.length || 0;
      default:
        return 0;
    }
  };

  // Render a single requirement
  const renderRequirement = (
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
        | 'getClassPower';
      pick: number;
      label: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      availableOptions: any[];
      metadata?: {
        allowedType?: 'Arcane' | 'Divine' | 'Both';
        schools?: string[];
      };
    },
    requirementIndex: number
  ) => {
    const { type, pick, label } = requirement;
    const allAvailableOptions = getFilteredAvailableOptions(
      requirement,
      sheetForFiltering
    );

    // Get search query for this requirement
    const searchQuery = searchQueries[requirementIndex] || '';

    // Filter options if search query exists
    const availableOptions = filterOptions(allAvailableOptions, searchQuery);

    // Determine if we should show search (>15 options)
    const shouldShowSearch = allAvailableOptions.length > 15;

    const isSingleSelection = pick === 1;
    const currentCount = getSelectionCount(type);

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
              value={selections.familiars?.[0] || ''}
              onChange={(e) =>
                handleSelection(type, e.target.value, true, pick)
              }
            >
              {availableOptions.map((familiarKey) => {
                const familiar = FAMILIARS[familiarKey];
                const isSelected = selections.familiars?.[0] === familiarKey;
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
              value={selections.animalTotems?.[0] || ''}
              onChange={(e) =>
                handleSelection(type, e.target.value, true, pick)
              }
            >
              {availableOptions.map((totemKey) => {
                const totem = ANIMAL_TOTEMS[totemKey];
                const isSelected = selections.animalTotems?.[0] === totemKey;
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
    const renderNestedSpellSelection = (
      nestedPower: GeneralPower,
      nestedReq: PowerSelectionRequirement
    ) => {
      // Filter available spells (exclude already known)
      const filteredSpells = getFilteredAvailableOptions(
        nestedReq,
        sheetForFiltering
      ) as Spell[];

      const nestedSearchKey = `nested-${nestedPower.name}-spell`;
      const nestedSearchQuery =
        searchQueries[nestedSearchKey as unknown as number] || '';
      const displayedSpells = filterOptions(filteredSpells, nestedSearchQuery);

      const selectedSpellName =
        selections.spells && selections.spells.length > 0
          ? getItemName(selections.spells[0])
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
                    handleSelection('learnSpell', spell, true, nestedReq.pick);
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
            firstItem = selections.skills?.[0];
            break;
          case 'addProficiency':
            firstItem = selections.proficiencies?.[0];
            break;
          case 'getGeneralPower':
            firstItem = selections.powers?.[0];
            break;
          case 'learnSpell':
          case 'learnAnySpellFromHighestCircle':
            firstItem = selections.spells?.[0];
            break;
          case 'increaseAttribute':
            firstItem = selections.attributes?.[0];
            break;
          case 'selectWeaponSpecialization':
            firstItem = selections.weapons?.[0];
            break;
          default:
            firstItem = undefined;
        }

        if (!firstItem) return '';
        return getItemName(firstItem);
      };

      // For getGeneralPower, check if selected power has nested requirements
      const selectedPowerForNested =
        type === 'getGeneralPower' && selections.powers?.[0]
          ? (availableOptions.find(
              (opt) => getItemName(opt) === getItemName(selections.powers![0])
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
                  handleSelection(type, selectedOption, true, pick);
                  // Clear spell selection when power changes (nested requirement may change)
                  if (type === 'getGeneralPower') {
                    onChange({
                      ...selections,
                      powers: [selectedOption],
                      spells: [], // Reset spell selection when power changes
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

              const isSelected = isItemSelected(type, option);
              const isDisabled = !isSelected && currentCount >= pick;

              return (
                <FormControlLabel
                  key={optionName}
                  control={
                    <Checkbox
                      checked={isSelected}
                      onChange={(e) =>
                        handleSelection(type, option, e.target.checked, pick)
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
                {renderRequirement(requirement, reqIndex)}
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
