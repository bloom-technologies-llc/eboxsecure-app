import { Container } from "../ui/container";

export function IntegrationTechnical() {
  return (
    <div id="api-documentation" className="bg-muted/50 py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            API Integration
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Technical Details
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            For businesses requiring custom integration, our comprehensive API
            provides all the functionality needed to integrate EboxSecure into
            your platform.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          <div className="rounded-xl bg-background p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-foreground">
              API Endpoints
            </h3>
            <div className="mt-6 border-t border-muted pt-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-base font-semibold text-foreground">
                    Location Management
                  </h4>
                  <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                    <p>
                      <code className="rounded bg-muted px-1 py-0.5">
                        GET /api/locations
                      </code>{" "}
                      - List all available EboxSecure locations
                    </p>
                    <p>
                      <code className="rounded bg-muted px-1 py-0.5">
                        GET /api/locations/{"{id}"}
                      </code>{" "}
                      - Get details for a specific location
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-foreground">
                    Package Tracking
                  </h4>
                  <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                    <p>
                      <code className="rounded bg-muted px-1 py-0.5">
                        POST /api/packages
                      </code>{" "}
                      - Register a new package
                    </p>
                    <p>
                      <code className="rounded bg-muted px-1 py-0.5">
                        GET /api/packages/{"{id}"}
                      </code>{" "}
                      - Get package status
                    </p>
                    <p>
                      <code className="rounded bg-muted px-1 py-0.5">
                        PUT /api/packages/{"{id}"}/status
                      </code>{" "}
                      - Update package status
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-foreground">
                    Customer Management
                  </h4>
                  <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                    <p>
                      <code className="rounded bg-muted px-1 py-0.5">
                        POST /api/customers
                      </code>{" "}
                      - Register a new customer
                    </p>
                    <p>
                      <code className="rounded bg-muted px-1 py-0.5">
                        GET /api/customers/{"{id}"}
                      </code>{" "}
                      - Get customer details
                    </p>
                    <p>
                      <code className="rounded bg-muted px-1 py-0.5">
                        GET /api/customers/{"{id}"}/packages
                      </code>{" "}
                      - List customer packages
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-foreground">
                    Webhooks
                  </h4>
                  <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                    <p>
                      <code className="rounded bg-muted px-1 py-0.5">
                        POST /api/webhooks
                      </code>{" "}
                      - Register a new webhook endpoint
                    </p>
                    <p>
                      <code className="rounded bg-muted px-1 py-0.5">
                        GET /api/webhooks
                      </code>{" "}
                      - List registered webhooks
                    </p>
                    <p>
                      <code className="rounded bg-muted px-1 py-0.5">
                        DELETE /api/webhooks/{"{id}"}
                      </code>{" "}
                      - Delete a webhook
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-xl bg-background p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-foreground">
              Authentication
            </h3>
            <p className="mt-2 text-muted-foreground">
              All API requests require authentication using API keys. You can
              generate API keys in your EboxSecure dashboard.
            </p>
            <div className="mt-4 rounded bg-muted/70 p-4">
              <pre className="overflow-x-auto text-xs text-muted-foreground">
                <code>
                  {`// Example API request with authentication
fetch('https://api.eboxsecure.com/api/locations', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
