import React from 'react';
import { Box, MenuItem, TextField, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ManeuverId } from '../interfaces/CharacterSheet';
import Equipment from '../interfaces/Equipment';
import { rollD20 } from '../functions/diceRoller';
import { getManeuverDefinition, ManeuverBonus } from '../functions/maneuvers';
import { useDiceRoll } from '../premium/hooks/useDiceRoll';

export interface ManeuverRowData {
  id: ManeuverId;
  options: Equipment[];
  weapon: Equipment;
  bonus: ManeuverBonus;
}

interface ManeuverRowProps {
  maneuver: ManeuverRowData;
  characterName?: string;
  /** Ausente = ficha em modo leitura: a arma aparece como texto. */
  onWeaponChange?: (id: ManeuverId, weaponId: string) => void;
}

const formatBonus = (value: number): string =>
  value >= 0 ? `+${value}` : `${value}`;

const getWeaponLabel = (weapon: Equipment): string =>
  weapon.customDisplayName ?? weapon.nome;

const ManeuverRow: React.FC<ManeuverRowProps> = ({
  maneuver,
  characterName,
  onWeaponChange,
}) => {
  const theme = useTheme();
  const { showDiceResult } = useDiceRoll();
  const { id, options, weapon, bonus } = maneuver;
  const { name, description } = getManeuverDefinition(id);

  const handleRoll = () => {
    const d20Roll = rollD20();
    showDiceResult(
      `Manobra: ${name}`,
      [
        {
          label: `Teste de manobra (${getWeaponLabel(weapon)})`,
          diceNotation: `1d20${formatBonus(bonus.total)}`,
          rolls: [d20Roll],
          modifier: bonus.total,
          total: Math.max(1, d20Roll + bonus.total),
        },
      ],
      characterName
    );
  };

  return (
    <Box
      onClick={handleRoll}
      title={`Rolar ${name} com ${getWeaponLabel(weapon)}`}
      sx={{
        borderBottom: '1px solid #ccc',
        padding: '4px 0',
        cursor: 'pointer',
        userSelect: 'none',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        columnGap: 1,
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
          borderBottom: `1px solid ${theme.palette.primary.main}`,
        },
      }}
    >
      <Tooltip
        arrow
        enterTouchDelay={0}
        leaveTouchDelay={6000}
        title={
          <Box>
            <Typography variant='caption' sx={{ display: 'block', mb: 0.5 }}>
              {description}
            </Typography>
            {bonus.parts.map((part) => (
              <Typography
                key={part.label}
                variant='caption'
                sx={{ display: 'block' }}
              >
                {part.label}: {formatBonus(part.value)}
              </Typography>
            ))}
          </Box>
        }
      >
        <Typography sx={{ fontSize: 16 }}>{name}</Typography>
      </Tooltip>

      <Box
        sx={{ flex: 1, minWidth: 120 }}
        // A linha inteira rola o teste; o seletor só troca a arma.
        onClick={(e) => e.stopPropagation()}
      >
        {onWeaponChange && options.length > 1 ? (
          <TextField
            select
            fullWidth
            size='small'
            variant='standard'
            value={weapon.id ?? ''}
            aria-label={`Arma usada em ${name}`}
            onChange={(e) => onWeaponChange(id, e.target.value)}
          >
            {options.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {getWeaponLabel(option)}
              </MenuItem>
            ))}
          </TextField>
        ) : (
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            {getWeaponLabel(weapon)}
          </Typography>
        )}
      </Box>

      <Typography sx={{ fontSize: 16, fontWeight: 'bold' }}>
        {formatBonus(bonus.total)}
      </Typography>
    </Box>
  );
};

export default ManeuverRow;
