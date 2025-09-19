// // route that grabs all clerk users and returns
// import { NextResponse } from "next/server";
// import { clerkClient } from "@clerk/nextjs/server";

// import { db } from "@ebox/db";

// export async function GET(req: Request) {
//   const clerk = await clerkClient();
//   const users = await clerk.users.getUserList();
//   let created = 0;
//   for (const user of users.data) {
//     const stripeCustomerId = user.privateMetadata.stripeCustomerId as string;
//     if (stripeCustomerId) {
//       const customerAccount = await db.customerAccount.findUniqueOrThrow({
//         where: {
//           id: user.id,
//         },
//       });
//       if (!customerAccount.stripeCustomerId) {
//         await db.customerAccount.update({
//           where: {
//             id: user.id,
//           },
//           data: {
//             stripeCustomerId: stripeCustomerId,
//           },
//         });
//         console.log(`Updated stripeCustomerId for user ${user.id}`);
//         created++;
//       } else {
//         console.log(`StripeCustomerId already exists for user ${user.id}`);
//       }
//     }
//   }
//   return NextResponse.json({ created });
// }
