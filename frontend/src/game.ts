import { nanoid } from 'nanoid';

export type BoardLocation = [x: number, y: number];
export type PathNode = { capture?: BoardLocation; x: number; y: number };
export type Color = 'white' | 'red';
export type Board = (Piece | undefined)[][];

export const letters = 'abcdefgh';

export interface Move {
  color: Color;
  path: BoardLocation[];
  captures?: BoardLocation[];
  king?: boolean;
}

export class GameState {
  constructor(public id: string) {}

  players: Player[] = [];
  turn = 0;
  turnCount = 0;
  started = false;
}

/*
 * board layout
 *   ┌───┬───┬───┬───┬───┬───┬───┬───┐
 * 7 │   │ B │   │ B │   │ B │   │ B │
 *   ├───┼───┼───┼───┼───┼───┼───┼───┤
 * 6 │ B │   │ B │   │ B │   │ B │   │
 *   ├───┼───┼───┼───┼───┼───┼───┼───┤
 * 5 │   │ B │   │ B │   │ B │   │ B │
 *   ├───┼───┼───┼───┼───┼───┼───┼───┤
 * 4 │   │   │   │   │   │   │   │   │
 *   ├───┼───┼───┼───┼───┼───┼───┼───┤
 * 3 │   │   │   │   │   │   │   │   │
 *   ├───┼───┼───┼───┼───┼───┼───┼───┤
 * 2 │ W │   │ W │   │ W │   │ W │   │
 *   ├───┼───┼───┼───┼───┼───┼───┼───┤
 * 1 │   │ W │   │ W │   │ W │   │ W │
 *   ├───┼───┼───┼───┼───┼───┼───┼───┤
 * 0 │ W │   │ W │   │ W │   │ W │   │
 *   └───┴───┴───┴───┴───┴───┴───┴───┘
 *     0   1   2   3   4   5   6   7
 */

export const startingLocations: Record<Color, BoardLocation[]> = {
  white: new Array(12).fill(0).map((_, i) => [Math.floor(i * (2 / 3)), (i * 2) % 3]),
  red: new Array(12).fill(0).map((_, i) => [7 - Math.floor(i * (2 / 3)), 7 - ((i * 2) % 3)]),
};

export interface Player {
  pieces: Piece[];
  id: string;
  name: string;
  color: Color;
}

export const getPiece = (player: Player, x: number, y: number, color?: Color): Piece | undefined =>
  player.pieces.find(
    ({ x: pX, y: pY, color: pColor }) => pX === x && pY === y && pColor === (color ?? pColor)
  );

export class Human implements Player {
  pieces: Piece[] = [];
  constructor(public id: string, public color: Color, public name = 'Player') {}
}

export class Computer implements Player {
  pieces: Piece[] = [];
  id: string;
  constructor(public color: Color, public name = 'Computer') {
    this.id = `bot-${nanoid()}`;
  }
}

export class Piece {
  king = false;
  constructor(public x: number, public y: number, public color: Color) {
    if (x < 0 || x > 7) throw new Error(`Invalid x position ${x} for piece`);
    if (y < 0 || y > 7) throw new Error(`Invalid y position ${y} for piece`);
  }
}

export function isValidLocation(location?: BoardLocation): boolean;
export function isValidLocation(x?: number, y?: number): boolean;
export function isValidLocation(x?: number | BoardLocation, y?: number): boolean {
  if (Array.isArray(x)) {
    [x, y] = x;
  }

  return x != undefined && y != undefined && x >= 0 && x < 8 && y >= 0 && y < 8;
}

export const getBoard = (game: GameState): Board => {
  const board: (Piece | undefined)[][] = new Array(8)
    .fill(0)
    .map(() => new Array(8).fill(undefined));

  game.players.forEach(player =>
    player.pieces.forEach(piece => {
      board[piece.y][piece.x] = piece;
    })
  );

  return board;
};

export const formatBoard = (board: Board): string =>
  '┌───┬───┬───┬───┬───┬───┬───┬───┐\n' +
  [...board]
    .reverse()
    .map(
      row => '│ ' + row.map(p => (!p ? ' ' : p.color === 'white' ? 'W' : 'R')).join(' │ ') + ' │'
    )
    .join('\n├───┼───┼───┼───┼───┼───┼───┼───┤\n') +
  '\n└───┴───┴───┴───┴───┴───┴───┴───┘';

const findPossibleCaptures = (game: GameState, piece: Piece): Move[] => {
  const path: PathNode[] = [{ x: piece.x, y: piece.y }];
  const moves: Move[] = [];
  const board = getBoard(game);

  findNextCapture(board, piece, path, moves);

  return moves;
};

const findNextCapture = (board: Board, piece: Piece, path: PathNode[], moves: Move[]) => {
  const { x, y } = path[path.length - 1];

  const direction = piece.color === 'white' ? 1 : -1;
  const possibleDeltaY = piece.king ? [-1, 1] : [1];
  const possibleDeltaX = [-1, 1];

  let found = false;

  for (const dY of possibleDeltaY) {
    for (const dX of possibleDeltaX) {
      const middleX = x + dX * direction;
      const middleY = y + dY * direction;
      const endX = middleX + dX * direction;
      const endY = middleY + dY * direction;

      // see if jump is on the board
      if (isValidLocation(endX, endY)) {
        const middlePiece = board[middleY][middleX];
        const endPiece = board[endY][endX];

        // see if the middle piece is an opponent and the landing is open
        if (!endPiece && middlePiece && middlePiece.color !== piece.color) {
          const crowned = !piece.king && endY === (piece.color === 'white' ? 7 : 0);
          found = true;

          // keep track of the coordinates, and move the piece
          board[y][x] = undefined;
          board[middleY][middleX] = undefined;
          board[endY][endX] = new Piece(endX, endY, piece.color);
          board[endY][endX]!.king = crowned;

          path.push({ x: endX, y: endY, capture: [middleX, middleY] });
          // if we're crowned, or there are no further jumps from here,
          // we've reached a terminal positionee
          if (crowned || !findNextCapture(board, piece, path, moves)) {
            moves.push({
              color: piece.color,
              king: crowned,
              captures: path.filter(n => !!n.capture).map(n => n.capture) as BoardLocation[],
              path: path.map(n => [n.x, n.y]),
            });
          }

          // put things back where we found them
          path.pop();
          board[y][x] = piece;
          board[middleY][middleX] = middlePiece;
          board[endY][endX] = endPiece;
        }
      }
    }
  }

  return found;
};

const findPossibleMoves = (game: GameState, piece: Piece): Move[] => {
  const direction = piece.color === 'white' ? 1 : -1;
  const moves: Move[] = [];
  const board = getBoard(game);

  const possibleDeltaY = piece.king ? [-1, 1] : [1];
  const possibleDeltaX = [-1, 1];

  // loop over directions (dx, dy) from the current square
  for (const dY of possibleDeltaY) {
    for (const dX of possibleDeltaX) {
      const endX = piece.x + dX * direction;
      const endY = piece.y + dY * direction;

      if (isValidLocation(endX, endY)) {
        // see if the landing is open
        if (!board[endY][endX]) {
          moves.push({
            color: piece.color,
            king: endY === (piece.color === 'white' ? 7 : 0),
            path: [
              [piece.x, piece.y],
              [endX, endY],
            ],
          });
        }
      }
    }
  }

  return moves;
};

export const getValidMoves = (game: GameState, piece: Piece): Move[] => {
  const jumps = findPossibleCaptures(game, piece);
  if (jumps.length) return jumps;

  return findPossibleMoves(game, piece);
};
