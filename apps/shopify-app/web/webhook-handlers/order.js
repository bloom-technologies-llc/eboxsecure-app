// @ts-check
import { DeliveryMethod } from '@shopify/shopify-api'
import { db } from '@ebox/db'
import { monorepoClient } from '../utils/monorepo-client.js'

/**
 * @type {{[key: string]: import("@shopify/shopify-api").WebhookHandler}}
 */
export const ORDER_HANDLERS = {
  ORDERS_CREATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: '/api/shopify/webhooks',
    metafieldNamespaces: ['ebox'],
  },
  ORDERS_UPDATED: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: '/api/shopify/webhooks',
    metafieldNamespaces: ['ebox'],
  },
  ORDERS_FULFILLED: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: '/api/shopify/webhooks',
    metafieldNamespaces: ['ebox'],
  },
  ORDERS_PARTIALLY_FULFILLED: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: '/api/shopify/webhooks',
    metafieldNamespaces: ['ebox'],
  },
  ORDERS_CANCELLED: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: '/api/shopify/webhooks',
    metafieldNamespaces: ['ebox'],
  },
}

/**
 * Transform a Shopify order webhook payload into the shape expected by the monorepo ingest endpoint.
 */
const transformOrderPayload = (shop, order) => {
  const {
    id: shopifyOrderId,
    name: orderName,
    customer,
    total_price_set: totalPriceSet,
    shipping_address: shippingAddress,
  } = order

  const email = customer?.email
  const total = totalPriceSet?.presentment_money?.amount
    ? parseFloat(totalPriceSet.presentment_money.amount)
    : 0

  return {
    shopifyOrderId: shopifyOrderId.toString(),
    shopifyShop: shop,
    orderName,
    email,
    total,
    shippingAddress: shippingAddress
      ? {
          address1: shippingAddress.address1,
          city: shippingAddress.city,
          zip: shippingAddress.zip,
          provinceCode: shippingAddress.province_code,
          countryCode: shippingAddress.country_code,
        }
      : undefined,
  }
}

const forwardOrderToMonorepo = async ({ shop, body: order }) => {
  const payload = transformOrderPayload(shop, order)

  // Skip orders without a customer email (can't link to monorepo)
  if (!payload.email) {
    console.info(
      `Skipping order ${payload.shopifyOrderId} — no customer email`
    )
    return
  }

  try {
    const result = await monorepoClient.ingestOrder(payload)
    console.log(
      `Order ${payload.shopifyOrderId} forwarded to monorepo: orderId=${result.orderId}`
    )
  } catch (error) {
    console.error(
      `Failed to forward order ${payload.shopifyOrderId} to monorepo:`,
      error.message
    )
    // Save to dead-letter table for retry
    await db.failedWebhookForward.create({
      data: {
        topic: 'ORDERS_CREATE',
        payload,
        error: error.message,
      },
    })
  }
}

export const ORDER_WEBHOOK_PROCESSORS = {
  ORDERS_CREATE: forwardOrderToMonorepo,
  ORDERS_UPDATED: forwardOrderToMonorepo,
  ORDERS_FULFILLED: forwardOrderToMonorepo,
  ORDERS_PARTIALLY_FULFILLED: forwardOrderToMonorepo,
  ORDERS_CANCELLED: forwardOrderToMonorepo,
}
