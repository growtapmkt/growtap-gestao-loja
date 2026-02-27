
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDetailedClient() {
  const id = '5b825c01-977c-4132-a1e5-5d1b6ac96044'; // Tayla's ID from previous check
  try {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        sales: {
          orderBy: { createdAt: 'desc' }
        },
        conditionals: {
          include: {
            items: {
              include: { variation: { include: { product: true } } }
            }
          }
        }
      }
    });
    
    console.log('--- Detailed Client Object ---');
    console.log(JSON.stringify(client, null, 2));
    
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkDetailedClient();
