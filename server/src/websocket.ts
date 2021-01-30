import http from 'http';
import _ from 'lodash';
import { nanoid } from 'nanoid';
import { Server, Socket } from 'socket.io';
import { GameRequests, GameResponses } from '../../frontend/src/events';
import {
  Computer,
  GameState,
  getPiece,
  getValidMoves,
  Human,
  letters,
  Piece,
  Player,
  startingLocations
} from '../../frontend/src/game';

const store = new Map<string, GameState>();

const getGameId = (id: string): string | undefined => {
  const games = store.entries();
  for (const [gameId, game] of games) {
    if (game.players.some(player => player.id === id)) return gameId;
  }
  return undefined;
};

const listify = (array: unknown[]): string => {
  switch (array.length) {
    case 0:
      return '';
    case 1:
      return `${array[0]}`;
    case 2:
      return `${array[0]} and ${array[1]}`;
    default:
      return `${_.dropRight(array).join(', ')}, and ${_.last(array)}`;
  }
};

export class CheckersSocket {
  constructor(public socket: Socket) {}

  private _id = '';

  get id(): string {
    if (this.socket.id) return (this._id = this.socket.id);
    else return this._id;
  }

  onAny(listener: (...args: any[]) => void): this {
    this.socket.onAny(listener);
    return this;
  }

  join(rooms: string | string[]): Promise<void> | void {
    return this.socket.join(rooms);
  }

  leave(room: string): Promise<void> | void {
    return this.socket.leave(room);
  }

  on<T extends keyof GameRequests>(event: T, listener: (data: GameRequests[T]) => void): this;
  // on<T extends string>(event: T, listener: (...data: any[]) => void): this;
  on(event: 'disconnect', listener: () => void): this;
  on(event: string, listener: (...data: any[]) => void): this {
    this.socket.on(event, listener);
    return this;
  }

  emit<T extends keyof GameResponses>(event: T, data: GameResponses[T]): this;
  // emit(event: string, ...data: any[]): this;
  emit(event: string, ...data: any[]): this {
    console.log(`--> ${new Date().toISOString()} ${event} ${this.id}`);
    console.log(data);
    this.socket.emit(event, ...data);
    return this;
  }
}

export class CheckersServer extends Server {
  constructor(srv: http.Server) {
    super(srv, {
      cors:
        process.env.NODE_ENV === 'development' ? { origin: 'http://localhost:8081' } : undefined,
    });
    this.init();
  }

  roomEmit<T extends keyof GameResponses>(room: string, event: T, data: GameResponses[T]): this;
  // roomEmit<T extends string>(room: string, event: T, ...data: any[]): this;
  roomEmit(room: string, event: string, ...data: any[]): this {
    this.to(room).emit(event, ...data);
    return this;
  }

