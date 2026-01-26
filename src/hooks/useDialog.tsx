import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

interface DialogOptions {
  title?: string;
  message: string;
}

interface ConfirmDialogOptions extends DialogOptions {
  confirmText?: string;
  cancelText?: string;
}

export const useAlert = () => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<DialogOptions>({
    title: 'Aviso',
    message: '',
  });

  const showAlert = useCallback((message: string, title?: string) => {
    setOptions({ title: title || 'Aviso', message });
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const AlertDialog = useCallback(
    () => (
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>{options.title}</DialogTitle>
        <DialogContent>
          <DialogContentText
            id='alert-dialog-description'
            sx={{ whiteSpace: 'pre-line' }}
          >
            {options.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='primary' autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    ),
    [open, options, handleClose]
  );

  return { showAlert, AlertDialog };
};

export const useConfirm = () => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmDialogOptions>({
    title: 'Confirmar',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
  });
  const [resolvePromise, setResolvePromise] = useState<
    ((value: boolean) => void) | null
  >(null);

  const showConfirm = useCallback(
    (
      message: string,
      title?: string,
      confirmText?: string,
      cancelText?: string
    ): Promise<boolean> => {
      setOptions({
        title: title || 'Confirmar',
        message,
        confirmText: confirmText || 'Confirmar',
        cancelText: cancelText || 'Cancelar',
      });
      setOpen(true);

      return new Promise<boolean>((resolve) => {
        setResolvePromise(() => resolve);
      });
    },
    []
  );

  const handleConfirm = useCallback(() => {
    setOpen(false);
    if (resolvePromise) {
      resolvePromise(true);
      setResolvePromise(null);
    }
  }, [resolvePromise]);

  const handleCancel = useCallback(() => {
    setOpen(false);
    if (resolvePromise) {
      resolvePromise(false);
      setResolvePromise(null);
    }
  }, [resolvePromise]);

  const ConfirmDialog = useCallback(
    () => (
      <Dialog
        open={open}
        onClose={handleCancel}
        aria-labelledby='confirm-dialog-title'
        aria-describedby='confirm-dialog-description'
      >
        <DialogTitle id='confirm-dialog-title'>{options.title}</DialogTitle>
        <DialogContent>
          <DialogContentText
            id='confirm-dialog-description'
            sx={{ whiteSpace: 'pre-line' }}
          >
            {options.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color='inherit'>
            {options.cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            color='primary'
            variant='contained'
            autoFocus
          >
            {options.confirmText}
          </Button>
        </DialogActions>
      </Dialog>
    ),
    [open, options, handleConfirm, handleCancel]
  );

  return { showConfirm, ConfirmDialog };
};
