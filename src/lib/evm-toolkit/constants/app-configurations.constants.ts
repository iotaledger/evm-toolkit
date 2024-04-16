import { Feature, ChainReference, Theme } from "../enums";
import type { IAppConfiguration } from "../interfaces";

export const APP_CONFIGURATIONS: Record<ChainReference, IAppConfiguration> = {
    [ChainReference.IOTAEVM]: {
        theme: Theme.IOTA,
        ticker: 'IOTA',
        wTicker: 'wIOTA',
        bech32Hrp: 'iota',
        logo: "iota_evm.svg",
        favicon: "iota-fav.ico",
        features: [Feature.Withdraw, Feature.Wrap]
    },
    [ChainReference.IOTAEVMTestnet]: {
        theme: Theme.IOTA,
        ticker: 'IOTA',
        wTicker: 'wIOTA',
        bech32Hrp: 'iota',
        logo: "iota_evm_testnet.svg",
        favicon: "iota-fav.ico",
        features: [Feature.Faucet, Feature.Withdraw, Feature.Wrap]
    },
    [ChainReference.ShimmerEVM]: {
        theme: Theme.Shimmer,
        ticker: 'SMR',
        wTicker: 'wSMR',
        bech32Hrp: 'smr',
        logo: "shimmer_evm.svg",
        favicon: "shimmer-fav.ico",
        features: [Feature.Withdraw, Feature.Wrap]
    },
    [ChainReference.ShimmerEVMTestnet]: {
        theme: Theme.Shimmer,
        ticker: 'SMR',
        wTicker: 'wSMR',
        bech32Hrp: 'rms',
        logo: "shimmer_evm_testnet.svg",
        favicon: "shimmer-fav.ico",
        features: [Feature.Faucet, Feature.Withdraw, Feature.Wrap]
    }
}
