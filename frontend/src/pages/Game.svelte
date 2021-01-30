<script lang="ts">
  import Confetti from 'confetti-js';
  import MarkdownIt from 'markdown-it';
  import { onDestroy, onMount } from 'svelte';
  import { push } from 'svelte-spa-router';
  import Icon from '../components/Icon.svelte';
  import { game, turn } from '../data';
  import type { GameResponses } from '../events';
  import type { Board, BoardLocation, Piece } from '../game';
  import { getBoard, getPiece, getValidMoves, letters } from '../game';
  import { socket } from '../socket';

  const md = MarkdownIt();

  $: me = $game?.players.find(p => p.id === socket.id);
  $: other = $game?.players.find(p => p.id !== socket.id);

  $: board = $game ? getBoard($game!) : (new Array(8).fill(new Array(8).fill(undefined)) as Board);
  let moveHints: BoardLocation[] = [];
  let selectedPiece: Piece | undefined;
  let finished = false;

  let snackbarMessage: string | undefined;
  let snackbarShown = false;
  let snackbarVisible = false;
  let timeouts: number[] = [];
  const showMessage = ({ message }: GameResponses['error']) => {
    timeouts.forEach(t => clearTimeout(t));
    snackbarMessage = message;
    snackbarShown = true;
    snackbarVisible = true;

    timeouts.push(
      setTimeout(() => {
        snackbarShown = false;
        timeouts.push(
          setTimeout(() => {
            snackbarVisible = false;
            snackbarMessage = undefined;
          }, 500)
        );
      }, 3000)
    );
  };

  const onMove = (move: GameResponses['move']) => {
    if (move.message) showMessage(move);

    const player = $game!.players.find(p => p.id === move.playerId)!;
    const opponent = $game!.players.find(p => p.id !== move.playerId)!;

    move.captures?.forEach(({ x, y }) => {
      opponent.pieces.splice(
        opponent.pieces.findIndex(({ x: pX, y: pY }) => pX === x && pY === y),
        1
      );
    });

    const piece = getPiece(player, ...move.start, player.color)!;

    [piece.x, piece.y] = move.end;
    piece.king ||= move.king;

    $turn = !$turn;

    board = getBoard($game!);
  };

  const onEnd = (end: GameResponses['end']) => {
    showMessage(end);
    if (end.endType === 'win' && end.winnerId === socket.id) confetti.render();
    finished = true;
  };

  const onPieceClick = (e: MouseEvent & { currentTarget: EventTarget & HTMLDivElement }) => {
    const el = e.currentTarget;

    const x = parseInt(el.getAttribute('data-x')!);
    const y = parseInt(el.getAttribute('data-y')!);
    console.log('-------------------------------------------------------');
    console.log(`clicked (${x}, ${y})`);
    if (finished) {
      console.log('bailing because finished');
      return;
    }
    if (!$turn) {
      console.log('bailing because not our turn');
      return;
    }

    if (selectedPiece) {
      console.log('selectedPiece is set');
      if (moveHints.find(([hX, hY]) => hX === x && hY === y)) {
        console.log('clicked move hint, dispatching move');
        socket.emit('move', {
          start: [selectedPiece.x, selectedPiece.y],
          end: [x, y],
        });
        selectedPiece = undefined;
        moveHints = [];
        return;
      }

      console.log('clicked same piece, unsetting selectedPiece');
      if (x === selectedPiece.x && y === selectedPiece.y) {
        selectedPiece = undefined;
        moveHints = new Array(8).fill(new Array(8).fill(false));
        return;
      }
    }

    console.log('selectedPiece is not set');
    if (board[y][x]?.color === me?.color) {
      console.log('clicked one of our pieces');

      const allMoves = me?.pieces.flatMap(p => getValidMoves($game!, p));
      const validMoves = getValidMoves($game!, board[y][x]!);

      if (
        (allMoves?.some(m => m.captures?.length) && validMoves.every(m => !m.captures?.length)) ||
        validMoves.length === 0
      ) {
        el.classList.add('invalid-left');
        setTimeout(() => {
          el.classList.remove('invalid-left');
          el.classList.add('invalid-right');
        }, 100);
        setTimeout(() => {
          el.classList.remove('invalid-right');
        }, 200);
        return;
      }

      console.log('setting selectedPiece');
      selectedPiece = board[y][x];

      moveHints = validMoves.map(m => m.path[m.path.length - 1]);
      // .forEach(end => {
      //   const [x, y] = end;
      //   console.log(`setting list[${y}][${x}]`);
      //   newHints[y][x] = true;
      // });

      console.log('valid moves');
      console.log(validMoves);
      console.log('new moveHints');
      console.log(moveHints);
    } else {
      console.log('clicked something else');
      console.log('unsetting selectedPiece');
      selectedPiece = undefined;
      moveHints = new Array(8).fill(new Array(8).fill(false));
    }
  };

  const cX = (x: number) => (me?.color === 'white' ? x : 7 - x);
  const cY = (y: number) => (me?.color === 'white' ? 7 - y : y);

  let confetti: Confetti;
  // get update after mounting
  onMount(() => {
    confetti = new Confetti({
      target: 'confetti-canvas',
      start_from_edge: true,
      max: 250,
      size: 1,
      animate: true,
      clock: 40,
      rotate: true,
      respawn: true,
    });
  });

  socket.on('move', onMove);
  socket.on('error', showMessage);
  socket.on('message', showMessage);
  socket.on('end', onEnd);
  onMount(() => {
    if (!$game) push('#/');
  });
  onDestroy(() => {
    socket.off('move', onMove);
    socket.off('error', showMessage);
    socket.off('message', showMessage);
    socket.off('end', onEnd);
  });
