
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function check() {
  try {
    const count = await prisma.client.count();
    console.log('COUNT:' + count);
    const clients = await prisma.client.findMany({ select: { email: true, cpf: true } });
    console.log('CLIENTS:' + JSON.stringify(clients));
  } catch (e) {
    console.error('ERROR:' + e.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
