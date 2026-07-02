import pkgPrisma from '@prisma/client';
import pkgPg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const { PrismaClient } = pkgPrisma;
const { Pool } = pkgPg;

const prismaClientSingleton = () => {
  // Use connection pooling if DATABASE_URL is available, otherwise default to direct URL
  const connectionString = process.env.DATABASE_URL || process.env.DIRECT_DATABASE_URL || "postgresql://postgres:admin@localhost:5432/template1";
  
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaGlobal = prisma;
}
