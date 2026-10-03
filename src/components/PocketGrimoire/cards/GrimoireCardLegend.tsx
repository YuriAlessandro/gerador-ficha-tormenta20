import React from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import { ACCENT_ORDER, accentLabel, ItemAccent } from './itemPresentation';
import { accentFrame } from './accentColor';

interface Props {
  /** Tons presentes no grimório — só eles entram na legenda. */
  accents: ItemAccent[];
}

/** Legenda das cores das cartas, no fim da página do grimório. */
const GrimoireCardLegend: React.FC<Props> = ({ accents }) => {
  const theme = useTheme();
  const present = ACCENT_ORDER.filter((accent) => accents.includes(accent));
  if (present.length === 0) return null;

  return (
    <Paper
      component='section'
      aria-label='Legenda das cartas'
      variant='outlined'
      sx={{ mt: 4, p: 2 }}
    >
      <Typography
        variant='overline'
        sx={{ display: 'block', color: 'text.secondary', mb: 1 }}
      >
        Legenda das cartas
      </Typography>
      <Box
        component='ul'
        sx={{
          m: 0,
          p: 0,
          listStyle: 'none',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 1,
        }}
      >
        {present.map((accent) => (
          <Box
            component='li'
            key={accent}
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <Box
              aria-hidden
              sx={{
                flex: 'none',
                width: 18,
                height: 24,
                borderRadius: 0.75,
                background: accentFrame(theme, accent),
                outline:
                  accent === 'missing'
                    ? `2px dashed ${theme.palette.divider}`
                    : 'none',
              }}
            />
            <Typography variant='body2'>{accentLabel(accent)}</Typography>
          </Box>
        ))}
      </Box>
      <Typography
        variant='caption'
        sx={{ display: 'block', color: 'text.secondary', mt: 1.5 }}
      >
        O número no selo é o círculo da magia. Passe o mouse sobre uma carta
        para ver o tipo.
      </Typography>
    </Paper>
  );
};

export default GrimoireCardLegend;
