import { authRouter } from "./auth-router";
import { clubRouter } from "./club-router";
import { profileRouter } from "./profile-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  club: clubRouter,
  profile: profileRouter,
});

export type AppRouter = typeof appRouter;