</script>

<style lang="scss">
  @import '../colors';
  @import '../snackbar';

  #game {
    flex-grow: 1;
  }

  .game-main {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    z-index: 2;
  }

  .main-row {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: -22px;
  }

  .row-numbers {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    height: 486px;
    width: 20px;
    margin-right: 2px;
  }

  .col-numbers {
    display: flex;
    justify-content: space-around;
    width: 486px;
    height: 20px;
    margin-top: 8px;
  }

  .board {
    width: fit-content;
    height: fit-content;
    display: flex;
    flex-direction: column;
    border: 3px solid cool-gray(600);
    padding: 0;
  }

  .board-row {
    display: flex;
    padding: 0;
    margin: 0;
  }

  .board-square {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    width: 60px;
    height: 60px;
    margin: 0;

    &.black {
      background-color: cool-gray(600);
    }

    &.white {
      background-color: cool-gray(50);
    }

    .piece {
      height: 48px;
      width: 48px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 95ms ease-in-out, filter 200ms ease-in-out;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);

      &.red {
        background-color: red(500);
        border: 4px solid red(600);
        :global(svg) {
          color: red(800);
        }
      }
      &.white {
        background-color: cool-gray(100);
        border: 4px solid cool-gray(300);
        :global(svg) {
          color: cool-gray(400);
        }
      }
      &.hint {
        background-color: blue(300);
        opacity: 0.5;
      }
      &.disabled {
        cursor: not-allowed;
      }
      &.invalid-left {
        transform: translateX(-5px);
      }
      &.invalid-right {
        transform: translateX(5px);
      }
      &.selected {
        filter: brightness(0.8);
      }
    }
  }

  canvas {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
  }
</style>

<div id="game">
  <div id="snackbar" class:show={snackbarShown} class:visible={snackbarVisible}>
    {@html md.render(snackbarMessage ?? '')}
  </div>
  <canvas id="confetti-canvas" />

  <div class="game-main">
    <h3>{other?.name ?? ''} (opponent)</h3>

    <div class="main-row">
      <div class="row-numbers">
        {#each board as _, y}
          <span>{cY(y) + 1}</span>
        {/each}
      </div>

      <div class="board">
        {#key moveHints}
          {#each me?.color === 'white' ? [...board].reverse() : [...board] as row, y}
            <div class="board-row">
              {#each me?.color === 'white' ? [...row] : [...row].reverse() as square, x}
                <div class="board-square {((y % 2) + x + 1) % 2 === 0 ? 'black' : 'white'}">
                  {#if square?.color ?? moveHints.some(([hX, hY]) => cX(x) === hX && cY(y) === hY)}
                    <div
                      class="piece {square?.color ?? ''}"
                      class:hint={moveHints.some(([hX, hY]) => cX(x) === hX && cY(y) === hY)}
                      class:disabled={!$turn}
                      class:selected={selectedPiece &&
                        selectedPiece.x === cX(x) &&
                        selectedPiece.y === cY(y)}
                      data-y={cY(y)}
                      data-x={cX(x)}
                      on:click={onPieceClick}
                    >
                      {#if square?.king}
                        <Icon icon="disc" />
                      {/if}
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          {/each}
        {/key}
      </div>
    </div>

    <div class="col-numbers">
      {#each board as _, x}
        <span>{letters[cX(x)]}</span>
      {/each}
    </div>

    <h3>{me?.name ?? ''} (you)</h3>
  </div>
</div>
