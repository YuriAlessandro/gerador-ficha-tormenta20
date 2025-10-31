import React from 'react';
import {
  Box,
  Typography,
  Alert,
  Paper,
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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Race from '@/interfaces/Race';
import { ClassDescription } from '@/interfaces/Class';
import Origin from '@/interfaces/Origin';
import CharacterSheet from '@/interfaces/CharacterSheet';
import { SelectionOptions } from '@/interfaces/PowerSelections';
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
  selections: SelectionOptions;
  onChange: (selections: SelectionOptions) => void;
}

const PowerEffectSelectionStep: React.FC<PowerEffectSelectionStepProps> = ({
  race,
  classe,
  origin,
  selections,
  onChange,
}) => {
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
      ? origin.getPowersAndSkills([], origin)
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

  // Create a mock sheet object for filtering available options
  const mockSheet = {
    skills: [],
    completeSkills: [],
    classe: {
      proficiencias: [],
      spellPath: classe.spellPath,
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
  } as unknown as CharacterSheet;

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
        const existingName =
          typeof existing === 'string'
            ? existing
            : 'name' in existing
            ? (existing as { name: string }).name
            : 'nome' in existing
            ? (existing as { nome: string }).nome
            : '';
        const itemName =
          typeof item === 'string'
            ? item
            : 'name' in item
            ? (item as { name: string }).name
            : 'nome' in item
            ? (item as { nome: string }).nome
            : '';
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

    const itemName =
      typeof item === 'string'
        ? item
        : 'name' in item
        ? (item as { name: string }).name
        : 'nome' in item
        ? (item as { nome: string }).nome
        : '';

    return currentItems.some((existing) => {
      const existingName =
        typeof existing === 'string'
          ? existing
          : 'name' in existing
          ? (existing as { name: string }).name
          : 'nome' in existing
          ? (existing as { nome: string }).nome
          : '';
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
    const availableOptions = getFilteredAvailableOptions(
      requirement,
      mockSheet
    );
    const isSingleSelection = pick === 1;
    const currentCount = getSelectionCount(type);

    if (availableOptions.length === 0) {
      return (
        <Box key={requirementIndex} mb={2}>
          <Typography variant='subtitle1' gutterBottom>
            {label}
          </Typography>
          <Alert severity='warning'>
            Nenhuma opção disponível para seleção.
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
      (opt) => 'description' in opt || 'descricao' in opt
    );

    if (isSingleSelection) {
      // Single selection - use radio buttons
      const getValue = () => {
        const firstItem =
          type === 'learnSkill'
            ? selections.skills?.[0]
            : type === 'addProficiency'
            ? selections.proficiencies?.[0]
            : type === 'getGeneralPower'
            ? selections.powers?.[0]
            : type === 'learnSpell' || type === 'learnAnySpellFromHighestCircle'
            ? selections.spells?.[0]
            : type === 'increaseAttribute'
            ? selections.attributes?.[0]
            : type === 'selectWeaponSpecialization'
            ? selections.weapons?.[0]
            : undefined;

        if (!firstItem) return '';

        return typeof firstItem === 'string'
          ? firstItem
          : 'name' in firstItem
          ? (firstItem as { name: string }).name
          : 'nome' in firstItem
          ? (firstItem as { nome: string }).nome
          : '';
      };

      return (
        <Box key={requirementIndex} mb={2}>
          <Typography variant='subtitle1' gutterBottom>
            {label}
          </Typography>
          <FormControl component='fieldset' fullWidth>
            <RadioGroup
              value={getValue()}
              onChange={(e) => {
                const selectedOption = availableOptions.find((opt) => {
                  const optName =
                    typeof opt === 'string'
                      ? opt
                      : 'name' in opt
                      ? opt.name
                      : 'nome' in opt
                      ? opt.nome
                      : '';
                  return optName === e.target.value;
                });
                if (selectedOption) {
                  handleSelection(type, selectedOption, true, pick);
                }
              }}
            >
              {availableOptions.map((option) => {
                const optionName =
                  typeof option === 'string'
                    ? option
                    : 'name' in option
                    ? option.name
                    : 'nome' in option
                    ? option.nome
                    : '';
                const optionDescription =
                  typeof option !== 'string' && 'description' in option
                    ? option.description
                    : typeof option !== 'string' && 'descricao' in option
                    ? option.descricao
                    : null;

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
                  />
                );
              })}
            </RadioGroup>
          </FormControl>
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
        <FormControl component='fieldset' fullWidth>
          <FormGroup>
            {availableOptions.map((option) => {
              const optionName =
                typeof option === 'string'
                  ? option
                  : 'name' in option
                  ? option.name
                  : 'nome' in option
                  ? option.nome
                  : '';
              const optionDescription =
                typeof option !== 'string' && 'description' in option
                  ? option.description
                  : typeof option !== 'string' && 'descricao' in option
                  ? option.descricao
                  : null;

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

      {allRequirements.map((powerReq, powerIndex) => (
        <Accordion
          key={`${powerReq.source}-${powerReq.powerName}-${powerIndex}`}
          defaultExpanded={powerIndex === 0}
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
              <React.Fragment key={`req-${reqIndex}`}>
                {renderRequirement(requirement, reqIndex)}
                {reqIndex < powerReq.requirements.length - 1 && (
                  <Divider sx={{ my: 2 }} />
                )}
              </React.Fragment>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}

      <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
        <Typography variant='subtitle2' gutterBottom>
          Resumo das Seleções:
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          • Perícias: {selections.skills?.length || 0}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          • Proficiências: {selections.proficiencies?.length || 0}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          • Poderes: {selections.powers?.length || 0}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          • Magias: {selections.spells?.length || 0}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          • Atributos: {selections.attributes?.length || 0}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          • Armas: {selections.weapons?.length || 0}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          • Familiares: {selections.familiars?.length || 0}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          • Totens: {selections.animalTotems?.length || 0}
        </Typography>
      </Paper>
    </Box>
  );
};

export default PowerEffectSelectionStep;
