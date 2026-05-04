// @ts-check
import { join } from 'path'
import { readFileSync } from 'fs'
import express from 'express'
import cors from 'cors'
import serveStatic from 'serve-static'
import rateLimit from 'express-rate-limit'

import shopify from './shopify.js'
import validateWebhook from './middlewares/validate-webhook.js'

import { eboxAuthRouter } from './routes/auth.js'
import { eboxLocationsRouter } from './routes/locations.js'
import { processWebhook } from './utils/shopify-webhook.js'
import { ordersRouter } from './routes/orders.js'
import { validateEnv } from './validateEnv.js'

// Validate environment at startup
validateEnv()

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || '3000',
  10
)

const STATIC_PATH =
  process.env.NODE_ENV === 'production'
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`

const app = express()

// Restrict CORS to Shopify domains and the app domain
const allowedOrigins = [
  /\.myshopify\.com$/,
  /\.shopify\.com$/,
  process.env.HOST,
  process.env.SHOPIFY_APP_URL,
].filter(Boolean)

const eboxApiRouter = express.Router()
eboxApiRouter.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, Shopify extensions)
      if (!origin) return callback(null, true)
      const isAllowed = allowedOrigins.some(allowed =>
        allowed instanceof RegExp ? allowed.test(origin) : allowed === origin
      )
      if (isAllowed) return callback(null, true)
      // In development, allow all origins
      if (process.env.NODE_ENV === 'development') return callback(null, true)
      callback(new Error('Not allowed by CORS'))
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// Rate limiting on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

eboxApiRouter.use('/auth', authLimiter, eboxAuthRouter)
eboxApiRouter.use('/locations', eboxLocationsRouter)

app.use('/api/ebox', eboxApiRouter)

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin())
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
)

app.post(
  shopify.config.webhooks.path,
  express.text({ type: '*/*' }),
  validateWebhook,
  processWebhook
)

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use('/api/shopify/*', shopify.validateAuthenticatedSession())
app.use(express.json())

app.use('/api/shopify/orders', ordersRouter)

app.use(shopify.cspHeaders())
app.use(serveStatic(STATIC_PATH, { index: false }))

app.use('/*', shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  res
    .status(200)
    .set('Content-Type', 'text/html')
    .send(
      readFileSync(join(STATIC_PATH, 'index.html'))
        .toString()
        .replace('%VITE_SHOPIFY_API_KEY%', process.env.SHOPIFY_API_KEY || '')
    )
  return
})

// Error handling middleware
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT)
