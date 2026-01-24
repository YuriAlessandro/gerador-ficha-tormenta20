import React from 'react';
import { Button, IconButton } from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import { DiceRoll } from '@/interfaces/DiceRoll';
import { executeMultipleDiceRolls } from '@/utils/diceRoller';
import { useDiceRoll } from '../premium/hooks/useDiceRoll';
import { RollGroup } from '../premium/services/socket.service';

interface RollButtonProps {
  rolls: DiceRoll[];
  label?: string;
  disabled?: boolean;
  iconOnly?: boolean;
  size?: 'small' | 'medium' | 'large';
  onRollComplete?: (results: RollGroup[]) => void;
}

const RollButton: React.FC<RollButtonProps> = ({
  rolls,
  label = 'Rolar',
  disabled = false,
  iconOnly = false,
  size = 'small',
  onRollComplete,
}) => {
  const { showDiceResult } = useDiceRoll();

  const handleRoll = () => {
    const rollResults = executeMultipleDiceRolls(rolls);

    // Convert RollResult[] to RollGroup[]
    const rollGroups: RollGroup[] = rollResults.map((result) => ({
      label: result.label,
      diceNotation: result.dice,
      rolls: result.rolls,
      modifier: result.modifier,
      total: Math.max(1, result.total),
    }));

    // Determine overall label
    const overallLabel =
      rolls.length === 1 ? rolls[0].label : 'Rolagem de Poder';

    showDiceResult(overallLabel, rollGroups);

    if (onRollComplete) {
      onRollComplete(rollGroups);
    }
  };

  if (rolls.length === 0) {
    return null;
  }

  return iconOnly ? (
    <IconButton
      size={size}
      onClick={handleRoll}
      disabled={disabled}
      color='primary'
      title='Rolar dados'
    >
      <CasinoIcon />
    </IconButton>
  ) : (
    <Button
      size={size}
      startIcon={<CasinoIcon />}
      onClick={handleRoll}
      disabled={disabled}
      variant='outlined'
    >
      {label}
    </Button>
  );
};

export default RollButton;
