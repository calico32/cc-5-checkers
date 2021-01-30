import type { GameState, Location, Piece, Player } from './types';

export interface GameRequests {
  start: { id: string };
  create: {};
  enter: { id: string; name?: string };
  leave: { id: string };
  state: { id: string };

  move: {
    oldLocation: Location;
    newLocation: Location;
  };
}

export interface GameResponses {
  create: { id: string };
  enter: { id: string; game: GameState };
  join: { id: string; player: Player };
  leave: { playerId: string };

  start: { game: GameState };
  state: { game: GameState };

  end: { endType: 'win'; winnerId: string; reason: string } | { endType: 'tie'; reason: string };
  error: { message: string };

  move: {
    playerId: string;
    oldLocation: Location;
    newLocation: Location;
    captured?: Piece;
    king: boolean;
  };
}
