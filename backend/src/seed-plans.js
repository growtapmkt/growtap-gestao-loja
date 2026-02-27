const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const plans = [
  {
    name: 'FREE',
    description: 'Plano gratuito básico',
    priceMonthly: 0,
    priceYearly: 0,
    features: {},
    limits: {
      maxProducts: 50,
      maxUsers: 2,
      maxSalesPerMonth: 50,
      advancedReports: false,
      apiAccess: false
    },
    stripePriceIdMonthly: null,
    stripePriceIdYearly: null
  },
  {
    name: 'PRO',
    description: 'Plano Profissional para lojas intermediárias',
    priceMonthly: 99.9,
    priceYearly: 999.0, // Exemplo de desconto
    features: {},
    limits: {
      maxProducts: 1000,
      maxUsers: 5,
      maxSalesPerMonth: null,
      advancedReports: true,
      apiAccess: true
    },
    stripePriceIdMonthly: 'price_XXXX_monthly_PRO', // Stub/placeholder
    stripePriceIdYearly: 'price_XXXX_yearly_PRO'    // Stub/placeholder
  },
  {
    name: 'PRO_PLUS',
    description: 'Plano Profissional Avançado sem limites',
    priceMonthly: 299.9,
    priceYearly: 2999.0,
    features: {},
    limits: {
      maxProducts: null, // null = sem limite
      maxUsers: null,    // null = sem limite
      maxSalesPerMonth: null,
      advancedReports: true,
      apiAccess: true
    },
    stripePriceIdMonthly: 'price_XXXX_monthly_PRO_PLUS',
    stripePriceIdYearly: 'price_XXXX_yearly_PRO_PLUS'
  }
];

async function main() {
  console.log('Starting seed/upsert of SaaS plans...');
  
  for (const planData of plans) {
    const upserted = await prisma.plan.upsert({
      where: { name: planData.name },
      update: {
        description: planData.description,
        priceMonthly: planData.priceMonthly,
        priceYearly: planData.priceYearly,
        features: planData.features,
        limits: planData.limits,
        stripePriceIdMonthly: planData.stripePriceIdMonthly,
        stripePriceIdYearly: planData.stripePriceIdYearly
      },
      create: planData
    });
    console.log(`Plan "${upserted.name}" upserted successfully.`);
  }
  
  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error seeding plans:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
