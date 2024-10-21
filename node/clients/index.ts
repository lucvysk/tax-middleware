import { IOClients } from '@vtex/api'

import OrderForm from './orderform'
import { Catalog } from './catalog'
import { Checkout } from './checkout'
import { Logistics } from './logistics'
import { DiscountAdjustment } from './discountAdjustment'
import { TaxProvider2 } from './taxProvider2'
import { TaxProviderIntegrator } from './taxProviderIntegrator'
import { TaxProvider_default } from './taxProvider_default'

export class Clients extends IOClients {
  public get checkout() {
    return this.getOrSet('checkout', Checkout)
  }

  public get logistics() {
    return this.getOrSet('logistics', Logistics)
  }

  public get catalog() {
    return this.getOrSet('catalog', Catalog)
  }

  public get discountAdjustment() {
    return this.getOrSet('discountAdjustment', DiscountAdjustment)
  }

  public get taxProvider2() {
    return this.getOrSet('taxProvider2', TaxProvider2)
  }

  public get taxProviderIntegrator() {
    return this.getOrSet('taxProviderIntegrator', TaxProviderIntegrator)
  }

  public get getTaxInformationDefault() {
    return this.getOrSet('getTaxInformationDefault', TaxProvider_default)
  }

  public get orderForm() {
    return this.getOrSet('orderForm', OrderForm)
  }

}
