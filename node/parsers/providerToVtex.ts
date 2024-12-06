export const parseProviderToVtex = (
  providerResponse: any, // replace unknown with the typing of your provider
  discountAdjustPerItemIndex : number[]
): TaxResponse => {
  
  providerResponse.map((prodTax: any, i: number) => {

    if(discountAdjustPerItemIndex[i] == 0) return prodTax

    prodTax.taxes.push({
      name: 'DiscountAdjust@custom',
      description: 'VIP Promo Adjustment',
      value: discountAdjustPerItemIndex[i],
    })

    return prodTax
  })

  return providerResponse as TaxResponse
}
