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

export class wToken {
  private readonly contract: Contract;

  constructor(contract: Contract) {
    this.contract = contract;
  }

  // baseToken uses 6 decimals
  // wToken uses 18 decimals
  public tokenToWToken(baseToken: BigInt) {
    return BigInt(Number(baseToken) * Math.pow(10, 12));
  }

  public async estimateGasDeposit(baseToken: BigInt) {
    const estimation = await this.contract.methods
      .deposit()
      .estimateGas({ value: this.tokenToWToken(baseToken) });

    return estimation;
  }

  public async estimateGasWithdraw(wTokens: BigInt) {
    const estimation = await this.contract.methods
      .withdraw(wTokens)
      .estimateGas();

    return estimation;
  }

  public async deposit(baseToken: BigInt) {
    const estimation = await this.estimateGasDeposit(baseToken);

    const result = await this.contract.methods.deposit().send({
      gas: estimation,
      value: this.tokenToWToken(baseToken),
    });

    return result as ITransactionResponse;
  }

  public async withdraw(wTokens: BigInt) {
    const estimation = await this.estimateGasWithdraw(wTokens);

    const result = await this.contract.methods.withdraw(wTokens).send({
      gas: estimation,
    });

    return result as ITransactionResponse;
  }

  public async balanceOf(walletAddr: string) {
    const result = await this.contract.methods.balanceOf(walletAddr).call();
    return result;
  }
}
