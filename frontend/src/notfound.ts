import NotFound from './pages/NotFound.svelte';

const app = new NotFound({
  target: document.body,
  props: { appBar: true },
});

export default app;

if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(() => {
    app.$destroy();
  });
}
