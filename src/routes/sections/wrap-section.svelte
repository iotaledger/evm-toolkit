<script lang="ts">
  import { chainId, connected, selectedAccount } from 'svelte-web3';

  import { AmountRangeInput, Button } from '$components';

  import { NotificationType, showNotification } from '$lib/notification';
  import {
    connectToWallet,
    withdrawStateStore,
  } from '$lib/withdraw';

  type WrapFormInput = {
    baseTokensToSend: number;
  }
  const formInput: WrapFormInput = {
    baseTokensToSend: 0,
  };

  const BASE_TOKEN_DECIMALS = 6;

  let isWraping: boolean = false;
  let canSetAmountToWrap = true;
  let estimatedGas: number = 0;

  $: updateCanWrap($withdrawStateStore.availableBaseTokens);
  $: formattedBalance = (
    $withdrawStateStore.availableBaseTokens /
    10 ** BASE_TOKEN_DECIMALS
  ).toFixed(2);
  $: canWrap =
    $withdrawStateStore.availableBaseTokens > 0 &&
    formInput.baseTokensToSend > 0;
  $: $withdrawStateStore.isMetamaskConnected = window.ethereum
    ? window.ethereum.isConnected()
    : false;

  $: $withdrawStateStore, updateFormInput();

  function updateFormInput() {
    if (formInput.baseTokensToSend > $withdrawStateStore.availableBaseTokens) {
      formInput.baseTokensToSend = 0;
    }
  }

  async function updateCanWrap(_baseTokens: number,) {
    if (!$withdrawStateStore.wsmrContractObj) {
      return (canSetAmountToWrap = false);
    }

    try {
      estimatedGas = await ($withdrawStateStore.wsmrContractObj as any).estimateGas(0);
      estimatedGas = Number(estimatedGas) + 500_000;
      canSetAmountToWrap = $withdrawStateStore.availableBaseTokens > estimatedGas;
    } catch (ex) {
      console.log('updateCanWrap - Error:', ex);
      return (canSetAmountToWrap = false);
    }
  }

  async function wrap(
    baseTokens: number,
  ) {
    if (!$selectedAccount) {
      return;
    }

    let result: any;

    try {
      isWraping = true;
      result = await $withdrawStateStore.wsmrContractObj.deposit(
        baseTokens,
      );
    } catch (ex) {
      isWraping = false;
      showNotification({
        type: NotificationType.Error,
        message: `Failed to send wrap request: ${ex.message}`,
        duration: 8000,
      });
      return;
    }

    if (result.status) {
      showNotification({
        type: NotificationType.Success,
        message: `Wrap request sent. Transaction: ${result.transactionHash}`,
        duration: 4000,
      });
    } else {
      showNotification({
        type: NotificationType.Error,
        message: `Failed to send wrap request: ${JSON.stringify(
          result,
          null,
          4,
        )}`,
        duration: 8000,
      });
    }
    isWraping = false;
  }

  async function onWrapClick() {
    await wrap(
      formInput.baseTokensToSend,
    );
  }

</script>

<withdraw-component class="flex flex-col space-y-6 mt-6">
  {#if !$connected && !$selectedAccount}
    <div class="input_container">
      <button on:click={connectToWallet}>Connect to Wallet</button>
    </div>
  {:else if !$withdrawStateStore.isLoading}
    <info-box>
      <div class="flex flex-col space-y-2">
        <info-item-title>Chain ID</info-item-title>
        <info-item-value>{$chainId}</info-item-value>
      </div>
      <div class="flex flex-col space-y-2">
        <info-item-title>SMR Balance</info-item-title>
        <info-item-value>{formattedBalance}</info-item-value>
      </div>
    </info-box>
    <tokens-to-send-wrapper>
      <div class="mb-2">Tokens to wrap</div>
      <info-box class="flex flex-col space-y-4 max-h-96 overflow-auto">
        <AmountRangeInput
          label="SMR Token:"
          bind:value={formInput.baseTokensToSend}
          disabled={!canSetAmountToWrap}
          min={estimatedGas}
          max={Math.max(
            $withdrawStateStore.availableBaseTokens - estimatedGas,
            0,
          )}
          decimals={6}
        />
      </info-box>
    </tokens-to-send-wrapper>
    <Button
      title="Wrap"
      onClick={onWrapClick}
      disabled={!canWrap}
      busy={isWraping}
      stretch
    />
  {/if}
</withdraw-component>

<style>
  info-box {
    @apply w-full;
    @apply flex;
    @apply justify-between;
    @apply bg-shimmer-background-tertiary;
    @apply rounded-xl;
    @apply p-4;
  }
  info-item-title {
    @apply text-xs;
    @apply text-shimmer-text-secondary;
  }

  info-item-value {
    @apply text-2xl;
  }
</style>
