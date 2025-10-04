import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import React from 'react';

const ls = window.localStorage;
const CURRENT_ALERT_NAME = 'version341Alert';
const OLD_ALERT_NAME = 'version34Alert';

const SystemUpdate = () => {
  // Clean up old alert from localStorage
  React.useEffect(() => {
    if (ls.getItem(OLD_ALERT_NAME)) {
      ls.removeItem(OLD_ALERT_NAME);
    }
  }, []);

  const doNotShow = ls.getItem(CURRENT_ALERT_NAME) === 'true';
  const [open, setOpen] = React.useState(!doNotShow);

  const handleClose = () => {
    setOpen(false);
  };

  const doNotShowAnymore = () => {
    ls.setItem(CURRENT_ALERT_NAME, 'true');
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
    >
      <DialogTitle id='alert-dialog-title'>Versão 3.4.1</DialogTitle>
      <DialogContent>
        <DialogContentText id='alert-dialog-description'>
          <p>
            Nova atualização disponível! A versão 3.4.1 traz melhorias na
            interface do passo-a-passo e diversas correções na edição de fichas.
          </p>
          <p>
            Agora você pode visualizar tamanho e deslocamento diretamente na
            ficha, além de uma interface aprimorada para seleção manual de
            atributos ao editar raças. Confira a lista completa de mudanças no
            <a href='https://fichasdenimb.com.br/#/changelog'> Changelog</a>
          </p>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button variant='contained' size='small' onClick={doNotShowAnymore}>
          Nunca mais mostrar
        </Button>
        <Button variant='contained' onClick={handleClose}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SystemUpdate;
