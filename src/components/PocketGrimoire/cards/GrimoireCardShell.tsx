import React, { useState } from 'react';
import {
  Box,
  ButtonBase,
  Collapse,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';

interface Props {
  title: string;
  /** Linha curta exibida com o card fechado (texto ou ícones + valores). */
  summary?: React.ReactNode;
  /** Chips ao lado do título (tipo de magia, tipo de poder…). */
  chips?: React.ReactNode;
  defaultOpen: boolean;
  onRemove: () => void;
  children: React.ReactNode;
}

/** Moldura comum: cabeçalho clicável que expande + botão de remover. */
const GrimoireCardShell: React.FC<Props> = ({
  title,
  summary,
  chips,
  defaultOpen,
  onRemove,
  children,
}) => {
  // Só o estado inicial: adicionar ou remover itens não fecha o que o
  // jogador está lendo.
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Paper variant='outlined' sx={{ mb: 1, overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <ButtonBase
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          sx={{
            flex: 1,
            justifyContent: 'flex-start',
            textAlign: 'left',
            p: 1.5,
            gap: 1,
          }}
        >
          <KeyboardArrowDownIcon
            fontSize='small'
            sx={{
              mt: 0.25,
              color: 'text.secondary',
              transition: 'transform 0.2s',
              transform: open ? 'rotate(180deg)' : 'none',
            }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexWrap: 'wrap',
              }}
            >
              <Typography
                component='span'
                sx={{ fontFamily: 'Tfont, serif', fontWeight: 600 }}
              >
                {title}
              </Typography>
              {chips}
            </Box>
            {!open && summary && (
              <Typography
                component='span'
                variant='caption'
                data-testid='grimoire-card-summary'
                sx={{
                  color: 'text.secondary',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  columnGap: 1.25,
                }}
              >
                {summary}
              </Typography>
            )}
          </Box>
        </ButtonBase>
        <Tooltip title='Remover do grimório'>
          <IconButton
            aria-label={`Remover ${title} do grimório`}
            onClick={onRemove}
            size='small'
            sx={{ m: 1 }}
          >
            <DeleteOutlinedIcon fontSize='small' />
          </IconButton>
        </Tooltip>
      </Box>
      <Collapse in={open} timeout='auto' unmountOnExit>
        <Box sx={{ px: 2, pb: 2 }}>{children}</Box>
      </Collapse>
    </Paper>
  );
};

export default GrimoireCardShell;
