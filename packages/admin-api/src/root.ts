import { analyticsRouter } from "./router/analytics";
import { authRouter } from "./router/auth";
import { notification } from "./router/notification";
import { orderComments } from "./router/order-comments";
import { ordersRouter } from "./router/orders";
import { userRouter } from "./router/user";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  orders: ordersRouter,
  user: userRouter,
  orderComments: orderComments,
  notification: notification,
  analytics: analyticsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
