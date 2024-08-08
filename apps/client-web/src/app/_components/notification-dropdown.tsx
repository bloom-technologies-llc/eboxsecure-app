import { Button } from "@ebox/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@ebox/ui/dropdown-menu";
import NotificationBell from "@ebox/ui/icons/notification-bell";

const NotificationDropdown = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <NotificationBell />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="flex gap-x-2 py-1">
          <DropdownMenuItem>Mark all as read</DropdownMenuItem>
        </div>
        <div className="w-full bg-[#E4E4E7] px-2 py-2">
          <p className="text-sm text-[#575959]">Today</p>
        </div>

        <div className="flex flex-col gap-y-3 bg-[#F6F9FB] px-2 py-4">
          <div className="flex justify-between">
            <span className="text-sm">Delivered on Aug 22, 2024</span>
            <span className="text-sm text-[#575959]">Today, 9:30 am</span>
          </div>

          <div className="flex gap-x-3">
            <div className="h-14 w-14 rounded-md bg-slate-300"></div>
            <div className="flex flex-col gap-y-2">
              <p className="text-sm text-[#575959]">
                Delivered to My Ebox Location 3
              </p>

              <div className="w-fit rounded-md border border-[#333333] px-3 py-1">
                <p className="text-sm text-[#333333]">QR code</p>
              </div>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        <div className="flex flex-col gap-y-3 bg-[#F6F9FB] px-2 py-4">
          <div className="flex justify-between">
            <span className="text-sm">Package has been shipped</span>
            <span className="text-sm text-[#575959]">Today, 11:25 am</span>
          </div>

          <div className="flex gap-x-3">
            <div className="h-14 w-14 rounded-md bg-slate-300"></div>
            <div className="flex flex-col gap-y-2">
              <p className="text-sm text-[#575959]">
                Delivered to My Ebox Location 3
              </p>

              <div className="w-fit rounded-md border border-[#333333] px-3 py-1">
                <p className="text-sm text-[#333333]">QR code</p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full bg-[#E4E4E7] px-2 py-2">
          <p className="text-sm text-[#575959]">Older notifications</p>
        </div>

        <div className="flex flex-col gap-y-3 px-2 py-4">
          <div className="flex justify-between">
            <span className="text-sm">Package has been shipped</span>
            <span className="text-sm text-[#575959]">Today, 11:25 am</span>
          </div>

          <div className="flex gap-x-3">
            <div className="h-14 w-14 rounded-md bg-slate-300"></div>
            <div className="flex flex-col gap-y-2">
              <p className="text-sm text-[#575959]">
                Delivered to My Ebox Location 3
              </p>

              <div className="w-fit rounded-md border border-[#333333] px-3 py-1">
                <p className="text-sm text-[#333333]">QR code</p>
              </div>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
