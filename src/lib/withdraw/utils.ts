import type { IEd25519Address, SingleNodeClient } from '@iota/iota.js';
import {
  Bech32Helper,
  type IAliasAddress,
  Ed25519Seed,
  Ed25519Address,
  ED25519_ADDRESS_TYPE,
} from '@iota/iota.js';
import { Converter } from '@iota/util.js';
import { Bip32Path, Bip39 } from "@iota/crypto.js";
import type { INativeToken } from '$lib/native-token';
import { IotaWallet } from '$lib/faucet';

export function randomBech32Address(bech32Hrp: string) {
  const randomMnemonic = Bip39.randomMnemonic();
  const keyPair = IotaWallet.getKeyPairFromMnemonic(randomMnemonic);
  const address = new Ed25519Address(keyPair.publicKey);
  return Bech32Helper.toBech32(ED25519_ADDRESS_TYPE, address.toAddress(), bech32Hrp)
}


export function getBalanceParameters(agentID: Uint8Array) {
  return {
    items: [
      {
        key: Converter.utf8ToBytes('a'),
        value: agentID,
      },
    ],
  };
}

export async function withdrawParameters(
  nodeClient: SingleNodeClient,
  receiverAddressBech32: string,
  baseTokensToWithdraw: number,
  nativeTokens: INativeToken[],
  nftID?: string,
) {
  const binaryAddress = await waspAddrBinaryFromBech32(
    nodeClient,
    receiverAddressBech32,
  );

  /*
    NativeToken[]:
      ID: Tuple[tokenID(string)] (Not just `ID: tokenID`)
      amount: uint256
  */
  const nativeTokenTuple = nativeTokens.map(x => ({
    ID: [x.id],
    amount: x.amount,
  }));

  const nftIDParam = [];
  if (nftID) {
    nftIDParam.push(nftID);
  }

  const parameters = [
    {
      // Receiver
      data: binaryAddress,
    },
    {
      // Fungible Tokens
      // convert to 6 decimals as ISCMagic contract's send() function accepts only uint64
      baseTokens: parseInt(String(baseTokensToWithdraw/10**12)), // baseTokensToWithdraw,
      nativeTokens: nativeTokenTuple,
      nfts: nftIDParam,
    },
    false,
    {
      // Metadata
      targetContract: 0,
      entrypoint: 0,
      gasBudget: 0,
      params: {
        items: [],
      },
      allowance: {
        baseTokens: 0,
        nativeTokens: [],
        nfts: [],
      },
    },
    {
      // Options
      timelock: 0,
      expiration: {
        time: 0,
        returnAddress: {
          data: [],
        },
      },
    },
  ];

  return parameters;
}

export async function waspAddrBinaryFromBech32(
  nodeClient: SingleNodeClient,
  bech32String: string,
) {
  const protocolInfo = await nodeClient.info();
  const receiverAddr = Bech32Helper.addressFromBech32(
    bech32String,
    protocolInfo.protocol.bech32Hrp,
  );
  const address = receiverAddr;
  if ((address as IEd25519Address).pubKeyHash) {
    //  // AddressEd25519 denotes an Ed25519 address.
    // AddressEd25519 AddressType = 0
    // // AddressAlias denotes an Alias address.
    // AddressAlias AddressType = 8
    // // AddressNFT denotes an NFT address.
    // AddressNFT AddressType = 16
    //
    // 0 is the ed25519 prefix
    const receiverAddrBinary = Converter.hexToBytes((address as IEd25519Address).pubKeyHash);
    return new Uint8Array([0, ...receiverAddrBinary]);
  }
  const receiverAddrBinary = Converter.hexToBytes((address as IAliasAddress).aliasId);
  return new Uint8Array(receiverAddrBinary);
}
