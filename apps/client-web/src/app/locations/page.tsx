import ProtectPage from "../protect-page";
import LocationsPage from "./locations-page";

export default async function Page() {
  await ProtectPage();

  return <LocationsPage />;
}
