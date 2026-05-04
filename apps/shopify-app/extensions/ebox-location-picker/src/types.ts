import { ShippingAddress } from "@shopify/ui-extensions/checkout"

export type EboxUser = {
  email?: string
  otp?: string
  token?: string
  emailSent: boolean
  authorized: boolean
}

export type EboxLocation = {
  value: ShippingAddress
  name: string
  label: string
}