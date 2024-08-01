import { clearIntervalAsync, setIntervalAsync } from 'set-interval-async';
import { chainId, connected, selectedAccount } from 'svelte-web3';
import { get } from 'svelte/store';

import { updateWithdrawStateStore, withdrawStateStore } from '../stores';
import { pollAccount } from './polls';


import { selectedNetwork } from '$lib/evm-toolkit';
import { NotificationType, showNotification } from '$lib/notification';
import { disconnectWallet } from '.';

export async function subscribeBalance() {
  await unsubscribeBalance();
  const $withdrawStateStore = get(withdrawStateStore);
  if ($withdrawStateStore.balancePollingHandle) {
    return;
  }
  await pollAccount();
  updateWithdrawStateStore({
    balancePollingHandle: setIntervalAsync(pollAccount, 2500),
  });
}

export async function unsubscribeBalance() {
  const $withdrawStateStore = get(withdrawStateStore);

  if (!$withdrawStateStore.balancePollingHandle) {
    return;
  }

  await clearIntervalAsync($withdrawStateStore.balancePollingHandle);
  updateWithdrawStateStore({
    balancePollingHandle: undefined,
  });
}

let connectedNetworkInterval: NodeJS.Timeout | null = null;
export async function subscribeConnectedNetwork() {
  connectedNetworkInterval = setInterval(async () => {
    if (get(connected) || get(selectedAccount)) {
      if (BigInt(get(chainId)) !== BigInt(get(selectedNetwork)?.chainID)) {
        try {
          await disconnectWallet();
        } catch (e) {
          showNotification({
            type: NotificationType.Error,
            message: e,
          });
          console.error(e);
        }
      }
    }
  }, 1000);
}

export async function unsubscribeConnectedNetwork() {
  if (connectedNetworkInterval) {
    clearInterval(connectedNetworkInterval);
  }
}
