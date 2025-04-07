import { authRouter } from "./router/auth";
import { orderRouter } from "./router/order";
import { userRouter } from "./router/user";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  order: orderRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
