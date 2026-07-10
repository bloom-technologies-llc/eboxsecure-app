import { ShippingAddress } from '@shopify/ui-extensions/checkout'

export const RESET_LOCATION: ShippingAddress = {
  address1: undefined,
  city: undefined,
  zip: undefined,
  provinceCode: undefined,
}

// The app's backend URL. `process` does not exist in the checkout sandbox (it's
// a Web Worker) and Shopify does not inline env vars into the extension bundle,
// so the URL is baked into env.ts at deploy time by scripts/set-backend.mjs
// (dev -> qa backend, prod -> prod backend). See package.json shopify:deploy:*.
export { BASE_URL } from './env'
