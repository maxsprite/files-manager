import { PrismaClient } from "../generated/prisma/client.js";

let prisma: PrismaClient;

export function getPrisma(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

export async function connectPrisma(): Promise<void> {
  const client = getPrisma();
  await client.$connect();
  console.log('Connected to database');
}

export async function disconnectPrisma(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    console.log('Disconnected from database');
  }
}
