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

const DiscordInvite = () => {
  const doNotShow = ls.getItem('doNotShowDiscordInvite') === 'true';
  const [open, setOpen] = React.useState(!doNotShow);

  const handleClose = () => {
    setOpen(false);
  };

  const doNotShowAnymore = () => {
    ls.setItem('doNotShowDiscordInvite', 'true');
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
    >
      <DialogTitle id='alert-dialog-title'>Nosso novo Discord</DialogTitle>
      <DialogContent>
        <DialogContentText id='alert-dialog-description'>
          <p>
            Estamos com um novo servidor no Discord que será usado para discutir
            o projeto, tirar dúvidas, receber feedbacks, e principalmente para
            mostrar e testar novas funcionalidades antes de lançá-las.
          </p>
          <p>
            Link:{' '}
            <a
              href='https://discord.gg/VczZEjv7sX'
              rel='noreferrer'
              target='_blank'
            >
              discord.gg/VczZEjv7sX
            </a>
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
