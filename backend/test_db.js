const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sales = await prisma.sale.findMany({ take: 1 });
  console.log(JSON.stringify(sales));
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
