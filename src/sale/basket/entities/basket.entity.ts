import 'reflect-metadata';
import { Expose, Type } from 'class-transformer';
import { serialize, unserialize } from 'php-serialize';

export class BasketEntity {
  @Type(() => Number)
  @Expose({ name: 'ID' })
  id?: number;

  @Type(() => Number)
  @Expose({ name: 'ORDER_ID' })
  orderId?: number;

  @Type(() => Number)
  @Expose({ name: 'FUSER_ID' })
  guestId: number;

  @Type(() => Number)
  @Expose({ name: 'PRODUCT_ID' })
  productId: number;

  @Type(() => Number)
  @Expose({ name: 'PRODUCT_PRICE_ID' })
  priceId = 0;

  @Type(() => Number)
  @Expose({ name: 'PRICE' })
  price = 0.0;

  @Type(() => Number)
  @Expose({ name: 'PROMOTION_GIFT_ID' })
  giftId?: number;

  @Type(() => Number)
  @Expose({ name: 'PRICE_BAL' })
  priceBal = 0.0;

  @Type(() => Number)
  @Expose({ name: 'PRICE_OLD' })
  oldPrice = 0.0;

  @Type(() => Number)
  @Expose({ name: 'PRICE_PROMO' })
  pricePromo = 0.0;

  @Type(() => Number)
  @Expose({ name: 'DISCOUNT_PRICE' })
  discountPrice = 0.0;

  @Expose({ name: 'DISCOUNT_NAME' })
  discountName = '';

  @Type(() => Number)
  @Expose({ name: 'DISCOUNT_VALUE' })
  discountValue = 0;

  @Expose({ name: 'DISCOUNT_COUPON' })
  coupon = '';

  @Type(() => Number)
  @Expose({ name: 'ADDITIONAL_DISCOUNT' })
  additionalDiscount = 0;

  @Type(() => Number)
  @Expose({ name: 'QUANTITY' })
  quantity = 1;

  @Expose({ name: 'SUM_BAL' })
  get sumBal() {
    return this.quantity * this.priceBal;
  }

  @Expose({ name: 'CURRENCY' })
  currency: string;

  @Type(() => Date)
  @Expose({ name: 'DATE_INSERT' })
  dateInsert: Date = new Date();

  @Type(() => Date)
  @Expose({ name: 'DATE_UPDATE' })
  dateUpdate: Date = new Date();

  @Expose({ name: 'LID' })
  lid = 's1';

  @Expose({ name: 'DELAY' })
  _delay = 'N';
  get delay() {
    return this._delay === 'Y';
  }
  set delay(delay: Boolean) {
    this._delay = delay ? 'Y' : 'N';
  }

  @Expose({ name: 'CAN_BUY' })
  _canBay = 'Y';
  get canBay() {
    return this._canBay === 'Y';
  }
  set canBay(canBay: Boolean) {
    this._canBay = canBay ? 'Y' : 'N';
  }

  @Expose({ name: 'MODULE' })
  module = 'sale';

  @Expose({ name: 'CALLBACK_FUNC' })
  callFunc = 'GetProductData';

  @Expose({ name: 'NOTES' })
  notes = 'Добавлено в апи';

  @Expose({ name: 'DETAIL_PAGE_URL' })
  productUrl: string;

  @Expose({ name: 'PRODUCT_PROVIDER_CLASS' })
  productProviderClass = 'BITCatalogProductProvider';

  @Type(() => Number)
  @Expose({ name: 'PROMO_LOYALTY' })
  promoLoyalty = 0;
  get isLoyalty() {
    return !!this.promoLoyalty;
  }
  set isLoyalty(loyalty: boolean) {
    this.promoLoyalty = Number(loyalty);
  }

  @Expose({ name: 'COMPOSITION_SKU' })
  _scu: string;
  get sku() {
    if (this._scu) {
      return unserialize(this._scu || '') || false;
    }
    return false;
  }
  set sku(value: any) {
    this._scu = serialize(value);
  }

  @Expose({ name: 'DIMENSIONS' })
  _dimensions =
    'a:3:{s:5:"WIDTH";s:1:"0";s:6:"HEIGHT";s:1:"0";s:6:"LENGTH";s:1:"0";}';
  get dimensions() {
    if (this._dimensions) {
      return unserialize(this._dimensions || '') || false;
    }
    return false;
  }
  set dimensions(dimensions: any) {
    this._dimensions = serialize(dimensions);
  }

  @Type(() => Number)
  @Expose({ name: 'MARKETING_CAMPAIGN_ID' })
  marketingCampaignId = 0;
}
