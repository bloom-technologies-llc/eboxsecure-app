"use client";

import Link from "next/link";

import { Button } from "@ebox/ui/button";
import { DropdownMenuSeparator } from "@ebox/ui/dropdown-menu";
import { Input } from "@ebox/ui/input";
import { Label } from "@ebox/ui/label";
import { Switch } from "@ebox/ui/switch";

export default function SettingsPage() {
  return (
    <div className="h-screen bg-[#F3F3F3] pb-28 pt-20">
      {/* <p className="text-2xl">Settings</p> */}
      <div className="mx-auto flex h-full w-full rounded-md border border-[#E4E4E7] bg-white md:w-8/12">
        <div className=" w-2.5/12 border-r border-[#E4E4E7] px-2 py-3">
          <div className="flex flex-col gap-y-3">
            <Link href="/settings">
              <Button className="w-full justify-start bg-white text-start  shadow-none">
                General
              </Button>
            </Link>

            <Link href="/settings/notifications">
              <Button className="w-full justify-start bg-[#E4EEF1] text-start text-[#00698F] shadow-none">
                Notifications
              </Button>
            </Link>

            <Link href="/settings/authorized-pickups">
              <Button className="w-full justify-start bg-white text-start  shadow-none">
                Authorized pickups
              </Button>
            </Link>

            <Link href="/settings/billing">
              <Button className="w-full justify-start bg-white text-start  shadow-none">
                Billing
              </Button>
            </Link>

            <Link href="/">
              <Button className="w-full justify-start bg-white text-start  shadow-none">
                Subscription
              </Button>
            </Link>

            <DropdownMenuSeparator />

            <Button className="justify-start bg-white text-start  shadow-none">
              <Link className="text-[#8F0000]" href="/">
                Delete my account
              </Link>
            </Button>
          </div>
        </div>
        <div className="w-full flex-col">
          <div className="border-b border-[#E4E4E7] p-4">
            <p>Notification</p>
            <p className="text-sm text-[#575959]">
              Tweak when you receive push notifications
            </p>
          </div>

          <div className="flex flex-col gap-y-2 border-b border-[#E4E4E7] p-4">
            <div>
              <p>Personal information </p>
            </div>

            <div className="flex items-center justify-between gap-x-2 ">
              <p className="text-sm text-[#575959]">
                If you’re looking to get a ping from desktop notifying you of
                recent updates
              </p>

              <Switch id="airplane-mode" />
            </div>
          </div>

          <div className="flex flex-col gap-y-2 border-b border-[#E4E4E7] p-4">
            <div>
              <p>Enable unread message badge</p>
            </div>

            <div className="flex items-center justify-between gap-x-2 ">
              <p className="text-sm text-[#575959]">
                Show a red badge on the bell icon when you have unread messages
              </p>

              <Switch checked={true} id="airplane-mode" />
            </div>
          </div>

          <div className="flex flex-col gap-y-2 border-b border-[#E4E4E7] p-4">
            <div>
              <p>Enable Email notifications</p>
            </div>

            <div className="flex items-center justify-between gap-x-2 ">
              <p className="text-sm text-[#575959]">
                Receive notifications in your emails for updates
              </p>

              <Switch checked={true} id="airplane-mode" />
            </div>
          </div>

          <div className="flex flex-col gap-y-2 p-4 pb-20">
            <p>Account email </p>
            <p className="text-sm text-[#575959]">Modify your current email</p>

            <div className="w-full items-center gap-1.5">
              <Label className="font-normal" htmlFor="text">
                New Password
              </Label>
              <Input type="password" id="password" placeholder="********" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
