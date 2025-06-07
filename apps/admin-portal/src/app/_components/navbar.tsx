import { Bell } from "lucide-react";

import { Button } from "@ebox/ui/button";

import NotificationDropdown from "./notification-dropdown";
import { SearchForm } from "./search-form";

const Navbar = () => {
  return (
    <header className="fixed top-0 z-50 flex h-[--header-height] w-full items-center bg-secondary px-6 py-4">
      <div className="ml-auto flex items-center gap-2">
        <NotificationDropdown />
        <SearchForm className="w-full sm:ml-auto sm:w-auto" />
      </div>
    </header>
  );
};

export default Navbar;
