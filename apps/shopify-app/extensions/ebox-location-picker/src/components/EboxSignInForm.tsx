import {
  InlineLayout,
  TextField,
  Button,
  BlockStack,
  Text,
  Banner,
} from '@shopify/ui-extensions-react/checkout'
import { EboxUser } from '../types'
import { useState } from 'react'
import { BASE_URL } from '../constants'

type EboxSignInFormProps = {
  eboxUser: EboxUser
  setEboxUser: React.Dispatch<React.SetStateAction<EboxUser>>
}

export const EboxSignInForm: React.FC<EboxSignInFormProps> = ({
  eboxUser,
  setEboxUser,
}) => {
  const [error, setError] = useState<string>()
  const { email, emailSent, otp } = eboxUser

  const handleEmailChange = (email: string) => {
    setEboxUser(prev => ({ ...prev, email }))
  }

  const handleOTPChange = (otp: string) => {
    if (!otp || otp.length !== 6) return
    setEboxUser(prev => ({ ...prev, otp }))
  }

  const handleSendCode = async () => {
    if (!email) return
    try {
      const response = await fetch(`${BASE_URL}/api/ebox/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
        }),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      setEboxUser(prev => ({ ...prev, email: prev.email, emailSent: true }))
      setError(undefined)
    } catch (e) {
      setError(e.message)
    }
  }

  const handleAuthorize = async () => {
    if (!emailSent || !otp) return
    try {
      const response = await fetch(`${BASE_URL}/api/ebox/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const { token } = (await response.json()) as {
        token: string
      }
      setEboxUser(prev => ({ ...prev, token, authorized: true }))
    } catch (e) {
      setError(e.message)
    }
  }

  const getSendMessage = () => {
    return `${emailSent ? 'Resend' : 'Send'} Code `
  }

  return (
    <BlockStack padding={'tight'}>
      <Text size="large">Authenticate with Ebox</Text>
      <InlineLayout columns={['80%', 'fill']} spacing="tight">
        <TextField label="Email" onChange={handleEmailChange} value={email} />
        <Button onPress={handleSendCode}>{getSendMessage()}</Button>
      </InlineLayout>
      {emailSent && (
        <>
          <InlineLayout columns={['80%', 'fill']} spacing="tight">
            <TextField
              disabled={!emailSent}
              autocomplete={false}
              label="One-Time Access Code"
              onChange={handleOTPChange}
              maxLength={6}
            />
            <Button disabled={!emailSent} onPress={handleAuthorize}>
              Authorize
            </Button>
          </InlineLayout>
          <Text size="small">
            Check your email for your one-time access code.
          </Text>
        </>
      )}
      {error && <Banner status="critical" title={error!} />}
    </BlockStack>
  )
}
