import React, { useCallback, useMemo, useState } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import { Badge, Box, IconButton, Typography } from '@mui/material';
import { DiceRoll } from '@/interfaces/DiceRoll';
import CharacterSheet, {
  SheetActionHistoryEntry,
} from '@/interfaces/CharacterSheet';
import { PowerOriginKind, SheetPower } from '@/functions/powers/powerOrigins';
import { getPowerText } from '@/functions/powers/powerText';
import type { CustomEffect } from '@/premium/interfaces/CustomEffect';
import PowerSettingsDialog from '../PowerSettingsDialog';

export interface PowerDetailBodyProps {
  power: SheetPower;
  originKind: PowerOriginKind;
  sheetHistory: SheetActionHistoryEntry[];
  sheet?: CharacterSheet;
  className?: string;
  onUpdateRolls?: (power: SheetPower, newRolls: DiceRoll[]) => void;
  onUpdateCustomEffects?: (
    power: SheetPower,
    newEffects: CustomEffect[]
  ) => void;
  /** Blocos extras — a Complicação injeta classe/comportamental/poder concedido. */
  extra?: React.ReactNode;
}

/**
 * O corpo do detalhe de um poder, renderizado DENTRO do accordion no desktop e
 * DENTRO do bottom sheet no mobile. É um componente só de propósito: os dois
 * caminhos não podem divergir.
 *
 * Os `useMemo` de histórico moram aqui, e não na linha, porque antes toda linha
 * varria `sheetHistory` duas vezes em cada render — mesmo fechada. Agora só o
 * poder aberto paga.
 */
const PowerDetailBody: React.FC<PowerDetailBodyProps> = ({
  power,
  originKind,
  sheetHistory,
  sheet,
  className,
  onUpdateRolls,
  onUpdateCustomEffects,
  extra,
}) => {
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

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
          if (source.type === 'levelUp') return `Nível ${source.level}`;
          if (source.type === 'power') return source.name;
          if (source.type === 'origin') return `${source.originName}`;
          if (source.type === 'class') return `${source.className}`;
          if (source.type === 'divinity')
            return `Devoto de ${source.divinityName}`;
          if (source.type === 'race') return `${source.raceName}`;
          if (source.type === 'manualEdit') return 'Adicionado manualmente';
          return '';
        })
        .filter((source) => source !== ''),
    [sheetHistory, power.name]
  );

  const handleOpenSettingsDialog = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSettingsDialogOpen(true);
  }, []);

  const handleCloseSettingsDialog = useCallback(() => {
    setSettingsDialogOpen(false);
  }, []);

  const handleSaveRolls = useCallback(
    (newRolls: DiceRoll[]) => {
      if (onUpdateRolls) onUpdateRolls(power, newRolls);
    },
    [power, onUpdateRolls]
  );

  const handleSaveCustomEffects = useCallback(
    (newEffects: CustomEffect[]) => {
      if (onUpdateCustomEffects) onUpdateCustomEffects(power, newEffects);
    },
    [power, onUpdateCustomEffects]
  );

  // Poder geral concedido por uma complicação (Heróis de Arton).
  const isComplicationPower =
    !!sheet?.complication && sheet.complication.grantedPowerName === power.name;

  // Todos os kinds de poder geral contam como "geral" aqui. Comparar com a
  // string 'Poder Geral', como antes, quebraria ao subdividir por tipo.
  const isManuallyAdded =
    originKind.startsWith('general') &&
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

  const powerRolls =
    'rolls' in power && power.rolls ? power.rolls : ([] as DiceRoll[]);
  const powerCustomEffects =
    'customEffects' in power && power.customEffects
      ? power.customEffects
      : ([] as CustomEffect[]);
  const settingsBadgeCount = powerRolls.length + powerCustomEffects.length;

  return (
    <Box>
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

      {extra}

      <Typography variant='body2' component='div'>
        {getPowerText(power)}
      </Typography>

      <Box sx={{ pt: 2 }}>
        <Typography variant='caption' sx={{ color: 'text.secondary' }}>
          Vindo de: {powerSources || 'Origem não identificada'}
        </Typography>
      </Box>

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
    </Box>
  );
};

export default PowerDetailBody;
