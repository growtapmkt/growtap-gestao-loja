
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSales() {
  try {
    const clients = await prisma.client.findMany({
      include: {
        sales: true
      }
    });
    
    console.log('--- Clients and their Sales ---');
    clients.forEach(c => {
      console.log(`Client: ${c.name} (${c.id})`);
      console.log(`Sales Count: ${c.sales.length}`);
      c.sales.forEach(s => {
        console.log(`  - Sale: ${s.id} Total: ${s.total}`);
      });
    });
    
    const orphanSales = await prisma.sale.findMany({
      where: { clientId: null }
    });
    console.log(`\nOrphan Sales (no clientId): ${orphanSales.length}`);
    
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkSales();
