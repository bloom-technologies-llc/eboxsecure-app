import { ShippingAddress } from '@shopify/ui-extensions/checkout'

export const RESET_LOCATION: ShippingAddress = {
  address1: undefined,
  city: undefined,
  zip: undefined,
  provinceCode: undefined,
}

// Use the app's backend URL — configured via Shopify app settings
export const BASE_URL = process.env.SHOPIFY_APP_URL ?? ''
