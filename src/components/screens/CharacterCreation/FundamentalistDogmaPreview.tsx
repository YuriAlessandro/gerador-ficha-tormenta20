import React from 'react';
import { Box, Typography } from '@mui/material';
import { DogmaFundamentalista } from '../../../interfaces/Character';
import { divindadeDisplayNames } from '../../../interfaces/Divindade';
import {
  formatDogmaPages,
  getDogma,
  getDogmaHeritageNote,
  getFundamentalistDeityKey,
  getPreferredWeaponRule,
} from '../../../functions/powers/fundamentalista';

interface FundamentalistDogmaPreviewProps {
  /** Chave do enum (valor do formulário) ou nome da divindade. */
  deityName: string;
  dogma: DogmaFundamentalista;
}

/**
 * Resumo do dogma no formulário de criação, para o jogador saber o que está
 * escolhendo antes de criar a ficha. Mesmo conteúdo do popover da ficha, sem a
 * punição e o +1 poder — o ⓘ do interruptor já explica os dois.
 */
const FundamentalistDogmaPreview: React.FC<FundamentalistDogmaPreviewProps> = ({
  deityName,
  dogma,
}) => {
  const info = getDogma(deityName, dogma);
  const key = getFundamentalistDeityKey(deityName);
  if (!info || !key) return null;

  const displayName = divindadeDisplayNames[key];
  const heritageNote = getDogmaHeritageNote(info);
  const weaponRule = getPreferredWeaponRule(displayName);

  return (
    <Box
      sx={{
        mt: 1,
        pl: 1.5,
        borderLeft: 2,
        borderColor: 'divider',
      }}
    >
      {heritageNote && (
        <Typography
          variant='caption'
          sx={{ display: 'block', color: 'text.secondary' }}
        >
          {heritageNote}
        </Typography>
      )}
      <Typography variant='body2'>{info.texto}</Typography>
      {weaponRule && (
        <Typography variant='caption' sx={{ display: 'block', mt: 0.5 }}>
          {weaponRule}
        </Typography>
      )}
      <Typography
        variant='caption'
        sx={{ display: 'block', color: 'text.secondary' }}
      >
        Deuses de Arton, {formatDogmaPages(info.paginas)}.
      </Typography>
    </Box>
  );
};

export default FundamentalistDogmaPreview;
