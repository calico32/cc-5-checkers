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
  <h4>Very checkers. Might break on smaller devices.</h4>
  <div class="content">
    <div class="how2play">
      <h2>How to play</h2>
      <ul>
        <section>
          <h3>Setup</h3>
          <li>
            Up to 4 people can play this game (starting a game with less than 4 players will fill
            the rest of the room with computers).
          </li>
          <li>The deck is shuffled and all cards are dealt to the 4 players.</li>
          <li>The player with the 3 of spades goes first.</li>
        </section>
        <section>
          <h3>Objective</h3>
          <li>Be the first player to play all your cards.</li>
        </section>
        <section>
          <h3>Starting a turn</h3>
          <li>
            If there are no cards on the table/stack, you can play any number of any cards, but you
            cannot play different cards (i.e. three jacks is valid, but placing 4, 5, and 6 isn't).
          </li>
          <li>
            The next player can play a card of the same quanitity and the same or higher value.
            (i.e. if the first player places two fives 🂥 🂵, you may only place two same/higher value
            cards like two sixes 🃆 🃖). You may also pass your turn.
          </li>
          <li>
            Card hierarchy is A, K, Q, J, 10, 9, 8, 7, 6, 5, 4, 3, ace being highest and 3 being
            lowest. 2 is special and is used for flushing.
          </li>
        </section>
        <section>
          <h3>Ending a turn</h3>
          <li>Turns keep going until everyone else passes.</li>
          <li>
            If everyone passes their turn, the pile is cleared and the player who last played goes
            first.
          </li>
        </section>
        <section>
          <h3>Flushing</h3>
          <li>Playing a 2 flushes (clears) the card pile.</li>
          <li>
            If a card is on the top of the pile and you have enough cards to complete the set of 4
            (make the top 4 cards the same), you may place then and flush the pile even if it is not
            your turn.
          </li>
        </section>
        <section>
          <h3>Reversal</h3>
          <li>
            Placing a duplicate of a card will reverse the turn order (e.g. if there is a 3 on the
            pile and you place another 3, the turn order will reverse).
          </li>
        </section>
        <section>
          <h3>Controls</h3>
          <li>Clicking a card will select it to be played.</li>
          <li>Click the center pile to place selected cards.</li>
        </section>
      </ul>
    </div>
  </div>
</div>
