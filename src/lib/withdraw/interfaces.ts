import type { SetIntervalAsyncTimer } from 'set-interval-async';
import type { Contract } from 'web3-eth-contract';

import type { ISCMagic } from '$lib/iscmagic';
import type { WSMR } from '$lib/wsmr';
import type { INativeToken } from '$lib/native-token';
import type { INFT } from '$lib/nft';

export interface WithdrawState {
  /**
   * The current available base token balance of the user.
   */
  availableBaseTokens: number;

  /**
   * The current available native tokens and balance of the user.
   */
  availableNativeTokens: INativeToken[];

  /**
   * The current available NFTs of the user.
   */
  availableNFTs: INFT[];

  /**
   * The reference to the ISC magic contract used for contract invocations.
   */
  contract: Contract;

  /**
   * The reference to the wSMR contract used for contract invocations.
   */
  contractWSMR?: Contract;

  /**
   * The ISC Magic connector.
   */
  iscMagic?: ISCMagic;

  /**
   * The wSMR connector.
   */
  wsmrContractObj?: WSMR;

  /**
   * The EVM chain ID.
   */
  evmChainID: number;

  /**
   * Whether or not Metamask is connected to the page.
   */
  isMetamaskConnected: boolean;

  /**
   * Whether or not the page is loading (Getting initial balance, connecting to wallet, initializing contract, ..)
   */
  isLoading: boolean;

  /**
   * The handle of the async balance polling interval.
   */
  balancePollingHandle: SetIntervalAsyncTimer<[]>;
}

export interface WithdrawFormInput {
  /**
   * [Form] The address to send funds to
   */
  receiverAddress: string;

  /**
   * [Form] The amount of base tokens to send.
   */
  baseTokensToSend: number;

  /**
   * [Form] A map of native tokens to send.
   */
  nativeTokensToSend: { [key: string]: number };

  /**
   * [Form] Any NFT to send.
   */
  nftIDToSend: string | null;
}

export interface INativeTokenWithdraw {
  /**
   * Identifier of the native token.
   */
  ID: string;
  /**
   * Amount of native tokens of the given Token ID.
   */
  amount: bigint;
}
