"use client";

import { useState } from "react";
import SettingsLayout from "@/components/settings-layout";
import { api } from "@/trpc/react";
import { Plus, Users } from "lucide-react";

import { Button } from "@ebox/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ebox/ui/card";

import AddTrustedContactModal from "./components/AddTrustedContactModal";
import InvitationCard from "./components/InvitationCard";
import TrustedContactCard from "./components/TrustedContactCard";

export default function TrustedContactsPage() {
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: trustedContactsData, isLoading: loadingContacts } =
    api.trustedContacts.getMyTrustedContacts.useQuery();
  const { data: pendingInvitations, isLoading: loadingInvitations } =
    api.trustedContacts.getPendingInvitations.useQuery();

  // Extract arrays from API response
  const grantedContacts = trustedContactsData?.grantedContacts || [];
  const receivedContacts = trustedContactsData?.receivedContacts || [];

  return (
    <SettingsLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Trusted Contacts
                </CardTitle>
                <CardDescription>
                  Manage who can view your orders and pick up packages
                </CardDescription>
              </div>
              <Button
                onClick={() => setShowAddModal(true)}
                disabled={grantedContacts.length >= 3}
                className="ml-4"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Pending invitations for current user to accept */}
        {pendingInvitations && pendingInvitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
              <CardDescription>
                You have been invited to be a trusted contact for these accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingInvitations.map((invitation) => (
                  <InvitationCard key={invitation.id} invitation={invitation} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active trusted contacts that user has granted access to */}
        <Card>
          <CardHeader>
            <CardTitle>Your Trusted Contacts</CardTitle>
            <CardDescription>
              These people can view your orders and pick up packages (
              {grantedContacts.length}/3)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingContacts ? (
              <div className="py-8 text-center text-muted-foreground">
                Loading...
              </div>
            ) : grantedContacts.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No trusted contacts added yet. Add someone to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {grantedContacts.map((contact) => (
                  <TrustedContactCard
                    key={contact.id}
                    contact={contact}
                    type="granted"
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Accounts where user is a trusted contact */}
        {receivedContacts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Accounts You Can Access</CardTitle>
              <CardDescription>
                You are a trusted contact for these accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {receivedContacts.map((contact) => (
                  <TrustedContactCard
                    key={contact.id}
                    contact={contact}
                    type="received"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Trusted Contact Modal */}
      <AddTrustedContactModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </SettingsLayout>
  );
}
