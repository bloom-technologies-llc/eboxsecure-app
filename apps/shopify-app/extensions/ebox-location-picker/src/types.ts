import { ShippingAddress } from "@shopify/ui-extensions/checkout"

export type EboxUser = {
  email?: string
  otp?: string
  token?: string
  // The authenticated shopper's EboxSecure customerId, returned by verify-otp
  // and written into the order metafield alongside the chosen locationId.
  customerId?: string
  // The shopper's EboxSecure account name, returned by verify-otp and used to
  // auto-fill the checkout shipping address first/last name.
  firstName?: string
  lastName?: string
  emailSent: boolean
  authorized: boolean
}

export type EboxLocation = {
  // EboxSecure Location.id (Int) — the locationId carried in the order metafield.
  id: number
  value: ShippingAddress
  name: string
  label: string
}