import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Button,
  Stack,
  IconButton,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  Chip,
  TextField,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import CharacterSheet, { Step } from '@/interfaces/CharacterSheet';
import {
  GeneralPower,
  GeneralPowerType,
  RequirementType,
} from '@/interfaces/Poderes';
import { ClassPower } from '@/interfaces/Class';
import { Atributo } from '@/data/atributos';
import { recalculateSheet } from '@/functions/recalculateSheet';
import {
  ManualPowerSelections,
  PowerSelectionRequirements,
  SelectionOptions,
} from '@/interfaces/PowerSelections';
import combatPowers from '@/data/powers/combatPowers';
import destinyPowers from '@/data/powers/destinyPowers';
import spellPowers from '@/data/powers/spellPowers';
import tormentaPowers from '@/data/powers/tormentaPowers';
import GRANTED_POWERS from '@/data/powers/grantedPowers';
import {
  getPowerSelectionRequirements,
  getFilteredAvailableOptions,
} from '@/functions/powers/manualPowerSelection';
import PowerSelectionDialog from './PowerSelectionDialog';

interface PowersEditDrawerProps {
  open: boolean;
  onClose: () => void;
  sheet: CharacterSheet;
  onSave: (updates: Partial<CharacterSheet>) => void;
}

interface PowerCategory {
  type: GeneralPowerType;
  name: string;
  powers: GeneralPower[];
}

