const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Starting backfill...");

  // 1. Find or Create Default Store
  let defaultStore = await prisma.store.findFirst({
    where: { name: "GrowTap Loja Principal" },
  });

  if (!defaultStore) {
    console.log("Creating default store...");
    defaultStore = await prisma.store.create({
      data: {
        name: "GrowTap Loja Principal",
      },
    });
    console.log(`Default store created with ID: ${defaultStore.id}`);
  } else {
    console.log(`Using existing default store ID: ${defaultStore.id}`);
  }

  const storeId = defaultStore.id;

  // 2. Update Users
  const usersUpdated = await prisma.user.updateMany({
    where: { storeId: null },
    data: { storeId },
  });
  console.log(`Updated ${usersUpdated.count} users.`);

  // 3. Update Products
  const productsUpdated = await prisma.product.updateMany({
    where: { storeId: null },
    data: { storeId },
  });
  console.log(`Updated ${productsUpdated.count} products.`);

  // 4. Update Categories
  const categoriesUpdated = await prisma.category.updateMany({
    where: { storeId: null },
    data: { storeId },
  });
  console.log(`Updated ${categoriesUpdated.count} categories.`);

  // 5. Update Brands
  const brandsUpdated = await prisma.brand.updateMany({
    where: { storeId: null },
    data: { storeId },
  });
  console.log(`Updated ${brandsUpdated.count} brands.`);

  // 6. Update Clients
  const clientsUpdated = await prisma.client.updateMany({
    where: { storeId: null },
    data: { storeId },
  });
  console.log(`Updated ${clientsUpdated.count} clients.`);

  // 7. Update Sales
  const salesUpdated = await prisma.sale.updateMany({
    where: { storeId: null },
    data: { storeId },
  });
  console.log(`Updated ${salesUpdated.count} sales.`);

  // 8. Update Transactions
  const transactionsUpdated = await prisma.transaction.updateMany({
    where: { storeId: null },
    data: { storeId },
  });
  console.log(`Updated ${transactionsUpdated.count} transactions.`);

  // 9. Update Conditionals
  const conditionalsUpdated = await prisma.conditional.updateMany({
    where: { storeId: null },
    data: { storeId },
  });
  console.log(`Updated ${conditionalsUpdated.count} conditionals.`);

  // 10. Update Characteristics
  const characteristicsUpdated = await prisma.characteristic.updateMany({
    where: { storeId: null },
    data: { storeId },
  });
  console.log(`Updated ${characteristicsUpdated.count} characteristics.`);
  
  console.log("Backfill completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
