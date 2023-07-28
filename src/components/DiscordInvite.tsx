import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import React from 'react';

const DiscordInvite = () => {
  const [open, setOpen] = React.useState(true);

  const handleClose = () => {
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
          Estamos com um novo servidor no Discord que será usado para discutir o
          projeto, tirar dúvidas, receber feedbacks, e principalmente para
          mostrar e testar novas funcionalidades antes de lançá-las. Link:{' '}
          <a href='discord.gg/VczZEjv7sX' target='_blank'>
            discord.gg/VczZEjv7sX
          </a>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Disagree</Button>
        <Button onClick={handleClose} autoFocus>
          Agree
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DiscordInvite;
