import Fastify from 'fastify';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { createContext } from './context.js';
import { appRouter } from './routers/index.js';
import cors from '@fastify/cors';
import { SchedulerService } from './services/scheduler-service.js';
import { cleanupS3OrphanedFilesJob, CLEANUP_S3_SCHEDULE } from './jobs/cleanup-s3-job.js';


export function createServer() {
  const fastify = Fastify({
    logger: process.env.FASTIFY_LOGGER === 'true',
    bodyLimit: 10 * 1024 * 1024 // 10MB
  });

  // Initialize the scheduler service
  const schedulerService = new SchedulerService();
  
  // Register tasks in the scheduler
  schedulerService.registerJob('s3-cleanup', CLEANUP_S3_SCHEDULE, cleanupS3OrphanedFilesJob);

  // Add the scheduler to the fastify instance for access from plugins and hooks
  fastify.decorate('scheduler', schedulerService);

  fastify.register(cors, {
    origin: (origin, cb) => {
      const hostname = origin ? new URL(origin).hostname : '';
      if(hostname === "localhost"){
        // Request from localhost will pass
        cb(null, true)
        return
      }
      // Generate an error on other origins, disabling access
      cb(new Error("Not allowed"), false)
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  });

  fastify.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: appRouter,
      createContext,
      onError({ path, error }: { path: string | undefined; error: Error }) {
        console.error(`Error in tRPC handler on path '${path ?? 'unknown'}':`, error);
      },
    },
  });

  // Add hook to start the scheduler when the server starts
  fastify.addHook('onReady', async () => {
    schedulerService.startAllJobs();
  });

  // Add hook to stop the scheduler when the server stops
  fastify.addHook('onClose', async () => {
    schedulerService.stopAllJobs();
  });

  return fastify;
}