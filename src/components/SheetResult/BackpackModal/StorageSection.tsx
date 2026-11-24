import React from 'react';
import { Box, Grid, Stack, Typography } from '@mui/material';
import LuggageIcon from '@mui/icons-material/Luggage';
import StashIcon from '@mui/icons-material/HomeWork';

import Equipment from '../../../interfaces/Equipment';
import {
  STASH_LOCATION,
  StorageLocationUsage,
} from '../../../functions/bagStorage';

export interface StorageSectionProps {
  usage: StorageLocationUsage;
  /** Itens do local que passam pela busca/filtro da Mochila. */
  visibleItems: Equipment[];
  renderItemCard: (item: Equipment) => React.ReactNode;
}

const fmt = (n: number) => Number(n.toFixed(1)).toString();

/**
 * Um local fora do personagem — recipiente (Alforje, Carroça…) ou guardado —
 * com o que há nele e a ocupação. O que está aqui não conta na carga do
 * personagem. Passar do limite do recipiente só avisa: a regra não define
 * penalidade para montaria ou veículo sobrecarregado.
 */
const StorageSection: React.FC<StorageSectionProps> = ({
  usage,
  visibleItems,
  renderItemCard,
}) => {
  const isStash = usage.location === STASH_LOCATION;
  const over = usage.capacity !== undefined && usage.used > usage.capacity;
  const Icon = isStash ? StashIcon : LuggageIcon;

  let hint: string;
  if (isStash) {
    hint = 'Fora da aventura — não conta na carga.';
  } else if (usage.container?.nome === 'Alforje') {
    hint = 'Carregado pela sua montaria — não conta na sua carga.';
  } else {
    hint = 'Não conta na sua carga.';
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Stack
        direction='row'
        spacing={1}
        sx={{
          alignItems: 'center',
          mb: 1,
          pb: 0.5,
          borderBottom: 1,
          borderColor: over ? 'warning.main' : 'divider',
          flexWrap: 'wrap',
          rowGap: 0.25,
        }}
      >
        <Icon
          fontSize='small'
          sx={{ color: over ? 'warning.main' : 'text.secondary' }}
          aria-hidden
        />
        <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
          {usage.label}
        </Typography>
        <Typography
          variant='caption'
          sx={{
            color: over ? 'warning.main' : 'text.secondary',
            fontWeight: over ? 600 : undefined,
          }}
        >
          {usage.capacity !== undefined
            ? `${fmt(usage.used)}/${usage.capacity} espaços`
            : `${fmt(usage.used)} espaços`}
          {over ? ' · acima do limite' : ''}
        </Typography>
        <Typography
          variant='caption'
          sx={{
            color: 'text.secondary',
            display: { xs: 'none', sm: 'inline' },
          }}
        >
          · {hint}
        </Typography>
      </Stack>
      {visibleItems.length === 0 ? (
        <Typography variant='caption' sx={{ color: 'text.secondary' }}>
          Vazio. Use o botão de bagagem num item para guardá-lo aqui.
        </Typography>
      ) : (
        <Grid container spacing={1.5}>
          {visibleItems.map((item) => (
            <Grid
              key={item.id ?? item.nome}
              size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
            >
              {renderItemCard(item)}
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default StorageSection;
