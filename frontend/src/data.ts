import { writable } from 'svelte/store';
import type { GameState } from './game';

export const game = writable<GameState | undefined>(undefined);
export const gameId = writable('');
export const turn = writable(false);
