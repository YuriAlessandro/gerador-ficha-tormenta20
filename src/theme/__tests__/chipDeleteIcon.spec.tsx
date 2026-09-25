import React from 'react';
import { render } from '@testing-library/react';
import { Chip, ThemeProvider, createTheme } from '@mui/material';
import { getThemeOptions } from '../theme';
import { getAccentColor } from '../accentColors';

/**
 * O tema dá fundo sólido de destaque a todo Chip `color='primary'`, inclusive
 * `variant='outlined'`. O MUI pinta o ícone de apagar do outlined na cor
 * primária: vermelho no vermelho, invisível no tema claro (chips de magias
 * escolhidas no SpellCardPicker).
 */
describe('Chip primário: ícone de apagar visível', () => {
  it.each(['light', 'dark'] as const)('tema %s', (mode) => {
    const accent = getAccentColor();
    const { container } = render(
      <ThemeProvider theme={createTheme(getThemeOptions(mode, accent))}>
        <Chip
          label='Magia'
          color='primary'
          variant='outlined'
          onDelete={() => undefined}
        />
      </ThemeProvider>
    );
    const icon = container.querySelector('.MuiChip-deleteIcon')!;
    const chip = container.querySelector('.MuiChip-root')!;
    const iconColor = getComputedStyle(icon).color;
    expect(iconColor).not.toBe(getComputedStyle(chip).backgroundColor);
    expect(iconColor).toBe('rgba(255, 255, 255, 0.7)');
  });
});
