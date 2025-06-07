import { notFound } from "next/navigation";

import EmployeeCommentFormContainer from "~/app/_components/employees/employee-comment-form-container";
import EmployeeCommentsSection from "~/app/_components/employees/employee-comments-section";
import EmployeeDetailsCard from "~/app/_components/employees/employee-details-card";
import EmployeeDetailsLayout from "~/app/_components/employees/employee-details-layout";
import EmployeeHeader from "~/app/_components/employees/employee-header";
import { api } from "~/trpc/server";

interface EmployeeDetailProps {
  params: {
    employeeId: string;
  };
  searchParams: {
    highlight?: string;
  };
}

export default async function EmployeeDetail({
  params,
  searchParams,
}: EmployeeDetailProps) {
  const { employeeId } = params;
  const highlightedCommentId = searchParams.highlight || null;

  try {
    const [employeeDetails, employeeComments] = await Promise.all([
      api.employees.getEmployeeDetails({
        employeeId,
      }),
      api.employeeComments.query({
        employeeId,
      }),
    ]);

    if (!employeeDetails) {
      notFound();
    }

    return (
      <EmployeeDetailsLayout
        header={
          <div className="my-6 flex items-center gap-x-2">
            <EmployeeHeader employee={employeeDetails} />
          </div>
        }
        detailPanels={<EmployeeDetailsCard employee={employeeDetails} />}
      >
        <div className="flex flex-col gap-y-6">
          <EmployeeCommentFormContainer employeeId={employeeDetails.id} />

          <EmployeeCommentsSection
            comments={employeeComments || []}
            highlightedCommentId={highlightedCommentId}
            employeeId={employeeDetails.id}
          />
        </div>
      </EmployeeDetailsLayout>
    );
  } catch (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <h1>Employee not found or access denied</h1>
      </div>
    );
  }
}