  private init() {
    this.on('connection', (_socket: Socket) => {
      const socket = new CheckersSocket(_socket);

      socket.onAny((...args: any[]) => {
        const [event, ...params] = args;

        console.log(`<-- ${new Date().toISOString()} ${event} ${socket.id}`);
        console.log(params);
      });

      console.log(`<-- ${new Date().toISOString()} connection ${socket.id}`);

      socket.on('create', () => {
        let id = nanoid(4);
        // if code already in use, regenerate it
        while (Array.from(store.keys()).includes(id)) id = nanoid(4);
        store.set(id, new GameState(id));
        socket.emit('create', { id });
      });

      // player attempts to join a room
      socket.on('enter', ({ id, name }) => {
        const game = store.get(id);
        if (!game) return socket.emit('error', { message: 'Room connect: invalid room code' });
        if (game.players.length >= 2)
          return socket.emit('error', { message: 'Room connect: room full' });

        if (game.players.find(p => p.id === socket.id))
          return socket.emit('error', { message: 'Room connect: already joined' });

        const color =
          (game.players[0] && game.players[0].color === 'white') || Math.random() > 0.5
            ? 'red'
            : 'white';

        console.log(`adding ${color} human`);
        const player = new Human(socket.id, color, name);
        game.players.push(player);

        socket.emit('enter', { id, game });
        setTimeout(() => {
          this.roomEmit(id, 'join', { id, player });
          socket.join(id);
        }, 200);
      });

      socket.on('start', ({ id }) => {
        const game = store.get(id);
        if (!game) return socket.emit('error', { message: 'Room start: invalid room code' });
        if (game.players.length === 1) {
          const color = game.players[0].color === 'white' ? 'red' : 'white';
          console.log(`adding ${color} computer`);
          game.players.push(new Computer(color));
        }

        game.started = true;
        game.turn = game.players.findIndex(p => p.color === 'white');
        game.players.forEach(player => {
          player.pieces = startingLocations[player.color].map(
            ([x, y]) => new Piece(x, y, player.color)
          );
        });

        const first = game.players[game.turn];

        this.roomEmit(id, 'start', {
          game,
          message: `Game started.`,
          firstTurn: first.id,
        });

        setTimeout(() => {
          this.roomEmit(id, 'message', {
            message: `Game started. **${first.name}** (${first.color}) goes first.`,
          });

          if (first.id.startsWith('bot-')) this.makeBotMove(game, first.id);
        }, 2000);
      });

      socket.on('state', ({ id }) => {
        const game = store.get(id);
        if (!game) return socket.emit('error', { message: 'Get state: invalid room code' });
        socket.emit('state', { game });
      });

      socket.on('move', req => {
        const id = getGameId(socket.id);
        if (!id) return socket.emit('error', { message: 'Move: not in a valid game' });
        const game = store.get(id);
        if (!game) return socket.emit('error', { message: 'Move: not in a valid game' });
        const player = game.players.find(p => p.id === socket.id);
        if (!player) return socket.emit('error', { message: 'Move: not in a valid game' });

        try {
          this.doMove(game, player, req);
        } catch (err) {
          console.log(`caught error: ${typeof err === 'string' ? err : err.message}`);
          socket.emit('error', { message: typeof err === 'string' ? err : err.message });
        }
      });

      socket.on('leave', ({ id }) => {
        const game = store.get(id);
        if (!game) return socket.emit('error', { message: 'Room leave: invalid room code' });
        socket.leave(id);
        console.log(`<-- ${new Date().toISOString()} leave ${socket.id}`);

        const index = game.players.findIndex(p => p.id === socket.id);
        index !== -1 && game.players.splice(index, 1);

        if (!game.players.some(p => !p.id.startsWith('bot-'))) {
          console.log('deleting room ' + id);
          store.delete(id);
        } else {
          try {
            this.roomEmit(id, 'end', {
              endType: 'win',
              winnerId: game.players.find(p => p.id !== socket.id)!.id,
              message: 'Opponent left. You win!',
            });
          } catch (err) {
            console.log(err.stack);
            store.delete(id);
          }
        }
      });

      socket.on('disconnect', () => {
        console.log(`<-- ${new Date().toISOString()} disconnect ${socket?.id ?? '(unknown)'}`);
        const id = getGameId(socket?.id);
        if (!id) return;
        socket.leave(id);
        const game = store.get(id);
        if (!game) return;

        if (!game.started) {
          if (game.players.length === 1) return store.delete(id);

          const index = game.players.findIndex(p => p.id === socket.id);
          index !== -1 && game.players.splice(index, 1);

          this.roomEmit(id, 'leave', { playerId: socket.id });
        } else {
          if (!game.players.some(p => !p.id.startsWith('bot-'))) return store.delete(id);
          this.roomEmit(id, 'message', {
            message: 'Opponent left.',
          });
        }
      });
    });
  }

