import { ExternalClient, InstanceOptions, IOContext } from '@vtex/api'

export class DiscountAdjustment extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    // The first argument is the base URl of your provider API endpoint
    super('baseURL', ctx, options)
  }

  public getDiscountAdjustment(
    orderInformation: any,
    giftCards: string,
    promoId: any
  ) {
    
    if(orderInformation) {
      //const totalDiscounts = orderInformation.totalizers.find( (tot: { name: string; }) => tot.name == 'Discounts Total')?.value || 0;
      //const total = orderInformation.totalizers.find( (tot: { name: string; }) => tot.name == 'Items Total')?.value || 0;
      //const shipping = orderInformation.totalizers.find( tot => tot.name == 'Shipping Total')?.value || 0;
      
      const giftCardsProvidersArray = giftCards.split(',').map(provider => provider.trim());
      const giftCardsSum = orderInformation.paymentData?.giftCards?.filter((card: { provider: string; }) => giftCardsProvidersArray.includes(card.provider)).reduce((acc: any, card: { value: any; }) => acc + card.value, 0);

      const giftCard =  giftCardsSum || 0;

      
      //const percentageDiscount = Math.abs(totalDiscounts) / total
      //const adjust = giftCard ? giftCard * (1 - (1 - percentageDiscount)) || 0 : 0; // Old Formula by @Higa


      const vipItems = orderInformation.items.filter( (item:any) => 
        item.priceTags.some( (tag:any) => tag.identifier === promoId)
      );

      const totalPriceVipItems = vipItems.reduce((sum: any, item: { sellingPrice: any; }) => sum + item.sellingPrice, 0);
      const totalListPriceVipItems = vipItems.reduce((sum: any, item: { listPrice: any; }) => sum + item.listPrice, 0);

      const nonVipItems = orderInformation.items.filter( (item:any) => 
        !item.priceTags.some( (tag:any) => tag.identifier === promoId)
      );
      const totalPriceNonVipItems = nonVipItems.reduce((sum: any, item: { sellingPrice: any; }) => sum + item.sellingPrice, 0);

      const totalMath1 = ( (totalPriceVipItems-giftCard)*(totalPriceVipItems/totalListPriceVipItems) ) + totalPriceNonVipItems
      const totalMath2 = ( (totalPriceVipItems*(totalPriceVipItems/totalListPriceVipItems)-giftCard) ) + totalPriceNonVipItems
      const adjust = totalMath1 > totalMath2 ? totalMath1 - totalMath2 : 0

      // console.log( `
      //   totalPriceVipItems: ${totalPriceVipItems},
      //   totalListPriceVipItems: ${totalListPriceVipItems},
      //   discounts VIP itens: ${totalPriceVipItems/totalListPriceVipItems},
      //   totalPriceNonVipItems: ${totalPriceNonVipItems},
      //   giftCard: ${giftCard},
      //   totalMath1: ${totalMath1},
      //   totalMath2: ${totalMath2},
      //   adjust: ${adjust},
      // `)
      //console.log(`totalDiscounts ${totalDiscounts} total: ${total}`, `percentageDiscount; ${percentageDiscount}`, `giftCard: ${giftCard}, totalVipItems: ${totalPriceVipItems}`)



      return adjust/100

      
    } 

    return null
    
  }
}
//https://vysk--roadrunnersportsqa.myvtex.com/checkout/cart/add/?sku=994&qty=1&seller=rrsaqarlington&sc=1&sku=4&qty=1&seller=1&sc=1&sku=509352&qty=1&seller=1&sc=1