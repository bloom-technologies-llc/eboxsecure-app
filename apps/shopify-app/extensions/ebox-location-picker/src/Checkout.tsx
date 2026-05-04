import { useCallback, useEffect, useState } from 'react'
import {
  reactExtension,
  Banner,
  BlockStack,
  Switch,
  useApplyMetafieldsChange,
  TextBlock,
  useApplyShippingAddressChange,
  Modal,
  Button,
  useShippingAddress,
  Heading,
  HeadingGroup,
} from '@shopify/ui-extensions-react/checkout'
import { EboxSignInForm } from './components/EboxSignInForm'
import { LocationSelect } from './components/LocationSelect'
import { RESET_LOCATION } from './constants'
import { isSameAddress } from './utils'
import type { EboxLocation, EboxUser } from './types'

export default reactExtension(
  'purchase.checkout.delivery-address.render-before',
  () => <Extension />
)

function Extension() {
  const applyMetaFields = useApplyMetafieldsChange()
  const shippingAddress = useShippingAddress()
  const updateShippingAddress = useApplyShippingAddressChange()

  const [useEbox, setUseEbox] = useState(false)
  const [eboxUser, setEboxUser] = useState<EboxUser>({
    email: undefined,
    otp: undefined,
    token: undefined,
    emailSent: false,
    authorized: false,
  })
  const [location, setLocation] = useState<EboxLocation | undefined>()
  const [error, setError] = useState<string | undefined>()

  const [retroAddressChange, setRetroAddressChange] = useState(false)

  const { authorized } = eboxUser

  const resetEboxConfig = useCallback(async () => {
    setUseEbox(false)
    setLocation(undefined)
    updateShippingAddress({
      type: 'updateShippingAddress',
      address: RESET_LOCATION,
    }).catch(e => setError(`Unable to remove shipping address: ${e.message}`))
    applyMetaFields({
      type: 'removeMetafield',
      key: 'eboxOrder',
      namespace: 'ebox',
    }).catch(() => setError('Unable to remove ebox order.'))
  }, [])

  // ensures that if user manually changes
  useEffect(() => {
    if (
      useEbox &&
      location &&
      !isSameAddress(location.value, shippingAddress)
    ) {
      setRetroAddressChange(true)
      resetEboxConfig()
    }
  }, [shippingAddress])

  const toggleEbox = (checked: boolean) => {
    // Reset location and "unmark" order as ebox one when user toggles off 'useEbox'
    if (checked === false) {
      resetEboxConfig()
    } else {
      setUseEbox(checked)
    }
  }

  const handleLocationChange = async (location: EboxLocation) => {
    setLocation(location)

    applyMetaFields({
      type: 'updateMetafield',
      key: 'eboxOrder',
      namespace: 'ebox',
      value: eboxUser.email,
      valueType: 'string',
    }).catch(() => setError('Unable to apply ebox order.'))

    updateShippingAddress({
      type: 'updateShippingAddress',
      address: location.value,
    }).catch(e => setError(`Unable to update shipping address: ${e.message}`))
  }

  return (
    <BlockStack borderRadius={'large'} border={'base'} padding={'tight'}>
      {retroAddressChange && (
        <Banner title="Warning" status="warning">
          Please do NOT change the shipping address after choosing an Ebox
          Location.
        </Banner>
      )}
      <HeadingGroup>
        <Heading level={2}>Ebox Order</Heading>
        <Heading level={3}>
          Do you want to ship to an Ebox Pickup location?
        </Heading>
      </HeadingGroup>
      <Switch
        accessibilityLabel="switch"
        label="Ship to Ebox Pickup location "
        onChange={toggleEbox}
        checked={useEbox}
      />
      {useEbox &&
        (!authorized ? (
          <Button
            overlay={
              <Modal id="sign-in" padding title="Ebox Sign In">
                <EboxSignInForm eboxUser={eboxUser} setEboxUser={setEboxUser} />
              </Modal>
            }
          >
            Sign In
          </Button>
        ) : (
          <LocationSelect
            token={eboxUser.token!}
            location={location}
            handleLocationChange={handleLocationChange}
          />
        ))}
      {error && (
        <TextBlock>
          Error: Unable to complete operation. {error} Please try again.
        </TextBlock>
      )}
    </BlockStack>
  )
}
