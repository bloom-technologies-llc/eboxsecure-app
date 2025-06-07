import Link from "next/link";
import { ArrowLeft, Mail, Phone, User } from "lucide-react";

import type { RouterOutputs } from "@ebox/admin-api";
import { Button } from "@ebox/ui/button";

type CarrierDetails = RouterOutputs["carriers"]["getCarrierDetails"];

interface CarrierHeaderProps {
  carrier: CarrierDetails;
}

export default function CarrierHeader({ carrier }: CarrierHeaderProps) {
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-4">
        <Link href="/carriers">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>

        <div>
          <h1 className="text-2xl font-bold">{carrier.name}</h1>
          <div className="mt-2 flex flex-col gap-1 text-sm text-gray-600">
            {carrier.contactName && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{carrier.contactName}</span>
              </div>
            )}
            {carrier.contactEmail && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{carrier.contactEmail}</span>
              </div>
            )}
            {carrier.contactPhone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{carrier.contactPhone}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
