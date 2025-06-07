import { Plus } from "lucide-react";

import { Button } from "@ebox/ui/button";

import LocationsTable from "~/app/_components/locations-table";
import CreateLocationDialog from "~/app/_components/locations/create-location-dialog";
import { api } from "~/trpc/server";

export default async function LocationsPage() {
  try {
    const locations = await api.locations.getAllLocations();

    return (
      <main className="container h-screen w-full py-16 md:w-9/12">
        <div className="flex flex-col items-center justify-center">
          <div className="w-full">
            <div className="my-4 flex items-center justify-between">
              <p className="font-medium">Locations</p>
              <CreateLocationDialog>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Location
                </Button>
              </CreateLocationDialog>
            </div>
            <LocationsTable locations={locations} />
          </div>
        </div>
      </main>
    );
  } catch (error) {
    return (
      <main className="container h-screen w-full py-16 md:w-9/12">
        <div className="flex flex-col items-center justify-center">
          <div className="w-full">
            <p className="my-4 font-medium">Locations</p>
            <div className="text-center text-red-500">
              Access denied or error loading locations
            </div>
          </div>
        </div>
      </main>
    );
  }
}
