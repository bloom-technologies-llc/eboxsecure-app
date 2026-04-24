import ProtectPage from "../protect-page";
import SettingsPage from "./settings-page";

export default async function Page() {
  await ProtectPage();
  return <SettingsPage />;
}
