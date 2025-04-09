import LocationsTable from "~/app/_components/locations-table";

const LocationsPage = () => {
  return (
    <main className=" container h-screen w-full py-16 md:w-9/12">
      <div className="flex flex-col items-center justify-center">
        <div className="w-full">
          <p className="my-4 font-medium">Locations</p>
          <LocationsTable />
        </div>
      </div>
    </main>
  );
};

export default LocationsPage;
