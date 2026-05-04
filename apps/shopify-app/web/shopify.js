import { db } from '@ebox/db'
import PrivacyWebhookHandlers from './webhook-handlers/privacy.js'
import { LATEST_API_VERSION } from '@shopify/shopify-api'
import { shopifyApp } from '@shopify/shopify-app-express'
import { PrismaSessionStorage } from '@shopify/shopify-app-session-storage-prisma'
import { restResources } from '@shopify/shopify-api/rest/admin/2025-01'
import { WEBHOOK_HANDLERS } from './webhook-handlers/index.js'

const shopify = shopifyApp({
  api: {
    apiVersion: LATEST_API_VERSION,
    restResources,
    future: {
      customerAddressDefaultFix: true,
      lineItemBilling: true,
      unstable_managedPricingSupport: true,
    },
    billing: undefined,
  },
  auth: {
    path: '/api/shopify/auth',
    callbackPath: '/api/shopify/auth/callback',
  },
  webhooks: {
    path: '/api/shopify/webhooks',
  },
  sessionStorage: new PrismaSessionStorage(db, {
    tableName: 'shopify_session',
  }),
})

shopify.processWebhooks({
  webhookHandlers: {
    ...WEBHOOK_HANDLERS,
    ...PrivacyWebhookHandlers,
  },
})

export default shopify
