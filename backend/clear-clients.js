const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearClients() {
  try {
    const result = await prisma.client.deleteMany({});
    console.log(`✅ ${result.count} clientes removidos com sucesso!`);
    console.log('Banco de dados limpo. Você pode cadastrar novos clientes agora.');
  } catch (error) {
    console.error('❌ Erro ao limpar clientes:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

clearClients();
