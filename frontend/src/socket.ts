import { io, Socket } from 'socket.io-client';
import type { GameRequests, GameResponses } from './events';

const endpoint =
  import.meta.env.SNOWPACK_PUBLIC_API_URL ?? `${window.location.protocol}//${window.location.host}`;

export class CheckersClient {
  constructor(public socket: Socket) {}

  get id(): string {
    return this.socket.id;
  }

  onAny(listener: (...args: any[]) => void): this {
    this.socket.onAny(listener);
    return this;
  }

  on<T extends keyof GameResponses>(event: T, listener: (data: GameResponses[T]) => void): this;
  // on<T extends string>(event: T, listener: (...data: any[]) => void): this;
  on(event: 'disconnect', listener: () => void): this;
  on(event: string, listener: (...data: any[]) => void): this {
    this.socket.on(event, listener);
    return this;
  }

  off(event: string, listener?: (...data: any[]) => void): this {
    this.socket.off(event, listener);
    return this;
  }

  emit<T extends keyof GameRequests>(event: T, data: GameRequests[T]): this;
  // emit(event: string, ...data: any[]): this;
  emit(event: string, ...data: any[]): this {
    console.log(`--> ${new Date().toISOString()} ${event}`);
    this.socket.emit(event, ...data);
    return this;
  }
}

export const socket = new CheckersClient(io(endpoint));

import.meta.env.NODE_ENV === 'development' &&
  socket.onAny((event, ...args) => {
    console.log(`<-- ${new Date().toISOString()} ${event}`);
    if (event === 'error') {
      console.error(args[0].message);
    } else {
      console.log(args);
    }
  });
