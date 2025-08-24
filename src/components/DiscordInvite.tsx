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
const CURRENT_ALERT_NAME = 'version33Alert';

const DiscordInvite = () => {
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
      <DialogTitle id='alert-dialog-title'>Versão 3.3</DialogTitle>
      <DialogContent>
        <DialogContentText id='alert-dialog-description'>
          <p>
            Uma nova versão está entre nós! Ao selecionar um poder manualmente
            na ficha como &quot;Aumento de Atributo&quot;, agora você pode
            escolher o que o poder irá afetar.
          </p>
          <p>
            Muitas melhorias foram feitas no editor de fichas em relação aos
            poderes, e você pode conferir a lista comppleta de mudanças no
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

export default DiscordInvite;
