import { z } from 'zod'

// Define the expected environment variables using Zod
const envSchema = z.object({
  PORT: z
    .string()
    .regex(/^\d+$/, 'PORT should be a valid number')
    .default('3000'),
  DATABASE_URL: z.string(),
  MONOREPO_API_URL: z.string().url(),
  SHOPIFY_INTEGRATION_API_KEY: z.string().min(1),
  SHOPIFY_INTEGRATION_JWT_SECRET: z.string().min(32),
})

// Validate environment variables
export const validateEnv = () => {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    const { issues } = result.error
    console.error('Missing or invalid environment variables:')
    issues.forEach(issue => {
      console.error(`  - ${issue.path} - ${issue.message}`)
    })
    process.exit(1) // Exit the app if validation fails
  }
  console.log('Environment variables validated')

  return result.data
}
