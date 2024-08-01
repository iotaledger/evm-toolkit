import { appConfiguration, selectedNetwork } from '$lib/evm-toolkit';
import { ISCMagic } from '$lib/iscmagic';
import { iscAbi, iscContractAddress } from '$lib/withdraw';
import { WTOKEN_CONTRACT_CHAIN_MAP, wIOTAAbi, wSMRAbi, wToken } from '$lib/wrap';
import { defaultEvmStores, selectedAccount, web3 } from 'svelte-web3';
import { get } from 'svelte/store';
import { addSelectedNetworkToMetamask, subscribeBalance, subscribeConnectedNetwork } from '.';
import { updateWithdrawStateStore, withdrawStateStore } from '../stores';

export async function connectToWallet() {
  updateWithdrawStateStore({ isLoading: true });
  const wTokenContractAddress = WTOKEN_CONTRACT_CHAIN_MAP[get(selectedNetwork)?.chainRef];
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

    const selectedContractAbi = get(appConfiguration)?.wTicker === 'wSMR' ? wSMRAbi : wIOTAAbi;
    const contractWToken = new EthContract(selectedContractAbi, wTokenContractAddress, {
      from: get(selectedAccount),
    });
    updateWithdrawStateStore({ contractWToken });

    const wTokenContractObj = new wToken(get(withdrawStateStore)?.contractWToken);
    updateWithdrawStateStore({ wTokenContractObj });

    await subscribeConnectedNetwork();
    await subscribeBalance();
  } catch (ex) {
    console.error('Failed to connect to wallet: ', ex.message);
    throw ex;
  }

  updateWithdrawStateStore({ isLoading: false });
}
