import { get } from 'svelte/store';

import { L2_NATIVE_GAS_TOKEN_DECIMALS } from '$lib/constants';
import { appConfiguration, selectedNetwork } from '$lib/evm-toolkit';
import { NotificationType, showNotification } from '$lib/notification';
import { WTOKEN_CONTRACT_CHAIN_MAP } from '$lib/wrap';

export async function addWTokenToMetamask(): Promise<void> {
  const { ethereum } = window as any;
  const $selectedNetwork = get(selectedNetwork);
  if ($selectedNetwork) {
    if (ethereum && ethereum.isMetaMask) {
      try {
        await ethereum.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: WTOKEN_CONTRACT_CHAIN_MAP[$selectedNetwork?.chainRef],
              symbol: get(appConfiguration)?.wTicker,
              decimals: L2_NATIVE_GAS_TOKEN_DECIMALS,
            },
          },
        });
      } catch (ex) {
        console.error(ex?.message);
        throw new Error(ex?.message);
      }
    } else {
      showNotification({
        type: NotificationType.Warning,
        message:
          'Could not add the selected token to your wallet. Please add it manually.',
      });
    }
  } else {
    showNotification({
      type: NotificationType.Warning,
      message: 'Please select a network first.',
    });
  }
}
