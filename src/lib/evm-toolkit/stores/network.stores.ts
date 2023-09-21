import { persistent } from '$lib/stores';
import { derived, type Readable, type Writable } from 'svelte/store';
import type { INetwork } from '../interfaces';

const SELECTED_NETWORK_KEY = 'selectedNetworkId';
const NETWORKS_KEY = 'networks';

export const networks: Writable<INetwork[]> = persistent<INetwork[]>(NETWORKS_KEY, null);
export const selectedNetworkId: Writable<number> = persistent(
    SELECTED_NETWORK_KEY,
    0,
);

export const selectedNetwork: Readable<INetwork> = derived(
    [networks, selectedNetworkId], ([$networks, $selectedNetworkId]) => {
        if (!$networks?.length || !($selectedNetworkId >= 0)) {
            return null;
        }
        return $networks.find(network => network.id === $selectedNetworkId);
    }
)

export function updateNetwork(network: INetwork) {
    networks.update($networks => {
        const index = $networks.findIndex(_network => _network?.id === network?.id);
        if (index !== -1) {
            $networks[index] = network;
        }
        return $networks;
    })
}

// Fetch the networks data at runtime
export async function fetchConfiguredNetworks(): Promise<INetwork[]> {
    try {
        const response = await fetch('/networks.json');  // adjust the path as necessary
        if (!response.ok) {
            throw new Error("Networks data fetch failed");
        }
        try {
            const data: INetwork[] = await response.json();
            return data
        } catch (error) {
            console.error(error);
            return [];
        }
    } catch (error) {
        console.error(error);
        return [];
    }
}