  doMove(game: GameState, player: Player, { start, end }: GameRequests['move']): void {
    const opponent = game.players.find(p => p.id !== player.id)!;
    const piece = getPiece(player, ...start, player.color);
    if (!piece) throw new Error('Move: invalid piece');

    const validMoves = getValidMoves(game, piece);
    const move = validMoves.find(
      ({ path }) => _.isEqual(path[0], start) && _.isEqual(path[path.length - 1], end)
    );
    if (!move) throw new Error('Move: invalid move');

    const startingLocation = `${letters[start[0]]}${start[1] + 1}`;
    const locations = listify(move.path.slice(1).map(([x, y]) => `**${letters[x]}${y + 1}**`));
    let message: string;
    const capturedPieces = move.captures?.map(c => getPiece(opponent, ...c, opponent.color)!);

    if (move.captures?.length) {
      const captures = listify(move.captures.map(([x, y]) => `**${letters[x]}${y + 1}**`));
      message = `moved from **${startingLocation}** to ${locations}, capturing ${captures}.`;
    } else {
      message = `moved from **${startingLocation}** to ${locations}.`;
    }

    capturedPieces?.forEach(({ x, y }) => {
      opponent.pieces.splice(
        opponent.pieces.findIndex(({ x: pX, y: pY }) => pX === x && pY === y),
        1
      );
    });

    [piece.x, piece.y] = move.path[move.path.length - 1];
    piece.king ||= !!move.king;

    this.roomEmit(game.id, 'move', {
      message: `**${player.name}** (${player.color}) ${message}`,
      playerId: player.id,
      start: move.path[0],
      end: move.path[move.path.length - 1],
      king: !!move.king,
      captures: capturedPieces,
    });

    setTimeout(() => this.advanceTurn(game), 2000);
  }

  advanceTurn(game: GameState): void {
    if (game.players[(game.turn + 1) % 2].pieces.length === 0) {
      this.roomEmit(game.id, 'end', {
        endType: 'win',
        winnerId: game.players[game.turn].id,
        message: `${game.players[(game.turn + 1) % 2].name} has no more pieces. **${
          game.players[game.turn].name
        }** wins!`,
      });
      return;
    }

    const allMoves = game.players[(game.turn + 1) % 2].pieces.flatMap(piece =>
      getValidMoves(game, piece)
    );

    console.log(`next player can make ${allMoves.length} different moves`);

    if (!allMoves.length) {
      this.roomEmit(game.id, 'message', {
        message: `**${game.players[(game.turn + 1) % 2].name}** cannot move.`,
      });

      const futureMoves = game.players[game.turn].pieces.flatMap(piece =>
        getValidMoves(game, piece)
      );

      console.log(`next next player can make ${futureMoves.length} different moves`);

      if (!futureMoves.length) {
        setTimeout(() => {
          this.roomEmit(game.id, 'message', {
            message: `**${game.players[game.turn].name}** cannot move.`,
          });
        }, 2000);
        setTimeout(() => {
          this.roomEmit(game.id, 'end', {
            endType: 'tie',
            message: `Neither player can move. Tie!`,
          });
        }, 4000);
        return;
      }

      setTimeout(() => {
        this.roomEmit(game.id, 'end', {
          endType: 'win',
          winnerId: game.players[game.turn].id,
          message: `${game.players[(game.turn + 1) % 2].name} cannot move. **${
            game.players[game.turn].name
          }** wins!`,
        });
      }, 2000);

      return;
    }

    console.log('incrementing turn');

    game.turn = (game.turn + 1) % 2;

    if (game.players[game.turn].id.startsWith('bot-')) {
      this.makeBotMove(game, game.players[game.turn].id);
    }
  }

  makeBotMove(game: GameState, playerId: string): void {
    console.log('bot trying to find a move');

    const player = game.players.find(p => p.id === playerId)!;

    const allMoves = player.pieces.flatMap(piece => getValidMoves(game, piece));

    let bestMove = allMoves.reduce(
      (best, next) => ((next.captures?.length ?? 0) > best.captures!.length ? next : best),
      { captures: [], color: 'red', path: [] }
    );

    if (bestMove.captures?.length === 0)
      bestMove = allMoves[Math.floor(Math.random() * allMoves.length)];

    setTimeout(() => {
      this.doMove(game, player, {
        start: bestMove.path[0],
        end: bestMove.path[bestMove.path.length - 1],
      });
    }, 2000);
  }
}
