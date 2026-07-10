import NotificationDropdown from "./notification-dropdown";
import { PickupQRScannerButton } from "./pickup-qr-scanner";
import { SearchForm } from "./search-form";
import { UserScopeBadge } from "./user-scope-badge";

const Navbar = () => {
  return (
    <header className="fixed top-0 z-50 flex h-[--header-height] w-full items-center gap-4 bg-secondary px-6 py-4">
      <UserScopeBadge />

      <div className="ml-auto flex items-center gap-2">
        <PickupQRScannerButton />

        <NotificationDropdown />
        <SearchForm className="w-full sm:ml-auto sm:w-auto" />
      </div>
    </header>
  );
};

export default Navbar;
