"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";

import { Badge } from "@ebox/ui/badge";
import { Button } from "@ebox/ui/button";
import { useToast } from "@ebox/ui/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ebox/ui/table";

import { api } from "~/trpc/react";

export default function PendingInvitationsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const utils = api.useUtils();

  const { data, isLoading, error } =
    api.invitations.getPendingInvitations.useQuery();

  const revokeInvitation = api.invitations.revokeInvitation.useMutation({
    onSuccess: () => {
      toast({
        title: "Invitation revoked",
        description: "The invitation has been revoked successfully",
      });
      void utils.invitations.getPendingInvitations.invalidate();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to revoke invitation",
        description: error.message,
      });
    },
  });

  const [revokingId, setRevokingId] = useState<number | null>(null);

  const handleRevoke = (id: number) => {
    setRevokingId(id);
    revokeInvitation.mutate(
      { id },
      {
        onSettled: () => setRevokingId(null),
      },
    );
  };

  if (error) {
    return (
      <div className="w-full overflow-hidden rounded-lg border bg-white p-4">
        <p className="text-sm text-red-600">
          Failed to load pending invitations
        </p>
      </div>
    );
  }

  const invitations = data?.invitations ?? [];

  if (!isLoading && invitations.length === 0) {
    return null;
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border bg-white">
      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Loading invitations...</span>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead>Email</TableHead>
                  <TableHead>Account Type</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Invited Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell>{invitation.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          invitation.accountType === "CORPORATE"
                            ? "bg-purple-200"
                            : "bg-blue-200"
                        }
                      >
                        {invitation.accountType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {invitation.employeeRole ? (
                        <Badge variant="secondary">
                          {invitation.employeeRole}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {invitation.locationName ?? (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(invitation.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRevoke(invitation.id)}
                        disabled={revokingId === invitation.id}
                      >
                        {revokingId === invitation.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Revoke"
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
