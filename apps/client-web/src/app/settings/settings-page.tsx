"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SettingsLayout from "@/components/settings-layout";
import { api } from "@/trpc/react";
import { useUser } from "@clerk/nextjs";
import { Lock, Mail, Save, User } from "lucide-react";

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

const NAME_PATTERN = /^\p{L}[\p{L}\p{M} .'’-]*$/u;
const MIN_PASSWORD_LENGTH = 8;

function validateName(label: string, value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return `${label} is required.`;
  if (trimmed.length > 50) return `${label} must be 50 characters or fewer.`;
  if (!NAME_PATTERN.test(trimmed)) {
    return `${label} can only contain letters, spaces, hyphens, apostrophes and periods.`;
  }
  return null;
}

function clerkErrorMessage(error: unknown, fallback: string): string {
  const first = (
    error as { errors?: { longMessage?: string; message?: string }[] }
  )?.errors?.[0];
  return first?.longMessage ?? first?.message ?? fallback;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const utils = api.useUtils();
  const { data: profile, isLoading } = api.user.getProfile.useQuery();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName);
      setLastName(profile.lastName);
    }
  }, [profile]);

  const updateName = api.user.updateName.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.user.getProfile.invalidate(), user?.reload()]);
      toast({ title: "Saved", description: "Your name has been updated." });
    },
    onError: (error) => {
      toast({
        title: "Could not save your name",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const nameUnchanged =
    firstName.trim() === profile?.firstName &&
    lastName.trim() === profile?.lastName;

  const handleSaveName = (event: React.FormEvent) => {
    event.preventDefault();
    const error =
      validateName("First name", firstName) ??
      validateName("Last name", lastName);
    setNameError(error);
    if (error) return;
    updateName.mutate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });
  };

  const handleSavePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    let error: string | null = null;
    if (!currentPassword) {
      error = "Enter your current password.";
    } else if (newPassword.length < MIN_PASSWORD_LENGTH) {
      error = `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    } else if (newPassword === currentPassword) {
      error = "New password must be different from your current password.";
    } else if (newPassword !== confirmPassword) {
      error = "New password and confirmation do not match.";
    }
    setPasswordError(error);
    if (error) return;

    setSavingPassword(true);
    try {
      await user.updatePassword({
        currentPassword,
        newPassword,
        signOutOfOtherSessions: true,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({
        title: "Password updated",
        description: "Your other devices have been signed out.",
      });
    } catch (err) {
      setPasswordError(
        clerkErrorMessage(err, "Could not update your password."),
      );
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <SettingsLayout>
      <div className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Your name must match the name on packages shipped to you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveName} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    autoComplete="given-name"
                    maxLength={50}
                    disabled={isLoading}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    autoComplete="family-name"
                    maxLength={50}
                    disabled={isLoading}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              {nameError && (
                <p role="alert" className="text-sm text-destructive">
                  {nameError}
                </p>
              )}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isLoading || nameUnchanged || updateName.isPending}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {updateName.isPending ? "Saving..." : "Save Name"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Address
            </CardTitle>
            <CardDescription>
              The email address you sign in with
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              readOnly
              disabled
              value={profile?.email ?? ""}
            />
            <p className="text-sm text-muted-foreground">
              To choose where notifications are sent, go to{" "}
              <Link
                href="/settings/notifications"
                className="font-medium underline"
              >
                notification settings
              </Link>
              .
            </p>
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Account Security
            </CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSavePassword}
              className="space-y-4"
              noValidate
            >
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              {passwordError && (
                <p role="alert" className="text-sm text-destructive">
                  {passwordError}
                </p>
              )}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={
                    savingPassword ||
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword
                  }
                >
                  <Save className="mr-2 h-4 w-4" />
                  {savingPassword ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
}
