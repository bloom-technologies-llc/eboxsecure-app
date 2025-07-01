import { PrismaClient } from "@prisma/client";

export async function getPortraitUrl(db: PrismaClient, userId: string) {
  const customerAccount = await db.customerAccount.findUnique({
    where: {
      id: userId,
    },
    select: {
      photoLink: true,
    },
  });

  if (!customerAccount?.photoLink) {
    throw new Error("Portrait photo not found for this customer.");
  }

  return customerAccount.photoLink;
}
