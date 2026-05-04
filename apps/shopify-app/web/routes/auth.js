import express from 'express'
import { z } from 'zod'
import { monorepoClient } from '../utils/monorepo-client.js'

const eboxAuthRouter = express.Router()

eboxAuthRouter.post('/signin', express.json(), async (req, res) => {
  const { success, error, data } = z
    .object({
      email: z.string().email(),
    })
    .safeParse(req.body)

  if (!success) {
    res.status(400).json({
      error: {
        message: `Invalid request body: ${error.issues.map(
          issue => `${issue.path} - ${issue.message}`
        )}`,
      },
    })
    return
  }

  try {
    const result = await monorepoClient.sendOtp(data.email)
    res.status(200).json({
      message: `If your email exists in our system, we've sent you a passcode.`,
    })
  } catch (e) {
    console.error('Error sending OTP via monorepo:', e.message)
    res.status(500).json({
      error: { message: 'Unable to send verification code. Please try again.' },
    })
  }
})

eboxAuthRouter.post('/verify-otp', express.json(), async (req, res) => {
  const { success, error, data } = z
    .object({
      email: z.string().email(),
      otp: z.string().length(6).regex(/^\d*$/, 'Must contain only numbers'),
    })
    .safeParse(req.body)

  if (!success) {
    res.status(400).json({
      error: {
        message: `Invalid request body: ${error.issues.map(
          issue => `${issue.path} - ${issue.message}`
        )}`,
      },
    })
    return
  }

  try {
    const result = await monorepoClient.verifyOtp(data.email, data.otp)
    res.status(200).json({
      message: 'OTP verified successfully',
      token: result.token,
    })
  } catch (e) {
    console.error('Error verifying OTP via monorepo:', e.message)
    if (e.message.includes('401')) {
      res.status(401).json({
        error: 'Invalid OTP',
        message: 'The OTP you entered is invalid or has expired.',
      })
    } else {
      res.status(500).json({
        error: { message: 'Unable to verify code. Please try again.' },
      })
    }
  }
})

export { eboxAuthRouter }
