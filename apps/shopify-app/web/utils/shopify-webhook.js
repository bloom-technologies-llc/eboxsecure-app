import { db } from '@ebox/db'
import { WEBHOOK_PROCESSORS } from '../webhook-handlers/index.js'

export const extractWebhookData = req => {
  const topic = req.get('X-Shopify-Topic')
  const shop = req.get('X-Shopify-Shop-Domain')
  const webhookId = req.get('X-Shopify-Webhook-Id')
  const webhookEventId = req.get('X-Shopify-Event-Id')
  const apiVersion = req.get('X-Shopify-API-Version')
  const body = JSON.parse(req.body)

  return {
    topic,
    shop,
    webhookId,
    webhookEventId,
    apiVersion,
    body,
  }
}

export const processWebhook = async (req, res) => {
  const webhookData = extractWebhookData(req)

  const { topic, shop, webhookEventId, webhookId } = webhookData
  const normalizedTopic = topic.toLocaleUpperCase().replace('/', '_')

  // temporary until logic for privacy and app uninstalled webhooks is done
  if (
    normalizedTopic === 'CUSTOMERS_DATA_REQUEST' ||
    normalizedTopic === 'CUSTOMERS_REDACT' ||
    normalizedTopic === 'SHOP_REDACT' ||
    normalizedTopic === 'APP_UNINSTALLED'
  ) {
    console.info(`Unhandled webhook topic received - ${normalizedTopic}`)
    res.status(200).end()
    return
  }

  const handler = WEBHOOK_PROCESSORS[normalizedTopic]

  if (!handler) {
    console.error(`Invalid webhook topic: ${topic} - ${webhookId}`)
    // Always return 200 to Shopify to avoid retries
    res.status(200).end()
    return
  }

  try {
    await handler(webhookData)
  } catch (e) {
    console.error(
      `Unable to process topic webhook with id ${webhookId} : ${e.message}`
    )
    // Still return 200 to Shopify — failed forwards are saved to FailedWebhookForward
  }

  // Record the webhook event for deduplication
  await db.shopifyWebhookEvent.create({
    data: {
      webhookEventId,
      topic,
      shop,
    },
  })

  console.log(`Successfully handled webhook: ${topic} - ${webhookId}`)
  res.status(200).end()
  return
}
