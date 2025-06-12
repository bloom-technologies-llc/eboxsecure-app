import CustomersTable from "../../_components/customers-table";

export default function CustomersPage() {
  return (
    <main className="container h-screen w-full py-16 md:w-9/12">
      <div className="flex flex-col items-center justify-center">
        <div className="w-full">
          <p className="my-4 font-medium">Customers</p>
          <CustomersTable />
        </div>
      </div>
    </main>
  );
}
