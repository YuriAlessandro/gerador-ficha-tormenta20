import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface NotesDialogProps {
  open: boolean;
  onClose: () => void;
  notes: string;
  onSave: (notes: string) => void;
}

const NotesDialog: React.FC<NotesDialogProps> = ({
  open,
  onClose,
  notes,
  onSave,
}) => {
  const [localNotes, setLocalNotes] = useState(notes);
  const isMobile = useMemo(() => window.innerWidth < 720, []);

  useEffect(() => {
    if (open) {
      setLocalNotes(notes);
    }
  }, [open, notes]);

  const handleSave = () => {
    onSave(localNotes);
    onClose();
  };

  const handleCancel = () => {
    setLocalNotes(notes);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth='md'
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle>
        <Stack
          direction='row'
          alignItems='center'
          justifyContent='space-between'
        >
          Anotações
          <IconButton size='small' onClick={handleCancel}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <TextField
          multiline
          minRows={10}
          fullWidth
          value={localNotes}
          onChange={(e) => setLocalNotes(e.target.value)}
          placeholder='Escreva suas anotações aqui...'
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancelar</Button>
        <Button variant='contained' onClick={handleSave}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotesDialog;
