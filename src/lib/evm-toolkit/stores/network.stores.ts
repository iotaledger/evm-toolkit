import { derived, writable, get } from 'svelte/store';
import { persistent } from '$lib/stores';
import type { INetwork } from '../interfaces';

const SELECTED_NETWORK_KEY = 'selectedNetworkId';

export const networks = writable<INetwork[]>([]);
export const selectedNetworkId: Writable<number> = persistent(
    SELECTED_NETWORK_KEY,
    0,
);

// Fetch the networks data at runtime
export async function fetchNetworksData() {
    const response = await fetch('/networks.json');  // adjust the path as necessary
    if (!response.ok) {
        throw new Error("Networks data fetch failed");
    }
    const data = await response.json();
    networks.set(data);
}

// Use derived store as before, but make sure you have called fetchNetworksData() beforehand
export const selectedNetwork: Readable<INetwork> = derived(
    [networks, selectedNetworkId], ([$networks, $selectedNetworkId]) => {
        if (!$networks?.length || !($selectedNetworkId >= 0)) {
            return null;
        }
        return $networks.find(network => network.id === $selectedNetworkId);
    }
);

export function updateNetwork(network: INetwork) {
    networks.update($networks => {
        const index = $networks.findIndex(_network => _network?.id === network?.id);
        if (index !== -1) {
            $networks[index] = network;
        }
        return $networks;
    })
}
