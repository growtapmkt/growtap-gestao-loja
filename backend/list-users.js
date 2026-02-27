const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    
    console.log('=== USUÁRIOS NO BANCO ===');
    console.log(JSON.stringify(users, null, 2));
    console.log(`\nTotal: ${users.length} usuários`);
  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
