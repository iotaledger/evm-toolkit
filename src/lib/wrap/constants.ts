import wIOTAAbiAsText from '$lib/assets/wIOTA.abi?raw';
import wSMRAbiAsText from '$lib/assets/wSMR.abi?raw';
import { ChainReference } from "$lib/evm-toolkit";

export const wSMRAbi = JSON.parse(wSMRAbiAsText);
export const wIOTAAbi = JSON.parse(wIOTAAbiAsText);
export const GAS_PRICE = 0.000001; // 1000 Gwei

export const WTOKEN_CONTRACT_CHAIN_MAP = {
    [ChainReference.IOTAEVM]: '0x6e47f8d48a01b44DF3fFF35d258A10A3AEdC114c',
    [ChainReference.IOTAEVMTestnet]: '0xB2E0DfC4820cc55829C71529598530E177968613',
    [ChainReference.ShimmerEVM]: '0xBEb654A116aeEf764988DF0C6B4bf67CC869D01b',
    [ChainReference.ShimmerEVMTestnet]: '0xBEb654A116aeEf764988DF0C6B4bf67CC869D01b',
}
