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
  const doNotShow = ls.getItem('version3Alert') === 'true';
  const [open, setOpen] = React.useState(!doNotShow);

  const handleClose = () => {
    setOpen(false);
  };

  const doNotShowAnymore = () => {
    ls.setItem('version3Alert', 'true');
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
    >
      <DialogTitle id='alert-dialog-title'>FdN - Versão 3</DialogTitle>
      <DialogContent>
        <DialogContentText id='alert-dialog-description'>
          <p>
            Atualizamos todo o projeto para a JdA, adicionamos a possibilidade
            de editar fichas e construimos um novo gerador de ameaças. E mais
            ferramentas estão por vir!
          </p>
          <p>
            Se você encontrar algum bug ou tiver alguma sugestão, por favor faça
            isso no link abaixo:
            <a
              href='https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions'
              rel='noreferrer'
              target='_blank'
            >
              https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions
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
