import { SidebarTrigger } from "@ebox/ui/sidebar";

import NotificationDropdown from "./notification-dropdown";
import { PickupQRScannerButton } from "./pickup-qr-scanner";
import { UserScopeBadge } from "./user-scope-badge";

const Navbar = () => {
  return (
    <header className="fixed top-0 z-50 flex h-[--header-height] w-full items-center gap-2 bg-secondary px-3 py-4 sm:gap-4 sm:px-6">
      <SidebarTrigger
        className="shrink-0 text-secondary-foreground md:hidden"
        aria-label="Open menu"
      />
      <div className="min-w-0 overflow-hidden">
        <UserScopeBadge />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <PickupQRScannerButton />

        <NotificationDropdown />
      </div>
    </header>
  );
};

export default Navbar;
