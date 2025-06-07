"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Users } from "lucide-react";

import { Button } from "@ebox/ui/button";
import { DropdownMenuSeparator } from "@ebox/ui/dropdown-menu";

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
    <div className="h-screen bg-[#F3F3F3] pb-28 pt-14">
      <div className="mx-auto flex h-full w-full rounded-md border border-[#E4E4E7] bg-white md:w-8/12">
        <div className="w-2.5/12 border-r border-[#E4E4E7] px-2 py-3">
          <div className="flex flex-col gap-y-3">
            {/* Settings Navigation */}
            <Button className="w-full justify-start bg-white text-start shadow-none">
              <a href="/settings">General</a>
            </Button>

            <Button className="w-full justify-start bg-white text-start shadow-none">
              <a href="/settings/notifications">Notifications</a>
            </Button>

            <Button className="w-full justify-start bg-white text-start shadow-none">
              <a href="/settings/authorized-pickups">Authorized pickups</a>
            </Button>

            <Button className="w-full justify-start bg-[#E4EEF1] text-start text-[#00698F] shadow-none">
              <Users className="mr-2 h-4 w-4" />
              Trusted Contacts
            </Button>

            <Button className="justify-start bg-white text-start shadow-none">
              <a href="/settings/billing">Billing</a>
            </Button>

            <Button className="justify-start bg-white text-start shadow-none">
              <a href="/">Subscription</a>
            </Button>

            <DropdownMenuSeparator />

            <Button className="justify-start bg-white text-start shadow-none">
              <span className="text-[#8F0000]">Delete my account</span>
            </Button>
          </div>
        </div>

        <div className="w-full flex-col">
          {/* Header */}
          <div className="border-b border-[#E4E4E7] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">Trusted Contacts</p>
                <p className="text-sm text-[#575959]">
                  Manage who can view your orders and pick up packages
                </p>
              </div>
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-[#00698F] hover:bg-[#005A7A]"
                disabled={grantedContacts.length >= 3}
              >
                Add Contact
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Pending invitations for current user to accept */}
            {pendingInvitations && pendingInvitations.length > 0 && (
              <div className="border-b border-[#E4E4E7] p-4">
                <h3 className="mb-3 text-lg font-semibold">
                  Pending Invitations
                </h3>
                <p className="mb-4 text-sm text-[#575959]">
                  You have been invited to be a trusted contact for these
                  accounts
                </p>
                <div className="space-y-2">
                  {pendingInvitations.map((invitation) => (
                    <InvitationCard
                      key={invitation.id}
                      invitation={invitation}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Active trusted contacts that user has granted access to */}
            <div className="border-b border-[#E4E4E7] p-4">
              <h3 className="mb-3 text-lg font-semibold">
                Your Trusted Contacts
              </h3>
              <p className="mb-4 text-sm text-[#575959]">
                These people can view your orders and pick up packages (
                {grantedContacts.length}/3)
              </p>

              {loadingContacts ? (
                <div className="py-8 text-center">Loading...</div>
              ) : grantedContacts.length === 0 ? (
                <div className="py-8 text-center text-[#575959]">
                  No trusted contacts added yet. Add someone to get started.
                </div>
              ) : (
                <div className="space-y-2">
                  {grantedContacts.map((contact) => (
                    <TrustedContactCard
                      key={contact.id}
                      contact={contact}
                      type="granted"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Accounts where user is a trusted contact */}
            {receivedContacts.length > 0 && (
              <div className="p-4">
                <h3 className="mb-3 text-lg font-semibold">
                  Accounts You Can Access
                </h3>
                <p className="mb-4 text-sm text-[#575959]">
                  You are a trusted contact for these accounts
                </p>
                <div className="space-y-2">
                  {receivedContacts.map((contact) => (
                    <TrustedContactCard
                      key={contact.id}
                      contact={contact}
                      type="received"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Trusted Contact Modal */}
      <AddTrustedContactModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}
