import React from 'react';
import { Button, IconButton } from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import { DiceRoll } from '@/interfaces/DiceRoll';
import { executeMultipleDiceRolls } from '@/utils/diceRoller';
import { useDiceRoll } from '../premium/hooks/useDiceRoll';
import { RollAbilityMeta, RollGroup } from '../premium/services/socket.service';

interface RollButtonProps {
  rolls: DiceRoll[];
  label?: string;
  disabled?: boolean;
  iconOnly?: boolean;
  size?: 'small' | 'medium' | 'large';
  onRollComplete?: (results: RollGroup[]) => void;
  characterName?: string;
  /**
   * Poder/magia dono da rolagem. Vira o título do card no histórico da mesa
   * (antes ele saía como "Dano" ou "Rolagem de Poder") e leva a descrição
   * junto, para quem só vê o histórico entender o que aconteceu.
   */
  ability?: RollAbilityMeta;
}

const RollButton: React.FC<RollButtonProps> = ({
  rolls,
  label = 'Rolar',
  disabled = false,
  iconOnly = false,
  size = 'small',
  onRollComplete,
  characterName,
  ability,
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
      ability?.name ??
      (rolls.length === 1 ? rolls[0].label : 'Rolagem de Poder');

    showDiceResult(overallLabel, rollGroups, characterName, ability);

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
