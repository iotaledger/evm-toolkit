import { Blake2b } from '@iota/crypto.js';
import {
  ADDRESS_UNLOCK_CONDITION_TYPE,
  BASIC_OUTPUT_TYPE,
  Bech32Helper,
  DEFAULT_PROTOCOL_VERSION,
  ED25519_ADDRESS_TYPE,
  ED25519_SIGNATURE_TYPE,
  METADATA_FEATURE_TYPE,
  SENDER_FEATURE_TYPE,
  serializeTransactionEssence,
  SIGNATURE_UNLOCK_TYPE,
  TransactionHelper,
  TRANSACTION_ESSENCE_TYPE,
  TRANSACTION_PAYLOAD_TYPE,
  type IBasicOutput,
  type IBlock,
  type ITransactionEssence,
  type ITransactionPayload,
  type IUTXOInput,
  type UnlockTypes,
} from '@iota/iota.js';
import { Converter, WriteStream } from '@iota/util.js';
import type { IotaWallet } from './';
// eslint-disable-next-line import/no-unresolved
import { SimpleBufferCursor } from '$lib/simple-buffer-cursor';
import { evmAddressToAgentID } from '$lib/iscmagic';
import { nodeClient } from '$lib/evm-toolkit';
import { get } from 'svelte/store';

export class SendFundsTransaction {
  private wallet: IotaWallet;

  constructor(client: IotaWallet) {
    this.wallet = client;
  }

  private async createSendFundsMetadata(
    evmAddress: string,
    amount: bigint,
    gas: bigint,
  ) {
    const metadata = new SimpleBufferCursor();

    /* Write contract meta data */
    metadata.writeUInt8(0); // nil sender contract
    metadata.writeUInt32LE(0x3c4b5e02); // "accounts"
    metadata.writeUInt32LE(0x23f4e3a1); // "transferAllowanceTo"
    metadata.writeUInt64SpecialEncoding(gas); // gas

    /* Write length of contract arguments (1) */
    metadata.writeUInt32SpecialEncoding(1);
    
    /* Create evm address buffer */
    const evmAddressToAgentIdBuffer = await evmAddressToAgentID(evmAddress);

    // Write evm address (arg1)
    metadata.writeUInt32SpecialEncoding(1);// Length of key (len(a) == 1)
    metadata.writeInt8('a'.charCodeAt(0)); // Write key (a == 'agentID')
    metadata.writeUInt32SpecialEncoding(evmAddressToAgentIdBuffer.length); // Length
    metadata.writeUint8Array(evmAddressToAgentIdBuffer); //  Write value (bytes(agentID))

    /* Write allowance */
    // see https://github.com/iotaledger/wasp/blob/12845adea4fc097813a30a061853af4a43407d3c/packages/isc/assets.go#L348-L356 
    metadata.writeUInt8(128); // 0x80 flag meaning there are native tokens in the allowance
    metadata.writeUInt64SpecialEncoding(amount - gas); // IOTA amount to send
    console.log(metadata.buffer.toString('hex'))
    return metadata.buffer;
  }

  public async sendFundsToEVMAddress(
    evmAddress: string,
    chainId: string,
    amount: bigint,
    gas: bigint,
  ): Promise<void> {
    const addressHex = Converter.bytesToHex(
      this.wallet.address.toAddress(),
      true,
    );
    const addressBech32 = Bech32Helper.toBech32(
      ED25519_ADDRESS_TYPE,
      this.wallet.address.toAddress(),
      this.wallet.nodeInfo.protocol.bech32Hrp,
    );

    const chainAddress = Bech32Helper.addressFromBech32(
      chainId,
      this.wallet.nodeInfo.protocol.bech32Hrp,
    );

    const outputs = await this.wallet.indexer.basicOutputs({
      addressBech32: addressBech32,
    });

    if (outputs.items.length == 0) {
      throw new Error('Could not find outputs to consume');
    }

    const outputId = outputs.items[0];
    const output = await this.wallet.client.output(outputId);

    if (output == null) {
      throw new Error('Could not fetch output data');
    }

    const metadata = await this.createSendFundsMetadata(evmAddress, amount, gas);
    const metadataHex = Converter.bytesToHex(metadata, true);

    const basicOutput: IBasicOutput = {
      type: BASIC_OUTPUT_TYPE,
      amount: amount.toString(),
      nativeTokens: [
        // Add a list native tokens here
      ],
      unlockConditions: [
        {
          type: ADDRESS_UNLOCK_CONDITION_TYPE,
          address: chainAddress,
        },
      ],
      features: [
        {
          type: SENDER_FEATURE_TYPE,
          address: {
            type: ED25519_ADDRESS_TYPE,
            pubKeyHash: addressHex,
          },
        },
        {
          type: METADATA_FEATURE_TYPE,
          data: metadataHex,
        },
      ],
    };

    const storageDeposit = TransactionHelper.getStorageDeposit(
      basicOutput,
      this.wallet.nodeInfo.protocol.rentStructure,
    );
    amount = amount - BigInt(storageDeposit);
    basicOutput.amount = amount.toString();

    const remainderBasicOutput: IBasicOutput = {
      type: BASIC_OUTPUT_TYPE,
      amount: (BigInt(output.output.amount) - amount).toString(),
      nativeTokens: [],
      unlockConditions: [
        {
          type: ADDRESS_UNLOCK_CONDITION_TYPE,
          address: {
            type: ED25519_ADDRESS_TYPE,
            pubKeyHash: addressHex,
          },
        },
      ],
      features: [],
    };

    const input: IUTXOInput = TransactionHelper.inputFromOutputId(outputId);
    const inputsCommitment = TransactionHelper.getInputsCommitment([
      output.output,
    ]);
    const protocolInfo = await this.wallet.client.protocolInfo();

    const transactionEssence: ITransactionEssence = {
      type: TRANSACTION_ESSENCE_TYPE,
      networkId: TransactionHelper.networkIdFromNetworkName(
        protocolInfo.networkName,
      ),
      inputs: [input],
      inputsCommitment,
      outputs: [basicOutput, remainderBasicOutput],
      payload: undefined,
    };

    const wsTsxEssence = new WriteStream();
    serializeTransactionEssence(wsTsxEssence, transactionEssence);
    const essenceFinal = wsTsxEssence.finalBytes();
    const essenceHash = Blake2b.sum256(essenceFinal);

    const unlockCondition: UnlockTypes = {
      type: SIGNATURE_UNLOCK_TYPE,
      signature: {
        type: ED25519_SIGNATURE_TYPE,
        publicKey: Converter.bytesToHex(this.wallet.publicKey, true),
        signature: Converter.bytesToHex(this.wallet.sign(essenceHash), true),
      },
    };

    const transactionPayload: ITransactionPayload = {
      type: TRANSACTION_PAYLOAD_TYPE,
      essence: transactionEssence,
      unlocks: [unlockCondition],
    };

    const block: IBlock = {
      protocolVersion: DEFAULT_PROTOCOL_VERSION,
      parents: [],
      payload: transactionPayload,
      nonce: '0',
    };

    await this.wallet.client.blockSubmit(block);
  }
}
