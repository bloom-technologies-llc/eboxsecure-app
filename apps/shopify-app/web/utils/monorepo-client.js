const MONOREPO_API_URL = process.env.MONOREPO_API_URL
const SHOPIFY_INTEGRATION_API_KEY = process.env.SHOPIFY_INTEGRATION_API_KEY

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

/**
 * HTTP client for calling monorepo integration endpoints.
 * Includes retry logic and timeout handling.
 */
export const monorepoClient = {
  /**
   * @param {string} path - API path (e.g., '/auth/send-otp')
   * @param {object} options
   * @param {'GET'|'POST'|'PUT'|'DELETE'} [options.method='GET']
   * @param {object} [options.body]
   * @param {number} [options.timeout=10000] - Timeout in ms
   * @param {number} [options.retries=3] - Number of retry attempts
   */
  async request(path, { method = 'GET', body, timeout = 10000, retries = 3 } = {}) {
    if (!MONOREPO_API_URL) {
      throw new Error('MONOREPO_API_URL is not configured')
    }
    if (!SHOPIFY_INTEGRATION_API_KEY) {
      throw new Error('SHOPIFY_INTEGRATION_API_KEY is not configured')
    }

    const url = `${MONOREPO_API_URL}/api/shopify-integration${path}`
    let lastError

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Integration-Key': SHOPIFY_INTEGRATION_API_KEY,
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorBody = await response.text().catch(() => 'Unknown error')
          throw new Error(
            `Monorepo API error: ${response.status} ${response.statusText} - ${errorBody}`
          )
        }

        return await response.json()
      } catch (error) {
        lastError = error
        if (attempt < retries - 1) {
          // Exponential backoff: 500ms, 1000ms, 2000ms
          await sleep(500 * Math.pow(2, attempt))
        }
      }
    }

    throw lastError
  },

  // Convenience methods
  async sendOtp(email) {
    return this.request('/auth/send-otp', {
      method: 'POST',
      body: { email },
      timeout: 10000,
    })
  },

  async verifyOtp(email, otp) {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: { email, otp },
      timeout: 10000,
    })
  },

  async getLocations() {
    return this.request('/locations', {
      method: 'GET',
      timeout: 10000,
    })
  },

  async ingestOrder(orderData) {
    return this.request('/orders/ingest', {
      method: 'POST',
      body: orderData,
      timeout: 5000,
    })
  },

  async updateFulfillment(fulfillmentData) {
    return this.request('/fulfillments/update', {
      method: 'POST',
      body: fulfillmentData,
      timeout: 5000,
    })
  },
}
