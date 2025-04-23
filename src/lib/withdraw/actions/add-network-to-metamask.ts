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
            catch (error) {
                if (error.message.includes('is not a function')) {
                    /**
                     * MetaMask v12.14.2 introduced bug with switching networks. Since it succeeds, we still change the text to mark this as successful.
                     * @see https://github.com/MetaMask/metamask-extension/issues/31464
                     */
                } else {
                    console.error(error);
                    throw new Error(error?.message);
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
