"use client";

import { useState } from "react";
import SettingsLayout from "@/components/settings-layout";
import { Bell, Mail, Smartphone } from "lucide-react";

import { Button } from "@ebox/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ebox/ui/card";
import { Input } from "@ebox/ui/input";
import { Label } from "@ebox/ui/label";
import { Switch } from "@ebox/ui/switch";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState({
    desktop: false,
    unreadBadge: true,
    email: true,
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <SettingsLayout>
      <div className="space-y-6">
        {/* Page Header */}
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

        {/* Desktop Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Desktop Notifications
            </CardTitle>
            <CardDescription>
              Control push notifications on your desktop
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Get desktop notifications for recent updates and important
                  information
                </p>
              </div>
              <Switch
                checked={notifications.desktop}
                onCheckedChange={(checked) =>
                  handleNotificationChange("desktop", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Badge Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Unread Message Badge</CardTitle>
            <CardDescription>
              Visual indicators for unread notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Show Unread Badge</p>
                <p className="text-sm text-muted-foreground">
                  Display a red badge on the notification bell when you have
                  unread messages
                </p>
              </div>
              <Switch
                checked={notifications.unreadBadge}
                onCheckedChange={(checked) =>
                  handleNotificationChange("unreadBadge", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Notifications */}
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
                checked={notifications.email}
                onCheckedChange={(checked) =>
                  handleNotificationChange("email", checked)
                }
              />
            </div>

            {notifications.email && (
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <Label htmlFor="notificationEmail">Notification Email</Label>
                  <Input
                    id="notificationEmail"
                    type="email"
                    placeholder="Enter email for notifications"
                  />
                  <p className="text-xs text-muted-foreground">
                    This email will be used for all notification emails
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Settings */}
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
              <Button>Save Settings</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
}
