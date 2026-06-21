import { ShippingAddress } from '@shopify/ui-extensions/checkout'

export const isSameAddress = (
  ship1: ShippingAddress,
  ship2: ShippingAddress
) => {
  if (ship1.address1 !== ship2.address1) return false
  else if (ship1.city !== ship2.city) return false
  else if (ship1.zip !== ship2.zip) return false
  else return true
}
