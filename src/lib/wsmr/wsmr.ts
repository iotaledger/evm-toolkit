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

  // smrTokens use 6 decimals
  // wSMR tokens use 18 decimals
  public smrToWSMRToken(smrTokens: BigInt) {
    return BigInt(Number(smrTokens) * Math.pow(10, 12));
  }

  public async estimateGasDeposit(smrTokens: BigInt) {
    const estimation = await this.contract.methods
      .deposit()
      .estimateGas({ value: this.smrToWSMRToken(smrTokens) });

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
      value: this.smrToWSMRToken(smrTokens),
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
