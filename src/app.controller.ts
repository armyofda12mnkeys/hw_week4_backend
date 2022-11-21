import { Controller, Get, Param } from '@nestjs/common';
import { Post } from '@nestjs/common/decorators';
import { Body } from '@nestjs/common/decorators';
import { Query } from '@nestjs/common/decorators';
import { ethers } from 'ethers';
import {
  AppService,
  //CreatePaymentOrderDTO,
  //PaymentOrder,
  //RequestPaymentOrderDTO,
} from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('token-address')
  getTokenAddress() {
    return { result: this.appService.getTokenAddress() };
  }

  @Post('request-tokens')
  requestTokens(@Body() body) {
    return this.appService.requestTokens(body);
  }

  @Get('total-erc20-supply')
  getTotalSupply(): Promise<number> {
    return this.appService.getTotalERCSupply();
  }

  @Get('get-token-balance/:address')
  getTokenBalance(@Param('address') address: string) {
    return this.appService.getTokenBalance(address);
  }

  /*
  @Get('last-block')
  getLastBlock(): Promise<ethers.providers.Block> {
    return this.appService.getBlock();
  }

  @Get('block/:hash')
  getBlock(@Param('hash') hash: string): Promise<ethers.providers.Block> {
    return this.appService.getBlock(hash);
  }

  @Get('total-supply/:address')
  getTotalSupply(@Param('address') address: string): Promise<number> {
    return this.appService.getTotalSupply(address);
  }

  @Get('allowance')
  getAllowance(
    //no need to specify /allowance/:address/:from/:to, will use query params instead
    @Query('address') address: string, //will use /allowance?address=XXX&from=YYY&to=ZZZ
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<number> {
    return this.appService.getAllowance(address, from, to);
  }

  @Get('payment-order/:id')
  getPaymentOrder(@Param('id') id: number): any {
    return this.appService.getPaymentOrder(id);
  }

  @Post('payment-order')
  createPaymentOrder(@Body() body: CreatePaymentOrderDTO): number {
    return this.appService.createPaymentOrder(body.value, body.secret);
  }

  @Post('request-payment')
  requestPaymentOrder(@Body() body: RequestPaymentOrderDTO): Promise<any> {
    return this.appService.requestPaymentOrder(
      body.id,
      body.secret,
      body.receiver,
    );
  }
  */
}
