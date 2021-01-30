<script>
  import { push } from 'svelte-spa-router';
  import Button from '../components/Button.svelte';
  import { game, gameId } from '../data';
  import { socket } from '../socket';

  if ($game) {
    socket.emit('leave', { id: $gameId });
    $game = undefined;
    $gameId = '';
  }

  socket.off('enter');
  socket.off('join');
  socket.off('leave');
</script>

<style lang="scss">
  #home,
  .content,
  header {
    display: flex;
    align-items: center;
    flex-direction: column;
    margin-bottom: 20px;
  }
  h1 {
    margin-bottom: 16px;
  }

  header,
  .content {
    max-width: 65ch;
    line-height: 1.25;
  }

  h3 {
    margin-bottom: 8px;
  }
  ul {
    padding-left: 16px;
  }
</style>

<div id="home">
  <header>
    <h1>Checkers</h1>
    <Button large raised on:click={() => push('#/play')} intent="success">
      <svg
        style="margin-right: 8px"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        stroke="currentColor"
        stroke-width="2"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="css-i6dzq1"
      >
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
      Play
    </Button>
  </header>
  <h4>Very good checkers. Real time multiplayer.</h4>
  <div class="content">
    <span>Might break on smaller devices.</span>
    <div class="how2play">
      <h2>Information</h2>
      <ul>
        <section>
          <h3>Setup</h3>
          <li>
            One player creates a game, and the join URL/code can be given to the other player. If
            you don't have friends and want to play against a computer, you can start the game with
            just yourself.
          </li>
          <li>Sides are randomly picked. White goes first.</li>
        </section>
        <section>
          <h3>Objective</h3>
          <span>Do any of the following:</span>
          <li>Capture all of your opponent's pieces.</li>
          <li>Block your opponent from moving.</li>
          <span>If neither player can play, the game ends in a tie.</span>
        </section>
        <section>
          <h3>Controls</h3>
          <li>Click on one of your pieces to select it.</li>
          <li>Click on a highlighted location to move to it.</li>
          <li>
            If a piece cannot be selected, it will shake. This happens if the piece has nowhere to
            move or if one of your other pieces can capture.
          </li>
        </section>
      </ul>
    </div>
  </div>
</div>
