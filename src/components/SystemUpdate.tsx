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
const CURRENT_ALERT_NAME = 'version34Alert';

const SystemUpdate = () => {
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
      <DialogTitle id='alert-dialog-title'>Versão 3.4</DialogTitle>
      <DialogContent>
        <DialogContentText id='alert-dialog-description'>
          <p>
            Uma nova versão está entre nós! A versão 3.4 traz o poder
            &quot;Golpe Pessoal&quot; para Guerreiros, com 18 efeitos
            personalizáveis para criar ataques únicos.
          </p>
          <p>
            Além disso, o sistema de equipamentos foi expandido com 97 novos
            itens e melhorias para Inventores. Confira a lista completa de
            mudanças no
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
