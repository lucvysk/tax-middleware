import { ExternalClient, InstanceOptions, IOContext } from '@vtex/api'

export class TaxProvider2 extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    // The first argument is the base URl of your provider API endpoint
    super('baseURL', ctx, options)
  }

  public getTaxInformation(
    orderInformation: CheckoutRequest,
    taxIntegrated: any,
    gift: any
  ) {

    console.log(orderInformation,taxIntegrated,gift)
    
    if(gift) {

      const totalDiscounts = orderInformation.items.map( item => item.discountPrice).reduce((a:any, b:any) => a + b, 0) || 0;
      const total = orderInformation.totals.find( (tot: { name: string; }) => tot.name == 'Items Total')?.value || 0;
      //const shipping = orderInformation.totalizers.find( tot => tot.name == 'Shipping Total')?.value || 0;
      const giftCard =  gift.value || 0;

      // //const paymentData = orderInformation.paymentData;

      const percentageDiscount = Math.abs(totalDiscounts) / total

      //const totalAdjusted = ((total - giftCard) * ((1-percentageDiscount))) + shipping;

      const adjust = giftCard ? giftCard * (1 - (1 - percentageDiscount)) || 0 : 0

      console.log(`totalDiscounts ${totalDiscounts} total: ${total}`, `percentageDiscount; ${percentageDiscount}`, `giftCard: ${giftCard}`, `adjust: ${adjust}`)

      taxIntegrated.itemTaxResponse[0].taxes.push({
        name: 'DiscountAdjust@custom',
        description: 'Testttt 2',
        value: adjust,
      })

      
    } 

    return taxIntegrated.itemTaxResponse
    
    return [
      {
        id: '0',
        taxes: [
          {
            name: 'DiscountAdjust@custom',
            value: 20,
          },
        ],
      },
    ]
  }
}
