import type { Network } from "../enums";

export interface INetwork {
    id: number;
    text: string;
    apiEndpoint: string;
    faucetEndpoint: string;
    chainAddress: string;
    chainID: number;
    blockExplorer?: string;
    networkUrl?: string;
    network: Network;
}
