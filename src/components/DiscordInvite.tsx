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
  const doNotShow = ls.getItem('doNotShow25Plans') === 'true';
  const [open, setOpen] = React.useState(!doNotShow);

  const handleClose = () => {
    setOpen(false);
  };

  const doNotShowAnymore = () => {
    ls.setItem('doNotShow25Plans', 'true');
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
    >
      <DialogTitle id='alert-dialog-title'>O que está rolando?</DialogTitle>
      <DialogContent>
        <DialogContentText id='alert-dialog-description'>
          <p>
            O projeto não está sendo atualizado recentemente. Essa é a verdade.
            Durante todo o ano de 2024, atualizamos apenas o mapa e a Caverna do
            Saber - de tempo em tempo. Os planos atuais são apenas atualizar o
            gerador para a versão mais recente do jogo, e manter o mapa e a
            Caverna do Saber.
          </p>
          <p>
            Se você deseja ajudar esses projetos de alguma maneira, acesse esse
            link:
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
