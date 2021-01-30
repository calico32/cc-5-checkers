<script lang="ts">
  import type { IconName } from './Icon';
  import Icon from './Icon.svelte';

  export let size: number = 40;
  export let icon: IconName;
  export let iconSize: number = 18;
</script>

<style lang="scss">
  button {
    border: none;
    background-color: transparent;
    border-radius: 50%;
    padding: 0;
    transition: background-color 75ms linear;
    &:hover {
      background-color: #0000000f;
    }
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
</style>

<button style={`width: ${size}px; height: ${size}px;`}>
  <Icon {icon} attrs={{ width: iconSize, height: iconSize }} />
</button>
