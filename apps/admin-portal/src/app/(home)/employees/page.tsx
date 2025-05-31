import EmployeeTable from "../../_components/employee-table";

export default function Page() {
  return (
    <main className=" container h-screen w-full py-16 md:w-9/12">
      <div className="flex flex-col items-center justify-center">
        <div className="w-full">
          <p className="my-4 font-medium">Employees</p>
          <EmployeeTable />
        </div>
      </div>
    </main>
  );
}
