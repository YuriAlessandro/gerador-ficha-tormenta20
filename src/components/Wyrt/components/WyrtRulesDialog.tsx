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

interface WyrtRulesDialogProps {
  open: boolean;
  onClose: () => void;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography
        sx={{
          fontSize: '1.05rem',
          fontWeight: 700,
          color: '#d4a847',
          fontFamily: '"Tfont", serif',
          mb: 0.3,
        }}
      >
        {title}
      </Typography>
      <Typography sx={{ fontSize: '0.95rem', color: '#b0c0b0' }}>
        {children}
      </Typography>
    </Box>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <Box sx={{ pl: 2, mb: 1.5 }}>
      {items.map((item) => (
        <Typography
          key={item}
          sx={{
            fontSize: '0.95rem',
            color: '#b0c0b0',
            mb: 0.4,
            '&::before': {
              content: '"• "',
              color: '#d4a847',
            },
          }}
        >
          {item}
        </Typography>
      ))}
    </Box>
  );
}

function WyrtRulesDialog({ open, onClose }: WyrtRulesDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(180deg, #2a3a2a 0%, #1a2a1a 100%)',
          border: '2px solid #d4a847',
          borderRadius: '12px',
          boxShadow: '0 0 30px rgba(212,168,71,0.2)',
          maxHeight: '80vh',
        },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 0 }}>
        <Typography
          sx={{
            fontSize: '1.6rem',
            fontWeight: 900,
            color: '#d4a847',
            fontFamily: '"Tfont", serif',
          }}
        >
          Regras do Wyrt
        </Typography>
      </DialogTitle>

      <DialogContent
        sx={{
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(212,168,71,0.3)',
            borderRadius: 2,
          },
        }}
      >
        <Box sx={{ color: '#c0d0c0', fontSize: '1rem', lineHeight: 1.7 }}>
          <Section title='Objetivo'>
            Somar cartas da mesma cor o mais perto possível do Número da Raposa
            (soma de todos os dados na mesa).
          </Section>

          <Section title='O Baralho'>
            22 cartas: 10 pretas (1-10), 10 vermelhas (1-10) e 2 raposas
            (coringa preta e vermelha). Cada jogador recebe 3 cartas e 1 dado.
          </Section>

          <Section title='Ações por Turno'>
            O primeiro jogador deve rolar seu dado. Os demais escolhem UMA ação:
          </Section>

          <BulletList
            items={[
              'Rolar Dado: adiciona seu dado ao Número da Raposa.',
              'DOBRO!: dobra a aposta. Todos decidem se cobrem ou saem.',
              'Descartar Carta: coloca uma carta aberta (máx. 2). Se for uma raposa, TODAS as cartas daquela cor ficam inválidas!',
              'Eliminar Dado: remove seu dado sem rolar. Se for o último, a rodada acaba.',
              'MOSTREM!: encerra a rodada (só se seu dado já foi usado).',
            ]}
          />

          <Section title='Fim da Rodada'>
            Quando não sobram dados ativos ou alguém grita MOSTREM!, todos
            revelam suas cartas. Cartas da mesma cor são somadas. O valor mais
            próximo do Número da Raposa vence!
          </Section>

          <Section title='Carta da Raposa'>
            Se descartada, TODAS as cartas daquela cor ficam sem valor para
            todos os jogadores. Só pode haver uma raposa aberta na mesa.
          </Section>

          <Section title='Acerto Duplo'>
            Se ambas as somas (vermelha E preta) acertam o Número da Raposa
            exato, todos os outros jogadores pagam o dobro da aposta!
          </Section>

          <Section title='Desempate'>
            Em caso de empate, vence quem tiver a maior carta na mão. Se
            persistir, a segunda maior carta decide.
          </Section>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button
          onClick={onClose}
          sx={{
            background: 'linear-gradient(180deg, #d4a847, #b8922e)',
            color: '#1a2a1a',
            border: '1px solid #f0d060',
            borderRadius: '6px',
            px: 3,
            py: 0.8,
            fontWeight: 700,
            textTransform: 'none',
            '&:hover': {
              background: 'linear-gradient(180deg, #f0d060, #d4a847)',
            },
          }}
        >
          Entendi!
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default WyrtRulesDialog;
