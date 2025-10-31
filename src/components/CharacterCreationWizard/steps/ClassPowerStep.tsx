import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { SelectionOptions } from '@/interfaces/PowerSelections';
import { ClassDescription } from '@/interfaces/Class';
import { getPowerSelectionRequirements } from '@/functions/powers/manualPowerSelection';

interface ClassPowerStepProps {
  classe: ClassDescription;
  selections: SelectionOptions;
  onChange: (selections: SelectionOptions) => void;
}

const ClassPowerStep: React.FC<ClassPowerStepProps> = ({
  classe,
  selections: _selections,
  onChange: _onChange,
}) => {
  // Get level 1 abilities that require manual selection
  const level1Abilities = classe.abilities.filter(
    (ability) => ability.nivel === 1
  );
  const powersNeedingSelection = level1Abilities
    .map((ability) => {
      // Check if this ability has actions requiring manual selection
      const requirements = getPowerSelectionRequirements({
        name: ability.name,
        text: ability.text,
        sheetActions: ability.sheetActions,
        sheetBonuses: ability.sheetBonuses,
      });
      return requirements ? { ability, requirements } : null;
    })
    .filter((item) => item !== null);

  // If no powers need selection, show message
  if (powersNeedingSelection.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant='body1' color='text.secondary'>
          Sua classe não possui poderes que requerem seleção manual no nível 1.
        </Typography>
        <Alert severity='info'>Você pode continuar para o próximo passo.</Alert>
      </Box>
    );
  }

  // TODO: Implement power selection UI here
  // This will be similar to PowerSelectionDialog but integrated into the wizard
  // For now, showing a placeholder
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant='body1' color='text.secondary'>
        Alguns poderes da classe {classe.name} requerem seleção manual:
      </Typography>

      {powersNeedingSelection.map(
        (item) =>
          item && (
            <Box key={item.ability.name}>
              <Typography variant='h6'>{item.ability.name}</Typography>
              <Typography variant='body2' color='text.secondary'>
                {item.requirements.requirements
                  .map((req) => req.label)
                  .join(', ')}
              </Typography>
            </Box>
          )
      )}

      <Alert severity='info'>
        A seleção de poderes de classe será implementada na próxima iteração.
        Por enquanto, continue para o próximo passo.
      </Alert>

      {/* TODO: Add selection UI based on PowerSelectionDialog */}
    </Box>
  );
};

export default ClassPowerStep;
