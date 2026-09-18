import React from 'react';
import { ResolvedItem } from '../../../functions/pocketGrimoire/resolveItems';
import GrimoireSpellCard from './GrimoireSpellCard';
import GrimoirePowerCard from './GrimoirePowerCard';
import GrimoireEntryCard from './GrimoireEntryCard';
import GrimoireMissingCard from './GrimoireMissingCard';

interface Props {
  item: ResolvedItem;
  defaultOpen: boolean;
  onRemove: (itemId: string) => void;
}

/** Escolhe o card pelo tipo resolvido do item. */
const GrimoireItemCard: React.FC<Props> = ({ item, defaultOpen, onRemove }) => {
  const handleRemove = () => onRemove(item.id);

  switch (item.kind) {
    case 'spell':
      return (
        <GrimoireSpellCard
          spell={item.spell}
          defaultOpen={defaultOpen}
          onRemove={handleRemove}
        />
      );
    case 'power':
      return (
        <GrimoirePowerCard
          entry={item.entry}
          power={item.power}
          defaultOpen={defaultOpen}
          onRemove={handleRemove}
        />
      );
    case 'missing':
      return <GrimoireMissingCard name={item.name} onRemove={handleRemove} />;
    default:
      return (
        <GrimoireEntryCard
          entry={item.entry}
          isSummary={item.kind === 'summary'}
          defaultOpen={defaultOpen}
          onRemove={handleRemove}
        />
      );
  }
};

export default GrimoireItemCard;
