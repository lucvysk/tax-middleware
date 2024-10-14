import { IOClients } from '@vtex/api'

import OrderForm from './orderform'
import { Catalog } from './catalog'
import { Checkout } from './checkout'
import { Logistics } from './logistics'
import { TaxProvider } from './taxProvider'
import { TaxProvider2 } from './taxProvider2'
import { TaxProviderIntegrator } from './taxProviderIntegrator'

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

  public get taxProvider() {
    return this.getOrSet('taxProvider', TaxProvider)
  }

  public get taxProvider2() {
    return this.getOrSet('taxProvider2', TaxProvider2)
  }

  public get taxProviderIntegrator() {
    return this.getOrSet('taxProviderIntegrator', TaxProviderIntegrator)
  }

  public get orderForm() {
    return this.getOrSet('orderForm', OrderForm)
  }

}
