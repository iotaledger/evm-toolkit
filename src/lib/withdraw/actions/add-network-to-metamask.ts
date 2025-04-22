import { get } from 'svelte/store';

import { selectedNetwork, appConfiguration } from '$lib/evm-toolkit';
import { NotificationType, showNotification } from '$lib/notification';
import { L2_NATIVE_GAS_TOKEN_DECIMALS } from '$lib/constants';

export async function addSelectedNetworkToMetamask(): Promise<void> {
    const { ethereum } = window as any;
    const $selectedNetwork = get(selectedNetwork);
    if ($selectedNetwork) {
        if (ethereum && ethereum.isMetaMask) {
            try {
                await ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainId: `0x${$selectedNetwork.chainID?.toString(16)}`,
                            chainName: $selectedNetwork.text,
                            nativeCurrency: {
                            name: get(appConfiguration).ticker,
                            symbol: get(appConfiguration).ticker,
                                decimals: L2_NATIVE_GAS_TOKEN_DECIMALS,
                            },
                            ...($selectedNetwork.networkUrl && { rpcUrls: [$selectedNetwork.networkUrl] }),
                            ...($selectedNetwork.blockExplorer && { blockExplorerUrls: [$selectedNetwork.blockExplorer] }),
                        },
                    ],
                });
            }
            catch (ex) {
                // hotfix: ignore random metamask error https://github.com/MetaMask/metamask-extension/issues/31464#issuecomment-2771409773
                if(ex?.code === -32603) {
                    return;
                } else {
                    console.error(ex);
                    throw new Error(ex?.message);
                }
            }
        } else {
            showNotification({
                type: NotificationType.Warning,
                message: "Could not add the selected network to your wallet. Please add it network manually.",
            });
        }
    } else {
        showNotification({
            type: NotificationType.Warning,
            message: "Please select a network first.",
        });
    }
}
