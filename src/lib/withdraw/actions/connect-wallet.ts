import { defaultEvmStores, selectedAccount, web3 } from 'svelte-web3';
import { get } from 'svelte/store';

import { ISCMagic } from '$lib/iscmagic';
import { iscAbi, iscContractAddress } from '$lib/withdraw';

import { wSMR } from '$lib/wsmr';
import { wSMRAbi, wSMRContractAddress } from '$lib/wsmr';

import { addSelectedNetworkToMetamask, subscribeBalance } from '.';
import { updateWithdrawStateStore, withdrawStateStore } from '../stores';

export async function connectToWallet() {
  updateWithdrawStateStore({ isLoading: true });

  try {
    await defaultEvmStores.setProvider();

    await addSelectedNetworkToMetamask();

    const evmChainID = await get(web3).eth.getChainId();
    updateWithdrawStateStore({ evmChainID });

    const EthContract = get(web3).eth.Contract;
    const contract = new EthContract(iscAbi, iscContractAddress, {
      from: get(selectedAccount),
    });

    updateWithdrawStateStore({ contract });

    const iscMagic = new ISCMagic(get(withdrawStateStore)?.contract);
    updateWithdrawStateStore({ iscMagic });

    const contractWSMR = new EthContract(wSMRAbi, wSMRContractAddress, {
      from: get(selectedAccount),
    });

    updateWithdrawStateStore({ contractWSMR });

    const wsmrContractObj = new wSMR(get(withdrawStateStore)?.contractWSMR);
    updateWithdrawStateStore({ wsmrContractObj });

    await subscribeBalance();
  } catch (ex) {
    console.error('Failed to connect to wallet: ', ex.message);
    throw ex;
  }

  updateWithdrawStateStore({ isLoading: false });
}
