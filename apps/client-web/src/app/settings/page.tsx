"use client";

import Link from "next/link";

import { Button } from "@ebox/ui/button";
import { DropdownMenuSeparator } from "@ebox/ui/dropdown-menu";
import { Input } from "@ebox/ui/input";
import { Label } from "@ebox/ui/label";

export default function SettingsPage() {
  return (
    <div className="h-screen bg-[#F3F3F3] py-20">
      {/* <p className="text-2xl">Settings</p> */}
      <div className="mx-auto flex h-full w-full rounded-md border border-[#E4E4E7] bg-white md:w-8/12">
        <div className=" w-2.5/12 border-r border-[#E4E4E7] px-2 py-3">
          <div className="flex flex-col gap-y-3">
            <Button className="justify-start bg-[#E4EEF1] text-start text-[#00698F] shadow-none">
              <Link href="/settings">General</Link>
            </Button>

            <Button className="justify-start bg-white text-start  shadow-none">
              <Link href="/settings/notifications">Notifications</Link>
            </Button>

            <Button className="justify-start bg-white text-start  shadow-none">
              <Link href="/settings/authorized-pickups">
                Authorized pickups
              </Link>
            </Button>

            <Button className="justify-start bg-white text-start  shadow-none">
              <Link href="/">Billing</Link>
            </Button>

            <Button className="justify-start bg-white text-start  shadow-none">
              <Link href="/">Subscription</Link>
            </Button>

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
            <p>General</p>
            <p className="text-sm text-[#575959]">
              Update your account information
            </p>
          </div>

          <div className="flex flex-col gap-y-2 border-b border-[#E4E4E7] p-4">
            <div>
              <p>Personal information </p>
              <p className="text-sm text-[#575959]">Basic profile details</p>
            </div>

            <div className="flex gap-x-2 ">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label className="font-normal" htmlFor="text">
                  Name
                </Label>
                <Input type="text" id="text" placeholder="John doe" />
              </div>

              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label className="font-normal" htmlFor="tel">
                  Phone number
                </Label>
                <Input type="tel" id="tel" placeholder="+1 (732)-668-6908" />
              </div>
            </div>

            <div className="w-full items-center gap-1.5">
              <Label className="font-normal" htmlFor="tel">
                Phone number
              </Label>
              <Input type="tel" id="tel" placeholder="+1 (732)-668-6908" />
            </div>
          </div>

          <div className="flex flex-col gap-y-2 border-b border-[#E4E4E7] p-4">
            <p>Password </p>
            <p className="text-sm text-[#575959]">
              Modify your current password
            </p>

            <div className="w-full items-center gap-1.5">
              <Label className="font-normal" htmlFor="text">
                New Password
              </Label>
              <Input type="password" id="password" placeholder="********" />
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
