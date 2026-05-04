import { Router } from 'express'
import { db } from '@ebox/db'
const ordersRouter = Router()

ordersRouter.get('/count', async (_req, res) => {
  try {
    const { shop } = res.locals.shopify.session
    if (!shop) throw new Error('Missing shop id')

    const count = await db.order.count({
      where: { shopifyShop: shop, sourceChannel: 'SHOPIFY' },
    })

    res.status(200).send({ count })
  } catch (error) {
    console.error('Error counting orders:', error)
    res.status(500).send(error.message)
  }
})

export { ordersRouter }
