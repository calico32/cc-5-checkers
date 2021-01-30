import type { BoardLocation, GameState, Piece, Player } from './game';

export interface GameRequests {
  start: { id: string };
  create: {};
  enter: { id: string; name?: string };
  leave: { id: string };
  state: { id: string };

  move: {
    start: BoardLocation;
    end: BoardLocation;
  };
}

export interface GameResponses {
  create: { id: string };
  enter: { id: string; game: GameState };
  join: { id: string; player: Player };
  leave: { playerId: string };

  start: { game: GameState; message: string; firstTurn: string };
  state: { game: GameState };

  end: { endType: 'win'; winnerId: string; message: string } | { endType: 'tie'; message: string };
  error: { message: string };

  message: { message: string };
  move: {
    message: string;
    playerId: string;
    start: BoardLocation;
    end: BoardLocation;
    captures?: Piece[];
    king: boolean;
  };
}
