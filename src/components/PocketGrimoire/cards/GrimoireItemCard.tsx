import React from 'react';
import { Chip } from '@mui/material';
import { ResolvedItem } from '../../../functions/pocketGrimoire/resolveItems';
import GrimoireCardShell from './GrimoireCardShell';
import GrimoireItemDetails from './GrimoireItemDetails';
import GrimoireMissingCard from './GrimoireMissingCard';
import { presentItem } from './itemPresentation';

interface Props {
  item: ResolvedItem;
  defaultOpen: boolean;
  onRemove: (itemId: string) => void;
}

/** Card expansível do modo lista. */
const GrimoireItemCard: React.FC<Props> = ({ item, defaultOpen, onRemove }) => {
  const handleRemove = () => onRemove(item.id);

  if (item.kind === 'missing') {
    return <GrimoireMissingCard name={item.name} onRemove={handleRemove} />;
  }

  const view = presentItem(item);
  return (
    <GrimoireCardShell
      title={view.title}
      summary={view.summary}
      chips={view.chips.map((label) => (
        <Chip
          key={label}
          label={label}
          size='small'
          variant='outlined'
          color={label === 'Divina' ? 'secondary' : 'primary'}
          sx={{ height: 20, fontSize: '0.7rem' }}
        />
      ))}
      defaultOpen={defaultOpen}
      onRemove={handleRemove}
    >
      <GrimoireItemDetails item={item} />
    </GrimoireCardShell>
  );
};

export default GrimoireItemCard;
