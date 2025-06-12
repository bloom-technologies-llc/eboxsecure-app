import { api } from "~/trpc/server";
import EmployeeCommentForm from "./employee-comment-form";

interface EmployeeCommentFormContainerProps {
  employeeId: string;
}

export default async function EmployeeCommentFormContainer({
  employeeId,
}: EmployeeCommentFormContainerProps) {
  const mentionableEmployees = await api.employees.getEmployeeLocationEmployees(
    {
      employeeId: employeeId,
    },
  );

  return (
    <EmployeeCommentForm
      employeeId={employeeId}
      mentionableEmployees={mentionableEmployees || []}
    />
  );
}
