import { nanoid } from 'nanoid';

export type Location = [x: number, y: number];

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

export const startingLocations: Record<Color, Location[]> = {
  white: new Array(12).fill(0).map((_, i) => [Math.floor(i * (2 / 3)), (i * 2) % 3]),
  black: new Array(12).fill(0).map((_, i) => [7 - Math.floor(i * (2 / 3)), 7 - ((i * 2) % 3)]),
};

export type Color = 'white' | 'black';

export interface Player {
  pieces: Piece[];
  id: string;
  name: string;
  color: Color;

  getPiece(x: number, y: number, color?: Color): Piece | undefined;
}

export class Human implements Player {
  pieces: Piece[] = [];
  constructor(public id: string, public color: Color, public name = 'Player') {}

  getPiece(x: number, y: number, color?: Color): Piece | undefined {
    return this.pieces.find(
      ({ x: pX, y: pY, color: pColor }) => pX === x && pY === y && pColor === (color ?? pColor)
    );
  }
}

export class Computer implements Player {
  pieces: Piece[] = [];
  id: string;
  constructor(public color: Color, public name = 'Computer') {
    this.id = `bot-${nanoid()}`;
  }

  getPiece(x: number, y: number, color?: Color): Piece | undefined {
    return this.pieces.find(
      ({ x: pX, y: pY, color: pColor }) => pX === x && pY === y && pColor === (color ?? pColor)
    );
  }
}

export class Piece {
  constructor(public x: number, public y: number, public color: Color) {
    if (x < 0 || x > 7) throw new Error(`Invalid x position ${x} for piece`);
    if (y < 0 || y > 7) throw new Error(`Invalid y position ${y} for piece`);
  }
}

export class GameState {
  constructor(public id: string) {}

  players: Player[] = [];
  turn = 0;
  turnCount = 0;
  started = false;
}
