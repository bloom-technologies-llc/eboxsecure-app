import { authRouter } from "./router/auth";
import { favoritesRouter } from "./router/favorites";
import { onboardingRouter } from "./router/onboarding";
import { orderRouter } from "./router/order";
import { trustedContactsRouter } from "./router/trustedContacts";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  order: orderRouter,
  onboarding: onboardingRouter,
  favorites: favoritesRouter,
  trustedContacts: trustedContactsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
