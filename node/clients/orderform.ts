import { JanusClient } from '@vtex/api'

export default class OrderForm extends JanusClient {
  public async getOrderForm(
    orderFormId: string,
    appKey: string,
    appToken: string
  ): Promise<any> {
    
    return await this.http.get(`/api/checkout/pub/orderForm/${orderFormId}?disableAutoCompletion=true`, {
      headers: {
        'X-VTEX-API-AppKey': appKey,
        'X-VTEX-API-AppToken': appToken,
      },
      params: { disableAutoCompletion: true },
      metric: 'orderForm-get',
    }).catch(function() {
      console.error(`Error in getOrderForm this.http.get`)
    })
  }
}