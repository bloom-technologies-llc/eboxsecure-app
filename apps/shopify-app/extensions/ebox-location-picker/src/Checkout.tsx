import { useCallback, useEffect, useState } from 'react'
import {
  reactExtension,
  Banner,
  BlockStack,
  Switch,
  useApplyAttributeChange,
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
  // The ebox link is carried as a cart attribute. It reliably lands in the
  // order's note_attributes, which the webhook ingestor reads to link the order.
  // (Checkout-UI metafields were removed in API 2026-04 and never propagated to
  // the orders/create webhook anyway — see spike #53.)
  const applyAttributeChange = useApplyAttributeChange()
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
    // Cart attributes can't be removed, only cleared — empty JSON parses to null
    // in the ingestor, so a toggled-off order carries no stale ebox link.
    applyAttributeChange({
      type: 'updateAttribute',
      key: 'eboxOrder',
      value: '',
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
    if (!eboxUser.customerId) {
      setError('Please sign in before choosing a location.')
      return
    }
    setLocation(location)

    // The webhook ingestor links a Shopify order to an EboxSecure order purely
    // from this attribute (ADR 0001): it must carry the authenticated shopper's
    // customerId and the chosen locationId as JSON, not a bare email string.
    // Cart attributes always reach the orders/create webhook as note_attributes.
    applyAttributeChange({
      type: 'updateAttribute',
      key: 'eboxOrder',
      value: JSON.stringify({
        customerId: eboxUser.customerId,
        locationId: location.id,
      }),
    }).catch(() => setError('Unable to apply ebox order.'))

    // Auto-fill the shipper's name from their EboxSecure account so they don't
    // have to retype it. Merged with the location address in one apply.
    updateShippingAddress({
      type: 'updateShippingAddress',
      address: {
        ...location.value,
        firstName: eboxUser.firstName,
        lastName: eboxUser.lastName,
      },
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
