import { WyrtCard } from './types';

export function createDeck(): WyrtCard[] {
  const colors: Array<'black' | 'red'> = ['black', 'red'];

  const cards: WyrtCard[] = colors.flatMap((color) => {
    const numberCards: WyrtCard[] = Array.from({ length: 10 }, (_, i) => ({
      id: `${color}-${i + 1}`,
      color,
      type: 'number' as const,
      value: i + 1,
    }));

    const foxCard: WyrtCard = {
      id: `fox-${color}`,
      color,
      type: 'fox',
      value: null,
    };

    return [...numberCards, foxCard];
  });

  return cards;
}

export function shuffleDeck(deck: WyrtCard[]): WyrtCard[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function dealCards(
  deck: WyrtCard[],
  numPlayers: number,
  cardsPerPlayer: number
): { hands: WyrtCard[][]; remaining: WyrtCard[] } {
  const remaining = [...deck];
  const hands: WyrtCard[][] = [];

  for (let i = 0; i < numPlayers; i += 1) {
    const hand = remaining.splice(0, cardsPerPlayer);
    hands.push(hand);
  }

  return { hands, remaining };
}
