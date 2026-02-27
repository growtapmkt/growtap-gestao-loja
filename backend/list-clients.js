const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listClients() {
  try {
    const clients = await prisma.client.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        phone: true
      }
    });
    
    console.log('=== CLIENTES NO BANCO ===');
    console.log(JSON.stringify(clients, null, 2));
    console.log(`\nTotal: ${clients.length} clientes`);
  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listClients();
