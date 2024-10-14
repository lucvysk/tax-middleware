interface CheckoutRequest {
  totals: any
  taxApp: any
  orderFormId: string
  salesChannel: string
  items: Item[]
  loggedIn: boolean
  clientEmail: string
  userProfileId: string
  clientData: Client
  shippingDestination: ShippingInformation
  totalizers: Total[]
  paymentData: paymentDataT
  customData: customApp
}

interface orderFormT {
  orderFormId: string
  totalizers: Payment[]
  paymentData: paymentDataT
}


interface paymentDataT {
  updateStatus: string
  payments: any
  giftCards: giftCardsT[]
}

interface customApp {
  customApps: customApps[]
}

interface customApps {
  id: string
  major: integer
}

interface giftCardsT {
  [x: string]: string
  id: string
  provider: string
  value: number
  
}

interface Item {
  id: string
  sku: string
  ean: string
  refId: string | null
  unitMultiplier: number
  measurementUnit: string
  targetPrice: number
  itemPrice: number
  quantity: number
  discountPrice: number | null
  dockId: string
  freightPrice: number
  brandId: string
}

interface Client {
  email: string
  document: string
  corporateDocument: string | null
  stateInscription: string | null
}

interface Total {
  id: string
  name: string
  value: number
}

interface Payment {
  name: string
  paumentSystem: string
  bin: string | null
  referenceValue: number
  value: number
  installments: number | null
  giftCards: giftCardsT[]
}

interface ShippingInformation {
  country: string
  state: string
  city: string
  neighborhood: string
  street: string
  postalCode: string
}
