import { notFound } from "next/navigation";

import CustomerCommentFormContainer from "~/app/_components/customers/customer-comment-form-container";
import CustomerCommentsSection from "~/app/_components/customers/customer-comments-section";
import CustomerDetailsCard from "~/app/_components/customers/customer-details-card";
import CustomerDetailsLayout from "~/app/_components/customers/customer-details-layout";
import CustomerHeader from "~/app/_components/customers/customer-header";
import { api } from "~/trpc/server";

interface CustomerDetailProps {
  params: {
    customerId: string;
  };
  searchParams: {
    highlight?: string;
  };
}

export default async function CustomerDetail({
  params,
  searchParams,
}: CustomerDetailProps) {
  const { customerId } = params;
  const highlightedCommentId = searchParams.highlight || null;

  try {
    const [customerDetails, customerComments] = await Promise.all([
      api.customers.getCustomerDetails({
        customerId: customerId,
      }),
      api.customers.customerComments.query({
        customerId: customerId,
      }),
    ]);

    if (!customerDetails) {
      notFound();
    }

    return (
      <CustomerDetailsLayout
        header={
          <div className="my-6 flex items-center gap-x-2">
            <CustomerHeader customer={customerDetails} />
          </div>
        }
        detailPanels={<CustomerDetailsCard customer={customerDetails} />}
      >
        <div className="flex flex-col gap-y-6">
          <CustomerCommentFormContainer customerId={customerDetails.id} />

          <CustomerCommentsSection
            comments={customerComments || []}
            highlightedCommentId={highlightedCommentId}
            customerId={customerDetails.id}
          />
        </div>
      </CustomerDetailsLayout>
    );
  } catch (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <h1>Customer not found or access denied</h1>
      </div>
    );
  }
}
