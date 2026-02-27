const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStore() {
  try {
    const storeId = 'cmm11o1ym0000v96sxp1iap4j';
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        subscriptions: {
          include: { plan: true }
        }
      }
    });

    if (!store) {
      console.log(`Loja não encontrada: ${storeId}`);
      return;
    }

    console.log('Loja encontrada:', store.name);
    console.log('Assinaturas:', JSON.stringify(store.subscriptions, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

checkStore();
