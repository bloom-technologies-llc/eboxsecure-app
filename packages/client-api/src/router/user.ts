import { randomBytes } from "crypto";

import { createTRPCRouter, protectedCustomerProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  createVirtualAddress: protectedCustomerProcedure.mutation(async ({ ctx }) => {
    let uniqueVirtualAddress = `CUST-${randomBytes(3).toString("hex").toUpperCase()}`;
    let isUnique = false;
    while (!isUnique) {
      const existingVirtualAddress = await ctx.db.customerAccount.findUnique({
        where: { virtualAddress: uniqueVirtualAddress },
      });
      if (!existingVirtualAddress) {
        isUnique = true;
      } else {
        uniqueVirtualAddress = `CUST-${randomBytes(3).toString("hex").toUpperCase()}`;
      }
    }
    await ctx.db.customerAccount.update({
      where: { id: ctx.session.userId },
      data: { virtualAddress: uniqueVirtualAddress },
    });
    return uniqueVirtualAddress;
  }),
  getVirtualAddress: protectedCustomerProcedure.query(async ({ ctx }) => {
    const customerAccount = await ctx.db.customerAccount.findUniqueOrThrow({
      where: { id: ctx.session.userId },
      select: { virtualAddress: true },
    });
    return customerAccount.virtualAddress;
  }),
});
