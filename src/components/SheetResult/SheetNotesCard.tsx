import React from 'react';
import { Box, Button, Card, Stack, Typography } from '@mui/material';
import NotesIcon from '@mui/icons-material/Notes';

interface SheetNotesCardProps {
  notes?: string;
  onOpen: () => void;
  readOnly?: boolean;
  /** Presente só quando o diário completo está disponível para esta ficha. */
  onSwitchToJournal?: () => void;
}

/**
 * O cartão das anotações em texto simples: a alternativa ao Diário para quem
 * quer um bloco de texto só. Mostra o começo do texto e abre o editor.
 */
const SheetNotesCard: React.FC<SheetNotesCardProps> = ({
  notes,
  onOpen,
  readOnly,
  onSwitchToJournal,
}) => {
  const hasNotes = !!notes?.trim();

  return (
    <Card sx={{ position: 'relative', overflow: 'hidden' }}>
      <Stack spacing={1.5} sx={{ p: 2 }}>
        <Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
          <NotesIcon fontSize='small' sx={{ color: 'primary.main' }} />
          <Typography
            variant='subtitle2'
            sx={{ fontFamily: 'Tfont', fontSize: '1.1rem', flex: 1 }}
          >
            Anotações
          </Typography>
        </Stack>

        <Box
          onClick={onOpen}
          sx={{
            minHeight: 96,
            maxHeight: 220,
            overflow: 'hidden',
            borderRadius: 1,
            cursor: 'pointer',
            p: 1.5,
            backgroundColor: 'action.hover',
            // O fim do texto some num degradê em vez de ser cortado no meio
            // de uma linha.
            maskImage: hasNotes
              ? 'linear-gradient(to bottom, #000 75%, transparent)'
              : 'none',
          }}
        >
          {hasNotes ? (
            <Typography
              variant='body2'
              sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            >
              {notes}
            </Typography>
          ) : (
            <Typography variant='caption' sx={{ opacity: 0.6 }}>
              {readOnly
                ? 'Nenhuma anotação.'
                : 'Um espaço livre para o que você quiser lembrar.'}
            </Typography>
          )}
        </Box>

        {(!readOnly || hasNotes) && (
          <Button size='small' variant='outlined' fullWidth onClick={onOpen}>
            {readOnly && 'Ler anotações'}
            {!readOnly && (hasNotes ? 'Editar anotações' : 'Escrever')}
          </Button>
        )}

        {onSwitchToJournal && (
          <Button size='small' fullWidth onClick={onSwitchToJournal}>
            Usar o diário completo
          </Button>
        )}
      </Stack>
    </Card>
  );
};

export default SheetNotesCard;
