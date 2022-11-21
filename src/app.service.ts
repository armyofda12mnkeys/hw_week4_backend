import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import * as tokenJson from './assets/MyToken.json';
//import * as tokenJson from './assets/JC212/VoteToken.json';
import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
/*
export class CreatePaymentOrderDTO {
  value: number;
  secret: string;
}

export class RequestPaymentOrderDTO {
  id: number;
  secret: string;
  receiver: string;
}

export class PaymentOrder {
  value: number;
  id: number;
  secret: string;
}
*/

//const ERC20_VOTES_ADDRESS = '0x324c938062235e86dBF068AC2ede9211fE5f842f'; //Ryan's address not ours yet
//const ERC20VOTES_TOKEN_ADDRESS = '0x395061A11f4dAD5feCAfB44da775FC6C5229CEDd'; //0x8474E404fB31e0b3a94E0e570e3f75E69052a792 0x9E05990FBc73717C7F195fAD0177AD3B3b6A541a
//const TOKENIZED_BALLOT_CONTRACT = '0xb55dFf80EB5B2813061Be67da8C681cdC139EACc';

@Injectable()
export class AppService {
  provider: ethers.providers.BaseProvider;
  //erc20ContractFactory: ethers.ContractFactory;
  erc20Contract: ethers.Contract;
  //paymentOrders: PaymentOrder[];
  wallet: ethers.Wallet | undefined;
  signer: ethers.Wallet | undefined;

  constructor() {
    this.provider = ethers.getDefaultProvider('goerli', {
      alchemy: process.env.ALCHEMY_API_KEY,
      etherscan: process.env.ETHERSCAN_API_KEY,
    });
    this.wallet = new ethers.Wallet(process.env.MM_PRIVATE_KEY);
    this.signer = this.wallet.connect(this.provider);

    const erc20ContractFactory = new ethers.ContractFactory(
      tokenJson.abi,
      tokenJson.bytecode,
    );

    console.log(
      'ERC20VOTES_TOKEN_ADDRESS: ' +
        process.env.ERC20VOTES_TOKEN_ADDRESS +
        ', my key' +
        process.env.MM_PRIVATE_KEY,
    );
    this.erc20Contract = erc20ContractFactory
      .attach(process.env.ERC20VOTES_TOKEN_ADDRESS ?? '')
      .connect(this.provider);

    this.erc20Contract = new ethers.Contract(
      process.env.ERC20VOTES_TOKEN_ADDRESS,
      tokenJson.abi,
      this.signer,
    );
    //this.ballotContract = new ethers.Contract(BALLOT_TOKEN_ADDRESS, ballotJson.abi, this.signer);
    //const wallet = new ethers.Wallet(process.env.MM_PRIVATE_KEY ?? '');
    //const signer = ethers.Wallet.fromMnemonic(process.env.FROM_MEMONIC);

    //let wallet = new ethers.Wallet(process.env.MM_PRIVATE_KEY ?? "");
    //const signer = wallet.connect(provider);
    //this.paymentOrders = [];
  }

  getTokenAddress() {
    return process.env.ERC20VOTES_TOKEN_ADDRESS;
  }

  async requestTokens(body: any) {
    //return true;
    /*
    //const tokens_supply = await this.getTotalSupply();
    const totalSupply = await this.erc20Contract.totalSupply();
    const totalSupplyInt = parseFloat(ethers.utils.formatEther(totalSupply));
    console.log('total supply for this token is: ' + totalSupply);
    console.log('minting token(s) for: ' + body.address);
    return true;
    */

    const signer_balance = await this.signer.getBalance();
    console.log(
      'minting token(s) for: ' +
        body.address +
        ' with contract:' +
        process.env.ERC20VOTES_TOKEN_ADDRESS +
        '. signer has this much eth: ' +
        ethers.utils.formatEther(signer_balance),
    );

    const tx = await this.erc20Contract.mint(
      body.address,
      ethers.utils.parseEther('10'),
    ); //minting token

    await tx.wait();
    //return the transaction hash
    const tokenBalance = await this.getTokenBalance(body.address);
    console.log('done minting!');

    /*const delegateTx = await this.erc20Contract
      .connect(body.address)
      .delegate(body.address);
    await delegateTx.wait();*/ //not sure i can do this here as a user has to connect to delete and not nearly pass a string address

    return { hash: tx.hash, tokenBalance: tokenBalance };
  }

  async getTotalERCSupply() {
    const totalSupply = await this.erc20Contract.totalSupply();
    return parseFloat(ethers.utils.formatEther(totalSupply));
  }

  async getTokenBalance(address: string) {
    const balance = await this.erc20Contract
      .connect(address)
      .balanceOf(address);

    return parseFloat(ethers.utils.formatEther(balance));
  }

  /*
  
  getBlock(blockNumberOrTag = 'latest'): Promise<ethers.providers.Block> {
    return this.provider.getBlock(blockNumberOrTag);
  }

  async getTotalSupply(contractAddress: string): Promise<number> {
    const contractInstance = this.erc20ContractFactory
      //0x324c938062235e86dBF068AC2ede9211fE5f842f
      //0xDD4AAD77F7dE34563E174523294dE09E634A313e
      .attach(contractAddress) //Return an instance of a Contract attached to address. This is the same as using the Contract constructor with address and this the interface and signerOrProvider passed in when creating the ContractFactory.
      .connect(this.provider); //Returns a new instance of the ContractFactory with the same interface and bytecode, but with a different signer.
    const totalSupply = await contractInstance.totalSupply();
    return parseFloat(ethers.utils.formatEther(totalSupply));
  }

  async getAllowance(
    contractAddress: string,
    from: string,
    to: string,
  ): Promise<number> {
    //gets the allowance on a token contract, that a person (from) has given someone else (to)
    const contractInstance = this.erc20ContractFactory
      .attach(contractAddress)
      .connect(this.provider);
    const allowance = await contractInstance.allowance(from, to);
    return parseFloat(ethers.utils.formatEther(allowance));
  }

  getPaymentOrder(id: number) {
    const paymentOrder = this.paymentOrders[id];
    return { value: paymentOrder.value, id: paymentOrder.id };
  }

  createPaymentOrder(value: number, secret: string) {
    const newPaymentOrder = new PaymentOrder();
    newPaymentOrder.value = value;
    newPaymentOrder.secret = secret;
    newPaymentOrder.id = this.paymentOrders.length; //starts at 0
    this.paymentOrders.push(newPaymentOrder);
    return newPaymentOrder.id;
  }

  async requestPaymentOrder(id: number, secret: string, receiver: string) {
    const paymentOrder = this.paymentOrders[id];
    if (secret != paymentOrder.secret) throw new Error('WRONG SECRET');
    const signer = ethers.Wallet.createRandom().connect(this.provider);
    // this should be an address from your .env
    // you should put a key or seed in your .env that is minter at that contract
    // for using .env in nest look here: https://docs.nestjs.com/techniques/configuration
    const contractInstance = this.erc20ContractFactory
      .attach(process.env.SOME_TOKEN_ADDRESS_FROM_LECTURE)
      .connect(signer);
    const tx = await contractInstance.mint(receiver, paymentOrder.value); //minting token
    return tx.wait();
  }
  */
}
