import { ExternalClient, InstanceOptions, IOContext } from '@vtex/api'

export class TaxProvider_default extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    // The first argument is the base URl of your provider API endpoint
    super('baseURL', ctx, options)
  }

  public getTaxInformation (
    taxIntegrated: any
  ) {
    return taxIntegrated.itemTaxResponse
  }
}
