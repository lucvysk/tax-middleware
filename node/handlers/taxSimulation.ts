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

function getDiscountAdjustmentPerItemIndex(orderForm: any, vipPromosId: string[], discountAdjust: number) {
  const discountAdjustPerItem = orderForm?.items?.length 
  ? Array(orderForm.items.length).fill(0) 
  : Array(1000).fill(0)

  for (let i = 0; discountAdjust > 0; i++) {
    if (i >= orderForm.items.length) break

    const itemVipDiscount = orderForm.items[i].priceTags.find((priceTag: any) =>
      vipPromosId.includes(priceTag.identifier)
    );

    if (!itemVipDiscount) continue;

    const newDiscountAdjust = discountAdjust + itemVipDiscount.value;

    let itemDiscountAdjust =
      newDiscountAdjust <= 0
        ? discountAdjust
        : Math.abs(itemVipDiscount.value);

    discountAdjust += itemVipDiscount.value;

    discountAdjustPerItem[i] = itemDiscountAdjust/100
  }

  return discountAdjustPerItem
}


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

  const promoIds = accountSettings?.promoId?.split(`,`).map((promo: string) => promo.trim());

  let orderFormParse = null;
  const orderFormId = orderInformation?.orderFormId || orderInformation.taxApp?.fields?.orderFormId;
      
  if(orderFormId && accountSettings?.appKey && accountSettings?.appToken) orderFormParse = await orderForm.getOrderForm(orderFormId, accountSettings?.appKey, accountSettings?.appToken)

  if(
    orderFormParse?.ratesAndBenefitsData?.rateAndBenefitsIdentifiers?.filter( (promo:any) => promoIds.includes(promo.id)).length
  ) {
    adjustment = discountAdjustment.getDiscountAdjustment(orderFormParse, accountSettings.giftCards, promoIds)
  }

  const discountAdjustPerItemIndex = getDiscountAdjustmentPerItemIndex(orderFormParse, promoIds, adjustment)

  if(adjustment) {
    orderInformation.items.map( (item : any, i: number) => {
      return item.discountPrice = item.discountPrice + discountAdjustPerItemIndex[i]
    })
  }
  
  const taxIntegrated = await taxProviderIntegrator.getPayload(orderInformation)
  let payload = getTaxInformationDefault.getTaxInformation(taxIntegrated)
  const expectedResponse = parseProviderToVtex(payload, discountAdjustPerItemIndex)

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
