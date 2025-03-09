import { SearchForm } from "./search-form";

const Navbar = () => {
  return (
    <header className="fixed top-0 z-50 flex h-[--header-height] w-full items-center bg-secondary px-6 py-4">
      <SearchForm className="w-full sm:ml-auto sm:w-auto" />
    </header>
  );
};

export default Navbar;
