import { router } from '../trpc.js';
import { filesRouter } from './files.js';

export const appRouter = router({
  files: filesRouter,
});

export type AppRouter = typeof appRouter;