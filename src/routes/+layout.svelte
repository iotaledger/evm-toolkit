<script lang="ts">
  import { onMount } from 'svelte';

  import { Navbar, NotificationManager, PopupManager } from '$components';

  import {
    Theme,
    appConfiguration,
    fetchConfiguredNetworks,
    networks,
    selectedNetwork,
  } from '$lib/evm-toolkit';

  import '../app.scss';

  onMount(async () => {
    const initialNetworks = await fetchConfiguredNetworks();
    let updatedNetworks = initialNetworks;
    if ($networks?.length) {
      updatedNetworks = initialNetworks.map(network => {
        const matchedExistingNetwork = $networks.find(
          _network => _network?.id === network?.id,
        );
        if (network?.id === 0 || !matchedExistingNetwork) {
          return network;
        } else {
          return matchedExistingNetwork;
        }
      });
    }
    networks.set(updatedNetworks);
  });

  const setTheme = theme => {
    const htmlElement = document?.querySelector('html');
    if (htmlElement) {
      htmlElement.setAttribute('data-theme', theme);
    }
  };

  $: {
    const configuredTheme = $appConfiguration?.theme;
    if (configuredTheme) {
      setTheme(configuredTheme);
    }
  }
</script>

<Navbar />
<main class="w-full flex flex-1 items-center justify-center">
  <background-decorator>
    <div
      style={$appConfiguration?.theme === Theme.Shimmer
        ? "background-image: url('/bg-shimmer-shapes.svg');"
        : "background-image: url('/bg-iota-shapes.svg');"}
    />
  </background-decorator>
  <slot />
</main>
<PopupManager />
<NotificationManager />

<style lang="scss">
  main {
    @apply w-full flex flex-1 items-center justify-center;
    min-height: calc(100vh - (var(--navbar-height)));
  }
  background-decorator {
    @apply bg-background-primary;
    @apply w-screen h-screen fixed z-[-1] top-0 left-0;

    div {
      @apply w-screen h-screen;
      @apply bg-no-repeat bg-cover;
      background-position: 50% center;
    }
  }
</style>
