import { Card, TextContainer, Text } from '@shopify/polaris'
import { useAppBridge } from '@shopify/app-bridge-react'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'

export function OrdersCard() {
  const shopify = useAppBridge()
  const { t } = useTranslation()

  const { data, error, isLoading } = useQuery({
    queryKey: ['ordersCount'],
    queryFn: async () => {
      const response = await fetch('/api/shopify/orders/count')
      return await response.json()
    },
    onError: () => {
      shopify.toast.show(t('OrdersCard.errorFetchingOrdersToast'), {
        isError: true,
      })
    },
    refetchOnWindowFocus: false,
  })
  return (
    <Card title={t('OrdersCard.title')} sectioned>
      <TextContainer spacing="loose">
        <p>{t('OrdersCard.description')}</p>
        <Text as="h4" variant="headingMd">
          {t('OrdersCard.totalOrdersHeading')}
          <Text variant="bodyMd" as="p" fontWeight="semibold">
            {error && t('OrdersCard.errorFetchingOrders')}
            {isLoading && t('OrdersCard.loading')}
            {data?.count}
          </Text>
        </Text>
      </TextContainer>
    </Card>
  )
}
