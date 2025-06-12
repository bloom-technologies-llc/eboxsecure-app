import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import type { RouterOutputs } from "@ebox/admin-api";

interface EmployeeHeaderProps {
  employee: RouterOutputs["employees"]["getEmployeeDetails"];
}

export default function EmployeeHeader({ employee }: EmployeeHeaderProps) {
  return (
    <div className="flex items-center gap-x-2">
      <Link
        href="/employees"
        className="flex items-center gap-x-2 hover:text-gray-600"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Employees</span>
      </Link>
      <span className="text-gray-400">•</span>
      <h1 className="text-xl font-semibold">{employee.fullName}</h1>
    </div>
  );
}
