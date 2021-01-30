<script lang="ts">
  import Icon from './Icon.svelte';
</script>

<style lang="scss">
  @import '../colors';
  nav {
    position: fixed;
    top: 0;
    width: 100%;
    background-color: white;
    height: 3rem;
    display: flex;
    align-items: center;
    z-index: 2;
    padding-right: 4px;
    // box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    border-bottom: 2px solid cool-gray(200);
    & > * {
      color: cool-gray(700);
      margin-left: 1rem;
    }
  }

  .spacer {
    flex-grow: 1;
  }

  :global(svg) {
    width: 24px;
    height: 24px;
    color: cool-gray(700);
  }

  a {
    text-decoration: none;
    font-weight: 600;
    transition: color 75ms linear;
    display: flex;
    align-items: center;
  }

  .checker {
    height: 32px;
    width: 32px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    background-color: red(500);
    border: 3px solid red(600);
    :global(svg) {
      width: 18px;
      height: 18px;
      color: red(800);
    }
  }

  .github {
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;

    transition: background-color 150ms ease-in-out;

    &:hover {
      background-color: cool-gray(200);
    }
  }
</style>

<nav>
  <div class="checker">
    <Icon icon="disc" />
  </div>
  <a href="#/">Checkers</a>
  <div class="spacer" />
  <!-- <Button>See code</Button> -->
  <a
    class="github"
    href="https://github.com/wiisportsresort/cc-5-checkers"
    rel="noopener"
    target="_blank"
  >
    <Icon icon="github" />
  </a>
</nav>
