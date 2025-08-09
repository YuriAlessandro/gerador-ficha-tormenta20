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
import { Atributo } from '@/data/atributos';
import { recalculateSheet } from '@/functions/recalculateSheet';

import combatPowers from '@/data/powers/combatPowers';
import destinyPowers from '@/data/powers/destinyPowers';
import spellPowers from '@/data/powers/spellPowers';
import tormentaPowers from '@/data/powers/tormentaPowers';
import GRANTED_POWERS from '@/data/powers/grantedPowers';

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
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (sheet.generalPowers && open) {
      setSelectedPowers([...sheet.generalPowers]);
    }
  }, [sheet.generalPowers, open]);

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
    setSelectedPowers((prev) => {
      const isSelected = prev.some((p) => p.name === power.name);
      if (isSelected) {
        return prev.filter((p) => p.name !== power.name);
      }
      return [...prev, power];
    });
  };

  const isPowerSelected = (power: GeneralPower) =>
    selectedPowers.some((p) => p.name === power.name);

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

  const getRequirementText = (power: GeneralPower): string => {
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

  const filterPowers = (powers: GeneralPower[]) => {
    if (!searchTerm) return powers;
    return powers.filter(
      (power) =>
        power.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        power.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleSave = () => {
    // Track power changes in steps
    const originalPowerNames = sheet.generalPowers?.map((p) => p.name) || [];
    const newPowerNames = selectedPowers.map((p) => p.name);

    const addedPowers = selectedPowers.filter(
      (p) => !originalPowerNames.includes(p.name)
    );
    const removedPowers =
      sheet.generalPowers?.filter((p) => !newPowerNames.includes(p.name)) || [];

    const newSteps: Step[] = [];

    if (addedPowers.length > 0) {
      newSteps.push({
        label: 'Edição Manual - Poderes Adicionados',
        type: 'Poderes',
        value: addedPowers.map((p) => ({ name: p.name, value: p.name })),
      });
    }

    if (removedPowers.length > 0) {
      newSteps.push({
        label: 'Edição Manual - Poderes Removidos',
        type: 'Poderes',
        value: removedPowers.map((p) => ({
          name: p.name,
          value: `${p.name} (removido)`,
        })),
      });
    }

    // Update the sheet with new powers and steps, then recalculate everything
    const updatedSheet = {
      ...sheet,
      generalPowers: selectedPowers,
      steps: newSteps.length > 0 ? [...sheet.steps, ...newSteps] : sheet.steps,
    };
    const recalculatedSheet = recalculateSheet(updatedSheet);

    // Pass the fully recalculated sheet
    onSave(recalculatedSheet);
    onClose();
  };

  const handleCancel = () => {
    if (sheet.generalPowers) {
      setSelectedPowers([...sheet.generalPowers]);
    }
    setSearchTerm('');
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
          <Typography variant='h6'>Editar Poderes</Typography>
          <IconButton onClick={handleCancel} size='small'>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        <Typography variant='body2' sx={{ mb: 2 }}>
          Selecione os poderes gerais do personagem. Poderes que não atendem aos
          pré-requisitos são marcados em vermelho.
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
        {selectedPowers.length > 0 && (
          <Box
            sx={{
              mb: 3,
              p: 2,
              backgroundColor: 'action.hover',
              borderRadius: 1,
            }}
          >
            <Typography variant='subtitle2' sx={{ mb: 1 }}>
              Poderes Selecionados ({selectedPowers.length}):
            </Typography>
            <Stack direction='row' spacing={1} flexWrap='wrap'>
              {selectedPowers.map((power) => (
                <Chip
                  key={power.name}
                  label={power.name}
                  size='small'
                  onDelete={() => handlePowerToggle(power)}
                />
              ))}
            </Stack>
          </Box>
        )}

        <Box sx={{ maxHeight: '60vh', overflow: 'auto' }}>
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
    </Drawer>
  );
};

export default PowersEditDrawer;
