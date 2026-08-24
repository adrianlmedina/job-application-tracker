import { PrismaClient } from '@prisma/client';


// hot-reload the server on every file change
const globalForPrisma = global as unknown as { prisma: PrismaClient };


// uses existing global instance if it exists, if not it will create a new one
// guarantees only having one database connection open
export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['query', 'error', 'warn'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}