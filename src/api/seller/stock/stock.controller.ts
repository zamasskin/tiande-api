import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { StocksService } from 'src/stocks/stocks.service';
import {
  GetMarketingCampaignDto,
  GetMarketingCampaignDtoByPromoCode,
} from './dto/marketing_campaign.dto';
import { Gift } from './entities/gift.entity';
import { MarketingCampaign } from './entities/marketing_campaign.entity';
import { SellerGuard } from '../seller.guard';
import { StockList } from './entities/stock_list.entity';
import {
  MarketingCampaignBasketCodeParamsDto,
  MarketingCampaignBasketDto,
} from './dto/marketing-campaign-basket.dto';

@ApiTags('Seller')
@ApiBearerAuth()
@UseGuards(SellerGuard)
@Controller('seller/v1/stock')
export class StockController {
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

  @Post('/marketing-campaign-by-promocode')
  @ApiOperation({ summary: 'Get marketingCampaign by promoCode' })
  @ApiOkResponse({ type: [MarketingCampaign] })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden.' })
  async getMarketingCampaignByPromoCode(
    @Body() getMarketingCampaignDto: GetMarketingCampaignDtoByPromoCode,
  ) {
    const { promoCode } = getMarketingCampaignDto;
    return this.stockService.findMarketingCampaignListByPromoCode(
      getMarketingCampaignDto,
      promoCode,
    );
  }

  @Post('/gifts')
  @ApiOperation({ summary: 'Get gifts' })
  @ApiOkResponse({ type: [Gift] })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden.' })
  async getGifts(
    @Body() getMarketingCampaignDto: GetMarketingCampaignDto,
  ): Promise<Gift[]> {
    return this.stockService.findGiftList(getMarketingCampaignDto);
  }

  @Post('/list')
  @ApiOperation({ summary: 'Get marketingCampaign and gifts' })
  @ApiOkResponse({ type: [StockList] })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden.' })
  async getList(
    @Body() getMarketingCampaignDto: GetMarketingCampaignDto,
  ): Promise<StockList[]> {
    return this.stockService.findList(getMarketingCampaignDto);
  }

  @Post('/marketing-campaign/add-basket')
  @ApiOperation({ summary: 'Set Basket' })
  @ApiOkResponse({ type: Number })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden.' })
  async addMarketingCampaign(
    @Body() dto: MarketingCampaignBasketDto,
  ): Promise<number> {
    try {
      const result = await this.stockService.marketingCampaignAddBasket(dto);
      return result;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('/marketing-campaign/add-basket-by-promocode')
  @ApiOperation({ summary: 'Set basket by promoCode' })
  @ApiOkResponse({ type: Boolean })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden.' })
  async addMarketingCampaignByPromoCode(
    @Body() dto: MarketingCampaignBasketCodeParamsDto,
  ) {
    return this.stockService.marketingCampaignAddBasketByPromoCode(dto);
  }

  @Post('/marketing-campaign/check-basket')
  @ApiOperation({ summary: 'Check basket' })
  @ApiOkResponse({ type: Boolean })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden.' })
  async checkMarketingCampaign(
    @Body() getMarketingCampaignDto: GetMarketingCampaignDto,
  ): Promise<Boolean> {
    await this.stockService.marketingCampaignBasketCheckAndUpdate(
      getMarketingCampaignDto,
    );
    return true;
  }

  @Post('/marketing-campaign/check-basket-background')
  @ApiOperation({ summary: 'Check basket' })
  @ApiOkResponse()
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden.' })
  checkMarketingCampaignBackground(
    @Body() getMarketingCampaignDto: GetMarketingCampaignDto,
  ) {
    this.stockService
      .marketingCampaignBasketCheckAndUpdate(getMarketingCampaignDto)
      .then()
      .catch();
  }
}
