import { derived, type Readable } from 'svelte/store';
import { APP_CONFIGURATIONS } from '../constants';
import { ChainReference } from '../enums';
import type { IAppConfiguration } from '../interfaces';
import { selectedNetwork } from './';

export const appConfiguration: Readable<IAppConfiguration> = derived(selectedNetwork, ($selectedNetwork) => {
    if (!$selectedNetwork) {
        return null;
    }
    return APP_CONFIGURATIONS[$selectedNetwork.chainRef ?? ChainReference.ShimmerEVM];
})
