<script>
  import { fade } from 'svelte/transition';

  export let inline = false;
  export let slow = false;
  export let size = 50;
  export let strokeWidth = 8;
</script>

<div in:fade={{ duration: 100 }} class="loading-wrapper" class:inline>
  <div class="spinner">
    <div class="spinner-animation" class:slow>
      <svg
        class="spinner-svg"
        width={size}
        height={size}
        stroke-width={strokeWidth}
        viewBox="1.00 1.00 {size * 2 - 2} {size * 2 - 2}">
        <path
          class="spinner-track"
          d="M {size},{size} m 0,-{size - 5} a {size - 5},{size - 5} 0 1 1 0,{size * 2 -
            10} a {size - 5},{size - 5} 0 1 1 0,-{size * 2 - 10}"
        />
        <path
          class="spinner-head"
          d="M {size},{size} m 0,-{size - 5} a {size - 5},{size - 5} 0 1 1 0,{size * 2 -
            10} a {size - 5},{size - 5} 0 1 1 0,-{size * 2 - 10}"
          pathLength="280"
          stroke-dasharray="280 280"
          stroke-dashoffset="210"
        />
      </svg>
    </div>
  </div>
</div>

<style lang="scss">
  @import '../colors';

  .loading-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
    height: 90vh;
    &.inline {
      height: unset;
      display: inline-block;
    }
  }
  .spinner {
    display: flex;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
  }
  .spinner-animation {
    animation: spinner-animation 0.5s linear infinite;
    &.slow {
      animation: spinner-animation 4s linear infinite;
    }
  }
  .spinner-svg {
    display: block;
  }
  .spinner-track {
    fill-opacity: 0;
    stroke: cool-gray(300);
  }
  .spinner-head {
    fill-opacity: 0;
    stroke: cool-gray(500);
    stroke-linecap: round;
    transform-origin: center;
    transition: stroke-dashoffset 0.2s cubic-bezier(0.4, 1, 0.75, 0.9);
  }
  @keyframes spinner-animation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(1turn);
    }
  }
</style>
