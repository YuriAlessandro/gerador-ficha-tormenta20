import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';

interface DoublePromptProps {
  open: boolean;
  doublerName: string;
  newBetAmount: number;
  onAccept: () => void;
  onReject: () => void;
}

function DoublePrompt({
  open,
  doublerName,
  newBetAmount,
  onAccept,
  onReject,
}: DoublePromptProps) {
  return (
    <Dialog
      open={open}
      PaperProps={{
        sx: {
          background: 'linear-gradient(180deg, #2a3a2a 0%, #1a2a1a 100%)',
          border: '2px solid #d4a847',
          borderRadius: '12px',
          boxShadow:
            '0 0 30px rgba(212,168,71,0.2), 0 10px 40px rgba(0,0,0,0.5)',
          maxWidth: 380,
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: 'center',
          pb: 0.5,
        }}
      >
        <Typography
          sx={{
            fontSize: '1.5rem',
            fontWeight: 900,
            color: '#d4a847',
            fontFamily: '"Tfont", serif',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          }}
        >
          DOBRO!
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 1 }}>
          <Typography
            sx={{
              fontSize: '1.05rem',
              color: '#c0d0c0',
              mb: 1.5,
            }}
          >
            <strong style={{ color: '#d4a847' }}>{doublerName}</strong> dobrou a
            aposta!
          </Typography>

          <Box
            sx={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '8px',
              py: 1.5,
              px: 2,
              border: '1px solid rgba(212,168,71,0.2)',
            }}
          >
            <Typography
              sx={{
                fontSize: '0.85rem',
                color: 'rgba(160,180,160,0.7)',
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              Nova aposta
            </Typography>
            <Typography
              sx={{
                fontSize: '1.7rem',
                fontWeight: 900,
                color: '#d4a847',
                fontFamily: '"Tfont", serif',
              }}
            >
              T$ {newBetAmount}
            </Typography>
          </Box>

          <Typography
            sx={{
              fontSize: '0.9rem',
              color: 'rgba(160,180,160,0.7)',
              mt: 1.5,
            }}
          >
            Deseja cobrir o dobro ou sair da rodada?
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pb: 2, gap: 1.5 }}>
        <Button
          onClick={onReject}
          sx={{
            background: 'linear-gradient(180deg, #8a3030, #6a2020)',
            color: '#fff',
            border: '1px solid #aa4444',
            borderRadius: '6px',
            px: 2.5,
            py: 0.8,
            fontWeight: 700,
            fontSize: '0.95rem',
            textTransform: 'none',
            '&:hover': {
              background: 'linear-gradient(180deg, #aa4444, #8a3030)',
            },
          }}
        >
          Sair da Rodada
        </Button>

        <Button
          onClick={onAccept}
          sx={{
            background: 'linear-gradient(180deg, #d4a847, #b8922e)',
            color: '#1a2a1a',
            border: '1px solid #f0d060',
            borderRadius: '6px',
            px: 2.5,
            py: 0.8,
            fontWeight: 700,
            fontSize: '0.95rem',
            textTransform: 'none',
            boxShadow: '0 0 12px rgba(212,168,71,0.3)',
            '&:hover': {
              background: 'linear-gradient(180deg, #f0d060, #d4a847)',
            },
          }}
        >
          Aceitar Dobro (T$ {newBetAmount})
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DoublePrompt;
