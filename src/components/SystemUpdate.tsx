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
const CURRENT_ALERT_NAME = 'instagramAlert';
const OLD_ALERT_NAME = 'instagramAlert';

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

  // const doNotShowAnymore = () => {
  //   ls.setItem(CURRENT_ALERT_NAME, 'true');
  //   setOpen(false);
  // };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
    >
      <DialogTitle id='alert-dialog-title'>
        <a
          href='https://www.instagram.com/fichasdenimb/'
          target='_blank'
          rel='noreferrer'
        >
          @fichasdenimb
        </a>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id='alert-dialog-description'>
          <p>
            A maior e mais completa atualização do Fichas de Nimb está chegando.
          </p>
          <p>
            Segue nosso instagram{' '}
            <a
              href='https://www.instagram.com/fichasdenimb/'
              target='_blank'
              rel='noreferrer'
            >
              @fichasdenimb
            </a>{' '}
            para ficar por dentro de tudo que está para chegar e receber a
            atualização em primeira mão.
          </p>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        {/* <Button variant='contained' size='small' onClick={doNotShowAnymore}>
          Nunca mais mostrar
        </Button> */}
        <Button variant='contained' onClick={handleClose}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SystemUpdate;
