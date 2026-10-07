import React from 'react';
import { Alert, Button } from '@mui/material';
import CharacterSheet from '@/interfaces/CharacterSheet';
import {
  dismissPendingExtraPower,
  hasPendingExtraPower,
  PENDING_EXTRA_POWER_TEXT,
} from '@/functions/powers/fundamentalista';

interface PendingExtraPowerAlertProps {
  sheet: CharacterSheet;
  /** Ausente = somente leitura: avisa, mas sem "Manter assim". */
  onChange?: (next: CharacterSheet) => void;
}

/**
 * Lembrete persistente depois de desligar o fundamentalismo: o poder
 * concedido adicional pode ainda estar na ficha. Não remove nada — o jogador
 * escolhe qual tirar no editor de poderes, ou decide manter.
 */
const PendingExtraPowerAlert: React.FC<PendingExtraPowerAlertProps> = ({
  sheet,
  onChange,
}) => {
  const { devoto } = sheet;
  if (!devoto || !hasPendingExtraPower(sheet)) return null;

  return (
    <Alert
      severity='warning'
      sx={{ mb: 1 }}
      action={
        onChange ? (
          <Button
            color='inherit'
            size='small'
            onClick={() =>
              onChange({ ...sheet, devoto: dismissPendingExtraPower(devoto) })
            }
          >
            Manter assim
          </Button>
        ) : undefined
      }
    >
      {PENDING_EXTRA_POWER_TEXT}
    </Alert>
  );
};

export default PendingExtraPowerAlert;
