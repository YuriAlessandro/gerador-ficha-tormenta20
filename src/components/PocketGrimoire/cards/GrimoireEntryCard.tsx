import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Chip, Link, Typography } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import GrimoireCardShell from './GrimoireCardShell';
import { EncyclopediaEntry } from '../../../functions/encyclopediaSearch';
import { encyclopediaPath } from '../../../functions/pocketGrimoire/resolveItems';

interface Props {
  entry: EncyclopediaEntry;
  /** Resumo de entidade inteira (classe, raça…): mostra link para a enciclopédia. */
  isSummary: boolean;
  defaultOpen: boolean;
  onRemove: () => void;
}

const GrimoireEntryCard: React.FC<Props> = ({
  entry,
  isSummary,
  defaultOpen,
  onRemove,
}) => (
  <GrimoireCardShell
    title={entry.title}
    summary={entry.subtitle}
    chips={
      <Chip
        label={entry.categoryLabel}
        size='small'
        variant='outlined'
        sx={{ height: 20, fontSize: '0.7rem' }}
      />
    }
    defaultOpen={defaultOpen}
    onRemove={onRemove}
  >
    {entry.subtitle && (
      <Typography variant='caption' sx={{ color: 'text.secondary' }}>
        {entry.subtitle}
      </Typography>
    )}
    {entry.description && (
      <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
        {entry.description}
      </Typography>
    )}
    {isSummary && (
      <Link
        component={RouterLink}
        to={encyclopediaPath(entry)}
        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 1 }}
      >
        Ver na enciclopédia
        <OpenInNewIcon fontSize='inherit' />
      </Link>
    )}
  </GrimoireCardShell>
);

export default GrimoireEntryCard;
