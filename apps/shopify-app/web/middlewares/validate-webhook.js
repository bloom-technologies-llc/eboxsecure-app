// @ts-check
import { db } from '@ebox/db'
import shopify from '../shopify.js'

const validateWebhook = async (req, res, next) => {
  const topic = req.get('X-Shopify-Topic')
  const shop = req.get('X-Shopify-Shop-Domain')
  const webhookEventId = req.get('X-Shopify-Event-Id')
  const rawBody = req.body

  //validate webhook
  const { valid } = await shopify.api.webhooks.validate({
    rawBody,
    rawRequest: req,
    rawResponse: res,
  })

  if (!valid) {
    console.error(`Invalid HMAC`)
    return res.status(401).send('Invalid HMAC')
  }

  console.info(
    `Webhook received for topic ${topic} from ${shop} with event id: ${webhookEventId}`
  )

  // dedupe duplicate requests
  const correspondingEvent = await db.shopifyWebhookEvent.findUnique({
    where: {
      webhookEventId,
    },
  })

  if (correspondingEvent) {
    console.info(
      `Deduped Webhook topic ${topic} from ${shop} with event id: ${webhookEventId}`
    )
    res.status(200).end()
    return
  }

  next()
}

export default validateWebhook
