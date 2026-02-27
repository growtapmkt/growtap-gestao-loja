const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, name: true, storeId: true } });
  console.log('Users:', users);
  
  const stores = await prisma.store.findMany();
  console.log('Stores:', stores);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
