import { createServer } from './server.js'
import { connectPrisma, disconnectPrisma } from './lib/prisma.js'
import { connectKafka, disconnectKafka } from './lib/kafka.js';
import 'dotenv/config';

const server = createServer();
const port = Number(process.env.FASTIFY_PORT || 8000)
const host = process.env.FASTIFY_HOST || '0.0.0.0'

const start = async () => {
  try {
    // Connecting to the database and Kafka
    await connectPrisma();
    await connectKafka();
    
    // Starting the server
    await server.listen({ port, host });
    console.log(`Server is running on port ${port}`);
  } catch (err) {
    server.log.error(err);
    await disconnectPrisma();
    await disconnectKafka();
    process.exit(1);
  }
};

// Handling application shutdown
process.on('SIGINT', async () => {
  await server.close();
  await disconnectPrisma();
  await disconnectKafka();
  process.exit(0);
});

// Starting the server
start();