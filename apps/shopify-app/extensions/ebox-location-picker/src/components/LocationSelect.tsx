import { useEffect, useState } from 'preact/hooks'

import { BASE_URL } from '../constants'
import { EboxLocation } from '../types'

type LocationSelectProps = {
  token: string
  location?: EboxLocation
  handleLocationChange: (location: EboxLocation) => void
}

export const LocationSelect = ({
  token,
  location,
  handleLocationChange,
}: LocationSelectProps) => {
  const [data, setData] = useState<EboxLocation[]>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <>
      {!loading && !error && (
        <s-select
          label="Select your Ebox Location"
          value={location?.label ?? ''}
          onChange={event =>
            handleLocationSelect(
              (event.currentTarget as HTMLInputElement).value,
            )
          }
        >
          {(data ?? []).map(loc => (
            <s-option key={loc.label} value={loc.label}>
              {loc.name}
            </s-option>
          ))}
        </s-select>
      )}
      {loading && <s-spinner accessibilityLabel="Loading locations" />}
      {error && (
        <s-banner
          tone="critical"
          heading={`Unable to get locations: ${error}`}
        />
      )}
    </>
  )
}
