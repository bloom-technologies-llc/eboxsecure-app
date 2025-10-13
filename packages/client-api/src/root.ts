import { authRouter } from "./router/auth";
import { favoritesRouter } from "./router/favorites";
import { meterRouter } from "./router/meter";
import { onboardingRouter } from "./router/onboarding";
import { orderRouter } from "./router/order";
import { subscriptionRouter } from "./router/subscription";
import { trustedContactsRouter } from "./router/trustedContacts";
import { userRouter } from "./router/user";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  order: orderRouter,
  onboarding: onboardingRouter,
  favorites: favoritesRouter,
  trustedContacts: trustedContactsRouter,
  subscription: subscriptionRouter,
  meter: meterRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
