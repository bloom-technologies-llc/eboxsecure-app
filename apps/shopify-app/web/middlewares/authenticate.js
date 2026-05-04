import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.SHOPIFY_INTEGRATION_JWT_SECRET

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: 'Unauthorized', message: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]

  try {
    jwt.verify(token, JWT_SECRET)
    next()
  } catch (error) {
    return res
      .status(403)
      .json({ error: 'Forbidden', message: 'Invalid or expired token' })
  }
}
