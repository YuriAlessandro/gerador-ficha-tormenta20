import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface NotesDialogProps {
  open: boolean;
  onClose: () => void;
  notes: string;
  /** Ausente = somente leitura (ficha de outra pessoa). */
  onSave?: (notes: string) => void;
}

/**
 * Anotações da ficha em texto simples: um bloco só, salvo pelo botão.
 *
 * O texto vive em estado local e só vai para a ficha no "Salvar" — nada de
 * gravação a cada tecla, que é justamente o que quem escolhe o modo simples
 * não quer.
 */
const NotesDialog: React.FC<NotesDialogProps> = ({
  open,
  onClose,
  notes,
  onSave,
}) => {
  const [localNotes, setLocalNotes] = useState(notes);
  const isMobile = useMediaQuery('(max-width:768px)', { noSsr: true });
  const readOnly = !onSave;

  // Carrega o texto UMA vez por abertura. A ficha troca de identidade a cada
  // atualização (PV, PM, rolagem na mesa), e recarregar a cada troca apagaria
  // o que está sendo digitado.
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (open && !wasOpenRef.current) setLocalNotes(notes);
    wasOpenRef.current = open;
  }, [open, notes]);

  const handleSave = () => {
    if (onSave && localNotes !== notes) onSave(localNotes);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle>
        <Stack
          direction='row'
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          Anotações
          <IconButton size='small' aria-label='Fechar' onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <TextField
          multiline
          minRows={isMobile ? 16 : 12}
          fullWidth
          autoFocus={!readOnly}
          value={localNotes}
          onChange={(event) => setLocalNotes(event.target.value)}
          placeholder='Escreva suas anotações aqui...'
          slotProps={{ input: { readOnly } }}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        {readOnly ? (
          <Button onClick={onClose}>Fechar</Button>
        ) : (
          <>
            <Button onClick={onClose}>Cancelar</Button>
            <Button variant='contained' onClick={handleSave}>
              Salvar
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default NotesDialog;
