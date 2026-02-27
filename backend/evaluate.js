const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const stores = await prisma.store.findMany();
    console.log(JSON.stringify(stores, null, 2));
    process.exit(0);
}

run();
