import type Web3 from 'web3';
import type { Contract } from 'web3-eth-contract';

export interface ITransactionResponse {
  blockHash: string;
  blockNumber: number;
  contractAddress: string;
  cumulativeGasUsed: number;
  from: string;
  gasUsed: number;
  logsBloom: string;
  status: boolean;
  to: string;
  transactionHash: string;
  transactionIndex: number;
  events: unknown;
}

export class wSMR {
  private readonly contract: Contract;

  constructor(contract: Contract) {
    this.contract = contract;
  }

  public toWSMRTokenUnit(smrTokens: number) {
    return smrTokens * Math.pow(10, 12);
  }

  public async estimateGas(smrTokens: number) {
    const estimation = await this.contract.methods
      .deposit()
      .estimateGas({ value: this.toWSMRTokenUnit(smrTokens) });

    return estimation;
  }

  public async deposit(smrTokens: number) {
    const estimation = await this.estimateGas(smrTokens);

    let result = await this.contract.methods.deposit().send({
      gas: estimation,
      value: this.toWSMRTokenUnit(smrTokens),
    });

    return result as ITransactionResponse;
  }
}
