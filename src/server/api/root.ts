import { postRouter } from "~/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { scoreRouter } from "~/server/api/routers/score";
import { gameRouter } from "./routers/game";
import { dogSubmissionRouter } from "./routers/dogSubmission";
import { pawsistenceRouter } from "./routers/pawsistence";
import { adminRouter } from "./routers/admin";
import { profileRouter } from "./routers/profile";
import { feedbackRouter } from "./routers/feedback";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  score: scoreRouter,
  game: gameRouter,
  dogSubmission: dogSubmissionRouter,
  pawsistence: pawsistenceRouter,
  admin: adminRouter,
  profile: profileRouter,
  feedback: feedbackRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
