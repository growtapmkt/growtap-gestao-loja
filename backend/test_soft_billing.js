const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function runTest() {
  try {
    const email = 'softbilling@teste.com';
    const storeName = 'Soft Billing Test Store';

    // 1. Create a Store
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // Extracted logic from authController
    const result = await prisma.$transaction(async (tx) => {
      let proPlusPlan = await tx.plan.findUnique({
        where: { name: 'PRO_PLUS' }
      });
      if (!proPlusPlan) throw new Error("PRO_PLUS not seeded");

      const store = await tx.store.create({ data: { name: storeName } });

      const startedAt = new Date();
      const endsAt = new Date();
      endsAt.setDate(endsAt.getDate() + 30);

      const subscription = await tx.storeSubscription.create({
        data: {
          storeId: store.id,
          planId: proPlusPlan.id,
          status: 'TRIAL',
          startedAt,
          endsAt,
          autoRenew: false,
          paymentProvider: null
        }
      });

      const user = await tx.user.create({
        data: {
          name: 'Test Setup User',
          email,
          password: hashedPassword,
          role: 'OWNER',
          storeId: store.id
        }
      });

      return { store, user, subscription };
    });

    console.log('Store Created:', result.store.name);
    console.log('Subscription Status:', result.subscription.status);
    console.log('Subscription EndsAt:', result.subscription.endsAt);

    // 2. Test featureGuard simulation (calling it directly)
    const { requireFeature } = require('./src/utils/featureGuard');
    
    // Mock Request
    const req = {
      storeId: result.store.id,
      originalUrl: '/api/some/premium/feature',
      method: 'GET',
      plan: {
        limits: {
          someNonExistentFeature: false 
        }
      },
      features: {}
    };

    let headerSet = false;
    const res = {
      setHeader: (key, val) => {
        if (key === 'X-Plan-Limit-Reached' && val === 'true') {
          headerSet = true;
        }
      },
      status: (code) => ({
        json: (data) => console.log('Response:', code, data)
      })
    };

    let nextCalled = false;
    const next = () => { nextCalled = true; };

    // Executando requireFeature ('someNonExistentFeature') em modo SOFT
    const middleware = requireFeature('someNonExistentFeature');
    await middleware(req, res, next);

    console.log('Next Called in Soft Mode:', nextCalled);
    console.log('Header Set in Soft Mode:', headerSet);

    const usages = await prisma.featureUsage.findMany({
      where: { storeId: result.store.id }
    });

    console.log('FeatureUsage Entries Created:', usages.length);
    if (usages.length > 0) {
      console.log('Usage metadata:', usages[0].metadata);
    }

    // Cleanup
    await prisma.featureUsage.deleteMany({ where: { storeId: result.store.id } });
    await prisma.user.delete({ where: { email } });
    await prisma.storeSubscription.delete({ where: { id: result.subscription.id } });
    await prisma.store.delete({ where: { id: result.store.id } });
    console.log('Cleanup Success.');

  } catch (error) {
    console.error('Test Failed', error);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();
