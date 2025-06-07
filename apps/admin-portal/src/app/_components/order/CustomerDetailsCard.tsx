import { CircleArrowUp } from "lucide-react";

interface CustomerDetailsCardProps {
  customer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phoneNumber: string | null;
    shippingAddress: string | null;
  };
}

export default function CustomerDetailsCard({
  customer,
}: CustomerDetailsCardProps) {
  return (
    <div className="flex w-fit flex-col gap-y-6">
      <div className="rounded-lg border border-border bg-white px-6 py-4">
        <div className="flex flex-col gap-y-6">
          <div className="flex flex-col gap-y-3">
            <div className="flex items-center">
              <p className="w-full font-medium">Customer</p>
            </div>
            <p className="text-sm text-secondary">
              {customer.firstName || "N/A"} {customer.lastName || ""}
            </p>
          </div>

          <div className="flex flex-col gap-y-3">
            <p className="font-medium ">Contact information</p>
            <p className="text-sm text-secondary">{customer.email || "N/A"}</p>
            <p className="text-gray text-sm">{customer.phoneNumber || "N/A"}</p>
          </div>

          <div className="flex flex-col gap-y-3">
            <p className="font-medium">Shipping address</p>
            <p className="text-gray text-sm">
              {customer.shippingAddress || "N/A"}
            </p>
          </div>

          <div className="flex flex-col gap-y-3">
            <p className="font-medium">Billing address</p>
            <p className="text-gray text-sm">Same as shipping address</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white px-6 py-4">
        <div className="flex flex-col gap-y-3">
          <p className="font-medium">Eligible recipients</p>
          <div className="flex items-center gap-x-2">
            <CircleArrowUp className="h-4 w-4" />
            {/* TODO: integrate with trusted contacts */}
            <p className="text-gray text-sm">N/A</p>
          </div>
        </div>
      </div>
    </div>
  );
}
