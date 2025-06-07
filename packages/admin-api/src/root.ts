import { analyticsRouter } from "./router/analytics";
import { authRouter } from "./router/auth";
import { carriersRouter } from "./router/carriers";
import { customersRouter } from "./router/customers";
import { employeeCommentsRouter } from "./router/employee-comments";
import { employeesRouter } from "./router/employees";
import { locationsRouter } from "./router/locations";
import { notification } from "./router/notification";
import { orderComments } from "./router/order-comments";
import { ordersRouter } from "./router/orders";
import { userRouter } from "./router/user";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  orders: ordersRouter,
  customers: customersRouter,
  locations: locationsRouter,
  carriers: carriersRouter,
  employees: employeesRouter,
  user: userRouter,
  orderComments: orderComments,
  employeeComments: employeeCommentsRouter,
  notification: notification,
  analytics: analyticsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
