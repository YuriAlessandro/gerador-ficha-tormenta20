import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
} from '@mui/material';
import { DiceRoll } from '@/interfaces/DiceRoll';
import type CharacterSheet from '@/interfaces/CharacterSheet';
import type { CustomEffect } from '@/premium/interfaces/CustomEffect';
import { getActivePowerForSheetEntry } from '@/premium/data/activePowers';
import {
  CustomEffectsList,
  PrecannedEffectView,
} from '@/premium/components/CustomEffectsEditor';
import RollsEditorPanel from '../RollsEditorPanel';

interface PowerSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  powerName: string;
  className?: string;
  rolls: DiceRoll[];
  customEffects: CustomEffect[];
  sheet: CharacterSheet;
  onRollsChange: (rolls: DiceRoll[]) => void;
  onCustomEffectsChange: (effects: CustomEffect[]) => void;
}

/**
 * Dialog de configurações do poder expandido. Substitui o uso direto de
 * `RollsEditDialog` no `PowerDisplay`, oferecendo duas abas:
 *
 * - "Rolagens": configura rolagens de dados do poder (label + notação).
 * - "Efeitos": configura efeitos customizados (tiers + bônus) que aparecem
 *   no gerenciador de Efeitos Ativos. Quando o poder tem efeito pré-canned
 *   no registry `ACTIVE_POWERS`, exibe apenas o efeito read-only.
 *
 * Ambas as abas persistem on-change — não há botão de Salvar.
 */
const PowerSettingsDialog: React.FC<PowerSettingsDialogProps> = ({
  open,
  onClose,
  title,
  powerName,
  className,
  rolls,
  customEffects,
  sheet,
  onRollsChange,
  onCustomEffectsChange,
}) => {
  const [tab, setTab] = useState<0 | 1>(0);

  const precannedDef = useMemo(
    () => getActivePowerForSheetEntry(className, powerName),
    [className, powerName]
  );

  let effectsBadgeSuffix = '';
  if (precannedDef) {
    effectsBadgeSuffix = ' (auto)';
  } else if (customEffects.length > 0) {
    effectsBadgeSuffix = ` (${customEffects.length})`;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <Tabs
        value={tab}
        onChange={(_e, v: 0 | 1) => setTab(v)}
        variant='fullWidth'
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label={`Rolagens${rolls.length ? ` (${rolls.length})` : ''}`} />
        <Tab label={`Efeitos${effectsBadgeSuffix}`} />
      </Tabs>
      <DialogContent dividers>
        {tab === 0 && (
          <RollsEditorPanel rolls={rolls} onChange={onRollsChange} />
        )}
        {tab === 1 && (
          <Box>
            {precannedDef ? (
              <PrecannedEffectView definition={precannedDef} sheet={sheet} />
            ) : (
              <CustomEffectsList
                effects={customEffects}
                onChange={onCustomEffectsChange}
              />
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant='contained'>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PowerSettingsDialog;
