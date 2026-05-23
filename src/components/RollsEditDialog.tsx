import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from '@mui/material';
import { DiceRoll } from '@/interfaces/DiceRoll';
import RollsEditorPanel from './RollsEditorPanel';

interface RollsEditDialogProps {
  open: boolean;
  onClose: () => void;
  rolls: DiceRoll[];
  onSave: (rolls: DiceRoll[]) => void;
  title?: string;
}

/**
 * Dialog que envolve `RollsEditorPanel` com semântica de Salvar/Cancelar:
 * mudanças no painel só são persistidas quando o usuário confirma. Continua
 * sendo usado por consumidores que querem o fluxo modal clássico
 * (ItemEditorDialog, SpellCastDialog). Para casos em que o estado é
 * persistido on-change (ex.: `PowerSettingsDialog`), use o painel direto.
 */
const RollsEditDialog: React.FC<RollsEditDialogProps> = ({
  open,
  onClose,
  rolls,
  onSave,
  title = 'Editar Rolagens',
}) => {
  const [localRolls, setLocalRolls] = useState<DiceRoll[]>([]);

  useEffect(() => {
    if (open) {
      setLocalRolls([...rolls]);
    }
  }, [rolls, open]);

  const handleSave = () => {
    onSave(localRolls);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <RollsEditorPanel rolls={localRolls} onChange={setLocalRolls} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant='contained'>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RollsEditDialog;
