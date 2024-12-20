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
      const total = orderInformation.totalizers.find( (tot: { name: string; }) => tot.name == 'Items Total')?.value || 0;
      //const shipping = orderInformation.totalizers.find( tot => tot.name == 'Shipping Total')?.value || 0;
      
      const giftCardsProvidersArray = giftCards.split(',').map(provider => provider.trim());
      const giftCardsSum = orderInformation.paymentData?.giftCards?.filter((card: { provider: string; }) => giftCardsProvidersArray.includes(card.provider)).reduce((acc: any, card: { value: any; }) => acc + card.value, 0);

      const giftCard =  giftCardsSum || 0;

      
      //const percentageDiscount = Math.abs(totalDiscounts) / total
      //const adjust = giftCard ? giftCard * (1 - (1 - percentageDiscount)) || 0 : 0; // Old Formula by @Higa


      const vipItems = orderInformation.items.filter( (item:any) => 
        item.priceTags.some( (tag:any) => promoId.includes(tag.identifier))
      );
      const nonVipItems = orderInformation.items.filter( (item:any) => 
        !item.priceTags.some( (tag:any) => promoId.includes(tag.identifier))
      );


      // const promosApplied = orderInformation.items.map( (item : any) => {

      //   let price = (item.price/100) * item.quantity;
        

      //   const pricet = item.priceTags
      //       .filter((tag : any) => ~tag.name.indexOf(`discount@price`))
      //       .map((tag : any)  => {
      //       const percentage = (Math.abs(tag.rawValue) / (price) ) * 100;
      //       price = price + tag.rawValue;
      //       return {
      //           identifier: tag.identifier,
      //           percentage: percentage.toFixed(2) 
      //       }
        
      //   })
    
      //   return pricet.length ? pricet[0] : false
    
      // })

  

      const totalPriceVipItems = vipItems?.reduce((sum: any, item: { sellingPrice: any; quantity: any }) => sum + item.sellingPrice * item.quantity, 0);
      const totalListPriceVipItems = vipItems?.reduce((sum: any, item: { listPrice: any; quantity: any }) => sum + item.listPrice * item.quantity, 0);

      const totalPriceNonVipItems = nonVipItems?.reduce((sum: any, item: { sellingPrice: any; }) => sum + item.sellingPrice, 0);

      const totalVipDiscounts = vipItems.reduce((total:any, item: any) => {
        const discountSum = item.priceTags
            .filter((tag: any) => promoId.includes(tag.identifier))
            .reduce((sum: number, tag: any) => sum + tag.rawValue, 0);
    
        return total + discountSum;
      }, 0);

      const totalNonVipDiscounts = vipItems.reduce((total:any, item: any) => {
        const discountSum = item.priceTags
            .filter((tag: any) => !promoId.includes(tag.identifier) && ~tag.name.indexOf(`discount@price`))
            .reduce((sum: number, tag: any) => sum + tag.rawValue, 0);
        return total + discountSum;
      }, 0);

      const percetagelNonVipDiscounts = (Math.abs(totalNonVipDiscounts) / ((total/100)  - Math.abs(totalVipDiscounts) ))*100;
      const percetagelVipDiscounts = Math.abs(totalVipDiscounts*100) / ( (totalListPriceVipItems/100) -  Math.abs(totalNonVipDiscounts));

      const nominalValueVipDiscount = (totalListPriceVipItems/100 - giftCardsSum/100) / percetagelVipDiscounts;
      const nominalValueNonVipDiscount = (total/100 - Math.abs(nominalValueVipDiscount)) * percetagelNonVipDiscounts/100;
      const adjust2 = (total/100 - giftCardsSum/100 - Math.abs(nominalValueVipDiscount) - Math.abs(nominalValueNonVipDiscount) ) - (total/100 - giftCardsSum/100 + totalVipDiscounts + totalNonVipDiscounts);

    
     

      const totalMath1 = ( (totalPriceVipItems-giftCard)*(totalPriceVipItems/totalListPriceVipItems) ) + totalPriceNonVipItems
      const totalMath2 = ( (totalPriceVipItems*(totalPriceVipItems/totalListPriceVipItems)-giftCard) ) + totalPriceNonVipItems
      const adjust = totalMath1 > totalMath2 ? totalMath1 - totalMath2 : 0




      console.log( `
      total: ${total},
      totalPriceVipItems: ${totalPriceVipItems},
      totalPriceNonVipItems: ${totalPriceNonVipItems},
      giftCardsSum: ${giftCardsSum},
      totalListPriceVipItems: ${totalListPriceVipItems},
      totalPriceVipItems: ${totalPriceVipItems},
      totalVipDiscounts: ${totalVipDiscounts},
      totalNonVipDiscounts: ${totalNonVipDiscounts},
      percetagelVipDiscounts: ${percetagelVipDiscounts},
      percetagelNonVipDiscounts: ${percetagelNonVipDiscounts},
      nominalValueVipDiscount: ${nominalValueVipDiscount},
      nominalValueNonVipDiscount: ${nominalValueNonVipDiscount},
      adjust2: ${adjust2},
      old adjust: ${adjust},
      `)


      return adjust2

      
    } 

    return null
    
  }
}
//https://vysk--roadrunnersportsqa.myvtex.com/checkout/cart/add/?sku=994&qty=1&seller=rrsaqarlington&sc=1&sku=4&qty=1&seller=1&sc=1&sku=509352&qty=1&seller=1&sc=1