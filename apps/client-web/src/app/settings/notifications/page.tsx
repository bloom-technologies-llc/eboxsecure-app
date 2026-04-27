"use client";

import { useEffect, useState } from "react";
import SettingsLayout from "@/components/settings-layout";
import { api } from "@/trpc/react";
import { Bell, Mail, MessageSquare, Smartphone } from "lucide-react";

import { Button } from "@ebox/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ebox/ui/card";
import { useToast } from "@ebox/ui/hooks/use-toast";
import { Input } from "@ebox/ui/input";
import { Label } from "@ebox/ui/label";
import { Switch } from "@ebox/ui/switch";

export default function NotificationsPage() {
  const { toast } = useToast();
  const { data: preferences, isLoading } =
    api.notification.getPreferences.useQuery();
  const utils = api.useUtils();

  const { mutate: updatePreferences, isPending } =
    api.notification.updatePreferences.useMutation({
      onSuccess: () => {
        utils.notification.getPreferences.invalidate();
        toast({ description: "Notification settings saved" });
      },
      onError: () => {
        toast({
          description: "Failed to save settings",
          variant: "destructive",
        });
      },
    });

  const [settings, setSettings] = useState({
    pushEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    notificationEmail: "",
    phoneNumber: "",
  });

  useEffect(() => {
    if (preferences) {
      setSettings({
        pushEnabled: preferences.pushEnabled,
        emailEnabled: preferences.emailEnabled,
        smsEnabled: preferences.smsEnabled,
        notificationEmail: preferences.notificationEmail ?? "",
        phoneNumber: preferences.phoneNumber ?? "",
      });
    }
  }, [preferences]);

  const handleSave = () => {
    updatePreferences({
      pushEnabled: settings.pushEnabled,
      emailEnabled: settings.emailEnabled,
      smsEnabled: settings.smsEnabled,
      notificationEmail: settings.notificationEmail || null,
      phoneNumber: settings.phoneNumber || null,
    });
  };

  if (isLoading) {
    return (
      <SettingsLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Manage how and when you receive notifications
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Push Notifications
            </CardTitle>
            <CardDescription>
              Control push notifications on your devices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Get push notifications for order updates and important
                  information
                </p>
              </div>
              <Switch
                checked={settings.pushEnabled}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, pushEnabled: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Notifications
            </CardTitle>
            <CardDescription>Receive notifications via email</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Email Updates</p>
                <p className="text-sm text-muted-foreground">
                  Receive notifications in your email for order updates and
                  important information
                </p>
              </div>
              <Switch
                checked={settings.emailEnabled}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, emailEnabled: checked }))
                }
              />
            </div>

            {settings.emailEnabled && (
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <Label htmlFor="notificationEmail">Notification Email</Label>
                  <Input
                    id="notificationEmail"
                    type="email"
                    placeholder="Enter email for notifications"
                    value={settings.notificationEmail}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        notificationEmail: e.target.value,
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave blank to use your account email
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              SMS Notifications
            </CardTitle>
            <CardDescription>
              EboxSecure SMS Notifications &mdash; transactional text messages
              about your packages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2 rounded-md border border-muted bg-muted/30 p-4 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">
                  Program description:
                </span>{" "}
                If you opt in, EboxSecure will send you transactional SMS text
                messages related to your account, including package delivery and
                pickup notifications, overdue holding fee alerts, shared order
                notifications, and trusted-contact invitations.
              </p>
              <p>
                <span className="font-medium text-foreground">Frequency:</span>{" "}
                Message frequency varies based on your package activity.
              </p>
              <p>
                <span className="font-medium text-foreground">Cost:</span>{" "}
                Message and data rates may apply. EboxSecure does not charge for
                SMS messages; charges from your wireless carrier may apply.
              </p>
              <p>
                <span className="font-medium text-foreground">Opt out:</span>{" "}
                Reply <span className="font-semibold">STOP</span> to any
                message, or toggle SMS notifications off on this page, to
                unsubscribe at any time.
              </p>
              <p>
                <span className="font-medium text-foreground">Help:</span> Reply{" "}
                <span className="font-semibold">HELP</span> to any message, or
                contact{" "}
                <a
                  href="mailto:support@eboxsecure.com"
                  className="underline underline-offset-2"
                >
                  support@eboxsecure.com
                </a>
                .
              </p>
              <p>
                By enabling SMS notifications and submitting your phone number,
                you agree to receive recurring transactional SMS text messages
                from EboxSecure at the number provided, sent using automated
                technology. Consent to receive SMS messages is not a condition
                of any purchase. We will not share your mobile number or SMS
                opt-in data with third parties or affiliates for their marketing
                or promotional purposes. See our{" "}
                <a
                  href="https://eboxsecure.com/privacy"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2"
                >
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a
                  href="https://eboxsecure.com/terms"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2"
                >
                  Terms of Service
                </a>{" "}
                for details.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Enable SMS notifications</p>
                <p className="text-sm text-muted-foreground">
                  Off by default. Toggle on to receive transactional SMS
                  messages about your packages.
                </p>
              </div>
              <Switch
                checked={settings.smsEnabled}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, smsEnabled: checked }))
                }
              />
            </div>

            {settings.smsEnabled && (
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Mobile phone number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={settings.phoneNumber}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        phoneNumber: e.target.value,
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    U.S. mobile number that can receive SMS. By providing this
                    number you confirm you are the subscriber or are authorized
                    by the subscriber to opt in.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  Save Notification Settings
                </p>
                <p className="text-sm text-muted-foreground">
                  Your preferences will be applied immediately
                </p>
              </div>
              <Button onClick={handleSave} disabled={isPending}>
                {isPending ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
}
