<script lang="ts">
  import { connected, selectedAccount } from 'svelte-web3';
  import { AccountButton, Button, SettingsIcon } from '$components';
  import { handleEnterKeyDown, truncateText } from '$lib/common';
  import { NotificationType, showNotification } from '$lib/notification';
  import { PopupId } from '$lib/popup';
  import { openPopup } from '$lib/popup/actions';
  import { connectToWallet } from '$lib/withdraw';
  import { appConfiguration, selectedNetwork } from '$lib/evm-toolkit';

  function handleSettings() {
    openPopup(PopupId.Settings);
  }

  function onAccountClick() {
    openPopup(PopupId.Account, {
      account: $selectedAccount,
      actions: [],
    });
  }

  async function onConnectClick(): Promise<void> {
    try {
      await connectToWallet();
    } catch (e) {
      showNotification({
        type: NotificationType.Error,
        message: e,
      });
      console.error(e);
    }
  }
</script>

<nav class="h-16 flex justify-between items center">
  <logo-wrapper class="h-full flex items-center">
    <img
      src="/{$appConfiguration?.logo}"
      alt="{$appConfiguration?.theme} logo"
    />
    <h1 class="text-md md:text-xl ml-4 text-color-default font-semibold">
      {$selectedNetwork?.chainRef?.includes("testnet") ? 'EVM Testnet' : 'EVM'}
    </h1>
  </logo-wrapper>
  <items-wrapper class="flex items-center space-x-4 mr-4">
    <SettingsIcon
      on:click={handleSettings}
      on:keydown={event => handleEnterKeyDown(event, handleSettings)}
    />
    {#if !$connected || !$selectedAccount}
      <Button onClick={onConnectClick} title="Connect wallet" />
    {:else}
      <AccountButton
        title={truncateText($selectedAccount)}
        onClick={onAccountClick}
      />
    {/if}
  </items-wrapper>
</nav>
