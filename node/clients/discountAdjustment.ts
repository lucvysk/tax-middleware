import { ExternalClient, InstanceOptions, IOContext } from '@vtex/api'

function sumGiftCardWithIdentifier(orderForm: any, giftCardsProviders:string) {
  if (!orderForm?.paymentData?.giftCards || !giftCardsProviders) {
    return 0;
  }

  const providers = giftCardsProviders
    .split(",")
    .map((provider) => provider.trim());

  return orderForm.paymentData.giftCards
    .filter((card: any) => providers.includes(card.provider))
    .reduce((total: number, card:any) => total + card.value, 0);
}

function sumPriceWithIdentifier(orderForm: any, vipPromosId: string[]): number {
  return orderForm.items.reduce((totalPrice: number, item: any) => {
    const hasIdentifier = item.priceTags.some((priceTag: any) =>
      vipPromosId.includes(priceTag.identifier)
    );

    return hasIdentifier ? totalPrice + item.price : totalPrice;
  }, 0);
}

function findHighestVipPercentage(orderForm: any) {
  return orderForm.ratesAndBenefitsData.rateAndBenefitsIdentifiers.reduce(
    (highestVipPercentage: number, rateAndBenefit: any) => {
      const vipPercentage = parseFloat(
        rateAndBenefit.additionalInfo?.vip_percentage || 0
      );
      return !isNaN(vipPercentage) && vipPercentage > highestVipPercentage
        ? vipPercentage
        : highestVipPercentage;
    },
    0
  );
}

function calculateExpectedVipSavings(
  vipElegibleItemPrice: number,
  rewardsCashApplied: number,
  vipPercentage: number
) {
  const expectedVipSavings =
    ((vipElegibleItemPrice - rewardsCashApplied) * vipPercentage) / 100;
  return Math.max(0, expectedVipSavings);
}

function calculateGivenVipSavings(orderForm: any, vipPromosId: string[]): number {
  return orderForm.items.reduce((totalVipSavings: number, item: any) => {
    const vipSavings = item.priceTags.reduce((tagSum: number, priceTag: any) => {
      return vipPromosId.includes(priceTag.identifier)
        ? tagSum + (priceTag.value || 0)
        : tagSum;
    }, 0);

    return totalVipSavings + vipSavings;
  }, 0);
}

function calculateDiscountAdjust(givenVipSavings: number, expectedVipSavings: number): number{
  const discountAdjust = ((givenVipSavings + expectedVipSavings))
  const truncatedDiscount = Math.trunc(discountAdjust)

  return Math.abs(truncatedDiscount);
}

export class DiscountAdjustment extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    // The first argument is the base URl of your provider API endpoint
    super('baseURL', ctx, options)
  }

  public getDiscountAdjustment(
    orderInformation: any,
    giftCards: string,
    promoId: string[]
  ) {
    if(!orderInformation) return null
    
    const rewardsCashApplied = sumGiftCardWithIdentifier(orderInformation, giftCards)
    if(rewardsCashApplied <=0) return null

    const vipElegibleItemPrice = sumPriceWithIdentifier(
      orderInformation,
      promoId
    )
    const vipPercentage = findHighestVipPercentage(orderInformation);

    const expectedVipSavings = calculateExpectedVipSavings(
      vipElegibleItemPrice,
      rewardsCashApplied,
      vipPercentage
    );

    const givenVipSavings = calculateGivenVipSavings(orderInformation, promoId)
    const discountAdjust = calculateDiscountAdjust(givenVipSavings, expectedVipSavings)
    const vipSavingsAfterDiscountAdjust = (givenVipSavings) + discountAdjust
    
    console.log({ 
      vipElegibleItemPrice, 
      rewardsCashApplied, 
      givenVipSavings, 
      expectedVipSavings, 
      discountAdjust, 
      vipSavingsAfterDiscountAdjust
    })

    return discountAdjust
  }
}