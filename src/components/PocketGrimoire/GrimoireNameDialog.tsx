import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { normalizeGrimoireName } from '../../functions/pocketGrimoire/state';
import { GRIMOIRE_NAME_MAX_LENGTH } from '../../interfaces/PocketGrimoire';

interface Props {
  open: boolean;
  title: string;
  confirmLabel: string;
  initialName?: string;
  onClose: () => void;
  onConfirm: (name: string) => void;
}

const GrimoireNameDialog: React.FC<Props> = ({
  open,
  title,
  confirmLabel,
  initialName = '',
  onClose,
  onConfirm,
}) => {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (open) setName(initialName);
  }, [open, initialName]);

  const normalized = normalizeGrimoireName(name);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (normalized) onConfirm(normalized);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='xs'>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin='dense'
            label='Nome'
            value={name}
            onChange={(event) => setName(event.target.value)}
            slotProps={{ htmlInput: { maxLength: GRIMOIRE_NAME_MAX_LENGTH } }}
            helperText={`${name.length}/${GRIMOIRE_NAME_MAX_LENGTH}`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type='submit' variant='contained' disabled={!normalized}>
            {confirmLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default GrimoireNameDialog;
