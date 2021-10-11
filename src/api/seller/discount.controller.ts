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
import { MarketingCampaign } from './entities/marketing_campaign.entity';
import { SellerGuard } from './seller.guard';

@ApiTags('Seller')
@ApiBearerAuth()
@UseGuards(SellerGuard)
@Controller('seller/discount')
export class DiscountController {
  constructor(private stockService: StocksService) {}

  @Post()
  @ApiOperation({ summary: 'Get marketingCampaign' })
  @ApiOkResponse({ type: [MarketingCampaign] })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden.' })
  async getMarketingCampaign(
    @Body() getMarketingCampaignDto: GetMarketingCampaignDto,
  ): Promise<MarketingCampaign[]> {
    return this.stockService.findMarketingCampaignList(getMarketingCampaignDto);
  }
}
