import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Button,
  Stack,
  IconButton,
  Divider,
  Alert,
  FormControlLabel,
  Checkbox,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Origin from '@/interfaces/Origin';
import Skill from '@/interfaces/Skills';
import { OriginBenefit } from '@/interfaces/WizardSelections';
import CharacterSheet from '@/interfaces/CharacterSheet';

interface OriginEditDrawerProps {
  open: boolean;
  onClose: () => void;
  origin: Origin;
  sheet: CharacterSheet;
  onSave: (selectedBenefits: OriginBenefit[]) => void;
}

const OriginEditDrawer: React.FC<OriginEditDrawerProps> = ({
  open,
  onClose,
  origin,
  sheet,
  onSave,
}) => {
  const REQUIRED_SELECTIONS = 2;
  const [selectedBenefits, setSelectedBenefits] = useState<OriginBenefit[]>([]);

  // Get used skills from the character sheet
  const usedSkills: Skill[] = sheet.skills;

  // Reset selections when drawer opens or origin changes
  useEffect(() => {
    if (open) {
      // If sheet has previously selected benefits for this origin, use them
      if (sheet.origin?.selectedBenefits && sheet.origin.name === origin.name) {
        setSelectedBenefits(sheet.origin.selectedBenefits);
      } else {
        setSelectedBenefits([]);
      }
    }
  }, [open, origin.name, sheet.origin]);

  const handleSave = () => {
    onSave(selectedBenefits);
    onClose();
  };

  const handleCancel = () => {
    // Reset to original selections
    if (sheet.origin?.selectedBenefits && sheet.origin.name === origin.name) {
      setSelectedBenefits(sheet.origin.selectedBenefits);
    } else {
      setSelectedBenefits([]);
    }
    onClose();
  };

  // Regional origins grant all benefits automatically
  if (origin.isRegional) {
    const originBenefits = origin.getPowersAndSkills
      ? origin.getPowersAndSkills(usedSkills, origin)
      : { powers: { origin: [], general: [] }, skills: [] };

    return (
      <Drawer
        anchor='right'
        open={open}
        onClose={handleCancel}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 600 } },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
            mb={2}
          >
            <Typography variant='h6'>Benefícios de Origem</Typography>
            <IconButton onClick={handleCancel} size='small'>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
            A origem {origin.name} é uma origem regional (Atlas de Arton) e
            concede todos os benefícios automaticamente.
          </Typography>

          <Paper sx={{ p: 2, bgcolor: 'background.default', mb: 3 }}>
            <Typography variant='h6' gutterBottom>
              Benefícios Concedidos Automaticamente:
            </Typography>

            {originBenefits.skills.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant='subtitle2'>Perícias:</Typography>
                <Typography variant='body2' color='text.secondary'>
                  {originBenefits.skills.join(', ')}
                </Typography>
              </Box>
            )}

            {originBenefits.powers.origin.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant='subtitle2'>Poderes de Origem:</Typography>
                {originBenefits.powers.origin.map((power) => (
                  <Typography
                    key={power.name}
                    variant='body2'
                    color='text.secondary'
                  >
                    • {power.name}
                  </Typography>
                ))}
              </Box>
            )}

            {origin.getItems().length > 0 && (
              <Box>
                <Typography variant='subtitle2'>Itens:</Typography>
                {origin.getItems().map((item) => {
                  const itemName =
                    typeof item.equipment === 'string'
                      ? item.equipment
                      : item.equipment.nome;
                  const itemKey = `${itemName}-${item.qtd || 1}`;

                  return (
                    <Typography
                      key={itemKey}
                      variant='body2'
                      color='text.secondary'
                    >
                      • {itemName}
                      {item.qtd && item.qtd > 1 ? ` (x${item.qtd})` : ''}
                    </Typography>
                  );
                })}
              </Box>
            )}
          </Paper>

          <Alert severity='success' sx={{ mb: 3 }}>
            Nenhuma seleção necessária - todos os benefícios serão concedidos
            automaticamente.
          </Alert>

          <Stack direction='row' spacing={2}>
            <Button fullWidth variant='contained' onClick={handleSave}>
              Confirmar
            </Button>
            <Button fullWidth variant='outlined' onClick={handleCancel}>
              Cancelar
            </Button>
          </Stack>
        </Box>
      </Drawer>
    );
  }

  // Regular origins - user must choose 2 benefits
  const originBenefits = origin.getPowersAndSkills
    ? origin.getPowersAndSkills(usedSkills, origin)
    : {
        powers: {
          origin:
            origin.poderes as import('@/interfaces/Poderes').OriginPower[],
          general: [],
        },
        skills: origin.pericias,
      };

  const items = origin.getItems();

  // Build benefit options
  const skillOptions: OriginBenefit[] = originBenefits.skills.map((skill) => ({
    type: 'skill' as const,
    name: skill,
  }));

  const itemOptions: OriginBenefit[] = items.map((item) => ({
    type: 'item' as const,
    name:
      typeof item.equipment === 'string' ? item.equipment : item.equipment.nome,
  }));

  const powerOptions: OriginBenefit[] = originBenefits.powers.origin.map(
    (power) => ({
      type: 'power' as const,
      name: power.name,
    })
  );

  const handleToggle = (benefit: OriginBenefit) => {
    const isSelected = selectedBenefits.some(
      (b) => b.type === benefit.type && b.name === benefit.name
    );

    if (isSelected) {
      // Remove benefit
      setSelectedBenefits(
        selectedBenefits.filter(
          (b) => !(b.type === benefit.type && b.name === benefit.name)
        )
      );
    } else if (selectedBenefits.length < REQUIRED_SELECTIONS) {
      // Add benefit if under limit
      setSelectedBenefits([...selectedBenefits, benefit]);
    }
  };

  const isComplete = selectedBenefits.length === REQUIRED_SELECTIONS;

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={handleCancel}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 600 } },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='center'
          mb={2}
        >
          <Typography variant='h6'>Benefícios de Origem</Typography>
          <IconButton onClick={handleCancel} size='small'>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        <Typography variant='body1' color='text.secondary' sx={{ mb: 2 }}>
          A origem {origin.name} permite escolher {REQUIRED_SELECTIONS}{' '}
          benefícios entre perícias, itens e poderes. Selecione abaixo:
        </Typography>

        <Typography
          variant='caption'
          color={isComplete ? 'success.main' : 'warning.main'}
          sx={{ mb: 3, display: 'block' }}
        >
          Selecionados: {selectedBenefits.length} / {REQUIRED_SELECTIONS}
        </Typography>

        <Box sx={{ maxHeight: '60vh', overflow: 'auto', mb: 3 }}>
          {/* Skills Section */}
          {skillOptions.length > 0 && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant='h6' gutterBottom>
                Perícias
              </Typography>
              {skillOptions.map((benefit) => {
                const isSelected = selectedBenefits.some(
                  (b) => b.type === benefit.type && b.name === benefit.name
                );
                const isDisabled =
                  !isSelected && selectedBenefits.length >= REQUIRED_SELECTIONS;

                return (
                  <FormControlLabel
                    key={`skill-${benefit.name}`}
                    control={
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleToggle(benefit)}
                        disabled={isDisabled}
                      />
                    }
                    label={benefit.name}
                  />
                );
              })}
            </Paper>
          )}

          {/* Items Section */}
          {itemOptions.length > 0 && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant='h6' gutterBottom>
                Itens
              </Typography>
              {itemOptions.map((benefit) => {
                const isSelected = selectedBenefits.some(
                  (b) => b.type === benefit.type && b.name === benefit.name
                );
                const isDisabled =
                  !isSelected && selectedBenefits.length >= REQUIRED_SELECTIONS;

                return (
                  <FormControlLabel
                    key={`item-${benefit.name}`}
                    control={
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleToggle(benefit)}
                        disabled={isDisabled}
                      />
                    }
                    label={benefit.name}
                  />
                );
              })}
            </Paper>
          )}

          {/* Powers Section */}
          {powerOptions.length > 0 && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant='h6' gutterBottom>
                Poderes
              </Typography>
              {powerOptions.map((benefit) => {
                const isSelected = selectedBenefits.some(
                  (b) => b.type === benefit.type && b.name === benefit.name
                );
                const isDisabled =
                  !isSelected && selectedBenefits.length >= REQUIRED_SELECTIONS;

                return (
                  <FormControlLabel
                    key={`power-${benefit.name}`}
                    control={
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleToggle(benefit)}
                        disabled={isDisabled}
                      />
                    }
                    label={benefit.name}
                  />
                );
              })}
            </Paper>
          )}
        </Box>

        {!isComplete && selectedBenefits.length > 0 && (
          <Alert severity='warning' sx={{ mb: 2 }}>
            Selecione {REQUIRED_SELECTIONS - selectedBenefits.length} benefício
            {REQUIRED_SELECTIONS - selectedBenefits.length > 1 ? 's' : ''}{' '}
            adicional
            {REQUIRED_SELECTIONS - selectedBenefits.length > 1 ? 'is' : ''} para
            continuar.
          </Alert>
        )}

        {isComplete && (
          <Alert severity='success' sx={{ mb: 2 }}>
            Benefícios selecionados com sucesso!
          </Alert>
        )}

        <Stack direction='row' spacing={2}>
          <Button
            fullWidth
            variant='contained'
            onClick={handleSave}
            disabled={!isComplete}
          >
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

export default OriginEditDrawer;
