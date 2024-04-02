import type { Theme, Feature } from "../enums";

export interface IAppConfiguration {
    theme: Theme;
    ticker: string;
    wTiker: string;
    bech32Hrp: string;
    logo: string;
    favicon: string;
    features: Feature[];
}
