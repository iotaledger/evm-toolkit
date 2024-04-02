import { Feature, Network, Theme } from "../enums";
import type { IAppConfiguration } from "../interfaces";

export const APP_CONFIGURATIONS: Record<Network, IAppConfiguration> = {
    [Network.Mainnet]: {
        theme: Theme.IOTA,
        ticker: 'IOTA',
        wTiker: 'wIOTA',
        bech32Hrp: 'iota',
        logo: "iota.svg",
        favicon: "iota-fav.ico",
        features: [Feature.Withdraw, Feature.Wrap]
    },
    [Network.Shimmer]: {
        theme: Theme.Shimmer,
        ticker: 'SMR',
        wTiker: 'wSMR',
        bech32Hrp: 'smr',
        logo: "shimmer.svg",
        favicon: "shimmer-fav.ico",
        features: [Feature.Withdraw, Feature.Wrap]
    },
    [Network.Testnet]: {
        theme: Theme.Shimmer,
        ticker: 'RMS',
        wTiker: 'wRMS',
        bech32Hrp: 'rms',
        logo: "shimmer.svg",
        favicon: "shimmer-fav.ico",
        features: [Feature.Faucet, Feature.Withdraw, Feature.Wrap]
    }
}