const PowersEditDrawer: React.FC<PowersEditDrawerProps> = ({
  open,
  onClose,
  sheet,
  onSave,
}) => {
  const [selectedPowers, setSelectedPowers] = useState<GeneralPower[]>([]);
  const [selectedClassPowers, setSelectedClassPowers] = useState<ClassPower[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState('');

  // New state for manual power selections
  const [manualSelections, setManualSelections] =
    useState<ManualPowerSelections>({});
  const [selectionDialog, setSelectionDialog] = useState<{
    open: boolean;
    requirements: PowerSelectionRequirements | null;
    powerToAdd: GeneralPower | ClassPower | null;
    isClassPower: boolean;
  }>({
    open: false,
    requirements: null,
    powerToAdd: null,
    isClassPower: false,
  });

  useEffect(() => {
    if (open) {
      if (sheet.generalPowers) {
        setSelectedPowers([...sheet.generalPowers]);
      }
      if (sheet.classPowers) {
        setSelectedClassPowers([...sheet.classPowers]);
      }
      // Reset manual selections when opening
      setManualSelections({});
    }
  }, [sheet.generalPowers, sheet.classPowers, open]);

  // Organize all powers by category
  const powerCategories: PowerCategory[] = [
    {
      type: GeneralPowerType.COMBATE,
      name: 'Poderes de Combate',
      powers: Object.values(combatPowers),
    },
    {
      type: GeneralPowerType.DESTINO,
      name: 'Poderes de Destino',
      powers: Object.values(destinyPowers),
    },
    {
      type: GeneralPowerType.MAGIA,
      name: 'Poderes de Magia',
      powers: Object.values(spellPowers),
    },
    {
      type: GeneralPowerType.TORMENTA,
      name: 'Poderes de Tormenta',
      powers: Object.values(tormentaPowers),
    },
    {
      type: GeneralPowerType.CONCEDIDOS,
      name: 'Poderes Concedidos',
      powers: Object.values(GRANTED_POWERS),
    },
  ];

  const handlePowerToggle = (power: GeneralPower) => {
    const isSelected = selectedPowers.some((p) => p.name === power.name);

    if (isSelected) {
      // Remove power and its selections
      setSelectedPowers((prev) => prev.filter((p) => p.name !== power.name));
      setManualSelections((prev) => {
        const updated = { ...prev };
        delete updated[power.name];
        return updated;
      });
    } else {
      // Check if power requires manual selection
      const requirements = getPowerSelectionRequirements(power);

      if (requirements) {
        // Check if any requirement actually has multiple options to choose from
        const requiresUserInput = requirements.requirements.some((req) => {
          const availableOptions = getFilteredAvailableOptions(req, sheet);
          return (
            availableOptions.length > 1 && req.pick < availableOptions.length
          );
        });

        if (requiresUserInput) {
          // Open selection dialog
          setSelectionDialog({
            open: true,
            requirements,
            powerToAdd: power,
            isClassPower: false,
          });
        } else {
          // Auto-select when there's only one option or all options must be picked
          const autoSelections: SelectionOptions = {};
          requirements.requirements.forEach((req) => {
            const availableOptions = getFilteredAvailableOptions(req, sheet);
            if (
              availableOptions.length === req.pick ||
              availableOptions.length === 1
            ) {
              if (req.type === 'learnSkill') {
                autoSelections.skills = availableOptions as string[];
              } else if (req.type === 'addProficiency') {
                autoSelections.proficiencies = availableOptions as string[];
              } else if (req.type === 'getGeneralPower') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                autoSelections.powers = availableOptions as any[];
              } else if (
                req.type === 'learnSpell' ||
                req.type === 'learnAnySpellFromHighestCircle'
              ) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                autoSelections.spells = availableOptions as any[];
              } else if (req.type === 'increaseAttribute') {
                autoSelections.attributes = availableOptions as string[];
              }
            }
          });

          // Apply power with auto-selections and add to selected list
          setManualSelections((prev) => ({
            ...prev,
            [power.name]: autoSelections,
          }));
          setSelectedPowers((prev) => [...prev, power]);
        }
      } else {
        // Add power directly
        setSelectedPowers((prev) => [...prev, power]);
      }
    }
  };

  const handleClassPowerToggle = (power: ClassPower) => {
    const isSelected = selectedClassPowers.some((p) => p.name === power.name);

    if (isSelected) {
      // Remove power and its selections
      setSelectedClassPowers((prev) =>
        prev.filter((p) => p.name !== power.name)
      );
      setManualSelections((prev) => {
        const updated = { ...prev };
        delete updated[power.name];
        return updated;
      });
    } else {
      // Check if power requires manual selection
      const requirements = getPowerSelectionRequirements(power);

      if (requirements) {
        // Check if any requirement actually has multiple options to choose from
        const requiresUserInput = requirements.requirements.some((req) => {
          const availableOptions = getFilteredAvailableOptions(req, sheet);
          return (
            availableOptions.length > 1 && req.pick < availableOptions.length
          );
        });

        if (requiresUserInput) {
          // Open selection dialog
          setSelectionDialog({
            open: true,
            requirements,
            powerToAdd: power,
            isClassPower: true,
          });
        } else {
          // Auto-select when there's only one option or all options must be picked
          const autoSelections: SelectionOptions = {};
          requirements.requirements.forEach((req) => {
            const availableOptions = getFilteredAvailableOptions(req, sheet);
            if (
              availableOptions.length === req.pick ||
              availableOptions.length === 1
            ) {
              if (req.type === 'learnSkill') {
                autoSelections.skills = availableOptions as string[];
              } else if (req.type === 'addProficiency') {
                autoSelections.proficiencies = availableOptions as string[];
              } else if (req.type === 'getGeneralPower') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                autoSelections.powers = availableOptions as any[];
              } else if (
                req.type === 'learnSpell' ||
                req.type === 'learnAnySpellFromHighestCircle'
              ) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                autoSelections.spells = availableOptions as any[];
              } else if (req.type === 'increaseAttribute') {
                autoSelections.attributes = availableOptions as string[];
              }
            }
          });

          // Apply power with auto-selections and add to selected list
          setManualSelections((prev) => ({
            ...prev,
            [power.name]: autoSelections,
          }));
          setSelectedClassPowers((prev) => [...prev, power]);
        }
      } else {
        // Add power directly
        setSelectedClassPowers((prev) => [...prev, power]);
      }
    }
  };

  // Selection dialog handlers
  const handleSelectionConfirm = (selections: SelectionOptions) => {
    const { powerToAdd, isClassPower } = selectionDialog;

    if (powerToAdd) {
      // Store the selections
      setManualSelections((prev) => ({
        ...prev,
        [powerToAdd.name]: selections,
      }));

      // Add the power to the selected list
      if (isClassPower) {
        setSelectedClassPowers((prev) => [...prev, powerToAdd as ClassPower]);
      } else {
        setSelectedPowers((prev) => [...prev, powerToAdd as GeneralPower]);
      }
    }

    // Close dialog
    setSelectionDialog({
      open: false,
      requirements: null,
      powerToAdd: null,
      isClassPower: false,
    });
  };

  const handleSelectionCancel = () => {
    setSelectionDialog({
      open: false,
      requirements: null,
      powerToAdd: null,
      isClassPower: false,
    });
  };

  const isPowerSelected = (power: GeneralPower) =>
    selectedPowers.some((p) => p.name === power.name);

  const isClassPowerSelected = (power: ClassPower) =>
    selectedClassPowers.some((p) => p.name === power.name);

  const checkRequirements = (power: GeneralPower): boolean => {
    if (!power.requirements || power.requirements.length === 0) {
      return true; // No requirements means always available
    }

    // Each outer array represents an "OR" group, inner arrays are "AND" requirements
    return power.requirements.some((reqGroup) =>
      reqGroup.every((req) => {
        switch (req.type) {
          case RequirementType.ATRIBUTO: {
            const attrName = req.name as Atributo;
            const attrValue = sheet.atributos[attrName]?.mod || 0;
            return attrValue >= (req.value || 0);
          }

          case RequirementType.NIVEL:
            return sheet.nivel >= (req.value || 0);

          case RequirementType.PODER:
            // Check if character has the required power
            return (
              selectedPowers.some((p) => p.name === req.name) ||
              sheet.generalPowers?.some((p) => p.name === req.name) ||
              sheet.classPowers?.some((p) => p.name === req.name) ||
              false
            );

          case RequirementType.PERICIA: {
            // Check if character has the required skill trained
            const skill = sheet.completeSkills?.find(
              (s) => s.name === req.name
            );
            return skill && (skill.training || 0) > 0;
          }

          case RequirementType.PROFICIENCIA:
            // Check if character has the required proficiency
            return sheet.classe.proficiencias.includes(req.name as string);

          case RequirementType.CLASSE:
            return sheet.classe.name === req.name;

          case RequirementType.DEVOTO:
            return !!sheet.devoto;

          case RequirementType.HABILIDADE:
            // Check class abilities
            return sheet.classe.abilities?.some((a) => a.name === req.name);

          default:
            // For unknown requirement types, assume they're met
            return true;
        }
      })
    );
  };

  const checkClassPowerRequirements = (power: ClassPower): boolean => {
    if (!power.requirements || power.requirements.length === 0) {
      return true;
    }

    return power.requirements.some((reqGroup) =>
      reqGroup.every((req) => {
        switch (req.type) {
          case RequirementType.ATRIBUTO: {
            const attrName = req.name as Atributo;
            const attrValue = sheet.atributos[attrName]?.mod || 0;
            return attrValue >= (req.value || 0);
          }
          case RequirementType.NIVEL:
            return sheet.nivel >= (req.value || 0);
          case RequirementType.PODER:
            return (
              selectedPowers.some((p) => p.name === req.name) ||
              selectedClassPowers.some((p) => p.name === req.name) ||
              sheet.generalPowers?.some((p) => p.name === req.name) ||
              sheet.classPowers?.some((p) => p.name === req.name) ||
              false
            );
          case RequirementType.PERICIA: {
            const skill = sheet.completeSkills?.find(
              (s) => s.name === req.name
            );
            return skill && (skill.training || 0) > 0;
          }
          case RequirementType.PROFICIENCIA:
            return sheet.classe.proficiencias.includes(req.name as string);
          case RequirementType.HABILIDADE:
            return sheet.classe.abilities?.some((a) => a.name === req.name);
          default:
            return true;
        }
      })
    );
  };

  const getRequirementText = (power: GeneralPower | ClassPower): string => {
    if (!power.requirements || power.requirements.length === 0) {
      return 'Nenhum pré-requisito';
    }

    return power.requirements
      .map((reqGroup) =>
        reqGroup
          .map((req) => {
            switch (req.type) {
              case RequirementType.ATRIBUTO:
                return `${req.name} ${req.value || 0}`;
              case RequirementType.PODER:
                return `Poder: ${req.name}`;
              case RequirementType.NIVEL:
                return `Nível ${req.value || 0}`;
              case RequirementType.PERICIA:
                return `Perícia: ${req.name}`;
              case RequirementType.PROFICIENCIA:
                return `Proficiência: ${req.name}`;
              case RequirementType.CLASSE:
                return `Classe: ${req.name}`;
              case RequirementType.DEVOTO:
                return 'Ser devoto';
              case RequirementType.HABILIDADE:
                return `Habilidade: ${req.name}`;
              default:
                return req.text || req.name || 'Requisito especial';
            }
          })
          .join(', ')
      )
      .join(' OU ');
  };

  const filterPowers = <
    T extends { name: string; text?: string; description?: string }
  >(
    powers: T[]
  ): T[] => {
    if (!searchTerm) return powers;
    return powers.filter((power) => {
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = power.name.toLowerCase().includes(searchLower);
      const descriptionMatch = power.description
        ? power.description.toLowerCase().includes(searchLower)
        : false;
      const textMatch = power.text
        ? power.text.toLowerCase().includes(searchLower)
        : false;
      return nameMatch || descriptionMatch || textMatch;
    });
  };

  const handleSave = () => {
    // Track general power changes
    const originalPowerNames = sheet.generalPowers?.map((p) => p.name) || [];
    const newPowerNames = selectedPowers.map((p) => p.name);

    const addedPowers = selectedPowers.filter(
      (p) => !originalPowerNames.includes(p.name)
    );
    const removedPowers =
      sheet.generalPowers?.filter((p) => !newPowerNames.includes(p.name)) || [];

    // Track class power changes
    const originalClassPowerNames = sheet.classPowers?.map((p) => p.name) || [];
    const newClassPowerNames = selectedClassPowers.map((p) => p.name);

    const addedClassPowers = selectedClassPowers.filter(
      (p) => !originalClassPowerNames.includes(p.name)
    );
    const removedClassPowers =
      sheet.classPowers?.filter((p) => !newClassPowerNames.includes(p.name)) ||
      [];

    const newSteps: Step[] = [];

    if (addedPowers.length > 0) {
      newSteps.push({
        label: 'Edição Manual - Poderes Gerais Adicionados',
        type: 'Poderes',
        value: addedPowers.map((p) => ({ name: p.name, value: p.name })),
      });
    }

    if (removedPowers.length > 0) {
      newSteps.push({
        label: 'Edição Manual - Poderes Gerais Removidos',
        type: 'Poderes',
        value: removedPowers.map((p) => ({
          name: p.name,
          value: `${p.name} (removido)`,
        })),
      });
    }

    if (addedClassPowers.length > 0) {
      newSteps.push({
        label: 'Edição Manual - Poderes de Classe Adicionados',
        type: 'Poderes',
        value: addedClassPowers.map((p) => ({ name: p.name, value: p.name })),
      });
    }

    if (removedClassPowers.length > 0) {
      newSteps.push({
        label: 'Edição Manual - Poderes de Classe Removidos',
        type: 'Poderes',
        value: removedClassPowers.map((p) => ({
          name: p.name,
          value: `${p.name} (removido)`,
        })),
      });
    }

    // Update the sheet with new powers and steps, then recalculate everything
    const updatedSheet = {
      ...sheet,
      generalPowers: selectedPowers,
      classPowers: selectedClassPowers,
      steps: newSteps.length > 0 ? [...sheet.steps, ...newSteps] : sheet.steps,
    };
    const recalculatedSheet = recalculateSheet(
      updatedSheet,
      sheet,
      manualSelections
    );

    // Pass the fully recalculated sheet
    onSave(recalculatedSheet);
    onClose();
  };

  const handleCancel = () => {
    if (sheet.generalPowers) {
      setSelectedPowers([...sheet.generalPowers]);
    }
    if (sheet.classPowers) {
      setSelectedClassPowers([...sheet.classPowers]);
    }
    setSearchTerm('');
    setManualSelections({});
    onClose();
  };

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={handleCancel}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 700 } },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='center'
          mb={2}
        >
          <Typography variant='h6'>Editar Poderes e Habilidades</Typography>
          <IconButton onClick={handleCancel} size='small'>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        <Typography variant='body2' sx={{ mb: 2 }}>
          Selecione os poderes gerais e de classe do personagem. As habilidades
          de classe são automáticas e não podem ser removidas. Poderes que não
          atendem aos pré-requisitos são marcados em vermelho. Você pode
          adicionar qualquer poder que desejar, incluindo os que não cumprem
          requisitos.
        </Typography>

        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder='Buscar poderes...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            ),
          }}
          sx={{ mb: 3 }}
          size='small'
        />

        {/* Selected Powers Summary */}
        {(selectedPowers.length > 0 ||
          selectedClassPowers.length > 0 ||
          (sheet.classe.abilities &&
            sheet.classe.abilities.filter((a) => a.nivel <= sheet.nivel)
              .length > 0) ||
          (sheet.raca.abilities && sheet.raca.abilities.length > 0)) && (
          <Box
            sx={{
              mb: 3,
              p: 2,
              backgroundColor: 'action.hover',
              borderRadius: 1,
            }}
          >
            {selectedPowers.length > 0 && (
              <>
                <Typography variant='subtitle2' sx={{ mb: 1 }}>
                  Poderes Gerais Selecionados ({selectedPowers.length}):
                </Typography>
                <Stack
                  direction='row'
                  spacing={1}
                  flexWrap='wrap'
                  sx={{ mb: 2 }}
                >
                  {selectedPowers.map((power) => (
                    <Chip
                      key={power.name}
                      label={power.name}
                      size='small'
                      onDelete={() => handlePowerToggle(power)}
                    />
                  ))}
                </Stack>
              </>
            )}
            {selectedClassPowers.length > 0 && (
              <>
                <Typography variant='subtitle2' sx={{ mb: 1 }}>
                  Poderes de Classe Selecionados ({selectedClassPowers.length}):
                </Typography>
                <Stack
                  direction='row'
                  spacing={1}
                  flexWrap='wrap'
                  sx={{ mb: 2 }}
                >
                  {selectedClassPowers.map((power) => (
                    <Chip
                      key={power.name}
                      label={power.name}
                      size='small'
                      color='secondary'
                      onDelete={() => handleClassPowerToggle(power)}
                    />
                  ))}
                </Stack>
              </>
            )}
            {sheet.classe.abilities &&
              sheet.classe.abilities.filter((a) => a.nivel <= sheet.nivel)
                .length > 0 && (
                <>
                  <Typography variant='subtitle2' sx={{ mb: 1 }}>
                    Habilidades de Classe Ativas (
                    {
                      sheet.classe.abilities.filter(
                        (a) => a.nivel <= sheet.nivel
                      ).length
                    }
                    ):
                  </Typography>
                  <Stack
                    direction='row'
                    spacing={1}
                    flexWrap='wrap'
                    sx={{ mb: 2 }}
                  >
                    {sheet.classe.abilities
                      .filter((ability) => ability.nivel <= sheet.nivel)
                      .map((ability) => (
                        <Chip
                          key={ability.name}
                          label={`${ability.name} (Nv.${ability.nivel})`}
                          size='small'
                          color='info'
                        />
                      ))}
                  </Stack>
                </>
              )}
            {sheet.raca.abilities && sheet.raca.abilities.length > 0 && (
              <>
                <Typography variant='subtitle2' sx={{ mb: 1 }}>
                  Habilidades de Raça ({sheet.raca.abilities.length}):
                </Typography>
                <Stack direction='row' spacing={1} flexWrap='wrap'>
                  {sheet.raca.abilities.map((ability) => (
                    <Chip
                      key={ability.name}
                      label={ability.name}
                      size='small'
                      color='warning'
                    />
                  ))}
                </Stack>
              </>
            )}
          </Box>
        )}

        <Box sx={{ maxHeight: '60vh', overflow: 'auto' }}>
          {/* Race Abilities Section */}
          {sheet.raca.abilities && sheet.raca.abilities.length > 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant='h6'>
                  Habilidades de {sheet.raca.name} (
                  {sheet.raca.abilities.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {sheet.raca.abilities.map((ability) => (
                    <Box
                      key={ability.name}
                      sx={{
                        p: 2,
                        border: 2,
                        borderColor: 'warning.main',
                        borderRadius: 1,
                        backgroundColor: 'warning.50',
                      }}
                    >
                      <Typography variant='body1' fontWeight='bold'>
                        {ability.name}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {ability.description}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Class Abilities Section */}
          {sheet.classe.abilities && sheet.classe.abilities.length > 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant='h6'>
                  Habilidades de {sheet.classe.name} (
                  {
                    sheet.classe.abilities.filter((a) => a.nivel <= sheet.nivel)
                      .length
                  }{' '}
                  disponíveis)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {sheet.classe.abilities
                    .filter((ability) => ability.nivel <= sheet.nivel)
                    .sort((a, b) => a.nivel - b.nivel)
                    .map((ability) => (
                      <Box
                        key={ability.name}
                        sx={{
                          p: 2,
                          border: 2,
                          borderColor: 'info.main',
                          borderRadius: 1,
                          backgroundColor: 'info.50',
                        }}
                      >
                        <Typography variant='body1' fontWeight='bold'>
                          {ability.name} (Nível {ability.nivel})
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          {ability.text}
                        </Typography>
                      </Box>
                    ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Class Powers Section */}
          {sheet.classe.powers && sheet.classe.powers.length > 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant='h6'>
                  Poderes de {sheet.classe.name} (
                  {filterPowers(sheet.classe.powers).length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {filterPowers(sheet.classe.powers)
                    .sort((a, b) => {
                      const aQualifies = checkClassPowerRequirements(a);
                      const bQualifies = checkClassPowerRequirements(b);
                      if (aQualifies && !bQualifies) return -1;
                      if (!aQualifies && bQualifies) return 1;
                      return a.name.localeCompare(b.name);
                    })
                    .map((power) => {
                      const meetsRequirements =
                        checkClassPowerRequirements(power);

                      return (
                        <Box
                          key={power.name}
                          sx={{
                            p: 2,
                            border: 2,
                            borderColor: meetsRequirements
                              ? 'success.main'
                              : 'error.main',
                            borderRadius: 1,
                            backgroundColor: (() => {
                              if (isClassPowerSelected(power)) {
                                return meetsRequirements
                                  ? 'success.light'
                                  : 'error.light';
                              }
                              return meetsRequirements
                                ? 'success.50'
                                : 'background.paper';
                            })(),
                            opacity: meetsRequirements ? 1 : 0.7,
                          }}
                        >
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={isClassPowerSelected(power)}
                                onChange={() => handleClassPowerToggle(power)}
                                size='small'
                                color='secondary'
                              />
                            }
                            label={
                              <Box sx={{ width: '100%' }}>
                                <Typography
                                  variant='body1'
                                  fontWeight='bold'
                                  color={
                                    meetsRequirements
                                      ? 'text.primary'
                                      : 'error.main'
                                  }
                                >
                                  {power.name}
                                </Typography>
                                <Typography
                                  variant='body2'
                                  color='text.secondary'
                                  sx={{ mb: 1 }}
                                >
                                  {power.text}
                                </Typography>
                                {power.requirements &&
                                  power.requirements.length > 0 && (
                                    <Typography
                                      variant='caption'
                                      color='text.secondary'
                                      sx={{
                                        display: 'block',
                                        fontStyle: 'italic',
                                      }}
                                    >
                                      <strong>Pré-requisitos:</strong>{' '}
                                      {getRequirementText(power)}
                                    </Typography>
                                  )}
                              </Box>
                            }
                            sx={{ alignItems: 'flex-start', width: '100%' }}
                          />
                        </Box>
                      );
                    })}
                </Stack>
              </AccordionDetails>
            </Accordion>
          )}

          {/* General Powers Sections */}
          {powerCategories.map((category) => {
            const filteredPowers = filterPowers(category.powers);

            if (filteredPowers.length === 0) return null;

            return (
              <Accordion key={category.type}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant='h6'>
                    {category.name} ({filteredPowers.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    {filteredPowers
                      .sort((a, b) => {
                        const aQualifies = checkRequirements(a);
                        const bQualifies = checkRequirements(b);
                        // Show qualifying powers first
                        if (aQualifies && !bQualifies) return -1;
                        if (!aQualifies && bQualifies) return 1;
                        // Then sort alphabetically
                        return a.name.localeCompare(b.name);
                      })
                      .map((power) => {
                        const meetsRequirements = checkRequirements(power);

                        return (
                          <Box
                            key={power.name}
                            sx={{
                              p: 2,
                              border: 2,
                              borderColor: meetsRequirements
                                ? 'success.main'
                                : 'error.main',
                              borderRadius: 1,
                              backgroundColor: (() => {
                                if (isPowerSelected(power)) {
                                  return meetsRequirements
                                    ? 'success.light'
                                    : 'error.light';
                                }
                                return meetsRequirements
                                  ? 'success.50'
                                  : 'background.paper';
                              })(),
                              opacity: meetsRequirements ? 1 : 0.7,
                            }}
                          >
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={isPowerSelected(power)}
                                  onChange={() => handlePowerToggle(power)}
                                  size='small'
                                />
                              }
                              label={
                                <Box sx={{ width: '100%' }}>
                                  <Typography
                                    variant='body1'
                                    fontWeight='bold'
                                    color={
                                      meetsRequirements
                                        ? 'text.primary'
                                        : 'error.main'
                                    }
                                  >
                                    {power.name}
                                  </Typography>
                                  <Typography
                                    variant='body2'
                                    color='text.secondary'
                                    sx={{ mb: 1 }}
                                  >
                                    {power.description}
                                  </Typography>
                                  <Typography
                                    variant='caption'
                                    color='text.secondary'
                                    sx={{
                                      display: 'block',
                                      fontStyle: 'italic',
                                    }}
                                  >
                                    <strong>Pré-requisitos:</strong>{' '}
                                    {getRequirementText(power)}
                                  </Typography>
                                </Box>
                              }
                              sx={{ alignItems: 'flex-start', width: '100%' }}
                            />
                          </Box>
                        );
                      })}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>

        <Stack direction='row' spacing={2} sx={{ mt: 4 }}>
          <Button fullWidth variant='contained' onClick={handleSave}>
            Salvar
          </Button>
          <Button fullWidth variant='outlined' onClick={handleCancel}>
            Cancelar
          </Button>
        </Stack>
      </Box>

      {/* Power Selection Dialog */}
      {selectionDialog.open && selectionDialog.requirements && (
        <PowerSelectionDialog
          open={selectionDialog.open}
          onClose={handleSelectionCancel}
          onConfirm={handleSelectionConfirm}
          requirements={selectionDialog.requirements}
          sheet={sheet}
        />
      )}
    </Drawer>
  );
};

export default PowersEditDrawer;
