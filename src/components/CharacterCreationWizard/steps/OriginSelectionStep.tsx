import React from 'react';
import {
  Box,
  Typography,
  Alert,
  FormControlLabel,
  Checkbox,
  Paper,
} from '@mui/material';
import Origin from '@/interfaces/Origin';
import Skill from '@/interfaces/Skills';
import { OriginBenefit } from '@/interfaces/WizardSelections';

interface OriginSelectionStepProps {
  origin: Origin;
  selectedBenefits: OriginBenefit[];
  onChange: (benefits: OriginBenefit[]) => void;
  usedSkills: Skill[];
}

const OriginSelectionStep: React.FC<OriginSelectionStepProps> = ({
  origin,
  selectedBenefits,
  onChange,
  usedSkills,
}) => {
  const REQUIRED_SELECTIONS = 2;

  // If origin is regional, show what benefits will be granted automatically
  if (origin.isRegional) {
    const originBenefits = origin.getPowersAndSkills
      ? origin.getPowersAndSkills(usedSkills, origin)
      : { powers: { origin: [], general: [] }, skills: [] };

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant='body1' color='text.secondary'>
          A origem {origin.name} é uma origem regional (Atlas de Arton) e
          concede todos os benefícios automaticamente.
        </Typography>

        <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
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

        <Alert severity='success'>
          Nenhuma seleção necessária - todos os benefícios serão concedidos
          automaticamente. Você pode continuar para o próximo passo.
        </Alert>
      </Box>
    );
  }

  // Get available benefits from the origin
  const originBenefits = origin.getPowersAndSkills
    ? origin.getPowersAndSkills(usedSkills, origin)
    : { powers: { origin: [], general: [] }, skills: [] };

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
      onChange(
        selectedBenefits.filter(
          (b) => !(b.type === benefit.type && b.name === benefit.name)
        )
      );
    } else if (selectedBenefits.length < REQUIRED_SELECTIONS) {
      // Add benefit if under limit
      onChange([...selectedBenefits, benefit]);
    }
  };

  const isComplete = selectedBenefits.length === REQUIRED_SELECTIONS;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant='body1' color='text.secondary'>
        A origem {origin.name} permite escolher {REQUIRED_SELECTIONS} benefícios
        entre perícias, itens e poderes. Selecione abaixo:
      </Typography>

      <Typography variant='caption' color='text.secondary'>
        Selecionados: {selectedBenefits.length} / {REQUIRED_SELECTIONS}
      </Typography>

      {/* Skills Section */}
      {skillOptions.length > 0 && (
        <Paper sx={{ p: 2 }}>
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
        <Paper sx={{ p: 2 }}>
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
        <Paper sx={{ p: 2 }}>
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

      {!isComplete && selectedBenefits.length > 0 && (
        <Alert severity='warning'>
          Selecione {REQUIRED_SELECTIONS - selectedBenefits.length} benefício
          {REQUIRED_SELECTIONS - selectedBenefits.length > 1 ? 's' : ''}{' '}
          adicional
          {REQUIRED_SELECTIONS - selectedBenefits.length > 1 ? 'is' : ''} para
          continuar.
        </Alert>
      )}

      {isComplete && (
        <Alert severity='success'>
          Benefícios selecionados com sucesso! Você pode continuar para o
          próximo passo.
        </Alert>
      )}
    </Box>
  );
};

export default OriginSelectionStep;
