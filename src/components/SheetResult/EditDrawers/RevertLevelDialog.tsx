import React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { LastLevelSummary } from '@/functions/revertLevel';

interface RevertLevelDialogProps {
  open: boolean;
  summary: LastLevelSummary | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const SummaryGroup: React.FC<{ title: string; items: string[] }> = ({
  title,
  items,
}) => {
  if (items.length === 0) return null;
  return (
    <Box>
      <Typography variant='subtitle2' sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      <Stack direction='row' sx={{ flexWrap: 'wrap', gap: 0.5 }}>
        {items.map((item, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Chip key={`${item}-${index}`} label={item} size='small' />
        ))}
      </Stack>
    </Box>
  );
};

const RevertLevelDialog: React.FC<RevertLevelDialogProps> = ({
  open,
  summary,
  onConfirm,
  onCancel,
}) => {
  if (!summary) return null;

  const nothingRecorded =
    summary.powers.length === 0 &&
    summary.abilities.length === 0 &&
    summary.spells.length === 0;

  return (
    <Dialog open={open} onClose={onCancel} maxWidth='sm' fullWidth>
      <DialogTitle>
        Desfazer nível {summary.level} ({summary.className} {summary.classLevel}
        )
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography variant='body2'>
            A ficha volta para o nível {summary.level - 1}. Sai tudo o que este
            nível concedeu, e o que os efeitos disso mudaram na ficha:
          </Typography>

          <SummaryGroup title='Poderes' items={summary.powers} />
          <SummaryGroup
            title='Habilidades de classe'
            items={summary.abilities}
          />
          <SummaryGroup title='Magias' items={summary.spells} />

          {nothingRecorded && (
            <Alert severity='warning'>
              Não há registro do que este nível concedeu (o nível pode ter sido
              alterado à mão). Só o nível e os valores que dependem dele serão
              ajustados — poderes e magias precisam ser removidos à mão.
            </Alert>
          )}

          <Alert severity='info'>
            Trocas de poder de origem (como Cosmopolita) feitas neste nível não
            são desfeitas.
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancelar</Button>
        <Button onClick={onConfirm} color='error' variant='contained'>
          Desfazer nível
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RevertLevelDialog;
