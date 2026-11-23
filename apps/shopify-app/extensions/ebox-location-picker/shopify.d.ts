import '@shopify/ui-extensions';

//@ts-ignore
declare module './src/Checkout.tsx' {
  const shopify: import('@shopify/ui-extensions/purchase.checkout.delivery-address.render-before').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/components/EboxSignInForm.tsx' {
  const shopify: import('@shopify/ui-extensions/purchase.checkout.delivery-address.render-before').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/components/LocationSelect.tsx' {
  const shopify: import('@shopify/ui-extensions/purchase.checkout.delivery-address.render-before').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/constants.ts' {
  const shopify: import('@shopify/ui-extensions/purchase.checkout.delivery-address.render-before').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/utils.tsx' {
  const shopify: import('@shopify/ui-extensions/purchase.checkout.delivery-address.render-before').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/types.ts' {
  const shopify: import('@shopify/ui-extensions/purchase.checkout.delivery-address.render-before').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/env.ts' {
  const shopify: import('@shopify/ui-extensions/purchase.checkout.delivery-address.render-before').Api;
  const globalThis: { shopify: typeof shopify };
}
