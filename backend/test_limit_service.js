const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const limitService = require('./src/services/LimitService');

async function runTest() {
  try {
    const storeName = 'Sales Limit Test Store';

    // 1. Create a Store
    const store = await prisma.store.create({ data: { name: storeName } });

    console.log('Test Store Created:', store.id);

    // 2. Criar 50 vendas falsas com datas no mês atual para essa loja
    console.log('Seeding 50 sales for the current month...');
    const salesData = Array.from({ length: 50 }).map(() => ({
      storeId: store.id,
      total: 100,
      userId: 'test-user', // Mock user id
      paymentMethod: 'CASH',
      deliveryMethod: 'PICKUP'
    }));

    // Criar seller fake só pra não estourar FK
    const seller = await prisma.user.create({
      data: {
        id: 'test-user',
        name: 'Test Seller',
        email: 'seller@test.com',
        password: 'fake',
        role: 'OWNER',
        storeId: store.id
      }
    });

    await prisma.sale.createMany({ data: salesData });
    console.log('50 sales seeded.');

    // 3. Test LimitService check for FREE plan limits (simulate maxSalesPerMonth = 50)
    console.log('Checking LimitService...');
    const limitCheck = await limitService.checkMonthlySalesLimit(store.id, 50);

    console.log('Result from LimitService:', limitCheck);

    if (limitCheck.currentCount === 50 && limitCheck.allowed === false) {
       console.log('✅ LimitService handled count and limit correctly.');
    } else {
       console.error('❌ LimitService failed to enforce limits.');
    }

    // Cleanup
    await prisma.sale.deleteMany({ where: { storeId: store.id } });
    await prisma.user.delete({ where: { id: seller.id } });
    await prisma.store.delete({ where: { id: store.id } });
    console.log('Cleanup Success.');

  } catch (error) {
    console.error('Test Failed', error);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();
