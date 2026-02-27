const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixSubscriptions() {
  try {
    // 1. Ensure we have at least one plan
    let plan = await prisma.plan.findFirst();
    if (!plan) {
      console.log('Criando plano padrão...');
      plan = await prisma.plan.create({
        data: {
          name: 'PRO_PLUS',
          description: 'Plano Pro Plus (Dev)',
          priceMonthly: 0,
          priceYearly: 0,
          features: {},
          limits: {
            maxProducts: 9999,
            maxUsers: 999,
            maxSalesPerMonth: 9999,
            advancedReports: true,
            apiAccess: true
          }
        }
      });
    }

    // 2. Find all stores
    const stores = await prisma.store.findMany({
      include: {
        subscriptions: true
      }
    });

    for (const store of stores) {
      if (store.subscriptions.length === 0) {
        console.log(`Loja ${store.id} (${store.name}) não possui assinatura. Criando...`);
        await prisma.storeSubscription.create({
          data: {
            storeId: store.id,
            planId: plan.id,
            status: 'ACTIVE',
            startedAt: new Date(),
            endsAt: null,
            autoRenew: true
          }
        });
        console.log(`✅ Assinatura criada para a loja ${store.name}`);
      } else {
        console.log(`Loja ${store.id} (${store.name}) já possui assinatura.`);
      }
    }

    console.log('✅ Verificação / Correção de assinaturas concluída!');
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixSubscriptions();
