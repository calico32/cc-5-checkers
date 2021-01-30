<script lang="ts">
  export let disabled = false;
  export let large = false;
  export let raised = false;
  export let intent: 'primary' | 'success' | 'error' | undefined = undefined;
  export let classes: string | undefined = undefined;
</script>

<button {disabled} on:click class:large class:raised class="{intent} {classes}">
  <slot />
</button>

<style lang="scss">
  @import '../colors';

  button {
    &.large {
      font-size: 1.3em;
      font-weight: 600;
      padding: 8px 12px;
    }

    &.raised {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
    }

    display: flex;
    align-items: center;
    justify-content: center;

    background-color: cool-gray(300);
    border-color: cool-gray(300);

    &:hover {
      background-color: cool-gray(400);
      border-color: cool-gray(400);
    }

    &.primary {
      border-color: blue(300);
      background-color: blue(300);
      &:hover {
        background-color: blue(400);
        border-color: blue(400);
      }
    }

    &.success {
      border-color: lime(400);
      background-color: lime(400);
      &:hover {
        background-color: lime(500);
        border-color: lime(500);
      }
    }

    &.error {
      border-color: red(400);
      background-color: red(400);
      &:hover {
        background-color: red(500);
        border-color: red(500);
      }
    }

    padding: 6px 10px;
    font-size: 0.85em;
    cursor: pointer;
    border-width: 1px;
    border-style: solid;
    border-radius: 8px;
    transition: background-color 200ms ease-in-out, border-color 200ms ease-in-out;
  }
</style>
