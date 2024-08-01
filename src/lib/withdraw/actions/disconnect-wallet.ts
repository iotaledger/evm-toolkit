import { defaultEvmStores } from 'svelte-web3';

import { unsubscribeConnectedNetwork, unsubscribeBalance } from './subscriptions';

export async function disconnectWallet(): Promise<void> {
  await defaultEvmStores.disconnect();
  unsubscribeConnectedNetwork();
  unsubscribeBalance();
}
