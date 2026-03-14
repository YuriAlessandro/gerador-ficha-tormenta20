export type CardColor = 'black' | 'red';
export type CardType = 'number' | 'fox';

export interface WyrtCard {
  id: string;
  color: CardColor;
  type: CardType;
  value: number | null;
}

export type PlayerType = 'human' | 'bot';
export type PlayerStatus = 'active' | 'folded' | 'eliminated';

export interface DieState {
  rolled: boolean;
  eliminated: boolean;
  value: number | null;
}

export interface WyrtPlayer {
  id: string;
  name: string;
  type: PlayerType;
  money: number;
  hand: WyrtCard[];
  discardedCards: WyrtCard[];
  die: DieState;
  status: PlayerStatus;
  currentBet: number;
  discardsUsed: number;
}

export type GamePhase =
  | 'setup'
  | 'dealing'
  | 'firstRoll'
  | 'playing'
  | 'doubling'
  | 'roundEnd'
  | 'gameOver';

export type WyrtActionType =
  | 'ROLL_DIE'
  | 'DOUBLE_BET'
  | 'ACCEPT_DOUBLE'
  | 'REJECT_DOUBLE'
  | 'DISCARD_CARD'
  | 'ELIMINATE_DIE'
  | 'CALL_MOSTREM';

export interface GameLogEntry {
  id: string;
  timestamp: number;
  playerId: string;
  action: WyrtActionType;
  details: string;
  cardId?: string;
  dieValue?: number;
}

export interface RolledDie {
  playerId: string;
  value: number;
}

export interface PlayerScore {
  playerId: string;
  redSum: number;
  blackSum: number;
  bestDistance: number;
  bestColor: CardColor | 'both';
  isDoubleHit: boolean;
  highestCard: number;
  secondHighestCard: number;
}

export interface RoundResult {
  scores: PlayerScore[];
  winnerId: string;
  foxNumber: number;
  isDoubleHit: boolean;
  winnings: number;
}

export interface WyrtGameState {
  phase: GamePhase;
  players: WyrtPlayer[];
  currentPlayerIndex: number;
  drawPile: WyrtCard[];
  foxBlackDiscarded: boolean;
  foxRedDiscarded: boolean;
  pot: number;
  currentBetAmount: number;
  foxNumber: number;
  rolledDice: RolledDie[];
  log: GameLogEntry[];
  roundNumber: number;
  firstPlayerIndex: number;
  doublingPlayerId: string | null;
  doublingResponseIndex: number;
  roundResults: RoundResult | null;
  unlimitedMoney: boolean;
}

export type WyrtReducerAction =
  | {
      type: 'START_GAME';
      players: WyrtPlayer[];
      deck: WyrtCard[];
      unlimitedMoney?: boolean;
    }
  | { type: 'ROLL_DIE'; playerId: string; dieValue: number }
  | { type: 'DOUBLE_BET'; playerId: string }
  | { type: 'ACCEPT_DOUBLE'; playerId: string }
  | { type: 'REJECT_DOUBLE'; playerId: string }
  | { type: 'DISCARD_CARD'; playerId: string; cardId: string }
  | { type: 'ELIMINATE_DIE'; playerId: string }
  | { type: 'CALL_MOSTREM'; playerId: string }
  | { type: 'SCORE_ROUND' }
  | { type: 'NEXT_ROUND'; deck: WyrtCard[] }
  | { type: 'END_GAME' };

// --- Multiplayer Types ---

export type WyrtGameMode = 'local' | 'online';

export interface WyrtRoomInfo {
  code: string;
  phase: 'waiting' | 'playing' | 'finished';
  players: Array<{
    odUserId: string;
    username: string;
    isHost: boolean;
    isConnected: boolean;
  }>;
  botCount: number;
}
