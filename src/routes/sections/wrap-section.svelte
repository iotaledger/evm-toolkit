<script lang="ts">
  import { chainId, connected, selectedAccount } from 'svelte-web3';

  import { AmountRangeInput, Button } from '$components';

  import { NotificationType, showNotification } from '$lib/notification';
  import {
    connectToWallet,
    withdrawStateStore,
    addWTokenToMetamask,
  } from '$lib/withdraw';
    import { GAS_PRICE } from '$lib/wrap';
    import { appConfiguration } from '$lib/evm-toolkit';
    import { L2_NATIVE_GAS_TOKEN_DECIMALS, wSMR_TOKEN_DECIMALS } from '$lib/constants';

  type WrapFormInput = {
    tokensToWrap: number;
    wTokensToUnwrap: number;
  }
  const formInput: WrapFormInput = {
    tokensToWrap: 0,
    wTokensToUnwrap: 0,
  };

  let isWraping: boolean = false;
  let isUnwraping: boolean = false;
  let canSetAmountToWrap = true;
  let canSetAmountToUnwrap = true;
  let estimatedTxFee: number = 0;
  let balanceWToken: number = 0;

  $: updateCanWrap($withdrawStateStore.availableBaseTokens);
  $: formattedBalanceToken = (
    $withdrawStateStore.availableBaseTokens /
    10 ** L2_NATIVE_GAS_TOKEN_DECIMALS
  ).toFixed(6);
  $: canWrap =
    $withdrawStateStore.availableBaseTokens > 0 &&
    formInput.tokensToWrap > 0;
  $: canUnwrap =
    balanceWToken > 0 &&
    formInput.wTokensToUnwrap > 0;
  $: $withdrawStateStore.isMetamaskConnected = window.ethereum
    ? window.ethereum.isMetamaskConnected
    : false;

  $: $withdrawStateStore, updateFormInput();

  function updateFormInput() {
    if (formInput.tokensToWrap > $withdrawStateStore.availableBaseTokens) {
      formInput.tokensToWrap = 0;
    } 
  }

  async function updateCanWrap(_baseTokens: number,) {
    if (!$withdrawStateStore.wTokenContractObj) {
      return (canSetAmountToWrap = false);
    }

    try {
      const estimatedGas = await ($withdrawStateStore.wTokenContractObj as any).estimateGasDeposit(0);
      estimatedTxFee = +estimatedGas.toString() * GAS_PRICE;
      estimatedTxFee += 0.01; // to avoid not enough txFee
      estimatedTxFee *= 10 ** L2_NATIVE_GAS_TOKEN_DECIMALS;
      canSetAmountToWrap = $withdrawStateStore.availableBaseTokens > estimatedTxFee;
      balanceWToken = await ($withdrawStateStore.wTokenContractObj as any).balanceOf($selectedAccount);
      balanceWToken = Number(balanceWToken);
      balanceWToken -= 1000000000000; // to avoid exceed the balance due to rounding
      canSetAmountToUnwrap = balanceWToken > 0;
    } catch (ex) {
      console.log('updateCanWrap - Error:', ex);
      canSetAmountToWrap = false;
      canSetAmountToUnwrap = false;
    }
  }

  async function wrapOrUnwrap(
    tokens: number,
    wTokens: number,
  ) {
    if (!$selectedAccount) {
      return;
    }

    let result: any;

    const wrapText = tokens > 0 ? 'wrap' : 'unwrap';

    try {
      tokens > 0 ? isWraping = true : isUnwraping = true;
      result = tokens > 0 ? await $withdrawStateStore.wTokenContractObj.deposit(
        BigInt(tokens),
      ) : await $withdrawStateStore.wTokenContractObj.withdraw(
        BigInt(wTokens),
      );
    } catch (ex) {
      tokens > 0 ? isWraping = false : isUnwraping = false;
      showNotification({
        type: NotificationType.Error,
        message: `Failed to send ${wrapText} request: ${ex?.data?.message || ex?.message}`,
        duration: 8000,
      });
      return;
    }

    if (result.status) {
      showNotification({
        type: NotificationType.Success,
        message: `${wrapText} request sent. Transaction: ${result.transactionHash}`,
        duration: 4000,
      });
    } else {
      showNotification({
        type: NotificationType.Error,
        message: `Failed to send ${wrapText} request: ${JSON.stringify(
          result,
          null,
          4,
        )}`,
        duration: 8000,
      });
    }
    isWraping = false;
    isUnwraping = false;
    tokens > 0 ? formInput.tokensToWrap = 0 : formInput.wTokensToUnwrap = 0;
  }

  async function onWrapClick() {
    await wrapOrUnwrap(
      formInput.tokensToWrap,
      0
    );
  }

  async function onUnwrapClick() {
    await wrapOrUnwrap(
      0,
      formInput.wTokensToUnwrap,
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
        <info-item-title>{$appConfiguration?.ticker} Balance</info-item-title>
        <info-item-value>{formattedBalanceToken}</info-item-value>
      </div>
      <div class="flex flex-col space-y-2">
        <info-item-title>{$appConfiguration?.wTicker} Balance</info-item-title>
        <info-item-value>{(balanceWToken / 10 ** wSMR_TOKEN_DECIMALS).toFixed(6)}</info-item-value>
      </div>
    </info-box>
    <info-box>
      <div class="flex flex-col space-y-2">
        <tokens-to-send-wrapper>
          <div class="mb-2">Wrap {$appConfiguration?.ticker}</div>
          <info-box class="flex flex-col space-y-4 max-h-96 overflow-auto">
            <AmountRangeInput
              label="{$appConfiguration?.ticker} Token:"
              bind:value={formInput.tokensToWrap}
              disabled={!canSetAmountToWrap}
              min={estimatedTxFee}
              max={Math.max(
                $withdrawStateStore.availableBaseTokens - estimatedTxFee,
                0,
              )}
              decimals={L2_NATIVE_GAS_TOKEN_DECIMALS}
            />
          </info-box>
        </tokens-to-send-wrapper>
      </div>
      <div class="flex flex-col space-y-2">
        <tokens-to-send-wrapper>
          <div class="mb-2">
            Unwrap {$appConfiguration?.wTicker} {' '} &nbsp;
            <button on:click={addWTokenToMetamask}>
              <img src="/metamask-logo.svg" alt="Metamask logo" width="70%" />
            </button>
          </div>
          <info-box class="flex flex-col space-y-4 max-h-96 overflow-auto">
            <AmountRangeInput
              label="{$appConfiguration?.wTicker} Token:"
              bind:value={formInput.wTokensToUnwrap}
              disabled={!canSetAmountToUnwrap}
              min={0}
              max={Math.max(
                balanceWToken,
                0,
              )}
              decimals={L2_NATIVE_GAS_TOKEN_DECIMALS}
            />
          </info-box>
        </tokens-to-send-wrapper>
      </div>
    </info-box>
    <info-box>
      <div class="flex flex-col space-y-2">
        <Button
          title="Wrap"
          onClick={onWrapClick}
          disabled={!canWrap}
          busy={isWraping}
        />
      </div>
      <div class="flex flex-col space-y-2">
        <Button
          title="Unwrap"
          onClick={onUnwrapClick}
          disabled={!canUnwrap}
          busy={isUnwraping}
          ghost
        />
      </div>
    </info-box>
  {/if}
</withdraw-component>

<style>
  info-box {
    @apply w-full;
    @apply flex;
    @apply justify-between;
    @apply bg-background-tertiary;
    @apply rounded-xl;
    @apply p-4;
  }
  info-item-title {
    @apply text-xs;
    @apply text-color-secondary;
  }

  info-item-value {
    @apply text-2xl;
  }
</style>
