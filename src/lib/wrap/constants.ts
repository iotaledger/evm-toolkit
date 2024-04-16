import wSMRAbiAsText from '$lib/assets/wSMR.abi?raw';
import wIOTAAbiAsText from '$lib/assets/wIOTA.abi?raw';

export const wSMRAbi = JSON.parse(wSMRAbiAsText);
export const wIOTAAbi = JSON.parse(wIOTAAbiAsText);
export const wSMRContractAddress = '0xBEb654A116aeEf764988DF0C6B4bf67CC869D01b';
export const wIOTAContractAddress = '0x6e47f8d48a01b44DF3fFF35d258A10A3AEdC114c';
export const GAS_PRICE = 0.000001; // 1000 Gwei
