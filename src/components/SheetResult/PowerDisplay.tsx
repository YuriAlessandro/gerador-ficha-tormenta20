import { ClassAbility, ClassPower } from '@/interfaces/Class';
import { OriginPower } from '@/interfaces/Poderes';
import { RaceAbility } from '@/interfaces/Race';
import React, { useCallback, useMemo, useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Badge,
  Box,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { DiceRoll } from '@/interfaces/DiceRoll';
import { SheetActionHistoryEntry } from '@/interfaces/CharacterSheet';
import RollButton from '../RollButton';
import RollsEditDialog from '../RollsEditDialog';

const getText = (text: string) => <div>{text}</div>;

const generateClassPowerDiv = (power: ClassPower | ClassAbility) => {
  // Usa dynamicText se disponível (para poderes como Autoridade Eclesiástica)
  const textToShow =
    'dynamicText' in power && power.dynamicText
      ? power.dynamicText
      : power.text;
  return getText(textToShow);
};
const generateGeneralPowerDiv = (power: RaceAbility | OriginPower) =>
  getText(power.description);

interface PowerDisplayProps {
  sheetHistory: SheetActionHistoryEntry[];
  power: ClassPower | RaceAbility | ClassAbility | OriginPower;
  type: string;
  count: number;
  onUpdateRolls?: (
    power: ClassPower | RaceAbility | ClassAbility | OriginPower,
    newRolls: DiceRoll[]
  ) => void;
}

const PowerDisplay: React.FC<PowerDisplayProps> = React.memo(
  ({ sheetHistory, power, type, count, onUpdateRolls }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [rollsDialogOpen, setRollsDialogOpen] = useState(false);
    const theme = useTheme();

    const historySources = useMemo(
      () =>
        sheetHistory
          .filter((entry) =>
            entry.changes.some(
              (change) =>
                change.type === 'PowerAdded' && change.powerName === power.name
            )
          )
          .map((entry) => {
            const { source } = entry;
            if (source.type === 'levelUp') {
              return `Nível ${source.level}`;
            }
            if (source.type === 'power') {
              return source.name;
            }
            if (source.type === 'origin') {
              return `${source.originName}`;
            }
            if (source.type === 'class') {
              return `${source.className}`;
            }
            if (source.type === 'divinity') {
              return `Devoto de ${source.divinityName}`;
            }
            if (source.type === 'race') {
              return `${source.raceName}`;
            }
            return '';
          })
          .filter((source) => source !== ''),
      [sheetHistory, power.name]
    );

    const handleToggle = useCallback(() => {
      setIsExpanded((prev) => !prev);
    }, []);

    const handleOpenRollsDialog = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setRollsDialogOpen(true);
    }, []);

    const handleCloseRollsDialog = useCallback(() => {
      setRollsDialogOpen(false);
    }, []);

    const handleSaveRolls = useCallback(
      (newRolls: DiceRoll[]) => {
        if (onUpdateRolls) {
          onUpdateRolls(power, newRolls);
        }
      },
      [power, onUpdateRolls]
    );

    // Check if this is a general power that was added manually
    const isManuallyAdded =
      type === 'Poder Geral' && historySources.length === 0;

    const powerSources = isManuallyAdded
      ? 'Adicionado manualmente'
      : historySources.join(', ');

    // Get rolls from power if it has them
    const powerRolls =
      'rolls' in power && power.rolls ? power.rolls : ([] as DiceRoll[]);

    return (
      <Accordion expanded={isExpanded} onChange={handleToggle}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          id={power.name}
          sx={{
            '& .MuiAccordionSummary-content': {
              width: '100%',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            },
          }}
        >
          <Stack direction='row' alignItems='center' spacing={0.5}>
            {powerRolls.length > 0 && (
              <Box onClick={(e) => e.stopPropagation()}>
                <RollButton rolls={powerRolls} iconOnly size='small' />
              </Box>
            )}
            <Typography
              sx={{
                flexShrink: 0,
                fontWeight: 'bold',
                color: theme.palette.primary.main,
                fontSize: '0.9rem',
              }}
            >
              {power.name}
              {count > 1 ? ` (x${count})` : ''}
            </Typography>
          </Stack>
          <Typography sx={{ color: 'text.secondary' }}>{type}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {onUpdateRolls && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <IconButton
                size='small'
                onClick={handleOpenRollsDialog}
                title='Configurar rolagens'
              >
                <Badge
                  badgeContent={powerRolls.length}
                  color='primary'
                  invisible={powerRolls.length === 0}
                >
                  <SettingsIcon fontSize='small' />
                </Badge>
              </IconButton>
            </Box>
          )}
          {generateClassPowerDiv(power as ClassPower)}
          {generateGeneralPowerDiv(power as RaceAbility)}
          <div style={{ paddingTop: '16px' }}>
            <Typography variant='caption' color='text.secondary'>
              Vindo de: {powerSources || 'Origem não identificada'}
            </Typography>
          </div>
        </AccordionDetails>
        {onUpdateRolls && (
          <RollsEditDialog
            open={rollsDialogOpen}
            onClose={handleCloseRollsDialog}
            rolls={powerRolls}
            onSave={handleSaveRolls}
            title={`Rolagens: ${power.name}`}
          />
        )}
      </Accordion>
    );
  }
);

PowerDisplay.displayName = 'PowerDisplay';

export default PowerDisplay;
