export const parseProviderToVtex = (
  providerResponse: any, // replace unknown with the typing of your provider
  adjustment : any,
  orderInformation : any
): TaxResponse => {

  if(adjustment) {
    providerResponse.map((prodTax: any) => {
      prodTax.taxes.push({
        name: 'DiscountAdjust@custom',
        description: 'Promo Adjustment',
        value: adjustment / orderInformation.items.length,
      })
      return prodTax
    })
  }

  // Parse here your response to the expected format
  return providerResponse as TaxResponse
}
