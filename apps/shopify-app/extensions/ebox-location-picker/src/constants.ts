import { ShippingAddress } from '@shopify/ui-extensions/checkout'

export const RESET_LOCATION: ShippingAddress = {
  address1: undefined,
  city: undefined,
  zip: undefined,
  provinceCode: undefined,
}

// The app's backend URL. `process` does not exist in the checkout sandbox
// (it's a Web Worker), so a bare `process.env` reference throws at module load
// and blanks the whole extension. The Shopify CLI inlines this member access at
// build time when SHOPIFY_APP_URL is set in the extension's env; when it's unset
// the reference survives and throws, so we guard with try/catch and fall back to
// "" — the panel still renders, it just can't reach the backend until the URL is
// provided at build time (see ENVIRONMENTS / the extension .env).
let appUrl: string | undefined;
try {
  appUrl = process.env.SHOPIFY_APP_URL;
} catch {
  appUrl = undefined;
}
export const BASE_URL = appUrl ?? ''
