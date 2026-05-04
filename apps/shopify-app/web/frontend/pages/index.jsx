import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Text,
} from '@shopify/polaris'
import { TitleBar } from '@shopify/app-bridge-react'
import { useTranslation, Trans } from 'react-i18next'

import { trophyImage } from '../assets'
import { OrdersCard } from '../components/OrdersCard'

export default function HomePage() {
  const { t } = useTranslation()
  return (
    <Page narrowWidth>
      <TitleBar title={t('HomePage.title')} />
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Stack
              wrap={false}
              spacing="extraTight"
              distribution="trailing"
              alignment="center"
            >
              <Stack.Item fill>
                <TextContainer spacing="loose">
                  <Text as="h1" variant="headingLg">
                    {t('HomePage.heading')}
                  </Text>
                  <p>{t('HomePage.paragraph')}</p>
                </TextContainer>
              </Stack.Item>
              <Stack.Item>
                <div style={{ padding: '0 20px' }}>
                  <Image
                    source={trophyImage}
                    alt={t('HomePage.trophyAltText')}
                    width={120}
                  />
                </div>
              </Stack.Item>
            </Stack>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <OrdersCard />
        </Layout.Section>
      </Layout>
    </Page>
  )
}
