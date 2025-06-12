"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface CustomerHeaderProps {
  customer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
}

export default function CustomerHeader({ customer }: CustomerHeaderProps) {
  const router = useRouter();

  const customerName =
    customer.firstName || customer.lastName
      ? `${customer.firstName || ""} ${customer.lastName || ""}`.trim()
      : "Unnamed Customer";

  return (
    <div
      className="flex cursor-pointer items-center gap-x-2"
      onClick={() => router.push("/customers")}
    >
      <ArrowLeft className="h-4 w-4" />
      <p className="font-medium">{customerName}</p>
    </div>
  );
}
