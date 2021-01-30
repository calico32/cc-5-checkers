<script lang="ts">
  import qs from 'qs';
  import { onDestroy } from 'svelte';
  import { push, querystring } from 'svelte-spa-router';
  import { fade } from 'svelte/transition';
  import Button from '../components/Button.svelte';
  import { game, gameId } from '../data';
  import type { GameResponses } from '../events';
  import { socket } from '../socket';

  let showCreate = true;

  let createName: string | undefined = localStorage.getItem('name') ?? undefined;
  let createNameErrors: string[] = [];
  let joinId: string | undefined;
  let joinIdErrors: string[] = [];
  let joinName: string | undefined = localStorage.getItem('name') ?? undefined;
  let joinNameErrors: string[] = [];

  const create = () => {
    createName && localStorage.setItem('name', createName);
    socket.emit('create', {});
  };
  const join = () => {
    joinName && localStorage.setItem('name', joinName);
    socket.emit('enter', { id: joinId!, name: joinName });
  };

  if ($querystring) {
    const parsed = qs.parse($querystring!);
    if (parsed.id) {
      joinId = parsed.id.toString();
      showCreate = false;
    }
  }

  const connectOnCreate = async ({ id }: GameResponses['create']) => {
    await push(`#/pregame?id=${id}`);
    socket.emit('enter', { id, name: createName });
  };

  const roomConnect = async ({ id, game: newGame }: GameResponses['enter']) => {
    await push(`#/pregame?id=${id}`);
    $game = newGame;
    $gameId = id;
  };

  let snackbarMessage: string | undefined;
  const showError = ({ message }: GameResponses['error']) => {
    snackbarMessage = message;
    setTimeout(() => (snackbarMessage = undefined), 3000);
  };

  socket.on('create', connectOnCreate);
  socket.on('enter', roomConnect);
  socket.on('error', showError);

  onDestroy(() => {
    socket.off('create', connectOnCreate);
    socket.off('enter', roomConnect);
    socket.off('error', showError);
  });
</script>

<style lang="scss">
  @import '../colors';
  @import '../snackbar';

  $breakpoint: 760px;

  #play {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  section {
    @media screen and (max-width: $breakpoint) {
      flex-direction: column;
      max-width: 300px;
    }
    display: flex;
    & > * {
      margin: 0 8px;
    }

    width: 700px;
    height: 400px;
    padding-top: 48px;
    .create,
    .join {
      & > * {
        margin: 8px 0;
      }

      h4 {
        margin-top: 8px;
        margin-bottom: 16px;
      }

      input,
      span,
      label {
        max-width: 224px;
        padding: 4px;
        font-size: 0.85rem;
        margin: 0px;
      }

      #join-name {
        margin-top: 16px;
      }

      label {
        margin: 4px 0;
      }

      :global(button) {
        margin-top: 16px;
      }

      div {
        cursor: pointer;
        input {
          margin-right: 8px;
        }
        user-select: none;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      width: auto;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .divider {
      flex-grow: 0;
      display: flex;
      @media screen and (max-width: $breakpoint) {
        flex-direction: row;
        margin: 16px 0;
        span {
          padding: 0 16px !important;
        }
        .line {
          height: 1px;
        }
      }
      flex-direction: column;
      align-items: center;
      justify-content: center;
      span {
        padding: 8px 0;
        color: cool-gray(400);
        letter-spacing: 0.05em;
      }
      .line {
        width: 1px;
        flex-grow: 1;
        background-color: cool-gray(400);
      }
    }
  }
</style>

<div id="play" in:fade={{ duration: 100 }}>
  <div id="snackbar" class:show={!!snackbarMessage}>{snackbarMessage}</div>
  <section>
    {#if showCreate}
      <div class="create">
        <h4>Create game</h4>
        <input id="create-name" placeholder="Your name" bind:value={createName} />
        {#if createNameErrors.length}
          <label for="create-name" class="error-label">{createNameErrors.join('\n')}</label>
        {/if}
        <Button on:click={create} raised intent="success">Create</Button>
      </div>
      <div class="divider">
        <div class="line" />
        <span>OR</span>
        <div class="line" />
      </div>
    {/if}
    <div class="join">
      <h4>Join game</h4>
      <input id="join-id" placeholder="Code" bind:value={joinId} />
      {#if joinIdErrors.length}
        <label for="join-id" class="error-label">{joinIdErrors.join('\n')}</label>
      {/if}

      <input id="join-name" placeholder="Your name" bind:value={joinName} />
      {#if joinNameErrors?.length}
        <label for="join-name" class="error-label">{joinNameErrors.join('\n')}</label>
      {/if}

      <Button on:click={join} raised intent="primary">Join</Button>
    </div>
  </section>
</div>
