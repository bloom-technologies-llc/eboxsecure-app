import { useEffect, useState } from 'react'
import { Banner, Select, Spinner } from '@shopify/ui-extensions-react/checkout'
import { ShippingAddress } from '@shopify/ui-extensions/checkout'
import { EboxLocation } from '../types'
import { BASE_URL } from '../constants'

type LocationSelectProps = {
  token: string
  location?: EboxLocation
  handleLocationChange: (address: ShippingAddress) => void
}

export const LocationSelect = ({
  token,
  location,
  handleLocationChange,
}: LocationSelectProps) => {
  const [data, setData] = useState<EboxLocation[]>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/ebox/locations`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const { data: locations } = (await response.json()) as {
          data: EboxLocation[]
        }
        setData(locations)
        setLoading(false)
      } catch (e) {
        setError(e.message)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleLocationSelect = (addressLabel: string) => {
    for (var i = 0; i < data.length; i++) {
      if (data[i].label === addressLabel) {
        handleLocationChange(data[i])
        return
      }
    }
  }

  const options = (data ?? []).map(loc => ({
    label: loc.name,
    value: loc.label,
  }))

  return (
    <>
      {!loading && !error && (
        <Select
          label="Select your Ebox Location"
          value={location?.label ?? ""}
          onChange={handleLocationSelect}
          options={options}
        />
      )}
      {loading && <Spinner />}
      {error && (
        <Banner status="critical" title={`Unable to get locations: ${error}`} />
      )}
    </>
  )
}
