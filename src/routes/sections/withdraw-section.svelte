<script lang="ts">
  import { AmountRangeInput, Button, Input, Select } from '$components';
  import { getBech32AddressLengthFromChain, truncateText } from '$lib/common';
  import { InputType } from '$lib/common/enums';
  import {
    L1_BASE_TOKEN_DECIMALS,
    L2_NATIVE_GAS_TOKEN_DECIMALS,
  } from '$lib/constants';
  import {
    appConfiguration,
    nodeClient,
    selectedNetwork,
  } from '$lib/evm-toolkit';
  import type { INativeToken } from '$lib/native-token';
  import type { INFT } from '$lib/nft';
  import { NotificationType, showNotification } from '$lib/notification';
  import type { WithdrawFormInput } from '$lib/withdraw';
  import {
    connectToWallet,
    pollBalance,
    randomBech32Address,
    storageDeposit,
    withdrawStateStore,
  } from '$lib/withdraw';
  import { chainId, connected, selectedAccount } from 'svelte-web3';

  let formInput: WithdrawFormInput = {
    receiverAddress: '',
    baseTokensToSend: storageDeposit,
    nativeTokensToSend: {},
    nftIDToSend: null,
  };

  let isWithdrawing: boolean = false;
  let isBaseTokenValueValid: boolean = true;
  let isNativeTokenValueValid: boolean = true;
  let gasNeeded: number | undefined;

  $: updateCanWithdraw($withdrawStateStore.availableBaseTokens, {}, null);
  $: formattedBalance = (
    $withdrawStateStore.availableBaseTokens /
    10 ** L2_NATIVE_GAS_TOKEN_DECIMALS
  ).toFixed(2);
  $: isValidAddress =
    formInput.receiverAddress.length ===
    getBech32AddressLengthFromChain($selectedNetwork.chainRef);
  $: canWithdraw =
    $withdrawStateStore?.availableBaseTokens > 0 &&
    formInput.baseTokensToSend > 0 &&
    isValidAddress &&
    isBaseTokenValueValid &&
    isNativeTokenValueValid;
  $: $withdrawStateStore.isMetamaskConnected = window.ethereum
    ? window.ethereum.isMetamaskConnected
    : false;

  $: $withdrawStateStore, updateFormInput();
  $: placeholderHrp = `${$appConfiguration?.bech32Hrp.toLowerCase()}...`;

  $: storageDepositAdjustedDecimals =
    storageDeposit *
    10 ** (L2_NATIVE_GAS_TOKEN_DECIMALS - L1_BASE_TOKEN_DECIMALS);

  function updateFormInput() {
    if (formInput.baseTokensToSend > $withdrawStateStore.availableBaseTokens) {
      formInput.baseTokensToSend = 0;
    }
    // Remove native tokens marked to be sent if the token does not exist anymore.
    for (const nativeTokenID of Object.keys(formInput.nativeTokensToSend)) {
      const isNativeTokenAvailable =
        $withdrawStateStore.availableNativeTokens.findIndex(
          x => x.id == nativeTokenID,
        ) >= 0;

      if (!isNativeTokenAvailable) {
        delete formInput.nativeTokensToSend[nativeTokenID];
      }
    }
    // Add all existing native tokens to the "to be sent" array but with an amount of 0
    // This makes it easier to connect the UI with the withdraw request.
    for (const nativeToken of $withdrawStateStore.availableNativeTokens) {
      if (typeof formInput.nativeTokensToSend[nativeToken.id] == 'undefined') {
        formInput.nativeTokensToSend[nativeToken.id] = 0;
      }
    }
  }

  async function updateCanWithdraw(
    baseTokens: number,
    nativeTokens: { [key: string]: number },
    nftID?: string,
  ) {
    if (!$withdrawStateStore.iscMagic) {
      return;
    }
    const nativeTokensToSend = mapNativeToken(nativeTokens);
    // If the receiver address is not set, we generate a random one to estimate the gas needed.
    const receivedAddress = formInput.receiverAddress?.length
      ? formInput.receiverAddress
      : randomBech32Address($appConfiguration.bech32Hrp);
    try {
      gasNeeded = await $withdrawStateStore.iscMagic.estimateGas(
        $nodeClient,
        receivedAddress,
        baseTokens,
        nativeTokensToSend,
        nftID,
      );
    } catch (ex) {
      gasNeeded = undefined;
      console.log(ex);
    }
  }

  async function withdraw(
    baseTokens: number,
    nativeTokens: INativeToken[],
    nftID?: string,
  ) {
    if (!$selectedAccount) {
      return;
    }

    let result: any;

    try {
      isWithdrawing = true;
      result = await $withdrawStateStore.iscMagic.withdraw(
        $nodeClient,
        formInput.receiverAddress,
        baseTokens,
        nativeTokens,
        nftID,
      );
    } catch (ex) {
      isWithdrawing = false;
      showNotification({
        type: NotificationType.Error,
        message: `Failed to send withdraw request: ${ex.message}`,
        duration: 8000,
      });
      console.log(ex);
      return;
    }

    if (result.status) {
      resetView();
      showNotification({
        type: NotificationType.Success,
        message: `Withdraw request sent. BlockIndex: ${result.blockNumber}`,
        duration: 4000,
      });
    } else {
      showNotification({
        type: NotificationType.Error,
        message: `Failed to send withdraw request: ${JSON.stringify(
          result,
          null,
          4,
        )}`,
        duration: 8000,
      });
    }
    isWithdrawing = false;
  }

  function mapNativeToken(nativeTokens: { [key: string]: number }) {
    const nativeTokensToSend: INativeToken[] = [];

    for (const tokenID of Object.keys(nativeTokens)) {
      const amount = nativeTokens[tokenID];

      if (amount > 0) {
        nativeTokensToSend.push({
          // TODO: BigInt is required for native tokens, but it causes problems with the range slider. This needs to be adressed before shipping.
          // In this function the amount is actually of type "number" not bigint, so we lose precision at 53bits which is a problem that needs to be solved.
          amount: BigInt(amount),
          id: tokenID,
        });
      }
    }

    return nativeTokensToSend;
  }

  async function onWithdrawClick() {
    const nativeTokensToSend = mapNativeToken(formInput.nativeTokensToSend);

    await withdraw(
      formInput.baseTokensToSend,
      nativeTokensToSend,
      formInput.nftIDToSend,
    );
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function onWithdrawEverythingClick() {
    try {
      for (let nft of $withdrawStateStore.availableNFTs.reverse()) {
        await pollBalance();
        const estimate = await $withdrawStateStore.iscMagic.estimateGas(
          $nodeClient,
          formInput.receiverAddress,
          10,
          [],
          nft.id,
        );

        await withdraw(estimate + 10, [], nft.id);
        await sleep(5 * 1000);
      }

      await pollBalance();
      await withdraw(
        $withdrawStateStore.availableBaseTokens,
        $withdrawStateStore.availableNativeTokens,
        null,
      );
    } catch {}
  }

  const formatAvailableNFTsForSelectTag = (nfts: INFT[]) => {
    return nfts.map(nft => {
      return {
        id: nft.id,
        label: nft?.metadata?.name
          ? truncateText(nft?.metadata?.name, 4, 4) + '  ' + nft?.id
          : nft?.id,
      };
    });
  };

  let resetReactiveVariable = 0; // This is a hack to force a re-render of the component
  function resetView(): void {
    formInput.receiverAddress = '';
    formInput.baseTokensToSend = storageDeposit;
    formInput.nativeTokensToSend = {};
    formInput.nftIDToSend = null;
    formInput = formInput;

    resetReactiveVariable++;
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
        <info-item-title>Balance</info-item-title>
        <info-item-value>{formattedBalance}</info-item-value>
      </div>
    </info-box>
    <Input
      type={InputType.Text}
      label="Receiver address"
      bind:value={formInput.receiverAddress}
      placeholder="L1 address starting with {placeholderHrp}"
      stretch
    />
    <tokens-to-send-wrapper>
      <div class="mb-2">Tokens to send</div>
      <info-box class="flex flex-col space-y-4 max-h-96 overflow-auto">
        {#key resetReactiveVariable}
          <AmountRangeInput
            label="{$appConfiguration?.ticker} Token:"
            bind:value={formInput.baseTokensToSend}
            bind:valid={isBaseTokenValueValid}
            disabled={!(
              $withdrawStateStore?.availableBaseTokens >
              Number(gasNeeded) + 1
            )}
            min={storageDepositAdjustedDecimals}
            max={Math.max(
              $withdrawStateStore.availableBaseTokens - storageDeposit,
              0,
            )}
            decimals={L2_NATIVE_GAS_TOKEN_DECIMALS}
          />
        {/key}
        {#each $withdrawStateStore.availableNativeTokens as nativeToken}
          <AmountRangeInput
            bind:value={formInput.nativeTokensToSend[nativeToken.id]}
            label="{nativeToken?.metadata?.name ?? ''} Token:"
            decimals={nativeToken?.metadata?.decimals || 0}
            max={Number(nativeToken.amount)}
            bind:valid={isNativeTokenValueValid}
          />
        {/each}
      </info-box>
    </tokens-to-send-wrapper>
    {#if $withdrawStateStore.availableNFTs.length > 0}
      <nfts-wrapper>
        <div class="mb-2">NFTs</div>
        <Select
          bind:value={formInput.nftIDToSend}
          withEmptyItem={true}
          options={formatAvailableNFTsForSelectTag(
            $withdrawStateStore.availableNFTs,
          )}
        />
      </nfts-wrapper>
    {/if}
    <Button
      title="Withdraw"
      onClick={onWithdrawClick}
      disabled={!canWithdraw}
      busy={isWithdrawing}
      stretch
    />
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
