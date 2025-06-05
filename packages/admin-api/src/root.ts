import { authRouter } from "./router/auth";
import { customerUserRouter } from "./router/customer-user";
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
  customerUser: customerUserRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
