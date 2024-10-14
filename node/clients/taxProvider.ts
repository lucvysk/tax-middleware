import { ExternalClient, InstanceOptions, IOContext } from '@vtex/api'

export class TaxProvider extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    // The first argument is the base URl of your provider API endpoint
    super('baseURL', ctx, options)
  }

  public getTaxInformation(
    orderInformation: any,
    taxIntegrated: any,
    giftCards: string
  ) {
    console.log(`orderInformation`,orderInformation)
    
    if(orderInformation) {
      const totalDiscounts = orderInformation.totalizers.find( (tot: { name: string; }) => tot.name == 'Discounts Total')?.value || 0;
      const total = orderInformation.totalizers.find( (tot: { name: string; }) => tot.name == 'Items Total')?.value || 0;
      //const shipping = orderInformation.totalizers.find( tot => tot.name == 'Shipping Total')?.value || 0;
      
      const giftCardsProvidersArray = giftCards.split(',').map(provider => provider.trim());
      const giftCardsSum = orderInformation.paymentData?.giftCards?.filter((card: { provider: string; }) => giftCardsProvidersArray.includes(card.provider)).reduce((acc: any, card: { value: any; }) => acc + card.value, 0);

      const giftCard =  giftCardsSum || 0;

      const percentageDiscount = Math.abs(totalDiscounts) / total

      //const totalAdjusted = ((total - giftCard) * ((1-percentageDiscount))) + shipping;
      const adjust = giftCard ? giftCard * (1 - (1 - percentageDiscount)) || 0 : 0

      //console.log(`totalDiscounts ${totalDiscounts} total: ${total}`, `percentageDiscount; ${percentageDiscount}`, `giftCard: ${giftCard}`, `adjust: ${adjust/100}`)

      // taxIntegrated.itemTaxResponse[0].taxes.push({
      //   name: 'DiscountAdjust@custom',
      //   description: 'Promo Adjustment',
      //   value: adjust / 100,
      // })

      console.log(`adjust`,adjust)

      if(adjust) {
        taxIntegrated.itemTaxResponse.map((prodTax: any) => {
          prodTax.taxes.push({
            name: 'DiscountAdjust@custom',
            description: 'Promo Adjustment',
            value: adjust / orderInformation.items.length / 100,
          })
          return prodTax
        })
      }
      
    } 

    return taxIntegrated.itemTaxResponse
    
  }
}
