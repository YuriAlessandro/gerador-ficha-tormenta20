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
  const doNotShow = ls.getItem('doNotShowAvisoDiscordHackeado') === 'true';
  const [open, setOpen] = React.useState(!doNotShow);

  const handleClose = () => {
    setOpen(false);
  };

  const doNotShowAnymore = () => {
    ls.setItem('doNotShowAvisoDiscordHackeado', 'true');
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
    >
      <DialogTitle id='alert-dialog-title'>O que está rolando</DialogTitle>
      <DialogContent>
        <DialogContentText id='alert-dialog-description'>
          <p>
            O nosso (recém-criado) servidor no Discord infelizmente foi hackeado
            e apagado. Continuamos trabalhando em nosso tempo livre no novo
            construtor e focados em continuar atualizando o índice da DB Brasil
            com o Caverna do Saber.
          </p>
          <p>
            Recentemente, também começamos um novo projeto, o Mapa de Arton:
            <a
              href='https://mapadearton.fichasdenimb.com.br/'
              rel='noreferrer'
              target='_blank'
            >
              https://mapadearton.fichasdenimb.com.br/
            </a>
          </p>
          <p>
            Iremos atualizar esse mapa aos poucos com mais features e conteúdo.
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
