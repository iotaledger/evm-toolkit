<script lang="ts">
  import { Box, Tabs } from '$components';
  import { selectedNetwork } from '$lib/evm-toolkit';
  import { onMount } from 'svelte';
  import { FaucetSection, WithdrawSection, WrapSection } from './sections';

  const EVM_TABS = [
    {
      label: 'Withdraw',
      value: 1,
      component: WithdrawSection,
    },
    {
      label: 'Wrap',
      value: 2,
      component: WrapSection,
    },
  ];
  const TESTNET_TABS = [
    {
      label: 'Faucet',
      value: 1,
      component: FaucetSection,
    },
    {
      label: 'Withdraw',
      value: 2,
      component: WithdrawSection,
    },
    {
      label: 'Wrap',
      value: 3,
      component: WrapSection,
    },
  ];

  $: tabs = $selectedNetwork?.faucetEndpoint ? TESTNET_TABS : EVM_TABS;

  let mounted = false;
  onMount(() => {
    mounted = true;
  });
</script>

<section class="max-w-2xl w-full">
  <Box>
    {#if mounted}
      <Tabs {tabs} />
    {/if}
  </Box>
</section>
