<script lang="ts">
  import { Box, Tabs } from '$components';
  import { Feature, appConfiguration } from '$lib/evm-toolkit';
  import { onMount } from 'svelte';
  import { FaucetSection, WithdrawSection, WrapSection } from './sections';

  const APP_TABS = [
    {
      feature: Feature.Faucet,
      label: 'Faucet',
      component: FaucetSection,
    },
    {
      feature: Feature.Withdraw,
      label: 'Withdraw',
      component: WithdrawSection,
    },
    {
      feature: Feature.Wrap,
      label: 'Wrap',
      component: WrapSection,
    },
  ];

  $: activeTabs = APP_TABS.filter(tab =>
    $appConfiguration?.features?.includes(tab.feature),
  ).map((tab, index) => ({
    ...tab,
    value: index + 1,
  }));

  let mounted = false;
  onMount(() => {
    mounted = true;
  });
</script>

<section class="max-w-2xl w-full">
  <Box>
    {#if mounted}
      <Tabs tabs={activeTabs} />
    {/if}
  </Box>
</section>
