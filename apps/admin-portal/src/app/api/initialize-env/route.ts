import { NextRequest } from "next/server";

import { db } from "@ebox/db";

const admins = [
  //   {
  //     id: "user_2nnavZjGibckV37moOoIwOBKOir",
  //     email: "thadtayo@gmail.com",
  //   },
  //   {
  //     id: "user_2nw9xlG4dSnFFa1ZSIbjpdDPyyZ",
  //     email: "jack.m.zhang1@gmail.com",
  //   },
  //   {
  //     id: "user_2nwA0T8y0BqWl84wnr844HfakUF",
  //     email: "zbscott.zs@gmail.com",
  //   },
  //   {
  //     id: "user_2u64FG09tGNJsiEfIQ9MLFfsynh",
  //     email: "alan@bloomtechnologies.co",
  //   },
  //   {
  //     id: "user_2uEmeBcW1k5bMiBHp4IvE0UEysf",
  //     email: "cs.christianscott@gmail.com",
  //   },
  //   {
  //     id: "user_2yxoVitRRhETymhieTSoxUxxz3Z",
  //     email: "ahmed@bloomtechnologies.co",
  //   },
  {
    id: "user_2yekoFjaLP3pBlX5RxWsE0wdxYX",
    email: "employee+clerk@example.com",
  },
];

const handler = async (req: NextRequest) => {
  //   for (const admin of admins) {
  //     await db.user.create({
  //       data: {
  //         id: admin.id,
  //         userType: "EMPLOYEE",
  //         employeeAccount: {
  //           create: {
  //             employeeRole: "MANAGER",
  //             locationId: 1,
  //           },
  //         },
  //       },
  //     });
  //   }

  return new Response("Done", { status: 200 });
};

export { handler as GET };
