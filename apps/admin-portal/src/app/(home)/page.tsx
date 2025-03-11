"use client";

import { api } from "~/trpc/react";
import PackageTrackingTable from "../_components/package-tracking-table";

export default function HomePage() {
  // const { mutate: decryptToken, data } =
  //   api.auth.authenticateAuthorizedPickupToken.useMutation();
  return (
    <main className=" container h-screen w-full py-16 md:w-9/12">
      <div className="flex flex-col items-center justify-center">
        <div className="w-full">
          <p className="my-4 font-medium">Orders</p>
          {/* <label>Enter pickup token</label>
          <input
            className="w-full rounded-md border border-gray-300 p-2"
            type="text"
            onChange={(e) => decryptToken({ pickupToken: e.target.value })}
          />
          {data && !data.authorized && <p>Not authorized</p>}
          {data && data.authorized && (
            <img src={data.url} alt="Portrait" className="rounded-md" />
          )} */}
          <PackageTrackingTable />
          {/* <Mutation pickupToken={token} /> */}
        </div>
      </div>
    </main>
  );
}
