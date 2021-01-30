<script lang="ts">
  import Confetti from 'confetti-js';
  import { onDestroy, onMount } from 'svelte';
  import { game, gameId } from '../data';
  import type { GameResponses } from '../events';
  import { socket } from '../socket';

  let snackbarMessage: string | undefined;

  let me = $game?.players.find(p => p.id === socket.id)!;

  // // me and the other players
  // const meIndex = state.players.findIndex(player => player.id === socket.id)!;
  // let me = state.players[meIndex];
  // $: me = state.players[meIndex];
  // let players = [...state.players.slice(meIndex! + 1), ...state.players.slice(0, meIndex)];
  // $: players = [...state.players.slice(meIndex! + 1), ...state.players.slice(0, meIndex)];

  // $: players, console.log(meIndex);
  // $: console.log(state.players.slice(meIndex! + 1));
  // $: console.log(state.players.slice(0, meIndex));
  // $: console.log(players);

  // selection and deselection

  // send selected cards to the server
  // const sendInput = () => {
  //   // if its your turn, then you either play cards or pass
  //   if (state.players[state.turn].id == socket.id) {
  //     if (selectedCards.length > 0)
  //       socket.emit('input', { cards: selectedCards.map(index => me.hand[index]) });
  //     // no cards selected, just pass
  //     else socket.emit('input', { cards: [], pass: true });
  //   } else {
  //     // you are calling a flush
  //     if (!selectedCards.length) return;
  //     const top = state.stack.slice(state.stack.length - selectedCards.length);
  //     if (top.some(c => c.value !== me.hand[selectedCards[0]].value)) return;
  //     socket.emit('input', { cards: selectedCards.map(index => me.hand[index]), flush: true });
  //   }
  //   resetSelected();
  // };

  // when server sends an update, rerender
  // const update = (gameState: GameState) => {
  //   $game = gameState;
  //   state = gameState;
  //   console.log(gameState);
  // };

  // help dialog
  let helpShown = false;
  const toggleHelp = () => {
    helpShown = !helpShown;
  };

  const showError = ({ message }: GameResponses['error']) => {
    snackbarMessage = message;
    setTimeout(() => (snackbarMessage = undefined), 3000);
  };

  const showWin = () => {
    confetti.render();
  };

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
    socket.emit('state', { id: $gameId! });
  });

  // socket.on('update', update);
  socket.on('error', showError);
  // socket.on('winner', showWin);
  onDestroy(() => {
    //   socket.off('update', update);
    socket.off('error', showError);
    //   socket.off('winner', showWin);
  });
</script>

<style lang="scss">
  @import '../colors';
  @import '../snackbar';

  #game {
    // width: 100%;
    // height: 100%;
    overflow: hidden;
  }

  .board {
    width: fit-content;
    height: fit-content;
    display: flex;
    flex-direction: column;
    border: 3px solid cool-gray(600);
    padding: 0;
    margin: auto;
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
  }
</style>

<div id="game">
  <div id="snackbar" class:show={!!snackbarMessage}>{snackbarMessage}</div>

  <div class="board">
    {#each new Array(8) as _, i}
      <div class="board-row">
        {#each new Array(8) as _, j}
          <div class="board-square {((i % 2) + j + 1) % 2 === 0 ? 'black' : 'white'}" />
        {/each}
      </div>
    {/each}
  </div>

  <canvas id="confetti-canvas" />
</div>
