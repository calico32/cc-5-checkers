<script lang="ts">
  import type { RouteDefinition } from 'svelte-spa-router';
  import Router from 'svelte-spa-router';
  import { wrap } from 'svelte-spa-router/wrap';
  import AppBar from './components/AppBar.svelte';
  import Loading from './components/Loading.svelte';
  import Home from './pages/Home.svelte';

  const routes: RouteDefinition = {
    '/': Home,
    '/play': wrap({
      asyncComponent: () => import('./pages/Play.svelte'),
      loadingComponent: Loading,
    }),
    '/pregame': wrap({
      asyncComponent: () => import('./pages/Pregame.svelte'),
      loadingComponent: Loading,
    }),
    '/game': wrap({
      asyncComponent: () => import('./pages/Game.svelte'),
      loadingComponent: Loading,
    }),
    '*': wrap({
      asyncComponent: () => import('./pages/NotFound.svelte'),
      loadingComponent: Loading,
    }),
  };
</script>

<style lang="scss" global>
  @import './normalize';
  @import './colors';

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
      Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: cool-gray(100);
  }
  main {
    margin: 8px;
    margin-top: 64px;
  }

  @font-face {
    font-family: 'Inter';
    font-style: italic;
    font-weight: 100;
    font-display: swap;
    src: url('fonts/Inter-ThinItalic.woff2') format('woff2');
  }

  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 200;
    font-display: swap;
    src: url('fonts/Inter-ExtraLight.woff2') format('woff2');
  }
  @font-face {
    font-family: 'Inter';
    font-style: italic;
    font-weight: 200;
    font-display: swap;
    src: url('fonts/Inter-ExtraLightItalic.woff2') format('woff2');
  }

  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 300;
    font-display: swap;
    src: url('fonts/Inter-Light.woff2') format('woff2');
  }
  @font-face {
    font-family: 'Inter';
    font-style: italic;
    font-weight: 300;
    font-display: swap;
    src: url('fonts/Inter-LightItalic.woff2') format('woff2');
  }

  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src: url('fonts/Inter-Regular.woff2') format('woff2');
  }

  @font-face {
    font-family: 'Inter';
    font-style: italic;
    font-weight: 400;
    font-display: swap;
    src: url('fonts/Inter-Italic.woff2') format('woff2');
  }

  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 500;
    font-display: swap;
    src: url('fonts/Inter-Medium.woff2') format('woff2');
  }
  @font-face {
    font-family: 'Inter';
    font-style: italic;
    font-weight: 500;
    font-display: swap;
    src: url('fonts/Inter-MediumItalic.woff2') format('woff2');
  }

  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 600;
    font-display: swap;
    src: url('fonts/Inter-SemiBold.woff2') format('woff2');
  }
  @font-face {
    font-family: 'Inter';
    font-style: italic;
    font-weight: 600;
    font-display: swap;
    src: url('fonts/Inter-SemiBoldItalic.woff2') format('woff2');
  }
</style>

<AppBar />
<main>
  <Router {routes} />
</main>
