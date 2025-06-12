import { UserType } from "@prisma/client";

import { api } from "../../trpc/server";
import { CorporateAnalyticsDashboard } from "./_components/corporate-analytics-dashboard";
import { EmployeeHome } from "./_components/employee-home";

export default async function Page() {
  try {
    // Get user type from server-side API
    const userTypeResult = await api.user.getUserType();

    // If user is an employee, show employee home page
    if (userTypeResult === UserType.EMPLOYEE) {
      return <EmployeeHome />;
    }

    // If user is corporate, show analytics dashboard
    if (userTypeResult === UserType.CORPORATE) {
      return <CorporateAnalyticsDashboard />;
    }

    // Fallback for unknown user types
    return (
      <div className="mt-16 flex-1 space-y-8 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="text-sm text-muted-foreground">
            Unknown user type: {userTypeResult}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    // Handle errors (e.g., unauthorized access)
    return (
      <div className="mt-16 flex-1 space-y-8 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="text-sm text-red-600">
            Error loading user information. Please try again.
          </div>
        </div>
      </div>
    );
  }
}
