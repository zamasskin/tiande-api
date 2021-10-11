import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { StocksService } from 'src/stocks/stocks.service';
import { GetMarketingCampaignDto } from './dto/marketing_campaign.dto';
import { Gift } from './entities/gift.entity';
import { MarketingCampaign } from './entities/marketing_campaign.entity';
import { SellerGuard } from '../seller.guard';

@ApiTags('Seller')
@ApiBearerAuth()
@UseGuards(SellerGuard)
@Controller('seller/stock')
export class DiscountController {
  constructor(private stockService: StocksService) {}

  @Post('/marketing-campaign')
  @ApiOperation({ summary: 'Get marketingCampaign' })
  @ApiOkResponse({ type: [MarketingCampaign] })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden.' })
  async getMarketingCampaign(
    @Body() getMarketingCampaignDto: GetMarketingCampaignDto,
  ): Promise<MarketingCampaign[]> {
    return this.stockService.findMarketingCampaignList(getMarketingCampaignDto);
  }

  @Post('/gifts')
  @ApiOperation({ summary: 'Get gufts' })
  @ApiOkResponse({ type: [Gift] })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden.' })
  async getGifts(
    @Body() getMarketingCampaignDto: GetMarketingCampaignDto,
  ): Promise<Gift[]> {
    return this.stockService.findGiftList(getMarketingCampaignDto);
  }
}
