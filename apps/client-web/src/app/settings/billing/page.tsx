"use client";

import { useRouter } from "next/navigation";
import SettingsLayout from "@/components/settings-layout";
import { api } from "@/trpc/react";
import { CreditCard, Plus } from "lucide-react";

import { Button } from "@ebox/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ebox/ui/card";

export default function BillingPage() {
  const router = useRouter();

  const { mutate: createBillingPortalSession } =
    api.subscription.createBillingPortalSession.useMutation({
      onSuccess: (data) => {
        router.push(data.url);
      },
      onError: (error) => {
        console.error(error);
      },
    });
  return (
    <SettingsLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Billing & Payment
            </CardTitle>
            <CardDescription>
              Manage your payment methods and view billing history
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Your saved payment methods for subscriptions
                </CardDescription>
              </div>

              <Button
                type="submit"
                onClick={() => createBillingPortalSession()}
              >
                <Plus className="mr-2 h-4 w-4" />
                Manage Payment Methods
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Click "Manage Payment Methods" to add, edit, or remove your
                payment methods through our secure billing portal.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>
                  Your recent invoices and payment history
                </CardDescription>
              </div>

              <Button
                variant="outline"
                type="submit"
                onClick={() => createBillingPortalSession()}
              >
                View All Invoices
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Access your complete billing history and download invoices
                through our secure billing portal.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
}
