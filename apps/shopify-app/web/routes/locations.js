import express from 'express'
import { authenticate } from '../middlewares/authenticate.js'
import { monorepoClient } from '../utils/monorepo-client.js'

const eboxLocationsRouter = express.Router()

eboxLocationsRouter.use((req, res, next) => {
  authenticate(req, res, next)
})

eboxLocationsRouter.get('/', async (req, res) => {
  try {
    const result = await monorepoClient.getLocations()
    res.status(200).json(result)
  } catch (e) {
    console.error(`Error fetching locations from monorepo: ${e.message}`)
    res.status(500).json({
      message: 'Unexpected error occurred. Try again later.',
    })
  }
})

export { eboxLocationsRouter }
