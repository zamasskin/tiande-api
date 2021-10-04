import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { MarketingCampaignService } from 'src/marketing-campaign/marketing-campaign.service';
import { GetMarketingCampaignDto } from './dto/marketing_campaign.dto';
import { MarketingCampaign } from './entities/marketing_campaign.entity';
import { SellerGuard } from './seller.guard';

@ApiTags('Seller')
@ApiBearerAuth()
@UseGuards(new SellerGuard())
@Controller('seller/discount')
export class DiscountController {
  constructor(private marketingCampaignService: MarketingCampaignService) {}

  @Post()
  @ApiOperation({ summary: 'Get marketingCampaign' })
  @ApiOkResponse({ type: [MarketingCampaign] })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden.' })
  async getMarketingCampaign(
    @Body() getMarketingCampaignDto: GetMarketingCampaignDto,
  ): Promise<MarketingCampaign[]> {
    return this.marketingCampaignService.findList(getMarketingCampaignDto);
  }
}
