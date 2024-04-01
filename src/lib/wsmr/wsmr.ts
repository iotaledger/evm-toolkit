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

  public async estimateGasDeposit(smrTokens: BigInt) {
    const estimation = await this.contract.methods
      .deposit()
      .estimateGas({ value: smrTokens });

    return estimation;
  }

  public async estimateGasWithdraw(wsmrTokens: BigInt) {
    const estimation = await this.contract.methods
      .withdraw(wsmrTokens)
      .estimateGas();

    return estimation;
  }

  public async deposit(smrTokens: BigInt) {
    const estimation = await this.estimateGasDeposit(smrTokens);

    const result = await this.contract.methods.deposit().send({
      gas: estimation,
      value: smrTokens,
    });

    return result as ITransactionResponse;
  }

  public async withdraw(wsmrTokens: BigInt) {
    const estimation = await this.estimateGasWithdraw(wsmrTokens);

    const result = await this.contract.methods.withdraw(wsmrTokens).send({
      gas: estimation,
    });

    return result as ITransactionResponse;
  }

  public async balanceOf(walletAddr: string) {
    const result = await this.contract.methods.balanceOf(walletAddr).call();
    return result;
  }
}
