

import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

export class TaxProviderIntegrator extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super(`http://${ctx.workspace}--${ctx.account}.myvtex.com`, ctx, {
      ...options,
      timeout:4000,
      headers: {
        VtexIdclientAutCookie: ctx.authToken,
        'X-Vtex-Use-Https': 'true',
        ...options?.headers,
      },
    })
  }

  public getPayload(
    orderInformation: CheckoutRequest
  ) {

    return this.http.post(`/vertex/checkout/order-tax/`, orderInformation, 
    {
      headers: {},
    })

  }
}

