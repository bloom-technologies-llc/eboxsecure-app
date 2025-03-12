import ClientTable from "../../_components/client-table";

export default function Page() {
  return (
    <main className=" container h-screen w-full py-16 md:w-9/12">
      <div className="flex flex-col items-center justify-center">
        <div className="w-full">
          <p className="my-4 font-medium">Clients</p>
          <ClientTable />
        </div>
      </div>
    </main>
  );
}
