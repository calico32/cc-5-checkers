import http from 'http';
import { nanoid } from 'nanoid';
import { Server, Socket } from 'socket.io';
import { GameRequests, GameResponses } from '../../frontend/src/events';
import { Computer, GameState, Human, Piece, startingLocations } from '../../frontend/src/types';

const store = new Map<string, GameState>();

const getGame = (id: string): string | undefined => {
  const games = store.entries();
  for (const [gameId, game] of games) {
    if (game.players.some(player => player.id === id)) return gameId;
  }
  return undefined;
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
        const [event] = args;

        console.log(`<-- ${new Date().toISOString()} ${event} ${socket.id}`);
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

        const color =
          game.players.find(p => !!p)?.color === 'white' || Math.random() > 0.5 ? 'black' : 'white';
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
        if (game.players.length < 2) {
          const color = game.players.filter(p => !!p)[0].color === 'white' ? 'black' : 'white';
          game.players.push(new Computer(color));
        }

        game.started = true;
        game.turn = game.players.findIndex(p => p.color === 'black');
        game.players.forEach(player => {
          player.pieces = startingLocations[player.color].map(
            ([x, y]) => new Piece(x, y, player.color)
          );
        });

        this.roomEmit(id, 'start', { game });
        if (game.players[game.turn] instanceof Computer)
          this.makeBotMove(game, game.players[game.turn].id);
      });

      socket.on('state', ({ id }) => {
        const game = store.get(id);
        if (!game) return socket.emit('error', { message: 'Get state: invalid room code' });
        socket.emit('state', { game });
      });

      socket.on('move', ({ oldLocation, newLocation }) => {
        const game = getGame(socket.id);
        if (!game) return socket.emit('error', { message: 'Move: not in a valid game' });
      });

      socket.on('leave', ({ id }) => {
        const game = store.get(id);
        if (!game) return socket.emit('error', { message: 'Room leave: invalid room code' });
        socket.leave(id);
        console.log(`<-- ${new Date().toISOString()} leave ${socket.id}`);

        const index = game.players.findIndex(p => p.id === socket.id);
        index !== -1 && game.players.splice(index, 1);

        if (!game.players.some(p => p instanceof Human)) {
          console.log('deleting room ' + id);
          store.delete(id);
        }
      });

      socket.on('disconnect', () => {
        console.log(`<-- ${new Date().toISOString()} disconnect ${socket.id}`);
        const id = getGame(socket.id);
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
          if (!game.players.some(p => p instanceof Human)) return store.delete(id);
          this.roomEmit(id, 'end', {
            endType: 'win',
            winnerId: game.players.find(p => p.id !== socket.id)!.id,
            reason: 'Opponent left.',
          });
        }
      });
    });
  }

  advanceTurn(game: GameState): void {
    // const game = this.state.get(id);
    // if (!game) return;
    // // if you have no cards left, you win!
    // if (!game.players[game.turn].hand.length) {
    //   this.emitToRoom(id, 'update', game);
    //   game.lastTurn = `${game.players[game.turn].name} wins!`;
    //   return this.emitToRoom(id, 'winner');
    // }
    // // if turn is the first player and order is negative, turn should be last player
    // if (game.turn == 0 && game.order == -1) game.turn = game.players.length - 1;
    // // if turn is the last player and order is positive, turn should be first player
    // else if (game.turn == game.players.length - 1 && game.order == 1) game.turn = 0;
    // // otherwise just add order
    // else game.turn += game.order;
    // this.emitToRoom(id, 'update', game);
    // // if 3 ppl pass, you should flush
    // if (game.passes > 2) {
    //   game.passes = 0;
    //   this.flush(id);
    // }
    // if (game.players[game.turn].id.startsWith('bot-')) {
    //   this.makeBotMove(game.players[game.turn].id);
    // }
  }

  makeBotMove(game: GameState, playerId: string): void {
    // const gameId = getGameIdFromPlayerId(id)!;
    // // console.log(`${gameId}: bot ${id} is trying to make turn`);
    // const game = stateMap.get(gameId);
    // if (!game) return console.log('Bot error: game not exist!!!');
    // game.lastTurn = '';
    // const bot = game.players.find(player => player.id == id);
    // if (!bot) return console.log('Bot error: id wronk');
    // // bot decides to give up if theres doubles/triples
    // if (game.cardQuantity > 1) {
    //   game.passes++;
    //   game.lastTurn = `${bot.name} passed`;
    //   return setTimeout(() => advanceTurn(gameId), 2000);
    // }
    // const values = Array.from(_.clone(cardValues)).reverse();
    // values.push(values.shift()!);
    // for (const [index, card] of bot.hand.entries()) {
    //   if (
    //     game.stack.length &&
    //     values.indexOf(card.value) < values.indexOf(game.stack[game.stack.length - 1].value)
    //   )
    //     continue;
    //   // console.log(`bot trying to play ${JSON.stringify(card)}`);
    //   bot.hand.splice(index, 1);
    //   game.lastTurn = `${bot.name} played 1 ${card.value}`;
    //   if (game.stack[game.stack.length - 1]?.value === card.value) {
    //     game.lastTurn += ' (reversed)';
    //     game.order *= -1;
    //   }
    //   if (card.value == '2') {
    //     game.lastTurn += ' (flushed)';
    //     return setTimeout(() => flush(gameId), 2000);
    //   }
    //   game.passes = 0;
    //   game.stack.push(card);
    //   break;
    // }
    // setTimeout(() => advanceTurn(gameId), 2000);
  }
}
