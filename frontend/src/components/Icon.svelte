<script lang="ts">
  import type { FeatherAttributes } from 'feather-icons';
  import { icons } from 'feather-icons';
  import type { IconName } from './Icon';

  export let icon: IconName;
  export let attrs: FeatherAttributes | undefined = { width: 18, height: 18 };
  let svg: string;
  $: svg = icon ? icons[icon].toSvg(attrs) : '';
</script>

{@html svg}
