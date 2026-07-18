import { ClassAbility, ClassPower } from '@/interfaces/Class';
import { OriginPower } from '@/interfaces/Poderes';
import { RaceAbility } from '@/interfaces/Race';
import React, { useCallback, useMemo, useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsIcon from '@mui/icons-material/Settings';
import PetsIcon from '@mui/icons-material/Pets';
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
  useMediaQuery,
} from '@mui/material';
import { DiceRoll } from '@/interfaces/DiceRoll';
import CharacterSheet, {
  SheetActionHistoryEntry,
} from '@/interfaces/CharacterSheet';
import type { CustomEffect } from '@/premium/interfaces/CustomEffect';
import RollButton from '../RollButton';
import PowerSettingsDialog from './PowerSettingsDialog';

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
  onUpdateCustomEffects?: (
    power: ClassPower | RaceAbility | ClassAbility | OriginPower,
    newEffects: CustomEffect[]
  ) => void;
  sheet?: CharacterSheet;
  className?: string;
  characterName?: string;
  onCompanionClick?: () => void;
  headerActionSlot?: React.ReactNode;
}

const PowerDisplay: React.FC<PowerDisplayProps> = React.memo(
  ({
    sheetHistory,
    power,
    type,
    count,
    onUpdateRolls,
    onUpdateCustomEffects,
    sheet,
    className,
    characterName,
    onCompanionClick,
    headerActionSlot,
  }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

    const selectedWeapons = useMemo(
      () =>
        sheetHistory
          .filter((entry) => entry.powerName === power.name)
          .flatMap((entry) =>
            entry.changes
              .filter((c) => c.type === 'WeaponSpecializationSelected')
              .map((c) =>
                c.type === 'WeaponSpecializationSelected' ? c.weaponName : ''
              )
          )
          .filter(Boolean),
      [sheetHistory, power.name]
    );

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
            if (source.type === 'manualEdit') {
              return 'Adicionado manualmente';
            }
            return '';
          })
          .filter((source) => source !== ''),
      [sheetHistory, power.name]
    );

    const handleToggle = useCallback(() => {
      setIsExpanded((prev) => !prev);
    }, []);

    const handleOpenSettingsDialog = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setSettingsDialogOpen(true);
    }, []);

    const handleCloseSettingsDialog = useCallback(() => {
      setSettingsDialogOpen(false);
    }, []);

    const handleSaveRolls = useCallback(
      (newRolls: DiceRoll[]) => {
        if (onUpdateRolls) {
          onUpdateRolls(power, newRolls);
        }
      },
      [power, onUpdateRolls]
    );

    const handleSaveCustomEffects = useCallback(
      (newEffects: CustomEffect[]) => {
        if (onUpdateCustomEffects) {
          onUpdateCustomEffects(power, newEffects);
        }
      },
      [power, onUpdateCustomEffects]
    );

    // Poder geral concedido por uma complicação (Heróis de Arton)
    const isComplicationPower =
      !!sheet?.complication &&
      sheet.complication.grantedPowerName === power.name;

    // Check if this is a general power that was added manually
    const isManuallyAdded =
      type === 'Poder Geral' &&
      historySources.length === 0 &&
      !isComplicationPower;

    let powerSources = isManuallyAdded
      ? 'Adicionado manualmente'
      : historySources.join(', ');

    if (
      isComplicationPower &&
      historySources.length === 0 &&
      sheet?.complication
    ) {
      powerSources = `Complicação - ${sheet.complication.name}`;
    }

    // Get rolls from power if it has them
    const powerRolls =
      'rolls' in power && power.rolls ? power.rolls : ([] as DiceRoll[]);

    // Get custom effects from power if it has them
    const powerCustomEffects =
      'customEffects' in power && power.customEffects
        ? power.customEffects
        : ([] as CustomEffect[]);

    const settingsBadgeCount = powerRolls.length + powerCustomEffects.length;

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
          <Stack
            direction='row'
            spacing={0.5}
            sx={{
              alignItems: 'center',
            }}
          >
            {powerRolls.length > 0 ? (
              <Box onClick={(e) => e.stopPropagation()}>
                <RollButton
                  rolls={powerRolls}
                  iconOnly
                  size='small'
                  characterName={characterName}
                />
              </Box>
            ) : (
              // Spacer to align power names consistently (desktop only)
              isDesktop && <Box sx={{ width: 28, flexShrink: 0 }} />
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
            {onCompanionClick && (
              <Box onClick={(e) => e.stopPropagation()}>
                <IconButton
                  size='small'
                  onClick={onCompanionClick}
                  title='Ver ficha do Melhor Amigo'
                >
                  <PetsIcon fontSize='small' color='primary' />
                </IconButton>
              </Box>
            )}
            {headerActionSlot && (
              <Box onClick={(e) => e.stopPropagation()}>{headerActionSlot}</Box>
            )}
          </Stack>
          <Typography sx={{ color: 'text.secondary' }}>{type}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {onUpdateRolls && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <IconButton
                size='small'
                onClick={handleOpenSettingsDialog}
                title='Configurar rolagens e efeitos'
              >
                <Badge
                  badgeContent={settingsBadgeCount}
                  color='primary'
                  invisible={settingsBadgeCount === 0}
                >
                  <SettingsIcon fontSize='small' />
                </Badge>
              </IconButton>
            </Box>
          )}
          {selectedWeapons.length > 0 && (
            <Typography
              variant='caption'
              color='primary'
              sx={{ display: 'block', mb: 1, fontWeight: 'bold' }}
            >
              {selectedWeapons.length > 1
                ? 'Armas escolhidas: '
                : 'Arma escolhida: '}
              {selectedWeapons.join(', ')}
            </Typography>
          )}
          {generateClassPowerDiv(power as ClassPower)}
          {generateGeneralPowerDiv(power as RaceAbility)}
          <div style={{ paddingTop: '16px' }}>
            <Typography
              variant='caption'
              sx={{
                color: 'text.secondary',
              }}
            >
              Vindo de: {powerSources || 'Origem não identificada'}
            </Typography>
          </div>
        </AccordionDetails>
        {onUpdateRolls && sheet && (
          <PowerSettingsDialog
            open={settingsDialogOpen}
            onClose={handleCloseSettingsDialog}
            title={`Configurações: ${power.name}`}
            powerName={power.name}
            className={className}
            rolls={powerRolls}
            customEffects={powerCustomEffects}
            sheet={sheet}
            onRollsChange={handleSaveRolls}
            onCustomEffectsChange={handleSaveCustomEffects}
          />
        )}
      </Accordion>
    );
  }
);

PowerDisplay.displayName = 'PowerDisplay';

export default PowerDisplay;
