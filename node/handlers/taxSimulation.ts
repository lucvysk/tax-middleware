import { json } from 'co-body'

import { parseProviderToVtex } from '../parsers/providerToVtex'
import { parseVtexToProvider } from '../parsers/vtexToProvider'
// import { getInfoBySku } from '../utils/producstInformation'

/*
This handler is responsible for receiving the request from the checkout,
which has an specific format; this request is going to be parsed to have
the format that is expected on the provider side. After that, it will call
the method that uses the provider API. It will give a response with the
taxes information. With that, it's necessary to parse it again to the
format that VTEX expects and this will be assigned to the body
*/


export const getAppId = (): string => {
  return process.env.VTEX_APP_ID ?? ''
}


export async function taxSimulation(
  ctx: Context,
  next: () => Promise<unknown>
) {
  const body: CheckoutRequest = await json(ctx.req)

  const {
    vtex: { workspace, account },
    clients: { apps, orderForm, discountAdjustment, getTaxInformationDefault, taxProviderIntegrator },
  } = ctx
  
  const orderInformation = await parseVtexToProvider(body)
  
  const app: string = getAppId()
  const accountSettings = await apps.getAppSettings(app)
  let adjustment : any = 0;

  

  if(accountSettings) {
    //payments excluded
    const excludedPayments = accountSettings?.payments?.split(`,`).map((provider: string) => provider.trim());
    const hasExcludePayments = excludedPayments ? excludedPayments.filter( (payment: any) => payment == orderInformation?.paymentData?.payments[0]?.paymentSystem).length : 0;
    
    // V1 : returning with get from the orderForm
    if(hasExcludePayments) {
      let orderFormParse = null;
      const orderFormId = orderInformation?.orderFormId || orderInformation.taxApp?.fields?.orderFormId;
      
      if(orderFormId && accountSettings.appKey && accountSettings.appToken) orderFormParse = await orderForm.getOrderForm(orderFormId, accountSettings.appKey, accountSettings.appToken)

      if(
        orderFormParse?.ratesAndBenefitsData?.rateAndBenefitsIdentifiers?.filter( (promo:any) => promo.id == accountSettings.promoId)
      ) {
        adjustment = discountAdjustment.getDiscountAdjustment(orderFormParse, accountSettings.giftCards, accountSettings.promoId)
      }
    }

    if(adjustment) {
      orderInformation.items.map( (item : any) => {
        return item.discountPrice = item.discountPrice + (adjustment / orderInformation.items.length)
      })
    }
  }

  const taxIntegrated = await taxProviderIntegrator.getPayload(orderInformation)
  let payload = getTaxInformationDefault.getTaxInformation(taxIntegrated)

  // V2 : returning without get from the orderForm
  // let gift = 0;
  // if(orderInformation.taxApp?.fields?.giftValue) {
  //   gift = JSON.parse(orderInformation.taxApp?.fields.giftValue)
  // }
  // const payload = taxProvider2.getTaxInformation(orderInformation, taxIntegrated, gift)
  
  // Parsing the tax information that was retrieved to the correct format
  const expectedResponse = parseProviderToVtex(payload, adjustment,orderInformation)

  // Mounting the response body
  ctx.body = {
    hooks: [
      {
        major: 1,
        url: `https://${workspace}--${account}.myvtex.com/app/tax-provider/oms/invoice`,
      },
    ],
    itemTaxResponse: expectedResponse,
  }

  // Necessary so the Checkout can understand body's format
  ctx.set('Content-Type', 'application/vnd.vtex.checkout.minicart.v1+json')

  await next()
}
