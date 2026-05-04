// @ts-check
import { DeliveryMethod } from '@shopify/shopify-api'
import { db } from '@ebox/db'
import { monorepoClient } from '../utils/monorepo-client.js'

/**
 * @type {{[key: string]: import("@shopify/shopify-api").WebhookHandler}}
 */
export const FULFILLMENT_HANDLERS = {
  FULFILLMENTS_CREATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: '/api/shopify/webhooks',
  },
  FULFILLMENTS_UPDATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: '/api/shopify/webhooks',
  },
}

const forwardFulfillmentToMonorepo = async ({ shop, body: fulfillment }) => {
  const {
    order_id: orderId,
    tracking_company: trackingCompany,
    tracking_numbers: trackingNumbers,
    tracking_urls: trackingUrls,
  } = fulfillment

  const trackingNumber =
    trackingNumbers && trackingNumbers.length > 0 ? trackingNumbers[0] : null

  const payload = {
    shopifyOrderId: orderId.toString(),
    trackingNumber,
    trackingCompany,
    trackingUrl:
      trackingUrls && trackingUrls.length > 0 ? trackingUrls[0] : null,
  }

  try {
    const result = await monorepoClient.updateFulfillment(payload)
    console.log(
      `Fulfillment for order ${orderId} forwarded to monorepo: orderId=${result.orderId}`
    )
  } catch (error) {
    console.error(
      `Failed to forward fulfillment for order ${orderId} to monorepo:`,
      error.message
    )
    // Save to dead-letter table for retry
    await db.failedWebhookForward.create({
      data: {
        topic: 'FULFILLMENTS_UPDATE',
        payload,
        error: error.message,
      },
    })
  }
}

export const FULFILLMENT_WEBHOOK_PROCESSORS = {
  FULFILLMENTS_CREATE: forwardFulfillmentToMonorepo,
  FULFILLMENTS_UPDATE: forwardFulfillmentToMonorepo,
}
