import { type CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { getPrisma } from "./lib/prisma.js";
import { getS3Client } from "./lib/s3.js";
import { getKafkaProducer } from "./lib/kafka.js";

export function createContext({ req, res }: CreateFastifyContextOptions) {
  return {
    req,
    res,
    prisma: getPrisma(),
    s3: getS3Client(),
    kafka: getKafkaProducer(),
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
