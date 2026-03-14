import React from 'react';
import { Box } from '@mui/material';
import { WyrtCard } from '../engine/types';
import CardComponent from './CardComponent';

interface PlayerHandProps {
  cards: WyrtCard[];
  selectedCardId: string | null;
  onCardClick: (cardId: string) => void;
  foxBlackDiscarded: boolean;
  foxRedDiscarded: boolean;
  selectable: boolean;
}

function PlayerHand({
  cards,
  selectedCardId,
  onCardClick,
  foxBlackDiscarded,
  foxRedDiscarded,
  selectable,
}: PlayerHandProps) {
  const isCardInvalidated = (card: WyrtCard): boolean => {
    if (card.color === 'black' && foxBlackDiscarded) return true;
    if (card.color === 'red' && foxRedDiscarded) return true;
    return false;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        justifyContent: 'center',
        alignItems: 'flex-end',
        py: 1,
      }}
    >
      {cards.map((card) => (
        <CardComponent
          key={card.id}
          card={card}
          selected={selectedCardId === card.id}
          invalidated={isCardInvalidated(card)}
          onClick={selectable ? () => onCardClick(card.id) : undefined}
          size='large'
          hoverable={selectable}
        />
      ))}
    </Box>
  );
}

export default PlayerHand;
